# Ramble Intake - 2026-06-24 - Clean Slate Acceptance

## Raw intake

Preserved in `raw-input/RAW-20260624-007-clean-slate-acceptance-goal.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-007 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-24-clean-slate-acceptance.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | BNA CLEAN SLATE - RECONCILE QUEUES AND PROVE THE NEXT RAMBLE |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Verify release truth, repair run/queue truth, prove synthetic intake, write handoff, then PR/merge without unnecessary deploy. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260624-032 through REQ-20260624-039; carry REQ-20260624-028 as blocked safety work |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-032 | Verify release truth against Git, GitHub, Railway, live health, issue #18, and secrets audit. | RAW-20260624-007-S001..S002 | bna_platform/clean_slate_acceptance | Codex | preflight | P0 | A | none | Release truth is consistent or the run stops with exact inconsistency. | run evidence, live smokes | yes, verification only | Done |
| REQ-20260624-033 | Repair active-run truth and make the clean-slate acceptance run the current handoff. | RAW-20260624-007-S003..S004 | bna_platform/clean_slate_acceptance | Codex | run_control | P0 | B | REQ-20260624-032 | Latest pointer and run metadata agree with repository reality; terminal release run stays terminal. | latest.json, run files | no | Done |
| REQ-20260624-034 | Complete Task, Decision, requirement, and queue census without hiding REQ-20260624-028. | RAW-20260624-007-S005..S007 | bna_platform/clean_slate_acceptance | Codex | reconciliation | P0 | C | REQ-20260624-032 | Queue counts have evidence; completed/superseded records are not treated as active Codex work; REQ-20260624-028 remains visible. | census/queue/cleanup reports | no app deploy | Done |
| REQ-20260624-035 | Validate run and queue system with canonical commands. | RAW-20260624-007-S008..S009 | bna_platform/clean_slate_acceptance | Codex | validation | P0 | D | REQ-20260624-033, REQ-20260624-034 | Run CLI, queue census, raw watchdog, stale evidence, JSON/JSONL parse, secrets audit, and diff check pass or record precise blocker. | TEST-RESULTS.md | no app deploy | Done |
| REQ-20260624-036 | Prove a brand-new synthetic ramble routes correctly and idempotently. | RAW-20260624-007-S010..S011 | bna_platform/clean_slate_acceptance | Codex | intake_acceptance | P0 | E | REQ-20260624-034 | Raw source preserved; every statement mapped; duplicate/already-done recognized; Decisions/tasks route correctly; second ingestion is idempotent. | synthetic proof script/evidence | no app deploy | Done |
| REQ-20260624-037 | Create owner walkthrough with exact live links and role distinctions. | RAW-20260624-007-S012 | bna_platform/clean_slate_acceptance | Codex | documentation | P1 | F | REQ-20260624-032 | Walkthrough covers requested pages, healthy states, disabled/preview-only states, defect reporting, and roles. | owner walkthrough | no | Done |
| REQ-20260624-038 | Preserve or reconcile local-only worktrees and branches. | RAW-20260624-007-S013..S014 | bna_platform/clean_slate_acceptance | Codex | preservation | P0 | G | REQ-20260624-032 | All worktrees/local branches are inventoried; unique/unknown work is preserved; Vimeo checkout is untouched. | preservation manifest | no | Done |
| REQ-20260624-039 | Write GitHub-visible handoff, update start files, push PR, merge, and avoid unnecessary Railway deploy. | RAW-20260624-007-S015..S017 | bna_platform/clean_slate_acceptance | Codex | handoff | P0 | H | REQ-20260624-033..REQ-20260624-038 | Future session can reconstruct state from GitHub; PR/merge state recorded; no docs-only manual deploy. | final handoff, start files | no, unless runtime changes | In progress |
| REQ-20260624-028 | Read-only class intake reconciliation and safe backfill evidence. | RAW-20260624-007-S007 | bna_platform/class_drive_intake | Codex/Shloimie | reconciliation | P0 | BLOCKER | none | Issue #18 read-only reconciliation proves no candidates or safe owner-approved row-level plan before any apply. | final-release evidence, issue #18 | no apply in this goal | Blocked |

## Parsed tasks

No new human-visible Tasks were created from the acceptance packet. Codex/system
work remains inside the execution run and evidence files.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-007 | clean-slate-acceptance-run | Execute clean-slate acceptance and handoff | Codex | bna_platform/clean_slate_acceptance | RAW-20260624-007 | REQ-20260624-032..039 | Finish PR/merge closeout | Agent work | In progress |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-007 | Class backfill evidence and row-level write plan | Whether REQ-20260624-028 has safe candidates, approved row-level writes, and owner approval | Shloimie / future Codex read-only reconciliation | Keep REQ-20260624-028 active and run a separate read-only reconciliation from GitHub issue #18 before any apply | Archive only if read-only reconciliation proves no candidates; apply only with safe_to_apply=true and exact owner approval | Prevents hidden production backfill risk and preserves evidence | Work GitHub issue #18 as a separate read-only run; do not apply class backfill in this goal | REQ-20260624-028 | Needs operator/safety evidence |
| DEC-20260624-008 | Production queue hygiene beyond safe scope reassignment | Whether to approve broader dedupe/title/owner cleanup plans surfaced by the queue census | Shloimie | Keep only safe reversible scope fixes applied; review the generated cleanup plan before broader production queue mutations | Approve a scoped cleanup batch; leave records as historical evidence | Avoids accidental hiding of real human Decisions or provenance | Review `ops/one-time-mishnah/task-decision-production-cleanup.md` and approve exact non-dry-run cleanup if desired | Future queue cleanup only | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-007 | Should the next Codex run start with REQ-20260624-028 read-only reconciliation? | It is the only named real remaining requirement after clean-slate acceptance. | Blocks class backfill apply only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-007 | The clean-slate acceptance handoff supersedes the final-release run as the latest start pointer once pushed/merged; REQ-20260624-028 remains active and issue-linked. | yes | Future sessions need this as source-of-truth routing. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-032 | Done | `ops/execution-runs/2026-06-24-clean-slate-acceptance/EVIDENCE.md` | run files, acceptance evidence | Git/GitHub/Railway/live/secret audit inspected | none |
| REQ-20260624-033 | Done | `ops/execution-runs/latest.json` | run pointer and run files | PASS run CLI validation | none |
| REQ-20260624-034 | Done | `ops/task-decision-census/`, `ops/queue-audits/`, `ops/one-time-mishnah/`, GitHub issue #18 | census scripts and evidence | live census/reconciler/cleanup reports | broader cleanup is owner-gated |
| REQ-20260624-035 | Done | `ops/execution-runs/2026-06-24-clean-slate-acceptance/TEST-RESULTS.md` | test evidence | PASS canonical validation suite | none |
| REQ-20260624-036 | Done | `ops/acceptance/2026-06-24-clean-slate/synthetic-ramble-acceptance.md` | synthetic proof script/evidence | PASS synthetic proof | none |
| REQ-20260624-037 | Done | `ops/acceptance/2026-06-24-clean-slate/owner-walkthrough.md` | walkthrough | route registry/live smoke references | none |
| REQ-20260624-038 | Done | `ops/acceptance/2026-06-24-clean-slate/worktree-preservation-manifest.md` | manifest | git inventory | no destructive cleanup performed |
| REQ-20260624-039 | In progress | `ops/acceptance/2026-06-24-clean-slate/final-handoff.md` | handoff/start/task/changelog/ledger | PR/merge pending | finish push/PR/merge |
| REQ-20260624-028 | Blocked | GitHub issue #18, final-release run | none in this goal | no backfill apply run | separate read-only reconciliation required |
