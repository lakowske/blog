# Implementation Log

Append-only record of implementation work, findings, deviations from
[001-site-restructure.md](001-site-restructure.md), and decisions made along the
way.

**Current status:** Phase 2 complete. Phase 3 in progress.

## How to use this log

- Add a new entry at the **top** (newest first).
- Use one entry per meaningful event: a phase start, a deviation, a blocker, a
  decision, or a phase completion.
- Do not rewrite history. If an earlier entry turns out to be wrong, add a new
  entry that corrects it and link back.
- If an event changes the plan, update the plan and note the change in the
  entry's **Impact on plan** field.
- Reference commits by short hash and files by path.

### Entry template

```markdown
## YYYY-MM-DD — Short title
- **Phase:** 0–5 or "planning"
- **Type:** baseline | finding | deviation | decision | blocker | completion
- **Summary:** one or two sentences.
- **Details:** what happened, with file paths or commit hashes.
- **Impact on plan:** what changed, or "none".
- **Follow-up:** next action, or "none".
```

---

## 2026-10-30 — Phase 3 feedback: combine post lists

- **Phase:** 3
- **Type:** deviation
- **Summary:** Removed the separate Dated/Evergreen/Date unknown headings. Home
  and the archive now render one combined post list with dates only where
  known.
- **Details:**
  - Home: last 10 dated posts, then all 5 evergreen posts, in one list, plus
    the “All articles” link.
  - Archive: all 34 articles in one list (dated newest first, then evergreen,
    then date-unknown), followed by the tag index.
  - No “Dated”, “Evergreen”, or “Date unknown” section headings.
  - Unknown-date posts remain undated but no longer have a separate note.
  - Tests updated; `site-pages.mjs` builders simplified.
- **Impact on plan:** Phase 3 archive/home presentation changed to a single
  list. Plan revision 0.12.
- **Follow-up:** Re-run `npm test`, preview via file:///http, and push to PR #6.

## 2026-10-30 — Phase 3 implementation complete

- **Phase:** 3
- **Type:** completion
- **Summary:** Implemented scored related links, the archive, 19 tag pages,
  Home evergreen/recent lists, nav/footer, page headings, RSS 2.0, sitemap,
  robots, and a top-level 404.
- **Details:**
  - Fixed `deriveSection`: top-level articles are `root`, pages are `pages`.
  - Related scoring: `3 × shared tags + 1` for `articles`/`software`/
    `technology`; manual overrides first; self/pages excluded; 3–5 links.
  - Added a semantic related nav and a “Tags: …” line to articles.
  - Archive at `/articles/`: 21 dated, 5 evergreen, 8 date-unknown articles,
    plus a 19-tag index.
  - Generated `/tags/<tag>/` for all 19 used tags.
  - Home shows 5 evergreen + 10 dated articles + “All articles”.
  - Added nav/footer: Home · About · Articles · Resume.
  - Added `heading`; Home/About h1 “Seth Lakowske”, Resume h1 “Seth's Resume”.
  - Added RSS 2.0 `/feed.xml` (21 dated items, no evergreen/unknown).
  - Added `sitemap.xml` (57 URLs: 37 source + archive + 19 tags) and
    `robots.txt`.
  - Added top-level `404.html`; no `_redirects` for 404.
  - Generated pages are synthetic from templates, not in the catalog.
  - Internal links use explicit `index.html` paths for `file://`; feed and
    sitemap use canonical directory URLs.
  - `npm test`: 24 tests pass; catalog 37 entries with 8 expected unknown-date
    warnings; output checker 0 errors, 0 warnings; 58 HTML pages.
  - Catalog version: `a05014643de4e76a73545e38d405b4b0ba9a2ccec8567dbf3ccef7fbcc19a11c`.
  - `file:///.../dump/index.html` and representative article/archive/tag/404
    pages render correctly in headless Chrome.
  - `npm run preview` serves `/`, `/articles/`, `/tags/javascript/`,
    `/feed.xml`, `/sitemap.xml`, `/robots.txt`, and `/404.html` with 200.
  - Feed and sitemap are well-formed XML; all articles have 3–5 related links.
  - Cloudflare 404 behavior is pending preview verification; the top-level
    `404.html` should replace the previous SPA fallback.
