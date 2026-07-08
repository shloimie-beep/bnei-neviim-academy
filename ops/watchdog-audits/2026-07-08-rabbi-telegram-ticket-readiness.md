# Rabbi Telegram / Ticket Alert Readiness

Checked at: 2026-07-08T20:29:53.474Z

## Summary

- Rabbi Telegram status: blocked_missing_runtime_config
- Rabbi Telegram ready: false
- Super-admin ticket alerts enabled: false
- Super-admin Telegram target ready: true
- Dry-run would send ticket alert: false
- Rabbi communication alerts enabled: false
- Dry-run would send Rabbi communication alert: false
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

## Dry-Run Rabbi Communication Alert Preview

```text
OneTime communication received
- Communication: new communication
- Scope: rabbi_sheller_provider / one_time_mishnah_class
- Channel: whatsapp
- Direction: inbound
- Contact: OneTime contact
- Subject: Readiness dry-run OneTime communication
- Source: readiness_check
- Review: /provider.html?admin_provider=one-time&section=mailbox
```

## Guardrails

- No Telegram message was sent by this readiness check.
- No token or chat ID is printed in this report.
- The ticket alert body is intentionally brief and does not include raw private ticket descriptions.
- The Rabbi communication alert body is metadata-only and does not include raw private message bodies.
