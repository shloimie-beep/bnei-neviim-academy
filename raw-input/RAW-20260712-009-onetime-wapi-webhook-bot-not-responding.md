# RAW-20260712-009 - One Time WhatsApp bot not responding

Source channel: codex_chat
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Received: 2026-07-12
Parse status: registered
Requirement register: `tasks-pending/2026-07-12-onetime-wapi-webhook-bot-not-responding.md`

## Raw Source

User reported that the One Time WhatsApp bot was not responding.

## Status Finding

The One Time reminder sends were separate from inbound WhatsApp bot behavior.
Live inspection found the Whapi channel had no inbound webhook configured, and
then three app-side webhook processing defects blocked test callbacks. Codex
configured the scoped One Time Whapi channel webhook, fixed the inbound
processing path, deployed each fix, and confirmed the final provider webhook
test reached the app and was filed as a communication.

Automatic live replies remain intentionally disabled pending explicit operator
approval because enabling them would send outbound WhatsApp replies to inbound
contacts.

## Redacted Evidence

- Initial provider settings readback showed no webhook entries.
- Final provider settings readback showed a webhook for One Time app inbound
  messages with the custom verification header configured; no secret value was
  printed or stored.
- Final provider webhook test returned HTTP 200 with success true.
- Live DB readback showed webhook log ID `4`, status `processed`,
  event type `messages`, message type `text`, communication ID `58`, and
  processing note `One Time auto-reply skipped_observe_only`.
- Code commits pushed to `master`: `e23a02bb`, `66ab1aa2`, `8b24c3c`,
  `92bcc2e`.
- Railway deployments succeeded: `36d9b09d-796c-4a84-9d4a-899ce1679198`,
  `e5321a4e-3fb0-4f02-ac3d-e6c3d3103113`,
  `2d6cffb6-c60b-4a97-889c-8597aa13e512`,
  `5417ad1f-5974-4f8d-871d-2366c655cb2b`.
- Verification passed: `node --test tests/service-provider-lead-bot.test.js tests/one-time-wapi-scope-contract.test.js tests/one-time-delivery-outbox.test.js`
  16/16, `node --check server.js`, and redacted leak scans.

## Guardrails

- No raw phone numbers, raw email addresses, raw Zoom URL, webhook secret,
  API token, or message body is stored in this tracked record.
- No manual WhatsApp send was performed during the inbound webhook repair.
- No live auto-reply mode was enabled.
