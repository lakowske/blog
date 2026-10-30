# Deployment

Last verified: 2026-10-29

## Summary

| | Canonical | Mirror |
| --- | --- | --- |
| Host | Cloudflare Workers & Pages | GitHub Pages |
| URL | <https://sethlakowske.com> | <https://lakowske.github.io/blog/> |
| Trigger | Git integration on push to `master` | `.github/workflows/deploy.yml` on push to `master` |
| Build command | `npm run build; npm run dump` | `npm run build`, then `npm run dump` |
| Output directory | `dump` | `dump` |
| Custom domain | `sethlakowske.com` | none (`cname: null`) |

The canonical site is the Cloudflare deployment. The GitHub Pages deployment is
kept as a mirror for bookmarked URLs.

## Build contract

- Source content: `public/`
- Generated output: `dump/`
- `npm run build` compiles `src/*.ts` to `dist/`.
- `npm run dump` runs `dist/server.js dump`, which indexes `public/`, injects
  the related links, and writes `dump/`.
- Cloudflare runs both commands. Do not rename `public/` or `dump/`, or change
  the build command, without updating the Cloudflare project settings and this
  document in the same change.
- `dump/` is generated. It should not be tracked in git (Phase 0).

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
- Build command: `npm run build; npm run dump`.
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
  - Unknown paths return the home page with HTTP 200 (SPA-style fallback).
  - `/robots.txt` and `/sitemap.xml` currently return the home page.
  - Phase 3 adds a real `404.html`, `robots.txt`, and `sitemap.xml`.

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

- `blog.service` and `cloudflare.service` are not installed on the Pi or
  `ubuntu-box`.
- `/home/seth/bin/blog` on `ubuntu-box` points at `~/Software/blog`, an old
  checkout at `1f35dfa` with uncommitted changes. It is not serving production.
- Nothing is listening on port 8090, and no `cloudflared` tunnel is running for
  the blog.
- These files are not the deployment source of truth. They are candidates for
  removal in Phase 4 or 5.

## Verifying a deployment

1. `npm ci && npm run build && npm run dump`
2. `node scripts/check.mjs dump`
3. Compare a sample page on both hosts:
   - <https://sethlakowske.com/articles/why-learn-haskell/>
   - <https://lakowske.github.io/blog/articles/why-learn-haskell/>
4. Check status codes and headers with `curl -sSI`.
5. Confirm bookmarked forms still resolve:
   - `/articles/why-learn-haskell/`
   - `/articles/why-learn-haskell/index.html`

## Changing the deployment

Any change to the source directory, output directory, or build command requires:

1. Updating the Cloudflare project settings.
2. Updating `.github/workflows/deploy.yml` if the mirror is affected.
3. Updating this document.
4. Verifying both deployments.
