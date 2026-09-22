# OneTime Rabbi Setup Email Resend

- Raw ID: `RAW-20260708-025`
- Requirement ID: `REQ-20260708-087`
- Requested by: operator via Codex chat
- Live service: `https://join.onetimeonetime.com`
- Provider row: `provider_id=1`, `Rabbi Elie Scheller`
- Login username returned: `one_time_admin`
- Recipient: operator Gmail override, domain `@gmail.com`
- External send performed: yes
- Endpoint: `POST /api/bna/service-providers/1/setup-email`
- Confirmation gate: `SEND_PROVIDER_SETUP_EMAIL_TO_OVERRIDE`
- Result: `success=true`, `email_sent=true`, `recipient_override=true`
- Expires at: `2026-07-08T19:54:24.230Z`
- Provider-message readback: message `#3`, source `provider_setup`,
  status `closed`, `email_sent=true`, `recipient_override=true`, created at
  `2026-07-08T18:54:24.656Z`

Guardrails:

- No raw setup token, setup URL, session cookie, or password was printed in
  chat or committed to the repo.
- The Rabbi provider contact record was not changed.
- No WhatsApp/WAPI, payment/access grant, DNS, Zoom, Vimeo, Drive, Stripe, or
  external CRM mutation was performed.