- **Impact on plan:** Phase 3 implementation complete; awaiting PR verification.
- **Follow-up:** Open the Phase 3 PR, verify the Cloudflare preview (including a
  random missing path), merge, and verify both hosts.

## 2026-10-30 — Phase 3 decisions approved

- **Phase:** 3
- **Type:** decision
- **Summary:** Approved related-link scoring, the Home/archive split, tag
  pages, nav/footer, page headings, RSS 2.0, and a top-level 404 page.
- **Details:**
  - D7: `3 × shared tags + 1 if same section`; section bonus only for
    `articles`/`software`/`technology`; exclude self/pages; manual overrides
    first; max 5; fill to 3 with recent articles.
  - Fix `deriveSection`: top-level articles become `root`; pages become
    `pages`.
  - D8: Home shows all 5 evergreen posts, the last 10 dated posts, and
    “All articles” links. The archive is the full view of all 34 articles.
  - Archive groups Dated / Evergreen / Date unknown and includes a tag index.
  - Generate `/tags/<tag>/` for all 19 used tags; add a “Tags: …” line to
    articles.
  - Add nav/footer: Home · About · Articles · Resume.
  - D20: add `heading`; Home/About use “Seth Lakowske”, Resume uses
    “Seth's Resume”.
  - D19: RSS 2.0 at `/feed.xml`, dated articles only.
  - D21: top-level `404.html`; no `_redirects` for 404. Cloudflare Pages
    serves it automatically; the current SPA behavior is because no top-level
    404 exists.
  - Archive, tag, and 404 pages are generated synthetically from templates, not
    added to the content catalog.
- **Impact on plan:** Plan updated for Phase 3. Branch
  `restructure/phase-3`.
- **Follow-up:** Implement related scoring, archive/tags, Home, nav/footer,
  headings, RSS/sitemap/robots/404, checker updates, and file:// verification.

## 2026-10-30 — Phase 2 merged and verified

- **Phase:** 2
- **Type:** completion
- **Summary:** PR #5 merged as `399cfb3`. CI, GitHub Pages, Cloudflare, the
  canonical site, the mirror, all 37 URLs, and the catalog verified.
- **Details:**
  - Merge: rebase merge of PR #5. Branch `restructure/phase-2` deleted locally
    and remotely.
  - Rebase rewrote the branch hashes:
    - renderer/fragments: `b2be2c3` → `faae581`
    - planning docs: `12338eb` → `399cfb3`
  - CI `validate`: pass (run 41021651925).
  - Deploy Blog to GitHub Pages: pass (run 41021651845).
  - Cloudflare Pages production check: pass.
  - `npm test` on `master`: 14 tests pass; catalog 37 entries (8 expected
    unknown-date warnings); output checker 0 errors, 0 warnings.
  - Catalog version: `ec2a3ebb150e59f865eb8329208b8074da884bfd50ff90525d6217226b4bfba2`.
  - Canonical `/catalog.json`: 200, `cache-control: no-cache`.
  - Mirror `/blog/catalog.json`: 200, `cache-control: max-age=600`.
  - All 37 HTML URLs resolve on both hosts. Canonical directory URLs 200;
    canonical `index.html` 308; mirror directory and `index.html` 200.
  - Sample pages (`why-learn-haskell`, `about`, `tones-of-the-web`,
    `use-browserify`, `completed-ml-class`) byte-match the local `dump/` and
    each other.
  - Live checks: metadata comments 0; articles have one h1; pages have no h1
    (deferred); triangles on 17 pages; Prism 0; per-page Browserify
    `style.css`/`bundle.js` and WebGL `bundle.js` return 200.
  - Dates verified: `2014-05-15`, `August 2014`, `May 2013`, `January 2012`.
    Evergreen and unknown-date articles render no `<time>`.
  - `npm run serve` static preview verified locally on port 8090 before merge.
