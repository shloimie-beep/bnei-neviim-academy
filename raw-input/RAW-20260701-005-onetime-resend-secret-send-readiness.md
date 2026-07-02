# RAW-20260701-005 - One Time Resend Secret And Send Readiness

Source: Codex chat
Created: 2026-07-01T16:27:09+03:00
Parse status: registered
Requirement register: `tasks-pending/2026-07-01-onetime-resend-secret-send-readiness.md`

## Raw Operator Packet

`BNA_GOAL_MODE_EXECUTION_PACKET`

Title: Install One Time Resend Secrets, Verify Webhook, Send Test Emails, and Decide If Real Campaign Can Send.

Primary objective: Make One Time / Rabbi Sheller email actually send-ready.

Shloimie says Codex already has the Resend API key, the Resend webhook signing secret was saved locally, the webhook secret should be stored in the same safe keyholder/Railway path as the Resend API key, Codex should install/persist required Resend values, deploy/apply them if needed, run tests/smokes, and report exactly when Shloimie can send the real email. Shloimie does not want to run commands manually. Safe test sends are authorized. Bulk campaign send is not authorized until final copy plus final recipient list/segment are explicit.

Known Resend webhook events selected by Shloimie:

- `email.sent`
- `email.received`
- `email.delivered`
- `email.clicked`
- `email.bounced`

Recommended events to add if available/safe:

- `email.opened`
- `email.failed`
- `email.suppressed`
- `email.complained`
- `email.delivery_delayed`

Hard safety: do not print, commit, screenshot, or paste secrets; do not bulk-send a real campaign; do not send to imported leads/contacts; do not mutate DNS; do not add GHL; do not run Stripe; use redacted fingerprints/status only.

Required secret path supplied by operator: `C:\Users\User\BNA-Keyholder`, described as the keyholder where all secrets are stored.

## Parsed Items

- `REQ-20260701-501`: Install/persist One Time Resend keyholder aliases/config and Railway variables without exposing secrets.
- `REQ-20260701-502`: Verify Resend webhook endpoint, selected/recommended event coverage, and signed webhook behavior.
- `REQ-20260701-503`: Run safe Resend test sends only to official/owned test recipients and record readback.
- `REQ-20260701-504`: Decide whether real campaign send is allowed.
- `DEC-20260701-501`: Real bulk campaign send remains blocked until final copy and final recipient list/segment are explicit.
