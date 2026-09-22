# Test Results

Final deployment/live-smoke closeout:

```bash
node --check server.js
node --test tests\one-time-route-role-mapping.test.js tests\service-provider-scope-routes.test.js
node --test tests\one-time-intake-api-readback.test.js tests\operations-shell-navigation-contract.test.js tests\one-time-brand-helper-isolation.test.js tests\one-time-direct-signup-page.test.js
npm run test:onetime:focused
npm run secrets:audit
npm run watchdog:actions
npm run watchdog:protocol-drift
npm run bna:release-gate -- --expected-branch master
npm run one-time:target:guard
npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 22cc6b88b0045f9052a403582ec8249e369196a0
npm run app:smoke:one-time-interest-dry-run -- https://join.onetimeonetime.com
npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com
ONE_TIME_PUBLIC_BASE_URL=https://join.onetimeonetime.com BNA_DEPLOYED_COMMIT=22cc6b88b0045f9052a403582ec8249e369196a0 BNA_DEPLOYMENT_ID=89c697ad-3f72-4d4f-96a2-46f0b2c2d740 npm run app:smoke:onetime-operations-crm-workbench
```

Result:

- PASS syntax, targeted contracts, focused One Time suite `76/76`, secrets audit, action watchdog, protocol drift watchdog, release gate, and One Time target guard.
- PASS One Time Railway deployment `89c697ad-3f72-4d4f-96a2-46f0b2c2d740` reached `SUCCESS`.
- PASS exact-SHA live readbacks on One Time and BNA for `22cc6b88b0045f9052a403582ec8249e369196a0`.
- PASS live One Time smokes: separate instance exact-SHA, direct signup dry-run, Rabbi landing/WhatsApp readiness, and Operations CRM workbench with 12 cards.
- PASS production-JS browser intercept for `/one-time/signup`: Family and School submit normalized root `audience_type` / `family_school_classification` and preserve display `metadata.signup_as`, with the API route intercepted before any live lead write.
- PASS live BNA route no-write smoke, One Time portal route smoke, signed view-as Rabbi negative scope/write smoke, and compression header readback on One Time and BNA.

Initial validation:

```bash
npm run pqc:validate ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/00-control-tower.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/01-current-state-visual-audit.product-quality.json
npm run bna:run:validate
```

Result:

- PASS `npm run pqc:validate ...` - 2 files scanned, 2 passed, 0 failed.
- PASS `npm run bna:run:validate` - run validation passed with 10 not_started, 1 done, 1 blocked.

Focused implementation tests will be recorded per requirement batch.

REQ-20260712-103 local implementation:

```bash
node --check server.js
node --test tests\one-time-view-as-scope-contract.test.js tests\one-time-shared-review-branding.test.js tests\one-time-safe-view-as-navigation.test.js tests\one-time-provider-review-navigation.test.js tests\one-time-route-role-mapping.test.js
```

Result:

- PASS `node --check server.js`.
- PASS targeted One Time view-as/provider suite - 27 tests passed, 0 failed.

REQ-20260712-104 local implementation:

```bash
node --check server.js
node --check src\lib\bna\crm-contact-model.js
node --test tests\crm-contact-model.test.js tests\rabbi-scheller-tenant-isolation-contract.test.js tests\one-time-view-as-scope-contract.test.js
```

Result:

- PASS `node --check server.js`.
- PASS `node --check src\lib\bna\crm-contact-model.js`.
- PASS CRM/contact tenant isolation suite - 12 tests passed, 0 failed.

REQ-20260712-105 local implementation:

```bash
node --check server.js
node --check src\lib\bna\crm-contact-model.js
node --test tests\crm-contact-model.test.js tests\rabbi-scheller-tenant-isolation-contract.test.js tests\one-time-view-as-scope-contract.test.js
```

Result:

- PASS `node --check server.js`.
- PASS `node --check src\lib\bna\crm-contact-model.js`.
- PASS CRM pagination/isolation suite - 15 tests passed, 0 failed.
- PASS 10,000-contact fixture returned a 50-card page with `has_more` and `next_cursor`.

