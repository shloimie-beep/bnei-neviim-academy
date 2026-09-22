# Whapi WhatsApp Log Sync Verification

Task: 511
Captured: 2026-06-12
Status: locally implemented and relevant checks pass; fleet baseline is blocked by OpenAI credentials.

## Implemented

- Added admin-only Whapi/WAPI history sync using `GET /messages/list` and chat-scoped `GET /messages/list/{ChatID}`.
- Imports sent and received messages into `bna_contact_communications` with original Whapi timestamps, direction, message id metadata, and duplicate-safe handling.
- Adds `bna_wapi_sync_runs` audit rows for every dry run or import run.
- Matches messages to parent leads, signup parents, and students by normalized phone number when possible.
- Adds Operations Communications > WhatsApp controls for Sync Now and dry-run preview.
- Adds Telegram `/wapi_sync`, `/whatsapp_sync`, `/wa_sync`, and `/wapi_status` paths.
- Documents `WHAPI_API_TOKEN`, `WHAPI_API_BASE_URL`, and `WAPI_SYNC_TIMEOUT_MS` in `.env.example`.

## Verification On Attempt 2

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/whapi-log-sync-contract.test.js tests/action-registry-telegram-ui-bot.test.js tests/operations-saas-crm-redesign.test.js`, 25/25
- PASS `npm test`, 293/293
- FAIL `npm run openai:smoke`

OpenAI smoke report:
`ops/openai-smokes/2026-06-12T14-24-22-211Z-openai-sidekick-smoke.md`

The smoke successfully read repo context, protected app APIs, Operations endpoints, and Drive folders, then failed because the configured OpenAI API key returned `401 invalid_api_key`. This is not a Whapi sync regression.

## Remaining Blocker

The shared fleet baseline needs a valid OpenAI API key before it can pass `npm run openai:smoke`. After that, deploy the changed app bundle and run Railway doctor/live smoke before marking the app-visible task done.
