# Next Session

Current worktree:
`C:\Users\User\BNA-onetime-post-agent-delta-20260712`

Current branch:
`codex/onetime-post-agent-delta-20260712-v3`

Current run:
`ops/execution-runs/2026-07-12-onetime-post-current-agent-delta/`

Current completed batches:

- `REQ-20260712-803`: done and pushed on the runner branch.
- `REQ-20260712-802`: done, deployed to One Time Railway deployment
  `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8`, and live-smoked with commit
  `f0376e4539c31d80f917c90241bbffd91ee9c57c`.
- `REQ-20260712-804`: done. Separate Railway cron service
  `one-time-delivery-cron` (`742f60ed-dc2f-4321-85d0-019003d4e9b9`) deployed
  as `df89ade6-86bc-4d2e-8384-54957fb7fada`, produced two redacted zero-due
  executions, and the old Codex dispatcher automation is paused.
- `REQ-20260712-805`: done. Canonical CRM Contacts/Inbox blueprint exists at
  `ops/product-specs/one-time/crm/contacts-inbox.v1.json`; focused surface map
  exists under
  `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.*`;
  JSON parse, focused CRM/inbox tests, and `npm run pqc:validate` passed.
- `REQ-20260712-806`: blocked after safe implementation. The branch adds
  scoped local-only CRM create/detail/note/task/task-update/thread/draft
  endpoints, split-shell client methods, route/action registry rows, and
  canonical `/operations` browser proof. The blocker is isolated mutation/reload
  proof: set `BNA_ONETIME_CRM_TEST_DATABASE_URL` to a local/test Postgres URL,
  then rerun `node scripts/smoke-onetime-crm-journey-local-db.mjs`.

Next requirements:

- `REQ-20260712-807`: final closeout remains blocked on the isolated DB journey
  unless the operator explicitly accepts local-only blocked closeout. Do not
  deploy the CRM API/UI delta until mutation/reload proof passes or the deploy
  gate is intentionally overridden with an owner decision.

Resume commands:

```bash
git status --short --branch
npm run bna:run:validate
npm run bna:run:next
node --check scripts/run-one-time-delivery-outbox-cron.mjs
node --test tests/one-time-delivery-outbox-cron.test.js
node --test tests/one-time-delivery-outbox.test.js
node --test tests/ingestion/operator-ramble-service.test.js tests/ingestion/ramble-regression-suite.test.js tests/ingestion/w3-intake-service.test.js
npm run one-time:target:guard
npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c
node -e "JSON.parse(require('fs').readFileSync('ops/product-specs/one-time/crm/contacts-inbox.v1.json','utf8')); JSON.parse(require('fs').readFileSync('ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.json','utf8'))"
node --test tests/crm-contact-model.test.js tests/one-time-communications-workspace.test.js tests/operations-contacts-intake-cleanup.test.js
npm run pqc:validate
node --check server.js
node --check public/js/operations-shell.js
node --test tests/service-provider-scope-routes.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/crm-contact-model.test.js
node scripts/smoke-onetime-operations-crm-workbench-local.mjs
node scripts/smoke-onetime-crm-journey-local-db.mjs
npm run watchdog:actions
```

Do not resume
`C:\Users\User\BNA-onetime-p0p1-corrective-20260711`.

Do not send messages, enqueue separate class reminders, import production
contacts, charge/refund, grant access, mutate DNS/accounts/credentials, expose
secrets, or write external providers outside the exact approved release/cutover
scope.
