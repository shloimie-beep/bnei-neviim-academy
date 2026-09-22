# Background Agent, Drive UI Recording, Mock Data, Railway Provisioning

Raw ID: `RAW-20260702-006`
Run: `2026-07-02-background-drive-ui-launch-continuation`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Requirements

| ID | Status | Title |
| --- | --- | --- |
| REQ-20260702-101 | done | Create clean UI-recording integration branch |
| REQ-20260702-102 | blocked | Verify background agent/fleet status |
| REQ-20260702-103 | blocked | Trace newest Drive recording and UI correction status |
| REQ-20260702-104 | done_with_blocker | Generate UI correction Product Quality packet DAG |
| REQ-20260702-105 | done_dry_run_apply_blocked | Create safe One Time TEST/mock UI review data scripts |
| REQ-20260702-106 | done | Attempt guarded One Time Railway provisioning |
| REQ-20260702-107 | blocked_external_dns | Record join-domain/DNS readback or exact task |
| REQ-20260702-108 | blocked_external_provider_inputs | Verify provider setup panels/tasks for WhatsApp/Vimeo/Stripe/Zoom |
| REQ-20260702-109 | done | Verify top task view next-action behavior |
| REQ-20260702-110 | in_progress | Validate, push PR, and close out blockers |

## Guardrails

No bulk campaign, live payment, WhatsApp broadcast, apex/root DNS mutation,
production hard delete, paid-user cancellation, GHL/LeadConnector runtime,
secret exposure, or raw private-data export.

## Current Top Task

`TASK-20260702-003`: add GoDaddy DNS records for `join.onetimeonetime.com`.

Records:

- CNAME `join` -> `awaz36ln.up.railway.app`
- TXT `_railway-verify.join` ->
  `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6`
