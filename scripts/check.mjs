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

// Temporary allowlist for the two known-broken WebGL references. Remove in
// Phase 2 when the page is normalized.
const KNOWN_BROKEN = new Set([
  "articles/webgl-using-gl-mat4-browserify-shader-and-browserify/index.html|../webgl-using-gl-mat4-browserify-shader-and-browserify/node_modules/prismjs-package/prism.css",
  "articles/webgl-using-gl-mat4-browserify-shader-and-browserify/index.html|3dify/bundle.js",
]);

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

const WARNING_LABELS = {
  date: "missing publish date",
  byline: "missing byline",
  related: "missing related placeholder",
  description: "missing meta description",
  canonical: "missing canonical link",
  heading: "heading count is not exactly 1",
  timeFormat: "<time> without a valid datetime",
};

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const strict = argv.includes("--strict");
  const rootArg = argv.find((arg) => !arg.startsWith("--")) ?? "dump";
  return { strict, rootArg };
}

export function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function stripUrl(value) {
  return decodeEntities(value).split("#")[0].split("?")[0].trim();
}

export function isExternal(value) {
  return EXTERNAL.test(value);
}

export function attrs(html, name) {
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi");
  const values = [];
  let match;
  while ((match = pattern.exec(html)) !== null) {
    values.push(match[2] ?? match[3] ?? "");
  }
  return values;
}

export function countMatches(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

export function titleOf(html) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "";
}

export function duplicateIds(html) {
  const seen = new Set();
  const duplicates = new Set();
  for (const id of attrs(html, "id")) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return [...duplicates];
}

export function referencesIn(html) {
  return [...attrs(html, "href"), ...attrs(html, "src")];
}

/**
 * Resolve a link to a path relative to the generated site root.
 * Returns null for external, empty, or fragment-only links.
 */
export function resolveReference(pageRel, url) {
  const clean = stripUrl(url);
  if (!clean || isExternal(clean)) {
    return null;
  }

  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    // Keep the raw value if it is not valid percent-encoding.
  }

  if (decoded.startsWith("/")) {
    return path.posix.normalize(decoded.slice(1));
  }
  return path.posix.normalize(path.posix.join(path.posix.dirname(pageRel), decoded));
}

export function timeStatus(html) {
  if (!/<time\b/i.test(html)) {
    return "missing";
  }
  const tags = html.match(/<time\b[^>]*>/gi) ?? [];
  const invalid = tags.some((tag) => {
    const value = tag.match(/\bdatetime\s*=\s*["']([^"']+)["']/i)?.[1];
    return !value || !/^\d{4}-\d{2}-\d{2}$/.test(value);
  });
  return invalid ? "invalid" : "ok";
}

export function hasByline(html) {
  return /Posted by/i.test(html);
}

export function hasRelatedPlaceholder(html) {
  return /id\s*=\s*["']related["']/i.test(html);
}

export function hasDescription(html) {
  return /<meta\b[^>]*name\s*=\s*["']description["']/i.test(html);
}

export function hasCanonical(html) {
  return /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(html);
}

export function headingCount(html) {
  return countMatches(html, /<h1\b/gi);
}

export function emptyWarnings() {
  return Object.fromEntries(Object.keys(WARNING_LABELS).map((kind) => [kind, []]));
}

export function formatReport({ rootLabel, fileCount, errors, warnings }) {
  const lines = [`Checked ${fileCount} HTML files in ${rootLabel}`];

  if (errors.length > 0) {
    lines.push("", `ERRORS (${errors.length})`, ...errors.map((error) => `  ${error}`));
  }

  let warningCount = 0;
  for (const [kind, label] of Object.entries(WARNING_LABELS)) {
    const pages = warnings[kind] ?? [];
    warningCount += pages.length;
    if (pages.length === 0) {
      continue;
    }
    lines.push("", `WARN ${label} (${pages.length})`, ...pages.map((page) => `  ${page}`));
  }

  lines.push("", `${errors.length} error(s), ${warningCount} warning(s)`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Filesystem helpers
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

async function fileExists(root, target) {
  if (!target || target.startsWith("..") || path.isAbsolute(target)) {
    return false;
  }

  const full = path.join(root, target);
  try {
    const info = await stat(full);
    if (info.isFile()) {
      return true;
    }
    if (info.isDirectory()) {
      // A directory URL such as /about/ is served by its index.html.
      const index = await stat(path.join(full, "index.html"));
      return index.isFile();
    }
  } catch {
    // Missing or unreadable paths are broken references.
  }
  return false;
}

// ---------------------------------------------------------------------------
// Composition and side effects
// ---------------------------------------------------------------------------

export async function validatePage({ rel, html, fileExists: targetExists }) {
  const errors = [];
  const warnings = [];

  if (titleOf(html) === "") {
    errors.push(`${rel}: missing or empty <title>`);
  }

  for (const id of duplicateIds(html)) {
    errors.push(`${rel}: duplicate id "${id}"`);
  }

  for (const reference of referencesIn(html)) {
    const key = `${rel}|${reference}`;
    if (KNOWN_BROKEN.has(key)) {
      continue;
    }
    const target = resolveReference(rel, reference);
    if (target && !(await targetExists(target))) {
      errors.push(`${rel}: broken reference "${reference}"`);
    }
  }

  const time = timeStatus(html);
  if (time === "missing") {
    warnings.push({ kind: "date", detail: rel });
  } else if (time === "invalid") {
    warnings.push({ kind: "timeFormat", detail: rel });
  }

  if (!hasByline(html)) {
    warnings.push({ kind: "byline", detail: rel });
  }
  if (!hasRelatedPlaceholder(html)) {
    warnings.push({ kind: "related", detail: rel });
  }
  if (!hasDescription(html)) {
    warnings.push({ kind: "description", detail: rel });
  }
  if (!hasCanonical(html)) {
    warnings.push({ kind: "canonical", detail: rel });
  }

  const headings = headingCount(html);
  if (headings !== 1) {
    warnings.push({ kind: "heading", detail: `${rel} (${headings})` });
  }

  return { errors, warnings };
}

export async function run({ root, strict = false }) {
  const files = await listHtmlFiles(root);
  const errors = [];
  const warnings = emptyWarnings();
  const targetExists = (target) => fileExists(root, target);

  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    const html = await readFile(file, "utf8");
    const result = await validatePage({ rel, html, fileExists: targetExists });
    errors.push(...result.errors);
    for (const warning of result.warnings) {
      warnings[warning.kind].push(warning.detail);
    }
  }

  const warningCount = Object.values(warnings).reduce((sum, pages) => sum + pages.length, 0);
  const exitCode = errors.length > 0 || (strict && warningCount > 0) ? 1 : 0;

  return { fileCount: files.length, errors, warnings, exitCode };
}

export async function main(argv = process.argv.slice(2), io = console) {
  const { strict, rootArg } = parseArgs(argv);
  const root = path.resolve(rootArg);

  try {
    const report = await run({ root, strict });
    const rootLabel = path.relative(process.cwd(), root) || ".";
    io.log(formatReport({ ...report, rootLabel }));
    process.exitCode = report.exitCode;
  } catch (error) {
    io.error(`Cannot read ${root}: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
