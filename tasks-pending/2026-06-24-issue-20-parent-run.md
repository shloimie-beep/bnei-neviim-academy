# Issue #20 Parent Run - 2026-06-24

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-009 |
| Source | GitHub issue #20 |
| Source URL | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-24-issue-20-parent-run.md` |
| Execution run | `ops/execution-runs/2026-06-24-issue-20-parent-run/` |
| Working branch | `codex/issue-20-parent-run-20260624` |
| Base branch | `codex/issue-18-class-intake-readonly-20260624` |

## Sequencing

Issue #18 is terminal before this parent run starts.

| Field | Value |
|---|---|
| Issue #18 verdict | `NOT SAFE TO APPLY - reasons listed` |
| Issue #18 PR | `https://github.com/shloimie-beep/bnei-neviim-academy/pull/21` |
| Issue #18 terminal comment | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18#issuecomment-4792923047` |
| Parent run rule | This Issue #20 run owns `ops/execution-runs/latest.json`; child lanes must not rewrite it. |

## Parsed Requirements

| ID | Requirement | Source | Owner | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260624-040 | Register Issue #20 parent run, recheck baseline truth, and create coordination manifest. | Issue #20 objective, baseline, execution ordering | Codex | 0 | none | no | Done |
| REQ-20260624-041 | Audit/fix global visual quality, design invariants, and permanent visual watchdogs. | Requirement group A | Codex | A | REQ-20260624-040 | yes | Not started |
| REQ-20260624-042 | Build secure persistent authenticated browser profile harness and ChatGPT Agent distinction docs. | Requirement group B | Codex | B | REQ-20260624-040 | no | Not started |
| REQ-20260624-043 | Build helper/bot canonical resolver, intent matrix, and agent-mode role QA. | Requirement group C | Codex | C | REQ-20260624-040 | yes | Not started |
| REQ-20260624-044 | Build/verify durable agent result drop-off and GitHub issue/comment bridge. | Requirement group D | Codex | D | REQ-20260624-040 | yes | Not started |
| REQ-20260624-045 | Harden agent fleet, permission tiers, startup, parent coordination, and background proof. | Requirement group E | Codex | E | REQ-20260624-040 | no | Not started |
| REQ-20260624-046 | Reconcile queue hygiene and owner-facing lanes without erasing history. | Requirement group F | Codex | F | REQ-20260624-040 | yes | Not started |
| REQ-20260624-047 | Create owner setup/walkthrough page and repo artifact. | Requirement group G | Codex | G | REQ-20260624-040 | yes | Not started |
| REQ-20260624-048 | Integrate, test, PR/merge/deploy/live-verify, clean up, and produce final 27-section response. | Release/final response | Codex | Z | REQ-20260624-041 through REQ-20260624-047 | yes | Not started |

## Parsed Tasks

No new visible human Tasks are created at registration. This is Codex/agent work under the active parent run. True external-account, credential, DNS, send, charge, publish, or production-mutation blockers must become Decisions when encountered.

## Decisions

No immediate owner Decision is created at registration. Future Decisions must be one-per-blocker and must not duplicate existing external blockers.

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-040 | Run files, `TASKS.md`, raw intake, coordination manifest | Register parent run, recheck baseline, write coordination rules. | Baseline readback, live health readback, Issue #18 GitHub evidence, and coordination manifest recorded. | Pending checkpoint commit | Pending push | Not required |
| REQ-20260624-041 | Public/Operations/provider/parent/student/One Time/support UI, watchdogs, tests | Audit rendered UI, implement shared invariants, add watchdogs. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-042 | Browser harness scripts, profile storage docs, tests | Build secure local profile manager and role smokes. | Pending | Pending | Pending | Not required unless app-visible docs/page added |
| REQ-20260624-043 | Helper/bot resolver, route/action registries, tests, browser QA | Enforce canonical scoped links/actions and deterministic matrix. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-044 | Result API/action, Operations activity UI, GitHub intake/status bridge | Make agent result drop-off durable and idempotent. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-045 | Agent fleet scripts, startup scripts, coordination manifest, tests | Harden existing fleet and prove background flow. | Pending | Pending | Pending | Not required unless app-visible work is added |
| REQ-20260624-046 | Operations queue APIs/UI, queue audits, tests | Reconcile lanes and hide stale/internal current-work clutter. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-047 | Owner walkthrough page/docs | Produce setup and recovery walkthrough. | Pending | Pending | Pending | Required before Done |
| REQ-20260624-048 | Integration branch/PR/deploy/live-smoke/closeout | Integrate all terminal lanes and produce final response. | Pending | Pending | Pending | Required before Done |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-040 | Done | Raw source captured; parent run initialized; Issue #18 terminal evidence linked; baseline readback and parent coordination manifest recorded. | `raw-input/RAW-20260624-009-github-issue-20-goal.md`; run files; this register; `TASKS.md`; `memory/2026-06-24.md` | Issue #18 PR/comment verified; direct live health HTTP 200; Railway targeting blocker recorded for final release; run validation pending after checkpoint updates | None for baseline. Final deploy/live closeout remains blocked until Railway targeting is repaired or an approved alternate live-smoke path is recorded under `REQ-20260624-048`. |
