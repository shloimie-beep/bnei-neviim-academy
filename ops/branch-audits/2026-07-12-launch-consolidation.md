# Launch Consolidation Branch Audit - 2026-07-12

Source request: `RAW-20260712-006`

## Commands

- `git fetch --all --prune`
- `gh pr list --state open --json number,title,headRefName,baseRefName,url,isDraft`
- `git worktree list`
- `git branch --no-merged origin/master`
- `git branch -r --no-merged origin/master`
- `git cherry -v origin/master <branch>`
- `git diff --name-only origin/master...<branch>`

## Current release lane

- `codex/launch-consolidation-20260712`
- Created to preserve the dirty launch workspace, merge current `origin/master`,
  resolve conflicts, and verify the One Time launch candidate before any master
  handoff.

## Local branch classification

| Branch | Classification | Evidence | Launch action |
|---|---|---|---|
| `codex/onetime-crm-portal-release-20260712` | Already on `origin/master` | `git branch --contains origin/master` includes this branch at `e5efbb15a`. | No merge needed. |
| `codex/onetime-family-buttons-hotfix-20260712` | Already merged to `origin/master` | `git branch --merged origin/master` includes this branch. | No merge needed. |
| `codex/onetime-landing-followup-20260712` / `codex/onetime-landing-visual-20260712` | Already merged to `origin/master` | `git branch --merged origin/master` includes both branch names. | No merge needed. |
| `codex/onetime-p0p1-corrective-20260711` | Patch-equivalent / already integrated | `git cherry -v origin/master codex/onetime-p0p1-corrective-20260711` reports `- 3f47c0ded Add One Time delivery outbox dispatcher`. | Do not ancestry-merge again; evidence and implementation are already carried into the consolidation state. |
| `codex/onetime-signup-location-hotfix-20260712` | Current missing One Time work | `git cherry -v origin/master` reports six unique commits through `24b920564 Use visible One Time signup type buttons`. | Incorporated into the consolidation candidate and verified with focused tests plus public onboarding smoke. |
| `codex/ramble-protocol-telegram-unification-20260712` | Current but separate blocked protocol lane | `git cherry -v origin/master` reports two unique commits, including `.github/workflows/ramble-protocol.yml`, migration, Telegram bridge, parser, server, and test changes. `git push -u origin codex/ramble-protocol-telegram-unification-20260712` was rejected because the OAuth token lacks `workflow` scope for `.github/workflows/ramble-protocol.yml`. A merge simulation against current `origin/master` also reports conflicts in generated action registries, `package.json`, `server.js`, and tests. | Do not fold into the One Time launch commit without separate protocol verification, conflict resolution, and workflow-scope push clearance. Keep as next scoped release/blocker. |

## Remote branch classification

| Branch group | Branches | Classification | Reason |
|---|---|---|---|
| Current One Time branches | `origin/codex/onetime-p0p1-corrective-20260711`, `origin/codex/onetime-signup-location-hotfix-20260712` | Integrated / incorporated | P0/P1 patch is equivalent to master; signup hotfix changes are in the consolidation candidate. |
| Already merged local counterparts | `origin/codex/onetime-family-buttons-hotfix-20260712`, `origin/codex/onetime-landing-visual-20260712` | Already on master | Local branches with the same heads are merged into `origin/master`; no additional action. |
| Historical Agent Review / Issue 24 lanes | `origin/codex/agent-review-dropoff-repair-20260626`, `origin/codex/agent-review-public-helper-guardrail-20260626`, `origin/codex/issue24-owner-correction-followup-20260626`, `origin/codex/issue24-owner-followup-live-evidence-20260626` | Stale / separate evidence lanes | One-commit branches hundreds of commits behind current master, mostly TASKS, registry, live-smoke, and helper guardrail evidence. Reviving them directly risks overwriting newer Agent Review state. |
| Historical One Time setup / cleanup lanes | `origin/codex/one-time-clean-integration-20260702`, `origin/codex/one-time-launch-cleanup-20260702-no-workflow`, `origin/codex/onetime-canonical-target-routing-20260705`, `origin/codex/onetime-class-session-metadata-repair-20260702`, `origin/codex/onetime-resend-inbound-crm-release-20260629`, `origin/codex/rabbi-onetime-comms-scope-release-20260629` | Stale / needs separate revival audit | These branches are 500+ commits behind current master and overlap with current server, route registry, setup, and communications code. Do not blind-merge into launch. |
| Operations login evidence lanes | `origin/codex/operations-login-glitch-20260705`, `origin/codex/operations-login-live-evidence-20260705` | Stale evidence / likely superseded | Old login fix/evidence branches are hundreds of commits behind current Operations shell and require a focused login replay if revived. |
| Deploy/readiness tooling lanes | `origin/codex/deploy-gate-closeout-record-20260706`, `origin/codex/deploy-gate-scoped-deferral-20260706`, `origin/codex/drive-dropoff-scheduler-repair-canonical-20260705`, `origin/codex/shipping-gate-20260706` | Stale / policy-sensitive | These touch deploy gates, Drive scheduler, MEMORY/TASKS, and readiness policy. Merge only through a dedicated deploy-governance lane. |
| Parser/Telegram historical lane | `origin/codex/telegram-participation-parser-20260630` | Stale / superseded by local ramble protocol lane | Current protocol work is in `codex/ramble-protocol-telegram-unification-20260712`; the older branch is hundreds of commits behind. |
| Non-master root/history branches | `origin/main`, `origin/release/operations-parent-student-action-registry-2026-06-11` | Do not merge into master | `origin/main` has no merge base with `origin/master`; the release branch is a historical registration/action-registry release root. |

## Launch conclusion

The only safe app-visible launch candidate from today's unmerged work is the
One Time consolidation set now pushed as draft PR #130:
https://github.com/shloimie-beep/bnei-neviim-academy/pull/130

The remaining current protocol lane is real work, but it is broad, includes a
workflow file rejected by GitHub because the current OAuth token lacks
`workflow` scope, conflicts with current master in several generated/runtime
files, and needs its own conflict-resolution plus verification pass before it
can be pushed or called deployable.

## Protocol lane blocker evidence

Command:

```bash
git merge-tree $(git merge-base origin/master codex/ramble-protocol-telegram-unification-20260712) origin/master codex/ramble-protocol-telegram-unification-20260712
```

Observed conflict classes:

- new workflow file `.github/workflows/ramble-protocol.yml`, which GitHub
  already rejected without OAuth `workflow` scope;
- generated action registry conflicts:
  `ops/action-registry/one-time-action-coverage.*` and
  `ops/action-registry/universal-action-parity.*`;
- `package.json`;
- `server.js`;
- `tests/rabbi-checkout-access.test.js`.

The branch diff is 44 files / 8,380 insertions / 450 deletions, so a no-workflow
split would still require a dedicated protocol branch, manual conflict
resolution, regenerated registries, and a focused protocol verification run.
