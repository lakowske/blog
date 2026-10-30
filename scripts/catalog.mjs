#!/usr/bin/env node
/**
 * Metadata validator and catalog generator.
 *
 * Usage:
 *   node scripts/catalog.mjs [options]
 *
 * Options:
 *   --check          validate only; do not write files
 *   --out <file>     write the catalog to <file> (and a _headers file)
 *   --clean          remove the output directory before writing
 *   --report         print the per-page metadata and summary report
 *   --strict         treat warnings as errors
 *   --root <dir>     source directory (default: public)
 *
 * Metadata lives in an HTML comment as the first child of <body>:
 *
 *   <!--meta
 *   {
 *     "title": "Why Learn Haskell?",
 *     "type": "article",
 *     "date": "2016-04-25",
 *     "tags": ["haskell", "learning"]
 *   }
 *   -->
 *
 * Date states:
 *   - date present: dated
 *   - date: null, evergreen: true: intentionally evergreen
 *   - date: null, evergreen: false/omitted: time-bound, date unknown
 */

import { createHash } from "node:crypto";
import { readdir, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const ALLOWED_FIELDS = new Set([
  "title",
  "type",
  "date",
  "evergreen",
  "tags",
  "summary",
  "updated",
  "draft",
  "heading",
  "layout",
  "bodyClass",
  "showHeader",
  "showRelated",
  "triangles",
  "related",
  "scripts",
  "styles",
]);

const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

const INLINE_TAGS = /<\/?(?:a|abbr|b|code|em|i|strong|span|time|small|sub|sup)\b[^>]*>/gi;

const WARNING_LABELS = {
  unknownDate: "time-bound article with an unknown date",
  missingTags: "article without tags",
  unknownTag: "unknown tag",
  duplicateTag: "duplicate tag",
  titleMismatch: "metadata title does not match <title>",
  dateMismatch: "metadata date does not match <time>",
  missingVisibleDate: "metadata date has no visible <time>",
  unexpectedVisibleDate: "page has a <time> but no metadata date",
  unknownField: "unknown metadata field",
  longSummary: "summary longer than 300 characters",
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const valueAfter = (name, fallback) => {
    const index = argv.indexOf(name);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };

  return {
    check: argv.includes("--check"),
    clean: argv.includes("--clean"),
    report: argv.includes("--report"),
    strict: argv.includes("--strict"),
    out: valueAfter("--out", null),
    root: valueAfter("--root", "public"),
  };
}

export function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

export function stripTags(value) {
  return decodeEntities(value.replace(INLINE_TAGS, "").replace(/<[^>]*>/g, " "));
}

export function normalizeText(value) {
  return collapseWhitespace(stripTags(value)).replace(/\s+([.,;:!?])/g, "$1");
}

export function extractMetadata(html) {
  const bodyMatch = html.match(/<body[^>]*>\s*(<!--\s*meta\s*([\s\S]*?)-->)/i);
  const topMatch = html.match(/^\s*(<!--\s*meta\s*([\s\S]*?)-->)/i);
  const match = bodyMatch ?? topMatch;

  if (!match) {
    return { comment: null, text: null };
  }
  return { comment: match[1], text: match[2] };
}

export function stripMetadataComment(html) {
  return html.replace(/<!--\s*meta[\s\S]*?-->/i, "");
}

export function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? collapseWhitespace(decodeEntities(match[1])) : "";
}

export function extractTimeValues(html) {
  const values = [];
  const pattern = /<time\b([^>]*)>([\s\S]*?)<\/time>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const datetime = match[1].match(/\bdatetime\s*=\s*["']([^"']+)["']/i)?.[1];
    const value = datetime ?? collapseWhitespace(stripTags(match[2]));
    if (value) {
      values.push(value);
    }
  }
  return values;
}

export function datePrecision(date) {
  if (typeof date !== "string") {
    return null;
  }
  if (date.length === 4) {
    return "year";
  }
  if (date.length === 7) {
    return "month";
  }
  if (date.length === 10) {
    return "day";
  }
  return null;
}

export function isValidDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (month !== undefined && (month < 1 || month > 12)) {
    return false;
  }
  if (day !== undefined) {
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }
  return true;
}

export function deriveId(relPath) {
  if (relPath === "index.html") {
    return "index";
  }
  return relPath.replace(/\/index\.html$/, "").replace(/\.html$/, "");
}

export function deriveUrl(id) {
  return id === "index" ? "/" : `/${id}/`;
}

export function deriveSection(id) {
  if (id === "index" || id === "about" || id === "resume") {
    return "pages";
  }
  const first = id.split("/")[0];
  return ["articles", "software", "technology"].includes(first) ? first : "root";
}

