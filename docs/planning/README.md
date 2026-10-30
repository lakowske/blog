# Planning Documents

This directory holds plans, decision notes, and implementation history for the
blog. It lives outside `public/` so the content pipeline never indexes or
publishes it.

## Documents

| Document | Purpose |
| --- | --- |
| [001-site-restructure.md](001-site-restructure.md) | Phased plan for normalizing page structure, adding metadata, and generating navigation. **Phase 0 approved; Phases 1–5 draft.** |
| [002-source-html-validation.md](002-source-html-validation.md) | Future work: catch malformed source HTML before jsdom or templates repair it. **Not scheduled.** |
| [implementation-log.md](implementation-log.md) | Append-only record of what was actually done, what differed from the plan, and what was learned. |

Deployment details live in [../deployment.md](../deployment.md), and authoring
conventions live in [../content.md](../content.md). Both are outside this
directory because they apply to the whole repository, not just the plan.

Future plans should use the same numbering convention: `NNN-short-slug.md`.

## Workflow

1. **Review the plan.** Read the phase details and the decisions section. Mark
   decisions as approved, changed, or rejected directly in the document.
2. **Approve one phase at a time.** No code changes begin until the phase's
   tasks and decisions are agreed.
3. **Implement the phase.** Tick tasks in the plan as they are completed.
4. **Log as you go.** Add an entry to `implementation-log.md` for every
   deviation, surprise, blocker, or decision made during implementation.
5. **Close the phase.** Update the status table and record the exit criteria
   that were met (or waived).

## Status values

Use these consistently in the plan's phase table:

- **Not started** — no work begun.
- **In progress** — work underway.
- **Blocked** — waiting on a decision or external dependency.
- **Done** — exit criteria met and logged.

Task checkboxes use standard Markdown: `- [ ]` for open, `- [x]` for done.

## Why not put plans in `public/`?

`src/ContentUtils.ts` walks every file under `public/`, and `dumpContent()`
writes every indexed file to the output. A Markdown file under `public/` would
be served as a downloadable asset and would appear in the index. Keeping
planning material in `docs/` avoids that entirely.
