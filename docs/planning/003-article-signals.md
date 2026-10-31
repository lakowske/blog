# 003 — Article Signals (+1)

**Feature ID:** F-001
**Status:** Approved — ready to implement
**Created:** 2026-10-30
**Owner:** Seth Lakowske
**Depends on:** none
**Enables:** F-002 (popularity ranking), optional and separate
**Related:** [001-site-restructure.md](001-site-restructure.md),
[../deployment.md](../deployment.md)

---

## 1. Summary

Add an optional +1 control to article pages. A reader can bump an article once
per browser; the count is stored in Cloudflare D1 and displayed next to the
control. The control is an augmentation: the static site renders, validates, and
deploys exactly as it does today when the feature is absent, when JavaScript is
disabled, or when the API is unavailable.

The feature is deliberately small: one table, one endpoint, one pure module, one
client script, and one template partial.

## 2. Motivation

- Give readers a lightweight way to signal interest without comments or
  accounts.
- Produce a small, honest dataset that a later ranking feature can use.
- Exercise the Pages Functions + D1 workflow on a bounded feature, so the
  operational pattern (local D1, preview, production binding, migrations) is
  proven before it is needed for anything larger.

## 3. Non-goals

- Comments, accounts, authentication, moderation, or notifications.
- Per-user public profiles or leaderboards.
- Pageview analytics or bot detection.
- Changing the home page, archive, tag pages, feed, or sitemap.
- Ranking. That is F-002 and depends on this feature's data.
- Making `npm run dump` read D1, the network, or a Cloudflare account.
- A build-time feature flag. The presence of the partial is the switch.

## 4. Hard constraints

These are invariants, not aspirations. A change that breaks one is a design
change, not an implementation detail.

### 4.1 Rendering independence

- `npm run dump` must succeed with no `.wrangler/`, no D1 binding, no network
  access, and no Cloudflare credentials.
- The build entry point and its transitive imports must not import `functions/`
  or `shared/`, and must not reference `env.DB`.
- Counts are never written into the static HTML. Every reader receives the same
  page; the count is fetched by the browser after load.
- If the API is slow, unavailable, or unbound, the page still renders and
  navigates normally.

### 4.2 Removability

- The feature is removable by deleting its files and the small set of
  integration lines listed in the checklist in section 12.
- No content file, URL, catalog entry, feed, sitemap, or navigation changes when
  the feature is removed.
- The removal test in section 10.5 is part of the definition of done.

### 4.3 Progressive enhancement

- Without JavaScript: no visible control, no errors, no layout shift.
- With JavaScript and a working API: the control appears with the current count.
- With JavaScript and a failing API: the control stays hidden; failures are not
  surfaced as page errors.

### 4.4 Dependencies

- No new runtime dependency.
- Wrangler is a development tool only, invoked through `npx`, and is not added
  to `package.json` unless a later decision changes the policy.
- The client script is plain JavaScript with no framework.

### 4.5 Privacy

- No cookies.
- No raw IP addresses stored.
- `localStorage` holds a random voter id and the per-article bumped flag. It
  holds no personal data.
- No user-facing privacy note is added (FD10).
- If server-side deduplication by address is ever added, it must store a salted
  hash, not an address, and the salt must rotate.

## 5. Architecture

### 5.1 Boundaries

| Path | Role | Runtime |
| --- | --- | --- |
| `shared/vote-core.mjs` | Pure validation, path normalization, SQL text, response shaping | workerd and Node |
| `functions/api/vote.js` | Thin HTTP shell: parse, call core, call `env.DB`, respond | workerd |
| `public/static/js/vote.js` | Progressive-enhancement client | Browser |
| `public/static/style/style.css` | Marked `.vote` rules (feature block) | Build |
| `templates/partials/vote.html` | Hidden control and script tag | Build |
| `db/schema.sql` | D1 schema | D1 |
| `wrangler.toml` | Local development binding only | Wrangler |

Rules:

- `shared/` is runtime-neutral. It may not import `node:*`, `fs`, `process`, or
  anything from `functions/`.
