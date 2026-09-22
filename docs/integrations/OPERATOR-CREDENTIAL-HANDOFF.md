# Operator Credential Handoff

Updated: 2026-06-19

This file tells the operator what to provide without exposing secrets. Do not paste API keys, passwords, tokens, DNS secret values, OAuth client secrets, or webhook secrets into chat, GitHub, task notes, screenshots, or logs.

## Safe To Put In Decisions

- account owner name
- account ID if it is not a secret
- sender domain
- from email/from name
- plan/license status
- required scopes by name
- whether a live write is approved
- screenshots or summaries with secrets redacted

## Must Go Only To Keyholder Or Server Environment

- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `ZOOM_WEBHOOK_SECRET`
- `VIMEO_CLIENT_ID`
- `VIMEO_CLIENT_SECRET`
- `VIMEO_ACCESS_TOKEN`
- `VIMEO_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_SHLOIMIE_API_KEY`
- `RESEND_RABBI_API_KEY`

## Non-Secret Environment Names

- `ZOOM_ACCOUNT_ID`
- `ZOOM_ACCOUNT_OWNER`
- `ZOOM_HOST_USER`
- `ZOOM_SCOPES`
- `VIMEO_ACCOUNT_ID`
- `VIMEO_PLAN`
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

## Local Keyholder Path

Default keyholder folder:

```text
C:\Users\User\BNA-Keyholder
```

Use one file per value when practical, for example:

```text
zoom-client-secret.txt
vimeo-access-token.txt
resend-api-key.txt
```

The repo must not contain those values.

## Readiness Commands

Run only after values are installed locally or in the approved environment:

```powershell
node --test tests\int05-integrations-closeout.test.js tests\one-time-drive-brief-ingestion.test.js
```

Safe readiness checks may report configured/missing status and account identity. They must not print secret values.

## Owner-Only Actions

- Zoom: owner/admin must confirm Server-to-Server OAuth app permissions and required scopes.
- Vimeo: owner/admin must decide seat/app/token/upload strategy.
- Resend: owner/admin must choose account and sender-domain path.
- DNS: owner/admin must apply provider-generated DNS records.
- Stripe/payment: owner/admin must confirm live/test mode, products, webhooks, and payment ownership.

## Rotation

If a value is exposed, revoke or rotate it in the provider dashboard, update keyholder/server environment, restart only the affected service, and rerun the safe readiness tests.
