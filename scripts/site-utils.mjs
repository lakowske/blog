/**
 * Shared pure helpers for the renderer and generated site pages.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeXml(value) {
  return escapeHtml(value);
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

/**
 * Normalize a partial ISO date to YYYY-MM-DD for feeds and sitemaps.
 */
export function fullDate(date) {
  if (!date) {
    return "";
  }
  if (date.length === 10) {
    return date;
  }
  if (date.length === 7) {
    return `${date}-01`;
  }
  return `${date}-01-01`;
}

export function rssDate(date) {
  const normalized = fullDate(date);
  if (!normalized) {
    return "";
  }
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toUTCString();
}

export function relativePrefix(pagePath) {
  const dir = pathPosixDirname(pagePath);
  if (dir === "." || dir === "") {
    return "";
  }
  return "../".repeat(dir.split("/").length);
}

export function relativeLink(fromPath, toPath) {
  return pathPosixRelative(pathPosixDirname(fromPath), toPath) || toPath;
}

export function renderTemplate(template, vars) {
  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "",
  );
}

export function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function pathPosixDirname(value) {
  const parts = value.split("/");
  parts.pop();
  return parts.length === 0 ? "." : parts.join("/");
}

function pathPosixRelative(fromDir, toPath) {
  const from = fromDir === "." ? [] : fromDir.split("/");
  const to = toPath.split("/");
  while (from.length > 0 && to.length > 0 && from[0] === to[0]) {
    from.shift();
    to.shift();
  }
  return [...from.map(() => ".."), ...to].join("/") || ".";
}
