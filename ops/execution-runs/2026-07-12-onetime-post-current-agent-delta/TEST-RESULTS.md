# Test Results

Current as of 2026-07-12T22:46:00+03:00.

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
