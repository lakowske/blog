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
Build and generate the static site:

```
npm ci
npm run build
npm run dump
```

Validate metadata and review generated summaries:

```
npm run catalog:report
```

Validate the generated site:

```
npm test
```

Preview the generated site:

```
python3 -m http.server -d dump 8090
```

`npm run serve` starts the legacy in-memory Node server. It is not the
production deployment; Cloudflare builds and serves `dump/`.

Environment variables
===
* `PORT` — port for the legacy local server (default: 8090).
* `USE_CACHE` — legacy; the current dump pipeline does not use the on-disk
  cache.

`OPENAI_API` is no longer used.
