# Test Results

## Batch 0 Preflight

- PASS `npm run bna:run:status` against the previous latest run.
- PASS `npm run bna:run:validate` against the previous latest run.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`; report:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`.
- PASS `npm run bna:run:status` against the successor run.
- PASS `npm run bna:run:validate` against the successor run.

## Batch 1 Protocol Repair

- PASS `node --check scripts/bna-execution-run.mjs`.
- PASS `node --check src/lib/bna/intake-schema.js`.
- PASS `node --test tests/bna-execution-run.test.js` (23/23).
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:next`.
- PASS `npm run bna:run:blockers`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `node scripts/audit-secrets.mjs` with 0 tracked secret-risk files.

<!-- batch-2:start -->
## Batch 2 Test Results

Recorded after focused verification:

- PASS `node --check scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node --test tests/one-time-master-backlog-reconciliation.test.js tests/rabbi-scheller-meeting-reconciliation.test.js`
- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:source-coverage`
- PASS `git diff --check` with line-ending warnings only where reported by Git
- PASS `node scripts/audit-secrets.mjs`
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Test Results

Recorded after Task/Decision census, cleanup tooling, server filters, and
Operations view changes:

- PASS `node --check scripts/task-decision-census.mjs`
- PASS `node --check scripts/task-decision-production-cleanup.mjs`
- PASS `node --check server.js`
- PASS `node --test tests/task-decision-census.test.js tests/task-decision-production-cleanup.test.js`
- PASS `node --test tests/task-decision-census.test.js tests/operations-task-queue-visibility.test.js tests/operations-task-comments-and-dictation.test.js tests/workspace-task-no-stale-agent.test.js tests/telegram-ramble-routing-regression.test.js`
- PASS `node scripts/task-decision-census.mjs --limit=1000`
- PASS `node scripts/task-decision-production-cleanup.mjs --limit=1000 --apply`
- PASS `npm run railway:doctor` after deployment `89967278-38dc-49f3-a70d-4536c59f82f6`
- PASS `npm run app:smoke`; report `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- PASS focused Batch 3 Task/Decision live smoke; report `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`

Post-cleanup live census passed workspace isolation checks:

- BNA records in One Time: 0
- One Time records in BNA: 0

Intermediate deployment failures were fixed before final verification:

- `task_view=one_time_tasks` SQL ambiguity fixed by `a28a9332`.
- Text-matched BNA records in One Time task view fixed by strict scoping in `f8a2fd62`.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 Test Results

Recorded after workspace role model, scoped workspace user APIs, Operations
Users UI actions, and negative authorization coverage:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/one-time-role-model.js`
- PASS `node --check src/platform/rbac/index.js`
- PASS `node --test tests/one-time-role-auth-model.test.js tests/platform-core/platform-core-rbac.test.js tests/operations-module-scoping.test.js tests/external-access-persistence-workflow.test.js tests/workspace-user-role-management.test.js tests/operations-pwa-login.test.js tests/workspace-person-household-provider-contract.test.js tests/live-class-infrastructure.test.js tests/agent-control-api-readback.test.js tests/one-time-operations-ui-smoke.test.js`

Focused combined test result:

- Tests: 58 passed, 0 failed.
- Suites covered: canonical One Time roles, platform RBAC aliases, scoped
  Operations module access, external-access persistence, workspace user role
  management, PWA login/admin users UI, workspace person/provider contracts,
  live-class isolation foundations, agent-control readback, and Operations UI
  smoke.

Dependency note:

- `npm ci` was run in the clean PR worktree because `node_modules` was absent.
  It installed declared lockfile dependencies only and did not modify package
  manifests.

Deployment/live verification:

- PASS `npm run railway:doctor` after deployment
  `04fde749-fca1-4e54-a7c4-f2ece847847b`.
- PASS `npm run app:smoke`; report
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`.
- PASS focused workspace-user role live smoke; report
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`.

Intermediate failure recorded:

- The first focused workspace-user smoke attempt queried `/health`; the live app
  exposes `/api/health`. The smoke was corrected and rerun successfully. This
  was a smoke-script endpoint mistake, not an app regression.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Test Results

Recorded after action coverage artifacts, visible Operations action labels, and
setup-path changes:

- PASS `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js`
- PASS `node --test tests/one-time-action-coverage.test.js tests/watchdog-action-registry.test.js tests/workspace-user-role-management.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/action-registry-telegram-ui-bot.test.js`
- PASS `node --check server.js`
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after Railway deployment
  `9c31c21f-143e-46f3-b95d-2b458a848d9f`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`.
- PASS focused One Time visible-action live smoke,
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`.

Focused combined test result:

- Tests: 52 passed, 0 failed.
- Covered: One Time action coverage metadata, required visible labels, handler
  and endpoint mapping, placeholder removal, external-write gates, existing
  watchdog action registry, Operations UI smoke, module scoping, workspace user
  actions, and Telegram/UI action registry behavior.
- Live covered: production health, Operations task/decision action markers,
  One Time class/session/appointment/video setup controls, integration setup
  controls, and absence of the old generic placeholder handlers.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Test Results

