# Rabbi Telegram / Ticket Alert Readiness

Checked at: 2026-07-13T16:18:38.507Z

## Summary

- Rabbi Telegram status: ready
- Rabbi Telegram ready: true
- Super-admin ticket alerts enabled: false
- Super-admin Telegram target ready: true
- Dry-run would send ticket alert: false
- Rabbi communication alerts enabled: false
- Dry-run would send Rabbi communication alert: false
- External write performed: false

## Rabbi Telegram Blockers

- None

## Dry-Run Ticket Alert Preview

```text
Support ticket opened
- Ticket: new ticket
- Scope: rabbi_sheller_provider / one_time_mishnah_class
- Severity: normal
- Category: bot_api
- Title: Readiness dry-run support ticket
- Affected: bot_api
- Requested: Review requested
- Source: readiness_check
- Open in Operations: /operations?view=admin&section=tickets
```

## Dry-Run Rabbi Communication Alert Preview

```text
One Time communication received
- Communication: new communication
- Scope: rabbi_sheller_provider / one_time_mishnah_class
- Channel: whatsapp
- Direction: inbound
- Contact: One Time contact
- Subject: Readiness dry-run One Time communication
- Source: readiness_check
- Review: /provider.html?admin_provider=one-time&section=mailbox
```

## Guardrails

- No Telegram message was sent by this readiness check.
- No token or chat ID is printed in this report.
- The ticket alert body is intentionally brief and does not include raw private ticket descriptions.
- The Rabbi communication alert body is metadata-only and does not include raw private message bodies.
