Blog
====

Blog posts and articles by Seth Lakowske.

Documentation
===
* [Content authoring](docs/content.md) — metadata, dates, tags, summaries, and commands.
* [Deployment](docs/deployment.md) — canonical host, mirror, build contract, and URL policy.
* [Planning](docs/planning/README.md) — restructure plan and implementation log.

Run
===
Install dependencies and generate the static site:

```
npm ci
npm run dump
```

`npm run build` still compiles the legacy TypeScript server; the static dump no
longer uses it. It remains until the Phase 4 cleanup.

Validate metadata and review generated summaries:

```
npm run catalog:report
```

Validate the generated site:

```
npm test
```

Serve an existing build:

```
npm run preview
```

Build and serve in one step:

```
npm run serve
```

The previews serve `dump/` on port 8090. Cloudflare builds and serves the same
static output in production.

View without a server:

```
npm run dump
```

Then open `dump/index.html` in a browser. All internal links are
document-relative, so `file://` navigation works. Directory URLs such as
`/articles/` are not resolved by `file://`; use the links from the home page or
open `dump/articles/index.html` directly.

Environment variables
===
* `PORT` — legacy; the static preview uses 8090.
* `USE_CACHE` — legacy; the current dump pipeline does not use the on-disk
  cache.

`OPENAI_API` is no longer used.
