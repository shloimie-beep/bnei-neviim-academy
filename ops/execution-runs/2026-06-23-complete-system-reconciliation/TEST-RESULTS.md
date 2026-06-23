# Test Results

## Passed

- `node --check src/platform/ingestion/canonical-ids.js src/platform/ingestion/intake-source.js src/lib/bna/ramble-protocol.js src/lib/bna/intake-parser.js src/lib/bna/goal-memory.js`:
  PASS.
- `node --test tests/ingestion/canonical-ids.test.js tests/intake-parser.test.js tests/intake-parser-goals.test.js tests/agentic-goal-memory-hardening.test.js tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js`:
  PASS, 32/32.
- `node --check src/platform/ingestion/prompt-queue.js`: PASS.
- `node --test tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-intake-source.test.js`:
  PASS, 11/11.
- `node --check src/platform/ingestion/intake-source.js scripts/intake-github.mjs src/lib/bna/ramble-protocol.js src/lib/bna/intake-parser.js`:
  PASS.
- `node --test tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/system-truth-scripts.test.js tests/intake-parser.test.js`:
  PASS, 31/31.
- `node --check src/platform/ingestion/intake-service.js scripts/intake-github.mjs scripts/ramble-intake-contract.mjs`:
  PASS.
- `node --test tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/system-truth-scripts.test.js`:
  PASS, 18/18.
- `node scripts/ramble-intake-contract.mjs --text="Task: Codex should verify canonical intake service." | Out-Null`:
  PASS.
- `node --check src/platform/ingestion/intake-persistence.js scripts/ramble-intake-contract.mjs`:
  PASS.
- `node --test tests/ingestion/w3-intake-persistence.test.js tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-intake-source.test.js tests/system-truth-scripts.test.js`:
  PASS, 14/14.
- `node scripts/ramble-intake-contract.mjs --text="Task: Codex should verify canonical memory readback." --memory-readback | Out-Null`:
  PASS.
- `npm ci`: PASS.
- `npm test`: PASS, 1079/1079.
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
