# Test Results

Final Prompt 05 verification:

- `node --check server.js`: pass
- `node --check scripts/telegram-kimi-bridge.mjs`: pass
- `node --check scripts/agent-fleet-supervisor.mjs`: pass
- `node --check scripts/bna-execution-run.mjs`: pass
- `node --check scripts/google-drive-setup.mjs`: pass
- `node --check scripts/platform-synthetic-e2e.mjs`: pass
- `node --test tests/platform-core/*.test.js`: pass, 17/17
- `node --test tests/ingestion/*.test.js tests/agent-control/*.test.js`: pass, 13/13
- `node --test tests/platform-ui/platform-ui-contract.test.js`: pass, 7/7
- `node --test tests/platform-ui/platform-ui-playwright-smoke.mjs`: pass, 1/1
- `node --test tests/instances/w4-onetime-instance.test.js tests/integrations/w4-onetime-readiness.test.js`: pass, 6/6
- `node --test tests/workspace-person-household-provider-contract.test.js`: pass, 9/9
- `npm run ramble:intake-contract`: pass
- `npm run prompt:queue-contract`: pass
- `node scripts/platform-synthetic-e2e.mjs`: pass, wrote `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`
- `npm test`: pass, 944/944
- `node scripts/audit-secrets.mjs`: pass, 3360 tracked paths checked, 0 tracked secret-risk files found
- `npm run watchdog:audit`: pass, severity `ok`, finding_count `0`
- JSON/JSONL parse: pass, ledger lines `1275`
- `git diff --check`: pass with LF/CRLF warnings only

Browser verification:

- W2 isolated Playwright harness passed at `360x800`, `390x844`, `768x1024`, and `1440x900`.
- Canonical Operations static harness with Playwright API mocks passed at `360x800`, `390x844`, `768x1024`, and `1440x900`.

Blocked or intentionally not run:

- Authenticated local Operations smoke against the real server: blocked by unavailable shell-visible Operations credentials.
- Production/live database migration and smoke: external release gate.
- Railway deploy/doctor/live smoke: external release gate.
- Vimeo, Zoom, Resend, DNS, secret propagation, and live send/upload/meeting actions: external release gates.
