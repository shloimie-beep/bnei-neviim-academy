# Final Playwright

W2 isolated harness:

- `node --test tests/platform-ui/platform-ui-playwright-smoke.mjs`
- Result: pass across `360x800`, `390x844`, `768x1024`, and `1440x900`.

Canonical Operations fallback harness:

- Mode: real static `public/operations.html` served locally with Playwright API mocks.
- Route: `/operations.html?workspace=rabbi_sheller_provider&view=platform_suite`
- Evidence JSON: `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/operations-platform-suite-mock-acceptance.json`

Screenshots:

- `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/operations-platform-suite-mock-360x800.png`
- `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/operations-platform-suite-mock-390x844.png`
- `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/operations-platform-suite-mock-768x1024.png`
- `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/operations-platform-suite-mock-1440x900.png`

Authenticated server gate:

- Not run. Shell-visible `OPS_USERNAME` and `OPS_PASSWORD` were unavailable.
- The local server startup also exposed a `bna_workspaces` constraint compatibility issue, which was fixed in migration SQL and verified through contract tests rather than rerunning DB mutations.
