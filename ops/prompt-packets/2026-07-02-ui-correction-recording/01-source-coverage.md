# 01 Source Coverage - UI Correction Recording

Packet ID: `PKT-20260702-202`
Parent raw ID: `RAW-20260702-006`
Stage: `STAGE_1_SPEC_COMPILER`
Role: `SPEC_COMPILER`

## Source Matrix

| Source Statement | Coverage | Status |
| --- | --- | --- |
| Verify background agent/fleet | `ops/agent-fleet-readbacks/2026-07-02-background-agent-readback.md` | covered |
| Trace newest Drive recording | `ops/drive-traces/2026-07-02-newest-ui-correction-recording-trace.md` | covered |
| Extract UI corrections | `content_job:101` parser output | blocked |
| Create mock/test data | `09-mock-data-and-test-identities.md` | ready |
| Continue Railway setup | active setup checker/provisioning scripts | ready |
| No PR #62 force merge | branch created from `origin/master`; PR #63 commits cherry-picked | covered |

## Blocker

`DRIVE-UI-20260702-001`: no structured parser output exists for the newest
recording, so no recording-derived UI correction statements can be mapped to
requirements yet.

## Safe Inputs For UI Packets

Until the recording parser output exists, UI packets may consume:

- `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`
- `ops/visual-quality-rubric.md`
- `docs/PRODUCT-QUALITY-COMPILER.md`
- `memory-topics/brand-kits.md`
- `memory-topics/provider-pipelines.md`

They must not claim to implement the unparsed recording.
