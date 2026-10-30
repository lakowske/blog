import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentType, createStaticServer, resolvePath } from "./serve.mjs";

const DUMP = path.resolve(fileURLToPath(new URL("../dump", import.meta.url)));

test("content types cover the generated file kinds", () => {
  assert.equal(contentType("a.html"), "text/html; charset=utf-8");
  assert.equal(contentType("a.css"), "text/css; charset=utf-8");
  assert.equal(contentType("feed.xml"), "application/xml; charset=utf-8");
  assert.match(contentType("a.json"), /json/);
  assert.equal(contentType("a.bin"), "application/octet-stream");
});

test("resolvePath stays inside the served root", () => {
  const root = path.resolve("/srv/dump");
  assert.equal(resolvePath(root, "/index.html"), path.join(root, "index.html"));
  assert.equal(resolvePath(root, "/tags/javascript/?q=1"), path.join(root, "tags/javascript"));
  assert.equal(resolvePath(root, "/../etc/passwd"), path.join(root, "etc/passwd"));
  assert.equal(resolvePath(root, "/%2e%2e/%2e%2e/etc/passwd"), path.join(root, "etc/passwd"));
  assert.equal(resolvePath(root, "/%E0%A4%A"), null);
});

test("preview server serves files, directories, and the 404 page", async (t) => {
  const server = createStaticServer(DUMP);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;

  const home = await fetch(`${base}/`);
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.match(await home.text(), /<h1/);

  const archive = await fetch(`${base}/articles/`);
  assert.equal(archive.status, 200);
  assert.match(await archive.text(), /article-list/);

  const page = await fetch(`${base}/articles/index.html`);
  assert.equal(page.status, 200);

  const missing = await fetch(`${base}/definitely-not-here`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Page not found/);
});
