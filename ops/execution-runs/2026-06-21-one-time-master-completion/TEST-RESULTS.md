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

<!-- batch-9A:start -->
## Batch 9A Test Results

Recorded after source-envelope classifier, mixed-context item routing, live
parse-route filename/title handoff, and focused smoke-script implementation:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-source-envelope-parser-live.mjs`
- PASS `node --check src/platform/ingestion/intake-source.js`
- PASS `node --check src/lib/bna/intake-parser.js`
- PASS `node --check src/platform/ingestion/canonical-parser.js`
- PASS `node --test tests/ingestion/w3-intake-source.test.js tests/intake-parser-workspace-ambiguity.test.js tests/ingestion/w3-parser-queue.test.js`
  with 13/13 tests passing.
- PASS `node --test tests/intake-parser.test.js tests/ramble-protocol-hardening.test.js tests/telegram-ramble-routing-regression.test.js tests/telegram-media-routing.test.js`
  with 38/38 tests passing.
- PASS `git diff --cached --check`.
- PASS `node scripts/audit-secrets.mjs` with 3759 tracked paths checked and
  0 tracked secret-risk files found.
- PASS `npm run railway:doctor` after Railway deployment
  `c1623618-a00c-46d0-8be9-5a8e4102b376`.
- PASS deployment poll for `c1623618-a00c-46d0-8be9-5a8e4102b376`, status
  `SUCCESS`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T13-21-50-721Z-live-app-smoke.md`.
- PASS `npm run app:smoke:source-envelope-parser`,
  `ops/live-smokes/2026-06-21T13-22-11-379Z-source-envelope-parser-live-smoke.md`.

Known unrelated caveat:

- `node --test tests/intake-parser.test.js tests/ramble-protocol-hardening.test.js tests/telegram-ramble-routing-regression.test.js tests/one-time-intake-api-readback.test.js`
  passed all parser/ramble tests but failed
  `scoped One Time owner and admin auth can reach the canonical intake parse API`
  because the current HEAD auth helper returns `Rabbi Ellie Scheller` and the
  test expects `Rabbi Elie Scheller`. This mismatch predates Batch 9A and is
  unrelated to source-envelope routing.
<!-- batch-9A:end -->

<!-- batch-9B:start -->
## Batch 9B Test Results

Recorded after live class-upload trace, reprocess dry-run, blocked reprocess
attempt, content-job note sanitization, and focused blocker-verification smoke:

- PASS `node --check scripts/smoke-class-upload-trace-live.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS dry-run:
  `node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --dry-run --auto-parse`
  with job `#78`, title `Drive Class Sunday balak`, status `ingested`, drive
  stage `02 Ingesting`, source file `Class Sunday balak.m4a`, and
  `would_update: transcribe_and_patch_existing_job`.
- BLOCKED actual reprocess:
  `node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --parse`
  stopped on hosted transcription `401 invalid_credential` before transcript
  text or parse-run creation.
- PASS live content-job note sanitization patch:
  job `#78` status `blocked`, drive stage `02 Ingesting`,
  `notes_sanitized: true`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T13-37-11-961Z-live-app-smoke.md`.
- PASS `npm run app:smoke:class-upload-trace -- 78`,
  `ops/live-smokes/2026-06-21T13-37-45-376Z-class-upload-trace-live-smoke.md`.

Focused smoke covered:

- Operations login and live content-job readback.
- Source provenance for job `#78` with `google_drive` source and Drive file id.
- Explicit blocked-before-parse state with zero transcript chars.
- Sanitized Batch 9B blocker notes with no secret-like credential material.
- No parse run for source `content_recording` / `78`.

Guardrails:

- No transcript body was written into reports.
- No parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer,
  DNS, CRM/GHL, WhatsApp, email, or external-account write was performed.
<!-- batch-9B:end -->

<!-- batch-9C:start -->
## Batch 9C Test Results

Recorded after adding the Downloads spreadsheet inventory script, package
command, privacy regression test, and generated redacted inventory artifacts:

- PASS `node --check scripts/inventory-download-spreadsheets.mjs`
- PASS `node scripts/inventory-download-spreadsheets.mjs`
  - Files inventoried: 203
  - Import candidates: 56
  - Outputs:
    `ops/one-time-mishnah/downloads-spreadsheet-inventory.json`,
    `ops/one-time-mishnah/downloads-spreadsheet-inventory.md`
- PASS `npm run inventory:downloads-spreadsheets`
- PASS `node --test tests/downloads-spreadsheet-inventory.test.js`
  with 1/1 tests passing.
- PASS inventory JSON parse.
- PASS generated-output privacy scan after filename-token redaction; scan hits
  were hashes/fingerprints, not raw contact values.
- PASS `node scripts/audit-secrets.mjs` with 3779 tracked paths checked and
  0 tracked secret-risk files found.
