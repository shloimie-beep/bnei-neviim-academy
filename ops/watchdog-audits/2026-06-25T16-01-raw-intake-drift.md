# Raw Intake Drift Watchdog

Generated at 2026-06-25T16:01:25.735Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: medium
- Findings: 2
- Raw fallback files: 52
- Memory files: 27
- Requirement registers: 144
- Canonical intake contract checks: 40

## Findings

- **MEDIUM** Register references RAW-20260618-002 without repo raw fallback: If the live DB is unavailable, raw provenance should also be visible in raw-input/ or memory/YYYY-MM-DD.md.
  Goals: GOAL-CORE-007, GOAL-CORE-015
  Evidence: tasks-pending/2026-06-18-operations-ui-audit-harness.md | RAW-20260618-002
  Fix: Link the live bna_raw_intake row or add a redacted repo fallback pointer.
- **MEDIUM** Register references RAW-20260617-020 without repo raw fallback: If the live DB is unavailable, raw provenance should also be visible in raw-input/ or memory/YYYY-MM-DD.md.
  Goals: GOAL-CORE-007, GOAL-CORE-015
  Evidence: tasks-pending/2026-06-18-telegram-bot-stuck-google-drive-intake.md | RAW-20260617-020
  Fix: Link the live bna_raw_intake row or add a redacted repo fallback pointer.

## Canonical Intake Contract Checks

- PASS Canonical intake service: src/platform/ingestion/intake-service.js
- PASS Canonical intake persistence readback: src/platform/ingestion/intake-persistence.js
- PASS Canonical intake Postgres persistence: src/platform/ingestion/intake-postgres-persistence.js
- PASS Canonical intake Postgres operator CLI: scripts/canonical-intake-postgres.mjs
- PASS Parent prompt auto-resume lifecycle: src/platform/ingestion/prompt-queue.js
- PASS GitHub intake adapter: scripts/intake-github.mjs
- PASS Ramble intake contract script: scripts/ramble-intake-contract.mjs
