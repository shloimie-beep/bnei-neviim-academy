# Resend Smoke Readback - 2026-07-01

Raw input: `RAW-20260701-004`
Packet: `PKT-20260701-109`
Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Result: guarded test send passed through the verified One Time Resend domain.

- External send performed: `true`
- Bulk campaign sent: `false`
- Recipient: `d***@resend.dev`
- Provider message ID: `513b89c4-6bc5-4dbd-b271-f1291249211d`
- Provider readback status: `delivered`
- Sender used for guarded smoke: `OneTimeOneTime Mishnah <info@onetimeonetime.com>`

## Readiness

Local Rabbi/One Time profile before command-scoped overrides:

- `RESEND_API_KEY`: configured, fingerprint `sha256:425f2ccf2704`
- `RESEND_RABBI_DOMAIN`: missing
- `RESEND_RABBI_FROM_EMAIL`: missing
- `RESEND_RABBI_FROM_NAME`: missing
- `RESEND_RABBI_REPLY_TO`: missing
- `RESEND_WEBHOOK_SECRET`: missing
- Send allowed: `false`

Live app health:

- `/api/bna/integrations/resend/health`: `200`
- Configured/connected: `true`
- Send allowed: `false`
- Blocker: live app is checking `bneineviimacademy.org`, but the connected Resend account lists `onetimeonetime.com` as verified.

Domain readback:

- `/api/bna/integrations/resend/domains`: `200`
- Domains: `onetimeonetime.com` / `verified`

Inbound route:

- `/api/resend/inbound` unsigned probe: `503`, safe refusal
- Blocker: `RESEND_WEBHOOK_SECRET` is not configured.
- `/api/bna/integrations/resend/events`: `200`, raw payload hidden, 0 events

## Verification

- PASS `node --check server.js`
- PASS `node --check src/lib/integrations/resend-client.js`
- PASS `node --check src/lib/integrations/resend-inbound-crm.js`
- PASS `node --test tests/resend-client.test.js tests/resend-inbound-crm.test.js tests/resend-inbound-webhook.test.js` (16/16)
- PASS dry-run action-registry smoke, no send
- PASS guarded Resend client smoke with command-scoped One Time sender config
- PASS provider message readback: delivered

## Remaining Blockers

1. Persist One Time Resend sender config in Railway/keyholder:
   `RESEND_RABBI_DOMAIN=onetimeonetime.com`,
   `RESEND_RABBI_FROM_EMAIL=info@onetimeonetime.com`,
   `RESEND_RABBI_FROM_NAME=OneTimeOneTime Mishnah`,
   `RESEND_RABBI_REPLY_TO=info@onetimeonetime.com`.
2. Install `RESEND_WEBHOOK_SECRET` from the Resend webhook for
   `https://bneineviimacademy.org/api/resend/inbound`.

Next real class email action: generate a recipient-list/copy/preview/test
packet for the first One Time class invitation email after those app/Railway
readbacks pass. No real class campaign was sent in this packet.