- **Impact on plan:** Phase 2 complete. Phase 3 can start.
- **Follow-up:** Phase 3 — tag-scored semantic related links, archive, tag
  pages, feed, sitemap, 404, nav/footer, and page headings. Then Phase 4
  cleanup.

## 2026-10-30 — Phase 2 metadata and templates implemented

- **Phase:** 2
- **Type:** completion
- **Summary:** Added the zero-dependency renderer and templates, converted all
  37 pages to fragments, and normalized the output to the standard article/page
  envelope.
- **Details:**
  - Added `scripts/render.mjs` with pure helpers for template substitution,
    relative URLs, date formatting, headers, styles/scripts, and the related
    table. `main()` owns filesystem and logging side effects.
  - Added `templates/base.html`, `article.html`, `page.html`, and
    `layouts/bare.html`.
  - Supported `layout`, `bodyClass`, `showHeader`, `showRelated`, `triangles`,
    `scripts`, and `styles` in metadata and the catalog entry.
  - Converted all 37 pages to metadata + body fragments. No page needed a
    `bare`, named, or `raw` exception: 37 standard layouts, 0 exceptions.
  - Extracted per-page assets:
    - Browserify article: `bundle.js`, `style.css`
    - WebGL article: `bundle.js` (the missing `3dify/bundle.js` reference was
      dropped)
    - JSONStream article: external Gist script
    - Strudel article: external Strudel script
  - Triangles are opt-in on the same 17 pages that previously loaded the
    script. The 13 CSS-only pages no longer load the unused stylesheet.
  - Removed all Prism links. Code blocks use the shared `pre/code` styles.
  - Added description, canonical, and Open Graph tags.
  - Added `data-type` and `data-date-status`; the checker now suppresses
    intentional no-date warnings for pages, evergreen posts, and unknown-date
    posts.
  - Fixed migration artifacts: malformed monadic heading, Smoothie empty
    paragraphs/header, `pre` inside `p`, missing body tags, extra h1s, and the
    “Surprisingly productive” heading preserved as an h2.
  - `npm test`: 14 tests pass; catalog 37 entries with 8 unknown-date warnings;
    output checker 0 errors, 0 warnings.
  - The output has the same set of paths as before: 37 HTML files and 73
    total files. All URLs exist.
  - `npm run serve` now builds and serves the static `dump/` output on 8090.
    The legacy TypeScript/jsdom server remains unused until Phase 4.
  - Representative before/after screenshots were captured with headless
    Chrome. Intended visual differences: article titles are uniformly h1,
    byline/date are uniformly bold, Prism styling is gone, and the related
    table no longer includes the current page.
- **Impact on plan:** Phase 2 implementation complete; awaiting PR verification.
- **Follow-up:** Open the Phase 2 PR, verify the Cloudflare preview, merge, and
  verify both hosts. Then start Phase 3 (related scoring, archive, nav/footer,
  page headings).

## 2026-10-30 — Phase 2 decisions approved

- **Phase:** 2
- **Type:** decision
- **Summary:** Approved the layered layout model and the Phase 2 visual
  defaults. Most pages will use standard article/page layouts; custom documents
  are an explicit exception.