- PASS `git diff --check` for Batch 9C paths with line-ending warning only for
  `package.json`.

Focused privacy test covered:

- Synthetic CSV exports with private emails, names, and phone numbers.
- Inventory JSON/Markdown output creation.
- Classification of One Time follower and legacy CRM/pipeline candidates.
- No raw private row values in serialized JSON/Markdown.
- Explicit `No GHL runtime` guardrail copy.
<!-- batch-9C:end -->

<!-- batch-12:start -->
## Batch 12 Test Results

Recorded after Zoom token/cache scaffolding, secure meeting/registrant request
builders, webhook signature/replay/idempotency planning, attendance
reconciliation, internal schema, Operations readiness copy, and focused live
smoke script implementation:

- PASS `node --check src/lib/integrations/zoom.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-zoom-attendance-live.mjs`
- PASS `node --test tests/one-time-zoom-attendance-automation.test.js tests/rabbi-checkout-access.test.js tests/one-time-product-system.test.js tests/one-time-operations-ui-smoke.test.js`

Focused Batch 12 test result:

- Tests: 25 passed, 0 failed.
- Covered: Zoom preview contract, token cache, API client readiness, secure
  meeting request defaults, protected registrant request defaults, participant/
  recording/transcript/summary request builders, webhook signature verification,
  replay/idempotency/queue/dead-letter plan, attendance reconnect merging,
  dashboard-click exclusion, workflow model, route metadata, Operations UI copy,
  and internal Zoom foundation tables.

Closeout checks:

- PASS `npm run bna:run:validate`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only
- PASS `npm run railway:doctor` using the main workspace Railway token
- PASS Railway deployment poll for
  `b2d02f20-64a8-4183-9dba-3587d0449ef7`
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T12-55-46-834Z-live-app-smoke.md`
- PASS `node scripts/smoke-one-time-zoom-attendance-live.mjs`,
  `ops/live-smokes/2026-06-21T12-56-08-966Z-one-time-zoom-attendance-live-smoke.md`

Intermediate focused live-smoke failure recorded:

- `ops/live-smokes/2026-06-21T12-54-52-064Z-one-time-zoom-attendance-live-smoke.md`
  failed on a smoke-script false positive: safe Zoom status field names were
  treated as secret exposure. The passing rerun checks only secret-like field
  values and Zoom start-token patterns.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 Test Results

Recorded after manual Vimeo workflow, member-library filters/metadata,
automated upload readiness, recording/publication lifecycle, Operations UI,
member-library UI, and focused live-smoke script implementation:

- PASS `node --check src/lib/integrations/video-hosting.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-vimeo-member-library-live.mjs`
- PASS `node --test tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-member-library.test.js`
- PASS `node --test tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-member-library.test.js tests/one-time-product-system.test.js tests/one-time-operations-ui-smoke.test.js tests/rabbi-checkout-access.test.js`

Focused Batch 11/13 test result:

- Tests: 25 passed, 0 failed.
- Covered: Vimeo selected-provider decision, manual URL parsing, manual
  workflow readiness, automated upload disabled feature flag, automated setup
  checklist, publication lifecycle states, provider-publish guardrails,
  member-library metadata fields, horizontal filters/grouping/progress UI,
  Operations class-package controls, and existing One Time product/access
  contracts.

Closeout checks:

- PASS `npm run bna:run:validate`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only in the main worktree
- PASS clean detached deploy-worktree focused tests using `NODE_PATH` from the
  main workspace
- PASS clean detached deploy-worktree `node scripts/audit-secrets.mjs`
- PASS clean detached deploy-worktree `git diff --check`
- PASS `npm run railway:doctor` after current-HEAD Railway deployment
  `38393641-ee8e-46ed-8daf-16e67b1cde2a`
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T13-37-16-293Z-live-app-smoke.md`
- PASS `node scripts/smoke-one-time-vimeo-member-library-live.mjs`,
  `ops/live-smokes/2026-06-21T13-37-41-388Z-one-time-vimeo-member-library-live-smoke.md`
- PASS `npm run app:smoke:source-envelope-parser`,
  `ops/live-smokes/2026-06-21T13-38-09-230Z-source-envelope-parser-live-smoke.md`
- PASS read-only production cleanup check:
  `active_unarchived_codex_vimeo_smoke_classes: 0`

Deployment-safety notes:

- The first deploy was run from a clean detached worktree at
  `37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92`, because the main worktree
  contained unrelated unstaged files that were not part of this batch.
- The current deployed bundle was then redeployed from a clean detached
  worktree at `23e16a126f6e7461858b5701f2dbd2ba719a35c7`, so production
  contains both the Vimeo/member-library implementation and the preceding
  source-envelope parser commits.
- The first clean-worktree focused test attempt failed only because the clean
  deploy worktree had no local `node_modules`; rerun with the main workspace
  `NODE_PATH` passed.