REQ-20260712-106 local implementation:

```bash
npm run pqc:validate -- ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/02-crm-frontend-performance.product-quality.json
node --check public\js\operations-shell.js
node --check scripts\smoke-onetime-operations-crm-workbench-local.mjs
node scripts\smoke-onetime-operations-crm-workbench-local.mjs
node --test tests\service-provider-scope-routes.test.js tests\one-time-communications-workspace.test.js tests\operations-contacts-intake-cleanup.test.js
node --test tests\operations-shell-navigation-contract.test.js tests\service-provider-scope-routes.test.js tests\one-time-communications-workspace.test.js tests\operations-contacts-intake-cleanup.test.js
```

Result:

- PASS focused Product Quality Compiler validation for `PKT-20260712-106`.
- PASS `node --check public\js\operations-shell.js`.
- PASS `node --check scripts\smoke-onetime-operations-crm-workbench-local.mjs`.
- PASS local Operations CRM workbench smoke across split shell and monolith at 1440, 1024, 768, 430, and 390 px. Recorded metrics: initial CRM API calls after auth = 1; initial rendered cards = 50; contact-selection app-root mutations = 0; debounced search list requests = 1; legacy table closed/open = 0/1; no external writes.
- PASS service-provider/communications/contact static subset - 13 tests passed, 0 failed.
- CAVEAT combined shell/static suite - 16 tests passed, 1 failed on the pre-existing `operations-shell.js` byte-budget assertion. Clean `HEAD` is about 1.211 MB against the 1.2 MB test ceiling; this local batch is about 1.227 MB. Track under `REQ-20260712-111`.
- PASS `npm run bna:run:validate` after closeout updates - 5 not_started, 7 done, validation passed.
- PASS `npm run watchdog:protocol-drift` after closeout updates - 0 findings.
- PASS `npm run bna:run:next` - next unblocked executable batch is `BATCH-06-CRM-INBOX` / `REQ-20260712-107`.

REQ-20260712-107 local implementation:

```bash
npm run pqc:validate -- ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/03-crm-inbox-ui.product-quality.json
node --check public\js\operations-shell.js
node --check public\js\operations-deferred-renderers.js
node --check scripts\smoke-onetime-operations-crm-workbench-local.mjs
node scripts\smoke-onetime-operations-crm-workbench-local.mjs
node --test tests\service-provider-scope-routes.test.js tests\one-time-communications-workspace.test.js tests\operations-contacts-intake-cleanup.test.js
npm run bna:run:validate
npm run watchdog:protocol-drift
```

Result:

- PASS focused Product Quality Compiler validation for `PKT-20260712-107`.
- PASS JS syntax checks for split shell, deferred renderer, and CRM smoke.
- PASS local Operations CRM workbench smoke across split shell and monolith at 1440, 1024, 768, 430, and 390 px. Recorded metrics: three CRM panes visible; mobile selected-contact Back flow passes; disabled CRM reply/note/task controls present; scoped One Time Inbox context screenshot passes; initial CRM API calls after auth = 1; initial rendered cards = 50; contact-selection app-root mutations = 0; debounced search list requests = 1; legacy table closed/open = 0/1; no external writes.
- PASS service-provider/communications/contact static subset - 13 tests passed, 0 failed.
- PASS `npm run bna:run:validate`.
- PASS `npm run watchdog:protocol-drift` - 0 findings.

REQ-20260712-108 local implementation:

```bash
npm run pqc:validate -- ops\prompt-packets\2026-07-12-onetime-crm-portal-production-correction\04-portal-shell-preview.product-quality.json
node --check public\js\one-time-portal-shell.js
node --check public\js\rabbi-member.js
node --check scripts\smoke-onetime-portal-shell-local.mjs
node -e "JSON.parse(require('fs').readFileSync('ops/action-registry/actions.json','utf8'))"
node scripts\smoke-onetime-portal-shell-local.mjs
node --test tests\one-time-shared-review-branding.test.js tests\one-time-safe-view-as-navigation.test.js tests\one-time-provider-review-navigation.test.js tests\workspace-scope-guardrails.test.js
```

