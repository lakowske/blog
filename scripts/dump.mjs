#!/usr/bin/env node
/**
 * Build the whole site: validate metadata, write dump/catalog.json, then render.
 *
 * One entry point so the build does not depend on shell chaining and so
 * `node --watch` can restart the entire pipeline.
 */
import { runCatalog } from "./catalog.mjs";
import { runRender } from "./render.mjs";

await runCatalog(["--clean", "--out", "dump/catalog.json"]);
if (process.exitCode) {
  process.exit(process.exitCode);
}

await runRender([]);
