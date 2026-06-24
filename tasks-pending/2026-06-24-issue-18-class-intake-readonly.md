# Issue #18 Read-Only Class Intake Reconciliation - 2026-06-24

## Raw intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-008 |
| Source | Codex chat goal kickoff from `C:\Users\User\Downloads\13-CODEX-KICKOFF-ISSUE-18-THEN-20.md`; GitHub issue #18 body and latest comments |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-24-issue-18-class-intake-readonly.md` |
| Execution run | `ops/execution-runs/2026-06-24-issue-18-class-intake-readonly/` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | `C:\Users\User\Downloads\13-CODEX-KICKOFF-ISSUE-18-THEN-20.md` |
| Goal tool used | yes, existing active goal continued |
| GitHub source | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18` |
| Next source after terminal verdict | `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20` |
| Execution directive | Finish Issue #18 first under read-only guardrails, then continue Issue #20 automatically. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no app-visible change intended for Issue #18; push/PR evidence required for run artifacts |
| Next requirement IDs to work | `REQ-20260624-028` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-028 | Produce read-only class intake reconciliation and safe dry-run backfill evidence without applying production writes. | RAW-20260624-008; GitHub issue #18 | BNA / class_drive_intake | Codex | reconciliation | P0 | A | none | Per-job census, dry-run row plan, safe-to-apply gate, tests, and terminal verdict are recorded. | `scripts/class-drive-intake-reconcile.cjs`, `tests/class-drive-intake-reconcile.test.js`, `ops/class-drive-intake/2026-06-24-issue-18/` | no | Needs verification |

## Parsed tasks

No new visible human Tasks are created. This is Codex/agent work under the existing requirement. If and only if `safe_to_apply=true`, create one Operations Decision for owner approval before any apply.

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-018 | Production class backfill apply approval | Exact approved candidate jobs and row-level dry-run plan, if any | Shloimie | Keep apply blocked until Issue #18 produces `READY FOR OWNER APPROVAL` evidence. | Apply nothing, or run a future approved apply after review. | Prevents unsafe cross-student/workspace mutation. | Review the Issue #18 dry-run evidence if `safe_to_apply=true`; do not approve apply from this run. | Future apply only | Blocked until evidence exists |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-028 | Class intake diagnostics, tests, run artifacts, GitHub issue comment | Reused and tightened read-only reconciliation script, generated sanitized issue-specific evidence, and recorded a terminal verdict. | Focused tests, run validation, source coverage, stale-evidence check, secret audit, and diff check passed. | Pending | Pending | Not applicable; no app-visible change or production write |

## Guardrails

- No `APPLY_GUARDED_CLASS_BACKFILL`.
- No production database mutation.
- No Drive moves, uploads, transcription requests, worker restarts, sends, charges, DNS, credential rotation, or public publishing.
- Secret values, transcript bodies, and private student details must not enter tracked evidence.
- `safe_to_apply=true` requires exact candidate jobs, unambiguous targets, row-level plan, idempotency, duplicate behavior, rollback evidence, UI/read-model verification, tests, secret audit, and no high-severity discrepancies.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-028 | Needs verification | `ops/class-drive-intake/2026-06-24-issue-18/TERMINAL-VERDICT.md`; `BACKFILL-RECOMMENDATION.json` has `safe_to_apply=false`, no approved candidate jobs, no row-level change plan, and expected row counts `{}`. Verdict: `NOT SAFE TO APPLY - reasons listed`. | `scripts/class-drive-intake-reconcile.cjs`; `src/lib/bna/class-drive-intake-reconcile.js`; `tests/class-drive-intake-reconcile.test.js`; `ops/class-drive-intake/2026-06-24-issue-18/`; run docs | `node --test tests\class-drive-intake-reconcile.test.js tests\class-drive-intake-shared-patch.test.js`; `npm run bna:run:validate`; `npm run bna:run:source-coverage`; `npm run bna:run:stale-evidence`; `npm run secrets:audit`; `git diff --check`; privacy scans found no raw name/transcript/question/title leaks | Push, PR, and GitHub issue #18 terminal comment pending |
