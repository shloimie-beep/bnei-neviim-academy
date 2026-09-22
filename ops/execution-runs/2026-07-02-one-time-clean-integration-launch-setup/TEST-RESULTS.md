# Test Results

## Passed

- `node --check scripts/check-onetime-external-setup-readiness.mjs`
- `node --check scripts/provision-onetime-railway-instance.mjs`
- `node --test tests/one-time-external-setup-readiness.test.js`
- `node --test tests/one-time-external-setup-readiness.test.js tests/one-time-separate-instance-package.test.js tests/railway-target-guard.test.js`
- `npm run one-time:railway-provision:check -- --write-report`
- `npm run one-time:db:bootstrap`
- `npm run bna:run:status`
- `npm run bna:run:validate`
- `npm run bna:run:source-coverage`
- `npm run bna:run:stale-evidence`
- `npm run pqc:all`
- `npm run secrets:audit`
- `git diff --check`
- JSON validation for changed JSON files.

## Expected Blocked

- `npm run one-time:setup:check -- --write-report` exited `1` because the
  external setup checker reports `0/8` setup areas ready.
- `npm run one-time:railway-target:guard` exited `1` because separate One Time
  Railway target labels and required non-secret env values are not present yet.

Both blocked commands performed no external write, DNS mutation, email send,
WhatsApp send, provider mutation, live payment, secret printing, or hard delete.
