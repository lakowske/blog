#!/usr/bin/env node
/**
 * Zero-dependency static preview server for a generated site.
 *
 * Serves directory URLs through their index.html, returns the site's
 * 404.html with a real 404 status for unknown paths, and never reads outside
 * the served root. It is a preview tool only; production is static hosting.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
};

export function contentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

/**
 * Map a request URL to a file inside `root`.
 * Returns null when the path escapes the root.
 */
export function resolvePath(root, requestUrl) {
  const pathname = String(requestUrl).split(/[?#]/)[0];
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const absolute = path.resolve(root, `.${path.posix.normalize(`/${decoded}`)}`);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    return null;
  }
  return absolute;
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function locate(root, requestUrl) {
  let filePath = resolvePath(root, requestUrl);
  if (filePath === null) {
    return { status: 400, body: "Bad request\n", type: "text/plain; charset=utf-8" };
  }

  try {
    if ((await stat(filePath)).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    // Fall through to the not-found handling below.
  }

  if (await isFile(filePath)) {
    return { status: 200, body: await readFile(filePath), type: contentType(filePath) };
  }

  const notFound = path.join(root, "404.html");
  return {
    status: 404,
    body: (await isFile(notFound)) ? await readFile(notFound) : "Not found\n",
    type: "text/html; charset=utf-8",
  };
}

export function createStaticServer(root) {
  const base = path.resolve(root);
  return createServer(async (request, response) => {
    const result = await locate(base, request.url ?? "/");
    response.writeHead(result.status, {
      "content-type": result.type,
      "cache-control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : result.body);
  });
}

export async function runServe(argv = process.argv.slice(2), io = console) {
  const portArg = argv.find((arg) => /^\d+$/.test(arg));
  const port = Number(portArg ?? process.env.PORT ?? 8090);
  const root = path.resolve(REPO_ROOT, process.env.DUMP_DIR ?? "dump");

  if (!(await isFile(path.join(root, "index.html")))) {
    io.error(`No site at ${path.relative(REPO_ROOT, root)}/. Run "npm run dump" first.`);
    process.exitCode = 1;
    return;
  }

  createStaticServer(root).listen(port, () => {
    io.log(`Serving ${path.relative(REPO_ROOT, root)}/ at http://localhost:${port}/`);
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runServe();
}
