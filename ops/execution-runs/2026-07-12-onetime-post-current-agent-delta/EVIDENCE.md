# Evidence

## REQ-20260712-801

- Raw source:
  `raw-input/RAW-20260712-013-onetime-post-current-agent-delta.txt`
- Requirement register:
  `tasks-pending/2026-07-12-onetime-post-current-agent-delta.md`
- Execution run:
  `ops/execution-runs/2026-07-12-onetime-post-current-agent-delta/`
- Git fetch/status/log/head/origin checks performed before implementation.
- Isolated base commit:
  `593b85c7ffe975dc5eff6f38b684f375385952dc`
- Live deploy-info readback:
  `48c52797b2b8354de31f29aa87c1b95307967900` on
  `https://join.onetimeonetime.com`.
- Run validation passed after status normalization:
  `npm run bna:run:validate`.

## REQ-20260712-803

- Runner:
  `scripts/run-one-time-delivery-outbox-cron.mjs`
- Railway cron config:
  `railway.one-time-delivery-cron.json`
- Package command:
  `npm run one-time:delivery-outbox:cron`
- Env example:
  `.env.example` documents
  `ONE_TIME_DELIVERY_OUTBOX_URL=https://join.onetimeonetime.com/api/cron/one-time/delivery-outbox`.
- Focused test:
  `tests/one-time-delivery-outbox-cron.test.js`
- Runner behavior verified locally:
  requires `CRON_SECRET` before fetch; posts only
  `/api/cron/one-time/delivery-outbox`; sends body
  `{"dry_run":false,"limit":25}`; aborts after timeout; fails nonzero for
  missing config, non-2xx, invalid JSON, and `success=false`; prints only
  redacted allowed status/counter fields; never calls class-reminders.
- Verification:
  PASS `node --check scripts/run-one-time-delivery-outbox-cron.mjs`.
- Verification:
  PASS `node --test tests/one-time-delivery-outbox-cron.test.js` 6/6.
- Verification:
  PASS `node --test tests/one-time-delivery-outbox.test.js` 5/5.
- Verification:
  PASS JSON parse for `package.json` and
  `railway.one-time-delivery-cron.json`.

## REQ-20260712-802

- Shared service:
  `src/platform/ingestion/operator-ramble-service.js`
- Focused tests:
  `tests/ingestion/operator-ramble-service.test.js`
  and `tests/ingestion/ramble-regression-suite.test.js`
- Watchdog report:
  `ops/watchdog-audits/2026-07-12-product-quality-drift.md`
- Implemented local hardening:
  nontrivial operator rambles require validated structured compilation before
  implementation jobs materialize; invalid/unavailable compilation leaves rows
  `specification_pending`; validated compilation still materializes jobs;
  Telegram/raw message parts reconstruct before statement mapping; source
  reconstruction and honest status receipts are emitted.
- Verification:
  PASS `node --check src/platform/ingestion/operator-ramble-service.js`.
- Verification:
  PASS `node --test tests/ingestion/operator-ramble-service.test.js
  tests/ingestion/ramble-regression-suite.test.js
  tests/ingestion/w3-intake-service.test.js` 16/16.
- Verification:
  PASS `node --test tests/chatgpt-dropoff-ingestor.test.js
  tests/one-time-intake-api-readback.test.js` 10/10.
- Verification:
  PASS `node --test tests/ramble-protocol-hardening.test.js
  tests/watchdog-raw-intake-drift.test.js` 4/4.
- Verification:
  PASS `npm run watchdog:protocol-drift` with 0 findings.
- Local dependency note:
  after rebasing onto `22cc6b88b`, `npm install` was required in this isolated
  worktree because upstream added the declared `compression` dependency.

## Pending Evidence

- `REQ-20260712-802`: production deploy/live-smoke proof for the server-visible
  ramble-to-done change.
- `REQ-20260712-804`: Railway cron service readback, redacted execution proof,
  scheduler overlap proof, Codex dispatcher automation disablement proof.
- `REQ-20260712-805` / `REQ-20260712-806`: CRM blueprint/gap matrix and
  canonical-route browser proof.
- `REQ-20260712-807`: commit/push/deploy/live-smoke evidence.
