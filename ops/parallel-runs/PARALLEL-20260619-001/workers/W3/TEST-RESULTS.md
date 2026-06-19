# W3 Test Results

Requirement: `REQ-20260619-403`

## Results

| Command | Result |
| --- | --- |
| `node --check src/platform/ingestion/intake-source.js; node --check src/platform/ingestion/intake-folders.js; node --check src/platform/ingestion/prompt-queue.js; node --check src/platform/ingestion/canonical-parser.js` | PASS |
| `node --check src/platform/agent-control/closed-loop.js; node --check src/platform/prompts/whatsapp-parent-update.js` | PASS |
| `node --check tests/ingestion/w3-intake-source.test.js; node --check tests/ingestion/w3-parser-queue.test.js; node --check tests/ingestion/w3-whatsapp-prompt.test.js; node --check tests/agent-control/w3-closed-loop.test.js` | PASS |
| `node --test tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-whatsapp-prompt.test.js tests/agent-control/w3-closed-loop.test.js` | PASS 12/12 |
| `node scripts/ramble-intake-contract.mjs --text="Task: Codex should verify the ramble queue. Decision: choose Drive setup approval."` | PASS |
| `node scripts/prompt-queue-contract.mjs --text="Prompt packet: build the durable ramble queue."` | PASS |
| `$env:NODE_PATH='C:\Users\User\BNA v2.0\node_modules'; node --test tests/ingestion/w3-intake-source.test.js tests/ingestion/w3-parser-queue.test.js tests/ingestion/w3-whatsapp-prompt.test.js tests/agent-control/w3-closed-loop.test.js tests/intake-parser.test.js tests/operations-content-prompt-feedback.test.js tests/telegram-ramble-routing-regression.test.js tests/agent-control-api-readback.test.js` | PASS 41/41 |
| `git diff --check` | PASS with line-ending warnings for `content-memory/platform-prompts/whatsapp.md` and `content-memory/whatsapp/examples.md` |

## Non-W3 Shared-File Note

An exploratory run that included `tests/agent-control-center.test.js` failed on
the test helper looking for `<script>\n        // API Client` in
`public/operations.html`. W3 cannot edit `public/operations.html`; shared UI
test drift is listed for Prompt 05 in `INTEGRATION.md`.
