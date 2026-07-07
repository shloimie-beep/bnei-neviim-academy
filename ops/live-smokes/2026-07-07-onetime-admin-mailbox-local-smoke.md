# One Time Admin Mailbox Local Browser Smoke

Generated: 2026-07-07T07:32:13+03:00

Scope: `RAW-20260707-002`, `REQ-20260707-021` through `REQ-20260707-024`

Environment: local temporary static server with Playwright API stubs. No
production database, external provider, email send, payment, access grant, DNS
write, Drive write, or provider-account mutation was performed.

## Checks

- PASS desktop Operations URL:
  `/operations?workspace=platform&view=communications&section=email&inbox=rabbi`
- PASS visible selector text:
  `Now Viewing: Rabbi / One Time Inbox`
- PASS visible scope label:
  `info@onetimeonetime.com / rabbi_sheller_provider / one_time_mishnah_class`
- PASS visible actions:
  `ACTION-OPERATIONS-EMAIL-INBOX-RABBI` and
  `ACTION-ONETIME-PROVIDER-SESSION-START`
- PASS mobile provider URL:
  `/provider.html?admin_provider=one-time&section=mailbox`
- PASS visible admin banner:
  `ADMIN ON RABBI ACCOUNT`
- PASS provider banner return action:
  `ACTION-ONETIME-PROVIDER-SESSION-EXIT`
- PASS provider mailbox section rendered in the admin-on-provider session.

## Guardrails

- Browser smoke used synthetic stubbed records only.
- No raw private email bodies, contact exports, cookies, passwords, session
  tokens, API keys, or private sender lists were committed.
- Send controls remain gated by existing `SEND_RESEND_EMAIL` confirmation and
  server readiness checks.
