# Test Results

## Batch 0 Preflight

- PASS `npm run bna:run:status` against the previous latest run.
- PASS `npm run bna:run:validate` against the previous latest run.
- PASS `node scripts/audit-secrets.mjs`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`; report:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`.
- PASS `npm run bna:run:status` against the successor run.
- PASS `npm run bna:run:validate` against the successor run.

## Batch 1 Protocol Repair

- PASS `node --check scripts/bna-execution-run.mjs`.
- PASS `node --check src/lib/bna/intake-schema.js`.
- PASS `node --test tests/bna-execution-run.test.js` (23/23).
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:next`.
- PASS `npm run bna:run:blockers`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`.
- PASS `git diff --check` with LF/CRLF warnings only.
- PASS `node scripts/audit-secrets.mjs` with 0 tracked secret-risk files.

<!-- batch-2:start -->
## Batch 2 Test Results

Recorded after focused verification:

- PASS `node --check scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node scripts/generate-one-time-master-completion-reconciliation.mjs`
- PASS `node --test tests/one-time-master-backlog-reconciliation.test.js tests/rabbi-scheller-meeting-reconciliation.test.js`
- PASS `npm run bna:run:validate`
- PASS `npm run bna:run:source-coverage`
- PASS `git diff --check` with line-ending warnings only where reported by Git
- PASS `node scripts/audit-secrets.mjs`
<!-- batch-2:end -->
