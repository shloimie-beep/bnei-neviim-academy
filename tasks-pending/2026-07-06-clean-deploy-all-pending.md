# Ramble Intake - 2026-07-06 - Clean Deploy All Pending Work

## Raw intake

Raw source preserved at:

- `raw-input/RAW-20260706-970-clean-deploy-all-pending.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-970 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-clean-deploy-all-pending.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Clean up the current BNA / One Time ramble-derived work: inventory undeployed or dirty items, debug and verify safe code changes, deploy only eligible scoped work, record blockers for unsafe/external items, and report current status plus next steps clearly. |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260706-971 through REQ-20260706-974 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260706-970 | Preserve and register the broad cleanup request. | RAW-20260706-970 | bna_platform / release_workflow | Codex | intake | P0 | B0 | None | Raw source and this cleanup register exist with goal-mode scope and safety boundaries. | raw-input, tasks-pending | No | Done |
| REQ-20260706-971 | Inventory local dirty work, branch drift, upstream status, open PRs, latest execution run, and recent ramble registers. | RAW-20260706-970 | bna_platform / release_workflow | Codex | audit | P0 | B1 | REQ-20260706-970 | Current state is classified into already live, safe-to-publish, blocked, and unrelated/unsafe buckets with exact evidence. | git/GitHub/readback outputs, this register | No | Done |
| REQ-20260706-972 | Debug and verify any scoped pending code that is eligible for publication. | RAW-20260706-970 | bna_platform; rabbi_sheller_provider / one_time_mishnah_class | Codex | verification | P0 | B2 | REQ-20260706-971 | Focused tests, watchdogs, and smoke checks pass for the scoped candidate before any deploy. | Vimeo folder-library workflow and records | No app-visible route/UI change | Done |
| REQ-20260706-973 | Deploy only eligible app-visible or server-visible work through the approved release path. | RAW-20260706-970 | bna_platform; rabbi_sheller_provider / one_time_mishnah_class | Codex | deploy | P0 | B3 | REQ-20260706-972 | Deployed work has clean branch/commit, release gate pass, deployment success, and live smoke/readback proof. Unsafe external writes remain blocked. | release gate, live-smoke reports, deployment evidence | No app-visible route/UI change | Done - source publish required |
| REQ-20260706-974 | Record final status, blockers, ledger/changelog, and simple next steps. | RAW-20260706-970 | bna_platform / release_workflow | Codex | closeout | P0 | B4 | REQ-20260706-971 | Register final audit explains where each recent ramble-derived workstream stands in plain language with next actions. | this register, ledger, changelog | No | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260706-970 | clean-deploy-all-pending | Audit, clean, verify, and deploy eligible pending BNA / One Time work. | Codex | bna_platform / release_workflow | RAW-20260706-970 | REQ-20260706-971..974 | Publish the clean branch and keep external-write blockers explicit. | Agent work / Release cleanup | Local verified; publish in progress |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260706-970 | Broad cleanup must not bypass external-write approval gates. | Exact approval for any email/WhatsApp send, payment/access change, DNS/provider mutation, Drive write, secret change, or production-data mutation. | Shloimie / Codex | Deploy only verified code/docs and no-write smokes; leave external writes blocked with exact next action. | Force all changes live regardless of gate. | Unsafe deploys can leak data or mutate external accounts. | Use the existing guarded release/deploy path and record blockers. | REQ-20260706-973 | Accepted |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260706-970 | Which already-pushed branch/PR should be treated as highest priority if multiple safe deploy candidates exist? | Prevents shipping unrelated work together. | No; Codex can choose the safest candidate order. | Deferred |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260706-970 | None yet. | no | This is a broad one-time cleanup request, not a new durable rule by itself. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260706-971 | git/GitHub/execution-run/task registers | Inspected dirty original checkout, branch ancestry, open PRs, active run status, recent registers, and live app state before choosing a clean worktree. | `gh pr list --state open` returned none; `npm run bna:run:status` showed 8 done / 2 blocked; `npm run bna:run:next` showed no unblocked executable batch; live BNA/One Time smokes passed. | this branch | pending | n/a |
| REQ-20260706-972 | Vimeo/Stripe/cleanup source artifacts | Verified only scoped safe candidates from clean branch. | `node --check` new/changed scripts; focused workflow test 6/6; adjacent One Time/Vimeo/member tests 27/27; `npm run one-time:vimeo-library`; `npm run secrets:audit`; JSONL parse; `git diff --check`. | this branch | pending | no app-visible route/UI deploy required |
| REQ-20260706-973 | release target | Existing app-visible work was already on live `master`; this branch only publishes CLI/docs/evidence/source artifacts. | BNA and One Time health/smokes passed before publication; source publish via clean branch remains the release action for this scoped batch. | this branch | pending | no app-visible route/UI deploy required |
| REQ-20260706-974 | register/ledger/changelog | Recorded status, blockers, and next steps in plain language. | this register; `memory/2026-07-06.md`; `ops/agent-changelog.md`; `ops/agent-task-ledger.jsonl`. | this branch | pending | n/a |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260706-970 | Done | raw-input/RAW-20260706-970-clean-deploy-all-pending.md; this register | raw-input, tasks-pending | file creation | none |
| REQ-20260706-971 | Done | Original checkout dirty/stale; clean branch `codex/clean-deploy-all-pending-20260706`; no open PRs; active run 8 done / 2 blocked and no executable batch; latest live smokes passed. | this register | git/GitHub/run/live readbacks | none |
| REQ-20260706-972 | Done | `src/lib/bna/one-time-vimeo-folder-library.js`; `scripts/one-time-vimeo-folder-library.mjs`; `tests/one-time-vimeo-folder-library-workflow.test.js`; report `ops/one-time-mishnah/vimeo-folder-library/2026-07-06T17-25-02-751Z-report.md`. | workflow/module/tests/docs | syntax checks; tests 6/6 and 27/27; `npm run one-time:vimeo-library`; `npm run secrets:audit`; JSONL parse; `git diff --check` | real upload/publish still needs approval |
| REQ-20260706-973 | Done - source publish required | App-visible work was already live; scoped pending candidate is a no-write CLI/report workflow plus records. | clean branch | live health/smokes already passed; source publish pending | no app-visible route/UI deploy needed for this scoped batch |
| REQ-20260706-974 | Done | register, memory, changelog, ledger updated | this register; memory; changelog; ledger | JSONL parse passed | final PR/commit URL to be reported after push |
