# W3 Baseline

Requirement: `REQ-20260619-403`
Branch: `parallel/20260619-ingestion`
Worktree: `C:\Users\User\BNA-worktrees\20260619-ingestion`

## Inspected

- `src/lib/bna/intake-parser.js`
- `src/lib/bna/intake-schema.js`
- `src/lib/bna/ramble-protocol.js`
- `src/lib/bna/task-shaping.js`
- `src/lib/bna/agent-control.js`
- `scripts/google-drive-setup.mjs`
- `scripts/telegram-kimi-bridge.mjs`
- `scripts/agent-fleet-supervisor.mjs`
- `content-memory/platform-prompts/whatsapp.md`
- `content-memory/whatsapp/examples.md`
- Existing parser, ramble, agent-control, Telegram routing, and content prompt tests

## Classification

| Area | Status | Evidence |
| --- | --- | --- |
| Drive raw-media ingestion | partial | Existing `scripts/google-drive-setup.mjs` has Raw Media Intake and content-library folders, but not the W3 `00 Upload Here - Rambles & Prompts` folder contract. |
| Transcript export | already_verified | `scripts/export-content-transcripts.mjs` exports live transcript jobs into `content-memory/transcripts`. |
| Telegram capture | partial | `scripts/telegram-kimi-bridge.mjs` calls canonical intake parsing and emits raw-capture confirmations, but parent prompt queue view models are not wired. |
| Task parser | partial | `src/lib/bna/intake-parser.js` has stable IDs, ramble protocol metadata, One Time alias cues, and broad routing tests; W3 adds a schema-constrained platform facade. |
| Content parser | partial | Content job generation and prompt feedback exist; private-data/public-content W3 guard is added locally for integration. |
| Agent-fleet supervisor | partial | Existing queue claim, heartbeat, completion, blocker, and stale sweep logic exists; W3 adds work-package retry/seal helpers for Prompt 05 integration. |
| Agent Control Center/run model | partial | Existing SQL/routes/UI/tests support agent runs and evidence sealing; W3 adds provider-neutral closed-loop package helpers. |
| Execution-run protocol | already_verified | `npm run bna:run:status` passed in the main checkout and the linked run lists W3 as open. |
| Prompt/task ledger | partial | Existing ledgers/changelog exist but W3 cannot edit shared ledger/changelog under worker ownership rules. |
| Decisions | partial | Existing parser and task APIs can create Decisions; W3 adds one concise ambiguity Decision in the parser facade. |
| Current queue/status surfaces | partial | Operations has Codex Queue and agent heartbeat surfaces; W3 adds `/queue`, `/prompt <id>`, and `/ramble_status` view models for shared wiring. |
| Retry/lock/state behavior | partial | Existing agent jobs have heartbeat/stale sweep; W3 adds deterministic retry-limit requeue or operator Decision behavior. |
| WhatsApp parent update prompt | partial | Existing prompt was v2-style guidance; W3 installs v3 prompt and local validator. |
| External Drive mutation | blocked_external | W3 did not mutate Drive. Folder creation requires Prompt 05 or explicit operator-approved Drive setup. |
