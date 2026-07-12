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
  PASS: 30 tests, 30 passed.
- `npm run test:onetime:focused` PASS: 53 tests, 53 passed.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run bna:run:validate` PASS.

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
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` is missing, so the required real
  local/test Postgres persistence journey was not run.
- `npm run watchdog:actions` PASS: finding_count 0.
- `npm run watchdog:protocol-drift` PASS.
- `npm run secrets:audit` PASS.
- `npm run bna:run:validate` PASS after REQ-005 was marked blocked with the
  exact local/test DB credential blocker.

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