- The first deploy command attempt failed before upload because the clean
  worktree did not contain `.secrets`; rerun using the local keyholder Railway
  token path succeeded.
- The first standard app-smoke attempt failed before app access because the PR
  worktree did not contain `OPS_USERNAME`/`OPS_PASSWORD`; rerun after loading
  the local keyholder env file passed.

Intermediate focused live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T13-21-13-527Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke omitted the `smoke` tier in the member-preview
  request; the application correctly kept the smoke item hidden.
- `ops/live-smokes/2026-06-21T13-21-36-456Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke targeted the old content-section query instead of
  the deployed `one_time_library` section.
<!-- batch-11-13:end -->

<!-- batch-9D:start -->
## Batch 9D Test Results

Recorded after scoped CRM import preview/dedupe hardening and focused
readiness/UI live-smoke script updates:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-crm-import-dedupe-live.mjs`
- PASS `node --test tests/communications-screening-import-ui.test.js tests/downloads-spreadsheet-inventory.test.js`
- PASS `node --test tests/communications-screening-import-ui.test.js tests/downloads-spreadsheet-inventory.test.js tests/one-time-product-system.test.js tests/one-time-communications-workspace.test.js tests/communications-integrations-contract.test.js tests/assistant-portal-communications-contract.test.js`
  with 29/29 tests passing.

Focused Batch 9D test result:

- Tests: 29 passed, 0 failed.
- Covered: contact import preview remains preview-only; source inventory
  metadata is attached; scoped dedupe helper and keys exist; raw source rows are
  stripped; warm leads remain no-send until approval; external CRM writes remain
  false; GHL/LeadConnector are forbidden runtimes only; One Time product
  readiness exposes the CRM import preview route/payload; Operations renders
  the CRM Import Preview panel with disabled Apply Import; existing One Time
  communications, integration, and assistant portal contracts still pass.

Closeout checks:

- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only
- PASS `npm run railway:doctor` before deployment
- PASS Railway deployment readback for current PR-head deployment
  `4919c095-6301-4806-a712-0d64b4d01850`
- PASS Railway deployment poll for
  `4919c095-6301-4806-a712-0d64b4d01850`, status `SUCCESS`
- PASS `npm run railway:doctor` after deployment
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T14-03-28-563Z-live-app-smoke.md`
- PASS `npm run app:smoke:one-time-crm-import-dedupe`,
  `ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md`

Focused live smoke covered:

- Read-only One Time CRM import readiness route.
- Operations CRM Import Preview panel and disabled Apply Import action.
- Authenticated production contact-import preview route.
- Synthetic `.invalid` rows only, 2 preview rows.
- Metadata-only source inventory reference `DL-SHEET-f93f34d98e`.
- Scope `rabbi_sheller_provider / one_time_mishnah_class`.
- Scoped dedupe keys and dedupe bases on each row.
- `commit_blocked: true`, no-send, no local write, no external write, no
  external CRM write, forbidden GHL runtime, and no raw `source_row` exposure.

Deployment-safety notes:

- Deployment was run from a clean detached worktree at
  `aedb04aade8d518427b9f4df011c8b5a9d07f306`, because the main worktree still
  contained unrelated uncommitted public data files.
- An intermediate focused smoke attempt against the earlier `5858f658` subset
  failed before the current readiness route was deployed. After `aedb04aa`
  reached production, the full readiness/UI/import preview smoke passed.
<!-- batch-9D:end -->

<!-- batch-9E:start -->
## Batch 9E Test Results

Recorded after One Time CRM Contacts UX, scoped parent-lead readback, CRM
Contacts tab/direct review actions, and focused live-smoke implementation:

- PASS `node --test tests/operations-contacts-intake-cleanup.test.js tests/operations-module-scoping.test.js tests/one-time-communications-workspace.test.js`
  with 15/15 tests passing.
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-crm-contacts-ux-live.mjs`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run watchdog:actions`
- PASS `npm run railway:doctor` after final Railway deployment
  `bf53e21c-a793-4af8-8630-a0e855d857c7`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T14-25-34-360Z-live-app-smoke.md`
- PASS `npm run app:smoke:one-time-crm-contacts-ux`,
  `ops/live-smokes/2026-06-21T14-25-06-483Z-one-time-crm-contacts-ux-live-smoke.md`

Focused test coverage:

- Operations parent-lead loading passes selected workspace/project filters.
- `/api/bna/parent-leads` uses requested project scope and returns project key
  metadata for verification.
- One Time CRM Contacts UX exposes source/status, no-send, dedupe/review, and
  communications state.
- CRM rows cover parent leads, product-interest leads, and member/access rows.
- Private BNA goals, check-ins, admin notes, and school-only data are excluded
  from the One Time Contacts UX.

Focused live smoke covered:

- Production health and Operations login through the standard app smoke.
- Scoped One Time parent-leads API with 88 returned leads and 88 returned
  `project_key=one_time_mishnah_class` rows.