- `functions/` contains no business logic beyond translating HTTP to core calls
  and binding results.
- The build may read `templates/partials/vote.html`, but must not import
  `shared/` or `functions/`.

### 5.2 Request flow

1. The renderer emits a hidden control carrying the canonical path and the
   canonical origin, for example `data-vote-path="/articles/why-learn-haskell/"`
   and `data-vote-origin="https://sethlakowske.com"`.
2. The client compares `location.origin` with the canonical origin. On the
   canonical host, localhost, or a preview deployment (`*.pages.dev`) it
   continues; on any other host, including the mirror, it removes the control
   and stops.
3. The client ensures a random voter id in `localStorage`, fetches
   `GET /api/vote?path=...&voter=...`, and reveals the control with the current
   count.
4. A click sends `POST /api/vote` with the same path and voter id.
5. The Function validates and normalizes the path, inserts the vote if this
   voter has not voted on this article, and returns the count.
6. The client updates the count and marks the article as bumped in
   `localStorage`.

The canonical path comes from the catalog (`entry.url`), not from
`location.pathname`, so counts are not split by path variants.

The API origin is resolved at runtime. On the canonical host, localhost, and
preview deployments the client uses the same origin (`/api/vote`). On any other
host, including the GitHub Pages mirror, the client removes the control and does
not call the API. The mirror hostname is not hardcoded in the script; the client
compares `location.origin` with `data-vote-origin`.

### 5.3 Where the control lives

Recommended: a server-rendered partial included once from
`templates/article.html`, after `{{related}}`.

```html
{{vote}}
```

`renderArticleDocument` renders the partial with the canonical path and the
document-relative script URL, then passes the result to the article template.
The control is `hidden` until the client has a count.

The feature's CSS is a clearly marked block at the end of the shared stylesheet,
so the HTML stays valid and the partial carries only markup and the script tag.

Why not inject the control from JavaScript? It would keep the renderer entirely
unaware of the feature, but it moves semantic markup and layout into the client
and makes the no-JS state harder to reason about. The partial is a small,
explicit seam with a bounded removal cost.

Why not per-page metadata? Enabling the script through 34 `scripts` fields would
drift and would make removal a content migration.

### 5.4 Configuration

No feature flag. The feature is installed when the partial is included and the
files exist. Removing the D1 binding at runtime is the kill switch: the Function
fails, the client hides the control, and the page is unaffected.

## 6. Data model

### 6.1 Votes

```sql
CREATE TABLE IF NOT EXISTS votes (
  path TEXT NOT NULL,
  voter TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (path, voter)
);
```

The primary key enforces one bump per browser per article. `voter` is a random
id generated by the client and stored in `localStorage`; it is not derived from
the address, user agent, or any fingerprint.

Read (count plus whether this voter already has a row):

```sql
SELECT
  COUNT(*) AS bumps,
  COALESCE(MAX(voter = ?2), 0) AS voted
FROM votes
WHERE path = ?1;
```

The displayed count is `bumps + 1`. Every article therefore starts at 1 before
any reader bumps; the first reader bump displays 2.

Insert:

```sql
INSERT OR IGNORE INTO votes (path, voter) VALUES (?1, ?2);
```

`meta.changes` reports whether the insert was new. A duplicate vote leaves the
count unchanged.

### 6.2 Voter identity

- The client generates one random id per browser and stores it under a single
  `localStorage` key, for example `vote-id`.
- The same id is sent for every article; the unique key `(path, voter)` makes it
  one bump per article.
- A separate per-article key marks the control as bumped for the UI.
- Clearing storage or using another browser creates a new id and allows another
  bump. This is a soft signal, not an audited vote.
- No address, user agent, cookie, or fingerprint is stored.

### 6.3 Schema management

`db/schema.sql` is idempotent and is applied with:

```bash
npx wrangler d1 execute DB --local --file=db/schema.sql
npx wrangler d1 execute DB --remote --file=db/schema.sql
```

`DB` is the binding name used by the Function (`env.DB`). Locally it resolves to
the preview database; with `--remote` it resolves to the production database.

