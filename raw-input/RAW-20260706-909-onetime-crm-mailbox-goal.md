# RAW-20260706-909 - One Time CRM Mailbox Goal

Source: `codex_chat`

Created: 2026-07-06 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Privacy classification: private operator/product instruction. The operator
provided a physical mailing address for future compliance footer use; the exact
address is intentionally redacted from tracked source and should be stored in a
runtime secret/config value, not hard-coded into GitHub.

## Raw intake

Shloimie asked why bulk email and a real Rabbi inbox cannot be made to work now,
noting that a test email was already sent and a reply came back. He then asked
to build a polished CRM inbox/mailbox for `info@onetimeonetime.com` so Rabbi
can log in and see emails, with a CRM-like structure, sender configuration,
and a "multi-million dollar CRM inbox" quality bar. He approved using an
operator-provided physical mailing address for email compliance footer setup,
but that address must be supplied through runtime configuration.

## Parsed source statements

| ID | Statement |
|---|---|
| SRC-20260706-909-001 | Build a real Rabbi / One Time CRM mailbox for `info@onetimeonetime.com`. |
| SRC-20260706-909-002 | Rabbi should be able to log in and see received emails. |
| SRC-20260706-909-003 | Use the existing Resend capability and sender setup where possible. |
| SRC-20260706-909-004 | Make it polished and credible, not a fake or placeholder CRM. |
| SRC-20260706-909-005 | Bulk emails are possible, but the immediate need is the inbox/mailbox. |
| SRC-20260706-909-006 | Use a physical mailing address for compliance footer via runtime config, not tracked source. |

## Router output

Classifications:

- `PRODUCT_QUALITY`
- `UI_IMPLEMENTATION`
- `CRM_PIPELINE`
- `COMMUNICATIONS_EMAIL`
- `PROVIDER_SETUP`
- `EXTERNAL_WRITE_REQUEST`
- `SECURITY_PRIVACY`
- `DEPLOY_RELEASE`

Product Quality Compiler required: yes.

Super-Ramble Packet Splitter required: no for the immediate implementation
slice, because this packet is scoped to one major module: the One Time mailbox.
Bulk broadcasts, campaign sending, DNS/account-owner changes, and broader CRM
pipeline polish are separate follow-up packets.

Implementation before Definition of Ready: allowed only after the scoped
mailbox Product Quality packet validates.

## Guardrails

- Do not hard-code or commit the physical mailing address.
- Do not perform a bulk campaign send in this packet.
- Do not send a production email reply without explicit approval and Resend
  readiness.
- Do not expose unrelated BNA school, parent, student, provider, or platform
  data in the Rabbi mailbox.
- Do not add GHL, LeadConnector, or any external CRM runtime.
