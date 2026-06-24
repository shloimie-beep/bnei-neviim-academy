# Ramble Intake - 2026-06-24 - clean-slate-control-tower-reconciliation

## Raw intake

Shloimie provided a Codex Goal packet titled "Control Tower Reconciliation and
Canonical Integration Base" and instructed Codex to create and activate:

`BNA CLEAN-SLATE CONTROL TOWER - RECONCILE ALL WORK AND CREATE INTEGRATION BASE`

Raw storage:
`raw-input/RAW-20260624-003-clean-slate-control-tower.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-003 |
| Source | Codex chat attachment |
| Parse status | registered / implementation running |
| Requirement register | this file |
| Active goal objective | `BNA CLEAN-SLATE CONTROL TOWER - RECONCILE ALL WORK AND CREATE INTEGRATION BASE` |
| Goal tool used | yes |
| Prior active run | `ops/execution-runs/2026-06-23-complete-system-reconciliation` |
| Intended new active run | `ops/execution-runs/2026-06-24-clean-slate-system-closeout/` |
| Control branch | `codex/clean-slate-integration-20260624` |
| Guardrail | No production deployment, production DB mutation, class backfill, Stripe/Vimeo external writes, real sends, or DNS changes. |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Execution directive | Preserve raw source, create this register, then execute practical batches until every requirement has a terminal status. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no deployment in this goal; integration branch and draft PR required |
| Next requirement IDs to work | `REQ-20260624-034` final validation, push, and draft PR |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-028 | Run full repository/worktree/PR/deploy census and classify dirty, untracked, ignored, stashed, local-only, and pushed-but-unmerged work. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | reconciliation_census | P0 | A | none | `ops/worktree-reconciliation/2026-06-24-clean-slate-control-tower.md` and JSON companion exist with remote, fetch, worktree, branch, status, SHA, upstream, stash, PR, deployment metadata, and per-file classifications. | git metadata; `ops/worktree-reconciliation/*` | no | Done |
| REQ-20260624-029 | Inspect and preserve the local Rabbi Eli Scheller / One Time QA closeout in `service-provider-studio-integration`. | RAW-20260624-003 | rabbi_sheller_provider / one_time_mishnah_class | Codex | preservation | P0 | B | REQ-20260624-028 | Local changes, including ledger record 1305 if present, are compared against PR #14, PR #15, and `master`; unique valid non-secret work is committed and pushed to `codex/preserve-rabbi-closeout-20260624`, or explicitly superseded/rejected with evidence. | service-provider worktree; ledger/changelog/task docs; tests/UI files | no | Done |
| REQ-20260624-030 | Reconcile PR #14, PR #15, and any preservation branch into a new clean integration branch without rewriting published history. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | integration_merge | P0 | C | REQ-20260624-028, REQ-20260624-029 | Branch `codex/clean-slate-integration-20260624` is created from latest `origin/master`; PR #14 and PR #15 heads are merged or cherry-picked; conflicts are resolved by behavior/tests; `PR-RECONCILIATION.md` records merge base, source heads, commits, conflicts, tests, and deployed relation. | clean integration worktree; `ops/parallel-closeout/.../control/PR-RECONCILIATION.md` | no | Done |
| REQ-20260624-031 | Create the canonical `2026-06-24-clean-slate-system-closeout` execution run and repair stale run metadata. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | execution_run_metadata | P0 | D | REQ-20260624-030 | New run folder includes required files; `latest.json` points to the new run; older active runs are inactive/superseded without deleting history; run metadata points to actual branch, SHA, draft PR, remote branch, and source coverage. | `ops/execution-runs/2026-06-24-clean-slate-system-closeout/*`; `ops/execution-runs/latest.json` | no | Done |
| REQ-20260624-032 | Reconcile queue, Tasks, and Decisions without deleting history. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | queue_decision_reconciliation | P0 | E | REQ-20260624-028 | Census covers executable Codex tasks, operator Decisions, completed/stale/duplicate/superseded tasks, old-branch pointers, resolved Decisions, remaining credential/account blockers, and lane tasks for Prompts 02-08. | `TASKS.md`; `tasks-pending/*`; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`; queue census artifacts | no | Done |
| REQ-20260624-033 | Create the control manifest and parallel-lane handoff files. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | control_manifest | P0 | F | REQ-20260624-030, REQ-20260624-031, REQ-20260624-032 | `CONTROL.json`, `CONTROL.md`, and lane `HANDOFF.md`, `RESULT.json`, `TESTS.md`, `FILES.txt`, `BLOCKERS.md` files exist with branch names, ownership, forbidden central files, approved effects, final integrator actions, merge order, and release gates. | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/*` | no | Done |
| REQ-20260624-034 | Validate, push, open/update one draft control PR, and decide whether parallel lanes are safe to start. | RAW-20260624-003 | bna_platform / clean_slate_control_tower | Codex | control_pr_closeout | P0 | G | REQ-20260624-031, REQ-20260624-033 | `npm run bna:run:status`, `validate`, `blockers`, and `next` pass; integration branch and control files are committed/pushed; one draft integration PR exists; final response can report `SAFE_TO_START_PARALLEL_LANES: YES` only if every previous requirement is terminal. | git branch/PR; run CLI; final register audit | no | In progress |

## Parsed tasks

No new default visible human Task is created. This is Codex/Agent lifecycle work.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-001 | clean-slate-control-tower-reconciliation | Reconcile PR #14, PR #15, local Rabbi closeout, stale run metadata, and queue state into one canonical integration base. | Codex | bna_platform / clean_slate_control_tower | RAW-20260624-003 | REQ-20260624-028 through REQ-20260624-034 | Validate, push the integration branch, and open one draft control PR. | Agent lifecycle only | Running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-008 | Current deployed SHA readback method | Whether Railway read-only metadata can identify the currently deployed commit without deployment or production mutation. | Codex first; Shloimie only if metadata is unavailable | Use Railway read-only deployment metadata and existing live-smoke/deployment records. | Ask operator for Railway dashboard SHA if metadata disappears. | Parallel lanes can rely on the deployed relation being partially known. | Read-only Railway metadata identifies active deployment `5e37d2a0-7e81-4339-a721-c4286e8ecaa8` with message `Deploy Rabbi Scheller parity 8f8b0b45`; PR #15 head `1ab57eac` remains evidence-only and not proven deployed. | REQ-20260624-028, REQ-20260624-030, REQ-20260624-033 | Done |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-001 | Is ledger record 1305 present only in `service-provider-studio-integration`, already upstream, or missing? | The source packet specifically identifies it as possible unique Rabbi closeout proof. | yes for preservation closeout only | Answered: the local closeout ledger entry existed as the local One Time/Rabbi QA closeout record and is now preserved through `origin/codex/preserve-rabbi-closeout-20260624`. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-001 | Before parallel prompt lanes start, BNA needs one clean control-tower integration base that reconciles active PRs, local worktrees, execution-run metadata, task/Decision state, and lane handoffs. | yes | Stable release coordination rule for this closeout wave. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-028 | git/worktrees/PRs/deploy metadata | Run census and write Markdown/JSON artifacts. | `ops/worktree-reconciliation/2026-06-24-clean-slate-control-tower.md` and JSON created; Railway metadata read-only relation recorded. | pending | pending | no deploy |
| REQ-20260624-029 | `service-provider-studio-integration` worktree | Compare, classify, secret-scan, validate, preserve branch if needed. | Branch `codex/preserve-rabbi-closeout-20260624` pushed at `487a660b`; preservation audit and test evidence recorded. | `487a660b` | `487a660b` | no deploy |
| REQ-20260624-030 | clean control worktree/branch | Merge PR #14, PR #15, and preservation branch. | Integration branch HEAD `161f8623`; PR reconciliation file records heads, conflicts, tests, and deployed relation. | `1537b042`, `9a2c3646`, `e95fc5b7`, `161f8623` | pending | no deploy |
| REQ-20260624-031 | execution-run files | Create canonical active run and validate CLI. | `npm run bna:run:validate` passed after structured schema repair. | pending | pending | no deploy |
| REQ-20260624-032 | task/Decision queue | Census/dedupe/supersede without deleting history. | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/control/QUEUE-DECISION-RECONCILIATION.md` and JSON companion created. | pending | pending | no deploy |
| REQ-20260624-033 | control manifests/handoffs | Write control and lane handoff files. | `CONTROL.md`, `CONTROL.json`, and seven lane handoff folders created. | pending | pending | no deploy |
| REQ-20260624-034 | git/PR/validation | Push branch and draft PR, run run CLI closeout checks. | In progress | pending | pending | no deploy |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-028 | Done | `ops/worktree-reconciliation/2026-06-24-clean-slate-control-tower.md`; JSON companion | census artifacts; Railway read-only metadata | Git/Railway/PR/worktree census completed. | none |
| REQ-20260624-029 | Done | `ops/worktree-reconciliation/2026-06-24-rabbi-closeout-preservation.md`; branch `origin/codex/preserve-rabbi-closeout-20260624` | 19-file preservation commit `487a660b` | staged leak scan, JSON/JSONL parse, `npm run secrets:audit`, focused tests 20/20 and 37/37 | none |
| REQ-20260624-030 | Done | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/control/PR-RECONCILIATION.md`; integration HEAD `161f8623` | PR #14, PR #15, and preservation merges | PR #14 focused 72/72; PR #15 focused 33/33 and browser smokes; preservation One Time 57/57, Rabbi 33/33, browser smokes, secrets audit | push/PR still pending under REQ-20260624-034 |
| REQ-20260624-031 | Done | New active run folder; `latest.json`; stale run superseded | execution-run files | `npm run bna:run:validate` passed | none |
| REQ-20260624-032 | Done | `QUEUE-DECISION-RECONCILIATION.md` and JSON | control queue artifacts; register/task references | JSON/readback pending final closeout validation | none |
| REQ-20260624-033 | Done | `CONTROL.md`, `CONTROL.json`, seven lane folders | control manifest and lane handoffs | JSON/readback pending final closeout validation | none |
| REQ-20260624-034 | In progress | Run is ready for final validation/push/PR. | git/run/control files | pending | Need commit, push, draft PR, and final run CLI closeout. |
