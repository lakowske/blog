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
import {
  compareStrings,
  escapeHtml,
  formatDate,
  relativeLink,
  relativePrefix,
  renderTemplate,
} from "./site-utils.mjs";
import {
  build404Body,
  buildArchiveSections,
  buildHomeSections,
  buildRobots,
  buildRss,
  buildSitemap,
  buildTagBody,
  listUsedTags,
  urlFromPath,
} from "./site-pages.mjs";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const TEMPLATE_ROOT = path.join(REPO_ROOT, "templates");

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

const SECTION_BONUS = new Set(["articles", "software", "technology"]);
const STATUS_ORDER = { dated: 0, evergreen: 1, unknown: 2, none: 3 };

export function compareByDate(a, b) {
  const byStatus = STATUS_ORDER[a.dateStatus] - STATUS_ORDER[b.dateStatus];
  if (byStatus !== 0) {
    return byStatus;
  }
  if (a.date && b.date) {
    const byDate = compareStrings(b.date, a.date);
    if (byDate !== 0) {
      return byDate;
    }
  }
  return compareStrings(a.id, b.id);
}

export function relatedEntries(entry, entries) {
  if (entry.type === "page" || !entry.showRelated) {
    return [];
  }

  const articles = entries.filter(
    (target) => target.type === "article" && target.path !== entry.path,
  );
  const byId = new Map(entries.map((target) => [target.id, target]));
  const selected = [];
  const seen = new Set([entry.path]);

  const add = (target) => {
    if (target && target.type === "article" && !seen.has(target.path)) {
      seen.add(target.path);
      selected.push(target);
    }
  };

  for (const id of entry.related ?? []) {
    add(byId.get(id));
  }

  const scored = articles
    .map((target) => {
      const shared = target.tags.filter((tag) => entry.tags.includes(tag)).length;
      const sameSection =
        target.section === entry.section && SECTION_BONUS.has(entry.section);
      return { target, score: 3 * shared + (sameSection ? 1 : 0) };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        compareByDate(a.target, b.target),
    );

  for (const item of scored) {
    if (selected.length >= 5) {
      break;
    }
    add(item.target);
  }

  const recent = [...articles].sort(compareByDate);
  const sameSection = recent.filter((target) => target.section === entry.section);
  for (const target of [...sameSection, ...recent]) {
    if (selected.length >= 3) {
      break;
    }
    add(target);
  }

  return selected.slice(0, 5);
}

const NAV_TARGETS = {
  "/": "index.html",
  "/about/": "about/index.html",
  "/articles/": "articles/index.html",
  "/resume/": "resume/index.html",
};

function navTargetId(target) {
  return target === "index.html" ? "index" : target.replace(/\/index\.html$/, "");
}

export function renderNav(site, entry, pagePath) {
  const items = site.nav
    .map((item) => {
      const target = NAV_TARGETS[item.path] ?? item.path.replace(/^\//, "");
      const href = relativeLink(pagePath, target);
      const current = entry.id === navTargetId(target) ? ' aria-current="page"' : "";
      return `<li><a href="${escapeHtml(href)}"${current}>${escapeHtml(item.label)}</a></li>`;
    })
    .join("");
  return `<nav class="site-nav" aria-label="Site"><ul>${items}</ul></nav>`;
}

export function renderFooter(site, entry, pagePath) {
  const links = site.nav
    .map((item) => {
      const target = NAV_TARGETS[item.path] ?? item.path.replace(/^\//, "");
      const href = relativeLink(pagePath, target);
      return `<a href="${escapeHtml(href)}">${escapeHtml(item.label)}</a>`;
    })
    .join(" · ");
  return `<footer class="site-footer"><p>${escapeHtml(site.author)} · ${links}</p></footer>`;
}

export function renderPageHeader(entry) {
  const heading = entry.heading || entry.title;
  if (!heading) {
    return "";
  }
  return `<header>\n  <h1 class="page-title">${escapeHtml(heading)}</h1>\n</header>`;
}

export function renderRelatedNav(entry, entries, pagePath) {
  const related = relatedEntries(entry, entries);
  if (related.length === 0) {
    return "";
  }
  const items = related
    .map((target) => {
      const href = relativeLink(pagePath, target.path);
      return `    <li><a href="${escapeHtml(href)}">${escapeHtml(target.title)}</a></li>`;
    })
    .join("\n");
  return [
    '<nav id="related" class="related" aria-labelledby="related-heading">',
    '  <h2 id="related-heading">Related</h2>',
    "  <ul>",
    items,
    "  </ul>",
    "</nav>",
  ].join("\n");
}

export function renderTags(entry, pagePath) {
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    return "";
  }
  const links = entry.tags
    .map((tag) => {
      const href = relativeLink(pagePath, `tags/${tag}/index.html`);
      return `<a href="${escapeHtml(href)}">${escapeHtml(tag)}</a>`;
    })
    .join(", ");
  return `<p class="tags">Tags: ${links}</p>`;
}

export function injectRelated(html, relatedNav) {
  if (!relatedNav) {
    return html;
  }
  return html.replace(
    /<(?:nav|table)[^>]*id\s*=\s*["']related["'][\s\S]*?<\/(?:nav|table)>/i,
    relatedNav,
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

function renderBaseTemplate(base, entry, body, site) {
  const prefix = relativePrefix(entry.path);
  return renderTemplate(base, {
    title: escapeHtml(entry.title),
    description: escapeHtml(entry.summary ?? ""),
    canonicalUrl: escapeHtml(entry.canonicalUrl),
    ogTitle: escapeHtml(entry.title),
    ogDescription: escapeHtml(entry.summary ?? ""),
    ogType: entry.type === "page" ? "website" : "article",
    ogUrl: escapeHtml(entry.canonicalUrl),
    siteName: escapeHtml(site.title),
    bodyClass: escapeHtml(entry.bodyClass ?? ""),
    styles: renderStyles(entry, prefix),
    scripts: renderScripts(entry, prefix),
    nav: renderNav(site, entry, entry.path),
    footer: renderFooter(site, entry, entry.path),
    feedHref: escapeHtml(relativeLink(entry.path, "feed.xml")),
    body,
  });
}

function renderArticleDocument(entry, fragment, entries, site, templates) {
  const aboutHref = relativeLink(entry.path, "about/index.html");
  const header = renderHeader(entry, aboutHref, site.author);
  const related = renderRelatedNav(entry, entries, entry.path);
  const tags = renderTags(entry, entry.path);
  const content = tags ? `${fragment}\n${tags}` : fragment;
  const partial = renderTemplate(templates.article, {
    content,
    header,
    related,
    title: escapeHtml(entry.title),
    type: escapeHtml(entry.type),
    dateStatus: escapeHtml(entry.dateStatus),
  });
  return renderBaseTemplate(templates.base, entry, partial, site);
}

function renderPageDocument(entry, fragment, entries, site, templates) {
  const content = entry.id === "index"
    ? fragment.replace("<!--recent-->", buildHomeSections(entries, entry.path))
    : fragment;
  const partial = renderTemplate(templates.page, {
    content,
    pageHeader: renderPageHeader(entry),
    title: escapeHtml(entry.title),
    type: escapeHtml(entry.type),
    dateStatus: escapeHtml(entry.dateStatus),
  });
  return renderBaseTemplate(templates.base, entry, partial, site);
}

function renderBareDocument(entry, fragment, site, templates) {
  const partial = renderTemplate(templates.bare, {
    content: fragment,
    title: escapeHtml(entry.title),
    type: escapeHtml(entry.type),
    dateStatus: escapeHtml(entry.dateStatus),
  });
  return renderBaseTemplate(templates.base, entry, partial, site);
}

function renderSyntheticPage(site, templates, { id, path: pagePath, title, heading, description, body }) {
  const entry = {
    id,
    path: pagePath,
    title,
    heading,
    type: "page",
    date: null,
    dateStatus: "none",
    evergreen: false,
    tags: [],
    summary: description,
    section: "pages",
    canonicalUrl: `${site.baseUrl.replace(/\/$/, "")}${urlFromPath(pagePath)}`,
    bodyClass: "",
    showHeader: false,
    showRelated: false,
    triangles: false,
    styles: [],
    scripts: [],
    related: [],
    layout: "page",
  };
  const partial = renderTemplate(templates.page, {
    content: body,
    pageHeader: renderPageHeader(entry),
    title: escapeHtml(entry.title),
    type: escapeHtml(entry.type),
    dateStatus: escapeHtml(entry.dateStatus),
  });
  return renderBaseTemplate(templates.base, entry, partial, site);
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

  const templates = { base, article, page, bare };
  let written = 0;
  for (const entry of entries) {
    const fragment = await readFragment(publicRoot, entry.path);
    let body;

    if (entry.layout === "raw") {
      if (!isFullDocument(fragment)) {
        throw new Error(`${entry.path}: layout "raw" requires a complete HTML document`);
      }
      body = injectRelated(fragment, renderRelatedNav(entry, entries, entry.path));
    } else {
      if (isFullDocument(fragment)) {
        throw new Error(`${entry.path}: complete documents require layout: "raw"`);
      }

      if (entry.layout === "article") {
        body = renderArticleDocument(entry, fragment, entries, site, templates);
      } else if (entry.layout === "page") {
        body = renderPageDocument(entry, fragment, entries, site, templates);
      } else if (entry.layout === "bare") {
        body = renderBareDocument(entry, fragment, site, templates);
      } else {
        const named = await readTemplate(path.join("layouts", `${entry.layout}.html`));
        const partial = renderTemplate(named, {
          content: fragment,
          header: renderHeader(entry, relativeLink(entry.path, "about/index.html"), site.author),
          related: renderRelatedNav(entry, entries, entry.path),
          title: escapeHtml(entry.title),
          type: escapeHtml(entry.type),
          dateStatus: escapeHtml(entry.dateStatus),
          dateLine: renderDateLine(entry),
        });
        body = renderBaseTemplate(base, entry, partial, site);
      }
    }

    await writePage(outRoot, entry.path, body);
    written += 1;
  }

  const usedTags = listUsedTags(entries);
  const archivePath = "articles/index.html";
  await writePage(outRoot, archivePath, renderSyntheticPage(site, templates, {
    id: "articles",
    path: archivePath,
    title: "Articles",
    heading: "Articles",
    description: "All articles by Seth Lakowske.",
    body: buildArchiveSections(entries, archivePath),
  }));
  written += 1;

  const generatedPaths = [archivePath];
  for (const { tag } of usedTags) {
    const tagPath = `tags/${tag}/index.html`;
    await writePage(outRoot, tagPath, renderSyntheticPage(site, templates, {
      id: `tags/${tag}`,
      path: tagPath,
      title: `Tag: ${tag}`,
      heading: `Tag: ${tag}`,
      description: `Articles tagged ${tag}.`,
      body: buildTagBody(tag, entries, tagPath),
    }));
    generatedPaths.push(tagPath);
    written += 1;
  }

  await writePage(outRoot, "404.html", renderSyntheticPage(site, templates, {
    id: "404",
    path: "404.html",
    title: "Page not found",
    heading: "Page not found",
    description: "Page not found.",
    body: build404Body("404.html"),
  }));
  written += 1;

  await writePage(outRoot, "feed.xml", buildRss(entries, site));
  await writePage(outRoot, "sitemap.xml", buildSitemap(entries, generatedPaths, site));
  await writePage(outRoot, "robots.txt", buildRobots(site));

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
