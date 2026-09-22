# Telegram Bot Status Audit - 2026-06-17

Source raw ID: `RAW-20260617-010`

## Checklist

| Check | Result | Evidence |
|---|---|---|
| Bridge process | Stale/not running | `.runtime/telegram-kimi-bridge.lock` records PID `85456` from 2026-06-12, but no matching live `telegram-kimi-bridge` process was found. Current `node server.js` PID is a local web smoke server, not the Telegram bridge. |
| Bot token configured | Present/redacted | `.secrets/telegram-bot-token.txt` and `.secrets/telegram-rabbi-elie-scheller-bot-token.txt` exist; only file metadata was inspected. |
| Latest update offset | Present | `.runtime/telegram-kimi-offset-8608591857.json` contains an offset value; no message body was read or printed. |
| Safe command response | Blocked | No Telegram message was sent because the bridge appears stale/not running and a safe interactive smoke path was not already active. |
| Raw intake capture | Partially verified | Parser/raw-intake code and raw watchdog are present; live Telegram capture cannot be proven until the bridge restarts and a safe `/status` or capture smoke is approved. |
| OpenAI/Kimi mode | Configured/redacted | Stale lock records default reply mode `openai` and build agent `codex`; current AGENTS policy allows Kimi-primary only as an explicit temporary hosted-chat mode while OpenAI account/key path is unresolved. |
| Errors/logs | Failing/stale | `.runtime/telegram-kimi-bridge.log` tail shows repeated `fetch failed`, then an aborted polling loop and skipped task watch on 2026-06-12. |
| Backlog count | Unknown/redacted | Offset exists, but unprocessed live Telegram backlog was not pulled because no safe active bridge/session smoke ran. |

## Guardrails

- Do not expose Telegram tokens, chat IDs tied to private people, raw private
  message bodies, or screenshots with private data.
- Do not send messages unless a safe smoke path is explicitly available.

## Status

Audit done. Operational status is blocked/stale: restart the Telegram bridge
through the approved local workflow, then run a safe `/status` or no-private-
body capture smoke and record the result. No Telegram send, token exposure,
chat ID exposure, or private message-body read was performed in this audit.
