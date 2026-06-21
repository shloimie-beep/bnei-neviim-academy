# Resend Sender/Domain Decision

Decision ID: `DEC-RESEND-SENDER-DOMAIN-IDENTITY`

Requirement: `REQ-20260621-504`

Status: `needs_operator_decision`

Owner: Shloimie / Rabbi Ellie Scheller

## Decision Needed

Choose the One Time email sender domain, from identity, reply-to address, DNS authority, and Resend account path before any live email send.

## Exact Action Required

Provide:

- sender domain or subdomain
- from email
- sender display name
- reply-to email
- DNS host/registrar authority
- Resend account owner/path, or alternate approved email provider
- one approved test recipient for a future operator-gated send smoke

## Guardrails

- Do not invent a sender domain.
- Do not send a live email from Operations until sender/domain readiness passes and the operator types the exact `SEND_RESEND_EMAIL` confirmation phrase.
- Do not commit Resend API keys, webhook signing secrets, DNS secrets, screenshots with secret values, or raw private email bodies.
- DNS tasks may store complete non-secret DNS record values copied from the provider dashboard, but truncated screenshot values must stay blocked.

## Evidence Links

- `docs/integrations/RESEND.md`
- `ops/one-time-mishnah/master-backlog-reconciliation.md`
- `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`
