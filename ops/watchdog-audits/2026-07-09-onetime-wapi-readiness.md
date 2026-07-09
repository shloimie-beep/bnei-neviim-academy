# OneTime WAPI / WhatsApp Readiness

Checked at: 2026-07-09T14:50:31.663Z

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Mode: readiness_no_send
External write performed: false
WhatsApp send performed: false
CRM mutation performed: false
Secret values printed: false

## Summary

- Outbound configured: true
- Credential scope: one_time_scoped
- Provider setup ready: false
- Auto-reply ready: false
- Auto-reply enabled: false
- Auto-reply approved: false
- Class link configured: true

## Blockers / Next Actions

- Whapi/WAPI instance id missing
- WhatsApp sender phone metadata missing
- ONE_TIME_WAPI_AUTO_REPLY_ENABLED not enabled
- ONE_TIME_WAPI_AUTO_REPLY_CONFIRM must equal APPROVE_ONE_TIME_WAPI_AUTO_REPLY

## Guardrails

- Readiness check only; no WhatsApp message is sent.
- No CRM contact, tag, lead, or communication row is created or updated.
- No secret values, chat IDs, raw class links, or phone numbers are printed.
- OneTime auto-reply requires OneTime-scoped WAPI credentials, an approved flag, and a configured class link.
