# Ramble Intake - 2026-07-05 - Release Captain And One Time UI Recovery

## Raw intake

Shloimie asked Codex to set up the repo so he can continue giving natural
corrections without needing to inspect code, ship safe fixes in the right order,
and immediately recover the live Rabbi Scheller / One Time Mishnah class UI,
especially the side panel/navigation that is not showing the expected
information.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-008 |
| Source | codex_chat |
| Parse status | registered |
| Raw record | raw-input/RAW-20260705-008-release-captain-onetime-ui-recovery.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Stabilize BNA release execution and recover the One Time/Rabbi UI through clean verified release. |
| Branch | codex/release-captain-onetime-ui-20260705 |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |

## Product Quality Compiler Scope

| Field | Value |
|---|---|
| Workspace | rabbi_sheller_provider |
| Project | one_time_mishnah_class |
| View classes | RABBI_PROVIDER_ADMIN, SHLOIMIE_PLATFORM_SUPPORT, PUBLIC_MARKETING, MEMBER_PARENT_PORTAL, STUDENT_PORTAL |
| Primary live complaint | Rabbi/One Time side panel/navigation is missing expected information and the UI looks visibly broken after refresh. |
| Required first step | Current-state visual audit and surface map before product-code edits. |
| Design reference | Rabbi / One Time black + yellow brand; inspect `ops/design-references/` and current shipped screenshots. |
| Forbidden implementation shortcut | Do not claim "fixed" from local code alone; app-visible work requires deployed commit and live smoke. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-401 | Capture current release truth after dirty-worktree cleanup and prevent work from continuing from detached/stale state. | RAW-20260705-008 | bna_platform / release_closeout | Codex | release_audit | P0 | B0 | Current branch, clean state, latest merged PR/deploy state, active run, and stash preservation are recorded. | Done |
| REQ-20260705-402 | Install a Release Captain workflow using existing repo/dashboard primitives where possible. | RAW-20260705-008 | bna_platform / release_closeout | Codex | release_system | P0 | B1 | A repeatable command/report shows clean branch status, PR/deploy truth, blocked external actions, and "ready to ship" status without requiring Shloimie to read git. | Done |
| REQ-20260705-403 | Produce a Rabbi/One Time surface map and current-state visual audit for the live complaint. | RAW-20260705-008 | rabbi_sheller_provider / one_time_mishnah_class | Codex | ui_audit | P0 | B2 | Screens/routes for side panel/navigation and core One Time views are inspected at desktop/tablet/mobile; findings use concrete visual/product defects. | Done |
| REQ-20260705-404 | Fix the highest-impact Rabbi/One Time side panel/navigation/UI regressions found by the audit. | RAW-20260705-008 | rabbi_sheller_provider / one_time_mishnah_class | Codex | ui_implementation | P0 | B3 | Side panel exposes the expected One Time modules, labels are role/workspace appropriate, black/yellow brand is applied consistently, and mobile/desktop screenshots show no broken/missing nav. | Done |
| REQ-20260705-405 | Verify, commit, push, merge, deploy, and live-smoke safe app-visible changes. | RAW-20260705-008 | bna_platform / release_closeout | Codex | publish_deploy | P0 | B4 | Tests/watchdogs/smokes pass; GitHub PR is merged; Railway deployment succeeds; live UI smoke proves the fixed screens are visible. | Done; Railway deployment-ID readback blocked |
| REQ-20260705-406 | Record remaining external/provider/account blockers separately from ship-safe UI/release work. | RAW-20260705-008 | bna_platform / release_closeout | Codex | blockers | P0 | B5 | Any missing Stripe/Vimeo/Zoom/WAPI/DNS/send/credential action has owner, next action, and dependent requirement only. | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|
| DEC-20260705-401 | External/provider actions remain gated. | Exact approval/aliases for payments, sends, DNS, Drive writes, credentials, access grants, or provider account changes. | Shloimie / account owners | Ship repo/UI/release-system fixes now; keep external actions blocked. | Provide exact approval phrase and keyholder/provider aliases for each external action later. | Only external/provider action requirements | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Deployment/live-smoke |
|---|---|---|---|---|---|
| REQ-20260705-401 | git/GitHub/Railway/run state | Inspect current state and record truth. | `npm run release:captain`; `npm run bna:run:status`; `npm run bna:run:validate` | Pending | Not required |
| REQ-20260705-402 | `scripts/release-captain.mjs`, `package.json`, `ops/release-captain/` | Add Release Captain report/check as a read-only release-state command. | `node --test tests/release-captain.test.js`; `npm run release:captain` | Pending | Not required |
| REQ-20260705-403 | `ops/ui-audits/2026-07-05-release-captain-onetime-ui/report.md`, One Time local smoke reports | Build/read surface map and capture current-state screenshots. | `node --test tests/one-time-operations-ui-smoke.test.js`; `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js` | Pending | Not required |
| REQ-20260705-404 | `public/operations.html`, `public/css/one-time-operations.css`, `src/platform/instances/one-time-rabbi-dashboard-ia.js`, focused tests | Expand One Time side panel modules/sections, remove stale Platform Support labeling, and restore black/yellow One Time brand tokens. | Focused UI/brand/IA tests; local screenshots in `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/` and `ops/one-time-mishnah/operator-ui-review/` | Pending | yes |
| REQ-20260705-405 | GitHub/Railway/live routes | Clean commit/push/PR/merge/deploy/live-smoke. | PR #97 merged; live production source readback passed; live One Time and broad app smokes passed; Railway deployment-ID readback blocked by token/target mismatch | `8ce40037`; PR #97 merge `e405bfe484db6515ccc52d4d9913938ee9e0d633` | yes |
| REQ-20260705-406 | register/ledger/changelog | Record exact blockers and no-write guardrails. | `npm run watchdog:actions`; `npm run secrets:audit`; `npm run watchdog:protocol-drift` | Pending | no |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-401 | Done | `ops/release-captain/latest-release-captain.md`; `TASKS.md`; this register | raw/register/release report | `npm run release:captain`; `npm run bna:run:status`; `npm run bna:run:validate` | None |
| REQ-20260705-402 | Done | `scripts/release-captain.mjs`; `tests/release-captain.test.js`; `ops/release-captain/latest-release-captain.md` | `package.json`; release-captain script/test/report | `node --test tests/release-captain.test.js`; `npm run release:captain` | Future improvement: expose this in Operations dashboard if desired |
| REQ-20260705-403 | Done | `ops/ui-audits/2026-07-05-release-captain-onetime-ui/report.md`; local smoke screenshots/reports | audit report; Playwright evidence | One Time Operations and Rabbi UI local smokes passed | None |
| REQ-20260705-404 | Done | `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`; `ops/one-time-mishnah/operator-ui-review/qa-harness-local-report.md`; `ops/ui-audits/2026-07-05-release-captain-onetime-ui/live-closeout.md` | Operations UI, One Time CSS, One Time IA, tests | Focused UI/brand/IA tests passed; `npm test` passed 1515/1515; production source readback found required sidebar keys and CSS tokens | None for the scoped side-panel/brand repair |
| REQ-20260705-405 | Done; deployment-ID readback blocked | PR #97; merge `e405bfe484db6515ccc52d4d9913938ee9e0d633`; `ops/ui-audits/2026-07-05-release-captain-onetime-ui/live-closeout.md` | release branch; master merge | PR merged; production source readback passed; `npm run app:smoke:one-time-shared-review` passed; `npm run app:smoke` passed | Railway CLI deployment-ID readback blocked because current token/status resolves One Time project and BNA service link is unauthorized |
| REQ-20260705-406 | Done | `DEC-20260705-401`; this register; ledger/changelog records | register/ledger/changelog | secrets audit passed; no external write performed | External/provider/account actions remain blocked until exact approval/credentials |