Recorded after Operations sidebar/top-filter separation, horizontal filter rail
correction, status-chip compaction, and UI audit harness viewport updates:

- PASS `node --test tests/operations-shell-navigation-contract.test.js tests/operations-saas-crm-redesign.test.js tests/bna-brand-shell.test.js tests/ops-ui-audit-harness.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/operations-ws01-layout-readability.test.js tests/assistant-portal-communications-contract.test.js`
- PASS `node --check scripts/full-ui-audit.mjs`
- PASS `node --check tools/ops-ui-audit/config.js`
- PASS `npm run ops:audit -- smoke-login`
- PASS production before-audit capture:
  `UI_AUDIT_TARGET_MODE=batch6 UI_AUDIT_SLUG=2026-06-21-batch6-before-prod UI_AUDIT_BASE_URL=https://bneineviimacademy.org node scripts/full-ui-audit.mjs`
- PASS `npm run railway:doctor` after Railway deployment
  `d6c09c49-8372-42d7-8b3b-a049ab24ad63`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`.
- PASS production after-audit capture:
  `UI_AUDIT_TARGET_MODE=batch6 UI_AUDIT_SLUG=2026-06-21-batch6-after-prod UI_AUDIT_BASE_URL=https://bneineviimacademy.org node scripts/full-ui-audit.mjs`
