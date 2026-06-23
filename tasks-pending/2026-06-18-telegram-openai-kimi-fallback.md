# Telegram OpenAI Primary / Kimi Fallback - 2026-06-18

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260618-006 |
| Source | codex_chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-18-telegram-openai-kimi-fallback.md |

## Parsed Requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260618-401 | Verify OpenAI key availability without exposing the key. | "the OpenAI key, it should be in our system" | Diagnostics show OpenAI key is present and usable; no raw secret is printed. | Keyholder, diagnostics, Telegram config | `npm run openai:diagnose`; worker startup log booleans only. | Done |
| REQ-20260618-402 | Keep Kimi as fallback when OpenAI is missing or fails. | "if not, we should just have the Kimi fallback" | Telegram hosted Assistant/content paths use provider chain instead of OpenAI-only hard failures. | Telegram bridge provider selection | Focused provider regression tests; Kimi health check. | Done |
| REQ-20260618-403 | Make hosted academy Telegram worker OpenAI-primary. | "Fix the Telegram bot" | Worker starts with `OpenAI -> Kimi`, both keys present, and status healthy. | Railway `academy-telegram-worker` | Railway deploy/status/logs; Telegram status API; webhook info. | Done |
| REQ-20260618-404 | Record proof and guardrails. | "It should be working." | Intake, register, ledger, changelog, and worker runbook show what changed and what was verified. | Repo operating records | File inspection and JSONL parse. | Done |

## Parsed Tasks

| ID | Task | Owner | Lane | Done definition | Status |
|---|---|---|---|---|
| TASK-20260618-401 | Patch Telegram content generation to use OpenAI/Kimi provider fallback | Codex | Telegram bot | WhatsApp, Facebook, weekly report, transcript topic, title, draft-revision, and image-description paths no longer fail just because OpenAI is unavailable. | Done |
| TASK-20260618-402 | Deploy and verify academy Telegram worker OpenAI-primary runtime | Codex | Deployment | Worker deployment succeeds, startup log shows OpenAI primary and Kimi fallback, status API and webhook checks pass. | Done |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260618-401 | Done | `npm run openai:diagnose` passed with selected source `keyholder:openaiv2.txt`; OpenAI `/v1/models` and `/v1/responses` returned 200. Worker startup log reports `OpenAIKey=yes` without printing the key. | `raw-input/RAW-20260618-006-telegram-openai-kimi-fallback.md`, this register | `ops/qa-runs/2026-06-18T15-39-48-438Z-openai-diagnostics.md` | None. |
| REQ-20260618-402 | Done | Added `runConfiguredChatCompletion()` and routed Telegram content generation through `apiProviderConfigs(config)`. Kimi API health check returned status 200 with a reply. | `scripts/telegram-kimi-bridge.mjs`, `tests/ai-provider-selection.test.js` | Focused tests 24/24; `npm test` 784/784; Kimi health check status 200. | OpenAI remains the transcription provider for audio/video transcription. |
| REQ-20260618-403 | Done | Worker deployment `d4df557d-c041-4293-add1-e8ccd8f0bc79` shipped the code patch and reached `SUCCESS`. Variable change created worker deployment `ae652bb9-572d-4a22-b2e9-ecc9dae5cb9a`, also `SUCCESS`. Latest startup log shows `ApiPath=OpenAI API (gpt-4.1-mini) -> Kimi API (kimi-k2.6)`, `OpenAIKey=yes`, and `KimiKey=yes`. | `ops/academy-telegram-worker.md` | Railway service status; worker logs; Telegram status API configured with empty blockers; Telegram webhook pending updates 0. | None. |
| REQ-20260618-404 | Done | Raw intake, register, memory, worker runbook, changelog, and ledger were updated. | `raw-input/RAW-20260618-006-telegram-openai-kimi-fallback.md`, `tasks-pending/2026-06-18-telegram-openai-kimi-fallback.md`, `memory/2026-06-18.md`, `MEMORY.md`, `ops/academy-telegram-worker.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl` | Ledger JSONL parsed after append. | None. |

## Guardrails

- No raw secret values were printed or committed.
- No Telegram send, WhatsApp send, social publish, payment, DNS/account change, or Drive permission change was performed.
