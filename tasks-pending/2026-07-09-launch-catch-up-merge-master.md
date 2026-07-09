# Launch Catch-Up, Merge Master, Deploy Everything

## Raw intake

Source: `RAW-20260709-009`

Shloimie asked to catch the whole launch state up, merge to `master`, deploy,
and explain the remaining errors/blockers instead of leaving work scattered.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-009 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-09-launch-catch-up-merge-master.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Catch the launch state up: register the deployment/merge request, audit what is ahead of master and what is live, merge/push/deploy the safe scoped work to master where release gates allow, and leave exact blockers for any remaining errors. |
| Goal tool used | yes |
| Execution directive | Register first, then verify, fast-forward master if safe, deploy/live-smoke, and record exact remaining blockers. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-041 | Preserve the merge/deploy catch-up request and create a launch catch-up register. | RAW-20260709-009 | agent_ops | Codex | intake | P0 | 0 | none | Raw file, memory note, register, ledger/changelog closeout exist. | raw-input, memory, tasks-pending, ops ledgers | no | Done |
| REQ-20260709-042 | Audit branch/master delta before merge. | RAW-20260709-009 | repo | Codex | release-audit | P0 | 1 | REQ-20260709-041 | Current branch, ahead/behind count, open PR state, and representative commit scope are recorded. | git/GitHub readbacks | no | Done |
| REQ-20260709-043 | Run release gates/tests before master catch-up. | RAW-20260709-009 | repo | Codex | verification | P0 | 1 | REQ-20260709-042 | Relevant tests, release gate, action/protocol/secrets checks pass or exact blocker is recorded. | test/watchdog outputs | no | Done |
| REQ-20260709-044 | Fast-forward or otherwise safely merge launch branch to `master`. | RAW-20260709-009 | repo | Codex | git-release | P0 | 2 | REQ-20260709-043 | `master` contains the launch branch commits and is pushed, without force-merging unrelated dirty work. | git | yes if deploy follows | Done |
| REQ-20260709-045 | Deploy caught-up `master` through the correct guarded release path. | RAW-20260709-009 | BNA + OneTime | Codex | deployment | P0 | 3 | REQ-20260709-044 | Deploy target guard identifies the intended app/service before mutation; deployment reaches SUCCESS; live smokes pass. | Railway/release scripts | yes | Done |
| REQ-20260709-046 | Summarize remaining errors/blockers precisely. | RAW-20260709-009 | BNA + OneTime + agent_ops | Codex | closeout | P0 | 4 | REQ-20260709-045 | Final status names what is live, what is not, which errors remain, owner, and next action. | register, ledger, changelog | no | Done |

## Current readback

