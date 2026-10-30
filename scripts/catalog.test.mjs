import test from "node:test";
import assert from "node:assert/strict";

import {
  datePrecision,
  deriveId,
  deriveUrl,
  isValidDate,
  sortEntries,
  truncateSummary,
  validateMetadata,
} from "./catalog.mjs";

const site = {
  tags: ["haskell", "learning"],
  baseUrl: "https://sethlakowske.com",
  description: "Site description",
};

test("deriveId and deriveUrl handle root and nested pages", () => {
  assert.equal(deriveId("index.html"), "index");
  assert.equal(deriveId("about/index.html"), "about");
  assert.equal(deriveId("articles/why-learn-haskell/index.html"), "articles/why-learn-haskell");
  assert.equal(deriveUrl("index"), "/");
  assert.equal(deriveUrl("about"), "/about/");
});

test("isValidDate accepts full, partial, and rejects invalid dates", () => {
  assert.equal(isValidDate("2014"), true);
  assert.equal(isValidDate("2014-08"), true);
  assert.equal(isValidDate("2014-05-15"), true);
  assert.equal(isValidDate("2014-02-30"), false);
  assert.equal(isValidDate("2014-13"), false);
  assert.equal(isValidDate("2021-06-1"), false);
  assert.equal(datePrecision("2014"), "year");
  assert.equal(datePrecision("2014-08"), "month");
  assert.equal(datePrecision("2014-05-15"), "day");
});

test("truncateSummary does not split at dots inside words", () => {
  const summary = truncateSummary("node.js is useful. It is fast.", 20);
  assert.match(summary, /^node\.js is useful/);
  assert.doesNotMatch(summary, /node\. js/);
});

test("validateMetadata distinguishes dated, evergreen, and unknown articles", () => {
  const undatedHtml = "<html><head><title>T</title></head><body></body></html>";
  const datedHtml =
    '<html><head><title>T</title></head><body><time datetime="2020-01-01">2020-01-01</time></body></html>';

  const dated = validateMetadata({
    rel: "a/index.html",
    metadata: { title: "T", type: "article", date: "2020-01-01", tags: ["haskell"] },
    html: datedHtml,
    site,
  });
  assert.equal(dated.errors.length, 0);
  assert.equal(dated.warnings.length, 0);

  const evergreen = validateMetadata({
    rel: "b/index.html",
    metadata: { title: "T", type: "article", date: null, evergreen: true, tags: ["haskell"] },
    html: undatedHtml,
    site,
  });
  assert.equal(evergreen.errors.length, 0);
  assert.equal(evergreen.warnings.length, 0);

  const unknown = validateMetadata({
    rel: "c/index.html",
    metadata: { title: "T", type: "article", date: null, evergreen: false, tags: ["haskell"] },
    html: undatedHtml,
    site,
  });
  assert.equal(unknown.errors.length, 0);
  assert.equal(unknown.warnings.some((warning) => warning.kind === "unknownDate"), true);
});

test("sortEntries puts dated first, then evergreen, then unknown", () => {
  const entries = [
    { id: "unknown", dateStatus: "unknown", date: null },
    { id: "evergreen", dateStatus: "evergreen", date: null },
    { id: "old", dateStatus: "dated", date: "2020-01-01" },
    { id: "new", dateStatus: "dated", date: "2024-01-01" },
  ];
  assert.deepEqual(
    sortEntries(entries).map((entry) => entry.id),
    ["new", "old", "evergreen", "unknown"],
  );
});
