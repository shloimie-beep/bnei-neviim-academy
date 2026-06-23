# Test Results

## Passed

- `npm ci`: PASS.
- `npm test`: PASS, 1066/1066.
- `node --check scripts/system-truth.mjs`: PASS.
- `node --check scripts/intake-github.mjs`: PASS.
- `node --check scripts/agent-fleet-supervisor.mjs`: PASS.
- `node --check scripts/bna-execution-run.mjs`: PASS.
- `node --check server.js`: PASS.
- `node --test tests/system-truth-scripts.test.js tests/observable-codex-queue.test.js`:
  PASS, 7/7.
- `npm run bna:run:validate`: PASS.
- `npm run bna:run:source-coverage`: PASS.
- `npm run system:truth`: PASS.
- `npm run worktree:truth`: PASS.
- `npm run source:truth`: PASS.
- `npm run asset:truth`: PASS.
- `npm run drive:intake:truth`: PASS.
- `npm run ui:source-coverage`: PASS.
- `npm run intake:github -- --issue 7 --dry-run`: PASS.
- `npm run intake:github -- --issue 8 --dry-run`: PASS.
- `npm run watchdog:actions`: PASS, findings 0.
- `npm run watchdog:security`: PASS, findings 0.
- `node scripts/audit-secrets.mjs`: PASS.
- `git diff --check`: PASS with line-ending warnings only.

## Not Cleared

- `npm audit --audit-level=high`: FAILS on existing dependency advisories:
  24 vulnerabilities total, including 6 high. The suggested full fix requires
  breaking `--force` dependency changes through Lighthouse/Remotion and was not
  applied in this safe reconciliation batch.
