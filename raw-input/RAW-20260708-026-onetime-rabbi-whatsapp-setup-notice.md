# RAW-20260708-026 - OneTime Rabbi WhatsApp setup notice request

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-08T21:58:00+03:00
- Parse status: implemented
- Requirement IDs: `REQ-20260708-088`
- Privacy classification: contact_private

## Raw Intake

> Okay, and send me a WhatsApp also, from the rabbi to my number, [operator
> WhatsApp number ending 2631].

## Parsed Requirement

- `REQ-20260708-088`: Send one WhatsApp from the Rabbi/OneTime sender to the
  operator's WhatsApp number as a follow-up to the Rabbi provider setup email.

## Intended Safe Copy

> Hi, this is OneTimeOneTime Mishnah. I just resent the secure Rabbi workspace
> setup email. Please use the email link to log in. For safety, I am not sending
> the login link over WhatsApp.

## Blocker

- Live OneTime WAPI diagnostics for `rabbi_sheller_provider` /
  `one_time_mishnah_class` returned `auto_reply_ready=false`.
- Blockers: `ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled`;
  `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY`;
  `OneTime WAPI token missing`.
- A WhatsApp cannot be sent "from the rabbi" until the Rabbi/OneTime WAPI
  sender token/account is configured and verified.

## Resolution

- Shloimie then identified the previous secret-looking value as the Rabbi WAPI
  token and asked Codex to save it securely.
- The token was saved in gitignored `.secrets` files under
  `RAW-20260708-027`.
- Whapi health readback returned authenticated business sender status.
- One safe WhatsApp notice was sent to the operator number ending `2631`.
- Provider result: `status_code=200`, message id present, message id
  fingerprint `02b1625c5735`.

## Guardrails

- No WhatsApp/WAPI message was sent.
- No setup token, setup URL, session cookie, password, or full phone number was
  committed.
- No payment/access grant, DNS, Zoom, Vimeo, Drive, Stripe, or external CRM
  mutation was performed.
