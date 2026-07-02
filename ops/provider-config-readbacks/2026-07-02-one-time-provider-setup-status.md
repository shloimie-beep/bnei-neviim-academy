# One Time Provider Setup Status

Generated: 2026-07-02T13:01:30+03:00

No email send, WhatsApp send, Stripe payment, Vimeo upload, Zoom mutation, DNS
mutation, hard delete, GHL runtime, or bulk campaign was performed.

## Resend

Status: send path configured, no send performed.

- Sender/reply-to: `info@onetimeonetime.com`
- Later safe seed recipient: `sdratler@gmail.com`
- Evidence: `ops/one-time-mishnah/integration-smokes/2026-07-02T12-56-56-475Z-resend-vimeo-stripe-safe-smoke.json`
- Next: after `join.onetimeonetime.com` is live, run an exact seed-send packet only.

## Vimeo

Status: blocked.

Missing:

- `VIMEO_ACCESS_TOKEN_alias_or_keyholder_path`
- `ONE_TIME_DRIVE_DROP_FOLDER_ALIAS`

## Stripe

Status: blocked for sandbox smoke.

The smoke detected a live Stripe key and refused API calls. Provide Rabbi Stripe
test credentials and the `$67/month` sandbox price/product alias. No live
payment was run.

## Whapi/WAPI

Status: blocked.

Missing Rabbi Whapi/WAPI token alias, instance ID, sending phone number, and
safe Rabbi recipient phone. The prepared setup message was not sent.

## Zoom

Status: blocked.

Provide a private Zoom session/details alias plus schedule, display label,
rotation policy, and fallback text. Do not expose the raw Zoom link in repo
evidence.
