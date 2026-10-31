Blog
====

Blog posts and articles by Seth Lakowske, built into static HTML.

Documentation
===
* [Content authoring](docs/content.md) — metadata, dates, tags, summaries, and commands.
* [Deployment](docs/deployment.md) — canonical host, mirror, build contract, and URL policy.
* [Planning](docs/planning/README.md) — restructure plan, feature register, and implementation log.

Requirements
===
Node.js 22 or newer (see `.nvmrc`). There are no dependencies to install: the
build, validator, tests, and preview server use only Node's standard library.

Run
===
Generate the site:

```
npm run dump
```

Preview it:

```
npm run serve
```

`npm run serve` builds and then serves `dump/` at <http://localhost:8090/>.
`npm run preview` serves an existing build without rebuilding, and
`npm run preview 8000` uses a different port.

Rebuild on change:

```
npm run watch
```

Validate metadata and review generated summaries:

```
npm run catalog:report
```

Validate the generated site:

```
npm test
```

Layout
===
```
public/          source pages as HTML body fragments (plus static assets)
templates/       base, article, page, and bare layouts
scripts/         zero-dependency build, validation, and preview tools
site.json        site title, author, base URL, tag vocabulary, nav
docs/            authoring, deployment, and planning documents
dump/            generated output (not tracked)
```

Open without a server:

```
npm run dump
```

Then open `dump/index.html` in a browser. All internal links are
document-relative, so `file://` navigation works. Directory URLs such as
`/articles/` are not resolved by `file://`; use the links from the home page or
open `dump/articles/index.html` directly.

Environment variables
===
The build needs no environment file. The preview server reads:

* `PORT` — port to listen on (default `8090`).
* `DUMP_DIR` — directory to serve (default `dump`).

Deployment
===
Both deployments rebuild `dump/` from a push to `master`: Cloudflare Pages serves
<https://sethlakowske.com>, and GitHub Pages mirrors it at
<https://lakowske.github.io/blog/>. See [Deployment](docs/deployment.md).
