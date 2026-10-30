import test from "node:test";
import assert from "node:assert/strict";

import {
  escapeHtml,
  formatDate,
  relativeLink,
  relativePrefix,
  renderTemplate,
} from "./site-utils.mjs";
import {
  injectRelated,
  isFullDocument,
  relatedEntries,
  renderDateLine,
  renderHeader,
  renderRelatedNav,
  renderScripts,
  renderStyles,
} from "./render.mjs";

const entry = {
  id: "articles/example",
  path: "articles/example/index.html",
  title: "Example & Title",
  type: "article",
  section: "articles",
  tags: ["haskell"],
  date: "2016-04-25",
  dateStatus: "dated",
  evergreen: false,
  showHeader: true,
  showRelated: true,
  triangles: false,
  styles: [],
  scripts: [],
};

test("formatDate handles day, month, and year precision", () => {
  assert.equal(formatDate("2016-04-25"), "2016-04-25");
  assert.equal(formatDate("2014-08"), "August 2014");
  assert.equal(formatDate("2014"), "2014");
});

test("relative paths work from root and nested pages", () => {
  assert.equal(relativePrefix("index.html"), "");
  assert.equal(relativePrefix("about/index.html"), "../");
  assert.equal(relativePrefix("articles/example/index.html"), "../../");
  assert.equal(relativeLink("articles/example/index.html", "about/index.html"), "../../about/index.html");
  assert.equal(relativeLink("index.html", "articles/example/index.html"), "articles/example/index.html");
});

test("template replacement is one pass", () => {
  assert.equal(renderTemplate("{{a}} {{b}}", { a: "{{b}}", b: "x" }), "{{b}} x");
});

test("styles and scripts include shared, triangles, and page assets", () => {
  const styles = renderStyles({ ...entry, triangles: true, styles: ["style.css"] }, "../../");
  assert.match(styles, /static\/style\/style\.css/);
  assert.match(styles, /static\/bundles\/triangles\/style\.css/);
  assert.match(styles, /href="style\.css"/);

  const scripts = renderScripts({ ...entry, triangles: true, scripts: ["bundle.js"] }, "../../");
  assert.match(scripts, /src="bundle\.js"/);
  assert.match(scripts, /static\/bundles\/triangles\/bundle\.js/);
});

test("header includes title, byline, and dated time", () => {
  const header = renderHeader(entry, "../../about/index.html", "Seth Lakowske");
  assert.match(header, /<h1 class="title">Example &amp; Title<\/h1>/);
  assert.match(header, /Posted by: <a href="..\/..\/about\/index\.html">Seth Lakowske<\/a>/);
  assert.match(header, /<time datetime="2016-04-25">2016-04-25<\/time>/);
  assert.equal(renderHeader({ ...entry, showHeader: false }, "..", "Seth"), "");
});

test("evergreen and unknown dates render no date line", () => {
  assert.equal(renderDateLine({ ...entry, dateStatus: "evergreen", date: null }), "");
  assert.equal(renderDateLine({ ...entry, dateStatus: "unknown", date: null }), "");
});

test("related nav excludes the current page and includes tag matches", () => {
  const self = { ...entry, id: "articles/example", path: entry.path, title: "Self" };
  const about = {
    ...entry,
    id: "about",
    path: "about/index.html",
    title: "About",
    type: "page",
    section: "pages",
    tags: [],
  };
  const other = {
    ...entry,
    id: "articles/other",
    path: "articles/other/index.html",
    title: "Other & More",
    tags: ["haskell"],
  };
  const nav = renderRelatedNav(entry, [self, about, other], entry.path);
  assert.doesNotMatch(nav, /Self/);
  assert.match(nav, /Other &amp; More/);
  assert.match(nav, /href="\.\.\/other\/index\.html"/);
  assert.match(nav, /<nav id="related" class="related"/);
});

test("related scoring uses manual overrides, tags, and section", () => {
  const source = { ...entry, tags: ["a", "b"], related: ["manual"] };
  const manual = { ...source, id: "manual", path: "articles/manual/index.html", title: "Manual", tags: [] };
  const strong = { ...source, id: "strong", path: "articles/strong/index.html", title: "Strong", tags: ["a", "b"], date: "2020-01-01" };
  const weak = { ...source, id: "weak", path: "articles/weak/index.html", title: "Weak", tags: ["a"], date: "2021-01-01" };
  const sectionOnly = { ...source, id: "section", path: "articles/section/index.html", title: "Section", tags: [], date: "2022-01-01" };
  const page = { ...source, id: "about", path: "about/index.html", title: "About", type: "page", section: "pages", tags: [] };

  const related = relatedEntries(source, [source, manual, strong, weak, sectionOnly, page]);
  assert.deepEqual(related.map((item) => item.id), ["manual", "strong", "weak", "section"]);
});

test("raw related injection and full-document detection", () => {
  const raw = '<html><body><table id="related"></table></body></html>';
  assert.equal(isFullDocument(raw), true);
  assert.equal(isFullDocument('<p>fragment</p>'), false);
  assert.match(injectRelated(raw, "<table>new</table>"), /<table>new<\/table>/);
});

test("escapeHtml protects text and attributes", () => {
  assert.equal(escapeHtml('a & b < c "d"'), "a &amp; b &lt; c &quot;d&quot;");
});