- Scoped One Time contact-communications API with 94 returned records.
- Deployed Operations CRM Contacts UX marker, requirement ID, heading,
  no-send guardrail copy, privacy guardrail copy, dedupe/review state, and
  scoped parent-lead fetch marker.

Intermediate/known failures recorded:

- Initial standard and focused live-smoke attempts failed before app access
  because this PR worktree does not contain local `OPS_USERNAME` and
  `OPS_PASSWORD`; reruns loaded the existing local BNA `.env.local` into the
  process environment and passed.
- An intermediate standard live-smoke attempt using the One Time-scoped
  Operations credentials logged in but failed `/api/bna/auth/me`, which is
  expected for the school-wide standard smoke. The final standard smoke used
  the platform Operations credentials from the existing local BNA env file and
  passed.
- Full `npm test` still fails unrelated/stale assertions in
  `tests/agent-control-center.test.js`,
  `tests/developer-tester-ticket-capture.test.js`, and
  `tests/ui-01-public-operations-shell.test.js`. The Batch 9E focused suite
  and live release gate passed.
<!-- batch-9E:end -->

<!-- batch-9F:start -->
## Batch 9F Test Results

Recorded after local implementation of warm-lead trial/referral configuration:

- PASS `node --test tests/one-time-stripe-local-beta.test.js tests/one-time-product-system.test.js`
  with 13/13 tests passing.
- PASS `node --test tests/one-time-stripe-local-beta.test.js tests/one-time-product-system.test.js tests/one-time-operations-ui-smoke.test.js tests/operations-module-scoping.test.js tests/operations-contacts-intake-cleanup.test.js`
  with 25/25 tests passing.
- PASS `node --test tests/int05-integrations-closeout.test.js tests/rabbi-checkout-access.test.js tests/provider-integrations-secret-storage.test.js`
  with 16/16 tests passing.
- PASS `node --check server.js`
- PASS `node --check src/lib/integrations/stripe.js`
- PASS `node --check scripts/smoke-one-time-trial-referral-live.mjs`
- PASS `npm run bna:run:validate`
- PASS `node scripts/audit-secrets.mjs`
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T14-44-watchdog-action-audit.md`
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after Railway deployment
  `12249b2b-f11c-44b0-b9fa-ba75c511c633`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`
- PASS `npm run app:smoke:one-time-trial-referral`,
  `ops/live-smokes/2026-06-21T14-50-38-537Z-one-time-trial-referral-live-smoke.md`

Focused coverage:

- 30-day warm-lead intro trial defaults to the $67 monthly membership renewal.
- Card-required and one-intro-trial-per-household rules are modeled.
- Policy-version and acceptance storage use durable local tables.
- Referral reward activates only after first successful paid cycle and stays
  manual-review only.
- Stripe local-beta readback exposes preview/readiness only and blocks checkout
  session creation, subscriptions, live charges, payment-method collection, and
  invoice credits.
- Operations exposes a Trial / Referral Configuration panel with no-write
  guardrails and the legal wording Decision.
- `DEC-20260621-901` remains the single legal wording Decision and blocks only
  public/legal copy and live billing launch.

Focused live smoke covered:

- Production trial/referral route returned 30-day trial, `$67` renewal,
  card-required rule, one-intro-trial rule, first-paid-cycle referral trigger,
  `bna_one_time_policy_acceptances`, three promotion policies, and no-write
  guardrails.
- Operations shipped the Batch 9F panel marker, requirement ID, trial copy,
  one-intro-trial copy, referral trigger copy, acceptance table copy, and
  no-charge/no-credit guardrail.

Intermediate/known failures recorded:

- `ops/live-smokes/2026-06-21T14-49-04-951Z-live-app-smoke.md` failed after
  login because `/api/bna/auth/me` did not return success. The final standard
  smoke was rerun with platform Operations credentials and passed at
  `ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`.
<!-- batch-9F:end -->

<!-- batch-9G:start -->
## Batch 9G Test Results

Recorded after local implementation of the payment-to-access and class-link
readiness flow:

- PASS `node --check server.js`
- PASS `node --check public/js/rabbi-member.js`
- PASS `node --check scripts/smoke-one-time-payment-access-class-links-live.mjs`
- PASS `node --test tests/rabbi-checkout-access.test.js tests/one-time-external-user-portal.test.js tests/one-time-product-system.test.js`
  with 48/48 tests passing.
- PASS `node --test tests/one-time-stripe-local-beta.test.js tests/one-time-external-user-portal.test.js tests/rabbi-checkout-access.test.js`
  with 45/45 tests passing.
- PASS route/action registry JSON parse.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T15-05-watchdog-action-audit.md`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after final active Railway deployment
  `ec7724a3-76b9-4858-85e2-370af327759a`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T15-10-55-665Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-payment-access-class-links`,
  `ops/live-smokes/2026-06-21T15-11-14-543Z-one-time-payment-access-class-links-live-smoke.md`.