Result:

- PASS focused Product Quality Compiler validation for `PKT-20260712-108`.
- PASS JS syntax checks for the shared One Time portal shell, Rabbi member script, and portal shell smoke.
- PASS action registry JSON parse after adding the portal menu and Exit Preview actions.
- PASS local portal shell smoke across Family Portal 1440, Library 1024, Classroom 768, parent setup/reset 430, Student 390, and Family mobile menu 390. The smoke asserted TEST preview/no-write banner, preserved review links, accessible real menu button with `aria-expanded`, Escape focus return, `@example.test` fixture emails, no local HTTP errors, no console errors, and no POST/write requests.
- PASS One Time review/navigation/scope guardrail subset - 23 tests passed, 0 failed.
- PASS `npm run bna:run:validate` after closeout updates - 3 not_started, 9 done, validation passed.
- PASS `npm run watchdog:protocol-drift` after closeout updates.
- PASS `npm run bna:run:next` - next unblocked executable batch is `BATCH-08-LANDING-WHATSAPP` / `REQ-20260712-109`.

REQ-20260712-109 local implementation:

```bash
npm run pqc:validate -- ops\prompt-packets\2026-07-12-onetime-crm-portal-production-correction\05-landing-whatsapp-launcher.product-quality.json
node --check scripts\smoke-onetime-landing-whatsapp-local.mjs
node -e "JSON.parse(require('fs').readFileSync('ops/action-registry.json','utf8'))"
node --test tests\one-time-brand-helper-isolation.test.js tests\one-time-focused-landing.test.js tests\one-time-shared-review-branding.test.js
node scripts\smoke-onetime-landing-whatsapp-local.mjs
```

Result:

- PASS focused Product Quality Compiler validation for `PKT-20260712-109`.
- PASS landing WhatsApp smoke syntax check.
- PASS root action registry JSON parse.
- PASS One Time landing/helper/static subset - 19 tests passed, 0 failed.
- PASS local public landing smoke across 1440, 1024, 768, 430, and 390 px. The smoke asserted exactly one launcher, same-origin runtime redirect, accessible label, 44px+ target, no public helper scripts/assets, no `Robot Scheller`, no hard-coded `wa.me`, redacted readiness/no-send metadata, and no POST/write requests.

REQ-20260712-110 local implementation:

```bash
node --check src\lib\bna\provider-lead-bot.js
node --test tests\service-provider-lead-bot.test.js tests\one-time-wapi-scope-contract.test.js
```

Result:

- PASS `node --check src\lib\bna\provider-lead-bot.js`.
- PASS provider lead bot/WAPI suite - 12 tests passed, 0 failed.
- No live WhatsApp/WAPI send was performed.

REQ-20260712-111 local implementation:

```bash
npm run pqc:validate -- ops\prompt-packets\2026-07-12-onetime-crm-portal-production-correction\06-performance-budgets.product-quality.json
node --check scripts\split-operations-shell.mjs
node scripts\split-operations-shell.mjs
node --check public\js\operations-shell.js
node --check public\js\operations-deferred-renderers.js
node --input-type=module -e "import { readFileSync } from 'node:fs'; const html=readFileSync('public/member-library.html','utf8'); const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n'); new Function(scripts); console.log('member-library inline scripts OK');"
node --check scripts\smoke-onetime-portal-shell-local.mjs
node --test tests\operations-shell-navigation-contract.test.js tests\one-time-intake-api-readback.test.js
node scripts\smoke-onetime-operations-crm-workbench-local.mjs
node scripts\smoke-onetime-portal-shell-local.mjs
```

Result:

