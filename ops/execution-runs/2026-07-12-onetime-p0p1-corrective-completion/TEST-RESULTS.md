# Test Results

Pre-implementation checks already run:

- `git fetch origin codex/onetime-p0p1-corrective-20260711 master pull/129/head:refs/remotes/origin/pr/129`
- `git rev-parse origin/codex/onetime-p0p1-corrective-20260711`
  -> `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- `git rev-parse origin/pr/129`
  -> `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`
- `git rev-parse origin/master`
  -> `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a`
- `gh pr view 129 --repo shloimie-beep/bnei-neviim-academy --json ...`
  -> open draft PR, mergeable, head
  `ee264c5a4b8329719b5420ffb6f99ccae93e1a60`.
- `npm run chatgpt:dropoff:tower`
  -> no ready packets, clean PR-lane worktree, one draft packet still using
  `codex_done` status.

Next test gate:

- `npm run bna:run:validate`
- `npm run bna:run:next`

Implementation tests will be recorded after each batch.

REQ-20260712-002 local gate:

- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run operations:build` PASS; generated asset diff clean.
- `npm run test:onetime:focused` PASS: 42 tests, 42 passed.
- `npm run secrets:audit` PASS: 8315 tracked paths checked, 0 tracked
  secret-risk files found.
- `git push origin codex/onetime-p0p1-corrective-20260711` BLOCKED when
  `.github/workflows/onetime-corrective.yml` was included: GitHub refused the
  workflow update because the OAuth App lacks `workflow` scope.

REQ-20260712-013 local gate:

- `node --check server.js` PASS.
- `node --check public/js/bna-bot-widget.js` PASS.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-brand-helper-isolation.test.js tests/one-time-signup-reminder-workflow.test.js`
  PASS: 33 tests, 33 passed.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js`
  PASS: 12 tests, 12 passed. This covers the latest required-marker correction:
  no optional-style phone copy, phone dot/hint hidden before WhatsApp, phone
  dot/hint visible after WhatsApp, required reminder/location checkbox, and no
  preselected reminder option.
- `node --test tests/one-time-signup-reminder-workflow.test.js` PASS: 10
  tests, 10 passed. The refreshed suite now also asserts the dedicated reminder
  path has paused/canceled class suppression and email unsubscribe, WhatsApp
  STOP, and wrong-number guardrails.
- Requirement matrix added:
  `ops/evidence/one-time-signup-reminder/2026-07-12/REQUIREMENT-MATRIX.md`.
- `node --test tests/one-time-focused-landing.test.js tests/one-time-signup-reminder-workflow.test.js`
  PASS: 12 tests, 12 passed.
- `node --test tests/one-time-signup-reminder-workflow.test.js` PASS: 10
  tests, 10 passed.
- `npm run test:onetime:focused` PASS: 57 tests, 57 passed.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run bna:run:validate` PASS.

REQ-20260712-013 required-marker rerun:

- `node --test tests/one-time-direct-signup-page.test.js` PASS: 2 tests, 2
  passed. The browser proof now asserts the acknowledgement checkbox is
  required, not prechecked, mentions selected city and reminders, and that the
  phone marker/hint stays hidden until WhatsApp is selected.
- Local Playwright visual smoke for `/one-time/signup` PASS at 1440, 1024,
  768, 430, and 390 widths; refreshed
  `ops/evidence/one-time-signup-reminder/2026-07-12/visual-smoke.json` records
  six visible required dots, no visible optional-phone wording, and no
  horizontal overflow.
- `npm run test:onetime:focused` PASS: 62 tests, 62 passed.
- `node --test tests/one-time-product-system.test.js` PASS: 8 tests, 8
  passed.

Readiness/no-send rerun:

- `node --check scripts/check-onetime-external-setup-readiness.mjs` PASS.
- `node --test tests/one-time-external-setup-readiness.test.js` PASS: 8
  tests, 8 passed.
- `npm run one-time:railway-target:guard` PASS. Redacted readback reported no
  external write, provider mutation, DNS mutation, email send, WhatsApp send,
  payment, or secret value print.
- `npm run one-time:setup:check` BLOCKED as expected for full setup:
  ready_count 5/8, blocked on Rabbi Stripe sandbox, Whapi/WAPI provider
  details, and campaign seed/real campaign details. Redacted hosted readback
  also shows the class-reminder scheduler is not hosted-ready yet because
  `ONE_TIME_CLASS_REMINDERS_ENABLED`, `ONE_TIME_CLASS_REMINDERS_CONFIRM`, and
  `CRON_SECRET` are not present/approved in the hosted config.
- JSON evidence integrity check PASS for `requirements.json` and
  `ops/agent-task-ledger.jsonl`.
- `npm run bna:run:validate` PASS; work remains by design.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS and refreshed
  `ops/watchdog-audits/2026-07-12-product-quality-drift.*`.
- `npm run secrets:audit` PASS: 8363 tracked paths checked, 0 tracked
  secret-risk files found.
- `npm run bna:run:next` PASS: no next unblocked executable batch.

REQ-20260712-010 / REQ-20260712-023 matrix refresh:

- `ops/evidence/one-time-signup-reminder/2026-07-12/REQUIREMENT-MATRIX.md`
  added.
- `node --test tests/one-time-signup-reminder-workflow.test.js` PASS: 10
  tests, 10 passed, including paused/canceled class suppression and
  unsubscribe/STOP/wrong-number guardrail assertions.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js`
  PASS: 12 tests, 12 passed.