- **Details:**
  - D18 (approved): default `article`/`page` layouts; `bare`, named layouts,
    and `raw` complete documents are explicit escape hatches.
  - The body remains unrestricted HTML. The template owns only the envelope.
  - Triangles: opt-in via metadata, enabled on the pages that currently load
    the script.
  - Prism: remove the Prism stylesheet links; use shared `pre/code` styles.
  - Nav/footer and semantic/scored related links: deferred to Phase 3.
  - Renderer: new zero-dependency `scripts/render.mjs` using the Phase 1
    catalog. jsdom/server remain for `serve` until Phase 4.
  - Page headings: deferred to Phase 3 with the Home/About decision.
  - Per-page assets: `scripts`/`styles` metadata, extracted during migration.
  - Migration: one-off jsdom conversion, batches, headless Chrome screenshots.
  - Plan updated to v0.7. Phase 2 branch: `restructure/phase-2`.
- **Impact on plan:** Phase 2 tasks and acceptance criteria updated. Default
  content files are fragments; complete documents require `layout: "raw"`.
- **Follow-up:** Implement the renderer/templates, migrate pages in batches,
  update the checker for `data-type`/`data-date-status`, and verify both hosts.

## 2026-10-30 — Phase 1 merged and verified

- **Phase:** 1
- **Type:** completion
- **Summary:** PR #4 merged as `8882a01`. CI, GitHub Pages, Cloudflare, the
  canonical site, the mirror, and the catalog all verified.
- **Details:**
  - Merge: rebase merge of PR #4. Branch `restructure/phase-1` deleted locally
    and remotely.
  - The rebase rewrote the branch hashes:
    - content metadata: `645eb81` → `3e49763`
    - catalog tooling: `8df2d02` → `86588d0`
    - planning docs: `bcab077` → `8882a01`
  - CI `validate`: pass (run 41014675928).
  - Deploy Blog to GitHub Pages: pass (run 41014675581).
  - Cloudflare Pages production check: pass.
  - `npm test` on `master`: 5 tests pass; catalog 37 entries (34 articles,
    3 pages), 21 dated, 5 evergreen, 8 unknown; output checker 0 errors,
    125 warnings.
  - Catalog version: `d6d8aa903c6d62066b5317a92740e14d99e8f01a9f6eb2c0dff0580a9d0bf0d9`.
  - Canonical `/catalog.json`: 200, `cache-control: no-cache`.
  - Mirror `/blog/catalog.json`: 200, `cache-control: max-age=600`
    (GitHub Pages ignores `_headers`; documented).
  - Metadata comments: 0 in live HTML on both hosts.
  - Dates verified: `2014-05-15`, `August 2014`, `May 2013`, `January 2012`.
  - Evergreen and unknown-date pages have no `<time>` element.
  - URL status: canonical directory URLs 200, canonical `index.html` 308,
    mirror directory and `index.html` 200.
  - Live canonical and mirror pages byte-match the local `dump/` and each
    other.
  - The 8 catalog warnings are the intentionally undated technical posts. The
    125 output-checker warnings are the pre-existing structural issues Phase 2
    addresses.
- **Impact on plan:** Phase 1 complete. Phase 2 can start.
- **Follow-up:** Start Phase 2 (templates and normalization); keep 002 (source
  HTML validation) in mind; decide what to do with the old checkout before
  touching its content.

## 2026-10-30 — Phase 1 metadata and catalog implemented

- **Phase:** 1
- **Type:** completion
- **Summary:** Added metadata to all 37 pages, a zero-dependency catalog
  generator/validator, the tag vocabulary, the authoring guide, and generated
  summary drafts.
