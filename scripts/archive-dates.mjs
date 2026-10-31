#!/usr/bin/env node
/**
 * One-off research helper: suggest publication dates for undated articles
 * from the Internet Archive.
 *
 * Usage:
 *   node scripts/archive-dates.mjs [options]
 *
 * Options:
 *   --root <dir>    source directory (default: public)
 *   --json <file>   also write the results as JSON
 *   --limit <n>     only inspect the first n undated articles
 *   --delay <ms>    pause between archive requests (default: 1200)
 *
 * This is not part of the build or the test suite: it talks to the Wayback
 * Machine, which is rate limited and occasionally offline. It only reports
 * candidates; it never edits public/.
 *
 * The preferred signal is the publication date embedded in the archived
 * page itself (article:published_time, datePublished, <time datetime>).
 * The first capture timestamp is only an upper bound, so it is reported
 * with a lower confidence when nothing better is available.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { analyze, isValidDate } from "./catalog.mjs";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const CDX_ENDPOINT = "https://web.archive.org/cdx/search/cdx";
const SNAPSHOT_ENDPOINT = "https://web.archive.org/web";
const USER_AGENT = "blog-archive-dates/1.0 (+https://sethlakowske.com; metadata research)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseArgs(argv) {
  const valueAfter = (name, fallback) => {
    const index = argv.indexOf(name);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  return {
    root: valueAfter("--root", "public"),
    json: valueAfter("--json", null),
    limit: Number(valueAfter("--limit", "0")),
    delay: Number(valueAfter("--delay", "1200")),
  };
}

async function fetchText(url, { retries = 4, baseDelay = 1000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      const text = await response.text();
      if (response.ok && !/Internet Archive: Temporarily Offline/i.test(text)) {
        return text;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < retries) {
      await sleep(baseDelay * attempt);
    }
  }
  throw lastError;
}

/**
 * Earliest 200 capture of a path. Tries with and without the trailing
 * slash, because older captures use both forms.
 */
async function firstCapture(host, urlPath) {
  const candidates = [urlPath, urlPath.replace(/\/$/, "")];
  for (const candidate of candidates) {
    const params = new URLSearchParams({
      url: `${host}${candidate}`,
      output: "json",
      fl: "timestamp,original",
      filter: "statuscode:200",
      limit: "1",
    });
    const body = await fetchText(`${CDX_ENDPOINT}?${params}`);
    const rows = JSON.parse(body);
    if (rows.length > 1) {
      return { timestamp: rows[1][0], original: rows[1][1] };
    }
  }
  return null;
}

export function extractPublishedDate(html) {
  // The old site emitted Shareaholic's name="shareaholic:article_published_time"
  // as well as the more common property="article:published_time".
  const patterns = [
    /(?:article[:_]published[:_]time|published_time|datePublished)["']?[^>]*?content\s*=\s*["']([^"']+)/i,
    /content\s*=\s*["']([^"']+)["'][^>]*?(?:article[:_]published[:_]time|published_time|datePublished)/i,
    /<time[^>]*\bdatetime\s*=\s*["']([^"']+)/i,
  ];
  for (const pattern of patterns) {
    const value = html.match(pattern)?.[1];
    if (value) {
      const date = value.slice(0, 10);
      if (isValidDate(date)) {
        return date;
      }
    }
  }
  return null;
}

export function formatTimestamp(timestamp) {
  return `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = path.resolve(REPO_ROOT, args.root);
  const site = JSON.parse(await readFile(path.join(REPO_ROOT, "site.json"), "utf8"));
  const host = new URL(site.baseUrl).host;

  const { entries, errors } = await analyze(root, site);
  if (errors.length > 0) {
    console.error(`Skipping ${errors.length} invalid page(s); run the catalog check for details.`);
  }

  let unknown = entries.filter((entry) => entry.dateStatus === "unknown");
  if (args.limit > 0) {
    unknown = unknown.slice(0, args.limit);
  }
  if (unknown.length === 0) {
    console.log("No undated articles found.");
    return;
  }

  const results = [];
  for (const entry of unknown) {
    try {
      const capture = await firstCapture(host, entry.url);
      if (!capture) {
        results.push({
          id: entry.id,
          url: entry.url,
          date: null,
          dateSource: "none",
          confidence: "unresolved",
          firstCapture: null,
          snapshot: null,
        });
        console.log(`${entry.id}: no archived capture`);
        continue;
      }

      const html = await fetchText(`${SNAPSHOT_ENDPOINT}/${capture.timestamp}id_/${capture.original}`);
      const embedded = extractPublishedDate(html);
      const firstCaptureDate = formatTimestamp(capture.timestamp);
      results.push({
        id: entry.id,
        url: entry.url,
        date: embedded ?? firstCaptureDate,
        dateSource: embedded ? "archived-page" : "first-capture",
        confidence: embedded ? "high" : "upper-bound",
        firstCapture: firstCaptureDate,
        snapshot: `${SNAPSHOT_ENDPOINT}/${capture.timestamp}/${capture.original}`,
      });
      console.log(
        `${entry.id}: ${embedded ?? `${firstCaptureDate} (upper bound)`} [${embedded ? "archived-page" : "first-capture"}]`,
      );
      await sleep(args.delay);
    } catch (error) {
      results.push({
        id: entry.id,
        url: entry.url,
        date: null,
        dateSource: "error",
        confidence: "unresolved",
        firstCapture: null,
        snapshot: null,
      });
      console.error(`${entry.id}: ${error.message}`);
    }
  }

  if (args.json) {
    const outFile = path.resolve(REPO_ROOT, args.json);
    await writeFile(outFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`);
    console.log(`\nWrote ${path.relative(REPO_ROOT, outFile)}`);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(`archive-dates: ${error.message}`);
    process.exitCode = 1;
  });
}