- `node --check scripts/simulate-one-time-class-reminder.mjs` PASS.
- `node --test tests/one-time-reminder-simulation-command.test.js` PASS: 4
  tests, 4 passed.
- `node --test tests/one-time-reminder-simulation-command.test.js tests/one-time-signup-reminder-workflow.test.js tests/one-time-direct-signup-page.test.js`
  PASS: 16 tests, 16 passed.
- `npm run test:onetime:focused` PASS: 62 tests, 62 passed, including the
  guarded single-recipient reminder simulation command.
- JSON evidence integrity check PASS for `requirements.json` and
  `ops/agent-task-ledger.jsonl`.
- `npm run bna:run:validate` PASS after recording the current PR-lane evidence
  commit in `git_refs.last_validated_head`.

REQ-20260712-006 local gate:

- `node --check server.js` PASS.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-onboarding-intake.test.js`
  PASS: 6 tests, 6 passed.
- `npm run test:onetime:focused` PASS: 62 tests, 62 passed.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS and refreshed
  `ops/watchdog-audits/2026-07-12-product-quality-drift.*`.
- `npm run secrets:audit` PASS: 8373 tracked paths checked, 0 tracked
  secret-risk files found.
- `npm run bna:run:validate` PASS: counts verified 4, blocked 2,
  needs_operator_decision 10, in_progress 7; work remains by design.
- `npm run bna:run:next` PASS: no next unblocked executable batch.
- `public/one-time/signup.html` stores exact product/CRM IDs and attribution
  returned by `/api/one-time/interest` without requesting a student name in the
  first signup.
- `public/one-time-preview.html` blocks missing IDs, requires Family
  learner/stage fields and School name/role fields, and posts attribution plus
  `original_capture`.
- `server.js` verifies `bna_product_leads` and `bna_parent_leads` are linked by
  CRM metadata `product_lead_id` before local no-send onboarding writes.
- `node --check scripts/smoke-one-time-personal-continuation-live.mjs` PASS.
- `npm run app:smoke:one-time-personal-continuation` PASS using runtime-only
  operator personal contact input and redacted evidence. Family and School
  direct signup/continuation linkage, DB readback, Operations CRM readback, and
  cleanup readback all passed.

Execution-run validator repair:

- `node --check scripts/bna-execution-run.mjs` PASS.
- `node --test tests/bna-execution-run.test.js` PASS: 27 tests, 27 passed.
- `npm run bna:run:next` PASS. The active One Time run validates again and
  reports `Next unblocked executable batch: none`.

Pre-merge release gate:

- `node --check server.js` PASS.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run secrets:audit` PASS.
- `npm run watchdog:actions` PASS.
- `npm run watchdog:protocol-drift` PASS.
- `node --test tests/release-captain.test.js` PASS: 6 tests, 6 passed.
- `npm run test:onetime:focused` PASS: 67 tests, 67 passed.

