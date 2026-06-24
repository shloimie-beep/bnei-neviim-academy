# Queue Hygiene and Owner Clarity

Requirement: `REQ-20260624-046`

Status: blocked: local implementation verified, deploy/live proof pending under
`REQ-20260624-048`.

## Scope

Batch F reconciles owner-facing Operations queue behavior so current work is not
blurred with internal handoff files, stale duplicates, machine history, or
completed audit rows.

## Implementation

- `/api/bna/tasks` accepts `status_bucket=codex_queue`, and server-side task
  classification moves agent jobs, machine-owned rows, and active agent
  lifecycle states into `codex_queue` before external-waiting logic.
- The Operations Tasks default owner view now starts with Active Now, Needs
  Your Decision, Waiting Externally, Recently Completed, and Full History /
  Search.
- Operational lanes still expose My Tasks, One Time Tasks, Codex / Agent Work,
  Due Soon, Calendar, and Archived for deeper review.
- Machine work is separated from the human/external waiting lane in both
  client-side bucket logic and server-side filters.
- The queue census contract now emits owner default views and operational task
  views, with Codex / Agent Work separate from Waiting Externally.
- Cleanup remains audit-safe: this batch does not hard-delete canonical history,
  Issue #18 records, archived rows, or duplicate-linked provenance.

## Files

- `server.js`
- `public/operations.html`
- `scripts/task-decision-census.mjs`
- `tests/operations-task-queue-visibility.test.js`
- `tests/task-decision-census.test.js`

## Verification

- `node --check server.js`
- `node --check scripts\task-decision-census.mjs`
- `node --check tests\operations-task-queue-visibility.test.js`
- `node --check tests\task-decision-census.test.js`
- `node --test tests\operations-activity-queue-health-ui.test.js tests\operations-task-queue-visibility.test.js tests\task-decision-census.test.js tests\ops-queue-reconciler.test.js tests\task-queue-reconciler.test.js tests\workspace-task-no-stale-agent.test.js`
  - Result: 23/23 passed.
- `npm run watchdog:actions`
  - Result: 0 findings.
- `node scripts\task-decision-census.mjs --json --no-live --no-write`
  - Result: emitted the owner default/operational view contract with live reads
    intentionally skipped and no files written.

## Blocker

This requirement changes the Operations UI/API owner queue behavior, so it is
not terminal Done until deploy/live proof exists. Final deployment and live
smoke remain gated by `REQ-20260624-048`, where the Railway CLI targeting
blocker is recorded.

Next action: continue `REQ-20260624-047` owner setup and walkthrough while the
final deploy/live gate remains open.
