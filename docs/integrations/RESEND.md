# Resend Integration

Date checked: 2026-06-19

Scope: One Time email-domain readiness and future launch emails. This file contains no secrets.

## Official Documentation

- Domains: https://resend.com/docs/dashboard/domains/introduction
- API keys: https://resend.com/docs/dashboard/api-keys/introduction
- Create API key: https://resend.com/docs/api-reference/api-keys/create-api-key
- DMARC: https://resend.com/docs/dashboard/domains/dmarc
- Receiving email: https://resend.com/docs/dashboard/receiving/introduction
- Received Email API: https://resend.com/docs/api-reference/emails/retrieve-received-email
- `email.received` webhook: https://resend.com/docs/webhooks/emails/received

## Current Local Implementation

- Adapter: `src/lib/integrations/resend-client.js`
- Existing safe operations:
  - profile-aware configuration
  - domain/sender readiness checks
  - DNS record readback normalization
  - Resend webhook event normalization
  - Svix-header webhook verification using the raw request body when a webhook
    signing secret is configured
  - inbound `email.received` handling at `/api/resend/inbound` and
    `/api/bna/resend/inbound`
  - Received Email API fetch for full message content and attachment metadata
  - first-party CRM routing into `rabbi_sheller_provider` /
    `one_time_mishnah_class` for recognized `onetimeonetime.com` recipients
  - local webhook status storage against BNA email communication/email-log rows
    without storing raw email body content in metadata
  - Operations Communications reads `bna_communications` rows beside
    contact-communication notes so inbound emails are visible without an
    external CRM write
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
- `RESEND_PROFILE`
- `RESEND_SEND_FALLBACK_APPROVED`
- `RESEND_SHLOIMIE_DOMAIN`
- `RESEND_RABBI_ACCOUNT_OWNER`
- `RESEND_RABBI_PROVIDER_ACCOUNT`
- `RESEND_RABBI_DOMAIN`
- `RESEND_RABBI_FROM`
- `RESEND_RABBI_FROM_EMAIL`
- `RESEND_RABBI_FROM_NAME`
- `RESEND_RABBI_REPLY_TO`

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

## OneTimeOneTime Current Intended Identity

The One Time/Rabbi profile must resolve to these non-secret sender values:

- profile: `RESEND_PROFILE=rabbi` when testing the Rabbi account path
- domain: `onetimeonetime.com`
- from email: `info@onetimeonetime.com`
- display name: `OneTimeOneTime Mishnah`
- reply-to: `info@onetimeonetime.com`

Do not use the BNA sender domain as the OneTimeOneTime production identity.
Do not recreate Zoho or change MX/DNS records from Codex without an explicit
operator-approved DNS action.

## Inbound Receive Setup

After deployment, create or confirm a Resend webhook for event
`email.received` pointing to:

`https://bneineviimacademy.org/api/resend/inbound`

Railway/server variables required by name only:

- `RESEND_API_KEY` or the active Rabbi profile key path
- `RESEND_WEBHOOK_SECRET`
- `RESEND_RABBI_DOMAIN`
- `RESEND_RABBI_FROM_EMAIL`
- `RESEND_RABBI_FROM_NAME`
- `RESEND_RABBI_REPLY_TO`

Live acceptance requires a signed webhook replay or approved inbound test
message proving invalid signatures reject, valid `email.received` fetches the
Received Email API, the scoped CRM row appears under
`rabbi_sheller_provider` / `one_time_mishnah_class`, and no outbound email send
occurs.

## Local Acceptance

- Automated tests must use mocks.
- No live email should be sent until the operator explicitly approves a target address and send.
- Webhook verification tests must use mocked payloads, mocked signing headers,
  and mocked database writes.
- Live smoke may read Resend readiness/domain endpoints and render the
  Operations UI, but must not create drafts, request DNS verification, or call
  the send endpoint.
