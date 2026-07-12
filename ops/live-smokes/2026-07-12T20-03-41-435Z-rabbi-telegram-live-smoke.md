# Rabbi Telegram Live Smoke

Checked at: 2026-07-12T20:03:41.435Z
Approved by operator: true
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Attempted: true
Sent: true
HTTP status: 200
External write performed: true
Telegram send performed: true
Secret values printed: false

## Readiness

- Ready before send: true
- Status before send: ready
- Token configured: true
- Chat ID configured: true
- Ops credentials configured: true

## Result

- Provider: telegram
- Role alias: one_time_rabbi_operator
- Message label: Codex live smoke: Rabbi Telegram delivery verified before CRM agent work
- Blocker: none
- Error: none

## Guardrails

- One scoped Telegram message only.
- No token, chat ID, phone, email, class link, or private message body is printed.
- No email, WhatsApp/WAPI, payment, access, DNS, credential, provider-account, or CRM mutation is performed.
- The smoke uses the existing Rabbi / One Time role alias and notification formatter.

