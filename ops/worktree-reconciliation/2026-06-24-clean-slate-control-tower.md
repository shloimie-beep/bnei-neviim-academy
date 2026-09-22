# Clean-Slate Control Tower Worktree Reconciliation

| Field | Value |
|---|---|
| Generated | 2026-06-24T14:51:57.3303033+03:00 |
| Raw source | RAW-20260624-003 |
| Repository | shloimie-beep/bnei-neviim-academy |
| origin/master | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` |
| local master | `484563b583a58cb2e88b4db3a32ebcefdb1bb63e` |
| main worktree HEAD | `25609511186ef224cc7b3fc56b4b1143df16790b` |
| Worktrees inspected | 50 |
| Dirty worktrees | 12 |
| Stashes | 1 |
| Current Railway app deployment | `5e37d2a0-7e81-4339-a721-c4286e8ecaa8` / SUCCESS |
| Deployed SHA inference | `8f8b0b458a95d146777808dbdf1f760618632615` from `Deploy Rabbi Scheller parity 8f8b0b45` |

## Commands Recorded

- `git remote -v`
- `git fetch --all --prune`
- `git worktree list --porcelain`
- `git branch -vv`
- `git status --short in every worktree`
- `git rev-parse HEAD and upstream readback in every worktree where available`
- `git log @{u}..HEAD for local commits not pushed where an upstream exists`
- `git log origin/master..HEAD for commits not merged to current origin/master`
- `git stash list`
- `gh pr view 12/13/14/15 for relationship verification`
- `railway service status --service skillful-motivation --environment production --json`
- `railway deployment list --service skillful-motivation --environment production --limit 5 --json`

## Claim Verification

| Claim | Result | Evidence |
|---|---|---|
| PR #14 head `f9625e8c15e0a63a272582e839bf42b100cd6714` | Verified | PR #14 branch resolves to `f9625e8c15e0a63a272582e839bf42b100cd6714` |
| PR #15 head `1ab57eac802ef172a5e96651dabc203d3420cbd9` | Verified | PR #15 branch resolves to `1ab57eac802ef172a5e96651dabc203d3420cbd9` |
| PR #12/#13 history already represented by PR #14 | Verified | PR #14 includes PR #12 `428ee78682a201b233b2f3da71bf0205b48812ad` and PR #13 `6560b8f02580e5f182a95df84ad8d5383403d887` history plus later owner-review commits. |
| PR #15 reportedly deployed | Partially verified | Railway active deployment `5e37d2a0-7e81-4339-a721-c4286e8ecaa8` says `Deploy Rabbi Scheller parity 8f8b0b45`; inferred deployed commit `8f8b0b458a95d146777808dbdf1f760618632615`, while PR #15 head is `1ab57eac802ef172a5e96651dabc203d3420cbd9`. |
| `service-provider-studio-integration` dirty closeout work | Verified pending preservation | Worktree `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` has 17 dirty/untracked entries. |

## Pull Requests

| PR | State | Draft | Branch | Head | Base | Merge State | Commits since origin/master |
|---|---|---|---|---|---|---|---:|
| #12 | OPEN | True | `codex/issue-8-complete-system-reconciliation` | `428ee78682a201b233b2f3da71bf0205b48812ad` | `master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f` | CLEAN | 41 |
| #13 | OPEN | True | `codex/one-time-batch4-control-plane-20260623` | `6560b8f02580e5f182a95df84ad8d5383403d887` | `master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f` | CLEAN | 21 |
| #14 | OPEN | True | `codex/integration-navigation-owner-review-20260624` | `f9625e8c15e0a63a272582e839bf42b100cd6714` | `master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f` | CLEAN | 78 |
| #15 | OPEN | True | `codex/rabbi-scheller-parity-20260624` | `1ab57eac802ef172a5e96651dabc203d3420cbd9` | `master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f` | CLEAN | 2 |

## Worktree Summary

| Path | Branch | HEAD | Upstream | Dirty entries | Commits not in origin/master | Local not pushed |
|---|---|---|---|---:|---:|---:|
| `C:/Users/User/BNA v2.0` | `integration/20260619-platform-finish` | `25609511186ef224cc7b3fc56b4b1143df16790b` | `` | 263 | 14 | 0 |
| `C:/Users/User/AppData/Local/Temp/bna-parser-fix-worktree-20260622111219` | `detached` | `e4cf9980a07ad17e5550d29d6834259a1d8caffd` | `` | 1 | 0 | 0 |
| `C:/Users/User/AppData/Local/Temp/bna-release-deploy-22fcff0d` | `detached` | `22fcff0d9665cb9638e4835a20cd8a962d79a4a8` | `` | 0 | 0 | 0 |
| `C:/Users/User/AppData/Local/Temp/bna-release-deploy-48343f1f` | `detached` | `48343f1fd833d61d054a7ccba82bce8493016639` | `` | 0 | 0 | 0 |
| `C:/Users/User/BNA-ops-audit-publish` | `codex/operations-ui-audit-harness-clean` | `b8baede8c043dcf70799fe6ef2b0b76efa421a73` | `` | 0 | 1 | 0 |
| `C:/Users/User/BNA-protocol-pr-worktree` | `codex/ramble-to-done-protocol` | `e4c062f370409978325b291129b8380764aa3716` | `` | 0 | 2 | 0 |
| `C:/Users/User/BNA-recovery-20260618` | `codex/2026-06-18-bna-platform-completion` | `4fd14782de7ca495c15a5f2e1b91edf0c40e499b` | `` | 0 | 101 | 0 |
| `C:/Users/User/bna-release-clean` | `release/operations-parent-student-action-registry-2026-06-11` | `09f419e78be1a896bd6012b8c10aca736f56a499` | `origin/release/operations-parent-student-action-registry-2026-06-11` | 18 | 10 | 0 |
| `C:/Users/User/BNA-stripe-checkpoint` | `detached` | `bd84112a1c95f0dd8d4f9145b8e2371c75218ccc` | `` | 0 | 0 | 0 |
| `C:/Users/User/BNA-worktrees/20260619-core` | `parallel/20260619-core` | `f539ec80dd5e5f2e62755d2fdcee42e0be15a49c` | `` | 0 | 2 | 0 |
| `C:/Users/User/BNA-worktrees/20260619-ingestion` | `parallel/20260619-ingestion` | `3f0c7b309caae7eb4ca33283063bd029c75c1c07` | `` | 0 | 2 | 0 |
| `C:/Users/User/BNA-worktrees/20260619-onetime` | `parallel/20260619-onetime` | `b2fd5039990ee1cb370a49d4475a7763fb8548b7` | `` | 0 | 1 | 0 |
| `C:/Users/User/BNA-worktrees/20260619-ui` | `parallel/20260619-ui` | `c978b63ad65de4006ee90735e63a2e9df1fb9bc5` | `` | 0 | 2 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-14-b89c17c0` | `detached` | `b89c17c0ec34a9ba871289afbec7b065c3a0d78f` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-39b5db0e` | `detached` | `39b5db0ea0fb154db8aaf2e69735a40b981a59fc` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-68e62775` | `detached` | `68e62775a0f0414427e6b5e6a592022c78d84742` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-16-be7e46ae` | `detached` | `be7e46ae9fefd2ea9f31c403c114b008ec7fc899` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-17-7efc8ce3` | `detached` | `7efc8ce3cd3b03c08b1d573d341efed212124785` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-19-34c74f22` | `detached` | `34c74f22145a4422777515b740b8e33eef3f539d` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-98b293d` | `detached` | `98b293d9b8957ec4567d8ede45f3e0d05bb1178b` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-b71b14c5` | `detached` | `b71b14c5252ca2145b738e11fe4ab547bb412c3a` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9i-f741fa91` | `detached` | `f741fa91a909db89a79a33b6de5193c6c481732c` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9j-6c45c4a4` | `detached` | `6c45c4a4f5be60ae8b5dcceee66087f3d54430ae` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | `codex/agent-control-center-20260619` | `a8190b04288365dab98df1f606e9d3c8e5bba62c` | `` | 26 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-23e16a12` | `detached` | `23e16a126f6e7461858b5701f2dbd2ba719a35c7` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-32708bfa-9f` | `detached` | `32708bfa5aa1d673a44ed5765178081ad57dc3de` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-35db6c0e-9e` | `detached` | `35db6c0e876243e61e7bce2f94db787a44626f06` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-37ef4c3a` | `detached` | `37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92` | `` | 2 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-4edeef1f-9f` | `detached` | `4edeef1fdbcf8dcc904ff578cb0ddccd2b62e1a4` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-53c66d20-9g` | `detached` | `53c66d204604ac94801a33bfa4c29306bdedb83b` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-5858f658` | `detached` | `5858f658ea4f3dccd5c3662f044764764d23582d` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-62715fd6` | `detached` | `62715fd68ad0956d92134560af303ba9d5fc7720` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-aedb04aa` | `detached` | `aedb04aade8d518427b9f4df011c8b5a9d07f306` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-b2371cdc-9e` | `detached` | `b2371cdc5a58fabb70ba1e764ead9dbe3d0eb7e8` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-req313-clean-a8190b04` | `detached` | `a8190b04288365dab98df1f606e9d3c8e5bba62c` | `` | 1 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/goal-c-users-user-downloads-codex/work/bna-active` | `codex/bna-full-audit-20260622` | `7fd06a1d0cf31ab70be89d9d64ae10f389c5676a` | `` | 344 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04` | `detached` | `04d93788c48f729001f99c54a67f89ef42cfbe79` | `` | 28 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-08229f73` | `detached` | `08229f7394787b351b21c07e4338ddb1e3f65dcb` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-168bda1f` | `detached` | `168bda1f18fb65864fdf4e75e242f9480c571325` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-61de54e2` | `detached` | `61de54e291b0ae986036b5cab0ad86e94034feec` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-68b939a4` | `detached` | `68b939a43ff238433aa09446aea2fd8ccbe5f792` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-6cfe7a25` | `detached` | `6cfe7a25848925ffc037c5fd784fc18e8112aacd` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-8a67ebb9` | `detached` | `4d43160be025df23f953bff38f7b0f1aaf7c10ad` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-95aab80a` | `detached` | `95aab80a7fc5957c16cae4923f02471a3e5b62fa` | `` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation` | `codex/issue-8-complete-system-reconciliation` | `428ee78682a201b233b2f3da71bf0205b48812ad` | `origin/codex/issue-8-complete-system-reconciliation` | 160 | 41 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` | `codex/one-time-batch4-control-plane-20260623` | `6560b8f02580e5f182a95df84ad8d5383403d887` | `origin/codex/one-time-batch4-control-plane-20260623` | 23 | 21 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio` | `codex/service-provider-studio-20260623` | `4936394ae0a942ad5cfc096dc281b6229bdf2fa1` | `origin/master` | 0 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` | `codex/service-provider-studio-integration-20260623` | `a9528b2d9467174d76d4c25bfb028f9308f24b4f` | `origin/master` | 17 | 0 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` | `codex/integration-navigation-owner-review-20260624` | `f9625e8c15e0a63a272582e839bf42b100cd6714` | `origin/codex/integration-navigation-owner-review-20260624` | 82 | 78 | 0 |
| `C:/Users/User/Documents/Codex/2026-06-24/rabbi-scheller-parity` | `codex/rabbi-scheller-parity-20260624` | `1ab57eac802ef172a5e96651dabc203d3420cbd9` | `origin/codex/rabbi-scheller-parity-20260624` | 0 | 2 | 0 |

