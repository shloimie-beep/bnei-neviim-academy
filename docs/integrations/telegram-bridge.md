# Telegram Bridge Status And Restart Notes

Status: Telegram is useful, but the web helper and Operations dashboard remain
the primary surfaces for critical workflows.

## Active Source

- Active bridge: `scripts/telegram-kimi-bridge.mjs`
- Start helper: `scripts/start-telegram-kimi-bridge.ps1`
- Runtime lock/log: `.runtime/telegram-kimi-bridge*.lock` and
  `.runtime/telegram-kimi-bridge*.log`
- Legacy/fallback server route: `/api/bna/telegram`

The advanced bridge handles hosted Assistant chat, Codex routing, media intake,
Drive context, task watch state, and mode switching. The server route is not the
main operator workflow.

## Status Checks

- Operations Integrations > Readiness shows token configured/not configured,
  allowed chat IDs configured/not configured, bridge lock/log presence, stale
  lock warning, and active source.
- Protected API readback is available at
  `GET /api/bna/integrations/telegram/status`. It returns redacted metadata
  only: booleans, lock/log age, active source, and blocker text.
- Do not expose bot tokens or chat IDs in screenshots, logs, reports, or task
  titles.

## Common Reliability Causes

- Missing or wrong bot token.
- Missing allowed chat ID.
- Stale lock file or old bridge process.
- Polling/webhook conflict.
- OpenAI/Kimi credential fallback missing.
- Drive credentials missing for Drive-aware replies.
- Codex queue delays.
- Long replies truncated by Telegram.

## Safe Restart

1. Check Operations Integrations > Readiness for lock/log age.
2. Stop old local bridge processes if they are stale.
3. Restart with `npm run telegram:kimi:start` for BNA or
   `npm run telegram:rabbi:start` for Rabbi/One Time.
4. Confirm the log updates and the bot responds to `/status` or `/help`.

Critical sends, billing, publishing, account grants, Zoom writes, video uploads,
Google writes, and member publishing must stay in web/Operations approval flows.
