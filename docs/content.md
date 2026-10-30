# Content Authoring

This guide covers the metadata and conventions for pages under `public/`.

## Metadata

The standard content file is a JSON metadata comment plus a raw HTML body
fragment. The fragment does not contain `<!DOCTYPE>`, `<html>`, `<head>`, or
`<body>`; the renderer supplies the document envelope.

```html
<!--meta
{
  "title": "Why Learn Haskell?",
  "type": "article",
  "date": "2016-04-25",
  "tags": ["haskell", "learning"]
}
-->
<p>Haskell is a language that is foreign to most programmers...</p>
<h2>Why it is worth learning</h2>
<ul>
  <li>Type system improves correctness...</li>
</ul>
```

The comment is stripped from the rendered output. It is source metadata, not
part of the page. The body can contain any HTML: sections, lists, tables,
images, SVG, canvas, custom elements, inline styles, `<style>`, or `<script>`.

A complete HTML document is allowed only with `layout: "raw"`. See
[Layouts](#layouts).

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Plain text. Should match the page `<title>` during Phase 1. |
| `type` | Yes | `article` or `page`. |
| `date` | Articles | `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, or `null`. |
| `evergreen` | No | `true` for intentionally undated articles. Do not combine with `date`. |
| `tags` | Articles | Array of tags from `site.json`. |
| `summary` | No | Plain-text override. If absent, one is derived from the first paragraph. |
| `updated` | No | Same date formats as `date`. |
| `layout` | No | `article` (default), `page`, `bare`, a named layout, or `raw`. |
| `bodyClass` | No | Extra class on `<body>` for page-specific CSS. |
| `showHeader` | No | `false` hides the default title/byline/date header. |
| `showRelated` | No | `false` omits the related table. |
| `triangles` | No | `true` enables the triangles background CSS and script. |
| `related` | No | Array of article IDs for manual related-link overrides. |
| `scripts` | No | Array of page-specific script paths or external URLs. |
| `styles` | No | Array of page-specific stylesheet paths. |

`title` and `type` are required. Articles must declare either a `date` or
`evergreen: true`.

## Date policy

There are three states:

1. **Dated** — the article is tied to a time and the date is shown as a cue:

   ```json
   { "type": "article", "date": "2016-04-25" }
   ```

2. **Evergreen** — the article is intentionally timeless; no date is shown:

   ```json
   { "type": "article", "date": null, "evergreen": true }
   ```

3. **Time-bound, date unknown** — the article is tied to a time, but the date
   is not known yet. No date is shown, and the validator warns:

   ```json
   { "type": "article", "date": null, "evergreen": false }
   ```

Pages (`type: page`) do not need a date.

Partial dates are valid and display without false precision:

- `2014` → year
- `2014-08` → month
- `2014-05-15` → day

## Layouts

Most pages should use the standard envelope.

- **`article`** (default for `type: article`): shared head and styles, title,
  byline, date if dated, and the related table.
- **`page`** (default for `type: page`): shared head and styles, content, and
  the related table. The page content owns its visible heading.

Use an exception only when the standard envelope does not fit:

- **`bare`**: shared head and styles, but no title, byline, date, or related
  table.
- **Named layout**: set `layout` to a file name under
  `templates/layouts/`. The layout can customize the envelope.
- **`raw`**: the source file is a complete HTML document. The renderer copies
  it as-is (stripping the metadata comment) and still catalogs it. It does not
  add the shared head, styles, or related table. Include a `#related` marker if
  you want related links injected.

Examples:

```json
{ "type": "article", "layout": "bare" }
```

```json
{
  "type": "article",
  "layout": "demo",
  "styles": ["demo.css"],
  "scripts": ["demo.js"]
}
```

A raw document puts the metadata comment inside `<body>` so the catalog can
still read it:

```html
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>
  <!--meta
  {
    "title": "Full-screen WebGL experiment",
    "type": "article",
    "layout": "raw"
  }
  -->
  <canvas id="scene"></canvas>
  <script src="scene.js"></script>
</body>
</html>
```

`scripts` and `styles` are document-relative to the page. External URLs are
allowed. `bodyClass`, `showHeader: false`, and `showRelated: false` are available
for smaller adjustments without creating a new layout.

## Tags

The allowed tags live in `site.json`. The starter vocabulary is:

```
haskell, javascript, nodejs, browserify, docker, kubernetes, webgl, emacs,
linux, trading, solar, philosophy, learning, career, search, hardware,
audio, testing, biking
```

- Lowercase and singular.
- Articles should have at least one tag.
- Unknown tags are warnings, so the vocabulary can evolve.

## Summaries

Summaries are optional overrides. When `summary` is absent, the catalog derives
one from the first meaningful paragraph or list item. Add a manual summary when
the first paragraph is a code sample, a requirements list, or otherwise a poor
excerpt.

## Catalog

`dump/catalog.json` is generated on every build from the metadata. It is never
committed and is served with `Cache-Control: no-cache`.

It contains:

- `version` — a SHA-256 hash of the catalog entries
- `count` — total entries
- `counts` — pages, articles, dated, evergreen, unknown date
- `pages` — one entry per public page

Each entry has `path` (relative to the site root, portable across both hosts),
`url` (root-relative canonical URL), and `canonicalUrl` (full custom-domain URL).
Use `path` when building links that must work on the GitHub Pages mirror.

Do not edit `catalog.json` by hand. Change the metadata and rebuild.

## Commands

```sh
npm run catalog          # validate metadata
npm run catalog:report   # validate and print titles, dates, and summaries
npm run dump             # validate, generate catalog.json, build the site
npm test                 # build, dump, catalog validation, output checks
```

## Adding a page

1. Create `public/<section>/<slug>/index.html`.
2. Add the metadata comment immediately after `<body>`.
3. Use document-relative links so the GitHub Pages mirror keeps working.
4. Run `npm run catalog:report` and `npm test`.
5. Preview with `npm run preview` after `npm run dump`.

Drafts should live in `private/`, which is not built or published.

## Related documents

- [Deployment](deployment.md)
- [Planning](planning/README.md)
- [Future source HTML validation](planning/002-source-html-validation.md)
