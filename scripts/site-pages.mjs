/**
 * Pure builders for generated site pages: archive, tags, feed, sitemap,
 * robots, and the 404 body.
 */

import {
  compareStrings,
  escapeHtml,
  escapeXml,
  formatDate,
  fullDate,
  relativeLink,
  rssDate,
} from "./site-utils.mjs";

export function urlFromPath(path) {
  if (path === "index.html") {
    return "/";
  }
  if (path.endsWith("/index.html")) {
    return `/${path.slice(0, -"index.html".length)}`;
  }
  return `/${path}`;
}

export function listUsedTags(entries) {
  const counts = new Map();
  for (const entry of entries) {
    if (entry.type !== "article") {
      continue;
    }
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || compareStrings(a.tag, b.tag));
}

function sortDated(entries) {
  return entries
    .filter((entry) => entry.dateStatus === "dated")
    .sort((a, b) => compareStrings(b.date ?? "", a.date ?? "") || compareStrings(a.id, b.id));
}

function sortTitle(entries) {
  return [...entries].sort((a, b) => compareStrings(a.title, b.title));
}

function tagLinks(entry, pagePath) {
  return entry.tags
    .map((tag) => {
      const href = relativeLink(pagePath, `tags/${tag}/index.html`);
      return `<a href="${escapeHtml(href)}">${escapeHtml(tag)}</a>`;
    })
    .join(", ");
}

export function renderArticleItem(entry, pagePath, { showDate = true, showTags = true } = {}) {
  const href = relativeLink(pagePath, entry.path);
  const date =
    showDate && entry.dateStatus === "dated"
      ? ` <time datetime="${escapeHtml(entry.date)}">${escapeHtml(formatDate(entry.date))}</time>`
      : "";
  const tags = showTags && entry.tags.length > 0
    ? ` <span class="tags">${tagLinks(entry, pagePath)}</span>`
    : "";
  return `<li><a href="${escapeHtml(href)}">${escapeHtml(entry.title)}</a>${date}${tags}</li>`;
}

export function renderArticleList(entries, pagePath, options = {}) {
  const items = entries.map((entry) => renderArticleItem(entry, pagePath, options));
  return `<ul class="article-list">\n${items.join("\n")}\n</ul>`;
}

export function buildHomeSections(entries, pagePath) {
  const articles = entries.filter((entry) => entry.type === "article");
  const evergreen = sortTitle(articles.filter((entry) => entry.dateStatus === "evergreen"));
  const recent = sortDated(articles).slice(0, 10);
  const sections = [];

  if (evergreen.length > 0) {
    sections.push(
      `<section class="home-section">\n<h2>Evergreen</h2>\n${renderArticleList(evergreen, pagePath, { showDate: false })}\n</section>`,
    );
  }
  if (recent.length > 0) {
    sections.push(
      `<section class="home-section">\n<h2>Recent posts</h2>\n${renderArticleList(recent, pagePath)}\n</section>`,
    );
  }
  sections.push(
    `<p class="all-articles"><a href="${escapeHtml(relativeLink(pagePath, "articles/index.html"))}">All articles</a></p>`,
  );
  return sections.join("\n");
}

