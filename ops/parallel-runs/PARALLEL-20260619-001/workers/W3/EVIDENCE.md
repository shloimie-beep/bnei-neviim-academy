# W3 Evidence

Requirement: `REQ-20260619-403`

## Implementation Evidence

- Intake source contract: `src/platform/ingestion/intake-source.js`
- Folder setup contract: `src/platform/ingestion/intake-folders.js`
- Parent prompt queue: `src/platform/ingestion/prompt-queue.js`
- Parser facade: `src/platform/ingestion/canonical-parser.js`
- Agent closed loop: `src/platform/agent-control/closed-loop.js`
- WhatsApp prompt validator: `src/platform/prompts/whatsapp-parent-update.js`
- WhatsApp prompt v3: `content-memory/platform-prompts/whatsapp.md`
- Approved-example gate: `content-memory/whatsapp/examples.md`
- Product contract: `docs/product/ramble-queue-contract.md`

## Verification Evidence

- `node --check src/platform/ingestion/intake-source.js; node --check src/platform/ingestion/intake-folders.js; node --check src/platform/ingestion/prompt-queue.js; node --check src/platform/ingestion/canonical-parser.js`
- `node --check src/platform/agent-control/closed-loop.js; node --check src/platform/prompts/whatsapp-parent-update.js`
- `node --check tests/ingestion/w3-intake-source.test.js; node --check tests/ingestion/w3-parser-queue.test.js; node --check tests/ingestion/w3-whatsapp-prompt.test.js; node --check tests/agent-control/w3-closed-loop.test.js`
- `node --test tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-whatsapp-prompt.test.js tests/agent-control/w3-closed-loop.test.js` passed 12/12.
- `node scripts/ramble-intake-contract.mjs --text="Task: Codex should verify the ramble queue. Decision: choose Drive setup approval."` passed.
- `node scripts/prompt-queue-contract.mjs --text="Prompt packet: build the durable ramble queue."` passed.
- `$env:NODE_PATH='C:\Users\User\BNA v2.0\node_modules'; node --test tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-whatsapp-prompt.test.js tests/agent-control/w3-closed-loop.test.js tests/intake-parser.test.js tests/operations-content-prompt-feedback.test.js tests/telegram-ramble-routing-regression.test.js tests/agent-control-api-readback.test.js` passed 41/41.
- `git diff --check` passed with line-ending warnings for edited Markdown files only.

## Compatibility Note

An exploratory broader run including `tests/agent-control-center.test.js`
reported a shared `public/operations.html` script-marker mismatch. W3 did not
edit `public/operations.html` because it is on the shared-file deny list; Prompt
05 should resolve shared UI test drift if that test remains required after
worker merge.

## External Gates

No external writes were performed. Drive mutation, Telegram send/report,
production DB mutation, deploy/live smoke, Railway, DNS, credentials, live
OAuth, email, WhatsApp sending, Vimeo, Zoom, Resend, billing, and Buffer remain
outside W3.
