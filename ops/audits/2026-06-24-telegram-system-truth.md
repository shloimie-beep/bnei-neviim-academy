# Telegram And Website Assistant System Truth

Requirement: `REQ-20260623-026`

## Runtime Truth

- Canonical branch/PR: `codex/one-time-batch4-control-plane-20260623`,
  draft PR #13.
- Latest deployed runtime commit for the control plane: `296a276a`.
- Latest Railway deployment: `02944240-4c1b-477b-a57f-5f6140e80400`,
  status `SUCCESS`.
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`.
- Focused live Assistant Control Center readback:
  `/api/bna/assistant/control-center` returned status 200 and no-write guards.

## Architecture Truth

Telegram, website assistant, Operations helper, provider portal assistant,
parent portal assistant, and student portal assistant where enabled are
adapters over one control plane:

- shared identity/workspace/role policy
- shared source envelope and file/media intake
- shared action registry and planner
- shared preview/approval/audit
- shared draft/version model
- shared reminders/notifications
- shared tickets/problem resolution
- durable Agent Work handoff

No second Telegram architecture, website-bot action system, action registry,
intake pipeline, agent queue, provider onboarding system, page builder, or
browser-click substitution path was added.

## Remaining External Blocker

`REQ-20260619-313` remains `needs_operator_decision` for separate One Time
paid infrastructure/DNS/ownership. It is external to this control-plane
implementation.
