# Active Task Audit - 2026-06-11T09:53:06+03:00

Scope: audited all live Operations tasks from `/api/bna/tasks?limit=1000`
that were not `done` or `archive`.

## Starting Point

- Live tasks loaded: 234
- Active tasks before reconciliation: 43
- Watchdog status before reconciliation: OK
- Agent fleet before reconciliation: running, active Codex queue 0

## Changes Applied

- Closed verified/setup tasks:
  - #157 `Enable Codex browser-control plugins`
  - #374 `Give me a status update on this watch dog`
  - #375 `The content in the student section if their tags is Hebrew...`
- Archived stale/non-actionable captures:
  - #206 duplicate already folded into completed #205
  - #300 parser-smoke artifact with no usable provenance
- Reclassified actionable Codex work into the Codex queue:
  - #168 `Research halachic sources on fasting on Shabbos`
  - #226 `Fix Google Workspace sender display name`
  - #346 `Workflow B: Email list and past customer reactivation`
  - #351 `Workflow G: Cancellation`
  - #353 `Workflow I: Class reminders`
  - #354 `Workflow J: Recording posted`
  - #355 `Workflow K: Worksheet/source sheet posted`
  - #357 `Workflow M: Parent update`
  - #359 `Workflow O: Referral`
  - #360 `Workflow P: Testimonial/reputation`
  - #361 `Workflow Q: Organic content upload`
  - #362 `Workflow R: Organic winner to paid ad`
- Moved non-decision access/materials work out of Decisions:
  - #422 is now `Provide Rabbi software, Vimeo, library, and analytics inventory`,
    assigned to Rabbi Elie Scheller, `decision_required=false`.

## Post-Audit State

- Active tasks after reconciliation: 38
- Decisions: 13, all assigned to Shloimie with `decision_required=true`
- Shloimie assigned tasks: 10
- Rabbi Elie Scheller assigned tasks: 3
- Codex assigned tasks: 12
- Codex in progress: #346
- Codex ready to claim after #346: 11
- Unassigned active tasks: 0

## Verification

- `node --test tests/parent-student-portal-contract.test.js` passed 20/20.
- Browser and Chrome control skill files exist locally.
- Playwright dependency and `tools/screenshot-check.js` exist.
- `npm run agent:fleet:status` after reconciliation showed active Codex queue 12,
  ready to claim 11, with #346 in progress.
- `npm run watchdog:once` after reconciliation returned OK with 0 findings.
- `npm run task:reconcile -- --json --no-telegram` showed all 12 active machine
  tasks classified as `ready_or_running` and no true blockers.

