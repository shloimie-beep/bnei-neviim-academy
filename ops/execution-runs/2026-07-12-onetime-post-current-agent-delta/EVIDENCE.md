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
- Deployment:
  Railway `one-time-production / production / one-time-web` deployment
  `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8` reached `SUCCESS`.
- Live target guard:
  PASS `npm run one-time:target:guard`.
- Live smoke:
  PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`.
- SHA-pinned live smoke:
  PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c`.
- No-write note:
  a direct live intake parse was not run because it would create production
  raw-intake rows without a narrower approved/no-write synthetic live-intake
  packet.
- Separate readiness note:
  `npm run app:smoke:rabbi-onetime-landing` against the default BNA domain
  failed only on public WhatsApp readiness; that is tracked as provider
  readiness outside this One Time deployment proof.

## REQ-20260712-804

- Pre-cutover preview:
  delivery-outbox dry-run preview returned `success: true`, `dry_run: true`,
  `due_count: 0`, `processed_count: 0`, `would_send_count: 0`,
  `would_fail_count: 0`, and `external_send_performed: false`.
- Railway service:
  `one-time-delivery-cron`.
- Railway service id:
  `742f60ed-dc2f-4321-85d0-019003d4e9b9`.
- Railway deployment:
  `df89ade6-86bc-4d2e-8384-54957fb7fada`.
- Deployment status:
  `SUCCESS`; service readback shows the deployment stopped after execution,
  which is expected for a cron job with `restartPolicyType: NEVER`.
- Deployment manifest:
  `startCommand` is `node scripts/run-one-time-delivery-outbox-cron.mjs`,
  `cronSchedule` is `*/5 * * * *`, and `restartPolicyType` is `NEVER`.
- Variable readback:
  `CRON_SECRET` and `ONE_TIME_DELIVERY_OUTBOX_URL` are present on
  `one-time-delivery-cron`; secret values were not recorded.
- Railway cron logs:
  two redacted executions returned `status: 200`, `success: true`,
  `processed_count: 0`, `sent_count: 0`, `failed_count: 0`,
  `dead_lettered_count: 0`, `due_count: 0`, and
  `external_send_performed: false`.
- One Time web HTTP logs:
  delivery-outbox POSTs returned 200 during the verification window.
- Class-reminder overlap check:
  no POST entries for `/api/cron/one-time/class-reminders` appeared in the
  verification window.
- Old dispatcher automation:
  `one-time-delivery-outbox-dispatcher` was paused through `automation_update`;
  TOML readback shows `status = "PAUSED"`.
- Scope note:
  the separate daily class-reminder enqueue-and-dispatch automation remains
  active because it controls a different once-daily class-reminder workflow.

## REQ-20260712-805

- Canonical blueprint:
  `ops/product-specs/one-time/crm/contacts-inbox.v1.json`.
- Focused surface map:
  `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.md`
  and
  `ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.json`.
- Current-state inspection covered:
  `src/lib/bna/crm-contact-model.js`, `server.js`,
  `public/js/operations-shell.js`,
  `public/js/operations-deferred-renderers.js`,
  `ops/action-registry.json`, `ops/route-registry.json`, focused CRM tests,
  and local/live smoke scripts.
- Blueprint assigns source requirements to:
  `OT-CRM-01` canonical DTO/query scoping/list/pagination/performance,
  `OT-CRM-02` full contact workspace and mutations,
  `OT-CRM-03` timeline/inbox handoff/guarded composer,
  `OT-CRM-04` tasks/lifecycle pipeline/access relationships, and
  `OT-CRM-05` canonical-route browser verification/screenshots/deployment.
- Gap matrix:
  `GAP-OT-CRM-001` through `GAP-OT-CRM-009` records the blueprint as now
  satisfied, CRM list DTO/API and workbench as partially satisfied, and full
  contact workspace/mutations, inbox handoff/composer, tasks/lifecycle/access,
  isolated mutation proof, and live no-write proof as open for
  `REQ-20260712-806`/closeout.
- Verification:
  PASS JSON parse for the blueprint and surface-map JSON.
- Verification:
  PASS `node --test tests/crm-contact-model.test.js
  tests/one-time-communications-workspace.test.js
  tests/operations-contacts-intake-cleanup.test.js` 20/20.
- Verification:
  PASS `npm run pqc:validate`; report refreshed at
  `ops/product-quality-compiler/validation/latest-product-quality-validation.md`.
- Verification:
  PASS `npm run bna:run:validate` after marking `REQ-20260712-805` done;
  counts were 5 done and 2 not_started.

## REQ-20260712-806

