# Test Results

Current as of 2026-07-12T23:58:00+03:00.

## REQ-20260712-803

```bash
node --check scripts/run-one-time-delivery-outbox-cron.mjs
```

Result: PASS.

```bash
node --test tests/one-time-delivery-outbox-cron.test.js
```

Result: PASS, 6/6.

```bash
node --test tests/one-time-delivery-outbox.test.js
```

Result: PASS, 5/5.

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('railway.one-time-delivery-cron.json','utf8'))"
```

Result: PASS.

## Run Validation

```bash
npm run bna:run:validate
```

Result: PASS after the runner evidence/status refresh.

## REQ-20260712-802

```bash
node --check src/platform/ingestion/operator-ramble-service.js
```

Result: PASS.

```bash
node --test tests/ingestion/operator-ramble-service.test.js tests/ingestion/ramble-regression-suite.test.js tests/ingestion/w3-intake-service.test.js
```

Result: PASS, 16/16.

```bash
node --test tests/chatgpt-dropoff-ingestor.test.js tests/one-time-intake-api-readback.test.js
```

Result: PASS, 10/10.

```bash
node --test tests/ramble-protocol-hardening.test.js tests/watchdog-raw-intake-drift.test.js
```

Result: PASS, 4/4.

```bash
npm run watchdog:protocol-drift
```

Result: PASS, 0 findings.

```bash
npm run one-time:target:guard
```

Result: PASS after deployment.

```bash
npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c
```

Result: PASS. `/api/deploy-info` confirmed commit
`f0376e4539c31d80f917c90241bbffd91ee9c57c` on the One Time target.

```bash
npm run app:smoke:rabbi-onetime-landing
```

Result: FAIL only on public WhatsApp readiness for the default BNA `/rabbi`
surface. This was not a blocker for `REQ-20260712-802` because the scoped
deployment target was `join.onetimeonetime.com` and the failure is a separate
provider-readiness gate.

## REQ-20260712-804

```powershell
delivery-outbox dry-run preview
```

Result: PASS. `due_count=0`, `would_send_count=0`, and
`external_send_performed=false`.

```powershell
railway service status --service one-time-delivery-cron --environment production
```

Result: PASS. Deployment `df89ade6-86bc-4d2e-8384-54957fb7fada` reached
`SUCCESS`; subsequent service status is `STOPPED`, expected for a cron job
after execution.

```powershell
railway status --json
```

Result: PASS. Deployment manifest has `cronSchedule=*/5 * * * *`,
`startCommand=node scripts/run-one-time-delivery-outbox-cron.mjs`, and
`restartPolicyType=NEVER`.

```powershell
railway logs --service one-time-delivery-cron --environment production --lines 80
```

Result: PASS. Two redacted executions returned `status=200`, `success=true`,
`processed_count=0`, `due_count=0`, and `external_send_performed=false`.

```powershell
railway logs --service one-time-web --environment production --http --method POST --path /api/cron/one-time/class-reminders --since 30m --lines 20 --json
```

Result: PASS. No matching class-reminders POST logs returned in the
verification window.

```powershell
Get-Content C:\Users\User\.codex\automations\one-time-delivery-outbox-dispatcher\automation.toml
```

Result: PASS. `status = "PAUSED"` after `automation_update`.

## REQ-20260712-805

```bash
node -e "JSON.parse(require('fs').readFileSync('ops/product-specs/one-time/crm/contacts-inbox.v1.json','utf8')); JSON.parse(require('fs').readFileSync('ops/surface-maps/2026-07-12-one-time-crm-contacts-inbox-surface-map.json','utf8')); console.log('json ok')"
```

Result: PASS.

```bash
node --test tests/crm-contact-model.test.js tests/one-time-communications-workspace.test.js tests/operations-contacts-intake-cleanup.test.js
```

Result: PASS, 20/20.

```bash
npm run pqc:validate
```

Result: PASS. Product Quality Compiler validation report refreshed at
`ops/product-quality-compiler/validation/latest-product-quality-validation.md`.

```bash
npm run bna:run:validate
```

Result: PASS, with 5 done and 2 not_started requirements.

## REQ-20260712-806

```bash
node --check server.js
```

Result: PASS.

```bash
node --check public/js/operations-shell.js
```

Result: PASS.

```bash
node -e "JSON.parse(require('fs').readFileSync('ops/action-registry.json','utf8')); JSON.parse(require('fs').readFileSync('ops/route-registry.json','utf8')); console.log('registry json ok')"
```

Result: PASS.

```bash
node --test tests/service-provider-scope-routes.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js tests/crm-contact-model.test.js
```

Result: PASS, 18/18.

```bash
node --test tests/crm-contact-model.test.js tests/one-time-communications-workspace.test.js tests/operations-contacts-intake-cleanup.test.js tests/service-provider-scope-routes.test.js tests/rabbi-scheller-tenant-isolation-contract.test.js
```

Result: PASS, 28/28.

```bash
node scripts/smoke-onetime-operations-crm-workbench-local.mjs
```

Result: PASS. Report:
`ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`.

```bash
node scripts/smoke-onetime-crm-journey-local-db.mjs
```

Result: BLOCKED. The script requires `BNA_ONETIME_CRM_TEST_DATABASE_URL` and
intentionally ignores production `DATABASE_URL`. Report:
`ops/evidence/one-time-crm-journey-local-db/2026-07-12T20-46-07-389Z-report.md`.

```powershell
where.exe psql; where.exe initdb; where.exe pg_ctl; where.exe docker
```

Result: BLOCKED. None of those tools are available in this shell.

```bash
node -e "for (const name of ['pg-mem','@electric-sql/pglite','postgres','better-sqlite3']) { try { require.resolve(name); console.log(name+':found') } catch { console.log(name+':not_found') } }"
```

Result: BLOCKED. No in-process Postgres-compatible adapter is installed.

Blocker audit report:
`ops/evidence/one-time-crm-journey-local-db/2026-07-12T23-54-03-blocker-audit.md`.

```bash
npm run watchdog:actions
```

Result: PASS, 0 findings. Report:
`ops/watchdog-audits/2026-07-12T20-46-watchdog-action-audit.md`.

```bash
npm run watchdog:protocol-drift
```

Result: PASS, 0 findings. Report:
`ops/watchdog-audits/2026-07-12-product-quality-drift.md`.

```bash
npm run pqc:validate
```

Result: PASS, 77 passed and 0 failed. Report:
`ops/product-quality-compiler/validation/latest-product-quality-validation.md`.

```bash
npm run bna:run:validate
```

Result: PASS, with 5 done, 1 blocked, and 1 not_started requirement.

```bash
node --test tests/one-time-crm-live-smoke-contract.test.js tests/operations-saas-crm-redesign.test.js
```

Result: FAIL on a legacy `tests/operations-saas-crm-redesign.test.js`
assertion for the monolith `public/operations.html` placeholder text
`Detailed token, model, cost, budget, and export controls need backend
metering`. `public/operations.html` has no diff in this branch; this failure is
recorded as an unrelated residual contract failure, not proof against the
split-shell CRM slice.