- PASS focused Operations filter-rail live smoke,
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`.

Focused combined test result:

- Tests: 41 passed, 0 failed.
- Covered: Operations shell navigation contract, SaaS CRM layout expectations,
  brand shell filter behavior, UI audit viewport configuration, Operations
  Playwright smoke, module scoping, layout readability, and assistant portal
  communications contract.

Before-audit capture result:

- Screenshots: 141.
- Errors: 0.
- Required widths captured: 1440, 1024, 768, 430, 390, and 360.

After-audit capture result:

- Screenshots: 141.
- Errors: 0.
- Required widths captured: 1440, 1024, 768, 430, 390, and 360.

Focused live smoke confirmed:

- Production health and Operations login succeeded.
- Deployed Operations HTML contains `data-top-filter-rail`, module-sidebar
  mode, and filter-track tablist markers.
- Deployed Operations HTML no longer contains `data-module-toolbar-id` or
  `MODULE_TOOLBAR_PRIORITY`.
- Mobile widths 430, 390, and 360 keep the Tasks filter rail in one row with
  local horizontal scrolling.
- No page-level horizontal overflow was detected at the checked mobile widths.

Intermediate failure notes:

- First focused live-smoke attempt failed on a smoke-script assertion that
  expected Blocked filter ID `blocked`; the live ID is `pending`.
- Second focused live-smoke attempt failed waiting for Playwright `networkidle`;
  the page was then checked with `domcontentloaded` plus explicit selector
  waits and passed.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 Test Results

Recorded after WhatsApp workspace UX, scoped WAPI report readback, sanitized
WhatsApp message API readback, and no-send readiness gates:

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/wapi-phonebook-report.js`
- PASS `node --test tests/one-time-communications-workspace.test.js tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/communications-screening-import-ui.test.js tests/communications-integrations-contract.test.js tests/assistant-portal-communications-contract.test.js`
- PASS `node --test tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/operations-shell-navigation-contract.test.js`
- PASS `npm run ops:audit -- smoke-login`
- PASS `npm run bna:run:validate`
- PASS `npm run railway:doctor` after Railway deployment
  `3265d380-9a93-488d-844f-f523367aa4e2`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T11-33-08-112Z-live-app-smoke.md`.
- PASS focused/repeatable WhatsApp UX live smoke via `npm run app:smoke:whatsapp-ux`,
  `ops/live-smokes/2026-06-21T11-47-26-966Z-whatsapp-ux-live-smoke.md`.

Focused communications test result:

- Tests: 30 passed, 0 failed.
- Covered: WAPI phonebook workspace, no-send contract, scoped/sanitized
  WhatsApp API readback, Whapi log sync, communications screening/import UI,
  communications integration placeholders, and assistant portal communication
  contract.

Operations runtime smoke result:

- Tests: 10 passed, 0 failed.
- Covered: Operations UI load, scoped modules, module/filter navigation, and
  server-side module scoping.

Intermediate failure recorded:

- The first focused communications run exposed an existing CRLF-brittle
  `.env.example` placeholder assertion. The test was made line-ending tolerant
  while preserving the blank-placeholder requirement, then the suite passed.
- The first standard live-smoke attempt used scoped One Time credentials and
  failed session `/me` readback; the rerun used the standard Operations
  `OPS_*` credentials and passed.
- Focused live-smoke attempts before the final pass failed on smoke-script
  assumptions: missing clean-worktree env load, stale Operations selector,
  legacy message response wrapper, empty-message versus phonebook-state
  mismatch, and visible-state waiting on a responsive pane. The final focused
  live smoke passed without changing runtime behavior or weakening the
  no-send/raw-payload checks.
<!-- batch-7:end -->

<!-- batch-8:start -->
## Batch 8 Test Results

Recorded after Email/Resend readiness UX, webhook verification/storage, sender
domain Decision, recipient-scope guard, and no-send controls:

- PASS `node --check src/lib/integrations/resend-client.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-email-resend-ux-live.mjs`
- PASS `node --check scripts/provider-env-railway-propagate.mjs`
- PASS `node --test tests/resend-client.test.js tests/communications-integrations-contract.test.js tests/one-time-communications-workspace.test.js tests/provider-env-railway-propagate.test.js`
- PASS redacted Resend API-key Railway propagation dry run:
  `ops/qa-runs/2026-06-21T12-08-03-312Z-provider-env-railway-propagation.md`.
- PASS redacted Resend API-key Railway propagation apply:
  `ops/qa-runs/2026-06-21T12-08-11-738Z-provider-env-railway-propagation.md`.
- PASS `npm run bna:run:validate`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check`
- PASS Railway deployment poll after Railway deployment
  `3ec03a01-2141-401f-988f-a734176a778c`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T12-12-08-310Z-live-app-smoke.md`.
- PASS focused Email/Resend UX live smoke via
  `npm run app:smoke:email-resend-ux`,
  `ops/live-smokes/2026-06-21T12-10-31-966Z-email-resend-ux-live-smoke.md`.

Focused Email/Resend test result:

- Tests: 19 passed, 0 failed.
- Covered: Resend readiness, no-send approval gate, webhook Svix signature
  verification, safe mocked webhook storage, domain/status/event readback
  contracts, Operations Email/Resend UI markers, provider/sender/domain
  separation, recipient-scope guard, and Resend API-key propagation independent
  from sender/domain readiness.

Focused live smoke confirmed:

- Production health and Operations login succeeded.
- Resend health response separates provider, sender, domain, and send gates.
- Live `RESEND_API_KEY` is configured, while sender/domain/send readiness remain
  blocked until the operator Decision is answered.
- Resend domain endpoint is readable with one connected domain without exposing
  secrets.
- Resend webhook events endpoint hides raw payload by default.
- Communications > Email and Communications > Settings render at 1024px and
  390px with no page overflow.
- Email send controls remain disabled unless exact readiness conditions pass.

Intermediate failure recorded:

- `ops/live-smokes/2026-06-21T12-03-06-468Z-email-resend-ux-live-smoke.md`
  failed on the Communications > Settings integration-panel selector. The live
  app still had a placeholder there, so the subtab was wired to the real
  communications integration panel and the final focused smoke passed.
- `ops/live-smokes/2026-06-21T12-06-50-692Z-email-resend-ux-live-smoke.md`
  passed before `RESEND_API_KEY` was propagated; the final post-propagation
  smoke above verified live key/domain readback.
<!-- batch-8:end -->

<!-- batch-9-10:start -->
## Batch 9/10 Test Results

Recorded after product-offer contracts, safe availability rules, appointment
intent records, portal foundations, Operations Add Class/Add Appointment
actions, and focused live-smoke script implementation:

- PASS `node --check src/lib/bna/one-time-product-system.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-product-booking-live.mjs`
- PASS `node --test tests/one-time-product-system.test.js tests/rabbi-checkout-access.test.js tests/one-time-external-user-portal.test.js tests/one-time-operations-ui-smoke.test.js`

Focused Batch 9/10 test result:

- Tests: 47 passed, 0 failed.
- Covered: One Time product helper contracts, readiness gates, safe offer
  catalog, availability foundation, appointment intent shape, portal
  foundations, migration schema/seeds, scoped server routes, public no-checkout
  One Time draft page, Operations Add Class/Add Appointment controls, and
  existing Rabbi checkout/access/external-user portal contracts.

Non-product check note:

- `node --check public/operations.html` was attempted and failed with Node's
  expected unknown `.html` extension error. The HTML is covered by the
  Operations UI smoke tests above.

Post-deploy checks:

- PASS `npm run bna:run:validate`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check`
- PASS `npm run railway:doctor` after Railway deployment
  `8c20ae67-9acc-43f2-b77d-c10fcd425d73`
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T12-36-43-923Z-live-app-smoke.md`
- PASS focused One Time product/booking live smoke,
  `ops/live-smokes/2026-06-21T12-38-45-981Z-one-time-product-booking-live-smoke.md`

Focused live smoke confirmed:

- Product offers, availability, appointment types, appointment intents, and
  portal foundations are readable from production.
- A clearly marked internal One Time class event can be created and read back.
- A clearly marked internal One Time appointment intent can be created and read
  back.
- Operations schedule UI renders Add Class and Add Appointment controls at
  1440px and 390px without page-level horizontal overflow.
- No external write, Zoom meeting, payment, invoice, access grant, email,
  WhatsApp, participant invite, or upload was performed.

Intermediate focused live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T12-36-42-823Z-one-time-product-booking-live-smoke.md`
  failed on a selector visibility assumption after the native appointment type
  select was enhanced and hidden by the app.
- `ops/live-smokes/2026-06-21T12-38-15-716Z-one-time-product-booking-live-smoke.md`
  failed because the smoke treated an unrelated in-app `Send` control as a live
  external send path. The final smoke checks external-send, Zoom, and payment
  labels specifically.
<!-- batch-9-10:end -->