Post-merge smoke-harness fix gate:

- `node --check server.js` PASS.
- `node --check scripts/smoke-onetime-separate-instance-live.mjs` PASS.
- `node --check scripts/smoke-rabbi-onetime-landing-live.mjs` PASS.
- `npm run bna:release-gate -- --allow-detached --remote-branch master` PASS.
- `npm run one-time:railway-target:guard` PASS with redacted target readback.
- `npm run secrets:audit` PASS.

Live production smoke:

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha fc147ded1ee0e12325111382fa8e460134a8ce3d`
  PASS.
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
  PASS.
- `npm run app:smoke:one-time-personal-continuation` PASS.
- Direct `/api/deploy-info` readback returned HTTP 200 with
  `commit_sha` = `fc147ded1ee0e12325111382fa8e460134a8ce3d` and
  deployment target `one-time-production / one-time-web`.

No external send, payment/charge/refund, access grant, historical import,
DNS/account mutation, credential mutation, or external-provider write was
performed during these tests.
- Validator now accepts a recorded `git_refs.current_head` when it is listed in
  `existing_corrective_commits` and is an ancestor of the current branch head,
  preventing committed run-head bookkeeping from becoming immediately stale.

REQ-20260712-005 local gate:

- `node --check server.js` PASS.
- `node --check public/js/operations-shell.js` PASS.
- `node --check public/js/operations-deferred-renderers.js` PASS.
- `node --check scripts/smoke-onetime-crm-journey-local-db.mjs` PASS.
- `node --test tests/crm-contact-model.test.js tests/service-provider-scope-routes.test.js`
  PASS: 10 tests, 10 passed.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run test:onetime:focused` PASS: 54 tests, 54 passed.
- `npm run one-time:smoke:operations-crm-workbench-local` PASS:
  layout/API journey and responsive screenshots written under
  `ops/evidence/one-time-crm-journey/2026-07-12/`.
