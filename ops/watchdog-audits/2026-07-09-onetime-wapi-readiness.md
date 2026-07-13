# One Time WAPI / WhatsApp Readiness

Checked at: 2026-07-13T05:10:06.079Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Mode: readiness_no_send
External write performed: false
WhatsApp send performed: false
CRM mutation performed: false
Secret values printed: false

## Summary

- Outbound configured: true
- Credential scope: one_time_scoped
- Provider setup ready: true
- Auto-reply ready: true
- Auto-reply enabled: true
- Auto-reply approved: true
- Telegram notifications approved: false
- Telegram notifications ready: false
- Class link configured: true

## Blockers / Next Actions

- ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM must equal APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM

## Guardrails

- Readiness check only; no WhatsApp message is sent.
- No CRM contact, tag, lead, or communication row is created or updated.
- No secret values, chat IDs, raw class links, or phone numbers are printed.
- One Time auto-reply requires One Time scoped WAPI credentials, a valid provider-bot profile, header-authenticated instance/destination binding, live mode, explicit WhatsApp and Telegram approvals, and a configured class link.
