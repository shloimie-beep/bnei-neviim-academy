# One Time Buffer / Social Setup Readback - 2026-07-01

Requirement: `REQ-20260701-610`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Current State

- Operations already has a Communications Integrations panel with Buffer
  readiness, channel readback, local social drafts, schedule previews, and
  recent social draft rows.
- Buffer secrets are not exposed in the UI or reports.
- Action registry now includes `ACTION-BUFFER-SCHEDULE-CONFIRM`.

## Safety Change

One Time/Rabbi-scoped schedule confirmation is blocked unless a future approved
social packet supplies the exact approval phrase:

`APPROVE_ONE_TIME_BUFFER_SCHEDULE`

The Operations confirm button is disabled in the One Time workspace, and the
server returns `409` without performing an external write when the approval
phrase is missing.

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/communications-integrations-contract.test.js tests/watchdog-action-registry.test.js`
- PASS `npm run watchdog:actions`
- PASS regenerated `ops/action-registry/one-time-action-coverage.json`
- PASS regenerated `ops/action-registry/universal-action-parity.json`
- PASS Railway deployment `b75c6cec-31ea-4b23-8308-71606a3175ba` reached `SUCCESS`
- PASS live smoke `ops/live-smokes/2026-07-01T14-50-00Z-one-time-buffer-social-live-smoke.md`

## Guardrails

- No Buffer post was created, scheduled, or published.
- No social post was sent.
- No credentials were printed or committed.
- No GHL/LeadConnector runtime was added.
- Deployed Operations HTML includes the registered action marker and One Time
  disabled-state copy.
