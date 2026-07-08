# Rabbi Telegram / Ticket Alert Readiness

Checked at: 2026-07-08T18:38:27.823Z

## Summary

- Rabbi Telegram status: blocked_missing_runtime_config
- Rabbi Telegram ready: false
- Super-admin ticket alerts enabled: false
- Super-admin Telegram target ready: true
- Dry-run would send ticket alert: false
- External write performed: false

## Rabbi Telegram Blockers

- TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER is not configured.

## Dry-Run Ticket Alert Preview

```text
Support ticket opened
- Ticket: new ticket
- Scope: rabbi_sheller_provider / one_time_mishnah_class
- Severity: normal
- Category: bot_api
- Title: Readiness dry-run support ticket
- Source: readiness_check
- Review: /operations?view=admin&section=tickets
```

## Guardrails

- No Telegram message was sent by this readiness check.
- No token or chat ID is printed in this report.
- The ticket alert body is intentionally brief and does not include raw private ticket descriptions.