Focused coverage:

- Test-mode payment state exposes checkout counts and paid-test counts without
  checkout session creation, payment links, subscriptions, or live charges.
- Access grants require an approved local/test event and manual admin review;
  automated access-grant creation remains disabled.
- Class links are scoped to member/session plus active live grant readiness.
- Member responses use protected class-link state and do not render
  `session.zoom_url`.
- Operations exposes the 9G panel, active review actions, and disabled Grant
  Access / Reveal Join Link blockers.
- Route and action registries include the focused 9G route/actions.

Focused live smoke covered:

- Production payment/access/class-link route returned `REQ-20260621-907` with
  no live charge, no checkout/payment-link creation, no automated access grant,
  no external write, relationship-scoped class links, no raw Zoom member URL,
  and no Zoom host/start URL.
- Operations shipped the 9G panel marker, requirement ID, guardrail copy, and
  disabled access/link actions.
- The deployed member portal script does not use `session.zoom_url` and renders
  the protected Join Class blocker.
<!-- batch-9G:end -->

<!-- batch-9H:start -->
## Batch 9H Test Results

Recorded for `REQ-20260621-908` authenticated questions and support-ticket bot:

- PASS `node --check server.js`
- PASS `node --check public/js/rabbi-member.js`
- PASS `node --check scripts/smoke-one-time-authenticated-support-live.mjs`
- PASS `node --test tests/one-time-member-support-questions.test.js tests/developer-tester-ticket-capture.test.js tests/one-time-community-moderation-workflow.test.js`
  with 19/19 tests passing.
- PASS `node --test tests/rabbi-checkout-access.test.js tests/one-time-external-user-portal.test.js tests/one-time-member-library.test.js tests/one-time-classroom-calendar-community-bot.test.js tests/one-time-action-coverage.test.js`
  with 59/59 tests passing.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T15-29-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T15-29-watchdog-security-routes.md`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `977430a7-fa56-480d-9289-5abbd6536658`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T15-38-11-038Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-authenticated-support`,
  `ops/live-smokes/2026-06-21T15-38-32-390Z-one-time-authenticated-support-live-smoke.md`.

Focused coverage:

- Member support/question APIs require bearer member session authentication.
- Support tickets persist `OT-SUP` ticket numbers and authenticated
  workspace/project/requester context.
- Member support lists and detail routes only return the authenticated member's
  scoped ticket rows.
- Project-visible staff replies return to the member; internal staff notes and
  source context do not.
- Private questions persist `OT-Q` question numbers and stay review-only with
  no public forum, no member feed, no send, and no external write.
- The member portal exposes working Private Questions and Support controls.
- The support bot mode remains `ticket_only`; no unrestricted Mishnah study bot
  is enabled.
- The classroom action keeps the clearer visible "Create Internal Calendar
  Item" label while preserving the legacy "Add Session" accessible alias used
  by action coverage.

Intermediate/known failures recorded:

- `npm run watchdog:security-routes` failed because that package script does
  not exist; `npm run watchdog:security` is the correct route watchdog and
  passed.
- The first `npm run app:smoke` attempt failed before any app assertion because
  this worktree lacked `OPS_USERNAME` and `OPS_PASSWORD`. The standard smoke
  was rerun with the existing local BNA env file loaded and passed.
<!-- batch-9H:end -->

<!-- batch-9I:start -->
## Batch 9I Test Results

Recorded for `REQ-20260621-909` test identities and mock data:

- PASS `node --check server.js`
- PASS `node --check scripts/platform-synthetic-e2e.mjs`
- PASS `node --check scripts/smoke-one-time-test-identities-live.mjs`
- PASS `node --test tests/one-time-synthetic-pilot.test.js tests/one-time-rbac-negative-isolation.test.js tests/one-time-external-user-portal.test.js tests/one-time-action-coverage.test.js`
  with 49/49 tests passing.
- PASS `npm run platform:synthetic-e2e`.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T15-49-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T15-49-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `44220c69-fdb0-4796-96fc-80d39771e244`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T16-54-31-139Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-community`,
  `ops/live-smokes/2026-06-21T16-55-06-536Z-one-time-community-live-smoke.md`.
- PASS `npm run railway:doctor` after deployment
  `5751098c-2095-4d24-97db-712aba136915`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T15-52-36-326Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-test-identities`,
  `ops/live-smokes/2026-06-21T15-53-01-681Z-one-time-test-identities-live-smoke.md`.

Focused coverage:

- All fixture identities are `TEST-` keyed, display as `TEST ...`, use
  `example.test` contact values, and carry `REQ-20260621-909` cleanup keys.
- No fixture includes real private exports, raw private rows, production record
  creation, or external writes.