- PASS focused Product Quality Compiler validation for `PKT-20260712-111`.
- PASS split generator syntax and generated split output. Latest bytes: `operations-shell.js` 1,059,582, bootstrap 1,688, deferred renderer 820,475, CSS 221,457.
- PASS generated shell/deferred JS syntax checks.
- PASS member-library inline script syntax check.
- PASS Operations shell/cache contract suite - 8 tests passed, 0 failed.
- PASS local Operations CRM workbench smoke. Latest metrics: initial CRM request count 1, initial rendered cards 50, app-root mutations after selection 0, debounced search list request delta 1, scoped inbox context passed.
- PASS local portal shell smoke. Vimeo evidence: zero Vimeo iframes/requests before Play Video; playable fixture loads `player.vimeo.com` only after Play Video; no POST/write requests.
- CAVEAT `node --test tests\one-time-classroom-calendar-community-bot.test.js tests\one-time-canonical-journey.test.js` fails on existing unrelated static expectations for `rabbi-member` navigation text and classroom "Forgot parent password?" copy. This is outside the REQ-20260712-111 performance split/lazy-load scope.

REQ-20260712-112 release gate:

```bash
npm run bna:release-gate -- --json
node scripts\bna-production-closeout-gate.mjs --json
git status -sb
git log --oneline --left-right HEAD...origin/master
```

Result:

- BLOCKED release gate dry-run. No deploy, production mutation, or live verification was performed.
- Blocker: current HEAD `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a` is not confirmed pushed to `origin/master`.
- Blocker refinement: `master` is 0 commits ahead and 54 commits behind `origin/master`; the One Time correction work is uncommitted on a stale local base.
- Blocker: working tree has 100 dirty/untracked paths, so deploy from a mixed dirty worktree is forbidden.
- Blocker: Railway and Drive external readback gates are not ready.
- Evidence saved to `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-gate-dry-run/report.json` and `.md`.
- Release-lane scope evidence saved to `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-lane-scope-audit/report.json` and `.md`.

REQ-20260712-112 clean release lane:

```bash
npm ci
npm run pqc:validate -- ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/00-control-tower.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/01-current-state-visual-audit.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/02-crm-frontend-performance.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/03-crm-inbox-ui.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/04-portal-shell-preview.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/05-landing-whatsapp-launcher.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/06-performance-budgets.product-quality.json
npm run bna:run:validate
npm run operations:check-generated
node --test tests\crm-contact-model.test.js tests\rabbi-scheller-tenant-isolation-contract.test.js tests\one-time-view-as-scope-contract.test.js tests\service-provider-lead-bot.test.js tests\one-time-brand-helper-isolation.test.js
node scripts\smoke-onetime-operations-crm-workbench-local.mjs
node scripts\smoke-onetime-portal-shell-local.mjs
node scripts\smoke-onetime-landing-whatsapp-local.mjs
npm run watchdog:protocol-drift
npm run audit:governance
git commit -m "Prepare One Time CRM portal correction release"
git push -u origin codex/onetime-crm-portal-release-20260712
npm run bna:release-gate -- --expected-branch codex/onetime-crm-portal-release-20260712
```

Result:

- PASS dependencies installed in clean release worktree with `npm ci`; npm audit reported existing vulnerabilities and no fix was applied.
- PASS all 7 Product Quality Compiler packets.
- PASS `npm run bna:run:validate`.
- PASS `npm run operations:check-generated`.
- PASS focused One Time scope/CRM/assistant/helper regression subset - 36 tests passed, 0 failed.
- PASS local Operations CRM workbench smoke across split shell and monolith.
- PASS local portal shell smoke across Family Portal, Library, Classroom, parent setup/reset, Student, and mobile menu states.
- PASS local public landing WhatsApp launcher smoke across 1440, 1024, 768, 430, and 390 px.
- PASS `npm run watchdog:protocol-drift`.
- PASS `npm run audit:governance` with exit code 0. It still reports historical repo-wide audit mapping debt, but current One Time audit packages are linked as implemented/proven or to `REQ-20260712-112`.
- PASS commit and push to `origin/codex/onetime-crm-portal-release-20260712`; implementation commit `833cac222`.
- PASS release-gate dry-run on the clean pushed release branch: ready, dry-run mode, branch `codex/onetime-crm-portal-release-20260712`, HEAD pushed yes, dirty files 0, production mutation performed no.
- PASS draft PR opened against `master`: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/131`.
- PASS PR readiness readback: PR `#131` is open, draft, mergeable, merge state `CLEAN`, and GitHub currently reports no status checks on the branch.
- BLOCKED / NEEDS OPERATOR RELEASE DECISION: no deploy or live verification was run. PR review/release approval is required; the deploy command requires `DEPLOY_BNA_PRODUCTION_CLOSEOUT`; live verification requires `VERIFY_BNA_LIVE_CLOSEOUT`; Railway/Drive external readbacks must be completed or explicitly deferred through approved release-gate flags.

