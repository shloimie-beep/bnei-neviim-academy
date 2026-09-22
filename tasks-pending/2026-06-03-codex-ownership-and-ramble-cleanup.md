# Codex Ownership And Ramble Cleanup

Date: 2026-06-03

## Status

Completed locally; deploy/restart needed for live bridge behavior if not already restarted.

## Operator Intent

- Telegram should feel like talking directly to Codex in the repo.
- Raw rambles should be refined into normal task titles before becoming visible.
- Raw wording should be kept only as provenance in memory or `ai_parsed.original_text`.
- Codex is the active development agent and visible machine-work owner.
- Kimi is fallback only for provider/API failures or legacy callbacks.
- Telegram task captures should not show owner/status buttons after each task.
  Ownership and routing should be inferred by the parser and summarized in plain text.

## Implementation Notes

- `server.js` now infers machine/system/coding work as `Codex`.
- `server.js` content generation now prefers OpenAI when configured and uses Kimi only as fallback.
- `scripts/telegram-kimi-bridge.mjs` no longer sends per-task quick action buttons.
  Capture summaries now show the inferred owner and Tasks section in plain text.
- Old `task:kimi` callbacks are still accepted for compatibility, but assign to `Codex`.
- The secondary Telegram webhook confirmation now sends polished `Captured:` task titles instead of echoing the raw message.
- `AGENTS.md`, `MEMORY.md`, `SYSTEM-STATE.md`, and `TASKS.md` were updated with the new rule.

## Verification

- Run `node --check server.js`.
- Run `node --check scripts/telegram-kimi-bridge.mjs`.
- Restart the Telegram bridge after deploy/restart.
- Smoke a Telegram ramble and confirm no per-task owner/status buttons are sent.
  The capture reply should show the inferred owner and section instead.
