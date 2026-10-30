# 002 — Source HTML Validation

**Status:** Future work. Not scheduled and not part of the six-phase restructure.
**Created:** 2026-10-30
**Owner:** Seth Lakowske
**Related:** [001-site-restructure.md](001-site-restructure.md), decision D14.

## Why

The current build parses every page with jsdom and serializes the DOM. jsdom
follows browser HTML parsing rules, so it silently repairs malformed markup.
That makes the published output well-formed, but it hides authoring mistakes
from the person writing the page.

Examples already in the source:

- `public/articles/monadic-shell-scripts/index.html`:
  `<h2>Monadic shell scripts</title>` and a missing `</html>`.
- `public/articles/why-run-docker-containers-and-kubernetes/index.html`:
  the related table sits after `</body>`, and headings use uppercase tags.
- `public/articles/start-emacs-in-dired-mode/index.html`:
  `<pre>` is nested inside `<p>`.
- `public/articles/living-offgrid-on-a-solar-powered-boat/index.html`:
  missing `</body>`.
- Several pages use obsolete `pubdate` instead of `datetime`.
- `2021-06-1` is not a valid ISO date.

The goal is to catch these at authoring time, with file and line information,
before jsdom or the template engine quietly fixes them.

## Goals

- Validate source files before the build repairs them.
- Report actionable errors with file, line, and rule.
- Work for full pages now and for body fragments after Phase 2.
- Keep validation development-only; no runtime dependency.
- Enforce it in CI once the baseline is clean.

## Non-goals

- Replacing jsdom now. D14 keeps it in the legacy pipeline until Phase 4.
- Full W3C conformance for every generated page. The zero-dependency
  `scripts/check.mjs` already covers links, titles, duplicate IDs, and key
  metadata.
- Adding a runtime dependency.
- Blocking the current restructure phases.

## Candidate approaches

| Approach | Pros | Cons |
| --- | --- | --- |
| Editor integration (VS Code HTML validation, HTMLHint, Webhint) | Immediate feedback; no repo changes | Not enforced in CI; editor-specific |
| Dev-only `html-validate` or similar | Standards-based; CLI and CI; good messages | Adds a dev dependency and config; fragments need wrapping |
| Custom zero-dependency checks in `scripts/` | No dependency; tailored to our rules | Limited; optional tags and fragments make parsing hard; false-positive risk |
| Pre-commit hook | Catches issues before commit | Per-clone setup; bypassable; maintenance |
| CI-only source validation | Enforced for pull requests | Later feedback; baseline may be noisy |

## Recommended direction

1. **Do this after Phase 2.** Once pages are body fragments rendered through
   templates, the source is smaller and the validator can focus on authoring
   mistakes rather than duplicated document chrome.
2. **Choose a dev-only validator** that can handle both full documents and
   fragments (wrapping a fragment in a minimal document is acceptable).
3. **Run it on `public/` in CI** before `npm run dump`, with file and line
   output.
4. **Keep `scripts/check.mjs`** for output-level link and metadata checks. The
   two tools answer different questions: “is the source well-formed?” versus
   “does the generated site link correctly?”
5. **Start with a baseline or allowlist** for legacy issues, then remove it as
   pages are normalized.
6. **Document the command** in the README and the plan.

## Open questions

- Full HTML5 conformance, or a targeted rule set?
- Which validator, and how should it handle fragments?
- Validate source only, generated output only, or both?
- Run in CI, in a pre-commit hook, or both?
- How do we avoid duplicating checks between the source validator and
  `scripts/check.mjs`?
- Do we want an authoring-time wrapper that renders a fragment through the real
  template before validating it?

## Acceptance criteria (when scheduled)

- `npm run lint:html` validates `public/` with no unwaived errors.
- CI runs it on pull requests.
- Errors include file and line.
- No runtime dependency is added.
- The README documents the command and the difference from `npm test`.

## Relationship to 001

This is future work and does not change the six phases. Phase 2 fixes the known
malformed pages, removes duplicated document chrome, and generates structure
from templates. This effort can then focus on fragments and authoring-time
feedback, and can run before or alongside the Phase 4 dependency cleanup.
