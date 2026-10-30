# Content Authoring

This guide covers the metadata and conventions for pages under `public/`.

## Metadata

Each page has a JSON metadata comment immediately after `<body>` during Phase 1.
After Phase 2 converts pages to body fragments, the comment sits at the top of
the fragment. The catalog parser supports both forms.

```html
<body>
  <!--meta
  {
    "title": "Why Learn Haskell?",
    "type": "article",
    "date": "2016-04-25",
    "tags": ["haskell", "learning"]
  }
  -->
  <h1>Why Learn Haskell?</h1>
  ...
</body>
```

The comment is stripped from the rendered output. It is source metadata, not
part of the page.

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
| `related` | No | Array of article IDs for manual related-link overrides. |
| `scripts` | No | Array of page-specific script paths, for Phase 2. |
| `styles` | No | Array of page-specific stylesheet paths, for Phase 2. |

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
