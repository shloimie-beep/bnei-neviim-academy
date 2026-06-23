# Resend Integration

Date checked: 2026-06-19

Scope: One Time email-domain readiness and future launch emails. This file contains no secrets.

## Official Documentation

- Domains: https://resend.com/docs/dashboard/domains/introduction
- API keys: https://resend.com/docs/dashboard/api-keys/introduction
- Create API key: https://resend.com/docs/api-reference/api-keys/create-api-key
- DMARC: https://resend.com/docs/dashboard/domains/dmarc

## Current Local Implementation

- Adapter: `src/lib/integrations/resend-client.js`
- Existing safe operations:
  - profile-aware configuration
  - domain/sender readiness checks
  - DNS record readback normalization
  - Resend webhook event normalization
  - Svix-header webhook verification using the raw request body when a webhook
    signing secret is configured
  - local webhook status storage against BNA email communication/email-log rows
    without storing raw email body content in metadata
  - send operation blocked unless readiness and explicit send confirmation pass
  - redacted errors
- Operations UI:
  - Communications > Email exposes provider-account, sender-identity,
    domain-readiness, recipient-scope, and confirmation gates separately.
  - Communications > Settings exposes Resend provider connection, sender
    identity, domain, DNS tasks, and draft list without secret fields.
- Focused live smoke:
  - `npm run app:smoke:email-resend-ux`
  - Read-only except for login/session activity; it does not create drafts,
    verify DNS, or send email.

## Configuration Names

Non-secret identifiers may be referenced in Decisions:

- `RESEND_ACCOUNT_OWNER`
- `RESEND_PROVIDER_ACCOUNT`
- `RESEND_DOMAIN`
- `RESEND_FROM`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_REPLY_TO`
- `RESEND_SEND_FALLBACK_APPROVED`
- `RESEND_SHLOIMIE_DOMAIN`
- `RESEND_RABBI_DOMAIN`

Secrets must be stored only in keyholder/server environment:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_SHLOIMIE_API_KEY`
- `RESEND_RABBI_API_KEY`

## Required Decision

- `DEC-20260618-203`: Decide Resend recovery, new account, or alternate email provider.
- `DEC-20260618-204`: Identify One Time launch domain and DNS authority.
- `DEC-RESEND-SENDER-DOMAIN-IDENTITY`:
  `ops/one-time-mishnah/resend-sender-domain-decision.md`

Needed before sends:

- account owner
- sender domain
- from identity
- DNS host/registrar access path
- verified records from the provider dashboard
- approved test recipient

## Local Acceptance

- Automated tests must use mocks.
- No live email should be sent until the operator explicitly approves a target address and send.
- Webhook verification tests must use mocked payloads, mocked signing headers,
  and mocked database writes.
- Live smoke may read Resend readiness/domain endpoints and render the
  Operations UI, but must not create drafts, request DNS verification, or call
  the send endpoint.
