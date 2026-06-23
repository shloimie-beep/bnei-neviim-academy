# Test Results

## Passed

- `node --check scripts/bna-external-readback-gate.mjs`:
  PASS.
- `node --test tests/bna-external-readback-gate.test.js tests/system-truth-scripts.test.js`:
  PASS, 6/6.
- `npm --silent run bna:external-readback-gate -- --json`:
  PASS as a blocked dry-run gate; database, Railway, and Drive readback gates are not ready in this environment; no external read or mutation performed.
- `npm run bna:run:validate`:
  PASS.
- `npm run bna:run:source-coverage`:
  PASS, 0 unmapped executable statements.
- `npm test`:
  PASS, 1093/1093.
- `node scripts/audit-secrets.mjs`:
  PASS, 4146 tracked paths checked, 0 tracked secret-risk files found.
- `node --check scripts/bna-production-closeout-gate.mjs`:
  PASS.
- `node --test tests/bna-production-closeout-gate.test.js tests/system-truth-scripts.test.js`:
  PASS, 6/6.
- `npm --silent run bna:release-gate -- --json`:
  PASS as a blocked dry-run gate; branch HEAD pushed, deploy blocked because the worktree is mixed dirty/untracked.
- `npm run bna:run:stale-evidence`:
  PASS, stale evidence detection none.
- `npm run watchdog:actions`:
  PASS, `ok: true`, severity `ok`, findings 0.
- `npm run watchdog:security`:
  PASS, `ok: true`, severity `ok`, findings 0.
- `node --test tests/bna-production-closeout-gate.test.js tests/canonical-intake-postgres-cli.test.js tests/ingestion/w3-intake-persistence.test.js tests/watchdog-raw-intake-drift.test.js tests/system-truth-scripts.test.js`:
  PASS, 16/16.
- `npm run bna:run:validate`:
  PASS.
- `npm run bna:run:source-coverage`:
  PASS, 0 unmapped executable statements.
- `npm test`:
  PASS, 1093/1093.
- `node scripts/audit-secrets.mjs`:
  PASS, 4146 tracked paths checked, 0 tracked secret-risk files found.
- `node --check scripts/canonical-intake-postgres.mjs scripts/watchdog-raw-intake-drift.mjs`:
  PASS.
- `node --test tests/canonical-intake-postgres-cli.test.js tests/watchdog-raw-intake-drift.test.js tests/system-truth-scripts.test.js`:
  PASS, 6/6.
- `node --test tests/canonical-intake-postgres-cli.test.js tests/ingestion/w3-intake-persistence.test.js tests/watchdog-raw-intake-drift.test.js tests/system-truth-scripts.test.js`:
  PASS, 13/13.
- `npm --silent run bna:intake:postgres -- --text="Task: Codex should prepare a guarded production Postgres apply plan." --json | node -e "..."`
  PASS; emitted a redacted dry-run Postgres operator plan summary.
- `npm run watchdog:raw`:
  PASS, `ok: true`, severity `medium`, findings 2; Postgres operator CLI contract guarded.
- `npm run bna:run:validate`:
  PASS.
- `npm run bna:run:source-coverage`:
  PASS, 0 unmapped executable statements.
- `npm test`:
  PASS, 1090/1090.
- `node scripts/audit-secrets.mjs`:
  PASS, 4144 tracked paths checked, 0 tracked secret-risk files found.
- `node --check scripts/ramble-intake-contract.mjs scripts/watchdog-raw-intake-drift.mjs src/platform/ingestion/intake-postgres-persistence.js server.js`:
  PASS.
- `node --test tests/ingestion/w3-intake-persistence.test.js tests/intake-parser.test.js tests/watchdog-raw-intake-drift.test.js tests/system-truth-scripts.test.js`:
  PASS, 27/27.
- `node scripts/ramble-intake-contract.mjs --text="Task: Codex should preview canonical Postgres persistence." --postgres-plan | node -e "..."`
  PASS; emitted a no-write Postgres plan summary.
- `npm run watchdog:raw`:
  PASS, `ok: true`, severity `medium`, findings 2; Postgres persistence contract guarded.
- `node --check server.js`:
  PASS.
- `node --test tests/intake-parser.test.js`:
  PASS, 16/16.
- Operations inline script syntax check:
  PASS, checked 5 inline scripts.
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
- `node --check scripts/watchdog-raw-intake-drift.mjs`:
  PASS.
- `node --test tests/watchdog-raw-intake-drift.test.js tests/ingestion/w3-intake-persistence.test.js tests/ingestion/w3-intake-service.test.js`:
  PASS, 7/7.
- `npm run watchdog:raw`: PASS, `ok: true`, severity `medium`, findings 2.
- `node --check scripts/watchdog-raw-intake-drift.mjs`:
  PASS.
- `node --test tests/watchdog-raw-intake-drift.test.js tests/ingestion/w3-parser-queue.test.js`:
  PASS, 9/9.
- `npm run watchdog:raw`:
  PASS, `ok: true`, severity `medium`, findings 2; prompt auto-resume contract guarded.
- `node --check scripts/platform-synthetic-e2e.mjs`:
  PASS.
- `node --test tests/one-time-synthetic-pilot.test.js tests/ingestion/w3-intake-persistence.test.js`:
  PASS, 8/8.
- `npm run platform:synthetic-e2e`:
  PASS; updated `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`.
- `node --check src/platform/ingestion/intake-service.js src/platform/ingestion/intake-persistence.js`:
  PASS.
- `node --test tests/ingestion/w3-intake-persistence.test.js tests/ingestion/w3-intake-service.test.js tests/ingestion/w3-parser-queue.test.js`:
  PASS, 14/14.
- `node --check scripts/platform-synthetic-e2e.mjs`:
  PASS.
- `npm run platform:synthetic-e2e`:
  PASS; updated parsed entity readback counts in `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`.
- `node --check src/platform/ingestion/prompt-queue.js scripts/platform-synthetic-e2e.mjs`:
  PASS.
- `node --test tests/ingestion/w3-parser-queue.test.js tests/one-time-synthetic-pilot.test.js tests/agent-control/w3-closed-loop.test.js`:
  PASS, 16/16.
- `npm run platform:synthetic-e2e`:
  PASS; updated lifecycle auto-resume evidence in `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`.
- `node --check tests/service-provider-studio-browser-smoke.test.js`:
  PASS.
- `node --test tests/service-provider-studio-browser-smoke.test.js`:
  PASS, 1/1.
- `npm ci`: PASS.
- `npm test`: PASS, 1087/1087.
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
