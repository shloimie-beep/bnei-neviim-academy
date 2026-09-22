# RAW-20260708-019 - OneTime direct Zoom-link-only email

Source: Codex chat
Captured: 2026-07-08
Channel: codex_chat
Workspace/project: rabbi_sheller_provider / one_time_mishnah_class
Parse status: registered

## Redacted Raw Operator Input

Operator instructed Codex to send the Zoom link by email to a single Gmail
recipient spelled in chat, with no portal link, login link, parent setup link,
student setup link, or account flow.

The raw email address and full Zoom password URL are private contact/access
data and are intentionally not stored in repo-visible evidence.

## Parsed Requirement

- `REQ-20260708-075`: Send a one-off OneTime Mishnayos Zoom-link-only email to
  the operator-specified recipient, without adding portal/login/setup links.

## Guardrails

- Use OneTime/Rabbi scope only: `rabbi_sheller_provider` /
  `one_time_mishnah_class`.
- Email body must contain only minimal class context and the Zoom link.
- Do not include parent portal, student portal, login, password reset,
  classroom code, billing, trial, marketing, or account setup links.
- Do not commit the raw recipient email or raw Zoom password URL.
- Do not send WhatsApp/WAPI/SMS or create a payment/access/account grant.
