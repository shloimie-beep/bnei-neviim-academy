# Active Queue Reconciliation - One Time Local Beta Hardening

Generated: 2026-06-20T20:39:35+03:00
Command: `npm run ops:audit-queue -- --no-live --no-write --json`

## Scope

This audit is the first local queue baseline for
`REQ-20260619-407`. It uses repo/runtime evidence only and intentionally skips
live task reads.

## Queue Tooling Found

- `public/operations.html` contains the current Operations dashboard and task
  UI.
- Operations defines visible task lanes/views for Decisions, Pending, Tasks,
  Codex Queue, Calendar, and Done / Activity.
- `scripts/ops-queue-audit.mjs` can audit repo/runtime/lifecycle evidence and
  optionally read live task state from API or database credentials.
- `scripts/task-queue-reconciler.mjs` contains reconciliation logic and an
  explicit `--apply` mode; dry-run is the default.

## No-Live Baseline Counts

| Status | Count |
| --- | ---: |
| active_fresh | 0 |
| active_stale | 187 |
| blocked | 56 |
| pending_shloimie | 2 |
| pending_external | 118 |
| completed_verified | 307 |
| done_missing_report | 0 |
| duplicate | 97 |
| abandoned_unknown | 60 |
| do_not_redo | 421 |

Warnings:

- Live task source was unavailable or returned no tasks; live-state confidence
  is low.
- Live task read was skipped with `--no-live`.

## IA Findings

- Decisions-first terminology is present in `public/operations.html`.
- Human/external blockers are separated from Codex lifecycle status in the UI
  copy and task bucketing helpers.
- Codex Queue exists as its own machine-work focus.
- Done / Activity is available for completion history and proof follow-up.

## Hardening Gaps

- The no-live audit shows 187 stale active items and 60 abandoned/unknown items
  from repo/runtime evidence. These are not automatically safe to requeue.
- Pending has two meanings in raw source material: operator/human pending and
  external-service pending. The app copy already warns that human Pending is
  not Codex Queue, but this still needs a live/UI smoke pass.
- The task reconciler has an apply mode. It must remain manual/explicit and
  should not be used in this local hardening stage without reviewing the dry-run
  candidate list first.
- First dry-run found a local false positive:
  `create_missing_ui_brand_task` was proposed when live tasks were skipped,
  even though repo evidence already marks task #402 done/verified.
- Live-state confidence remains low until authenticated API or database reads
  are available.

## Local Fix Applied

- `scripts/task-queue-reconciler.mjs` now checks durable repo evidence before
  suggesting the UI brand-shell backfill in no-live mode.
- `tests/task-queue-reconciler.test.js` now verifies completed repo evidence is
  treated as existing work.
- Verification:
  - `node --check scripts/task-queue-reconciler.mjs` passed.
  - `node --test tests/task-queue-reconciler.test.js` passed, 7/7.
  - Follow-up `npm run task:reconcile -- --no-live --no-telegram` reported
    `Actions: 0` in
    `ops/system-audits/2026-06-20T17-47-42-557Z-task-queue-reconciler.md`.

## Next Actions

1. Inspect whether any `tasks-pending/*.md` briefs appear as operator-facing
   planned/pending brief sections, which AGENTS.md forbids.
2. Browser-check the Operations Tasks view locally after the app is running.
3. Convert any confirmed stale/incorrect queue behavior into implementation
   work under `REQ-20260619-407` or a later hardening requirement.
