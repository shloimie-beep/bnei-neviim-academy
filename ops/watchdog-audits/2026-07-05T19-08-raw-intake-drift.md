# Raw Intake Drift Watchdog

Generated at 2026-07-05T19:08:40.907Z.

This watchdog is local-safe and read-only except for writing this report.

## Summary

- Severity: high
- Findings: 4
- Raw fallback files: 108
- Memory files: 34
- Requirement registers: 176
- Canonical intake contract checks: 40

## Findings

- **HIGH** Raw intake file lacks stable RAW ID: Repo fallback raw files must preserve the stable raw ID in filename or body.
  Goals: GOAL-CORE-007
  Evidence: raw-input/RAW-20260702-APPLY-PRIVATE-DRIVE-TRANSCRIPT-DOCS-AND-JOB101-PARSER-CLOSEOUT.md
  Fix: Rename or annotate the raw file with RAW-YYYYMMDD-###.
- **HIGH** Raw intake file lacks stable RAW ID: Repo fallback raw files must preserve the stable raw ID in filename or body.
  Goals: GOAL-CORE-007
  Evidence: raw-input/RAW-20260702-DRIVE-TRANSCRIPT-VISIBILITY-OPENAI2-KIMI-FALLBACK-PARSER-ROUTING.md
  Fix: Rename or annotate the raw file with RAW-YYYYMMDD-###.
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
