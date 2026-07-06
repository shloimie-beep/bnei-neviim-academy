# Raw Intake Drift Watchdog

Generated at 2026-07-06T19:31:06.660Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: ok
- Findings: 0
- Raw fallback files: 138
- Memory files: 35
- Requirement registers: 193
- Canonical intake contract checks: 40

## Findings

- None.

## Canonical Intake Contract Checks

- PASS Canonical intake service: src/platform/ingestion/intake-service.js
- PASS Canonical intake persistence readback: src/platform/ingestion/intake-persistence.js
- PASS Canonical intake Postgres persistence: src/platform/ingestion/intake-postgres-persistence.js
- PASS Canonical intake Postgres operator CLI: scripts/canonical-intake-postgres.mjs
- PASS Parent prompt auto-resume lifecycle: src/platform/ingestion/prompt-queue.js
- PASS GitHub intake adapter: scripts/intake-github.mjs
- PASS Ramble intake contract script: scripts/ramble-intake-contract.mjs