Introduce `wrangler d1 migrations` only when the schema changes for the first
time. Export before any production change.

## 7. API contract

### 7.1 `GET /api/vote?path=...&voter=...`

```json
{ "path": "/articles/why-learn-haskell/", "count": 1, "voted": false }
```

- `count` includes the baseline 1.
- Unknown path: `200` with `count: 1` and `voted: false`.
- `voted` is true when this voter already has a row for the path.
- Invalid path or voter: `400` with `{ "error": "invalid path" }` or
  `{ "error": "invalid voter" }`.

### 7.2 `POST /api/vote`

Request:

```json
{ "path": "/articles/why-learn-haskell/", "voter": "..." }
```

Response:

```json
{ "path": "/articles/why-learn-haskell/", "count": 2, "counted": true }
```

- `count` includes the baseline 1.
- `counted` is true when this request inserted a new vote; false for a
  duplicate.
- Invalid JSON, missing/invalid path, or missing/invalid voter: `400`.
- Wrong method: `405`.
- Storage failure: `500` with a generic message; no stack trace.

### 7.3 Cross-origin and caching

- Allow `https://sethlakowske.com` and localhost for development.
- The GitHub Pages mirror does not call the API; the client removes the control
  there.
- Echo the allowed `Origin`, send `Vary: Origin`, and handle `OPTIONS` with
  `204`.
- `Cache-Control: no-store` on every response.
- `Content-Type: application/json; charset=utf-8`.

### 7.4 Path validation

`normalizePath` is pure and shared by the client and the Function:

- must be a string;
- strip query and fragment;
- must start with `/`;
- reject `..` and `//`;
- maximum 200 characters;
- ensure a trailing slash so `/a` and `/a/` share a counter;
- reject empty or whitespace-only paths.

`voter` must be a string of 8–64 characters from `[A-Za-z0-9_-]`. It is a random
client id, not a fingerprint.

Parameterized SQL is mandatory. Validation is not authorization; it only keeps
the keys well-formed.

## 8. Client behavior

### 8.1 Markup

```html
<div class="vote" data-vote-path="/articles/why-learn-haskell/"
     data-vote-origin="https://sethlakowske.com" hidden>
  <button type="button" class="vote__button" aria-label="Bump this article">+1</button>
  <span class="vote__count" aria-live="polite"></span>
</div>
```

### 8.2 States

| State | Behavior |
| --- | --- |
| No JavaScript | Control stays hidden. |
| Mirror host | Control removed; no API request. |
| Loading | Control stays hidden; no spinner. |
| Ready | Control visible with count. |
| Bumped | Button disabled; count updated. |
| API error | Control stays hidden; no console error beyond an optional debug line. |
| Already bumped | `localStorage` marks it; the button is disabled with a neutral label. |

### 8.3 Failure handling

- On load, the client compares `location.origin` with `data-vote-origin`. If they
  differ and the host is not localhost, it removes the control and stops.
- It reads or creates `vote-id` in `localStorage` and sends it with GET and POST.
- `fetch` uses an `AbortController` with a short timeout (about 3 seconds).
- The client chooses the API origin as described in section 5.2; localhost and
  the canonical host use same-origin requests.
- No optimistic increment. The displayed count is always a server response.
- A failed POST restores the previous count and re-enables the button.
- The script never throws into the page; all failures are contained.

### 8.4 Accessibility

- A real `<button>` with an accessible name.
- The count uses `aria-live="polite"`.
- Focus styles are visible.
- State is not conveyed by color alone.
- The control is placed after the article and related links, so revealing it
  does not push the article content down.

## 9. Environments

### 9.1 Local

```bash
npm run dump
npx wrangler d1 execute DB --local --file=db/schema.sql
npx wrangler pages dev dump
```

- Local D1 is SQLite under `.wrangler/state`; no login, no network.
- `wrangler pages dev` cannot bind a remote D1, so local work cannot touch
  production.
- `npm run preview` (the zero-dependency static server) does not run Functions.
  The control stays hidden because `/api/vote` is unavailable. That is the
  intended no-API behavior, not a bug.

