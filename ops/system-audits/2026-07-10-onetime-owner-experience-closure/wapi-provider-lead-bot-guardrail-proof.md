# One Time WAPI Provider Lead-Bot Guardrail Proof

Checked at: 2026-07-10T14:55:52.762Z

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Verdict

- Provider lead-bot guardrail implementation: implemented locally and ready for review.
- Full WhatsApp commercial automation: blocked.
- External write performed by this proof pass: false.
- WhatsApp send performed by this proof pass: false.
- CRM mutation performed by the readiness proof pass: false.
- Secret values printed: false.

## Implemented Guardrails

- Added the One Time provider lead-bot profile for `Robot Scheller`, scoped to WhatsApp and the One Time workspace/project.
- The bot cannot impersonate Rabbi Scheller, charge, grant access, or release class join instructions from model output.
- Class join instructions are released only when the server verifies `active_member` access.
- WAPI webhooks require server-side header secret authentication in hosted runtime; query-string secrets are not accepted.
- One Time WAPI webhooks require provider instance and sender-number binding before live auto-reply.
- Auto-reply requires One Time-scoped WAPI credentials, live mode, explicit WhatsApp approval, explicit Telegram approval, and configured class link.
- Outbound reply attempts are claimed before send to avoid duplicate replies.
- Stored metadata uses redacted audit bodies when a restricted class link is sent.
- Telegram routing uses explicit role aliases: `one_time_rabbi_operator` and `platform_support_shloimie`.

## Current Blockers

- Whapi/WAPI instance id missing.
- WhatsApp sender phone metadata missing.
- WAPI webhook secret missing.
- `ONE_TIME_WAPI_AUTO_REPLY_ENABLED` is not enabled.
- `ONE_TIME_WAPI_AUTO_REPLY_CONFIRM` must equal `APPROVE_ONE_TIME_WAPI_AUTO_REPLY`.
- `ONE_TIME_PROVIDER_LEAD_BOT_MODE` must equal `live`.
- `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` must equal `APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM`.

## Verification

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/provider-lead-bot.js`
- PASS `node --check scripts/check-onetime-wapi-readiness.mjs`
- PASS `node --test tests/service-provider-lead-bot.test.js tests/one-time-wapi-scope-contract.test.js tests/rabbi-telegram-notifications.test.js`
- EXPECTED BLOCKED `npm run one-time:wapi:readiness -- --json`

## Evidence

- `config/service-provider-bots/one-time.json`
- `config/service-provider-bots/schema.json`
- `src/lib/bna/provider-lead-bot.js`
- `server.js`
- `src/lib/bna/telegram-notifications.js`
- `scripts/check-onetime-wapi-readiness.mjs`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`
- `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.json`