- Server/API implementation:
  `server.js` now filters the shared CRM row builder by canonical contact key
  and exposes local-only first-party CRM create/detail/note/task/task-update/
  thread-read/draft endpoints. Every write response includes no-send/no-checkout/
  no-access/no-import and `external_write_performed: false`; the thread message
  endpoint creates a local `one_time_crm_reply_draft` with
  `guarded_outbox_required: true`, `approval_required: true`, and
  `queued: false`.
- Split-shell client implementation:
  `public/js/operations-shell.js` now has API client methods for
  `createCrmContact`, `getCrmContact`, `createCrmContactNote`,
  `createCrmContactTask`, `updateCrmTask`, `getCrmContactThreads`, and
  `draftCrmThreadMessage`.
- Registry coverage:
  `ops/route-registry.json` covers the new CRM route surface, and
  `ops/action-registry.json` covers the disabled note/task/reply preview
  controls plus local-only API actions.
- Canonical route smoke:
  `scripts/smoke-onetime-operations-crm-workbench-local.mjs` now proves only
  `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`
  and records that the server served `operations-bootstrap.html`; the
  `/operations.html` monolith route is no longer a proof target.
- Browser evidence:
  PASS `node scripts/smoke-onetime-operations-crm-workbench-local.mjs`.
  Report:
  `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`.
  Screenshots include 1440, 1024, 768, 430, and 390 widths plus the scoped
  One Time Inbox handoff.
- Cleared blocker history:
  the first local DB journey was blocked because
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` was not set. Report:
  `ops/evidence/one-time-crm-journey-local-db/2026-07-12T20-46-07-389Z-report.md`.
  A follow-up audit at
  `ops/evidence/one-time-crm-journey-local-db/2026-07-12T23-54-03-blocker-audit.md`
  confirmed no local DB URL, no Postgres tooling, no Docker, no installed
  in-process Postgres adapter, and no usable local env/secret file in the
  worktree.
- Operator-approved Railway test DB:
  created isolated Railway environment `crm-test`
  (`2a9b61fa-6d88-4405-b6d6-0120ff7f461f`) and Postgres service
  `Postgres-ib9s` (`ebbb512e-3d27-44e1-a85b-4be3871a6b2f`) for test-only CRM
  proof. The DB URL was used from Railway variables and was not printed or
  committed.
- Railway test DB guard:
  `scripts/smoke-onetime-crm-journey-local-db.mjs` now allows Railway-hosted
  DBs only when explicit remote-test and Railway-test flags are set and the
  Railway environment name is test-like. Production `DATABASE_URL` remains
  ignored.
- Isolated mutation/reload proof:
  PASS `node scripts/smoke-onetime-crm-journey-local-db.mjs` against Railway
  `crm-test` Postgres. Report:
  `ops/evidence/one-time-crm-journey-local-db/2026-07-13T03-31-54-271Z-report.md`.
  Screenshot:
  `ops/evidence/one-time-crm-journey-local-db/2026-07-13T03-31-54-271Z-crm-mailbox-roundtrip.png`.
- Deployment:
  Railway `one-time-production / production / one-time-web` deployment
  `3ea1e251-67aa-4137-85cc-82d38437ab8d` reached `SUCCESS` for commit
  `467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`.
- Live proof:
  PASS `npm run one-time:target:guard`.
- SHA-pinned live smoke:
  PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`.
- Read-only CRM live smoke:
  PASS `npm run app:smoke:onetime-operations-crm-workbench`. Report:
  `ops/live-smokes/2026-07-13T03-42-40-981Z-one-time-operations-crm-workbench-live-smoke.md`.
  The smoke recorded counts/guard flags only and did not save contact data,
  raw message bodies, screenshots, sends, payments, access grants, or external
  CRM writes.

## REQ-20260712-807

- Scoped commit:
  `467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8` on
  `codex/onetime-post-agent-delta-20260712-v3`.
- Push:
  `origin/codex/onetime-post-agent-delta-20260712-v3` updated to
  `467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`.
- Deployment:
  Railway deployment `3ea1e251-67aa-4137-85cc-82d38437ab8d` reached
  `SUCCESS` on `one-time-production / production / one-time-web`.
- Target guard:
  PASS `npm run one-time:target:guard`.
- Live smoke:
  PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`.
- CRM live smoke:
  PASS `npm run app:smoke:onetime-operations-crm-workbench`.
- Watchdogs/validators:
  PASS `npm run watchdog:actions`; PASS `npm run pqc:validate`; PASS
  `npm run watchdog:protocol-drift`; PASS `npm run audit:governance` with
  broad pre-existing audit mapping debt still reported.
