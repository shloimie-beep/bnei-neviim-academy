# Resend Smoke Readback - 2026-07-01

Scope: One Time / Rabbi Sheller Resend readiness.

## Result

- Resend API key: configured by redacted fingerprint only.
- Resend webhook secret: configured by redacted fingerprint only.
- Railway web service: `skillful-motivation` / production.
- Active live deployment after clean-base code patch: `99b21d37-1297-40c4-841e-8dca32ddf8d5` (`SUCCESS`), deployed from `origin/master` commit `57af99434f83fb2af5af45946d15ac019e13953f`.
- Superseded earlier code patch deployment: `be2c5db3-94d0-49ff-bdd8-68a6e5019e74`.
- Domain: `onetimeonetime.com`, verified in Resend, region `us-east-1`.
- Sender: `OneTimeOneTime Mishnah <info@onetimeonetime.com>`.
- Reply-to: `info@onetimeonetime.com`.
- Live status: `resend_configured=true`, `resend_webhook_configured=true`, `required_env=[]`.
- Live health: configured, connected, domain verified, `send_allowed=true`, blocker `null`.

## Webhook Coverage

Resend has one enabled production webhook for:

`https://bneineviimacademy.org/api/resend/inbound`

Configured events observed:

- `email.bounced`
- `email.clicked`
- `email.complained`
- `email.delivered`
- `email.delivery_delayed`
- `email.failed`
- `email.opened`
- `email.received`
- `email.scheduled`
- `email.sent`
- `email.suppressed`

Signed webhook checks:

- Invalid Svix signature returned HTTP `401`.
- Signed synthetic `email.delivered` event returned HTTP `200`, `accepted=true`, `processing_status=processed`, and raw payload hidden in readback.
- Clean-deploy proof report: `ops/live-smokes/2026-07-01T13-45-39-993Z-resend-clean-deploy-live-proof.md`.

## Test Sends

External send performed: yes, test-only.

Bulk campaign send performed: no.

Imported contact/lead send performed: no.

Safe recipients:

- `delivered+[label]@resend.dev`: live app send endpoint sent, then webhook readback showed `email.sent` and `email.delivered`.
- `bounced+[label]@resend.dev`: live app send endpoint sent, then webhook readback showed `email.sent` and `email.bounced`.
- `suppressed@resend.dev`: sent, then webhook readback showed `email.sent` and `email.suppressed`.
- `info@onetimeonetime.com`: owned-inbox inbound smoke send succeeded, but Resend treated it as outbound `sent`/`delivered`; no `email.received` CRM row appeared after polling.

Live UX proof after clean deploy:

- `ops/live-smokes/2026-07-01T13-46-50-223Z-email-resend-ux-live-smoke.md`.

## Remaining Blocker

Real inbound `email.received` fetch/CRM proof is still blocked until an actual external inbound message or Resend replay exists. Gmail connector reauthentication blocked using Gmail as the external sender in this Codex session.

## Campaign Decision

Technically safe/approved test sends are working.

Real campaign send is **not authorized** yet. It requires:

1. final copy;
2. exact final recipient list/segment;
3. an explicit campaign send packet/approval.