- **Details:**
  - 37 metadata comments, one per page, as the first child of `<body>`.
  - Date states: 21 dated, 5 evergreen, 8 time-bound with unknown dates, and
    3 pages.
  - New visible dates:
    - `technology/silent-am1h-itx-development-workstation`: `2014-05-15`
    - `electric-bike-article-on-madisonbikelife`: `2014-08`
    - `think-again`: `2013-05`
    - `completed-ml-class-org-course`: `2012-01`
  - Normalized `2021-06-1` to `2021-06-01` and replaced every `pubdate`
    attribute with `datetime`.
  - Evergreen: `logical-validity-explained`, `software/writing-software`,
    `articles/why-i-love-emacs-lisp`,
    `articles/conscious-cosmos-and-personal-reality`,
    `articles/traveling-without-moving`.
  - Unknown date: `slurp-some-nodejs-streams` and the seven technical
    `software/` posts.
  - Added `site.json` with the approved tag vocabulary and navigation.
  - Added `scripts/catalog.mjs` with pure parsing/validation/catalog functions
    and a single `main()`. Supports `--check`, `--out`, `--clean`, `--report`,
    and `--strict`. Writes `catalog.json` with a SHA-256 version hash, count,
    and counts, plus a `_headers` rule for `Cache-Control: no-cache`.
  - `npm run dump` validates metadata and writes `dump/catalog.json` before
    dumping pages. `npm test` includes it.
  - `src/Content.ts` strips the metadata comment before serialization.
  - `scripts/check.mjs` accepts partial ISO dates.
  - Added `docs/content.md` and linked it from the README.
  - Catalog result: 37 entries (34 articles, 3 pages), 0 errors, 8 warnings
    (unknown dates). Version `d6d8aa90…`; two runs produce byte-identical
    catalogs.
  - Added `scripts/catalog.test.mjs` with 5 `node:test` cases for ID/URL
    derivation, date validation, summary truncation, date states, and sorting.
    All pass.
  - Output checker result: 0 errors, 125 warnings.
  - Manual summary overrides: `tones-of-the-web`,
    `articles/smoothie-charts-nodejs-arduino-stream-transform-test`,
    `articles/why-i-love-emacs-lisp`, `index`, `about`, `resume`.
  - The remaining summaries are generated from the first paragraph or list
    item. Review with `npm run catalog:report`.
- **Impact on plan:** Phase 1 implementation is complete; awaiting review and
  PR verification.
- **Follow-up:** Review the generated summaries, open PR #4, confirm the
  Cloudflare preview, then start Phase 2.

## 2026-10-30 — Phase 1 decisions approved

- **Phase:** 1
- **Type:** decision
- **Summary:** Approved the Phase 1 metadata design, including the three-state
  date policy and a build-time catalog.
- **Details:**
  - Metadata lives in an HTML comment (D2) and content stays as HTML fragments
    (D3).
  - Dates have three states (D15): dated, intentionally evergreen
    (`date: null`, `evergreen: true`), and time-bound with an unknown date
    (`date: null`, no `evergreen`; warning).
  - Evergreen: `logical-validity-explained`, `software/writing-software`,
    `articles/why-i-love-emacs-lisp`,
    `articles/conscious-cosmos-and-personal-reality`,
    `articles/traveling-without-moving`.
  - Time-bound with known dates: `silent-am1h` (`2014-05-15`),
    `electric-bike` (`2014-08`), `think-again` (`2013-05`),
    `completed-ml-class` (`2012-01`, certificate month).
  - Time-bound with unknown dates: `slurp-some-nodejs-streams` and seven
    technical `software/` posts. They remain undated for now but are not
    evergreen.
  - Tags use the approved starter vocabulary; the draft mapping will be in the
    Phase 1 PR.
  - Summaries are optional overrides; otherwise derived at build time from the
    first meaningful paragraph (D17).
  - The catalog is generated on every build, never committed, and published
    with completeness/determinism checks, a content hash, a count, and
    `no-cache` headers (D16).
- **Impact on plan:** Plan updated to v0.5. Phase 1 implementation started on
  branch `restructure/phase-1`.
- **Follow-up:** Implement metadata migration, catalog generator, validation,
  authoring guide, and summary report; then open PR #4.

## 2026-10-30 — Phase 0 merged and verified

- **Phase:** 0
- **Type:** completion
- **Summary:** PR #3 was merged as `d4331b2`. CI, GitHub Pages, Cloudflare,
  the canonical site, and the mirror all verified successfully.
