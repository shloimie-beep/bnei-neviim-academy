# Ramble Intake - 2026-06-24 - final-release-integration-deploy-live-verify

## Raw intake

Shloimie provided a Codex Goal packet titled:

`Final Integration, Release, Deployment, Live Verification, and Guarded Recovery`

and then said `/goal go`.

The requested active goal name is:

`BNA FINAL RELEASE - INTEGRATE ALL LANES, MERGE, DEPLOY, LIVE-VERIFY, AND RECOVER CLASS DATA`

Raw storage:
`raw-input/RAW-20260624-005-final-release-integration-goal.md`

Attachment source:
`C:\Users\User\.codex\attachments\72b4562b-be47-4cd3-9653-11c340480715\pasted-text.txt`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260624-005 |
| Source | Codex chat attachment plus `/goal go` |
| Parse status | registered |
| Requirement register | this file |
| Active goal objective | `BNA FINAL RELEASE - INTEGRATE ALL LANES, MERGE, DEPLOY, LIVE-VERIFY, AND RECOVER CLASS DATA` |
| Goal tool used | yes; existing thread goal was active and this register records the concrete objective |
| Prior active run | `ops/execution-runs/2026-06-21-one-time-master-completion` |
| Required control manifest | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.json` |
| Initial preflight finding | Required `CONTROL.json` is missing in the current checkout on `codex/closeout-vimeo-media-20260624`. |
| Guardrail | Owner authorizes read-only production state, release candidate merge, deploy/live verify, and guarded class backfill only under packet gates. No real Stripe charges, real user sends, public student-media publication, unrelated production mutations, destructive deletion, secret exposure, or DNS changes. |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Execution directive | Preserve raw source, create this register, then execute practical batches until every requirement has a terminal status. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes; merged SHA must match deployed SHA before claiming live verification |
| Next requirement IDs to work | `REQ-20260624-019` verify lane handoffs and control manifest |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260624-019 | Verify all lane handoffs and control manifest before integration. | RAW-20260624-005 | bna_platform / final_release | Codex | release_preflight | P0 | A | Control tower/lane outputs from RAW-20260624-002 and Prompts 02-08 | `CONTROL.json` is read; every lane `RESULT.json`, `HANDOFF.md`, `TESTS.md`, `FILES.txt`, `BLOCKERS.md`, and shared patch is inspected; each lane branch exists remotely; head SHA matches `RESULT.json`; base SHA matches control manifest; tests, external writes, blockers, forbidden central files, and secret risk are recorded. | `ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/*`; git remote metadata | no | Blocked: lane handoffs are incomplete, so final integration/deploy/backfill may not start |
| REQ-20260624-020 | Rebase/merge current `origin/master` safely into the release integration branch if master changed since the control base. | RAW-20260624-005 | bna_platform / final_release | Codex | release_base_sync | P0 | B | REQ-20260624-019 | Latest `origin/master` is fetched and inspected; any master delta is merged intentionally; conflicts and decisions are recorded; base tests are rerun; no history rewrite or force-push is used. | integration worktree; control evidence | no | Pending |
| REQ-20260624-021 | Integrate lane branches in controlled order with checkpoint commits. | RAW-20260624-005 | bna_platform / final_release | Codex | lane_integration | P0 | C | REQ-20260624-019, REQ-20260624-020 | Lanes are integrated in the requested order or a documented alternative; shared patches are reviewed before apply; focused tests run after each lane; each checkpoint is committed distinctly; no blanket ours/theirs resolution is used. | final integration branch; lane files | no | Pending |
| REQ-20260624-022 | Resolve PR #14, PR #15, and local Rabbi closeout history into one supersession matrix. | RAW-20260624-005 | bna_platform / final_release | Codex | supersession | P0 | D | REQ-20260624-021 | Final branch contains all valid work from PR #14, PR #15, and preserved local Rabbi closeout; supersession matrix records dispositions; PR #14 and PR #15 are not separately merged if final PR supersedes them. | supersession matrix under `ops/parallel-closeout/...` or release evidence | no | Pending |
| REQ-20260624-023 | Wire shared routes, UI, and server authorization across final integrated surfaces. | RAW-20260624-005 | bna_platform / final_release | Codex | route_ui_authorization | P0 | E | REQ-20260624-021 | `server.js`, Operations/provider navigation, integration readiness, setup center, API usage, Stripe, Vimeo, class diagnostic, and assistant routes are integrated; every new endpoint has server-side authorization; public pages expose no secrets or production-only diagnostics. | `server.js`; `public/*`; registries; tests | yes | Pending |
| REQ-20260624-024 | Review and prepare required migrations/database readiness. | RAW-20260624-005 | bna_platform / final_release | Codex | migration_readiness | P0 | F | REQ-20260624-021 | Migration proposals are reviewed; backup/snapshot, dry run, rollback, transaction strategy, deployed-code compatibility, tenant isolation, and secret audit are recorded; only required safe migrations are applied. | migrations/schema/run evidence | yes if applied | Pending |
| REQ-20260624-025 | Run the full release gate against the exact release SHA. | RAW-20260624-005 | bna_platform / final_release | Codex | release_gate | P0 | G | REQ-20260624-021, REQ-20260624-023, REQ-20260624-024 | Required install, syntax, focused suites, full tests, role flows, inventories, external readiness, login/workspace/tenant/class/Stripe/Vimeo/setup/watchdog/security/secrets/JSON/run/source/stale-evidence/diff checks pass or have exact blockers. | test and audit artifacts | no | Pending |
| REQ-20260624-026 | Create/ready/merge the final integration PR according to release policy. | RAW-20260624-005 | bna_platform / final_release | Codex | merge | P0 | H | REQ-20260624-025 | Final PR is mergeable; review/release policy is satisfied; rollback plan exists; PR is merged to `master`; final PR URL, PR head, merge SHA, master SHA, superseded PRs, and merge method are recorded. | GitHub PR; merge evidence | no | Pending |
| REQ-20260624-027 | Deploy merged `master` to Railway and run live smokes across required roles, routes, failures, and viewports. | RAW-20260624-005 | bna_platform / final_release | Codex | deploy_live_smoke | P0 | I | REQ-20260624-026 | Railway deployment succeeds; deployed SHA matches merged SHA; live smokes cover public homepage/header/tabs/nav/login/role chooser/parent/student/provider/Rabbi/super-admin/One Time/setup/assistant/API/class diagnostics/Stripe/Vimeo/wrong-role/API failure/404/403/mobile/tablet/desktop. | deployment and live-smoke artifacts | yes | Pending |
| REQ-20260624-028 | Apply guarded class backfill only if Prompt 04 recommendation and all safety gates pass. | RAW-20260624-005 | one_time_mishnah_class / class_recovery | Codex | guarded_backfill | P0 | J | REQ-20260624-027 | `BACKFILL-RECOMMENDATION.json` is read; `safe_to_apply` is true; dry run passes; no student ambiguity remains; backup/snapshot/rollback/transaction/idempotency are ready; exact jobs are applied with `APPLY_GUARDED_CLASS_BACKFILL`; readback and zero-change rerun verify rows, sessions, scores, questions, profiles, accountability, Operations UI, and permitted parent/student views. | Prompt 04 artifacts; backfill scripts/evidence | yes if applied | Pending |
| REQ-20260624-029 | Verify Stripe sandbox and Vimeo private-test readiness without live charging or public publication. | RAW-20260624-005 | bna_platform / final_release | Codex | external_readiness | P0 | K | REQ-20260624-027 | Stripe live charging remains disabled; sandbox and UI labels are honest; test objects are not shown as live. Vimeo private synthetic evidence is verified; no real class asset is used; member playback is checked only if entitlement permits; nothing is publicly published. | readiness reports; tests | yes | Pending |
| REQ-20260624-030 | Update canonical records, owner-review links, rollback reference, and final release state. | RAW-20260624-005 | bna_platform / final_release | Codex | canonical_records | P0 | L | REQ-20260624-026, REQ-20260624-027 | Active run, this register, tasks, Decisions, `MEMORY.md`, `TASKS.md`, changelog, ledger, source truth, owner-review report, deployment evidence, live-smoke evidence, setup walkthrough links, next-session instructions, and true remaining blockers are updated and pushed. | canonical docs/ledgers/run files | no | Pending |
| REQ-20260624-031 | Clean worktrees safely after merge/deploy/live verification. | RAW-20260624-005 | bna_platform / final_release | Codex | cleanup | P1 | M | REQ-20260624-030 | Integrated worktrees are identified; unique commits are remote; no unique untracked work remains; required evidence is archived; only safe worktrees/branches are pruned; cleanup report is written. | git worktrees; cleanup report | no | Pending |

## Parsed tasks

No new default visible human Task is created. This is Codex/Agent lifecycle work.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260624-005 | final-release-integration-deploy-live-verify | Integrate all completed lanes, merge, deploy, live-verify, and apply guarded class backfill only under safety gates. | Codex | bna_platform / final_release | RAW-20260624-005 | REQ-20260624-019 through REQ-20260624-031 | Verify the control manifest and lane handoffs. | Agent lifecycle only | Running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260624-004 | Release precondition: control manifest and all lane handoffs must exist and be pushed. | The clean-slate `CONTROL.json` exists on `origin/codex/clean-slate-integration-20260624`, but not all lane result handoffs are terminal and pushed. | Codex / lane closeout workers | Complete and push the missing lane closeouts before final integration: `class-drive-intake`, `vimeo-media`, and `operator-walkthrough`. | Ask operator to provide an out-of-band lane package only if those results exist outside git. | Final release cannot safely integrate, merge, deploy, or backfill because lane head/base/test/blocker evidence is incomplete. | Finish/push terminal `RESULT.json`, `HANDOFF.md`, `TESTS.md`, `FILES.txt`, and `BLOCKERS.md` for missing lanes; rerun REQ-20260624-019. | REQ-20260624-019 through REQ-20260624-031 | Blocks final release |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260624-003 | Are all Prompt 02-08 lane branches pushed with matching `RESULT.json` heads and control-manifest base SHA? | The packet explicitly says to run this goal only after Prompts 02-08 have pushed branches and handoff packets. | yes for integration | Pending verification |
| Q-20260624-004 | Is Prompt 04's `BACKFILL-RECOMMENDATION.json` present, safe, and tied to exact jobs? | Guarded class backfill cannot be applied from memory or a suspected job range. | yes for REQ-20260624-028 only | Pending later batch |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260624-005 | Final release integration requires committed lane handoffs, exact release SHA evidence, deploy/live-smoke proof, and guarded class backfill safety checks before any done claim. | later | This is partly a one-time release rule; promote only if it remains a standing release policy after closeout. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260624-019 | control manifest, lane handoffs, git remotes | Fetch and search remotes/worktrees; inspect lane results if present; record blocker if absent. | Blocked preflight complete: `CONTROL.json` exists on the clean-slate branch and all expected lane branches exist; public UI, portal/auth/nav, assistant/ramble/usage, and Stripe sandbox have terminal branch-local results; class/Drive and Vimeo branch-local results are still `not_started`; operator walkthrough has no pushed `RESULT.json`; current Vimeo worktree has uncommitted/unpushed divergence. | pending | pending | not applicable |
| REQ-20260624-020 | integration branch/master | Inspect master delta and merge intentionally if needed. | Pending | pending | pending | not applicable |
| REQ-20260624-021 | lane branches/shared patches | Merge lanes with focused tests and checkpoint commits. | Pending | pending | pending | not applicable |
| REQ-20260624-022 | PR/local closeout history | Build supersession matrix. | Pending | pending | pending | not applicable |
| REQ-20260624-023 | routes/UI/auth | Integrate shared route/UI requests and verify authorization. | Pending | pending | pending | required later |
| REQ-20260624-024 | migrations/schema | Dry-run/backup/rollback/readiness before any apply. | Pending | pending | pending | required if applied |
| REQ-20260624-025 | release gate | Run deterministic local release gate. | Pending | pending | pending | not applicable |
| REQ-20260624-026 | GitHub PR/master | Ready and merge final PR if policy permits. | Pending | pending | pending | not applicable |
| REQ-20260624-027 | Railway/live app | Deploy merged master and smoke. | Pending | pending | pending | required |
| REQ-20260624-028 | class backfill | Apply only exact safe recommendation after stable release. | Pending | pending | pending | required if applied |
| REQ-20260624-029 | Stripe/Vimeo | Verify sandbox/private-test readiness. | Pending | pending | pending | required |
| REQ-20260624-030 | canonical records | Update and push final release records. | Pending | pending | pending | not applicable |
| REQ-20260624-031 | worktrees/branches | Archive evidence and prune only safe integrated worktrees. | Pending | pending | pending | not applicable |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260624-019 | Blocked | `git fetch --all --prune` succeeded. `CONTROL.json` exists on `origin/codex/clean-slate-integration-20260624` at SHA `68f0b02fa1fe8928a8b4dd52704ec7e92c0fcba5`. Expected branches exist remotely. Branch-local results: `public-ui` pushed/safe_to_merge true; `portal-auth-nav` done/safe_to_merge true; `assistant-ramble-usage` complete_with_external_blockers/safe_to_merge true; `stripe-sandbox` completed_with_external_setup_blocker/safe_to_merge true; `class-drive-intake` not_started/safe_to_merge false; `vimeo-media` not_started/safe_to_merge false; `operator-walkthrough` missing pushed `RESULT.json`. Current Vimeo worktree local `HEAD` `6f57d910` diverges from remote `43adf4a9` and is dirty. | `raw-input/RAW-20260624-005-final-release-integration-goal.md`; this file; `TASKS.md`; `memory/2026-06-24.md`; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md` | `npm run bna:run:status` and `npm run bna:run:next` pass on clean-slate run; work remains none there. Remote/worktree lane preflight shows incomplete pushed lane handoffs. | Complete and push the missing lane result handoffs before final release integration, merge, deploy, or backfill. |
| REQ-20260624-020 through REQ-20260624-031 | Blocked by REQ-20260624-019 | Final release packet says to run only after Prompts 02-08 pushed branches and handoff packets. | none yet | Not run; blocked by incomplete lane handoffs. | Re-run after `class-drive-intake`, `vimeo-media`, and `operator-walkthrough` have terminal pushed handoffs. |
