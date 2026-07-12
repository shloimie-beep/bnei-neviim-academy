# Launch Consolidation, Branch Merge, And Deploy - 2026-07-12

## Raw intake

Source: `RAW-20260712-006`

> Yeah. I need you to catch up and merge all the branches and like all the stuff that aren't deployed yet, to like finally deploy them in one big launch. So go through every single thing in the repo that's like in the middle or on a branch, and merge everything to master. Make sure everything's clean, one at a time, debug everything, launch everything, so it should all be spick and span. All the stuff that we've been doing today. That's your goal. Keep going till everything is stabilized, cleaned up, deployed, and all the branches are on master, and everything is organized, professional, and epic.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260712-006 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-12-launch-consolidation-merge-deploy.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Stabilize the BNA repository by raw-capturing this launch request, auditing all in-progress local/remote branch and undeployed work, merging eligible work to master one branch at a time, verifying and cleaning the repo, then pushing/deploying with evidence or precise blockers for anything unsafe. |
| Goal tool used | yes |
| Execution directive | Register first, then work launch requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Standing goals affected | GOAL-PROD-001, GOAL-CORE-001, GOAL-CORE-002, GOAL-CORE-003, GOAL-CORE-004, GOAL-CORE-005, GOAL-CORE-006, GOAL-CORE-007, GOAL-CORE-009, GOAL-CORE-015 |

## Initial branch and deploy inventory

Inspected on 2026-07-12 after `git fetch --all --prune`.

