# 001 — Site Restructure Plan

**Status:** Phases 0–4 complete. Phase 5 (cutover and verification) not started.
Future work is tracked as features in the [planning README](README.md), not as
Phase 6+.
**Created:** 2026-10-29
**Owner:** Seth Lakowske
**Companion:** [implementation-log.md](implementation-log.md)
**Deployment:** [../deployment.md](../deployment.md)

---

## 1. Purpose

The blog works, but its structure has drifted. Every page carries its own
document chrome, metadata is inconsistent or missing, and the "related" section
is a flat list of every page in the site. That makes consistency work manual and
blocks automated transformations such as archives, tag pages, feeds, and
meaningful related links.

This plan separates content from presentation, makes metadata explicit, and
generates navigation from that metadata — while keeping the site static,
portable, and dependency-light.

## 2. Goals

- **One page structure.** Every article and page shares the same head, header,
  byline, footer, and asset loading.
- **Explicit metadata.** Title, date, tags, summary, and content type live with
  the content and are validated at build time.
- **Meaningful related links.** Generated from tags, section, and recency;
  never self-referential; deterministic.
- **Automation-ready.** A catalog of pages can drive related links, an archive,
  tag pages, a feed, a sitemap, and a 404 page.
- **Portable and boring.** Plain files in git, a small Node build script, no
  framework, no CMS, and as few dependencies as possible.
- **Incremental delivery.** Each phase can ship on its own and be rolled back
  without undoing the others.

## 3. Non-goals

- A visual redesign. The current look should survive this plan; redesign is a
  separate effort.
- A CMS, database, or hosted build service.
- Rewriting article prose beyond metadata and markup normalization.
- Changing the domain or hosting provider.
- Adding comments, analytics, or client-side search.

## 4. Constraints

- The canonical site is hosted on Cloudflare Workers & Pages at
  `https://sethlakowske.com`, built with `npm run build; npm run dump` from
  `master`. See [../deployment.md](../deployment.md).
- A GitHub Pages mirror at `https://lakowske.github.io/blog/` must keep working
  for bookmarked URLs. This requires document-relative links.
- Existing URLs must keep working on both hosts. Any URL that must change needs
  a redirect.
- The legacy Node server and the `blog.service`/`cloudflare.service` files are
  not the production deployment.
- Content stays as plain files in git and must remain readable without a build.
- The build must be reproducible and independent of the current working
  directory.
- No new runtime dependencies unless a phase explicitly justifies one.

## 5. Baseline (2026-10-29)

| Metric | Value |
| --- | --- |
| Canonical host | Cloudflare Workers & Pages (`sethlakowske.com`) |
| Mirror | GitHub Pages (`lakowske.github.io/blog/`) |
| Cloudflare build | `npm run build; npm run dump` |
| HTML pages | 37 |
| Source lines (`src/*.ts`) | 540 |
| Packages in lockfile | 89 |
| Audit advisories | 7 (1 critical, 5 high, 1 low) |
| Tracked files in `dump/` | 71 (~9.8 MB) |
| Pages with a publish date | 17 / 37 |
| Pages with a related table | 36 / 37 |
| Pages with a meta description | 0 / 37 |
| Pages with a canonical URL | 0 / 37 |
| Broken internal links | 2 |
| Pages loading triangles CSS | 30 |
| Pages loading triangles JS | 17 |
| Pages using `language-*` code classes | 10 |
| Pages loading Prism CSS | 3 (one path broken) |
| Pages loading Prism JS | 0 |

Additional baseline facts:

- `master` is level with `origin/master`; one uncommitted edit exists in
  `public/articles/conscious-cosmos-and-personal-reality/index.html`.
- `npm ci`, `npm run build`, and a dump into a temporary directory all succeed
  on Node 22.
- The committed `dump/` is already stale: regenerating it changes
  `dump/articles/java-to-haskell-in-zero-days/index.html` because the last
  commit edited `public/` without re-dumping.
- The dev server maps `/` to `about/index.html`, while the Cloudflare
  deployment serves `index.html` at `/`. Development and production home pages
  differ.
- GitHub Pages reports `cname: null`; the custom domain is not attached to it.
- The canonical site returns the home page with HTTP 200 for unknown paths,
  `/robots.txt`, and `/sitemap.xml`.
- `blog.service` and `cloudflare.service` are not installed on the Pi or
  `ubuntu-box`; they are legacy files.
- A separate old checkout on `ubuntu-box` (`/home/seth/Software/blog`) has 38
  uncommitted changes and is not serving production.