### 9.2 Preview

- Cloudflare Pages preview deployments should use a separate `blog-preview`
  database, or no binding at all. Preview traffic must not inflate production
  counts.
- Preview hosts (`*.pages.dev`) may show the control for testing; the GitHub
  Pages mirror does not.

### 9.3 Production

- Dashboard: Pages project → Settings → Bindings → D1, variable `DB`, database
  `blog-prod`, Production environment.
- Apply the schema with `--remote` before the first deploy that uses it.
- `functions/` is auto-detected; the build command and output directory do not
  change.

### 9.4 Guardrails

- Always pass `--local` or `--remote` explicitly.
- Name scripts by target: `db:local:*`, `db:prod:*`.
- `wrangler.toml` is local-only: no `pages_build_output_dir`, so the dashboard
  remains the production source of truth.
- `.wrangler/` and `backups/` are gitignored.
- Export before production migrations.

## 10. Testing

### 10.1 Pure core

`node --test` covers:

- path normalization and rejection cases;
- voter id validation;
- SQL text shape (no interpolation of the path or voter);
- payload shaping, including the baseline 1.

### 10.2 Handler

The handler is testable in plain Node because it uses `Request`, `Response`, and
an injected `env.DB`:

- valid GET returns the count, with a baseline of 1;
- unknown GET returns `count: 1` and `voted: false`;
- invalid path returns `400`;
- missing or invalid voter returns `400`;
- a new POST returns `counted: true` and increments the count;
- a repeated POST for the same voter returns `counted: false` and leaves the
  count unchanged;
- malformed JSON returns `400`;
- CORS headers are present for the canonical origin and absent for the mirror.

No Wrangler and no network are required for these tests.

### 10.3 Integration (optional, manual)

```bash
# terminal 1
npx wrangler pages dev dump

# terminal 2
curl -s 'http://localhost:8788/api/vote?path=/articles/why-learn-haskell/&voter=test-voter'
curl -s -X POST http://localhost:8788/api/vote \
  -H 'content-type: application/json' \
  -d '{"path":"/articles/why-learn-haskell/","voter":"test-voter"}'
npx wrangler d1 execute DB --local --command 'SELECT * FROM votes'
```

### 10.4 Rendering independence

- `rm -rf .wrangler && npm run dump && npm test` passes.
- A boundary test walks the static import graph from `scripts/dump.mjs` and
  asserts that no resolved module is under `functions/` or `shared/`.
- The same test asserts that `shared/` contains no `node:` imports.
- CI runs the normal build and tests with no Cloudflare credentials.

### 10.5 Removal test

In a scratch branch, apply section 12 and run:

```bash
npm run dump
npm test
grep -R "data-vote\|vote.js" dump/ || true
```

The build and tests must pass, and the generated output must contain no vote
markup or script. This is a manual check in the first PR; automate it if more
features adopt the same pattern.

### 10.6 Implementation tasks

- [ ] Add `db/schema.sql` and apply it to the local database.
- [ ] Add `shared/vote-core.mjs` with normalization, validation, SQL text, and
      payload shaping.
- [ ] Add `functions/api/vote.js` with `GET`, `POST`, `OPTIONS`, CORS, and
      generic error handling.
- [ ] Add `templates/partials/vote.html` and the `{{vote}}` include in
      `templates/article.html`.
- [ ] Add the renderer block that renders the partial with `entry.url`.
- [ ] Add `public/static/js/vote.js` and the marked `.vote` styles in
      `public/static/style/style.css`.
- [ ] Add voter id generation and the mirror-origin guard to the client.
- [ ] Add `wrangler.toml` (local-only) and the `.wrangler/`/`backups/` ignore
      rules.
- [ ] Add `node --test` coverage for the core and the handler.
- [ ] Add the boundary test that keeps the build graph out of `functions/` and
      `shared/`.
- [ ] Verify the local loop with `wrangler pages dev`.
- [ ] Verify the no-JavaScript and API-down states.
- [ ] Verify one bump per browser per article, including a duplicate POST.
- [ ] Verify the mirror removes the control and makes no API request.
- [ ] Run the removal test.
- [ ] Update `docs/deployment.md`, `README.md`, and the feature register.
- [ ] Record the implementation and verification in the log.

