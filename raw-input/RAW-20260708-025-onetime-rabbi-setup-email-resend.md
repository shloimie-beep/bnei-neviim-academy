# RAW-20260708-025 - OneTime Rabbi setup email resend

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-08T21:53:00+03:00
- Parse status: registered
- Requirement register: `tasks-pending/2026-07-08-onetime-resend-wapi-rabbi-login-crm.md`
- Requirement IDs: `REQ-20260708-087`
- Privacy classification: access_control

## Raw Intake

> Can you just send me a new email to the [operator Gmail] as if I was the rabbi, so I could see his whole back end? Like, I wanna log in as him. The last one just expired.

## Follow-up Clarification

> I don't get it. Why can't this be shown? Can you just work around this?

## Parsed Requirement

- `REQ-20260708-087`: Send a fresh audited OneTime/Rabbi provider setup email
  to the operator Gmail through the approved provider setup override flow so
  Shloimie can review the Rabbi provider workspace without exposing a raw setup
  token in chat or changing the Rabbi provider contact record.

## Guardrails

- Do not print or commit the raw setup token, setup URL, session cookie, or
  password.
- Use `POST /api/bna/service-providers/:id/setup-email` with the
  `SEND_PROVIDER_SETUP_EMAIL_TO_OVERRIDE` confirmation gate.
- Keep the provider workspace scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`.
- This request does not authorize WhatsApp/WAPI sends, payment/access grants,
  DNS, Zoom, Vimeo, Drive, Stripe, or external CRM mutations.
