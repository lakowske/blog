#!/usr/bin/env node
/**
 * Zero-dependency validator for the generated site.
 *
 * Usage:
 *   node scripts/check.mjs [dir] [--strict]
 *
 * Errors:
 *   - broken internal links or asset references
 *   - duplicate id attributes
 *   - missing or empty <title>
 *
 * Warnings (errors with --strict):
 *   - missing publish date
 *   - missing byline
 *   - missing related placeholder
 *   - missing meta description
 *   - missing canonical link
 *   - a page that does not have exactly one <h1>
 *   - a <time> without a valid datetime
 *
 * Phase 0 keeps legacy issues as warnings so CI can pass while the site is
 * normalized. Phase 2 should run with --strict.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const rootArg = args.find((arg) => !arg.startsWith("--")) ?? "dump";
const root = path.resolve(rootArg);

// Temporary allowlist for the two known-broken WebGL references. Remove in
// Phase 2 when the page is normalized.
const KNOWN_BROKEN = new Set([
  "articles/webgl-using-gl-mat4-browserify-shader-and-browserify/index.html|../webgl-using-gl-mat4-browserify-shader-and-browserify/node_modules/prismjs-package/prism.css",
  "articles/webgl-using-gl-mat4-browserify-shader-and-browserify/index.html|3dify/bundle.js",
]);

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripUrl(value) {
  return decodeEntities(value).split("#")[0].split("?")[0].trim();
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function resolveTarget(pageFile, url) {
  const clean = stripUrl(url);
  if (!clean || EXTERNAL.test(clean)) {
    return null;
  }

  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    // Keep the raw value if it is not valid percent-encoding.
  }

  if (decoded.startsWith("/")) {
    return path.join(root, decoded);
  }
  return path.resolve(path.dirname(pageFile), decoded);
}

async function targetExists(target) {
  try {
    const info = await stat(target);
    if (info.isFile()) {
      return true;
    }
    if (info.isDirectory()) {
      // A directory URL such as /about/ is served by its index.html.
      return await exists(path.join(target, "index.html"));
    }
  } catch {
    // Fall through to false.
  }
  return false;
}

function attrs(html, name) {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi");
  const values = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    values.push(match[2] ?? match[3] ?? "");
  }
  return values;
}

function countMatches(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

function summarize(label, pages) {
  if (pages.length === 0) {
    return;
  }
  console.log(`WARN ${label} (${pages.length})`);
  for (const page of pages) {
    console.log(`  ${page}`);
  }
}

let files;
try {
  files = await walk(root);
} catch (error) {
  console.error(`Cannot read ${root}: ${error.message}`);
  process.exit(1);
}
const errors = [];
const warnings = {
  date: [],
  byline: [],
  related: [],
  description: [],
  canonical: [],
  heading: [],
  timeFormat: [],
};

for (const file of files) {
  const rel = path.relative(root, file).split(path.sep).join("/");
  const html = await readFile(file, "utf8");

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title || title[1].trim() === "") {
    errors.push(`${rel}: missing or empty <title>`);
  }

  const ids = attrs(html, "id");
  const seen = new Set();
  const duplicates = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  for (const id of duplicates) {
    errors.push(`${rel}: duplicate id "${id}"`);
  }

  for (const value of [...attrs(html, "href"), ...attrs(html, "src")]) {
    const key = `${rel}|${value}`;
    if (KNOWN_BROKEN.has(key)) {
      continue;
    }
    const target = await resolveTarget(file, value);
    if (target && !(await targetExists(target))) {
      errors.push(`${rel}: broken reference "${value}"`);
    }
  }

  if (!/<time\b/i.test(html)) {
    warnings.date.push(rel);
  } else {
    const timeTags = html.match(/<time\b[^>]*>/gi) ?? [];
    const bad = timeTags.some((tag) => {
      const value = tag.match(/\bdatetime\s*=\s*["']([^"']+)["']/i)?.[1];
      return !value || !/^\d{4}-\d{2}-\d{2}$/.test(value);
    });
    if (bad) {
      warnings.timeFormat.push(rel);
    }
  }

  if (!/Posted by/i.test(html)) {
    warnings.byline.push(rel);
  }
  if (!/id\s*=\s*["']related["']/i.test(html)) {
    warnings.related.push(rel);
  }
  if (!/<meta\b[^>]*name\s*=\s*["']description["']/i.test(html)) {
    warnings.description.push(rel);
  }
  if (!/<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(html)) {
    warnings.canonical.push(rel);
  }

  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) {
    warnings.heading.push(`${rel} (${h1Count})`);
  }
}

console.log(`Checked ${files.length} HTML files in ${path.relative(process.cwd(), root) || "."}`);

if (errors.length > 0) {
  console.log(`\nERRORS (${errors.length})`);
  for (const error of errors) {
    console.log(`  ${error}`);
  }
}

summarize("missing publish date", warnings.date);
summarize("missing byline", warnings.byline);
summarize("missing related placeholder", warnings.related);
summarize("missing meta description", warnings.description);
summarize("missing canonical link", warnings.canonical);
summarize("heading count is not exactly 1", warnings.heading);
summarize("<time> without a valid datetime", warnings.timeFormat);

const warningCount = Object.values(warnings).reduce((sum, list) => sum + list.length, 0);
console.log(`\n${errors.length} error(s), ${warningCount} warning(s)`);

if (errors.length > 0 || (strict && warningCount > 0)) {
  process.exitCode = 1;
}
