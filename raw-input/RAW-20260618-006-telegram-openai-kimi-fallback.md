# RAW-20260618-006 - Telegram OpenAI Primary / Kimi Fallback Fix

- Source channel: `codex_chat`
- Created at: `2026-06-18`
- Parse status: `implemented`
- Requirement register: `tasks-pending/2026-06-18-telegram-openai-kimi-fallback.md`
- Created requirement IDs: `REQ-20260618-401`, `REQ-20260618-402`, `REQ-20260618-403`, `REQ-20260618-404`
- Created task IDs: `TASK-20260618-401`, `TASK-20260618-402`
- Created decision IDs: none.
- Open question IDs: none.

## Raw wording

> Just fix the Telegram bot. Fix the Telegram bot that the OpenAI key, it should be in our system, and if not, we should just have the Kimi fallback. It should be working.

## Parsed intent

- Make the academy Telegram bot use OpenAI as the primary hosted Assistant provider when the OpenAI key is configured and healthy.
- Keep Kimi configured as fallback when OpenAI is missing or a provider request fails.
- Fix Telegram content-generation paths that were still OpenAI-only.
- Deploy and verify the hosted academy Telegram worker.

## Implementation Summary

- Local OpenAI diagnostics passed using the keyholder `openaiv2.txt` source; no raw key value was printed or copied into tracked files.
- Telegram worker provider order was changed to OpenAI primary with Kimi fallback.
- `scripts/telegram-kimi-bridge.mjs` now routes Telegram text-generation paths through the shared OpenAI/Kimi provider chain:
  - ordinary Assistant chat
  - WhatsApp draft generation
  - Facebook draft generation
  - weekly report generation
  - transcript topic inventory
  - content title generation
  - content draft revision
  - image description, with a caption fallback if no provider can describe the image
- OpenAI-only throws were removed from those content-generation paths. OpenAI remains required for transcription because Kimi is not the transcription provider.

## Deployment Proof

- Deployed worker code bundle:
  - `d4df557d-c041-4293-add1-e8ccd8f0bc79`
  - Status: `SUCCESS`
- Set hosted academy worker `BNA_AI_PRIMARY_PROVIDER=openai`; Railway created:
  - `ae652bb9-572d-4a22-b2e9-ecc9dae5cb9a`
  - Status: `SUCCESS`
- Worker startup log:
  - `ApiPath=OpenAI API (gpt-4.1-mini) -> Kimi API (kimi-k2.6)`
  - `OpenAIKey=yes`
  - `KimiKey=yes`

## Verification

- PASS `node --check scripts/telegram-kimi-bridge.mjs`.
- PASS `node --test tests/ai-provider-selection.test.js tests/telegram-runtime-status.test.js tests/telegram-media-routing.test.js` 24/24.
- PASS `npm test` 784/784.
- PASS `npm run openai:diagnose`, report `ops/qa-runs/2026-06-18T15-39-48-438Z-openai-diagnostics.md`.
- PASS Kimi API health check: status 200, reply present.
- PASS Railway worker `ae652bb9-572d-4a22-b2e9-ecc9dae5cb9a` reached `SUCCESS`.
- PASS Telegram status API: configured, `bridge_polling_hosted_worker`, blockers empty.
- PASS Telegram `getWebhookInfo`: no webhook URL, pending updates 0, no last error.

## Guardrails

- No raw OpenAI, Kimi, Telegram, Railway, or Google secret value was printed or stored in tracked files.
- No Telegram message, WhatsApp message, social post, payment, DNS/account change, or Drive permission change was sent/performed.