- `npm run one-time:smoke:crm-journey-local-db` BLOCKED:
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` is missing, so the local/test Postgres
  persistence journey was not run. This was later superseded for terminal
  CRM proof by the approved production fake-contact smoke with cleanup.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.
- `npm run app:smoke:one-time-interest-crm-e2e` later PASS after operator
  approval for production fake-contact proof, with synthetic lead archive and
  fake task deletion.

REQ-20260712-008 local gate:

- `node --check src/platform/ingestion/operator-ramble-service.js` PASS.
- `node --check server.js` PASS.
- `node --check scripts/chatgpt-dropoff-ingestor.mjs` PASS.
- `node --test tests/ingestion/*.test.js tests/chatgpt-dropoff-ingestor.test.js tests/telegram-ramble-routing-regression.test.js tests/ramble-protocol-hardening.test.js tests/watchdog-raw-intake-drift.test.js tests/one-time-intake-api-readback.test.js`
  PASS: 56 tests, 56 passed.
- `node --test tests/ingestion/operator-ramble-service.test.js tests/chatgpt-dropoff-ingestor.test.js tests/one-time-intake-api-readback.test.js tests/watchdog-raw-intake-drift.test.js`
  PASS: 15 tests, 15 passed.
- `npm run test:onetime:focused` PASS: 54 tests, 54 passed.
- `npm run chatgpt:dropoff:tower` PASS and regenerated control tower files.
- `npm run watchdog:raw` PASS: finding_count 0.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.
- `npm run bna:run:validate` PASS.

REQ-20260712-008 / REQ-20260712-009 final local regression pass:

- `node --check src/platform/ingestion/operator-ramble-service.js` PASS.
- `node --check src/platform/ingestion/packet-status.js` PASS.
- `node --check server.js` PASS.
- `node --check scripts/chatgpt-dropoff-ingestor.mjs` PASS.
- `node --check scripts/chatgpt-dropoff-control-tower.mjs` PASS.
- `node --test tests/ingestion/operator-ramble-service.test.js` PASS: 6 tests,
  6 passed.
- `node --test tests/ingestion/ramble-regression-suite.test.js` PASS: 4 tests,
  4 passed.
- `node --test tests/ingestion/ramble-regression-suite.test.js tests/ingestion/operator-ramble-service.test.js tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-intake-persistence.test.js tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-control-tower.test.js tests/one-time-intake-api-readback.test.js tests/watchdog-raw-intake-drift.test.js`
  PASS: 41 tests, 41 passed.
- `node --test tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-control-tower.test.js tests/one-time-intake-api-readback.test.js`
  PASS: 12 tests, 12 passed.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run test:onetime:focused` PASS: 54 tests, 54 passed.
- `npm run watchdog:raw` PASS: finding_count 0.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.
- `npm run bna:run:validate` PASS; work remains by design because release,
  deployment/live-smoke, CRM local/test DB proof, and remaining UI/onboarding
  batches are still open.

REQ-20260712-007 local landing / Robot gate:

- `node --test tests/one-time-focused-landing.test.js` PASS: 2 tests, 2
  passed.
- `npm run test:onetime:focused` PASS: 57 tests, 57 passed.
- `npm run operations:build` PASS.
- `npm run operations:check-generated` PASS.
- `npm run operations:check-canonical` PASS.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS:
  `ops/watchdog-audits/2026-07-12-product-quality-drift.md`.
- `npm run secrets:audit` PASS: 8363 tracked paths checked, 0 tracked
  secret-risk files found.
- `npm run bna:run:validate` PASS; work remains by design because release,
  deployment/live-smoke, CRM local/test DB proof, and dependent work are still
  open.
- Playwright local Express-route screenshot proof PASS for `/one-time` in
  `ONE_TIME_REVIEW_ONLY_NO_DB=1` mode at 1440, 768, 430, and 390 widths.
  Robot launcher bounding boxes: 84x84 at 1440/768 and 76x76 at 430/390;
  accessible label: `Open Rabbi Scheller’s WhatsApp assistant.`; console
  warnings/errors: none.

2026-07-12 post-dispatcher deploy and direct-signup smoke refresh:

- `GET https://join.onetimeonetime.com/api/deploy-info` PASS:
  `commit_sha` = `fc147ded1ee0e12325111382fa8e460134a8ce3d`, target
  `one-time-production / one-time-web`.
- `POST https://join.onetimeonetime.com/api/cron/one-time/delivery-outbox`
  without `CRON_SECRET` returned HTTP 503; no delivery was attempted.
- `npm run app:smoke:one-time-interest-dry-run` PASS after updating the smoke
  to inspect `/one-time/signup` instead of the retired landing modal.
- The dry-run smoke proved the direct form has required red markers, a
  required location/reminder acknowledgement checkbox, no visible
  phone-optional copy, no preselected reminder, and no student field.
- The dry-run API payload used `.invalid` email, `reminder_preference=email`,
  no phone number, and `source_landing_page=/one-time/signup`; the response
  stayed `dry_run=true`, `external_write_performed=false`, and previewed email
  confirmation plus Rabbi Telegram outbox rows without WhatsApp or raw Zoom URL
  leakage.
- `node --check src/lib/bna/one-time-operator-test-handoff.js` PASS.
- `node --check scripts/one-time-operator-test-handoff.mjs` PASS.
- `node --check scripts/smoke-one-time-interest-dry-run-live.mjs` PASS.
- `node --test tests/one-time-operator-test-handoff.test.js
  tests/one-time-signup-reminder-workflow.test.js
  tests/one-time-delivery-outbox.test.js` PASS: 20/20.
- `node scripts/one-time-operator-test-handoff.mjs --json` remains blocked as
  expected: deployment is now true, but CI, WAPI, Telegram, and scheduler/
  `CRON_SECRET` readiness are false; `ready_message_suppressed=true`.
- `npm run one-time:setup:check` remains blocked with no external writes or
  secret values printed. Redacted Railway readback shows class reminders are
  not enabled/approved, `CRON_SECRET` is missing, and One Time WAPI token,
  instance, and phone readiness are not present.

No email, WhatsApp/WAPI, Telegram, campaign send, payment/charge/refund, CRM
production mutation, access grant, local-class activation, DNS/account
mutation, credential mutation, or external-provider write was performed.