## Dirty File Classification

### C:/Users/User/BNA v2.0

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `MEMORY.md` | evidence | must review |
| ` M` | `TASKS.md` | evidence | must review |
| ` M` | `docs/architecture/workspace-community-provider-role-map.md` | unknown | must review |
| ` M` | `docs/install-package/README.md` | unknown | must review |
| ` M` | `docs/integrations/RESEND.md` | unknown | must review |
| ` M` | `docs/integrations/VIMEO.md` | unknown | must review |
| ` M` | `docs/integrations/ZOOM.md` | unknown | must review |
| ` M` | `docs/integrations/onetime-vimeo-zoom-resend-readiness.md` | unknown | must review |
| ` M` | `docs/integrations/video-hosting-decision.md` | unknown | must review |
| ` M` | `docs/local-setup.md` | unknown | must review |
| ` M` | `ops/action-registry.json` | evidence | must review |
| ` M` | `ops/action-registry/actions.json` | evidence | must review |
| ` M` | `ops/agent-changelog.md` | evidence | must review |
| ` M` | `ops/agent-task-ledger.jsonl` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/BATCH-STATUS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/DEPLOYMENT.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/EVIDENCE.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/NEXT-SESSION.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/SOURCE.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/STATUS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/TEST-RESULTS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/requirements.json` | evidence | must review |
| ` M` | `ops/execution-runs/latest.json` | evidence | must review |
| ` M` | `ops/one-time-mishnah/task-decision-production-census.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/task-decision-production-census.md` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/route-registry.json` | evidence | must review |
| ` M` | `ops/task-decision-census/latest.json` | evidence | must review |
| ` M` | `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.json` | evidence | must review |
| ` M` | `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.md` | evidence | must review |
| ` M` | `package.json` | real implementation | must review |
| ` M` | `public/operations.html` | real implementation | must review |
| ` M` | `public/parent-login.html` | real implementation | must review |
| ` M` | `public/parent.html` | real implementation | must review |
| ` M` | `public/provider.html` | real implementation | must review |
| ` M` | `public/rabbi.html` | real implementation | must review |
| ` M` | `public/student.html` | real implementation | must review |
| ` M` | `scripts/one-time-ui-design-delta-audit.mjs` | real implementation | must review |
| ` M` | `scripts/task-decision-census.mjs` | real implementation | must review |
| ` M` | `scripts/task-queue-reconciler.mjs` | real implementation | must review |
| ` M` | `server.js` | real implementation | must review |
| ` M` | `src/lib/actions/actions/operations.js` | real implementation | must review |
| ` M` | `src/lib/actions/registry.js` | real implementation | must review |
| ` M` | `src/platform/community/index.js` | real implementation | must review |
| ` M` | `src/platform/domain/index.js` | real implementation | must review |
| ` M` | `src/platform/instances/one-time.js` | real implementation | must review |
| ` M` | `src/platform/integrations/readiness.js` | real implementation | must review |
| ` M` | `tasks-pending/2026-06-19-one-time-master-recovery-register.md` | evidence | must review |
| ` M` | `tests/google-workspace-settings-contract.test.js` | test | must review |
| ` M` | `tests/integrations/w4-onetime-readiness.test.js` | test | must review |
| ` M` | `tests/one-time-product-system.test.js` | test | must review |
| ` M` | `tests/one-time-role-auth-model.test.js` | test | must review |
| ` M` | `tests/one-time-ui-design-delta-audit.test.js` | test | must review |
| ` M` | `tests/operations-task-comments-and-dictation.test.js` | test | must review |
| ` M` | `tests/task-decision-census.test.js` | test | must review |
| ` M` | `tests/task-queue-reconciler.test.js` | test | must review |
| ` M` | `tests/telegram-media-routing.test.js` | test | must review |
| ` M` | `tests/watchdog-action-registry.test.js` | test | must review |
| ` M` | `tests/workspace-task-no-stale-agent.test.js` | test | must review |
| `??` | `docs/architecture/telegram-control-plane.md` | unknown | must review |
| `??` | `docs/product/one-time-announcements-first-community.md` | unknown | must review |
| `??` | `docs/product/one-time-class-course-ingestion.md` | unknown | must review |
| `??` | `docs/product/one-time-local-beta-startup-seed-reset.md` | unknown | must review |
| `??` | `docs/product/one-time-pilot-product-model.md` | unknown | must review |
| `??` | `docs/product/one-time-progress-rewards-local-beta.md` | unknown | must review |
| `??` | `docs/product/one-time-reliability-security-registry-hardening.md` | unknown | must review |
| `??` | `docs/product/one-time-roles-and-portals.md` | unknown | must review |
| `??` | `docs/product/provider-directory-and-consent.md` | unknown | must review |
| `??` | `docs/product/provider-telegram-onboarding.md` | unknown | must review |
| `??` | `docs/releases/` | unknown | must review |
| `??` | `memory/2026-06-20.md` | evidence | must review |
| `??` | `memory/2026-06-22.md` | evidence | must review |
| `??` | `memory/2026-06-23.md` | evidence | must review |
| `??` | `memory/2026-06-24.md` | evidence | must review |
| `??` | `ops/action-registry/one-time-action-coverage.json` | evidence | must review |
| `??` | `ops/action-registry/one-time-action-coverage.md` | evidence | must review |
| `??` | `ops/action-registry/universal-action-parity.json` | evidence | must review |
| `??` | `ops/action-registry/universal-action-parity.md` | evidence | must review |
| `??` | `ops/audits/2026-06-19-active-queue-reconciliation.md` | evidence | must review |
| `??` | `ops/audits/2026-06-23-rabbi-scheller-route-map.json` | evidence | must review |
| `??` | `ops/audits/2026-06-23-rabbi-scheller-workspace-parity-audit.md` | evidence | must review |
| `??` | `ops/audits/2026-06-24-telegram-action-parity.json` | evidence | must review |
| `??` | `ops/audits/2026-06-24-telegram-action-parity.md` | evidence | must review |
| `??` | `ops/audits/2026-06-24-telegram-system-truth.json` | evidence | must review |
| `??` | `ops/audits/2026-06-24-telegram-system-truth.md` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T06-29-03-146Z-google-drive-audit.json` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T06-29-03-146Z-google-drive-audit.md` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T06-33-live-content-jobs-summary.md` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T09-30-14-937Z-google-drive-audit.json` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T09-30-14-937Z-google-drive-audit.md` | evidence | must review |
| `??` | `ops/drive-audits/2026-06-23T09-31-drive-class-intake-recovery.md` | evidence | must review |
| `??` | `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/` | evidence | must review |
| `??` | `ops/operator-setup/` | unknown | must review |
| `??` | `ops/playwright-smokes/2026-06-23-portal-agnostic-login-chooser-local/` | evidence | must review |
| `??` | `ops/playwright-smokes/2026-06-23-rabbi-scheller-operations-navigation-local/` | evidence | must review |
| `??` | `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-api-usage-local/` | evidence | must review |
| `??` | `ops/playwright-smokes/2026-06-23-rabbi-scheller-provider-navigation-local/` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T06-32-54-117Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T06-32-54-117Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T08-15-32-502Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T08-15-32-502Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T08-21-38-032Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T08-21-38-032Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-24-telegram-end-to-end.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-24-telegram-end-to-end.md` | evidence | must review |
| `??` | `ops/system-audits/2026-06-20T17-45-47-985Z-task-queue-reconciler.md` | evidence | must review |
| `??` | `ops/system-audits/2026-06-20T17-47-42-557Z-task-queue-reconciler.md` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-55-18-056Z-task-decision-census.json` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-55-18-056Z-task-decision-census.md` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-59-21-573Z-task-decision-census.json` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-59-21-573Z-task-decision-census.md` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-59-45-057Z-task-decision-census.json` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T08-59-45-057Z-task-decision-census.md` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T09-00-25-038Z-task-decision-census.json` | evidence | must review |
| `??` | `ops/task-decision-census/2026-06-21T09-00-25-038Z-task-decision-census.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-32-watchdog-ui-smoke.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-communications-alerts.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-watchdog-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-54-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-communications-alerts.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-watchdog-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-57-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-58-watchdog-ui-smoke.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T18-58-watchdog-visual-baseline.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-communications-alerts.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-watchdog-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-14-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-15-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-15-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-communications-alerts.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-watchdog-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-20T19-16-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T06-35-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T09-31-content-routing.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-40-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-40-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-42-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-42-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-44-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-44-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-06-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-16-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-17-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-28-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-43-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-44-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-53-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-03-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-04-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-08-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-19-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-32-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-38-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-02-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-24-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-42-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-51-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T21-03-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/worktree-reconciliation/` | unknown | must review |
| `??` | `raw-input/RAW-20260617-020-telegram-row-redacted-pointer.md` | evidence | must review |
| `??` | `raw-input/RAW-20260618-002-operations-ui-audit-harness-redacted-pointer.md` | evidence | must review |
| `??` | `raw-input/RAW-20260620-001-onetime-local-beta-hardening-super-prompt.md` | evidence | must review |
| `??` | `raw-input/RAW-20260622-001-github-issue-7-canonical-agent-execution-system.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-001-drive-class-intake-parser-stuck.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-002-operator-laptop-bootstrap-package.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-003-provider-portal-password-invalid.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-004-super-admin-universal-portal-login.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-005-telegram-website-control-plane-addendum.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-006-rabbi-scheller-workspace-parity-audit.md` | evidence | must review |
| `??` | `raw-input/RAW-20260623-007-super-admin-one-time-view.md` | evidence | must review |
| `??` | `raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md` | evidence | must review |
| `??` | `raw-input/RAW-20260624-003-clean-slate-control-tower.md` | evidence | must review |
| `??` | `scripts/Sync-BNA.ps1` | real implementation | must review |
| `??` | `scripts/build-operator-laptop-installer.ps1` | real implementation | must review |
| `??` | `scripts/build-rabbi-scheller-route-map.mjs` | real implementation | must review |
| `??` | `scripts/generate-one-time-action-coverage.mjs` | real implementation | must review |
| `??` | `scripts/generate-universal-action-parity.mjs` | real implementation | must review |
| `??` | `scripts/one-time-browser-acceptance.mjs` | real implementation | must review |
| `??` | `scripts/one-time-local-beta.mjs` | real implementation | must review |
| `??` | `scripts/one-time-local-hardening-audit.mjs` | real implementation | must review |
| `??` | `scripts/one-time-synthetic-pilot.mjs` | real implementation | must review |
| `??` | `scripts/smoke-portal-agnostic-login-chooser-local.mjs` | real implementation | must review |
| `??` | `scripts/smoke-rabbi-scheller-operations-navigation-local.mjs` | real implementation | must review |
| `??` | `scripts/smoke-rabbi-scheller-provider-api-usage-local.mjs` | real implementation | must review |
| `??` | `scripts/smoke-rabbi-scheller-provider-navigation-local.mjs` | real implementation | must review |
| `??` | `src/lib/bna/provider-api-usage.js` | real implementation | must review |
| `??` | `src/platform/assistant/` | real implementation | must review |
| `??` | `src/platform/community/announcements-first.js` | real implementation | must review |
| `??` | `src/platform/domain/provider-directory-consent.js` | real implementation | must review |
| `??` | `src/platform/ingestion/one-time-class-course-builder.js` | real implementation | must review |
| `??` | `src/platform/integrations/media-local-pipeline.js` | real implementation | must review |
| `??` | `src/platform/integrations/resend-local-outbox.js` | real implementation | must review |
| `??` | `src/platform/integrations/stripe-local-beta.js` | real implementation | must review |
| `??` | `src/platform/progress/` | real implementation | must review |
| `??` | `tasks-pending/2026-06-20-website-ramble-correction-audit.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-22-github-issue-7-canonical-agent-execution-queued.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-drive-class-intake-parser-stuck.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-operator-laptop-bootstrap-package.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-rabbi-scheller-workspace-parity-audit.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-super-admin-one-time-view.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-super-admin-universal-portal-login.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-23-telegram-website-control-plane-addendum.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-24-clean-slate-control-tower-reconciliation.md` | evidence | must review |
| `??` | `tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md` | evidence | must review |
| `??` | `tests/assistant-action-planner-contract.test.js` | test | must review |
| `??` | `tests/assistant-automation-builder-contract.test.js` | test | must review |
| `??` | `tests/assistant-campaign-control-contract.test.js` | test | must review |
| `??` | `tests/assistant-chart-dashboard-config-contract.test.js` | test | must review |
| `??` | `tests/assistant-control-center-contract.test.js` | test | must review |
| `??` | `tests/assistant-control-plane-data-model.test.js` | test | must review |
| `??` | `tests/assistant-draft-versioning-contract.test.js` | test | must review |
| `??` | `tests/assistant-file-media-intake-contract.test.js` | test | must review |
| `??` | `tests/assistant-parent-self-service-contract.test.js` | test | must review |
| `??` | `tests/assistant-problem-resolution-contract.test.js` | test | must review |
| `??` | `tests/assistant-provider-onboarding-studio-contract.test.js` | test | must review |
| `??` | `tests/assistant-reminder-notifications-contract.test.js` | test | must review |
| `??` | `tests/one-time-announcements-first-community.test.js` | test | must review |
| `??` | `tests/one-time-class-course-ingestion.test.js` | test | must review |
| `??` | `tests/one-time-local-beta-product-contract.test.js` | test | must review |
| `??` | `tests/one-time-local-beta-startup-reset.test.js` | test | must review |
| `??` | `tests/one-time-local-hardening-audit.test.js` | test | must review |
| `??` | `tests/one-time-media-local-pipeline.test.js` | test | must review |
| `??` | `tests/one-time-progress-rewards-local-beta.test.js` | test | must review |
| `??` | `tests/one-time-provider-directory-consent.test.js` | test | must review |
| `??` | `tests/one-time-resend-local-outbox.test.js` | test | must review |
| `??` | `tests/one-time-stripe-local-beta.test.js` | test | must review |
| `??` | `tests/one-time-synthetic-pilot.test.js` | test | must review |
| `??` | `tests/operations-one-time-view-as.test.js` | test | must review |
| `??` | `tests/operations-task-queue-visibility.test.js` | test | must review |
| `??` | `tests/operator-laptop-installer.test.js` | test | must review |
| `??` | `tests/portal-agnostic-auth-contract.test.js` | test | must review |
| `??` | `tests/portal-operations-login-fallback.test.js` | test | must review |
| `??` | `tests/provider-api-usage-readiness.test.js` | test | must review |
| `??` | `tests/rabbi-scheller-auth-navigation-contract.test.js` | test | must review |
| `??` | `tests/rabbi-scheller-route-map-contract.test.js` | test | must review |
| `??` | `tests/rabbi-scheller-tenant-isolation-contract.test.js` | test | must review |
| `??` | `tests/universal-control-plane-scope-policy.test.js` | test | must review |

### C:/Users/User/AppData/Local/Temp/bna-parser-fix-worktree-20260622111219

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `server.js` | real implementation | must review |

### C:/Users/User/bna-release-clean

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `lighthouse-report.html` | unknown | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| ` M` | `public/operations.html` | real implementation | must review |
| ` M` | `screenshots/desktop-1440.png` | unknown | must review |
| ` M` | `screenshots/mobile-360.png` | unknown | must review |
| ` M` | `screenshots/mobile-390.png` | unknown | must review |
| ` M` | `screenshots/mobile-430.png` | unknown | must review |
| ` M` | `screenshots/tablet-768.png` | unknown | must review |
| ` M` | `scripts/telegram-kimi-bridge.mjs` | real implementation | must review |
| ` M` | `server.js` | real implementation | must review |
| ` M` | `tests/action-registry-telegram-ui-bot.test.js` | test | must review |
| ` M` | `tests/operations-saas-crm-redesign.test.js` | test | must review |
| ` M` | `tests/parent-student-portal-contract.test.js` | test | must review |
| `??` | `ops/qa-runs/2026-06-11-assistant-whatsapp-weekly-update-navigation-screenshots/` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-12-clean-deploy-mobile-smoke-live/` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-12-clean-deploy-mobile-smoke/` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `.env.example` | unknown | must review |
| ` M` | `AGENTS.md` | evidence | must review |
| ` M` | `README.md` | unknown | must review |
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `docs/local-setup.md` | unknown | must review |
| ` M` | `memory/2026-06-22.md` | evidence | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| ` M` | `scripts/smoke-openai-sidekick.mjs` | real implementation | must review |
| ` M` | `scripts/telegram-kimi-bridge.mjs` | real implementation | must review |
| ` M` | `server.js` | real implementation | must review |
| ` M` | `tests/ai-provider-selection.test.js` | test | must review |
| ` M` | `tests/telegram-media-routing.test.js` | test | must review |

### C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-37ef4c3a

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-21/one-time-req313-clean-a8190b04

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |

### C:/Users/User/Documents/Codex/2026-06-22/goal-c-users-user-downloads-codex/work/bna-active

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `.env.example` | unknown | must review |
| ` M` | `AGENTS.md` | evidence | must review |
| ` M` | `MEMORY.md` | evidence | must review |
| ` M` | `SYSTEM-STATE.md` | evidence | must review |
| ` M` | `TASKS.md` | evidence | must review |
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `docs/local-setup.md` | unknown | must review |
| ` M` | `ops/academy-telegram-worker.md` | unknown | must review |
| ` M` | `ops/action-registry.json` | evidence | must review |
| ` M` | `ops/action-registry/actions.json` | evidence | must review |
| ` M` | `ops/action-registry/page-action-map.json` | evidence | must review |
| ` M` | `ops/action-registry/ui-button-map.md` | evidence | must review |
| ` M` | `ops/agent-changelog.md` | evidence | must review |
| ` M` | `ops/agent-task-ledger.jsonl` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/BATCH-STATUS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/DEPLOYMENT.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/EVIDENCE.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/NEXT-SESSION.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/REQUIREMENTS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/SOURCE.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/STATUS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/TEST-RESULTS.md` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/requirements.json` | evidence | must review |
| ` M` | `ops/execution-runs/2026-06-21-one-time-master-completion/run.json` | evidence | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md` | evidence | must review |
| ` M` | `ops/route-registry.json` | evidence | must review |
| ` M` | `package.json` | real implementation | must review |
| ` M` | `public/css/bna-app-shell.css` | real implementation | must review |
| ` M` | `public/css/bna-site-nav.css` | real implementation | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| ` M` | `public/index.html` | real implementation | must review |
| ` M` | `public/js/bna-site-nav.js` | real implementation | must review |
| ` M` | `public/operations-login.html` | real implementation | must review |
| ` M` | `public/operations.html` | real implementation | must review |
| ` M` | `public/parent-login.html` | real implementation | must review |
| ` M` | `public/parent.html` | real implementation | must review |
| ` M` | `public/parents.html` | real implementation | must review |
| ` M` | `public/provider-profile.html` | real implementation | must review |
| ` M` | `public/provider.html` | real implementation | must review |
| ` M` | `public/student.html` | real implementation | must review |
| ` M` | `scripts/audit-hebrew-rtl-ui-labels.mjs` | real implementation | must review |
| ` M` | `scripts/full-ui-audit.mjs` | real implementation | must review |
| ` M` | `scripts/google-drive-audit.mjs` | real implementation | must review |
| ` M` | `scripts/ingest-drive-playlist-transcripts.mjs` | real implementation | must review |
| ` M` | `scripts/kimi-chat.mjs` | real implementation | must review |
| ` M` | `scripts/openai-key-diagnostics.mjs` | real implementation | must review |
| ` M` | `scripts/smoke-openai-sidekick.mjs` | real implementation | must review |
| ` M` | `scripts/smoke-public-route-privacy.mjs` | real implementation | must review |
| ` M` | `scripts/sync-drive-content-library.mjs` | real implementation | must review |
| ` M` | `scripts/telegram-kimi-bridge.mjs` | real implementation | must review |
| ` M` | `scripts/video-edit-source.mjs` | real implementation | must review |
| ` M` | `scripts/video-edit.mjs` | real implementation | must review |
| ` M` | `scripts/watchdog-action-audit.mjs` | real implementation | must review |
| ` M` | `scripts/watchdog-link-audit.mjs` | real implementation | must review |
| ` M` | `scripts/watchdog-security-routes.mjs` | real implementation | must review |
| ` M` | `server.js` | real implementation | must review |
| ` M` | `src/lib/actions/actions/operations.js` | real implementation | must review |
| ` M` | `src/lib/actions/page-action-map.js` | real implementation | must review |
| ` M` | `src/lib/actions/registry.js` | real implementation | must review |
| ` M` | `src/lib/bna/helper/permissions.js` | real implementation | must review |
| ` M` | `src/lib/bna/helper/planner.js` | real implementation | must review |
| ` M` | `src/lib/bna/helper/safety.js` | real implementation | must review |
| ` M` | `src/lib/bna/intake-parser.js` | real implementation | must review |
| ` M` | `src/lib/bna/wapi-phonebook-report.js` | real implementation | must review |
| ` M` | `src/platform/ingestion/canonical-parser.js` | real implementation | must review |
| ` M` | `src/platform/ingestion/intake-source.js` | real implementation | must review |
| ` M` | `tests/action-registry-telegram-ui-bot.test.js` | test | must review |
| ` M` | `tests/agent-control-center.test.js` | test | must review |
| ` M` | `tests/ai-provider-selection.test.js` | test | must review |
| ` M` | `tests/app-select-dropdown.test.js` | test | must review |
| ` M` | `tests/app-wide-brand-shell.test.js` | test | must review |
| ` M` | `tests/bna-brand-shell.test.js` | test | must review |
| ` M` | `tests/bna-helper-tools.test.js` | test | must review |
| ` M` | `tests/identity-linking.test.js` | test | must review |
| ` M` | `tests/ingestion/w3-intake-source.test.js` | test | must review |
| ` M` | `tests/ingestion/w3-parser-queue.test.js` | test | must review |
| ` M` | `tests/one-time-intake-scope-hardening.test.js` | test | must review |
| ` M` | `tests/one-time-operations-ui-smoke.test.js` | test | must review |
| ` M` | `tests/operations-pwa-login.test.js` | test | must review |
| ` M` | `tests/operations-saas-crm-redesign.test.js` | test | must review |
| ` M` | `tests/operations-shell-navigation-contract.test.js` | test | must review |
| ` M` | `tests/parent-student-portal-contract.test.js` | test | must review |
| ` M` | `tests/portal-toolbar-overview-ux.test.js` | test | must review |
| ` M` | `tests/public-route-privacy-contract.test.js` | test | must review |
| ` M` | `tests/signup-permissions-mobile-homepage.test.js` | test | must review |
| ` M` | `tests/student-bot-settings.test.js` | test | must review |
| ` M` | `tests/student-portal-auth-policy.test.js` | test | must review |
| ` M` | `tests/ui-01-public-operations-shell.test.js` | test | must review |
| ` M` | `tests/universal-assistant-contract.test.js` | test | must review |
| ` M` | `tests/wapi-phonebook-report.test.js` | test | must review |
| ` M` | `tests/watchdog-action-registry.test.js` | test | must review |
| ` M` | `tests/watchdog-route-security.test.js` | test | must review |
| ` M` | `tests/workspace-person-household-provider-contract.test.js` | test | must review |
| ` M` | `tests/workspace-task-no-stale-agent.test.js` | test | must review |
| `??` | `ops/execution-runs/2026-06-21-one-time-master-completion/RAW-20260622-003-source-statement-matrix.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T13-57-32-481Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T13-57-32-481Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T13-57-50-390Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T13-57-50-390Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-11-54-772Z-ai-provider-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-11-54-772Z-ai-provider-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-11-58-985Z-openai-diagnostics.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-11-58-985Z-openai-diagnostics.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-44-15-368Z-req006-public-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-44-15-368Z-req006-public-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-44-15-368Z-req006-public-navigation-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-44-15-368Z-req006-public-navigation-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-53-43-265Z-req006-public-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-53-43-265Z-req006-public-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-53-43-265Z-req006-public-navigation-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T14-53-43-265Z-req006-public-navigation-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-operations-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-provider-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-signup-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-05-52-241Z-req007-student-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-he-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-he-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-logged-out-chrome-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-logged-out-chrome-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-operations-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-operations-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-provider-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-provider-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-signup-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-signup-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-student-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-07-45-525Z-req007-student-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-he-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-he-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-home-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-home-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-logged-out-chrome-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-logged-out-chrome-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-operations-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-operations-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-provider-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-provider-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-signup-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-signup-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-student-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-10-02-336Z-req007-student-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-login-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-login-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-privacy-headless-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-36-23-622Z-req008-parent-privacy-headless-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-login-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-login-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-privacy-headless-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-38-46-568Z-req008-parent-privacy-headless-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-login-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-login-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-privacy-headless-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-42-16-759Z-req008-parent-privacy-headless-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-45-52-419Z-req008-parent-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-45-52-419Z-req008-parent-login-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-45-52-419Z-req008-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-login-desktop.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-login-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-login-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-login-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-mobile.dom.html` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-privacy-headless-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T15-46-20-306Z-req008-parent-privacy-headless-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-05-523Z-req010-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-05-523Z-req010-provider-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-05-523Z-req010-student-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-portal-chrome-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-portal-chrome-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-provider-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-provider-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-student-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-22-27-040Z-req010-student-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-parent-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-parent-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-portal-chrome-smoke.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-portal-chrome-smoke.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-provider-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-provider-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-student-desktop.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-24-09-578Z-req010-student-mobile.png` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-53-03-166Z-req011-parent-ia-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T16-53-03-166Z-req011-parent-ia-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-11-36-759Z-req012-student-portal-scope-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-11-36-759Z-req012-student-portal-scope-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-24-02-451Z-req013-student-context-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-24-02-451Z-req013-student-context-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-40-46-604Z-req014-operations-shell-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-40-46-604Z-req014-operations-shell-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-53-25-972Z-req015-task-lifecycle-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T17-53-25-972Z-req015-task-lifecycle-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-13-09-708Z-req016-wapi-crm-conversations-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-13-09-708Z-req016-wapi-crm-conversations-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-40-02-066Z-req017-pipeline-people-enrollment-static.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-40-02-066Z-req017-pipeline-people-enrollment-static.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-56-56-481Z-drive-history-reconciliation.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T18-56-56-481Z-drive-history-reconciliation.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-17-19-128Z-req019-content-ingestion-trace.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-17-19-128Z-req019-content-ingestion-trace.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-37-27-275Z-req020-class-transcript-parser.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-37-27-275Z-req020-class-transcript-parser.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-55-26-663Z-req021-progress-update-review.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T19-55-26-663Z-req021-progress-update-review.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-16-14-159Z-req022-content-library-readability.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-16-14-159Z-req022-content-library-readability.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-35-49-079Z-req023-professional-calendar.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-35-49-079Z-req023-professional-calendar.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-46-36-952Z-req024-live-classes-library-separation.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T20-46-36-952Z-req024-live-classes-library-separation.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-09-08-377Z-req025-communities-providers-scope-reviews.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-09-08-377Z-req025-communities-providers-scope-reviews.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-24-55-616Z-req026-communications-readiness.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-24-55-616Z-req026-communications-readiness.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-36-23-403Z-req027-communication-prompt-studio.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-36-23-403Z-req027-communication-prompt-studio.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-47-38-012Z-req028-communications-ia.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-47-38-012Z-req028-communications-ia.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-54-10-391Z-req029-clear-send-actions.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T21-54-10-391Z-req029-clear-send-actions.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-06-34-122Z-req030-global-contextual-helper.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-06-34-122Z-req030-global-contextual-helper.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-20-55-891Z-req031-accounting-reporting.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-20-55-891Z-req031-accounting-reporting.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-32-46-921Z-req032-workflow-control-loop.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-32-46-921Z-req032-workflow-control-loop.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-47-26-856Z-req033-integration-readiness.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T22-47-26-856Z-req033-integration-readiness.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-04-00-000Z-req034-full-ui-audit.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-04-00-000Z-req034-full-ui-audit.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-20-00-000Z-req035-action-route-registry.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-20-00-000Z-req035-action-route-registry.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-35-00-000Z-req036-required-batches-terminal.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-35-00-000Z-req036-required-batches-terminal.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-50-00-000Z-req037-verification-matrix.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-50-00-000Z-req037-verification-matrix.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-59-00-000Z-req038-final-closeout.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-22T23-59-00-000Z-req038-final-closeout.md` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T00-20-00-000Z-run-validation-repair.json` | evidence | must review |
| `??` | `ops/qa-runs/2026-06-23T00-20-00-000Z-run-validation-repair.md` | evidence | must review |
| `??` | `ops/seed-runs/2026-06-22-req009-default-disabled/` | unknown | must review |
| `??` | `ops/seed-runs/2026-06-22-req009-test-personas-local/` | unknown | must review |
| `??` | `ops/system-audits/2026-06-22T14-18-23-915Z-rabbi-task-flow-audit.md` | evidence | must review |
| `??` | `ops/system-audits/2026-06-22T14-25-20-689Z-rabbi-task-flow-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-19-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-19-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-20-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-20-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-33-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-33-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-37-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-37-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-38-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-38-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-45-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-45-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-59-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T23-59-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T00-01-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T00-01-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T05-04-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T05-04-watchdog-security-routes.md` | evidence | must review |
| `??` | `raw-input/RAW-20260622-003-bna-one-time-full-system-audit.md` | evidence | must review |
| `??` | `raw-input/RAW-20260622-003-full-source-prompt.md` | evidence | must review |
| `??` | `scripts/ai-provider-diagnostics.mjs` | real implementation | must review |
| `??` | `scripts/drive-history-reconciliation.mjs` | real implementation | must review |
| `??` | `scripts/seed-bna-test-personas.mjs` | real implementation | must review |
| `??` | `src/lib/bna/ai-provider-config.js` | real implementation | must review |
| `??` | `src/lib/bna/class-transcript-parser.js` | real implementation | must review |
| `??` | `src/lib/bna/content-ingestion-trace.js` | real implementation | must review |
| `??` | `src/lib/bna/drive-history-reconciliation.js` | real implementation | must review |
| `??` | `src/lib/bna/progress-update-review.js` | real implementation | must review |
| `??` | `tasks-pending/2026-06-22-bna-one-time-full-system-audit.md` | evidence | must review |
| `??` | `tests/bna-test-personas.test.js` | test | must review |
| `??` | `tests/drive-history-reconciliation.test.js` | test | must review |
| `??` | `tests/operations-task-lifecycle-separation.test.js` | test | must review |
| `??` | `tests/parent-portal-security-contract.test.js` | test | must review |
| `??` | `tests/req016-wapi-crm-conversations.test.js` | test | must review |
| `??` | `tests/req017-pipeline-people-enrollment.test.js` | test | must review |
| `??` | `tests/req019-content-ingestion-trace.test.js` | test | must review |
| `??` | `tests/req020-class-transcript-parser.test.js` | test | must review |
| `??` | `tests/req021-progress-update-review.test.js` | test | must review |
| `??` | `tests/req022-content-library-readability.test.js` | test | must review |
| `??` | `tests/req023-professional-calendar.test.js` | test | must review |
| `??` | `tests/req024-live-classes-library-separation.test.js` | test | must review |
| `??` | `tests/req025-communities-providers-scope-reviews.test.js` | test | must review |
| `??` | `tests/req026-communications-readiness.test.js` | test | must review |
| `??` | `tests/req027-communication-prompt-studio.test.js` | test | must review |
| `??` | `tests/req028-communications-ia.test.js` | test | must review |
| `??` | `tests/req029-clear-send-actions.test.js` | test | must review |
| `??` | `tests/req030-global-contextual-helper.test.js` | test | must review |
| `??` | `tests/req031-accounting-reporting.test.js` | test | must review |
| `??` | `tests/req032-workflow-editing-control-loop.test.js` | test | must review |
| `??` | `tests/req033-integration-ownership-readiness.test.js` | test | must review |
| `??` | `tests/req034-full-ui-audit.test.js` | test | must review |
| `??` | `tests/req035-action-route-registry-coverage.test.js` | test | must review |
| `??` | `tests/req036-required-batches-terminal.test.js` | test | must review |
| `??` | `tests/req037-verification-matrix.test.js` | test | must review |
| `??` | `tests/req038-final-closeout.test.js` | test | must review |
| `??` | `work/` | unknown | must review |

### C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md` | evidence | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-05-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-05-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-07-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-07-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-12-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-12-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-18-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-18-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-32-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-22T13-32-watchdog-security-routes.md` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png` | evidence | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-09-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-09-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-11-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-11-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-16-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-16-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-23-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-23-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-32-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-32-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-40-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-40-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-41-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-41-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-44-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-45-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-45-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-45-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-50-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-50-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-50-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-58-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-58-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T11-58-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-05-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-05-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-05-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-06-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-06-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-06-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-09-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-11-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-11-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-11-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-20-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-20-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-20-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-31-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-32-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-34-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-34-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-34-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-35-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-35-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-35-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-43-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-44-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-46-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-46-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-46-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-53-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-53-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-55-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-55-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T12-55-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-03-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-03-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-03-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-16-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-16-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-16-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-24-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-24-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-24-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-36-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-36-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-36-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-54-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-54-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-58-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-58-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T13-58-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-08-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-08-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-08-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-10-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-10-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-10-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-22-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-22-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-22-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-29-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-29-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-29-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-40-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-40-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-40-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-50-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-50-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T14-50-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-01-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-01-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-01-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-11-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-11-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-11-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-24-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-24-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-24-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-31-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-31-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-31-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-41-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-41-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-41-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-48-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-49-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-52-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-52-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T15-52-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-06-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-06-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-06-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-14-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-14-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-14-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-26-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-26-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-26-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-27-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-27-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-27-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-38-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-38-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-38-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-49-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-49-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-49-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-57-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-57-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T16-57-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-09-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-09-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-09-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-17-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-17-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-17-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-09-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-09-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-09-watchdog-security-routes.md` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-overview.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png` | evidence | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T17-54-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T18-38-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-03-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-15-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-17-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-23T20-29-watchdog-action-audit.md` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `config/service-provider-sites/one-time.json` | unknown | must review |
| ` M` | `ops/agent-changelog.md` | evidence | must review |
| ` M` | `ops/agent-task-ledger.jsonl` | evidence | must review |
| ` M` | `public/css/one-time-shared-review.css` | real implementation | must review |
| ` M` | `public/one-time-classroom.html` | real implementation | must review |
| ` M` | `public/one-time-email-review.html` | real implementation | must review |
| ` M` | `public/one-time/index.html` | real implementation | must review |
| ` M` | `public/parent.html` | real implementation | must review |
| ` M` | `public/provider.html` | real implementation | must review |
| ` M` | `public/student.html` | real implementation | must review |
| ` M` | `server.js` | real implementation | must review |
| ` M` | `src/platform/instances/one-time-shared-review-data.js` | real implementation | must review |
| ` M` | `tasks-pending/2026-06-22-one-time-assets-funnel-vimeo-email-stripe-view-as-rabbi.md` | evidence | must review |
| ` M` | `tests/one-time-focused-landing.test.js` | test | must review |
| ` M` | `tests/one-time-product-system.test.js` | test | must review |
| ` M` | `tests/one-time-shared-review-branding.test.js` | test | must review |
| `??` | `raw-input/RAW-20260623-002-one-time-rabbi-workspace-student-scope-badges.md` | evidence | must review |

### C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review

| Status | Path | Classification | Preservation posture |
|---|---|---|---|
| ` M` | `content-memory/website-blog-posts.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-database-bootstrap-report.json` | unknown | must review |
| ` M` | `ops/one-time-mishnah/onetime-railway-provisioning-report.json` | unknown | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-23-service-provider-studio-local/desktop-overview.png` | evidence | must review |
| ` M` | `ops/playwright-smokes/2026-06-23-service-provider-studio-local/mobile-handoff.png` | evidence | must review |
| ` M` | `public/data/website-blog-posts.json` | real implementation | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-20-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-21-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-21-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-21-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-22-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-22-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-22-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-22-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-49-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-49-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-49-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-49-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-50-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-50-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-50-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-50-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-51-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-51-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-51-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-51-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-53-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-53-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-53-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-54-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-54-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T03-54-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-09-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-18-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-18-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-18-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-29-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-29-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-29-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-30-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-53-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-54-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-54-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-54-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T04-54-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-00-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-00-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-00-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-46-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-46-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-46-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T05-46-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-01-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-01-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-01-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-12-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-12-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-12-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-20-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-20-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-20-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-24-raw-intake-drift.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-24-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T06-24-watchdog-security-routes.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T11-13-watchdog-action-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T11-13-watchdog-link-audit.md` | evidence | must review |
| `??` | `ops/watchdog-audits/2026-06-24T11-13-watchdog-security-routes.md` | evidence | must review |

## Significant Ignored Generated Files

| Worktree | Path | Classification | Note |
|---|---|---|---|
| `C:/Users/User/BNA v2.0` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA v2.0` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA v2.0` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA v2.0` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA v2.0` | `tmp` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/AppData/Local/Temp/bna-parser-fix-worktree-20260622111219` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/AppData/Local/Temp/bna-parser-fix-worktree-20260622111219` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/AppData/Local/Temp/bna-release-deploy-22fcff0d` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/AppData/Local/Temp/bna-release-deploy-48343f1f` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/AppData/Local/Temp/bna-release-deploy-48343f1f` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-ops-audit-publish` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-ops-audit-publish` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-ops-audit-publish` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-protocol-pr-worktree` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-protocol-pr-worktree` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-recovery-20260618` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-recovery-20260618` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/bna-release-clean` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/bna-release-clean` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/bna-release-clean` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/bna-release-clean` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-stripe-checkpoint` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-worktrees/20260619-core` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-worktrees/20260619-ingestion` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-worktrees/20260619-onetime` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/BNA-worktrees/20260619-ui` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-14-b89c17c0` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-14-b89c17c0` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-39b5db0e` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-39b5db0e` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-68e62775` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-68e62775` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-16-be7e46ae` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-16-be7e46ae` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-17-7efc8ce3` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-17-7efc8ce3` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-19-34c74f22` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-19-34c74f22` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-98b293d` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-98b293d` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-b71b14c5` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-b71b14c5` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9i-f741fa91` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9i-f741fa91` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9j-6c45c4a4` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/deploy-9j-6c45c4a4` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-23e16a12` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-23e16a12` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-32708bfa-9f` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-32708bfa-9f` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-35db6c0e-9e` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-35db6c0e-9e` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-37ef4c3a` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-37ef4c3a` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-4edeef1f-9f` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-4edeef1f-9f` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-53c66d20-9g` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-53c66d20-9g` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-5858f658` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-5858f658` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-62715fd6` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-62715fd6` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-aedb04aa` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-aedb04aa` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-b2371cdc-9e` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-b2371cdc-9e` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-req313-clean-a8190b04` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-req313-clean-a8190b04` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/goal-c-users-user-downloads-codex/work/bna-active` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/goal-c-users-user-downloads-codex/work/bna-active` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-08229f73` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-168bda1f` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-61de54e2` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-68b939a4` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-6cfe7a25` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-8a67ebb9` | `.deploy-railway` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-8a67ebb9` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-95aab80a` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` | `.runtime` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` | `renders` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-24/rabbi-scheller-parity` | `node_modules` | generated output | exists; size omitted to keep census fast |
| `C:/Users/User/Documents/Codex/2026-06-24/rabbi-scheller-parity` | `renders` | generated output | exists; size omitted to keep census fast |

## Stashes

- stash@{0}: On cleanup/rabbi-workspace-task-ui-helper-20260614-155524: safety pre-goalmode dirty state 2026-06-14 onboarding-helper-crm-workspace-rabbi

## Initial Conclusions

- Do not delete or reset the main worktree; it contains many real implementation, test, evidence, and unknown entries from prior runs.
- `service-provider-studio-integration` is the immediate preservation target before integration because it is based on `origin/master` and has dirty Rabbi closeout material.
- PR #14 and PR #15 both base on current `origin/master` and have clean merge states individually, but they must still be merged together on a new branch and tested because they touch overlapping auth/navigation/Operations surfaces.
- Railway active app deployment metadata points to PR #15 first commit `8f8b0b45...`; PR #15 head `1ab57eac...` is not proven deployed by read-only CLI metadata and appears to be a post-deploy evidence commit.
- The one stash is older June 14 safety state; preserve by leaving it untouched and recording it.