export function dateStatusOf(metadata) {
  if (metadata.type === "page") {
    return "none";
  }
  if (metadata.evergreen === true) {
    return "evergreen";
  }
  return metadata.date ? "dated" : "unknown";
}

export function deriveSummary(html, site) {
  const content = stripMetadataComment(html)
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<table[^>]*id\s*=\s*["']related["'][\s\S]*?<\/table>/gi, " ");

  for (const block of content.match(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/gi) ?? []) {
    const withoutHeadings = block.replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, " ");
    const text = normalizeText(withoutHeadings);
    if (text.length >= 40 && !/^(posted by|published)/i.test(text)) {
      return truncateSummary(text);
    }
  }

  return site?.description ?? "";
}

export function truncateSummary(text, limit = 220) {
  const clean = collapseWhitespace(text);
  if (clean.length <= limit) {
    return clean;
  }

  const sentences = clean.split(/(?<=[.!?])\s+/);
  let result = "";
  for (const sentence of sentences) {
    const next = `${result} ${sentence}`.trim();
    if (next.length > limit) {
      break;
    }
    result = next;
  }

  if (!result) {
    result = clean.slice(0, limit).replace(/\s+\S*$/, "");
  }
  return `${result.replace(/[.!?]+$/, "")}…`;
}

export function validateMetadata({ rel, metadata, html, site }) {
  const errors = [];
  const warnings = [];

  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    errors.push(`${rel}: metadata must be a JSON object`);
    return { errors, warnings };
  }

  for (const key of Object.keys(metadata)) {
    if (!ALLOWED_FIELDS.has(key)) {
      warnings.push({ kind: "unknownField", detail: `${rel}: ${key}` });
    }
  }

  const title = typeof metadata.title === "string" ? metadata.title.trim() : "";
  if (title === "") {
    errors.push(`${rel}: missing or empty title`);
  }
  if (metadata.heading !== undefined && (typeof metadata.heading !== "string" || metadata.heading.trim() === "")) {
    errors.push(`${rel}: heading must be a non-empty string when present`);
  }

  if (metadata.type !== "article" && metadata.type !== "page") {
    errors.push(`${rel}: type must be "article" or "page"`);
  }

  if (metadata.date !== undefined && metadata.date !== null && !isValidDate(metadata.date)) {
    errors.push(`${rel}: invalid date "${metadata.date}" (expected YYYY, YYYY-MM, or YYYY-MM-DD)`);
  }
  if (metadata.updated !== undefined && metadata.updated !== null && !isValidDate(metadata.updated)) {
    errors.push(`${rel}: invalid updated date "${metadata.updated}"`);
  }

  if (metadata.evergreen !== undefined && typeof metadata.evergreen !== "boolean") {
    errors.push(`${rel}: evergreen must be a boolean`);
  }
  if (metadata.evergreen === true && metadata.date) {
    errors.push(`${rel}: evergreen articles must not have a date`);
  }
  if (metadata.evergreen === true && metadata.type === "page") {
    errors.push(`${rel}: evergreen applies to articles, not pages`);
  }

  if (metadata.type === "article") {
    if (metadata.date === undefined) {
      errors.push(`${rel}: article must declare date (or date: null with evergreen state)`);
    } else if (metadata.date === null && metadata.evergreen !== true) {
      warnings.push({ kind: "unknownDate", detail: rel });
    }
  }

  if (metadata.draft === true) {
    errors.push(`${rel}: draft content must live outside public/`);
  }

  if (metadata.layout !== undefined) {
    if (typeof metadata.layout !== "string" || !/^[a-z0-9-]+$/.test(metadata.layout)) {
      errors.push(`${rel}: layout must be a lowercase slug`);
    }
  }
  if (metadata.bodyClass !== undefined && typeof metadata.bodyClass !== "string") {
    errors.push(`${rel}: bodyClass must be a string`);
  }
  for (const field of ["showHeader", "showRelated", "triangles"]) {
    if (metadata[field] !== undefined && typeof metadata[field] !== "boolean") {
      errors.push(`${rel}: ${field} must be a boolean`);
    }
  }

  const tags = metadata.tags ?? [];
  if (!Array.isArray(tags)) {
    errors.push(`${rel}: tags must be an array`);
  } else {
    const seen = new Set();
    for (const tag of tags) {
      if (typeof tag !== "string" || tag.trim() === "") {
        errors.push(`${rel}: tags must be non-empty strings`);
        continue;
      }
      if (!site.tags.includes(tag)) {
        warnings.push({ kind: "unknownTag", detail: `${rel}: ${tag}` });
      }
      if (seen.has(tag)) {
        warnings.push({ kind: "duplicateTag", detail: `${rel}: ${tag}` });
      }
      seen.add(tag);
    }
    if (metadata.type === "article" && tags.length === 0) {
      warnings.push({ kind: "missingTags", detail: rel });
    }
  }

  if (metadata.summary !== undefined && typeof metadata.summary !== "string") {
    errors.push(`${rel}: summary must be a string`);
  } else if (typeof metadata.summary === "string" && metadata.summary.length > 300) {
    warnings.push({ kind: "longSummary", detail: rel });
  }

  for (const field of ["related", "scripts", "styles"]) {
    if (metadata[field] === undefined) {
      continue;
    }
    if (!Array.isArray(metadata[field])) {
      errors.push(`${rel}: ${field} must be an array`);
      continue;
    }
    for (const value of metadata[field]) {
      if (typeof value !== "string" || value.trim() === "") {
        errors.push(`${rel}: ${field} entries must be non-empty strings`);
      }
    }
  }

  // Fragments do not contain <title> or <time>; the renderer supplies them.
  if (/<body\b/i.test(html)) {
    const pageTitle = extractTitle(html);
    if (title && pageTitle && title !== pageTitle) {
      warnings.push({ kind: "titleMismatch", detail: `${rel}: "${title}" vs "${pageTitle}"` });
    }

    const times = extractTimeValues(html);
    if (metadata.date) {
      if (times.length === 0) {
        warnings.push({ kind: "missingVisibleDate", detail: rel });
      } else if (!times.includes(metadata.date)) {
        warnings.push({ kind: "dateMismatch", detail: `${rel}: "${metadata.date}" vs "${times.join(', ')}"` });
      }
    } else if (times.length > 0) {
      warnings.push({ kind: "unexpectedVisibleDate", detail: `${rel}: ${times.join(", ")}` });
    }
  }

  return { errors, warnings };
}

