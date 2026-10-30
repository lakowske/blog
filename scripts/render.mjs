#!/usr/bin/env node
/**
 * Zero-dependency static renderer.
 *
 * Reads the Phase 1 catalog metadata and body fragments from public/, applies
 * the standard article/page layouts, and writes the generated site to dump/.
 *
 * Usage:
 *   node scripts/render.mjs [--out dump] [--root public]
 */

import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  analyze,
  stripMetadataComment,
} from "./catalog.mjs";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const TEMPLATE_ROOT = path.join(REPO_ROOT, "templates");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function parseArgs(argv) {
  const valueAfter = (name, fallback) => {
    const index = argv.indexOf(name);
    return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
  };
  return {
    out: valueAfter("--out", "dump"),
    root: valueAfter("--root", "public"),
  };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDate(date) {
  if (!date) {
    return "";
  }
  if (date.length === 10) {
    return date;
  }
  if (date.length === 7) {
    const [year, month] = date.split("-");
    return `${MONTHS[Number(month) - 1]} ${year}`;
  }
  return date;
}

export function relativePrefix(pagePath) {
  const dir = path.posix.dirname(pagePath);
  if (dir === "." || dir === "") {
    return "";
  }
  return "../".repeat(dir.split("/").length);
}

export function relativeLink(fromPath, toPath) {
  return path.posix.relative(path.posix.dirname(fromPath), toPath) || toPath;
}

export function renderTemplate(template, vars) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "",
  );
}

export function isFullDocument(html) {
  return /^\s*(?:<!doctype\s+html|<html\b)/i.test(html);
}

export function renderStyles(entry, prefix) {
  const links = [
    `<link rel="stylesheet" type="text/css" href="${prefix}static/style/style.css">`,
  ];
  if (entry.triangles) {
    links.push(`<link rel="stylesheet" type="text/css" href="${prefix}static/bundles/triangles/style.css">`);
  }
  for (const style of entry.styles) {
    links.push(`<link rel="stylesheet" type="text/css" href="${escapeHtml(style)}">`);
  }
  return links.join("\n    ");
}

export function renderScripts(entry, prefix) {
  const scripts = entry.scripts.map(
    (script) => `<script src="${escapeHtml(script)}"></script>`,
  );
  if (entry.triangles) {
    scripts.push(`<script src="${prefix}static/bundles/triangles/bundle.js"></script>`);
  }
  return scripts.join("\n    ");
}

export function renderDateLine(entry) {
  if (entry.dateStatus !== "dated") {
    return "";
  }
  return `<p class="date">Published: <time datetime="${escapeHtml(entry.date)}">${escapeHtml(formatDate(entry.date))}</time></p>`;
}

export function renderHeader(entry, aboutHref, author) {
  if (!entry.showHeader) {
    return "";
  }
  return [
    "<header>",
    `  <h1 class="title">${escapeHtml(entry.title)}</h1>`,
    `  <p class="byline">Posted by: <a href="${escapeHtml(aboutHref)}">${escapeHtml(author)}</a></p>`,
    `  ${renderDateLine(entry)}`,
    "</header>",
  ].join("\n");
}

export function renderRelatedTable(entry, entries, pagePath) {
  if (!entry.showRelated) {
    return "";
  }
  const rows = entries
    .filter((target) => target.path !== entry.path)
    .map((target) => {
      const href = relativeLink(pagePath, target.path);
      return `<tr><td><a href="${escapeHtml(href)}">${escapeHtml(target.title)}</a></td></tr>`;
    });
  return `<table id="related"><tbody>\n${rows.join("\n")}\n</tbody></table>`;
}

export function injectRelated(html, relatedTable) {
  if (!relatedTable) {
    return html;
  }
  return html.replace(
    /<table[^>]*id\s*=\s*["']related["'][\s\S]*?<\/table>/i,
    relatedTable,
  );
}

export function renderLayout(template, vars) {
  return renderTemplate(template, vars);
}

// ---------------------------------------------------------------------------
// Filesystem and orchestration
// ---------------------------------------------------------------------------

async function readTemplate(name) {
  return readFile(path.join(TEMPLATE_ROOT, name), "utf8");
}

async function writePage(outRoot, relPath, html) {
  const filePath = path.join(outRoot, relPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html);
}

async function copyAssets(root, outRoot) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await copyAssets(source, path.join(outRoot, entry.name));
    } else if (entry.isFile() && !entry.name.endsWith(".html")) {
      const target = path.join(outRoot, entry.name);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }
  }
}

