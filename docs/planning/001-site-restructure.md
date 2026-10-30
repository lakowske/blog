# 001 — Site Restructure Plan

**Status:** Phase 0 approved 2026-10-29. Phases 1–5 draft.
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
| 0 | Baseline and guardrails | Safe, repeatable changes; CI checks; generated output untracked | — | In progress (PR #3) |
| 1 | Metadata and catalog | Every page has validated metadata; deterministic catalog | 0, D1–D3 | Not started |
| 2 | Templates and normalization | One layout; content files are body fragments; consistent markup | 1 | Not started |
| 3 | Generated navigation | Related links, archive, tags, feed, sitemap, 404 | 2, D4, D7, D8 | Not started |
| 4 | Dependency and code cleanup | Zero runtime dependencies; dead code removed; docs accurate | 2, 3, D5, D6, D9 | Not started |
| 5 | Cutover and verification | Production verified; plan closed; deviations logged | 0–4 | Not started |

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

**Status:** In progress — implementation complete; PR #3 CI and Cloudflare
preview pass. Awaiting review/merge and mirror verification.

---

### Phase 1 — Metadata and catalog

**Goal:** Give every page explicit, validated metadata so later phases can
generate navigation and site pages without guessing.

**Tasks**

- [ ] Confirm the front matter format (D2).
- [ ] Define the schema:
  - required: `title`, `type` (`article` or `page`);
  - required for articles: `date` (`YYYY-MM-DD`);
  - recommended: `tags`, `summary`;
  - optional: `updated`, `draft`, `aliases`, `related` (manual overrides).
- [ ] Write a one-off migration script that infers title and date from the
  existing `<title>` and `<time>` tags and reports gaps.
- [ ] Fill metadata for the pages listed in
  [Appendix B](#appendix-b--metadata-gaps). This is the only manual content work
  in the plan.
- [ ] Normalize dates: `2021-06-1` becomes `2021-06-01`; replace obsolete
  `pubdate` with `datetime`.
- [ ] Generate a deterministic catalog (sorted by date descending, then slug)
  as `catalog.json` in the build output, and keep it in memory for rendering.
- [ ] Add validation that fails the build on missing titles, invalid dates, or
  duplicate slugs; warn on missing tags/summary.
- [ ] Decide the type of `about`, `resume`, and `index`: `page`, not `article`.
- [ ] Record any URL aliases; none are expected if output paths are preserved.

**Deliverables**

- Front matter on all 37 pages.
- Catalog generator and validator.
- A metadata gap report in the implementation log.

**Acceptance criteria**

- 37 / 37 pages pass validation.
- Running the build twice produces byte-identical `catalog.json`.
- The build fails with a clear message when a title or date is missing.

**Risks / rollback**

- Missing historical dates may be unknown. Mark them `date: null` and treat them
  as undated pages rather than inventing dates.
- Front matter inserted into full HTML pages must not break rendering. During
  this phase it sits as the first child of `<body>`; the build strips it.

**Status:** Not started

---

### Phase 2 — Templates and page normalization

**Goal:** Keep exactly one copy of the document chrome and make every page use
the same structure.

**Tasks**

- [ ] Keep the `public/` → `dump/` build contract. Do not rename the source or
  output directories in this phase.
- [ ] Create `templates/base.html` with slots for title, description, canonical,
  Open Graph tags, nav, content, and footer.
- [ ] Create `templates/article.html` and `templates/page.html` for the two
  content shapes.
- [ ] Convert the 37 pages to body fragments:
  - remove `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, and duplicated nav;
  - remove per-page byline/date markup (the template renders it from metadata);
  - keep article-specific assets and scripts as front matter fields or
    fragment-local includes.
- [ ] Fix the malformed pages listed in Appendix A.
- [ ] Standardize semantics:
  - one `<h1>` per page, equal to the title;
  - `<main><article>` for articles, `<main>` for pages;
  - `<header>` with byline and `<time datetime="YYYY-MM-DD">`;
  - `<footer>` with a consistent link back to the archive/about;
  - `<nav aria-label="Related">` placeholder on every article.
- [ ] Normalize assets:
  - load one shared stylesheet on every page;
  - decide whether the triangles background and Prism are global or opt-in;
  - remove references to unused `syntax.css` and `static/bundles/bundle.js`;
  - fix the two broken WebGL asset paths.
- [ ] Add `meta name="description"`, `rel="canonical"`, and Open Graph tags from
  metadata.
- [ ] Preserve the current visual appearance. Capture before/after screenshots
  of a representative set of pages.
- [ ] Add redirects for any URL that changes (none expected).

**Deliverables**

- Templates and a renderer.
- Body-fragment content files.
- Consistent pages that pass the Phase 0 checker.

**Acceptance criteria**

- No content file contains `<!DOCTYPE>`, `<head>`, or `<body>`.
- All pages pass the link and HTML checks.
- A visual spot check shows only intended differences (removed duplicate
  bylines, fixed headings, consistent related placeholder).
- Every page loads exactly one shared stylesheet.
- All generated links are document-relative and work under both
  `https://sethlakowske.com/` and `https://lakowske.github.io/blog/`.

**Risks / rollback**

- This is the largest mechanical change. Do it on a branch and migrate in
  batches (articles, software, top-level posts, pages), committing each batch.
- Keep the old `public/` tree until the new output is verified, then remove it
  in one commit.

**Status:** Not started

---

### Phase 3 — Generated navigation and site pages

**Goal:** Replace the all-pages table with generated, meaningful navigation and
the site-level pages that metadata makes possible.

**Tasks**

- [ ] Implement the related-links scoring in D7.
- [ ] Exclude self, `type: page`, drafts, and manually excluded slugs.
- [ ] Render a semantic `<nav>` with at most five links and a stable order.
- [ ] Support manual `related: [slug, ...]` overrides merged with computed
  results.
- [ ] Generate an archive page (`/articles/`) sorted newest first.
- [ ] Generate one page per tag (`/tags/<tag>/`).
- [ ] Generate `feed.xml` (Atom or RSS) and `sitemap.xml`.
- [ ] Generate `robots.txt` with a sitemap reference.
- [ ] Generate `404.html`.
- [ ] Configure the Cloudflare project to serve `404.html` instead of the
  current SPA fallback; verify unknown paths return HTTP 404.
- [ ] Normalize internal URLs to directory form (`/articles/slug/`) while
  keeping them document-relative for the `/blog/` mirror.
- [ ] Update the home page to show recent articles and a link to the archive
  (D8).

**Deliverables**

- Related navigation on every article.
- Archive, tag pages, feed, sitemap, and 404.
- A home page that no longer needs the all-pages table.

**Acceptance criteria**

- Every article shows 3–5 related links, never itself, never a nav page.
- The archive lists every published article, newest first.
- The feed validates and contains the same articles as the archive.
- The sitemap contains every public URL and no drafts.
- `404.html` is served for unknown paths on both hosts.

**Risks / rollback**

- Related links may be sparse if tags are inconsistent. Start with a small,
  controlled tag vocabulary (10–20 tags) and allow manual overrides.
- Feed and sitemap generation add surface area; keep them simple and validate
  with a one-off script rather than adding a dependency.

**Status:** Not started

---

### Phase 4 — Dependency and code cleanup

**Goal:** Remove dependencies and dead code that the new build no longer needs.

**Tasks**

- [ ] Remove `jsdom`. After Phases 2 and 3, the build owns the templates and
  metadata, so no DOM parsing is required.
- [ ] Replace `dotenv` with Node's `process.loadEnvFile()` (Node 20.12+) or
  remove it and rely on the environment.
- [ ] Replace `mime` with a small extension map, or remove it if the build no
  longer serves files.
- [ ] Replace `nodemon` with `node --watch`.
- [ ] Decide TypeScript vs plain ESM (D5).
- [ ] Remove dead code:
  - `storeIndex`, `loadIndexFromCache`, `isCached`, `loadFromCache`;
  - `embeddings` and `LoadContext.cacheDir` if the cache is not used;
  - `Content.addRelated`, `getHtmlTitles`, and the unused `links` result.
- [ ] Update the README to match reality: commands, directory layout,
  environment variables, and deployment.
- [ ] Remove or archive the legacy `blog.service` and `cloudflare.service` files
  after confirming they are unused.
- [ ] Confirm `npm audit` is clean.
- [ ] Resolve the `private/` directory (D9).

**Deliverables**

- Zero runtime dependencies (or a documented exception).
- Accurate README.
- No unused exports.

**Acceptance criteria**

- `npm ci` installs only dev tooling, or nothing at all.
- `npm audit` reports no vulnerabilities.
- The build works from a clean checkout with no environment file.
- README instructions reproduce the build and preview.

**Risks / rollback**

- Removing TypeScript is a larger diff than removing a library. If the types are
  useful, keep TypeScript and remove only the runtime dependencies.
- Keep a tag or branch before the cleanup commit so it can be reverted
  independently.

**Status:** Not started

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
- **Status:** Open; deferred to Phase 4. Phase 0 uses plain ESM for
  `scripts/check.mjs`.

### D6 — Keep the custom Node server? *(Needed by: Phase 4)*

- **Options:** keep `serve` mode; drop it and use a static preview server;
  keep a minimal static server.
- **Recommendation:** the Node server is not production; Cloudflare builds and
  serves static output. Drop the content-injecting server once the build
  generates static pages, and use a small static preview server for local work.
- **Status:** Deferred to Phase 4. Phase 0 leaves `src/server.ts` untouched.

### D7 — Related-links scoring *(Needed by: Phase 3)*

- **Options:** tags only; tags + section + recency; manual only.
- **Recommendation:** `3 × shared tags + 1 if same section`, sorted by score
  then date then slug; exclude self and pages; take five; if fewer than three,
  fill with recent articles from the same section. Manual overrides win.
- **Status:** Open

### D8 — Home page vs About page *(Needed by: Phase 3)*

- **Options:** keep both as-is; merge them; home = profile + recent articles.
- **Recommendation:** home = profile + recent articles + archive link; About
  remains the canonical bio. This removes the current near-duplicate.
- **Status:** Open

### D9 — `private/` content *(Needed by: Phase 4)*

- **Options:** keep in this repo; move to a separate private repo; gitignore it.
- **Recommendation:** if this repository is public, move it out. The directory
  is not published by the build, but it is still in git history.
- **Status:** Open

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

## 10. Tracking conventions

- **Plan status** lives in the phase table and in each phase's `Status` line.
- **Task progress** is tracked with checkboxes in the phase.
- **Deviations** go in `implementation-log.md`, not silently into the plan. If a
  deviation changes the plan, update the plan and note the change in the log.
- **Plan revisions** are recorded in the table at the bottom of this document.

Log entry format:

```markdown
## YYYY-MM-DD — Short title
- **Phase:** 0–5 or "planning"
- **Type:** baseline | finding | deviation | decision | blocker | completion
- **Summary:** one or two sentences.
- **Details:** what happened, with file paths or commit hashes.
- **Impact on plan:** what changed, or "none".
- **Follow-up:** next action, or "none".
```

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

- [002 — Source HTML validation](002-source-html-validation.md): catch malformed
  source HTML before jsdom or the templates repair it. Not scheduled; a
  candidate for after Phase 2. This is separate from the current six phases.

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