## 11. Rollout and rollback

1. Create `feature/article-signals`.
2. Add the schema, core, handler, tests, partial, client, and styles.
3. Run the local loop and the full test suite.
4. Deploy a preview with a preview D1 binding; verify CORS and counts.
5. Apply the production schema.
6. Merge; verify the canonical site and the mirror.
7. Update the register to Shipped and log the verification.

Rollback:

- Revert the PR. The site returns to its previous output.
- The D1 database can remain; nothing in the build reads it.
- If the schema changed incompatibly, export first and restore with Time Travel.

## 12. Removal checklist

Remove, in this order:

1. The `{{vote}}` line in `templates/article.html`.
2. `templates/partials/vote.html`.
3. `public/static/js/vote.js` and the marked `.vote` block in
   `public/static/style/style.css`.
4. `functions/api/vote.js`.
5. `shared/vote-core.mjs` and its tests.
6. The `vote` rendering block in `scripts/render.mjs` (the partial read and the
   `vote` variable).
7. `db/schema.sql` if no other feature uses it.
8. `wrangler.toml` if no other feature uses it.
9. The `DB` binding in the Cloudflare dashboard, and optionally the database.
10. Run `npm test` and the removal test in section 10.5.

No content file, URL, catalog entry, feed, sitemap, or navigation changes.

## 13. Acceptance criteria

- [ ] `npm run dump` succeeds with no `.wrangler/`, no network, and no
      Cloudflare credentials.
- [ ] `npm test` passes with the feature installed and after removal.
- [ ] The build import graph does not enter `functions/` or `shared/`.
- [ ] With JavaScript disabled, the page renders with no visible control and no
      errors.
- [ ] With the API unavailable, the page renders and the control stays hidden.
- [ ] With the API available, the count loads and a click increments it.
- [ ] Invalid paths return 400; valid paths are normalized.
- [ ] Every article displays 1 before any bump.
- [ ] One bump per browser per article; a duplicate POST leaves the count
      unchanged.
- [ ] The mirror removes the control and makes no API request.
- [ ] Counts are canonical-path based, not host-based.
- [ ] No cookies and no raw IP addresses are stored.
- [ ] No new runtime dependency; `npm audit` remains clean.
- [ ] The removal checklist leaves a clean build and no vote markup in `dump/`.
- [ ] `docs/deployment.md` and `README.md` document the new commands and
      bindings.

## 14. Decisions

### FD1 — Scope: +1 now, ranking as F-002

- **Options:** ship +1 and ranking together; ship +1 now and ranking as F-002;
  ship only a read-only count.
- **Decision:** ship +1 now; ranking is F-002. F-002 may influence related links
  and the Home list; the archive stays chronological.
- **Status:** Approved 2026-10-30.

### FD2 — Storage: D1

- **Options:** D1; KV; Analytics Engine; a third-party counter.
- **Recommendation:** D1. It enforces the unique `(path, voter)` key atomically,
  is durable, queryable with SQL, and free at this scale. KV read-modify-write is
  racy; Analytics Engine is for events and has three-month retention; a third
  party adds a dependency and a privacy question.
- **Status:** Approved 2026-10-30.

### FD3 — Deduplication: one bump per browser per article

- **Options:** no dedupe; localStorage only; a client-generated voter id with a
  unique database key; server-side daily hash; GitHub login.
- **Decision:** a client-generated random voter id, stored in `localStorage` and
  enforced by `PRIMARY KEY (path, voter)`. No address, user agent, cookie, or
  fingerprint is stored. Clearing storage or using another browser allows
  another bump; this is a soft signal.
- **Status:** Approved 2026-10-30.

### FD4 — Rendering seam: server-rendered partial

- **Options:** server-rendered partial; client-injected markup; per-page
  metadata.
- **Recommendation:** partial. It keeps the markup semantic, avoids layout
  shift, and scopes the script to article pages. Removal is the include line, a
  small renderer block, the marked CSS block, and the feature files.
