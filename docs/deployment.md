# Deployment

Last verified: 2026-10-30

## Summary

| | Canonical | Mirror |
| --- | --- | --- |
| Host | Cloudflare Workers & Pages | GitHub Pages |
| URL | <https://sethlakowske.com> | <https://lakowske.github.io/blog/> |
| Trigger | Git integration on push to `master` | `.github/workflows/deploy.yml` on push to `master` |
| Build command | `npm run dump` | `npm run dump` |
| Output directory | `dump` | `dump` |
| Custom domain | `sethlakowske.com` | none (`cname: null`) |

The canonical site is the Cloudflare deployment. The GitHub Pages deployment is
kept as a mirror for bookmarked URLs.

## Build contract

- Source content: `public/`
- Generated output: `dump/`
- `npm run dump` runs `scripts/dump.mjs`, which first validates metadata and
  writes `dump/catalog.json` with `scripts/catalog.mjs`, then runs
  `scripts/render.mjs` to render the body fragments through the templates and
  write `dump/`.
- `npm run build` is an alias for `npm run dump`. It is kept only so the older
  Cloudflare build command (`npm run build; npm run dump`) keeps working; new
  configuration should use `npm run dump` alone.
- The build has no dependencies. Node 22 is the only requirement.
- The renderer also generates `articles/index.html` (archive),
  `tags/<tag>/index.html`, `feed.xml`, `sitemap.xml`, `robots.txt`, and
  `404.html`.
- Cloudflare runs both commands. Do not rename `public/` or `dump/`, or change
  the build command, without updating the Cloudflare project settings and this
  document in the same change.
- `dump/` is generated. It should not be tracked in git (Phase 0).
- `dump/catalog.json` is generated from page metadata on every build. It is
  published and served with `Cache-Control: no-cache` via `dump/_headers`.

## URL policy

- Preserve every existing URL path. Do not rename slugs or move output paths.
- Use document-relative links, not root-relative links. The GitHub Pages mirror
  lives under `/blog/`, so a root-relative link such as `/articles/...` would
  break there.
- Both directory URLs (`/articles/slug/`) and explicit `index.html` URLs must
  keep working.
- Canonical URLs should point at `https://sethlakowske.com/...` on both
  deployments.

## Cloudflare details

- Product: Workers & Pages (confirmed by Seth, 2026-10-29).
- Build command: `npm run build; npm run dump`. This still works because
  `npm run build` is an alias for `npm run dump`; change it to `npm run dump`
  when convenient to avoid rendering twice.
- Output directory: `dump` (inferred from the live output; confirm in the
  project settings).
- Node version: configured in the Cloudflare project. If it is not pinned there,
  set `NODE_VERSION=22` to match `.nvmrc`.
- Observed response headers:
  - HTML: `cache-control: public, max-age=0, must-revalidate`
  - Assets: `cache-control: public, max-age=14400, must-revalidate`
  - `server: cloudflare`
  - `access-control-allow-origin: *`
- Observed behavior:
  - `/index.html` returns a 308 redirect to `/`.
  - A top-level `404.html` is generated. Cloudflare Pages serves it for unknown
    paths once a top-level 404 exists; the previous SPA fallback was because no
    top-level 404 was present. Verified 2026-10-30: unknown paths return 404 on
    both the canonical site and the GitHub Pages mirror.
  - `/robots.txt` and `/sitemap.xml` are generated with the site build.

## GitHub Pages mirror

- URL: <https://lakowske.github.io/blog/>
- Workflow: `.github/workflows/deploy.yml`
- GitHub Pages API: `build_type: workflow`, `cname: null`.
- The mirror must keep working for bookmarked URLs. Document-relative links are
  required.
- `.nojekyll` is required.
- `dump/CNAME` currently contains `sethlakowske.com`, but GitHub Pages reports
  no custom domain. Treat the file as legacy and do not rely on it. Revisit in
  Phase 5.

## Legacy deployment files

- Phase 4 removed `blog.service`, `cloudflare.service`, `src/`, `tsconfig.json`,
  and `.dockerignore`. They were never installed on the Pi or `ubuntu-box`, and
  `/home/seth/bin/blog` on `ubuntu-box` points at an old checkout that never
  served production. Git history retains them.
- Nothing is listening on port 8090, and no `cloudflared` tunnel is running for
  the blog. The preview server is local-only and not part of deployment.

## Verifying a deployment

1. `npm run dump`
2. `node scripts/check.mjs dump`
3. Compare a sample page on both hosts:
   - <https://sethlakowske.com/articles/why-learn-haskell/>
   - <https://lakowske.github.io/blog/articles/why-learn-haskell/>
4. Check status codes and headers with `curl -sSI`.
5. Confirm bookmarked forms still resolve:
   - `/articles/why-learn-haskell/`
   - `/articles/why-learn-haskell/index.html`
6. Verify `/catalog.json`:
   - canonical: 200 with `cache-control: no-cache`
   - mirror: 200; GitHub Pages ignores `_headers`, so it uses its own caching

## Changing the deployment

Any change to the source directory, output directory, or build command requires:

1. Updating the Cloudflare project settings.
2. Updating `.github/workflows/deploy.yml` if the mirror is affected.
3. Updating this document.
4. Verifying both deployments.
