import test from "node:test";
import assert from "node:assert/strict";

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

const site = {
  title: "Seth Lakowske",
  description: "Blog",
  author: "Seth Lakowske",
  baseUrl: "https://sethlakowske.com",
};

function article(id, dateStatus, date, tags, section = "articles") {
  return {
    id,
    path: `${id}/index.html`,
    title: id,
    type: "article",
    date,
    dateStatus,
    tags,
    section,
    summary: `Summary for ${id}`,
    canonicalUrl: `https://sethlakowske.com/${id}/`,
  };
}

const entries = [
  article("dated-new", "dated", "2024-01-01", ["javascript"]),
  article("dated-old", "dated", "2020-01-01", ["javascript"]),
  article("evergreen", "evergreen", null, ["philosophy"]),
  article("unknown", "unknown", null, ["javascript"]),
  {
    id: "about",
    path: "about/index.html",
    title: "About",
    type: "page",
    date: null,
    dateStatus: "none",
    tags: [],
    section: "pages",
    summary: "About",
    canonicalUrl: "https://sethlakowske.com/about/",
  },
];

test("urlFromPath handles root, directories, and files", () => {
  assert.equal(urlFromPath("index.html"), "/");
  assert.equal(urlFromPath("articles/index.html"), "/articles/");
  assert.equal(urlFromPath("tags/javascript/index.html"), "/tags/javascript/");
  assert.equal(urlFromPath("404.html"), "/404.html");
});

test("listUsedTags counts articles only", () => {
  assert.deepEqual(listUsedTags(entries), [
    { tag: "javascript", count: 3 },
    { tag: "philosophy", count: 1 },
  ]);
});

test("home is one list with evergreen, dated, and an all-articles link", () => {
  const html = buildHomeSections(entries, "index.html");
  assert.doesNotMatch(html, /Evergreen|Recent posts|Dated|Date unknown/);
  assert.match(html, /dated-new/);
  assert.match(html, /evergreen/);
  assert.doesNotMatch(html, /unknown/);
  assert.match(html, /href="articles\/index\.html"/);
});

test("archive is one list plus a tag index", () => {
  const html = buildArchiveSections(entries, "articles/index.html");
  assert.doesNotMatch(html, /Dated|Evergreen|Date unknown/);
  assert.match(html, /dated-new/);
  assert.match(html, /evergreen/);
  assert.match(html, /unknown/);
  assert.match(html, /Tags/);
  assert.match(html, /href="\.\.\/tags\/javascript\/index\.html"/);
});

test("tag pages list matching articles", () => {
  const html = buildTagBody("javascript", entries, "tags/javascript/index.html");
  assert.match(html, /3 articles tagged/);
  assert.match(html, /dated-new/);
  assert.match(html, /href="\.\.\/\.\.\/articles\/index\.html"/);
});

test("RSS includes dated articles only", () => {
  const xml = buildRss(entries, site);
  assert.match(xml, /<rss version="2\.0">/);
  assert.match(xml, /dated-new/);
  assert.doesNotMatch(xml, /evergreen/);
  assert.doesNotMatch(xml, /unknown/);
  assert.match(xml, /<pubDate>/);
});

test("sitemap includes source and generated pages but not 404", () => {
  const xml = buildSitemap(entries, ["articles/index.html", "tags/javascript/index.html"], site);
  assert.match(xml, /https:\/\/sethlakowske\.com\/dated-new\//);
  assert.match(xml, /https:\/\/sethlakowske\.com\/articles\//);
  assert.match(xml, /https:\/\/sethlakowske\.com\/tags\/javascript\//);
  assert.doesNotMatch(xml, /404/);
});

test("robots and 404 bodies are useful", () => {
  assert.match(buildRobots(site), /Sitemap: https:\/\/sethlakowske\.com\/sitemap\.xml/);
  const html = build404Body("404.html");
  assert.match(html, /not found/);
  assert.match(html, /href="articles\/index\.html"/);
});