- Mock scenarios cover CRM, payment/access, class links, questions, and
  support.
- Negative authorization matrix covers cross-workspace Rabbi/BNA staff
  denials, parent/student own-record denials, platform-role assignment denial,
  query-parameter cross-scope denial, and cross-workspace task/Decision/message/
  recording denial.
- Operations renders the preview panel and disabled Apply/Cleanup blockers.
<!-- batch-9I:end -->

<!-- batch-9J:start -->
## Batch 9J Test Results

Recorded for `REQ-20260621-910` Agent Mode end-to-end acceptance:

- PASS `node --check server.js`
- PASS `node --check scripts/one-time-agent-mode-acceptance.mjs`
- PASS `node --check scripts/smoke-one-time-agent-mode-acceptance-live.mjs`
- PASS `node --test tests/one-time-agent-mode-acceptance.test.js tests/one-time-synthetic-pilot.test.js tests/one-time-action-coverage.test.js tests/agent-control-api-readback.test.js`
  with 17/17 tests passing.
- PASS `npm run one-time:agent-mode-acceptance`.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T16-01-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T16-01-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `b006acf0-41d5-458c-b661-2b673d8de1f7`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T16-05-41-875Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-agent-mode-acceptance`,
  `ops/live-smokes/2026-06-21T16-06-05-717Z-one-time-agent-mode-acceptance-live-smoke.md`.

Focused coverage:

- Agent Mode acceptance includes parser, CRM import/dedupe, trial/referral,
  payment/access/class links, authenticated support/questions, and TEST beta
  identity stages.
- Each acceptance stage maps to its requirement, evidence artifacts, no-write
  guardrails, and remaining dependency state.
- External blockers are isolated to transcription credential, Resend
  sender/domain fields, Vimeo user token, and separate One Time infrastructure.
- The acceptance route is admin-protected and Operations exposes active status
  and evidence actions plus a disabled live-run blocker.
- The generated evidence asserts no live charges, real sends, external CRM/GHL
  writes, production mutations, private-data exports, Zoom/Vimeo/Google/DNS
  mutations, or secret exposure.
<!-- batch-9J:end -->

<!-- batch-14:start -->
## Batch 14 Test Results

Recorded for `REQ-20260619-309` transcript privacy:

- PASS `node --check src/lib/bna/transcript-privacy.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-transcript-privacy-live.mjs`
- PASS `node --test tests/one-time-transcript-privacy.test.js tests/one-time-member-library.test.js tests/one-time-recording-vimeo-pipeline.test.js tests/one-time-action-coverage.test.js`
  with 24/24 tests passing.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T16-23-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T16-23-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `7feae8ec-f34f-4e33-9e2d-9dcb479b1f14`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T16-25-45-794Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-transcript-privacy`,
  `ops/live-smokes/2026-06-21T16-26-14-021Z-one-time-transcript-privacy-live-smoke.md`.

Focused coverage:

- Student-private and parent-visible transcript segments require enrollment or
  registrant context, accepted match method, confidence threshold, and review.
- Guessed speaker labels, voice guesses, LLM guesses, and name mentions cannot
  become reviewed student data even at high confidence.
- Parent-visible output requires reviewed Rabbi feedback or Rabbi-approved
  text.
- Member-safe classroom responses blank transcript text, notes, segments,
  versions, glossary, and release audit metadata.
- The production readiness route and Operations panel are body-free and
  no-write.
<!-- batch-14:end -->

<!-- batch-15:start -->
## Batch 15 Test Results

Recorded for `REQ-20260619-310` gamification:

- PASS `node --check src/lib/bna/gamification.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-gamification-live.mjs`
- PASS `node --test tests/gamification-events.test.js tests/one-time-gamification-badge-audit.test.js`
  with 13/13 tests passing.