- **Details:**
  - Merge: rebase merge of PR #3. Branch `restructure/phase-0` deleted from
    local and remote.
  - The rebase rewrote the branch commit hashes. Earlier references were
    updated to the merged hashes:
    - pending edit: `ffdbe57` → `342ebf7`
    - guardrails: `42bd02f` → `8c4d4b3`
    - checker refactor: `476299b` → `2d70661`
  - CI `validate`: pass (run 41006428768).
  - Deploy Blog to GitHub Pages: pass (run 41006428796).
  - Cloudflare Pages production check: pass.
  - `npm test` on `master`: 37 files, 0 errors, 146 warnings.
  - `git status` is clean after a build; `git ls-files dump` returns 0.
  - Canonical site <https://sethlakowske.com/>:
    - `/`, `/about/`, `/articles/why-learn-haskell/`, and
      `/articles/conscious-cosmos-and-personal-reality/` return 200.
    - `/articles/why-learn-haskell/index.html` returns 308 to the directory
      URL. Browsers follow it, so bookmarks still work.
  - GitHub Pages mirror <https://lakowske.github.io/blog/>:
    - `/` and the same article URLs return 200.
    - The explicit `index.html` form returns 200.
  - Live canonical and mirror pages for `why-learn-haskell` and
    `conscious-cosmos` byte-match the local `dump/`.
  - Canonical and mirror responses are identical.
  - GitHub Actions annotates that Node 20 is deprecated for action runtimes
    (`actions/checkout@v4`, `actions/setup-node@v4`,
    `actions/upload-artifact@v4`). This is about the action runtime, not our
    `node-version: 22`.
- **Impact on plan:** Phase 0 complete. Phase 1 can start.
- **Follow-up:** Schedule source HTML validation (002) after Phase 2; decide
  what to do with the old checkout’s work before Phase 2; consider upgrading
  GitHub Actions to current majors.

## 2026-10-30 — Recorded HTML parsing decision and future source validation

- **Phase:** 0 / planning
- **Type:** decision
- **Summary:** Agreed to keep jsdom in the legacy pipeline, keep the checker
  zero-dependency and shallow, and record source HTML validation as future
  work.
- **Details:**
  - Reviewed jsdom usage: title extraction, `#related` row insertion, and
    full-document serialization.
  - jsdom is a real HTML5 parser and repairs malformed markup. Examples:
    a related table after `</body>`, `<h2>…</title>`, `<pre>` inside `<p>`,
    missing `</body>`, uppercase headings, and self-closing `<img />`.
  - The checker does not need jsdom. Its checks are shallow and run on
    generated HTML, so regex is adequate and zero-dependency.
  - Added D14 to `001-site-restructure.md`: keep jsdom for now; remove it in
    Phase 4 after templates and front matter generate the structure.
  - Added `002-source-html-validation.md` to capture the separate concern about
    catching malformed source HTML before jsdom or templates repair it.
    It is not scheduled and does not change the six phases.
- **Impact on plan:** Approved D14; added future work 002. No phase changes.
- **Follow-up:** Consider scheduling 002 after Phase 2, or earlier if authoring
  errors become a recurring problem. The known malformed pages are still fixed
  in Phase 2.

## 2026-10-29 — Checker refactored to functional style

- **Phase:** 0
- **Type:** decision
- **Summary:** Refactored `scripts/check.mjs` so pure helpers contain the
  parsing and validation logic and `main()` owns all side effects.
- **Details:**
  - Commit `2d70661` (branch hash `476299b` before the rebase merge).
  - Parsing, URL resolution, and page validation are pure functions.
  - Filesystem access, logging, and exit-code handling are bundled in `main()`.
  - The script root calls `main()` once.
  - Behavior and output are unchanged: 37 files, 0 errors, 146 warnings;
    `--strict` still exits 1.
  - Pure functions are exported for future `node:test` coverage. Adding tests
    will require an import guard or splitting the CLI from the library.
  - PR comment: <https://github.com/lakowske/blog/pull/3#issuecomment-6515227230>
  - CI `validate` and Cloudflare Pages preview both pass.
