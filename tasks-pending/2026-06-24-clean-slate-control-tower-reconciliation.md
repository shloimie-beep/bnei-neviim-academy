# Ramble Intake - 2026-06-24 - clean-slate-control-tower-reconciliation

## Raw intake

Shloimie provided a Codex Goal packet titled "Control Tower Reconciliation and
Canonical Integration Base" and instructed Codex to create and activate:

`BNA CLEAN-SLATE CONTROL TOWER - RECONCILE ALL WORK AND CREATE INTEGRATION BASE`

Raw storage:
`raw-input/RAW-20260624-002-clean-slate-control-tower.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-002 |
| Source | Codex chat attachment |
| Parse status | registered |
| Requirement register | this file |
| Active goal objective | `BNA CLEAN-SLATE CONTROL TOWER - RECONCILE ALL WORK AND CREATE INTEGRATION BASE` |
| Goal tool used | yes |
| Prior active run | `ops/execution-runs/2026-06-21-one-time-master-completion` |
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
| Next requirement IDs to work | `REQ-20260624-012` repository and worktree census |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-012 | Run full repository/worktree/PR/deploy census and classify dirty, untracked, ignored, stashed, local-only, and pushed-but-unmerged work. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | reconciliation_census | P0 | A | none | `ops/worktree-reconciliation/2026-06-24-clean-slate-control-tower.md` and JSON companion exist with remote, fetch, worktree, branch, status, SHA, upstream, stash, PR, deployment metadata, and per-file classifications. | git metadata; `ops/worktree-reconciliation/*` | no | Pending |
| REQ-20260624-013 | Inspect and preserve the local Rabbi Eli Scheller / One Time QA closeout in `service-provider-studio-integration`. | RAW-20260624-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | preservation | P0 | B | REQ-20260624-012 | Local changes, including ledger record 1305 if present, are compared against PR #14, PR #15, and `master`; unique valid non-secret work is committed and pushed to `codex/preserve-rabbi-closeout-20260624`, or explicitly superseded/rejected with evidence. | service-provider worktree; ledger/changelog/task docs; tests/UI files | no | Pending |
| REQ-20260624-014 | Reconcile PR #14, PR #15, and any preservation branch into a new clean integration branch without rewriting published history. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | integration_merge | P0 | C | REQ-20260624-012, REQ-20260624-013 | Branch `codex/clean-slate-integration-20260624` is created from latest `origin/master`; PR #14 and PR #15 heads are merged or cherry-picked; conflicts are resolved by behavior/tests; `PR-RECONCILIATION.md` records merge base, source heads, commits, conflicts, tests, and deployed relation. | clean integration worktree; `ops/parallel-closeout/.../control/PR-RECONCILIATION.md` | no | Pending |
| REQ-20260624-015 | Create the canonical `2026-06-24-clean-slate-system-closeout` execution run and repair stale run metadata. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | execution_run_metadata | P0 | D | REQ-20260624-014 | New run folder includes required files; `latest.json` points to the new run; older active runs are inactive/superseded without deleting history; run metadata points to actual branch, SHA, draft PR, remote branch, and source coverage. | `ops/execution-runs/2026-06-24-clean-slate-system-closeout/*`; `ops/execution-runs/latest.json` | no | Pending |
| REQ-20260624-016 | Reconcile queue, Tasks, and Decisions without deleting history. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | queue_decision_reconciliation | P0 | E | REQ-20260624-012 | Census covers executable Codex tasks, operator Decisions, completed/stale/duplicate/superseded tasks, old-branch pointers, resolved Decisions, remaining credential/account blockers, and lane tasks for Prompts 02-08. | `TASKS.md`; `tasks-pending/*`; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`; queue census artifacts | no | Pending |
| REQ-20260624-017 | Create the control manifest and parallel-lane handoff files. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | control_manifest | P0 | F | REQ-20260624-014, REQ-20260624-015, REQ-20260624-016 | `CONTROL.json`, `CONTROL.md`, and lane `HANDOFF.md`, `RESULT.json`, `TESTS.md`, `FILES.txt`, `BLOCKERS.md` files exist with branch names, ownership, forbidden central files, approved effects, final integrator actions, merge order, and release gates. | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/*` | no | Pending |
| REQ-20260624-018 | Validate, push, open/update one draft control PR, and decide whether parallel lanes are safe to start. | RAW-20260624-002 | bna_platform / clean_slate_control_tower | Codex | control_pr_closeout | P0 | G | REQ-20260624-015, REQ-20260624-017 | `npm run bna:run:status`, `validate`, `blockers`, and `next` pass; integration branch and control files are committed/pushed; one draft integration PR exists; final response can report `SAFE_TO_START_PARALLEL_LANES: YES` only if every previous requirement is terminal. | git branch/PR; run CLI; final register audit | no | Pending |

## Parsed tasks

No new default visible human Task is created. This is Codex/Agent lifecycle work.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-002 | clean-slate-control-tower-reconciliation | Reconcile PR #14, PR #15, local Rabbi closeout, stale run metadata, and queue state into one canonical integration base. | Codex | bna_platform / clean_slate_control_tower | RAW-20260624-002 | REQ-20260624-012 through REQ-20260624-018 | Run the repository and worktree census. | Agent lifecycle only | Running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-003 | Current deployed SHA readback method | Whether Railway read-only metadata can identify the currently deployed commit without deployment or production mutation. | Codex first; Shloimie only if metadata is unavailable | Try read-only local/Railway metadata and existing live-smoke/deployment records; if unavailable, mark deployed SHA unknown with blocker. | Ask operator for Railway dashboard SHA. | Parallel lanes can still start only if deployed relation is either known or explicitly blocked and not required for lane safety. | Run read-only metadata checks during census. | REQ-20260624-012, REQ-20260624-014, REQ-20260624-017 | Pending |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-002 | Is ledger record 1305 present only in `service-provider-studio-integration`, already upstream, or missing? | The source packet specifically identifies it as possible unique Rabbi closeout proof. | yes for preservation closeout only | Pending census |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-002 | Before parallel prompt lanes start, BNA needs one clean control-tower integration base that reconciles active PRs, local worktrees, execution-run metadata, task/Decision state, and lane handoffs. | yes | Stable release coordination rule for this closeout wave. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-012 | git/worktrees/PRs/deploy metadata | Run census and write Markdown/JSON artifacts. | Pending | pending | pending | no deploy |
| REQ-20260624-013 | `service-provider-studio-integration` worktree | Compare, classify, secret-scan, validate, preserve branch if needed. | Pending | pending | pending | no deploy |
| REQ-20260624-014 | clean control worktree/branch | Merge PR #14, PR #15, and preservation branch. | Pending | pending | pending | no deploy |
| REQ-20260624-015 | execution-run files | Create canonical active run and validate CLI. | Pending | pending | pending | no deploy |
| REQ-20260624-016 | task/Decision queue | Census/dedupe/supersede without deleting history. | Pending | pending | pending | no deploy |
| REQ-20260624-017 | control manifests/handoffs | Write control and lane handoff files. | Pending | pending | pending | no deploy |
| REQ-20260624-018 | git/PR/validation | Push branch and draft PR, run run CLI closeout checks. | Pending | pending | pending | no deploy |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-012 through REQ-20260624-018 | Pending | Raw/register created. | `raw-input/RAW-20260624-002-clean-slate-control-tower.md`; this file | Goal tool created active objective. | Execute census next. |
