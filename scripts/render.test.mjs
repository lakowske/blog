import test from "node:test";
import assert from "node:assert/strict";

import {
  escapeHtml,
  formatDate,
  injectRelated,
  isFullDocument,
  relativeLink,
  relativePrefix,
  renderDateLine,
  renderHeader,
  renderRelatedTable,
  renderScripts,
  renderStyles,
  renderTemplate,
} from "./render.mjs";

const entry = {
  path: "articles/example/index.html",
  title: "Example & Title",
  type: "article",
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

test("related table excludes the current page and escapes titles", () => {
  const table = renderRelatedTable(
    entry,
    [
      { path: entry.path, title: "Self" },
      { path: "about/index.html", title: "About" },
      { path: "articles/other/index.html", title: "Other & More" },
    ],
    entry.path,
  );
  assert.doesNotMatch(table, /Self/);
  assert.match(table, /Other &amp; More/);
  assert.match(table, /href="\.\.\/other\/index\.html"/);
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
