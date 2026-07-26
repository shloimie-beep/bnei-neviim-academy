# Email / Resend Memory

- As of `DEC-20260721-002`, Resend use for the One Time connector is limited to
  security-token email such as login, verification, password-reset, and
  equivalent account-security tokens. GHL remains the One Time customer-
  communication source of truth; redacted security-delivery status belongs in
  GHL without copying the token or secret-bearing body.
- Earlier One Time Resend campaign/provider setup evidence is historical proof,
  not current authorization for non-security One Time customer email.
- Resend work is provider setup/readback work, not a blocker for UI audit or IA
  cleanup.
- No bulk real campaign send is allowed from a protocol/UI cleanup packet.
- Safe smoke testing may use Resend official test addresses or
  Shloimie-owned/specified test recipients when a guarded script and readiness
  evidence exist.
- Reports must redact secrets and private recipients.
- Required readiness evidence is status/fingerprint only for `RESEND_API_KEY`,
  `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, and any scoped provider secret
  references.

## 2026-07-01 One Time Resend Smoke Readback

- `RAW-20260701-004` ran the generated Resend send-enabled smoke packet.
- The connected Resend account lists `onetimeonetime.com` as `verified`.
- A command-scoped guarded smoke using `One Time Mishnayos <info@onetimeonetime.com>` sent one official Resend test email to a redacted `@resend.dev` recipient and provider readback returned `delivered`.
- No bulk campaign, real class invitation, DNS mutation, Stripe action, GHL, or production CRM/contact mutation occurred.
- Remaining app/Railway setup:
  - persist One Time sender config: `RESEND_RABBI_DOMAIN=onetimeonetime.com`, `RESEND_RABBI_FROM_EMAIL=info@onetimeonetime.com`, `RESEND_RABBI_FROM_NAME=One Time Mishnayos`, `RESEND_RABBI_REPLY_TO=info@onetimeonetime.com`;
  - install `RESEND_WEBHOOK_SECRET` for `https://bneineviimacademy.org/api/resend/inbound`;
  - rerun live app health so it checks the One Time domain instead of the BNA domain.
