# RAW-20260712-010 - One Time WAPI auto-reply live approval

Source channel: codex_chat
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Received: 2026-07-12
Parse status: registered
Related register: `tasks-pending/2026-07-12-onetime-wapi-webhook-bot-not-responding.md`

## Raw Source

User approved enabling live One Time WhatsApp auto-replies: "Yes aproved to make it live"

## Status Finding

This approval clears `DEC-20260712-501` for the scoped One Time WhatsApp auto-reply path only. Codex enabled the three live auto-reply flags on the One Time Railway production service, redeployed the service, and verified the live app reports the auto-reply gate ready with no blockers.

## Redacted Evidence

- Railway variable set output confirmed only these keys were updated:
  `ONE_TIME_PROVIDER_LEAD_BOT_MODE`,
  `ONE_TIME_WAPI_AUTO_REPLY_ENABLED`, and
  `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM`.
- Redacted variable readback showed live mode and approval flags set, with
  WAPI token, webhook secret, instance ID, and sender phone metadata present.
- Railway redeployment `ee81b96e-a5a3-4645-b922-13cf237e3200` reached
  `SUCCESS`.
- Live WAPI diagnostics reported `auto_reply_readiness.ready=true`, empty
  blockers, `credential_scope=one_time_scoped`, class link configured,
  webhook secret configured, instance binding configured, and sender binding
  configured.
- Telegram notifications remain unapproved and disabled.
- Live public smokes passed for the One Time separate instance and Rabbi
  One Time landing/signup surfaces.

## Guardrails

- No raw phone numbers, raw email addresses, raw Zoom URL, webhook secret,
  API token, admin password, or message body is stored in this tracked record.
- No manual WhatsApp message was sent during the flag enablement.
- Approval applies only to scoped One Time WhatsApp auto-replies, not Telegram
  alerts, campaigns, payments, DNS, access grants, or unrelated providers.
