# REQ-20260626-008 Local Verification

Requirement: Hybrid Agent Mode prompt/drop-off on owner Tasks and Decisions

Date: 2026-06-26

## Commands

- `node --check server.js`
- `node --check src/lib/bna/agent-review-hub.js`
- `node --test tests/agent-mode-task-dropoff.test.js tests/agent-review-hub.test.js tests/public-helper-agent-review-guardrails.test.js tests/helper-destination-resolver.test.js tests/bna-helper-tools.test.js tests/app-select-dropdown.test.js`
- `node scripts/generate-one-time-action-coverage.mjs`
- `node scripts/generate-universal-action-parity.mjs`
- `node --test tests/watchdog-action-registry.test.js tests/agent-mode-task-dropoff.test.js`
- `npm test`
- `npm run watchdog:actions`
- `npm run watchdog:links`
- `npm run watchdog:security`
- `npm run secrets:audit`
- `npm run bna:run:validate`

## Results

- PASS focused Agent Mode Task/Decision and Agent Review suite: 41 pass, 0 fail.
- PASS action-registry gate after regeneration: 15 pass, 0 fail.
- PASS full suite: 1361 pass, 0 fail.
- PASS action watchdog: finding_count 0, report `ops/watchdog-audits/2026-06-26T07-48-watchdog-action-audit.md`.
- PASS link watchdog: finding_count 0, report `ops/watchdog-audits/2026-06-26T07-48-watchdog-link-audit.md`.
- PASS security watchdog: finding_count 0, report `ops/watchdog-audits/2026-06-26T07-48-watchdog-security-routes.md`.
- PASS secrets audit: 4880 tracked paths checked, 0 tracked secret-risk files found.
- PASS execution-run validation: validation passed, work remains yes.

## Remaining

App-visible changes remain open until pushed, merged, deployed to Railway, and live-smoked with sample owner Task/Decision copy/save/readback/repair behavior.