- PASS `node --test tests/one-time-operations-ui-smoke.test.js tests/ws11-community-model-contract.test.js tests/parent-progress-privacy.test.js`
  with 12/12 tests passing.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T16-38-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T16-38-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `b6f0a4de-2857-4de0-9053-be0c74c7ab74`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T16-44-28-806Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-gamification`,
  `ops/live-smokes/2026-06-21T16-44-00-049Z-one-time-gamification-live-smoke.md`.

Intermediate caveat:

- `npm run app:smoke` first failed at
  `ops/live-smokes/2026-06-21T16-44-00-563Z-live-app-smoke.md` because the run
  used scoped One Time credentials against the full `/me` standard-smoke
  expectation. The final rerun used full Ops credentials and passed.

Focused coverage:

- Automatic badge evaluation uses per-badge rules, configurable thresholds,
  approved events, existing active badge suppression, and stable idempotency.
- `createGamificationEvent` uses the same automatic evaluator before writing
  badge/audit rows.
- The Rabbi-awarded badge route requires a Rabbi-awarded badge slug, source
  evidence, student scope, and a human reason before writing a local badge and
  audit event.
- Manual reversal route requires `reversal_reason`, updates badge status, and
  writes a badge audit event.
- Rabbi-awarded badges remain human-review gated and are not automatically
  granted.
- Readiness and Operations panel remain no-write and public leaderboard-free.
<!-- batch-15:end -->

<!-- batch-16:start -->
## Batch 16 Test Results

Recorded for `REQ-20260619-311` community moderation:

- PASS `node --check src/lib/bna/community-moderation.js`
- PASS `node --check scripts/smoke-one-time-community-live.mjs`
- PASS `node --check server.js`
- PASS `node --test tests/one-time-community-moderation-workflow.test.js`
  with 9/9 tests passing.
- PASS `node --test tests/one-time-action-coverage.test.js tests/one-time-community-moderation-workflow.test.js`
  with 14/14 tests passing.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T16-48-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T16-48-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.

Focused coverage:

- Community readiness now reports `implemented_read_only` and no blockers.
- Private question intake stays private-first, body-free in readiness payloads,
  and flags contact info, direct-chat requests, unsafe language, and private
  identifiers.
- Private-to-public workflow records the six required steps, links original,
  edited, and public-preview versions, and keeps public promotion writes
  disabled.
- Operations shows implemented no-write readiness, the private-to-public
  workflow, report/flag flow, and `Live smoke ready` state.
- Unrestricted student-to-student private messaging, unreviewed publication,
  deletion without history, external notifications, and public promotion writes
  remain disabled.
- Initial smoke attempts failed locally before app access because the PR
  worktree did not have `.env.local`; reruns with the established local env
  file loaded into the process passed.
<!-- batch-16:end -->

<!-- batch-17:start -->
## Batch 17 Test Results

Recorded for `REQ-20260619-312` Sefaria and study-assistant readiness:

- PASS `node --check src/lib/bna/study-assistant-readiness.js`
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-study-assistant-live.mjs`
- PASS `node --test tests/one-time-study-assistant-readiness.test.js`
  with 7/7 tests passing.
- PASS `node --test tests/one-time-study-assistant-readiness.test.js tests/one-time-transcript-privacy.test.js tests/one-time-action-coverage.test.js`
  with 19/19 tests passing.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T17-04-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T17-05-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `9657afe5-958c-4cfb-bb6c-6afec77bcd05`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T17-07-20-392Z-live-app-smoke.md`.
- PASS `npm run app:smoke:one-time-study-assistant`,
  `ops/live-smokes/2026-06-21T17-08-29-970Z-one-time-study-assistant-live-smoke.md`.

Focused coverage:

- Study assistant readiness now reports `implemented_read_only` and no
  blockers while the feature flag stays disabled.
- Source versions require canonical reference, title/index/version, language,
  license, attribution, source URL, retrieved timestamp, content hash, Rabbi
  approval, and quote/summary/index permissions.
- Retrieval previews apply authorization before retrieval and block restricted,
  raw/unreviewed, staff-only, moderation, and cross-student material without
  returning source text.
- Future capabilities are declared as gated only; answer generation,
  unrestricted AI chat, arbitrary version ingestion, Sefaria/API ingestion,
  corpus mutation, portal publishing, raw transcript retrieval, and
  cross-student retrieval remain disabled.
- Operations shows the implemented disabled-feature foundation, no arbitrary
  versions, and `Live smoke ready` state.
- Initial focused smoke failed on a local scanner false positive for the
  policy key `apply_authorization_before_retrieval`; the scanner now checks
  secret-like string values, the focused test includes a regression assertion,
  and the rerun passed.
<!-- batch-17:end -->

<!-- batch-19:start -->
## Batch 19 Test Results

Recorded for `REQ-20260619-314` final verification and release:

- PASS targeted release-gate regression suite:
  `node --test tests/agent-control-center.test.js tests/one-time-intake-api-readback.test.js tests/one-time-ui-design-delta-audit.test.js tests/operations-automation-library.test.js tests/operations-saas-crm-redesign.test.js tests/rabbi-task-dialogue.test.js tests/ui-01-public-operations-shell.test.js tests/operations-shell-navigation-contract.test.js`
  with 32/32 tests passing.
- PASS `node --check scripts/smoke-final-register-surfaces-live.mjs`.
- PASS provider/final-register contract suite:
  `node --test tests/final-register-surfaces-closeout.test.js tests/service-provider-directory.test.js`
  with 18/18 tests passing.
- PASS final full suite: `npm test` with 1017/1017 tests passing.
- PASS `npm run watchdog:actions`,
  `ops/watchdog-audits/2026-06-21T17-35-watchdog-action-audit.md`.
- PASS `npm run watchdog:security`,
  `ops/watchdog-audits/2026-06-21T17-35-watchdog-security-routes.md`.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`.