- Start branch: `codex/rabbi-helper-tool-scope-20260708`.
- Initial status: clean and pushed.
- Initial delta before the intake commit: `origin/master...HEAD` reported `0 behind / 69 ahead`; after the launch catch-up register commit, the release branch was `0 behind / 70 ahead`.
- Open PRs: none from `gh pr list`.
- Active execution run still has 8 done and 2 blocked, both full-launch setup blockers, not immediate OneTime lead capture blockers.
- Pre-merge verification found stale action report hashes after the OneTime lead-capture/action-registry change. Regenerated `ops/action-registry/one-time-action-coverage.*` and `ops/action-registry/universal-action-parity.*`.
- Pre-merge release gates passed:
  - `node --test tests/watchdog-action-registry.test.js`: 5/5 pass.
  - `npm test`: 1691/1691 pass.
  - `npm run secrets:audit`: 7390 tracked paths, 0 tracked secret-risk files.
  - `npm run watchdog:actions`: ok, 0 findings.
  - `npm run watchdog:protocol-drift`: 0 findings.
  - `npm run bna:run:validate`: validation passed; active run remains 8 done / 2 blocked.
  - `git diff --check`: no whitespace errors, line-ending warnings only.

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-041 | Done | Raw/register created and ledger/changelog closeout recorded. | raw-input/RAW-20260709-009-launch-catch-up-merge-master.md; memory/2026-07-09.md; this file; ops/agent-task-ledger.jsonl; ops/agent-changelog.md | Register, ledger, and changelog updated with deploy proof and blockers. | None |
| REQ-20260709-042 | Done | Branch was `codex/rabbi-helper-tool-scope-20260708`, clean/pushed before intake, no open PRs, `origin/master...HEAD` reported `0 behind / 69 ahead`. | git readbacks | `git branch --show-current`; `git rev-list --left-right --count origin/master...HEAD`; `gh pr list --state open`. | None |
| REQ-20260709-043 | Done | Stale action report hashes were corrected and all release gates passed. | ops/action-registry/one-time-action-coverage.json; ops/action-registry/one-time-action-coverage.md; ops/action-registry/universal-action-parity.json; ops/action-registry/universal-action-parity.md; ops/watchdog-audits/2026-07-09-product-quality-drift.md; ops/watchdog-audits/2026-07-09-product-quality-drift.json | `node --test tests/watchdog-action-registry.test.js`; `npm test`; `npm run secrets:audit`; `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `npm run bna:run:validate`; `git diff --check`. | None |
| REQ-20260709-044 | Done | `master` fast-forwarded from `6fc28646` through the launch branch and was pushed through `504f6a44`; follow-up hotfix commits `2db33d74`, `0418cfd8`, and `19290f2f` are pushed to `origin/master`. | git | `git merge --ff-only codex/rabbi-helper-tool-scope-20260708`; `git push origin master`; `git log --oneline -5`. | None |
| REQ-20260709-045 | Done | BNA Railway final deployment `e468f43f-810e-49cf-b2a2-03e76281e8f9` reached `SUCCESS`; OneTime Railway final deployment `5c47678a-3a05-4d52-8e03-db86fa1959ab` reached `SUCCESS`. Earlier corrective deploys: BNA `6dfaf5f4-...`, `e01040c4-...`, `b1ad257c-...`; OneTime `edcf73fd-...`. | server.js; public/js/operations-shell.js; scripts/smoke-operations-workspace-taxonomy-live.mjs; tests/communications-integrations-contract.test.js; tests/operations-shell-navigation-contract.test.js; ops/performance-audits/2026-07-08-app-backend-helper-performance/*.md | `npm test` 1693/1693 pass; `npm run secrets:audit`; `npm run watchdog:actions`; `npm run watchdog:protocol-drift`; `npm run bna:run:validate`; BNA live app/helper/taxonomy smokes passed; OneTime separate-instance and Rabbi landing smokes passed; direct live DNS endpoint returned HTTP 200; `npm run one-time:target:guard -- --json` passed after proof push. | None |
| REQ-20260709-046 | Done | Remaining blocker summary recorded here, in `ops/agent-changelog.md`, and in `ops/agent-task-ledger.jsonl`. | this file; ops/agent-changelog.md; ops/agent-task-ledger.jsonl | Final BNA profile `residual-slowness-profile-live-bna-platform-after-route-order-fix.md`: Operations shell visible 3137ms, console errors 0, failed requests 0, dashboard error banners 0. | Full launch setup remains blocked on missing Zoom/Stripe/WAPI/campaign approvals. Operations still has 118 startup fetches, median 1064ms, P95 2855ms, max 3622ms, so performance optimization remains open but is no longer a broken-deploy blocker. |

## Launch closeout summary

- Live BNA: `https://bneineviimacademy.org`, Railway project
  `skillful-motivation`, service `skillful-motivation`, production deployment
  `e468f43f-810e-49cf-b2a2-03e76281e8f9`, `SUCCESS`.
- Live OneTime: `https://join.onetimeonetime.com`, Railway project
  `one-time-production`, service `one-time-web`, production deployment
  `5c47678a-3a05-4d52-8e03-db86fa1959ab`, `SUCCESS`.
- Final OneTime target guard after proof push: passed with clean tree, head
  pushed to `origin/master`, correct `one-time-production` Railway target,
  canonical pages 200, and `/api/one-time/instance-config` scoped to
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Fixed during catch-up:
  - Stale action registry report hashes after the lead-capture work.
  - BNA Operations blank dashboard after the split shell, caused by missing
    dashboard fallback functions.
  - Operations taxonomy smoke support for the split shell asset.
  - DNS task readback 500 caused first by hard failure behavior, then by
    `/api/bna/communications/:id` intercepting `/api/bna/communications/dns-tasks`.
- Remaining launch blockers:
  - `REQ-20260702-108`: full provider/campaign setup still needs the exact One
    Time Zoom session/join alias, Rabbi Stripe sandbox/test key status, $67/mo
    product/price aliases, Whapi/WAPI instance ID and phone number, final
    campaign copy, exact recipient segment/list, suppression/unsubscribe proof,
    and explicit seed approval packet.
  - `REQ-20260702-110`: full setup bootstrap remains blocked until those
    external values exist. Immediate public lead capture/free-class follow-up is
    deployed; portal/payment/campaign automation is intentionally not live.
  - `DEC-20260709-008`: exact approved free Zoom URL/alias is still needed
    before automated invite sends.
  - Performance: BNA Operations now renders without console errors, but startup
    still pulls 118 API requests. Next technical lane should reduce initial
    fetch fanout, lazy-load non-current sections, cache repeated support/student
    reads, and profile backend indexes before spending more on the database.