Closeout checks:

```bash
npm run bna:run:validate
npm run bna:run:next
npm run watchdog:protocol-drift
npm run audit:governance
```

Result:

- PASS `npm run bna:run:validate` after `REQ-20260712-109` closeout updates - 2 not_started, 10 done, validation passed.
- PASS `npm run watchdog:protocol-drift` after `REQ-20260712-109` closeout updates.
- PASS `npm run bna:run:next` - latest next unblocked executable batch is `BATCH-10-PERFORMANCE` / `REQ-20260712-111`.
- PASS scoped `git diff --check -- ...` for the `REQ-20260712-109` implementation/evidence files; only LF-to-CRLF warnings were reported.
- CAVEAT `npm run audit:governance` exited 0 but reports repo-wide `NEEDS TASK MAPPING` historical audit debt and unrelated untracked audit packages. The new `ops/ui-audits/2026-07-12-onetime-landing-whatsapp-local` package is mapped as implemented/proven for `REQ-20260712-109`; commit/push/deploy remains under `REQ-20260712-112`.

REQ-20260712-102 regenerated current-state visual audit:

```bash
node scripts\audit-onetime-role-ui-current-state.mjs --out-dir ops\ui-audits\2026-07-12-onetime-crm-portal-production-correction\authenticated-current-state-attempt
node scripts\audit-rabbi-onetime-current-state.mjs --out ops\ui-audits\2026-07-12-onetime-crm-portal-production-correction\rabbi-current-state
node scripts\audit-onetime-parallel-frontend.mjs --out-dir ops\ui-audits\2026-07-12-onetime-crm-portal-production-correction\parallel-frontend-current-state
node scripts\smoke-onetime-operations-crm-workbench-local.mjs
node scripts\smoke-onetime-provider-crm-layout-local.mjs
$env:BNA_ONE_TIME_OPERATIONS_UI_SMOKE_DIR='ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/operations-ui-local'; node --test tests\one-time-operations-ui-smoke.test.js
$env:BNA_ONE_TIME_UI_REVIEW_REPORT_DIR='ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/final-ui-local'; node --test tests\one-time-rabbi-ui-final-local-smoke.test.js
node scripts\audit-onetime-live-performance.mjs --out-dir ops\execution-runs\2026-07-12-onetime-crm-portal-production-correction\live-performance-baseline --screenshots
```

Result:

- PASS authenticated current-state attempt - 35 screenshots; Operations auth and admin-provider session available; redacted evidence only.
- PASS Rabbi current-state audit - 80 screenshots across 16 routes and 5 viewports; 5 VQ findings.
- PASS parallel frontend audit - 45 checks, 140 screenshots/crops, 28 VQ findings.
- PASS local Operations CRM workbench smoke - desktop/tablet/mobile synthetic CRM screenshots.
- PASS provider CRM layout smoke - desktop/tablet/mobile screenshots.
- PASS One Time Operations UI local smoke.
- PASS final local One Time/Rabbi UI QA harness.
- PASS live public/review performance baseline - 0 samples needing attention.
- Manual spot-check found landing blank-space/old launcher, CRM low-contrast cards/clipped mobile tabs, live CRM loading-state evidence, and a student-review unlabeled action finding.