async function readFragment(root, relPath) {
  return stripMetadataComment(await readFile(path.join(root, relPath), "utf8"));
}

export async function run({ root = "public", out = "dump", site } = {}) {
  const publicRoot = path.resolve(REPO_ROOT, root);
  const outRoot = path.resolve(REPO_ROOT, out);
  const result = await analyze(publicRoot, site);
  if (result.errors.length > 0) {
    return { ...result, outRoot, written: 0, exceptions: [] };
  }

  const base = await readTemplate("base.html");
  const article = await readTemplate("article.html");
  const page = await readTemplate("page.html");
  const bare = await readTemplate(path.join("layouts", "bare.html"));
  const entries = result.entries;
  const exceptions = entries
    .filter((entry) => entry.layout !== "article" && entry.layout !== "page")
    .map((entry) => ({ id: entry.id, layout: entry.layout }));

  let written = 0;
  for (const entry of entries) {
    const fragment = await readFragment(publicRoot, entry.path);
    const prefix = relativePrefix(entry.path);
    const aboutHref = relativeLink(entry.path, "about/index.html");
    const related = renderRelatedTable(entry, entries, entry.path);
    const header = renderHeader(entry, aboutHref, site.author);

    let body;
    if (entry.layout === "raw") {
      if (!isFullDocument(fragment)) {
        throw new Error(`${entry.path}: layout "raw" requires a complete HTML document`);
      }
      body = injectRelated(fragment, related);
    } else {
      if (isFullDocument(fragment)) {
        throw new Error(`${entry.path}: complete documents require layout: "raw"`);
      }

      const partialName =
        entry.layout === "article" ? article :
        entry.layout === "page" ? page :
        entry.layout === "bare" ? bare :
        await readTemplate(path.join("layouts", `${entry.layout}.html`));

      const partial = renderLayout(partialName, {
        content: fragment,
        header,
        related,
        title: escapeHtml(entry.title),
        type: escapeHtml(entry.type),
        dateStatus: escapeHtml(entry.dateStatus),
        dateLine: renderDateLine(entry),
        byline: "",
      });

      body = renderTemplate(base, {
        title: escapeHtml(entry.title),
        description: escapeHtml(entry.summary),
        canonicalUrl: escapeHtml(entry.canonicalUrl),
        ogTitle: escapeHtml(entry.title),
        ogDescription: escapeHtml(entry.summary),
        ogType: entry.type === "page" ? "website" : "article",
        ogUrl: escapeHtml(entry.canonicalUrl),
        siteName: escapeHtml(site.title),
        bodyClass: escapeHtml(entry.bodyClass),
        styles: renderStyles(entry, prefix),
        scripts: renderScripts(entry, prefix),
        body: partial,
      });
    }

    await writePage(outRoot, entry.path, body);
    written += 1;
  }

  await copyAssets(publicRoot, outRoot);
  await writeFile(path.join(outRoot, ".nojekyll"), "");
  await writeFile(path.join(outRoot, "CNAME"), "sethlakowske.com");

  return { ...result, outRoot, written, exceptions };
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const site = JSON.parse(await readFile(path.join(REPO_ROOT, "site.json"), "utf8"));
  let result;
  try {
    result = await run({ root: args.root, out: args.out, site });
  } catch (error) {
    io.error(error.message);
    process.exitCode = 1;
    return;
  }

  if (result.errors.length > 0) {
    io.error(`Metadata errors (${result.errors.length})`);
    for (const error of result.errors) {
      io.error(`  ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  io.log(`Rendered ${result.written} pages to ${path.relative(REPO_ROOT, result.outRoot)}`);
  io.log(`Layouts: ${result.entries.length - result.exceptions.length} standard, ${result.exceptions.length} exception(s)`);
  if (result.exceptions.length > 0) {
    for (const exception of result.exceptions) {
      io.log(`  ${exception.id}: ${exception.layout}`);
    }
  }

  if (result.warnings.length > 0) {
    io.log(`Metadata warnings: ${result.warnings.length}`);
  }
  process.exitCode = 0;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