export function buildArchiveSections(entries, pagePath) {
  const articles = entries.filter((entry) => entry.type === "article");
  const dated = sortDated(articles);
  const evergreen = sortTitle(articles.filter((entry) => entry.dateStatus === "evergreen"));
  const unknown = sortTitle(articles.filter((entry) => entry.dateStatus === "unknown"));
  const tags = listUsedTags(entries);

  const tagItems = tags
    .map(({ tag, count }) => {
      const href = relativeLink(pagePath, `tags/${tag}/index.html`);
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(tag)}</a> (${count})</li>`;
    })
    .join("\n");

  return [
    `<section class="archive-section">`,
    `<h2>Dated</h2>`,
    renderArticleList(dated, pagePath),
    `</section>`,
    `<section class="archive-section">`,
    `<h2>Evergreen</h2>`,
    renderArticleList(evergreen, pagePath, { showDate: false }),
    `</section>`,
    `<section class="archive-section">`,
    `<h2>Date unknown</h2>`,
    `<p class="note">These technical posts are time-bound, but their publication date is not known.</p>`,
    renderArticleList(unknown, pagePath, { showDate: false }),
    `</section>`,
    `<section class="tag-index">`,
    `<h2>Tags</h2>`,
    `<ul class="tag-list">\n${tagItems}\n</ul>`,
    `</section>`,
  ].join("\n");
}

export function buildTagBody(tag, entries, pagePath) {
  const matching = entries.filter(
    (entry) => entry.type === "article" && entry.tags.includes(tag),
  );
  const ordered = [...matching].sort((a, b) => {
    if (a.dateStatus === "dated" && b.dateStatus === "dated") {
      const byDate = compareStrings(b.date ?? "", a.date ?? "");
      if (byDate !== 0) {
        return byDate;
      }
    } else if (a.dateStatus !== b.dateStatus) {
      const order = { dated: 0, evergreen: 1, unknown: 2, none: 3 };
      return order[a.dateStatus] - order[b.dateStatus];
    }
    return compareStrings(a.title, b.title);
  });

  return [
    `<p class="tag-count">${ordered.length} article${ordered.length === 1 ? "" : "s"} tagged <strong>${escapeHtml(tag)}</strong>.</p>`,
    renderArticleList(ordered, pagePath),
    `<p class="all-articles"><a href="${escapeHtml(relativeLink(pagePath, "articles/index.html"))}">All articles</a></p>`,
  ].join("\n");
}

export function build404Body(pagePath) {
  return [
    `<p>The page you requested was not found.</p>`,
    `<ul>`,
    `<li><a href="${escapeHtml(relativeLink(pagePath, "index.html"))}">Home</a></li>`,
    `<li><a href="${escapeHtml(relativeLink(pagePath, "articles/index.html"))}">All articles</a></li>`,
    `</ul>`,
  ].join("\n");
}

export function buildRss(entries, site) {
  const dated = sortDated(entries);
  const latest = dated[0];
  const items = dated
    .map((entry) => {
      const categories = entry.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");
      return [
        `    <item>`,
        `      <title>${escapeXml(entry.title)}</title>`,
        `      <link>${escapeXml(entry.canonicalUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(entry.canonicalUrl)}</guid>`,
        `      <pubDate>${rssDate(entry.date)}</pubDate>`,
        `      <description>${escapeXml(entry.summary)}</description>`,
        categories,
        `    </item>`,
      ].filter(Boolean).join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    `  <channel>`,
    `    <title>${escapeXml(site.title)}</title>`,
    `    <link>${escapeXml(site.baseUrl)}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    `    <language>en-us</language>`,
    latest ? `    <lastBuildDate>${rssDate(latest.date)}</lastBuildDate>` : "",
    items,
    `  </channel>`,
    `</rss>`,
    ``,
  ].filter((line) => line !== "").join("\n");
}

export function buildSitemap(entries, generatedPaths, site) {
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const paths = [
    ...entries.map((entry) => entry.path),
    ...generatedPaths,
  ];
  const unique = [...new Set(paths)].sort(compareStrings);
  const urls = unique.map((path) => {
    const entry = byPath.get(path);
    const loc = `${site.baseUrl.replace(/\/$/, "")}${urlFromPath(path)}`;
    const lastmod = entry?.dateStatus === "dated" ? fullDate(entry.date) : "";
    return [
      `  <url>`,
      `    <loc>${escapeXml(loc)}</loc>`,
      lastmod ? `    <lastmod>${escapeXml(lastmod)}</lastmod>` : "",
      `  </url>`,
    ].filter(Boolean).join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

export function buildRobots(site) {
  return [
    `User-agent: *`,
    `Allow: /`,
    `Sitemap: ${site.baseUrl.replace(/\/$/, "")}/sitemap.xml`,
    ``,
  ].join("\n");
}