- **Impact on plan:** None; style-only refactor.
- **Follow-up:** Consider `node:test` coverage for the pure helpers.

## 2026-10-29 — Phase 0 implementation

- **Phase:** 0
- **Type:** completion
- **Summary:** Implemented the Phase 0 guardrails on branch
  `restructure/phase-0`: deployment documentation, untracked `dump/`, pinned
  Node, a zero-dependency validator, and PR CI.
- **Details:**
  - Guardrails commit: `8c4d4b3` (branch hash `42bd02f` before the rebase
    merge).
  - Pending-edit commit: `342ebf7` (branch hash `ffdbe57` before the rebase
    merge).
  - Added `docs/deployment.md` and updated the plan to v0.2.
  - Added `.nvmrc` (`22`), `engines.node` (`>=20.12`), and
    `scripts/check.mjs`.
  - `npm test` now runs `npm run build && npm run dump && node scripts/check.mjs dump`.
  - Added `.github/workflows/ci.yml` for pull requests and pushes.
  - Added the validator step to `.github/workflows/deploy.yml` and moved it to
    Node 22.
  - Removed `dump/` from git tracking (71 files) and added `dump` to
    `.gitignore`. The files remain on disk and are regenerated by the build.
  - Left `src/server.ts` untouched; D6 is deferred to Phase 4.
  - Baseline validator result: 37 HTML files, 0 errors, 146 warnings.
    - missing publish date: 20
    - missing byline: 6
    - missing related placeholder: 1
    - missing meta description: 37
    - missing canonical link: 37
    - heading count not exactly 1: 28
    - `<time>` without a valid `datetime`: 17
  - The two known-broken WebGL references are temporarily allowlisted in
    `scripts/check.mjs`; remove the allowlist in Phase 2.
- **Old checkout note:** `/home/seth/Software/blog` on `ubuntu-box` is at
  `1f35dfa` with 38 uncommitted changes, including:
  - new `private/ai-llm-pain-points/index.md`;
  - new `public/software/what-i-like-on-a-server/index.html`;
  - new `public/subscribe/index.html` (title currently says "Resume");
  - new `public/static/bundles/llm.js` and `ollama.js`;
  - `test/content-llm-extraction.test.ts`;
  - moves of `shooting-weighted-dice` and `trading-journey` into `private/`;
  - `package.json` changes adding `mocha`, `esm`, `@esm-bundle/chai`, and a
    `publicDump` script;
  - `src/Content.ts`, `ContentUtils.ts`, `server.ts`, `tsconfig.json`, and
    `public/static/style/style.css` changes;
  - an untracked `.env` (do not commit or copy it).
  This appears to be a separate LLM/content-extraction line of work. It was not
  modified, copied, or discarded.
- **Impact on plan:** Phase 0 tasks are implemented. The plan’s baseline and
  deployment sections now match reality.
- **Follow-up:** PR: <https://github.com/lakowske/blog/pull/3> (draft).
  - GitHub Actions `validate` passed in 20 seconds.
  - Cloudflare Pages preview check passed, confirming the unchanged
    `npm run build; npm run dump` build works with `dump/` untracked.
  - Awaiting review and merge. After merge, verify the GitHub Pages mirror still
    serves the same URLs.
  - Decide what to do with the old checkout’s work before Phase 2.

## 2026-10-29 — Deployment topology confirmed; Phase 0 approved

- **Phase:** planning / 0
- **Type:** decision
- **Summary:** Confirmed the canonical deployment is Cloudflare Workers & Pages
  with build command `npm run build; npm run dump`. GitHub Pages is a mirror and
  must be kept for bookmarked URLs. Approved Phase 0, D1, D4, D10, and D12.
