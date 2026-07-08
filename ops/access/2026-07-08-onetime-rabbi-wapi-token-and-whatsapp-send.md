# OneTime Rabbi WAPI Token Save And WhatsApp Send

- Raw IDs: `RAW-20260708-026`, `RAW-20260708-027`
- Requirement IDs: `REQ-20260708-088`, `REQ-20260708-089`
- Token source: operator provided in Codex chat and identified it as the Rabbi
  token.
- Secret storage:
  - `.secrets/one-time-wapi-api-token.txt`
  - `.secrets/rabbi-sheller-wapi-api-token.txt`
- Secret storage status: both files present and gitignored.
- Token length: `32`
- Token fingerprint: `1bf76f7c0a3a`
- Whapi health readback: `status=AUTH`, business account `true`, sender/user
  last four `8614`, external write `false`.
- WhatsApp send: performed.
- Recipient: operator WhatsApp number ending `2631`.
- Message copy:

```text
Hi, this is OneTimeOneTime Mishnah. I just resent the secure Rabbi workspace setup email. Please use the email link to log in. For safety, I am not sending the login link over WhatsApp.
```

- Provider send result: `status_code=200`, message id present, message id
  fingerprint `02b1625c5735`.

Guardrails:

- The setup link/token was not sent over WhatsApp.
- The WAPI token, setup token, setup URL, session cookie, password, and full
  phone number were not committed.
- No Railway/environment mutation, payment/access grant, DNS, Zoom, Vimeo,
  Drive, Stripe, or external CRM mutation was performed.