- **If zero renderer edits is a hard requirement:** choose client-injected
  markup instead. It removes the renderer and CSS blocks, at the cost of
  client-controlled markup and a weaker no-JS story.
- **Status:** Approved 2026-10-30.

### FD5 — Counts in HTML: never

- **Options:** bake counts at build time; fetch them client-side; server-render
  them per request.
- **Recommendation:** client-side fetch. Baking counts makes the build depend on
  D1 or a snapshot; server-rendering would require making the site dynamic. The
  static page must stay identical for every reader.
- **Status:** Approved 2026-10-30.

### FD6 — Mirror: do not show the control

- **Options:** canonical host only; allow the GitHub Pages mirror; run a second
  API.
- **Decision:** the mirror removes the control and does not call the API. CORS
  allows only the canonical origin and localhost. The control carries the
  canonical origin so the client can detect the mirror.
- **Status:** Approved 2026-10-30.

### FD7 — Local tooling: Wrangler via npx

- **Options:** add Wrangler as a devDependency; invoke it with `npx`; build a
  custom local API.
- **Recommendation:** `npx` with a pinned major version. It keeps the repository
  dependency-free and the production build unaffected. Revisit if CI needs
  Wrangler.
- **Status:** Approved 2026-10-30.

### FD8 — Kill switch: remove the binding

- **Options:** a build-time flag; a runtime flag; remove the D1 binding.
- **Recommendation:** no flag. Removing the binding makes the Function fail and
  the client hide the control; the page is unaffected. A build flag would add
  feature-specific logic to the renderer.
- **Status:** Approved 2026-10-30.

### FD9 — Baseline: every article starts at 1

- **Options:** start at 0; start at 1; seed a row per article.
- **Decision:** start at 1. The database stores reader bumps only; the API
  returns `bumps + 1`. The first reader bump displays 2. No seed rows are needed,
  so new articles are correct automatically.
- **Status:** Approved 2026-10-30.

### FD10 — No user-facing privacy note

- **Options:** add a footer/About note; no note.
- **Decision:** no note. The feature stores no address, user agent, cookie, or
  fingerprint; the voter id is a random local identifier.
- **Status:** Approved 2026-10-30.

## 15. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Counts are inflated by clearing storage or scripts | Medium | Low | Treat counts as soft signals; the voter id is not a security boundary. |
| Low traffic makes counts noisy | High | Low | Do not rank on them in F-001; require a minimum and a window in F-002. |
| D1 or the Function is unavailable | Low | Low | The control stays hidden; the page is unaffected. |
| The mirror accidentally reveals the control | Low | Low | Client origin guard; verify the mirror makes no API request. |
| A remote D1 command is run by mistake | Low | High | Explicit `--local`/`--remote`; separate script names; export before production changes. |
| The feature creeps into ranking | Medium | Medium | F-002 is separate; the register records the dependency. |
| Removal leaves stale references | Medium | Medium | The removal checklist and the removal test. |
| Wrangler version drift | Low | Medium | Pin the `npx` major; record the version in the PR. |
| Layout shift when the control appears | Low | Low | Place it after the article; reveal it in place; no spinner. |

## 16. Resolved questions

- **Count visibility and baseline:** the count is visible and starts at 1 (FD9).
- **Bump frequency:** one bump per browser per article (FD3).
- **Mirror:** the mirror does not show the control (FD6).
- **Privacy note:** none (FD10).
- **F-002 surfaces:** related links and the Home list; the archive stays
  chronological (FD1).

All decisions are approved. F-001 is ready to implement.

## 17. Relationship to other work

- **001** is complete through Phase 4; Phase 5 is its close-out. This feature
  does not change the restructure phases.
- **F-002 (popularity ranking)** is deliberately separate. It depends on F-001's
  data and may influence related links and the Home list; the archive stays
  chronological. It must preserve rendering independence: if it bakes a snapshot
  into the build, the snapshot is optional and the build falls back to the
  current order when it is absent.
- **F-003 (source HTML validation)** is independent.
