# Requirements - One Time Clean Integration From PR #62

Run: `2026-07-02-one-time-clean-integration-launch-setup`
Raw input: `RAW-20260702-005`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Requirements

| ID | Status | Title |
| --- | --- | --- |
| REQ-20260702-901 | done | Create clean integration branch from master |
| REQ-20260702-902 | done | Add external setup readiness checker |
| REQ-20260702-903 | done | Restore One Time setup tasks and closeout packets |
| REQ-20260702-904 | done | Run safe readiness checks |
| REQ-20260702-905 | done | Push clean branch and leave next action |

## Guardrails

- Do not force-merge conflict-dirty PR #62.
- Do not send a real bulk campaign.
- Do not run a live Stripe payment.
- Do not cancel production paid users.
- Do not mutate apex/root `onetimeonetime.com`.
- Do not hard-delete production data.
- Do not expose secrets or raw private data.
- Do not add GHL/LeadConnector runtime.
- Do not send WhatsApp broadcasts to real contacts.