The detailed findings inventory is in [Appendix A](#appendix-a--findings-inventory).

## 6. Target structure

```
public/
  articles/
    why-learn-haskell/
      index.html          # body fragment + front matter (Phase 2)
      diagram.png
  software/
    writing-software/
      index.html
  about/
    index.html
  resume/
    index.html
  static/
    style/
    images/
    bundles/
templates/
  base.html               # doctype, head, nav, main, footer
  article.html            # article-specific slots
  page.html               # static page slots
scripts/
  build.mjs               # zero-dependency build
  check.mjs               # zero-dependency validator
dump/                     # generated; gitignored
```

Design rules:

- `public/` keeps its name. The Cloudflare and GitHub Pages builds depend on it,
  so renaming it would require changing external build settings. In Phase 2 it
  becomes the source of body fragments and assets rather than the rendered site.
- `dump/` keeps its name and becomes generated-only and untracked.
- `templates/` holds the only copy of the document chrome.
- `scripts/` holds the build and validator.
- Assets stay under `public/static/` and are emitted to `dump/static/` so
  existing asset URLs do not change.
- URLs are preserved by keeping the same output paths
  (`/articles/<slug>/index.html`, `/software/<slug>/index.html`, etc.).
- Links stay document-relative so the GitHub Pages `/blog/` mirror keeps
  working.
- A future rename to `content/`/`site/` is possible but is not part of this
  plan; it would require updating the Cloudflare build settings.

## 7. Phase overview

| Phase | Name | Primary outcome | Depends on | Status |
| --- | --- | --- | --- | --- |
| 0 | Baseline and guardrails | Safe, repeatable changes; CI checks; generated output untracked | — | Done (PR #3, `d4331b2`) |
| 1 | Metadata and catalog | Every page has validated metadata; deterministic catalog | 0, D2, D3, D15–D17 | Done (PR #4, `8882a01`) |
| 2 | Templates and normalization | Standard article/page layouts; fragments; explicit bare/custom/raw exceptions | 1, D18 | Done (PR #5, `399cfb3`) |
| 3 | Generated navigation | Related links, archive, tags, feed, sitemap, 404 | 2, D4, D7, D8, D19–D21 | Done (PR #6, `cb975c9`) |
| 4 | Dependency and code cleanup | Zero runtime dependencies; dead code removed; docs accurate | 2, 3, D5, D6, D9 | Done (PR #7, `8e8cdaf`; D9 deferred) |
| 5 | Cutover and verification | Production verified; plan closed; deviations logged | 0–4 | Not started |

Phase numbers are historical. Phases 0–4 are complete and Phase 5 closes the
restructure. Do not add Phase 6: new work is registered as a feature (`F-NNN`)
in the [planning README](README.md), because features are picked up in an order
we do not know in advance. Dependencies between features are explicit; a feature
number does not imply sequence.

## 8. Phase details

### Phase 0 — Baseline and guardrails

**Goal:** Make the repository safe to change and establish a repeatable check
before any structural work begins.

**Tasks**

- [x] Commit the planning documents after approval.
- [x] Commit the pending edit to the conscious-cosmos page.
- [x] Document the real deployment in `docs/deployment.md`:
  - Cloudflare Workers & Pages as the canonical host;
  - GitHub Pages as the mirror;
  - build command, output directory, Node version, and URL policy;
  - legacy `blog.service`/`cloudflare.service` files;
  - known SPA-fallback, `robots.txt`, and `sitemap.xml` behavior.
- [x] Add `dump/` to `.gitignore` and run `git rm -r --cached dump`. Keep
  generating `.nojekyll` and `CNAME` for now.
- [x] Add `.nvmrc` (Node 22) and an `engines.node` field. Align the CI
  `node-version` with the local version. Document any Cloudflare `NODE_VERSION`
  requirement.
- [x] Add `scripts/check.mjs`, a zero-dependency validator with two severities:
  - errors: broken internal links, duplicate `id` attributes, missing `<title>`;
  - warnings: missing date, byline, related placeholder, meta description.
  - Keep a short allowlist for the two known-broken WebGL links; remove it in
    Phase 2.
- [x] Add `npm test` = `npm run build && npm run dump && node scripts/check.mjs dump`.
- [x] Add `.github/workflows/ci.yml` for pull requests and pushes.
- [x] Run `node scripts/check.mjs dump` in the deploy workflow after `npm run dump`.
- [x] Leave `src/server.ts` untouched. The server is legacy; decide its fate in
  Phase 4 (D6).
- [x] Record the baseline validator output and deployment verification in the
  implementation log.

**Deliverables**

- `docs/deployment.md`.
- CI validation step.
- Baseline log entry.
- `dump/` no longer tracked.
- Pinned Node version.

**Acceptance criteria**

- `npm ci && npm run build && npm test` passes from a clean checkout.
- `git status` is clean after a build.
- CI passes on a pull request.
- The Cloudflare build command and output directory are unchanged and still
  work.
- The GitHub Pages mirror still serves the same URLs.
- No content or template changes.

**Risks / rollback**

- Removing the tracked `dump/` is safe because both deployments regenerate it.
  If the Cloudflare project is ever changed to serve a committed `dump/`, restore
  it from git history.
- The validator may flag legacy issues. Keep the error/warning split and promote
  warnings in Phase 2.
- `CNAME` is ambiguous: GitHub Pages reports no custom domain, but the file is
  still generated. Leave it for now and revisit in Phase 5.

**Status:** Done — merged as `d4331b2`. CI, GitHub Pages, Cloudflare, the
canonical site, and the mirror verified. See the
[implementation log](implementation-log.md) for details.

---

### Phase 1 — Metadata and catalog

**Goal:** Give every page explicit, validated metadata so later phases can
generate navigation and site pages without guessing.

**Tasks**

- [x] Confirm the metadata format (D2: HTML comment) and authoring format
  (D3: HTML fragments).
- [x] Add `site.json` at the repository root with the site title, author, base
  URL, tag vocabulary, and navigation.
- [x] Define the schema:
  - required: `title`, `type` (`article` or `page`);
  - articles: `date` as `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`, or `date: null`;
  - `evergreen: true` marks intentionally undated articles;
  - `date: null` without `evergreen` means “time-bound, date unknown” and
    produces a warning;
  - `tags`: controlled vocabulary, required for articles (warning until filled);
  - `summary`: optional; generated from the first paragraph when absent;
  - optional: `updated`, `draft`, `related`, `scripts`, `styles`.
- [x] Write a one-off migration script that:
  - inserts the metadata comment as the first child of `<body>`;
  - infers titles from `<title>` and dates from `<time>`;
  - applies the agreed date and tag mapping;
  - reports pages that still need manual metadata.
- [x] Add visible dates to the four time-bound pages:
  - `technology/silent-am1h-itx-development-workstation`: `2014-05-15`
  - `electric-bike-article-on-madisonbikelife`: `2014-08`
  - `think-again`: `2013-05`
  - `completed-ml-class-org-course`: `2012-01`
- [x] Mark the five evergreen articles with `date: null` and
  `evergreen: true`:
  - `logical-validity-explained`
  - `software/writing-software`
  - `articles/why-i-love-emacs-lisp`
  - `articles/conscious-cosmos-and-personal-reality`
  - `articles/traveling-without-moving`
- [x] Mark the eight time-bound articles with unknown dates as
  `date: null`, `evergreen: false`:
  - `slurp-some-nodejs-streams`
  - the seven technical `software/` posts (eventemitter, use-http-browserify,
    node-js-closing-jsonstream, singleton-factory, cross-environment-requirejs,
    use-grunt-uglifyjs, sequelize-unit-testing).
- [x] Normalize dates: `2021-06-1` becomes `2021-06-01`; replace obsolete
  `pubdate` with `datetime`; allow partial ISO dates.
- [x] Implement `scripts/catalog.mjs` with pure functions and a single
  `main()`:
  - parse metadata comments and validate them;
  - derive `id`, `url`, `section`, `dateStatus`, and an effective summary;
  - build the catalog in a deterministic order;
  - support `--check`, `--out`, `--clean`, `--report`, and `--strict`;
  - write `catalog.json` with a content hash and count;
  - verify every public HTML page maps to exactly one catalog entry.
- [x] Generate a `_headers` entry so `/catalog.json` is served with
  `Cache-Control: no-cache`.
- [x] Integrate catalog validation into `npm run dump` and `npm test`.
- [x] Update `scripts/check.mjs` to accept partial ISO dates.
- [x] Strip the metadata comment from rendered HTML in `Content.load()`.
- [x] Add `docs/content.md` as the authoring guide for metadata, tags, dates,
  summaries, and validation commands.
- [x] Record the metadata and summary report in the implementation log.

**Deliverables**

- `site.json`.
- Metadata on all 37 pages.
- `scripts/catalog.mjs` and `dump/catalog.json`.
- `docs/content.md`.
- A metadata and summary report.

**Acceptance criteria**

- 37 / 37 pages pass metadata validation.
- `catalog.json` contains every public HTML page exactly once, is sorted
  deterministically, and includes a version hash and count.
- Running the build twice produces byte-identical `catalog.json`.
- The build fails on missing title/type, invalid dates, duplicate IDs, or
  unknown types.
- Missing tags, missing summaries, unknown dates, and title/date mismatches are
  warnings.
- `npm test` passes.
- URLs do not change.
- Metadata comments do not appear in the rendered output.

**Risks / rollback**

- Metadata comments inserted into full HTML pages must not break rendering. They
  sit as the first child of `<body>` and are stripped before serialization.
- Evergreen and unknown-date articles are both undated but mean different
  things. `evergreen: true` is required for intentional omissions; the absence
  of a date elsewhere is a warning, not an error.
- Generated summaries are derived at build time when no manual summary exists.
  Add a `summary` override where the first paragraph makes a poor excerpt.
- Catalog completeness depends on the source walk; a page added without
  metadata fails the build.

**Status:** Done — merged as `8882a01`. CI, Cloudflare, the canonical site,
the mirror, and the catalog verified. See the
[implementation log](implementation-log.md) for details.

---

### Phase 2 — Templates and page normalization

**Goal:** Keep exactly one copy of the document chrome and make every page use
the standard article or page envelope, while preserving an explicit escape
hatch for pages that need a custom document.

**Tasks**

- [x] Keep the `public/` → `dump/` build contract. Do not rename the source or
  output directories in this phase.
- [x] Add `scripts/render.mjs`, a zero-dependency renderer that uses the Phase 1
  catalog metadata and templates.
- [x] Add `templates/base.html`, `templates/article.html`,
  `templates/page.html`, and `templates/layouts/bare.html`.
- [x] Support the D18 layout model in metadata:
  - `layout`: `article` (default), `page`, `bare`, a named layout under
    `templates/layouts/`, or `raw`;
  - `bodyClass`, `showHeader`, `showRelated`, `scripts`, `styles`.
- [x] Extend the catalog entry with the render fields so the renderer and future
  transformations share one source of truth.
- [x] Convert the 37 pages to body fragments in batches:
  - remove `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, title, byline, date,
    `.entry-content`, and outer `<article>`/`<header>` wrappers;
  - extract per-page scripts and styles into metadata;
  - set `triangles: true` only on the pages that currently load the triangles
    script;
  - remove Prism stylesheet links;
  - fix the malformed pages and demote extra `<h1>` headings.
- [x] Preserve the current related table in Phase 2. Phase 3 changes both the
  selection algorithm and the markup.
- [x] Add `meta name="description"`, canonical, and Open Graph tags from the
  catalog.
- [x] Add `data-type` and `data-date-status` attributes to the rendered
  envelope, and teach `scripts/check.mjs` to suppress intentional warnings for
  pages, evergreen posts, and unknown-date posts.
- [x] Preserve the current look. Capture before/after screenshots of
  representative pages with headless Chrome and report any exceptions.
- [x] Update `docs/content.md` with the layout modes, metadata fields, and
  examples.
- [x] Keep URLs unchanged; no redirects expected.

**Deliverables**

- `scripts/render.mjs` and templates.
- Body-fragment content files.
- A migration report listing any page that does not use the standard layout.
- Before/after screenshots of representative pages.

**Acceptance criteria**

- Default content files contain no `<!DOCTYPE>`, `<head>`, or `<body>`.
  Complete documents are allowed only with `layout: "raw"` and are listed in
  the migration report.
- Every article uses the standard `article` layout unless explicitly listed as
  a `bare`, custom, or `raw` exception.
- Every article has one `<h1>` equal to its title. Page heading behavior is
  deferred to Phase 3.
- Every page loads the shared stylesheet. Triangles are explicit opt-in; Prism
  is removed.
- Metadata comments do not appear in the rendered output.
- Description, canonical, and Open Graph tags are present.
- All URLs are unchanged and both deployment hosts work.
- `npm test` passes, and the output checker warnings are reduced to the
  intentional page exceptions.

**Risks / rollback**

- The renderer replaces the legacy dump path. `serve` becomes a static preview
  of `dump/`; the old TypeScript/jsdom server is unused until Phase 4.
- Source fragments are not standalone documents; preview them through
  `npm run dump` and `npm run preview`.
- The jsdom migration can repair malformed source. Review the fragment diffs and
  keep 002 (source HTML validation) in mind.
- Raw pages lose the shared chrome, related links, and automatic head metadata.
  Use them only when the standard envelope genuinely does not fit.
- Relative asset paths are sensitive to the page depth. Compute template asset
  URLs from the page path and verify both hosts.

**Status:** Done — merged as `399cfb3`. CI, Cloudflare, the canonical site, the
mirror, and all 37 URLs verified. See the
[implementation log](implementation-log.md) for details.

---

### Phase 3 — Generated navigation and site pages

**Goal:** Replace the all-pages related table with meaningful related links,
an archive, tag pages, a feed, a sitemap, a 404 page, and consistent nav/footer
and page headings.

**Tasks**

- [x] Implement D7 related scoring:
  - `3 × shared tags + 1 if same section`;
  - section bonus only for `articles`, `software`, and `technology`;
  - exclude self and `type: page`;
  - manual `related` overrides first; dedupe; max 5;
  - fill to 3 with recent articles, same section first.
- [x] Fix `deriveSection`: top-level articles are `root`, pages are `pages`.
- [x] Render related links as `<nav id="related" class="related">` with a list.
- [x] Add a “Tags: …” line to articles and tag links.
- [x] Generate the archive at `/articles/` as one list: dated newest first,
  then evergreen, then date-unknown articles, with dates shown only where
  known; follow it with a tag index.
- [x] Generate `/tags/<tag>/` for all used tags.
- [x] Home: profile + the last 10 dated posts + all 5 evergreen posts in one
  list, plus “All articles” links.
- [x] Remove related tables from pages; pages use the archive and nav.
- [x] Add the approved nav and footer: Home · About · Articles · Resume.
- [x] Add the `heading` field and render one h1 for Home/About/Resume.
- [x] Generate an RSS 2.0 `/feed.xml` with dated articles only.
- [x] Generate `sitemap.xml` and `robots.txt`.
- [x] Generate a top-level `404.html`; no `_redirects` for 404.
- [x] Generate archive/tag/404 pages synthetically from templates, not the
  content catalog.
- [x] Update the checker: one h1 for pages, skip related for pages, validate
  generated pages.
- [x] Verify `file://` access and `npm run preview`.
- [x] Keep internal links document-relative for the `/blog/` mirror; feed and
  sitemap use canonical absolute URLs.

**Deliverables**

- Related navigation, tags, archive, tag pages.
- Home combined recent/evergreen list.
- Nav/footer and page headings.
- RSS 2.0 feed, sitemap, robots, 404.
- Updated tests and authoring docs.

**Acceptance criteria**

- Every article shows 3–5 related links, never itself, never a page.
- The archive lists all 34 articles in one list, with dates where known, plus
  all used tags.
- Each of the 19 used tags has a page.
- Home shows the last 10 dated + all 5 evergreen articles in one list and a
  link to all articles.
- RSS 2.0 validates and contains the dated articles only.
- The sitemap contains every public source and generated page except 404.
- A top-level `404.html` is served for unknown paths on both hosts.
- Every page has one h1; pages use the `heading` field.
- `npm test` passes with 0 output-checker warnings.
- `file://.../dump/index.html` works, and `npm run preview` serves the same
  pages.

**Risks / rollback**

- Tags are broad (`javascript` has 14 articles); scoring favors multiple shared
  tags, but fallbacks ensure 3–5 links.
- Cloudflare Pages serves `404.html` automatically when it exists. If a
  `_redirects` SPA rule exists in the deployed output, remove it.
- RSS 2.0 excludes evergreen/unknown-date posts until they have dates.
- `file://` does not resolve directory URLs; nav/archive/tag links must use
  explicit `index.html` paths.

**Status:** Done — merged as `cb975c9`. CI, Cloudflare, the canonical site, the
mirror, all 57 sitemap URLs, the feed, and the 404 verified. See the
[implementation log](implementation-log.md) for details.

---

### Phase 4 — Dependency and code cleanup

**Goal:** Remove dependencies and dead code that the new build no longer needs.

**Tasks**

- [x] Remove `jsdom`. After Phases 2 and 3, the build owns the templates and
  metadata, so no DOM parsing is required.
- [x] Remove `dotenv`; the build needs no environment file.
- [x] Replace `mime` with a small extension map in the preview server.
- [x] Replace `nodemon` with `node --watch`.
- [x] Decide TypeScript vs plain ESM (D5): plain ESM only.
- [x] Remove the legacy server and its dead code (`src/`, `tsconfig.json`,
  `storeIndex`, `loadIndexFromCache`, `isCached`, `loadFromCache`, `embeddings`,
  `cacheDir`, `addRelated`, `getHtmlTitles`, the unused `links` result).
- [x] Add `scripts/dump.mjs` as the single build entry point, so the build no
  longer depends on shell chaining.
- [x] Add a zero-dependency preview server, `scripts/serve.mjs`, replacing the
  `python3 -m http.server` preview.
- [x] Update the README to match reality: commands, directory layout,
  environment variables, and deployment.
- [x] Remove the unused `blog.service` and `cloudflare.service` files.
- [x] Remove the unused `.dockerignore` (no Dockerfile exists) and the `dist`
  ignore rule.
- [x] Confirm `npm audit` is clean.
- [ ] Resolve the `private/` directory (D9) — deferred by Seth; Phase 4 leaves
  it tracked and unpublished.

**Deliverables**

- Zero runtime dependencies.
- Accurate README.
- No unused exports.

**Acceptance criteria**

- `npm ci` installs nothing but the project itself.
- `npm audit` reports no vulnerabilities.
- The build works from a clean checkout with no environment file.
- README instructions reproduce the build and preview.

**Risks / rollback**

- Removing TypeScript is a larger diff than removing a library. It is now a pure
  deletion; `master` keeps the old files in history.
- Keep the `pre-removal` tag and branch so the cleanup can be reverted
  independently.

**Status:** Done — merged as `8e8cdaf`. CI, Cloudflare, the canonical site, all
57 sitemap URLs, the feed, and the 404 verified. D9 remains deferred. See the
[implementation log](implementation-log.md) for details.

---

### Phase 5 — Cutover and verification

**Goal:** Ship the restructured site and confirm nothing regressed.

**Tasks**

- [ ] Run the full validation suite.
- [ ] Verify the Cloudflare canonical deployment:
  - custom domain and HTTPS;
  - home page, archive, a sample of articles, tag pages;
  - `404.html`, `robots.txt`, `feed.xml`, `sitemap.xml`;
  - unknown paths return HTTP 404, not the home page with 200.
- [ ] Verify the GitHub Pages mirror at `/blog/`:
  - the same sample pages;
  - document-relative links resolve;
  - bookmarked `index.html` and directory URLs both work.
- [ ] Spot-check ten pages on desktop and mobile widths.
- [ ] Confirm the legacy Pi/ubuntu-box services are not used; remove them if so.
- [ ] Record final metrics: page count, build time, install size, dependency
  count.
- [ ] Write the post-implementation review in the log.
- [ ] Mark this plan complete and note any follow-up plans.

**Deliverables**

- Verified production deployment.
- Final log entry and metrics.

**Acceptance criteria**

- No broken internal links in production.
- The feed and sitemap validate.
- The old home page and all article URLs still work on both hosts.
- A rollback commit or tag is identified in the log.

**Status:** Not started

---

## 9. Decisions needed

Mark each as **Approved**, **Changed**, or **Rejected** during review. Decisions
marked *Blocking* must be settled before the phase that needs them.

### D1 — Generated output directory *(Blocking: Phase 0/1)*

- **Options:** keep `public/` → `dump/`; rename source to `content/` and output
  to `site/`; use `content/` → `dump/`.
- **Recommendation:** keep `public/` as the source and `dump/` as the generated
  output. The Cloudflare project builds with `npm run build; npm run dump` and
  the GitHub Pages workflow uploads `./dump`; renaming either directory would
  require coordinated changes to both external deployments for no Phase 0
  benefit.
- **Cost:** none now. A future rename would require updating the Cloudflare
  project settings and this document in the same change.
- **Status:** Approved 2026-10-29 (keep the existing names).

### D2 — Front matter format *(Blocking: Phase 1)*

- **Options:** JSON in an HTML comment; sibling `meta.json`; one central
  `catalog.json`.
- **Recommendation:** JSON in an HTML comment, placed as the first child of
  `<body>` during migration and at the top of the fragment afterward. It is
  colocated, needs no parser dependency, and survives without a build.
- **Status:** Open

### D3 — Authoring format *(Blocking: Phase 2)*

- **Options:** HTML fragments; Markdown; both.
- **Recommendation:** HTML fragments for this plan. Markdown is a separate
  decision and would add a parser dependency.
- **Status:** Open

### D4 — URL style *(Needed by: Phase 2/3)*

- **Options:** root-relative (`/articles/slug/`); document-relative
  (`../slug/`).
- **Recommendation:** document-relative links. The GitHub Pages mirror lives at
  `https://lakowske.github.io/blog/`, so root-relative links would break there.
  Use canonical URLs pointing at `https://sethlakowske.com/...` to handle the
  `index.html` duplicate.
- **Status:** Approved 2026-10-29 (document-relative; the mirror must keep
  working).

### D5 — TypeScript or plain ESM *(Needed by: Phase 4)*

- **Options:** keep TypeScript; move to plain `.mjs` with JSDoc types.
- **Recommendation:** plain ESM for the new build and validator. Keep
  TypeScript for the existing server if the type checking is valued; it is a
  dev-only cost. The Phase 0 validator is plain `.mjs` either way.
- **Decision:** plain ESM only. The legacy server is removed, so TypeScript has
  no consumer.
- **Status:** Approved 2026-10-30.

### D6 — Keep the custom Node server? *(Needed by: Phase 4)*

- **Options:** keep `serve` mode; drop it and use a static preview server;
  keep a minimal static server.
- **Recommendation:** the Node server is not production; Cloudflare builds and
  serves static output. Drop the content-injecting server once the build
  generates static pages, and use a small static preview server for local work.
- **Decision:** drop the server. `scripts/serve.mjs` is the zero-dependency
  preview server.
- **Status:** Approved 2026-10-30.

### D7 — Related-links scoring *(Needed by: Phase 3)*

- **Options:** tags only; tags + section + recency; manual only.
- **Recommendation:** `3 × shared tags + 1 if same section`, sorted by score
  then date then slug; exclude self and pages; take five; if fewer than three,
  fill with recent articles from the same section. Manual overrides win.
- **Refinement:** the section bonus applies only to `articles`, `software`, and
  `technology`; `root` and `pages` do not receive it. Top-level articles should
  derive `section: "root"`, not their own slug.
- **Status:** Approved 2026-10-30.

### D8 — Home page vs About page *(Needed by: Phase 3)*

- **Options:** keep both as-is; merge them; home = profile + recent articles.
- **Recommendation:** home = profile + one combined list of the last 10 dated
  posts and all evergreen posts + an “All articles” link; About remains the
  profile/bio. The archive is the full view of all 34 articles in one list.
  This keeps a substantial landing page while removing the exact duplication.
- **Status:** Approved 2026-10-30.

### D9 — `private/` content *(Needed by: Phase 4)*

- **Options:** keep in this repo; move to a separate private repo; gitignore it.
- **Recommendation:** if this repository is public, move it out. The directory
  is not published by the build, but it is still in git history.
- **Status:** Deferred 2026-10-30 by Seth: `private/` stays tracked and
  unpublished. The repository is public, so the content is visible on GitHub and
  in history. Revisit after Phase 4.

### D10 — Remove `dump/` from git *(Blocking: Phase 0)*

- **Options:** keep tracking it; stop tracking it.
- **Recommendation:** stop tracking it. Both deployments regenerate it, and the
  committed copy is already stale.
- **Gate:** confirmed: the Cloudflare build runs `npm run build; npm run dump`
  and the GitHub Pages workflow uploads a freshly generated `./dump`.
- **Status:** Approved 2026-10-29.

### D11 — Visual changes *(Needed by: Phase 2)*

- **Options:** preserve the current look; allow small improvements; redesign.
- **Recommendation:** preserve the look in this plan. Handle typography,
  spacing, and responsive improvements in a separate plan.
- **Status:** Open

### D12 — Keep the GitHub Pages mirror *(Needed by: Phase 2/3)*

- **Options:** keep the mirror; retire it; make it the canonical host.
- **Recommendation:** keep it as a mirror for bookmarked URLs. This is why D4
  chooses document-relative links and why Phase 5 verifies both hosts.
- **Status:** Approved 2026-10-29.

### D13 — `CNAME` generation *(Needed by: Phase 5)*

- **Options:** keep generating `dump/CNAME`; stop generating it; move it out of
  the artifact.
- **Recommendation:** stop generating it. The custom domain is on Cloudflare,
  and GitHub Pages reports `cname: null`, so the file is legacy and ambiguous.
  Keep `.nojekyll`. Revisit during Phase 5 cutover.
- **Status:** Open; deferred to Phase 5.

### D14 — HTML parsing strategy *(Needed by: Phase 2/4)*

- **Options:** keep jsdom permanently; remove it after templates; replace it
  with regex now; use a lighter parser.
- **Recommendation:** keep jsdom in the legacy pipeline for now. Do not use it
  in `scripts/check.mjs`. Remove it in Phase 4 once templates and front matter
  generate the structure. Use jsdom only as a one-off migration tool if needed.
- **Rationale:** jsdom is a real HTML5 parser and handles nesting and malformed
  markup well, but the current code uses it only for title extraction,
  `#related` row insertion, and full-document serialization. The checker’s
  checks are shallow and run on generated HTML, so regex is adequate and
  zero-dependency. Keeping jsdom until Phase 4 avoids a risky rewrite now.
- **Follow-up:** source HTML validation is tracked separately in
  [002-source-html-validation.md](002-source-html-validation.md).
- **Status:** Approved 2026-10-30.

### D15 — Date policy *(Needed by: Phase 1)*

- **Options:** require a date for every article; allow undated articles; use a
  single `date: null` for both evergreen and unknown dates.
- **Recommendation:** distinguish three states:
  - dated: `date` is `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`;
  - evergreen: `date: null` and `evergreen: true`; no date is displayed;
  - unknown: `date: null` and no `evergreen` (or `evergreen: false`); treated
    as time-bound but not yet dated, with a validation warning.
- **Rationale:** some posts are intentionally timeless; others are technical
  posts whose date is a useful time cue. A single `null` conflates the two.
- **Status:** Approved 2026-10-30.

### D16 — Catalog freshness *(Needed by: Phase 1)*

- **Options:** commit `catalog.json`; generate it on every build; keep it
  internal only.
- **Recommendation:** generate it on every build from the metadata, never commit
  it, and publish it. Add completeness and determinism checks, a content hash and
  count, and `Cache-Control: no-cache` for `/catalog.json`.
- **Rationale:** a derived file cannot drift if it is rebuilt from the same
  metadata used to render the pages. The hash lets consumers detect changes
  without a timestamp.
- **Status:** Approved 2026-10-30.

### D17 — Summary policy *(Needed by: Phase 1)*

- **Options:** require summaries; leave them empty; generate them at build time.
- **Recommendation:** `summary` is an optional manual override. When absent,
  derive one from the first meaningful paragraph at build time. Print the
  generated summaries during Phase 1 for review.
- **Rationale:** every article gets a usable excerpt without maintaining 37
  stored summaries that could go stale.
- **Status:** Approved 2026-10-30.

### D18 — Layout model *(Needed by: Phase 2)*

- **Options:** one rigid article template; full HTML pages with includes; a
  layered model with standard layouts plus explicit escape hatches.
- **Recommendation:** layered model:
  - **article** (default): shared head/styles, title, byline, date, related
    links;
  - **page** (default for Home/About/Resume): shared head/styles, content;
  - **bare**: shared head/styles only;
  - **named layout**: a file under `templates/layouts/`;
  - **raw**: a complete HTML document copied as-is, with metadata still
    cataloged.
- **Rationale:** most pages should share the standard envelope for consistency
  and automation, but the body remains unrestricted HTML. Exceptional pages can
  take over the envelope or the entire document without changing the renderer.
- **Authoring rules:** the default content file is a metadata comment plus a
  body fragment. Full documents are allowed only with `layout: "raw"` and are
  listed in the migration report. Metadata fields `layout`, `bodyClass`,
  `showHeader`, `showRelated`, `scripts`, and `styles` control the envelope.
- **Status:** Approved 2026-10-30.

### D19 — Feed format *(Needed by: Phase 3)*

- **Options:** RSS 2.0; Atom.
- **Recommendation:** RSS 2.0. It has the broadest reader, aggregator, and
  podcast compatibility; Atom is stricter but less universal in older tools.
- **Status:** Approved 2026-10-30.

### D20 — Page headings *(Needed by: Phase 3)*

- **Options:** leave pages without an h1; render the metadata title as h1; add a
  separate `heading` field.
- **Recommendation:** add an optional `heading` field. Home/About use
  “Seth Lakowske”; Resume uses “Seth's Resume”. The page template renders one
  h1, styled to match the old h2 size.
- **Status:** Approved 2026-10-30.

### D21 — 404 handling *(Needed by: Phase 3)*

- **Options:** `_redirects`; a top-level `404.html`; a Pages Function.
- **Recommendation:** add a top-level `404.html`. Cloudflare Pages automatically
  serves it with a 404 status when no top-level 404 exists; the current SPA
  behavior is because there is no `404.html`. `_redirects` cannot return a 404
  status and is not needed for this.
- **Status:** Approved 2026-10-30.

## 10. Tracking conventions

- **Plan status** lives in the phase table for 001 and in the feature register
  for features.
- **Task progress** is tracked with checkboxes in the phase or feature document.
- **Deviations** go in `implementation-log.md`, not silently into the plan. If a
  deviation changes the plan, update the plan and note the change in the log.
- **Plan revisions** are recorded in the table at the bottom of this document.

Log entry format:

```markdown
## YYYY-MM-DD — Short title
- **Phase:** 0–5, a feature ID such as `F-001`, or "planning"
- **Type:** baseline | finding | deviation | decision | blocker | completion
- **Summary:** one or two sentences.
- **Details:** what happened, with file paths or commit hashes.
- **Impact on plan:** what changed, or "none".
- **Follow-up:** next action, or "none".
```

Feature entries may use `- **Feature:** F-001` instead of `- **Phase:**`. The
feature register, not the log, is the source of truth for feature status.

## 11. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Cloudflare build settings depend on `public/`/`dump/` names | Medium | High | Keep the names (D1); update project settings and `docs/deployment.md` together if that ever changes. |
| Root-relative links break the GitHub Pages mirror | Medium | High | Use document-relative links (D4); verify both hosts in Phase 5. |
| Historical dates are unknown | High | Low | Allow `date: null`; list undated pages separately. |
| Template migration introduces visual regressions | Medium | Medium | Batch migration, screenshot comparison, keep old tree until verified. |
| URL changes break inbound links | Low | High | Preserve output paths; add redirects if a path must change. |
| Tag vocabulary becomes inconsistent | Medium | Medium | Start with a small controlled tag list; allow manual overrides. |
| Scope creep into redesign | Medium | Medium | D11: preserve the look; redesign separately. |
| Zero-dependency goal forces hand-rolled parsers | Low | Medium | Keep HTML bodies; only parse front matter and substitute slots. |

## 12. Success metrics

At the end of Phase 5:

- 0 broken internal links.
- 37 / 37 pages with valid metadata.
- 0 duplicated document chrome blocks in content files.
- 3–5 related links per article, 0 self-links.
- 0 runtime dependencies (or a documented exception).
- `dump/` no longer tracked.
- `npm audit` clean.
- A clean checkout builds and validates with one command.

## 13. Future work

Future work is tracked in the [feature register](README.md#feature-register),
not as additional phases.

- [002 — Source HTML validation](002-source-html-validation.md) is registered as
  **F-003**: catch malformed source HTML before the templates repair it.
- [003 — Article signals (+1)](003-article-signals.md) is proposed as **F-001**:
  an optional +1 control backed by D1, removable without affecting rendering.

## Appendix A — Findings inventory

### A1. Structure and duplication

- Every page contains a full `<!DOCTYPE>`, `<head>`, and `<body>`.
- At least four article markup generations:
  - `<h1>` + `<h3>Posted by` + `<h4>Published` + triangles;
  - `<h2>` + `<h3>Posted by` + `<h4>Published`;
  - WordPress imports with `<div class="entry-content">` and `&nbsp;`;
  - older `<article><header>` pages.
- `public/index.html` and `public/about/index.html` are identical except for
  `<title>` and relative paths.
- The dev server serves `about/index.html` at `/`; the Cloudflare deployment
  serves `index.html`.

### A2. Metadata gaps

- 20 / 37 pages have no `<time>` element.
- 6 / 37 pages have no byline: home, about, resume, and three articles.
- 2 / 37 pages have no `<h1>` or `<h2>`.
- `2021-06-1` is not a valid ISO date.
- `<time pubdate="pubdate">` is obsolete.
- No page has a meta description, canonical URL, or Open Graph tags.

See [Appendix B](#appendix-b--metadata-gaps) for the page list.

### A3. Related links

- `ContentUtils.addRelatedWebpages()` passes every HTML page to every page.
- Pages include themselves.
- About, Resume, and Home appear as related links everywhere.
- Order comes from `readdir`, so it is filesystem-dependent.
- Output is a layout `<table>`, not a semantic `<nav>`.
- `getRelativeLink()` uses `path.relative`, which emits backslashes on Windows.
- `getLink()` has a broken `../` prefix for nested paths and is unused.
- `public/articles/traveling-without-moving/index.html` has no related table.

### A4. Markup defects

- `public/articles/monadic-shell-scripts/index.html`:
  `<h2>Monadic shell scripts</title>`; missing `</html>`.
- `public/articles/living-offgrid-on-a-solar-powered-boat/index.html`: missing
  `</body>`.
- `public/articles/why-run-docker-containers-and-kubernetes/index.html`:
  related table after `</body>`; uppercase headings; inline
  `style="color: orange"`.
- `public/articles/start-emacs-in-dired-mode/index.html`: `<pre>` inside `<p>`;
  related table inside `<p>`.
- `public/articles/why-i-love-emacs-lisp/index.html`: title and heading disagree;
  no date or byline.
- `public/articles/conscious-cosmos-and-personal-reality/index.html`: no page
  heading, byline, or date.
- `public/articles/use-browserify-and-minifyify.../index.html`: `<title>`
  contains a newline and indentation; links a local `style.css`.
- `public/articles/webgl-using-gl-mat4.../index.html`: broken links to
  `node_modules/prismjs-package/prism.css` and `3dify/bundle.js`.
- `public/think-again/index.html`, `public/electric-bike.../index.html`, and
  `public/completed-ml-class-org-course/index.html`: WordPress wrappers and
  empty headings.

### A5. Asset inconsistencies

- `style.css` is loaded by all 37 pages.
- `triangles/style.css` is loaded by 30 pages; `triangles/bundle.js` by 17.
- 10 pages use `language-*` classes; 3 load `prism.css` (one path broken); no
  page loads Prism JS.
- `static/style/syntax.css` and `static/bundles/bundle.js` are referenced by no
  page.
- Two generated per-article `bundle.js` files are tracked (5,365 and 6,507
  lines).

### A6. Build and repository

- `dump/` is tracked: 71 files, ~9.8 MB.
- The committed `dump/` is stale relative to `public/`.
- `src/server.ts` resolves paths from the current working directory.
- `url.substring(1)` does not strip query strings.
- CI uses Node 20; local is Node 22.
- No test or validation step exists.
- `npm audit`: 7 advisories (1 critical, 5 high, 1 low), largely in the
  `jsdom`/`nodemon` trees.

### A7. Dead code and documentation

- Unused: `storeIndex`, `loadIndexFromCache`, `isCached`, `loadFromCache`,
  `embeddings`, `LoadContext.cacheDir`, `Content.addRelated`,
  `getHtmlTitles`, and the `links` result in `prepareContent`.
- README documents `OPENAI_API` and `USE_CACHE`; neither is used by the current
  pipeline.
- `loadFromCache()` turns `contentAttributes` into a plain object, which would
  break `.get()` if the cache path were used.
- `let metadataStat` is unused.

### A8. Deployment (verified 2026-10-29)

- Canonical host: Cloudflare Workers & Pages at `sethlakowske.com`.
- Cloudflare build command: `npm run build; npm run dump`.
- Mirror: GitHub Pages at `lakowske.github.io/blog/`; API reports
  `cname: null`.
- The custom domain is not attached to GitHub Pages.
- Unknown paths, `/robots.txt`, and `/sitemap.xml` return the home page with
  HTTP 200 on the canonical host.
- `blog.service` and `cloudflare.service` are not installed on the Pi or
  `ubuntu-box`.
- `/home/seth/bin/blog` on `ubuntu-box` points at an old checkout that is not
  serving production.
- See [../deployment.md](../deployment.md) for the full deployment record.

## Appendix B — Metadata gaps

### Pages with no date (20)

```
index.html
about/index.html
resume/index.html
think-again/index.html
slurp-some-nodejs-streams/index.html
electric-bike-article-on-madisonbikelife/index.html
logical-validity-explained/index.html
completed-ml-class-org-course/index.html
technology/silent-am1h-itx-development-workstation/index.html
software/eventemitter-vs-backbone-events-vs-diy-eventbus/index.html
software/use-http-browserify-to-submit-formdata-and-images-easily/index.html
software/writing-software/index.html
software/node-js-closing-jsonstream-and-other-system-resources-gracefully/index.html
software/singleton-factory-and-mediator-patterns-in-javascript/index.html
software/cross-environment-shared-logic-with-requirejs-karma-and-mocha/index.html
software/use-grunt-and-uglifyjs-to-combine-multiple-javascript-files-into-a-single-javascript-file/index.html
software/sequelize-unit-testing-using-grunt-and-nodeunit/index.html
articles/why-i-love-emacs-lisp/index.html
articles/conscious-cosmos-and-personal-reality/index.html
articles/traveling-without-moving/index.html
```

### Pages with no byline (6)

```
index.html
about/index.html
resume/index.html
articles/why-i-love-emacs-lisp/index.html
articles/conscious-cosmos-and-personal-reality/index.html
articles/traveling-without-moving/index.html
```

### Pages with no heading (2)

```
articles/conscious-cosmos-and-personal-reality/index.html
articles/traveling-without-moving/index.html
```

### Pages with no related placeholder (1)

```
articles/traveling-without-moving/index.html
```

## Plan revisions

| Date | Version | Change | Author |
| --- | --- | --- | --- |
| 2026-10-29 | 0.1 | Initial draft from structural review. | Seth |
| 2026-10-29 | 0.2 | Corrected the deployment model: Cloudflare Workers & Pages is canonical; GitHub Pages is a mirror. Approved D1 (keep `public/`/`dump/`), D4 (document-relative URLs), D10 (untrack `dump/`), and D12 (keep the mirror). Moved the server work to Phase 4. | Seth |
| 2026-10-30 | 0.3 | Approved D14: keep jsdom in the legacy pipeline, keep the checker zero-dependency, and remove jsdom after templates. Added future work for source HTML validation (002). | Seth |
| 2026-10-30 | 0.4 | Phase 0 merged as `d4331b2` and verified on Cloudflare and GitHub Pages. | Seth |
| 2026-10-30 | 0.5 | Approved Phase 1 decisions: HTML comment metadata, HTML fragments, three-state date policy (dated/evergreen/unknown), generated catalog with freshness checks, and build-time summary fallbacks. | Seth |
| 2026-10-30 | 0.6 | Phase 1 merged as `8882a01` and verified on Cloudflare and GitHub Pages; catalog counts, version, and header behavior recorded. | Seth |
| 2026-10-30 | 0.7 | Approved D18 (layered article/page/bare/custom/raw layouts) and the Phase 2 visual defaults: triangles opt-in, Prism removed, nav/footer and semantic related links deferred to Phase 3. | Seth |
| 2026-10-30 | 0.8 | Phase 2 implementation complete: zero-dep renderer, templates, 37 fragments, standard layouts, 0 checker warnings. Awaiting PR verification. | Seth |
| 2026-10-30 | 0.9 | Phase 2 merged as `399cfb3` and verified on Cloudflare and GitHub Pages: 37 standard layouts, 0 checker warnings, all URLs and sample pages match. | Seth |
| 2026-10-30 | 0.10 | Approved Phase 3: related scoring, Home evergreen + 10 dated + all link, archive/tag pages, nav/footer, page headings, RSS 2.0, top-level 404. | Seth |
| 2026-10-30 | 0.11 | Phase 3 implementation complete: 58 generated pages, 24 tests, 0 checker warnings; related scoring, archive, tags, RSS, sitemap, robots, 404, nav/footer, headings. Awaiting PR verification. | Seth |
| 2026-10-30 | 0.12 | Phase 3 feedback: Home and the archive use one combined post list with no Dated/Evergreen/Date unknown headings; dates are shown only where known. | Seth |
| 2026-10-30 | 0.13 | Phase 3 merged as `cb975c9` and verified: 404, 57 sitemap URLs, RSS, archive, tags, related links, and combined Home/archive lists. | Seth |
| 2026-10-30 | 0.14 | Approved D5 (plain ESM), D6 (drop the legacy server), and a zero-dependency preview server. Deferred D9 (`private/` stays tracked). | Seth |
| 2026-10-30 | 0.15 | Phase 4 merged as `8e8cdaf` and verified: zero dependencies, clean audit, unchanged output, both hosts green. | Seth |
| 2026-10-30 | 0.16 | Fixed the stale status line. Declared phases 0–5 historical and moved future work to the feature register (`F-NNN`), because feature order is not known in advance. Added F-001 (article signals). | Seth |