export function toCatalogEntry({ rel, metadata, html, site }) {
  const id = deriveId(rel);
  const url = deriveUrl(id);
  const summary = typeof metadata.summary === "string" && metadata.summary.trim() !== ""
    ? collapseWhitespace(metadata.summary)
    : deriveSummary(html, site);

  return {
    id,
    path: rel,
    url,
    canonicalUrl: `${site.baseUrl.replace(/\/$/, "")}${url}`,
    title: metadata.title.trim(),
    heading: metadata.heading?.trim() ?? metadata.title.trim(),
    type: metadata.type,
    date: metadata.date ?? null,
    datePrecision: datePrecision(metadata.date),
    dateStatus: dateStatusOf(metadata),
    evergreen: metadata.evergreen === true,
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    summary,
    summarySource: metadata.summary ? "manual" : summary ? "generated" : "none",
    section: deriveSection(id),
    updated: metadata.updated ?? null,
    layout: metadata.layout ?? (metadata.type === "page" ? "page" : "article"),
    bodyClass: metadata.bodyClass ?? "",
    showHeader: metadata.showHeader ?? metadata.type === "article",
    showRelated: metadata.showRelated ?? true,
    triangles: metadata.triangles === true,
    scripts: Array.isArray(metadata.scripts) ? metadata.scripts : [],
    styles: Array.isArray(metadata.styles) ? metadata.styles : [],
    related: Array.isArray(metadata.related) ? metadata.related : [],
  };
}

export function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sortEntries(entries) {
  const order = { dated: 0, evergreen: 1, unknown: 2, none: 3 };
  return [...entries].sort((a, b) => {
    const byStatus = order[a.dateStatus] - order[b.dateStatus];
    if (byStatus !== 0) {
      return byStatus;
    }
    if (a.dateStatus === "dated") {
      const byDate = compareStrings(b.date ?? "", a.date ?? "");
      if (byDate !== 0) {
        return byDate;
      }
    }
    return compareStrings(a.id, b.id);
  });
}

export function buildCatalog(entries) {
  const pages = sortEntries(entries);
  const counts = {
    pages: pages.filter((page) => page.type === "page").length,
    articles: pages.filter((page) => page.type === "article").length,
    dated: pages.filter((page) => page.dateStatus === "dated").length,
    evergreen: pages.filter((page) => page.dateStatus === "evergreen").length,
    unknownDate: pages.filter((page) => page.dateStatus === "unknown").length,
  };
  const version = createHash("sha256").update(JSON.stringify(pages)).digest("hex");
  return { version, count: pages.length, counts, pages };
}