- PASS `npm run bna:run:blockers`; only `REQ-20260621-902` and
  `REQ-20260619-313` remain blocked/external.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run railway:doctor` after deployment
  `48cf7b0e-5623-43a3-9c5a-278e4d8b7997`.
- PASS `npm run app:smoke`,
  `ops/live-smokes/2026-06-21T17-29-33-860Z-live-app-smoke.md`.
- PASS `npm run app:smoke:public-privacy`,
  `ops/live-smokes/2026-06-21T17-30-14-661Z-public-route-privacy-smoke.md`.
- PASS `npm run app:smoke:final-register-surfaces`,
  `ops/live-smokes/2026-06-21T17-30-14-986Z-final-register-surfaces-live-smoke.md`.
- PASS focused Operations and One Time smoke matrix:
  `ops/live-smokes/2026-06-21T17-30-44-984Z-operations-helper-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-33-54-274Z-operations-workspace-taxonomy-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-30-52-019Z-operations-settings-dashboard-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-30-56-432Z-provider-classroom-settings-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-30-59-449Z-content-research-scope-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-31-14-215Z-communications-screening-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-31-18-789Z-whatsapp-ux-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-31-42-431Z-email-resend-ux-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-08-700Z-one-time-crm-import-dedupe-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-13-303Z-one-time-crm-contacts-ux-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-18-713Z-one-time-trial-referral-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-23-769Z-one-time-payment-access-class-links-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-27-721Z-one-time-authenticated-support-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-39-053Z-one-time-test-identities-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-42-555Z-one-time-agent-mode-acceptance-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-45-845Z-one-time-transcript-privacy-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-50-364Z-one-time-gamification-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-54-852Z-one-time-community-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-32-57-987Z-one-time-study-assistant-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-33-02-699Z-rabbi-onetime-landing-smoke.md`,
  `ops/live-smokes/2026-06-21T17-33-57-277Z-ws11-parent-progress-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-34-19-160Z-source-envelope-parser-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-34-21-270Z-class-upload-trace-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-35-16-906Z-student-auth-policy-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-34-43-758Z-operator-setup-live-smoke.md`,
  `ops/live-smokes/2026-06-21T17-35-23-215Z-public-navigation-positioning-smoke.md`,
  `ops/live-smokes/2026-06-21T17-34-49-332Z-developer-tester-ticket-live-smoke.md`,
  and `ops/live-smokes/2026-06-21T17-34-50-924Z-signup-credit-email-preview-live-smoke.md`.

Intermediate caveats:

- The first standard and focused live-smoke attempts failed before authenticated
  checks because this PR worktree did not contain `OPS_USERNAME` and
  `OPS_PASSWORD`. Reruns loaded the established local BNA `.env.local` values
  into the process and passed.
- The first focused final-register smoke failed on a stale CTA marker. The
  smoke script now checks the current provider-index CTA and the rerun passed.
- The first Operations taxonomy and public-navigation smokes failed on retired
  label expectations (`Family Directory` and public Operations login nav).
  Local product tests already enforce the current behavior; the smokes were
  updated and rerun successfully.
- WS11 parent progress and student-auth audit readback smokes require a live
  database URL. Reruns loaded the Railway database URL into the process without
  printing it and passed.
- `npm run smoke:local` is still a local harness/configuration blocker
  (`spawnSync npm.cmd EINVAL` plus placeholder local `DATABASE_URL`), and
  `npm run ops:audit` is blocked by missing authenticated Playwright storage
  state. These do not block production live verification.

Focused coverage:

- Provider public/portal routes, Operations final register markers, helper
  tools, recording dry-run provenance, calendar readback, and automations
  readback passed against the deployed app.
- Final release gate did not merge PR #5 and did not run any external send,
  billing, access, Google, Zoom, Vimeo, DNS, external CRM/GHL, or secret-write
  action.
<!-- batch-19:end -->

<!-- req-313-provisioning:start -->
## REQ-20260619-313 - Separate One Time Instance Baseline

Status: pass / pre-provision freeze

Baseline before Railway provisioning:

- `node --test tests/instances/w4-onetime-instance.test.js tests/one-time-deployment-readiness.test.js`: 11/11 pass
- `npm test`: 1018/1018 pass
- `npm run bna:run:validate`: pass
- `npm run watchdog:actions`: pass, 0 findings, report
  `ops/watchdog-audits/2026-06-21T18-13-watchdog-action-audit.md`
- `npm run watchdog:security`: pass, 0 findings, report
  `ops/watchdog-audits/2026-06-21T18-13-watchdog-security-routes.md`
- `node scripts/audit-secrets.mjs`: pass, 3953 tracked paths checked, 0
  tracked secret-risk files found
- `git diff --check`: pass with line-ending warnings only

Selected deployable checkpoint is recorded in
`ops/one-time-mishnah/separate-instance-version-freeze.md`.
<!-- req-313-provisioning:end -->