- Current checkout: `master`.
- `master` status: behind `origin/master` by 54 commits, with many dirty/untracked local paths.
- Open GitHub PRs: none (`gh pr list --state open` returned `[]`).
- Active execution run: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`.
- Current active run status: 11 done, 1 blocked; next unblocked batch: none.
- Current run blocker: `REQ-20260712-112` release gate blocked by mixed dirty worktree, unpushed/non-release HEAD, and Railway/Drive external readback readiness gaps.
- Local branches not merged into `origin/master`:
  - `codex/onetime-p0p1-corrective-20260711`: app/server code for One Time delivery outbox dispatcher plus route registry/tests/evidence.
  - `codex/onetime-signup-location-hotfix-20260712`: One Time public signup/landing UI, reminder proof, action registry and live evidence.
  - `codex/ramble-protocol-telegram-unification-20260712`: protocol/Telegram ramble hardening and push-blocker evidence.
- Remote branches not merged into `origin/master` include older issue/hotfix/release branches. These require ancestry/content audit before any merge; many appear historical, evidence-only, or previously closed by PR/deploy records.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-201 | Register launch consolidation lane and preserve raw request. | RAW-20260712-006 | global / BNA + One Time | Codex | run_control | P0 | BATCH-LAUNCH-00 | none | Raw source, register, ledger, and changelog record exist. | raw-input/RAW-20260712-006-*, tasks-pending/2026-07-12-launch-consolidation-merge-deploy.md, ops/agent-task-ledger.jsonl, ops/agent-changelog.md | no | Done |
| REQ-20260712-202 | Audit repo status, open PRs, local branches, remote branches, worktrees, and active execution runs. | RAW-20260712-006 | global | Codex | release_inventory | P0 | BATCH-LAUNCH-01 | REQ-20260712-201 | Branches classified as already merged, merge candidate, stale/archive, or blocked; active dirty work is attributed to owning lanes. | git metadata, TASKS.md, MEMORY.md, tasks-pending, ops/execution-runs, ops/branch-audits/2026-07-12-launch-consolidation.md | no | Done |
| REQ-20260712-203 | Preserve and reconcile today's dirty local work before merging or pulling. | RAW-20260712-006 | rabbi_sheller_provider / one_time_mishnah_class plus global lanes | Codex | release_hygiene | P0 | BATCH-LAUNCH-02 | REQ-20260712-202 | Dirty files are scoped, reviewed, and either committed to an integration lane, moved to owning lane/blocker, or left untouched with reason. No user/other-agent work is reverted. | current dirty paths; active run files; Telegram sidekick packet files | no | Done |
| REQ-20260712-204 | Bring local `master` up to `origin/master` safely. | RAW-20260712-006 | global | Codex | git_sync | P0 | BATCH-LAUNCH-03 | REQ-20260712-203 | `master` contains current `origin/master` without losing local work; conflicts are resolved intentionally. | git refs and touched files | no | Done |
| REQ-20260712-205 | Merge eligible unmerged local branches one at a time. | RAW-20260712-006 | global / One Time | Codex | branch_merge | P0 | BATCH-LAUNCH-04 | REQ-20260712-204 | Each merge candidate has diff review, conflict resolution, focused tests, and evidence. Stale/unsafe branches are recorded as archived/blocked instead of blind-merged. | branch diffs and merge commits | yes if app/server visible | Blocked |
| REQ-20260712-206 | Audit unmerged remote branches and close the branch backlog. | RAW-20260712-006 | global | Codex | branch_governance | P1 | BATCH-LAUNCH-05 | REQ-20260712-205 | Remote branches are classified. Safe missing work is merged. Historical/stale/evidence-only branches are left unmerged with explicit reason and optional cleanup recommendation. | ops/branch-audits/2026-07-12-launch-consolidation.md | no unless merged code is app/server visible | Done |
| REQ-20260712-207 | Run verification suite and required watchdog/release gates. | RAW-20260712-006 | global | Codex | verification | P0 | BATCH-LAUNCH-06 | REQ-20260712-205 | Focused tests, PQC validation where relevant, protocol drift, action/route/security/workspace/readiness gates, and release gate pass or block with exact output. | package scripts; ops/* reports | no | Done |
| REQ-20260712-208 | Commit, push, deploy, and live-smoke the launch candidate. | RAW-20260712-006 | global / production | Codex | deploy_closeout | P0 | BATCH-LAUNCH-07 | REQ-20260712-207 | Launch candidate is committed, pushed to `master`, deployed through approved path, exact SHA is read back, live smokes pass, and records are updated. | git, Railway/deploy scripts, live-smoke reports | yes | Blocked |
| REQ-20260712-209 | Finalize source-of-truth records and terminal statuses. | RAW-20260712-006 | global | Codex | closeout | P0 | BATCH-LAUNCH-08 | REQ-20260712-208 | TASKS, run/register, ledger, changelog, deployment evidence, and final audit table show terminal status for every launch requirement. | TASKS.md, ops/agent-task-ledger.jsonl, ops/agent-changelog.md, tasks-pending register | no | Blocked |

## Decisions and blockers

| ID | Decision / blocker | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260712-201 | Do not blindly merge stale remote branches just because they exist. | Whether each older remote branch contains current, undeployed, safe work or historical/evidence-only work already superseded by later master commits. | Codex release lane | Audit ancestry and changed files; merge only eligible missing work; record archive/block reasons for stale branches. | Blind merge all branches; delete branches without audit. | Blind merge can resurrect stale code, old docs, unsafe external-write paths, or superseded evidence. Deleting without audit loses provenance. | Classify each unmerged remote branch before merge or cleanup recommendation. | REQ-20260712-206 | Active |
| DEC-20260712-202 | Production deploy/readback may still be blocked by release-gate credentials or external readiness. | Current Railway/Drive/readback readiness after clean launch candidate exists. | Codex/operator release lane | Rerun `npm run bna:release-gate -- --json` after the candidate is clean and pushed; use approved deferral flags only where policy allows. | Pause deploy until credentials are fixed; deploy without readback. | No production Done can be claimed without deploy/live-smoke or exact blocker. | Recheck gate after merge candidate is clean. | REQ-20260712-208 | Active |
| DEC-20260712-203 | The local ramble/Telegram protocol branch is current work, but it includes workflow and broad runtime changes. | GitHub push token workflow scope and a dedicated verification pass for protocol/server/parser behavior. | Codex/operator release lane | Keep it out of the One Time app launch commit and release as a separate scoped protocol lane after workflow-scope clearance. | Merge it into the same app launch commit; cherry-pick only non-workflow files. | Same-commit merge risks pushing a workflow change that GitHub rejects and mixing app launch stabilization with broad Telegram/runtime changes. Partial cherry-pick weakens provenance. | Verify/push the protocol branch separately or provide workflow-scope credentials/approval for a dedicated protocol release. | REQ-20260712-205, REQ-20260712-208 | Active |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260712-201 | Raw/register/ledger/changelog | Add coordination records. | File inspection and git status. | pending | pending | not required |
| REQ-20260712-202 | Git refs/run files | Inventory branches, worktrees, PRs, active run status, and dirty work. | `git fetch`, `git branch`, `gh pr list`, `npm run bna:run:status`, `npm run bna:run:next`, `ops/branch-audits/2026-07-12-launch-consolidation.md`. | pending | pending | not required |
| REQ-20260712-203 | Dirty local files | Attribute dirty files to One Time release, Telegram sidekick packet, generated evidence, or unrelated lanes. | `git status`, diffs, tests by scope. | `71c9f7d78`, `a3ad94a6d`, `3930d8e05` | `origin/codex/launch-consolidation-20260712` | not required |
| REQ-20260712-204 | `master` | Safely reconcile local master with `origin/master`. | `git switch master`; `git merge --ff-only origin/master`; `git rev-parse --short master` equals `origin/master` (`e5efbb15a`). | not required | not required | not required |
| REQ-20260712-205 | Merge candidates | Merge one branch at a time after diff review. | Focused tests per branch. | `71c9f7d78` for One Time consolidation; protocol branch blocked by workflow scope. | PR #130 for launch consolidation | blocked before master merge/deploy |
| REQ-20260712-206 | Remote branch backlog | Classify and record outcome. | Branch ancestry/content audit. | `71c9f7d78` | PR #130 | not required unless code merged |
| REQ-20260712-207 | Test/watchdog gates | Run required verification. | npm scripts and reports. | `71c9f7d78`, `a3ad94a6d`, `3930d8e05` | PR #130 | not required |
| REQ-20260712-208 | Deploy/live services | Push, deploy, read back exact SHA, smoke affected live routes. | Release gate and live smoke reports. | blocked before master merge/deploy | PR #130 draft | blocked |
| REQ-20260712-209 | Source-of-truth records | Update final statuses and closeout. | Register final audit. | pending | pending | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260712-201 | Done | This register and raw input files. | raw-input/RAW-20260712-006-*, tasks-pending/2026-07-12-launch-consolidation-merge-deploy.md | File creation; launch goal active. | Continue branch/dirty-work audit. |
| REQ-20260712-202 | Done | Branch/worktree/run inventory plus branch audit. | ops/branch-audits/2026-07-12-launch-consolidation.md, ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion/run.json | `git fetch --all --prune`; `gh pr list --state open`; `git worktree list`; `git branch --no-merged origin/master`; `git branch -r --no-merged origin/master`; `npm run bna:run:status`. | Remote stale branches are classified as not safe for blind merge. |
| REQ-20260712-203 | Done | Clean launch-consolidation commits and pushed branch. | broad launch candidate, ops/branch-audits/2026-07-12-launch-consolidation.md | `npm run secrets:audit`; `git diff --cached --check`; `git status --short --branch` clean before push. | None for preservation; release remains blocked separately. |
| REQ-20260712-204 | Done | Local `master` fast-forwarded to current `origin/master`. | git refs only | `git merge --ff-only origin/master`; `git rev-parse --short master`; `git rev-parse --short origin/master`. | Launch candidate remains in PR #130 and was not merged to master because production readiness is blocked. |
| REQ-20260712-205 | Blocked | One Time launch consolidation is in PR #130; protocol branch push rejected by GitHub workflow-scope rule. | ops/branch-audits/2026-07-12-launch-consolidation.md | `git push -u origin codex/launch-consolidation-20260712` PASS; `gh pr create --draft` PASS; `git push -u origin codex/ramble-protocol-telegram-unification-20260712` rejected for missing `workflow` scope. | Protocol branch needs workflow-scope token or separate no-workflow release strategy. |
| REQ-20260712-206 | Done | Remote branch backlog classified. | ops/branch-audits/2026-07-12-launch-consolidation.md | `git branch -r --no-merged origin/master`; ancestry/content audit. | Historical branches should not be blindly revived into launch. |
| REQ-20260712-207 | Done | Focused One Time tests and smokes passed; readiness gate blocks on true external/proof blockers. | ops/evidence/one-time-crm-journey/2026-07-12/report.md, ops/ui-audits/2026-07-11-onetime-p0p1-corrective/public-onboarding-smoke.md, ops/production-readiness/latest-production-readiness-snapshot.md | `npm run test:onetime:focused`; `npm run one-time:smoke:operations-crm-workbench-local`; `npm run one-time:smoke:public-onboarding-local`; `npm run watchdog:actions`; `npm run bna:run:status`; `npm run production:readiness:gate -- --json`. | Gate remains blocked by external setup, Rabbi Telegram runtime, Agent Mode proof, and merge/deploy/readback requirements. |
| REQ-20260712-208 | Blocked | Draft PR #130 and production readiness gate report. | ops/production-readiness/latest-production-readiness-snapshot.md, ops/production-readiness/latest-production-unblocker.md | `gh pr view 130` reports draft/open/mergeable; `npm run production:readiness:gate -- --json` returned blocked. | Cannot honestly merge to master/deploy/Done until external setup fields, Rabbi Telegram runtime, Agent Mode proofs, and approved release/deploy readbacks are cleared. |
| REQ-20260712-209 | Blocked | This register, branch audit, ledger, changelog, and PR #130. | tasks-pending/2026-07-12-launch-consolidation-merge-deploy.md | Closeout records updated. | Final terminal launch Done is blocked by REQ-20260712-208. |