export function formatReport(entries) {
  const lines = [
    "id | type | status | date | summary",
    "--- | --- | --- | --- | ---",
  ];
  for (const entry of entries) {
    lines.push(
      `${entry.id} | ${entry.type} | ${entry.dateStatus} | ${entry.date ?? ""} | ${entry.summary.replace(/\|/g, "\\|")}`,
    );
  }
  return lines.join("\n");
}

export function formatDiagnostics({ errors, warnings, catalog }) {
  const lines = [
    `Catalog: ${catalog.count} pages (${catalog.counts.articles} articles, ${catalog.counts.pages} pages)`,
    `Dates: ${catalog.counts.dated} dated, ${catalog.counts.evergreen} evergreen, ${catalog.counts.unknownDate} unknown`,
    `Version: ${catalog.version}`,
  ];

  if (errors.length > 0) {
    lines.push("", `ERRORS (${errors.length})`, ...errors.map((error) => `  ${error}`));
  }

  for (const [kind, label] of Object.entries(WARNING_LABELS)) {
    const items = warnings.filter((warning) => warning.kind === kind);
    if (items.length === 0) {
      continue;
    }
    lines.push("", `WARN ${label} (${items.length})`, ...items.map((warning) => `  ${warning.detail}`));
  }

  lines.push("", `${errors.length} error(s), ${warnings.length} warning(s)`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Filesystem and orchestration
// ---------------------------------------------------------------------------

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listHtmlFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function analyze(root, site) {
  const files = await listHtmlFiles(root);
  const errors = [];
  const warnings = [];
  const entries = [];
  const seen = new Set();

  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    const html = await readFile(file, "utf8");
    const metadataComment = extractMetadata(html);

    if (!metadataComment.text) {
      errors.push(`${rel}: missing metadata comment`);
      continue;
    }

    let metadata;
    try {
      metadata = JSON.parse(metadataComment.text);
    } catch (error) {
      errors.push(`${rel}: invalid metadata JSON: ${error.message}`);
      continue;
    }

    const result = validateMetadata({ rel, metadata, html, site });
    errors.push(...result.errors);
    warnings.push(...result.warnings);

    if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
      continue;
    }
    if (metadata.type !== "article" && metadata.type !== "page") {
      continue;
    }
    if (typeof metadata.title !== "string" || metadata.title.trim() === "") {
      continue;
    }

    const id = deriveId(rel);
    if (seen.has(id)) {
      errors.push(`${rel}: duplicate id "${id}"`);
      continue;
    }
    seen.add(id);
    entries.push(toCatalogEntry({ rel, metadata, html, site }));
  }

  return { files, entries, errors, warnings };
}

async function writeCatalog(outFile, catalog) {
  const outDir = path.dirname(outFile);
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, `${JSON.stringify(catalog, null, 2)}\n`);
  await writeFile(
    path.join(outDir, "_headers"),
    "/catalog.json\n  Cache-Control: no-cache\n",
  );
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  if (args.check && args.out) {
    io.error("Use either --check or --out, not both");
    process.exitCode = 1;
    return;
  }
  if (args.clean && !args.out) {
    io.error("--clean requires --out");
    process.exitCode = 1;
    return;
  }

  const root = path.resolve(REPO_ROOT, args.root);
  const outFile = args.out ? path.resolve(REPO_ROOT, args.out) : null;
  const outDir = outFile ? path.dirname(outFile) : null;
  const outRelative = outDir ? path.relative(REPO_ROOT, outDir) : "";
  if (args.clean && (outDir === REPO_ROOT || outRelative.startsWith("..") || path.isAbsolute(outRelative))) {
    io.error("Refusing to clean outside the repository");
    process.exitCode = 1;
    return;
  }

  let site;
  try {
    site = await readJson(path.join(REPO_ROOT, "site.json"));
  } catch (error) {
    io.error(`Cannot read site.json: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (!Array.isArray(site.tags) || typeof site.baseUrl !== "string") {
    io.error("site.json must define a tags array and a baseUrl");
    process.exitCode = 1;
    return;
  }

  let result;
  try {
    result = await analyze(root, site);
  } catch (error) {
    io.error(`Cannot read ${root}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const catalog = buildCatalog(result.entries);
  if (args.report) {
    io.log(formatReport(catalog.pages));
    io.log("");
  }
  io.log(formatDiagnostics({ ...result, catalog }));

  const failed = result.errors.length > 0 || (args.strict && result.warnings.length > 0);
  if (outFile && outDir && !failed) {
    if (args.clean) {
      await rm(outDir, { recursive: true, force: true });
    }
    await writeCatalog(outFile, catalog);
    io.log(`Wrote ${outFile}`);
  }

  process.exitCode = failed ? 1 : 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
