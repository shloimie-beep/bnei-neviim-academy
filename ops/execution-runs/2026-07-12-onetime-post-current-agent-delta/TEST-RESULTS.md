# Test Results

Current as of 2026-07-12T22:35:00+03:00.

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
