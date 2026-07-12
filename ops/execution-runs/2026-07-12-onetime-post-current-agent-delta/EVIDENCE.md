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

## Pending Evidence

- `REQ-20260712-804`: Railway cron service readback, redacted execution proof,
  scheduler overlap proof, Codex dispatcher automation disablement proof.
- `REQ-20260712-805` / `REQ-20260712-806`: CRM blueprint/gap matrix and
  canonical-route browser proof.
- `REQ-20260712-807`: commit/push/deploy/live-smoke evidence.