- **Details:**
  - Cloudflare Workers & Pages serves `sethlakowske.com` and builds with
    `npm run build; npm run dump`.
  - GitHub Pages serves `lakowske.github.io/blog/` and must keep working. This
    requires document-relative links.
  - The GitHub Pages API reports `cname: null`; the custom domain is not
    attached there.
  - The canonical site returns HTTP 200 Home for unknown paths, `/robots.txt`,
    and `/sitemap.xml`.
  - `blog.service` and `cloudflare.service` are not installed on the Pi or
    `ubuntu-box`. `/home/seth/bin/blog` points at an old checkout and is not
    serving production.
  - The old checkout `/home/seth/Software/blog` on `ubuntu-box` has 38
    uncommitted changes. It has not been reviewed or touched.
- **Impact on plan:** Updated `docs/planning/001-site-restructure.md` to v0.2
  and added `docs/deployment.md`. D1 changed to keep `public/`/`dump/`; D4
  changed to document-relative; D6 deferred to Phase 4; D10 and D12 approved;
  D13 added for `CNAME`.
- **Follow-up:** Implement Phase 0 on a branch and summarize the old checkout
  for a later decision.

## 2026-10-29 — Plan created

- **Phase:** planning
- **Type:** decision
- **Summary:** Captured the structural review as a six-phase plan and created
  this log.
- **Details:** Added `docs/planning/README.md`,
  `docs/planning/001-site-restructure.md`, and this file. The plan covers
  baseline guardrails, metadata, template extraction, generated navigation,
  dependency cleanup, and cutover.
- **Impact on plan:** Initial plan; no prior version.
- **Follow-up:** Review decisions D1–D11 in the plan. Approve Phase 0 before any
  code changes.

## 2026-10-29 — Baseline verification

- **Phase:** planning
- **Type:** baseline
- **Summary:** Confirmed the repository is level with `origin/master`, the build
  works on Node 22, and the committed `dump/` is already stale.
- **Details:**
  - `master` is 0 ahead / 0 behind `origin/master`.
  - One uncommitted edit:
    `public/articles/conscious-cosmos-and-personal-reality/index.html`
    (title line and trailing whitespace cleanup).
  - `npm ci`, `npm run build`, and a dump into a temporary directory all
    succeed on Node 22.22.2.
  - A fresh dump differs from the tracked `dump/` in
    `dump/articles/java-to-haskell-in-zero-days/index.html`, because commit
    `45cbd56` edited `public/` without re-dumping.
  - `npm audit`: 7 advisories (1 critical, 5 high, 1 low), largely in the
    `jsdom`/`nodemon` trees.
  - 89 packages in the lockfile; `jsdom` alone has 26 direct dependencies.
  - 37 HTML pages, 17 with dates, 36 with a related table, 2 broken internal
    links.
- **Impact on plan:** Confirms the Phase 0 tasks for `dump/` removal, Node
  pinning, and validation. No plan changes.
- **Follow-up:** Decide whether the Pi service reads the committed `dump/`
  before removing it from git.

---

## Phase status

| Phase | Status | Started | Completed | Notes |
| --- | --- | --- | --- | --- |
| 0 — Baseline and guardrails | Done | 2026-10-29 | 2026-10-30 | Merged as `d4331b2`; CI, Cloudflare, canonical, and mirror verified |
| 1 — Metadata and catalog | In progress | 2026-10-30 | — | Implementation complete; awaiting review and PR verification |
| 2 — Templates and normalization | Not started | — | — | Depends on Phase 1; D4 approved |
| 3 — Generated navigation | Not started | — | — | Depends on Phase 2, D7, D8 |
| 4 — Dependency and code cleanup | Not started | — | — | Depends on Phases 2–3, D5, D6, D9 |
| 5 — Cutover and verification | Not started | — | — | Depends on Phases 0–4; D13 |
