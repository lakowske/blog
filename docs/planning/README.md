# Planning Documents

This directory holds plans, decision notes, and implementation history for the
blog. It lives outside `public/` so the content pipeline never indexes or
publishes it.

## Two kinds of work

**001 — Site restructure** is a one-off, sequential plan. Its phases 0–5 describe
the restructure; phases 0–4 are complete and Phase 5 is the close-out. The phase
numbers are historical; do not add Phase 6.

**Features** are independent units of work. Each has a permanent `F-NNN` id and a
status in the register below. Features may be picked up in any order.
Dependencies are explicit, but they do not imply that a dependency is next.

The restructure established the build contract. Features build on it without
assuming a sequence.

## Feature register

| ID | Feature | Design doc | Status | Depends on |
| --- | --- | --- | --- | --- |
| F-001 | Article +1 signals | [003-article-signals.md](003-article-signals.md) | Approved — ready to implement | — |
| F-002 | Popularity ranking (related links + Home; archive unchanged) | not written | Deferred — needs F-001 | F-001 |
| F-003 | Source HTML validation | [002-source-html-validation.md](002-source-html-validation.md) | Proposed — not scheduled | — |

Rules:

- IDs are permanent. Never renumber or reuse an ID.
- The number identifies the feature; it does not imply priority or sequence.
- A feature may be deferred or rejected; its ID stays in the register.
- "Depends on" means the feature cannot ship until the dependency is Shipped.
  It says nothing about what to work on next.
- The register is the source of truth for feature status. The implementation log
  records history; it does not decide order.

**F-002 scope (2026-10-30):** popularity may influence related links and the
Home list; the archive stays chronological. F-002 still needs its own design
doc.

## Status values

| Status | Meaning |
| --- | --- |
| Proposed | Written and awaiting review. |
| Approved | Reviewed; ready to implement. |
| In progress | Implementation underway. |
| Blocked | Waiting on a decision, dependency, or external change. |
| Shipped | Merged, verified, and live. |
| Deferred | Intentionally not now; may return. |
| Rejected | Decided against; kept for the record. |
| Removed | Shipped, then removed; the removal checklist was followed. |

Task checkboxes use standard Markdown: `- [ ]` for open, `- [x]` for done.

## Feature document template

A feature document should answer these questions in this order:

1. **Summary and motivation** — what it does and why it is worth the state.
2. **Non-goals** — what it deliberately does not do.
3. **Hard constraints** — invariants that must survive implementation and
   removal. Include rendering independence if the feature adds a runtime
   dependency.
4. **Architecture** — the pure core, the thin shell, and the seam to the
   existing site.
5. **Data and API** — schema, contract, validation, and failure modes.
6. **Environments** — local, preview, and production, and how they are kept
   apart.
7. **Testing** — pure tests, handler tests, integration, and the removal test.
8. **Rollout and rollback** — how it ships and how it is undone.
9. **Removal checklist** — the exact files and lines to delete.
10. **Acceptance criteria** — observable, testable conditions.
11. **Decisions** — `FD1`, `FD2`, … with options, recommendation, and status.
12. **Risks and open questions**.

## Workflow

1. **Review the feature.** Read the design doc and mark each decision approved,
   changed, or rejected directly in the document.
2. **Approve it.** Move the register status to Approved.
3. **Implement on `feature/<slug>`.** One branch and pull request per feature.
   Tick tasks in the design doc as they are completed.
4. **Log as you go.** Append to `implementation-log.md` for every deviation,
   surprise, blocker, or decision. Use `Feature: F-001` in the entry.
5. **Ship it.** Verify both hosts, update the register to Shipped, and record the
   verification in the log.
6. **Remove it if needed.** Follow the removal checklist, run the build and
   tests, and update the register to Removed.

## Documents

| Document | Purpose |
| --- | --- |
| [001-site-restructure.md](001-site-restructure.md) | Historical phased plan for normalizing page structure, adding metadata, and generating navigation. **Phases 0–4 done; Phase 5 is the close-out.** |
| [002-source-html-validation.md](002-source-html-validation.md) | Feature F-003: catch malformed source HTML before templates repair it. **Proposed; not scheduled.** |
| [003-article-signals.md](003-article-signals.md) | Feature F-001: optional article +1 backed by D1. **Approved; ready to implement.** |
| [implementation-log.md](implementation-log.md) | Append-only record of what was actually done, what differed from the plan, and what was learned. |

Deployment details live in [../deployment.md](../deployment.md), and authoring
conventions live in [../content.md](../content.md). Both are outside this
directory because they apply to the whole repository, not just the plan.

Future design documents should use the same numbering convention:
`NNN-short-slug.md`. The number orders the documents, not the work.

## Why not put plans in `public/`?

The build walks `public/`, and every file there can be served. A Markdown file
under `public/` would be published as a downloadable asset and could appear in
the catalog. Keeping planning material in `docs/` avoids that entirely.
