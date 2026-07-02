# One Time Clean Integration From PR #62

Raw input: `RAW-20260702-005`
Active run:
`ops/execution-runs/2026-07-02-one-time-clean-integration-launch-setup`

## Scope

Use PR #62 as source material, not as a broad merge. Port only the safe One
Time setup/readiness layer onto a fresh branch from current `origin/master`.

## Requirements

- `REQ-20260702-901`: Create clean integration branch and avoid dirty PR #62
  merge.
- `REQ-20260702-902`: Add One Time external setup readiness checker and focused
  tests.
- `REQ-20260702-903`: Restore launch-unblocker checklists, top visible
  operator tasks, and post-setup deploy packet.
- `REQ-20260702-904`: Run safe no-write/readback checks and record remaining
  blockers.
- `REQ-20260702-905`: Push branch/PR, deploy only if runtime/app-visible gates
  require and pass, and leave clean handoff.

## Guardrails

No bulk send, live Stripe payment, paid-user cancellation, apex/root DNS
mutation, hard delete, raw private-data export, secret exposure, GHL runtime,
or WhatsApp broadcast.
