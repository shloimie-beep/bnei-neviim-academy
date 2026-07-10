# Telegram Bridge Status And Restart Notes

Status: Telegram is useful, but the web helper and Operations dashboard remain
the primary surfaces for critical workflows.

## Active Source

- Active bridge: `scripts/telegram-kimi-bridge.mjs`
- Start helper: `scripts/start-telegram-kimi-bridge.ps1`
- Hosted academy worker runbook: `ops/academy-telegram-worker.md`
- Runtime lock/log: `.runtime/telegram-kimi-bridge*.lock` and
  `.runtime/telegram-kimi-bridge*.log`
- Legacy/fallback server route: `/api/bna/telegram`

The advanced bridge handles hosted Assistant chat, Codex routing, media intake,
Drive context, task watch state, and mode switching. The server route is not the
main operator workflow. The academy bot can run either from the local helper or
from the Railway `academy-telegram-worker` service.

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
- Drive credentials missing for Drive-aware replies or hosted Drive intake.
  The hosted worker needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_REFRESH_TOKEN`, and `GOOGLE_DRIVE_PIPELINE_CONFIG` as Railway
  reference variables if it is expected to watch the intake folders.
- Codex queue delays.
- Long replies truncated by Telegram.

## Safe Restart

1. Check Operations Integrations > Readiness for lock/log age.
2. If the academy bot is hosted, restart the Railway worker first and confirm
   the DB-backed runtime heartbeat becomes fresh again.
3. Stop old local bridge processes if they are stale.
4. Restart with `npm run telegram:kimi:start` for BNA or
   `npm run telegram:rabbi:start` for Rabbi / One Time.
5. Confirm the log or runtime heartbeat updates and the bot responds to
   `/status` or `/help`.

Critical sends, billing, publishing, account grants, Zoom writes, video uploads,
Google writes, and member publishing must stay in web/Operations approval flows.

## Drive Job Repair

If Drive auto-watch already created a content job but it is stuck at
`ingested` or has no transcript, repair the existing job instead of re-uploading
or creating a duplicate:

```powershell
node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 72 73 74 --auto-parse
```

The repair command re-downloads the Drive file, transcribes supported
audio/video/image media, patches the existing content job, records failures as
blocked notes, and can run the mixed-recording parser. Use `--dry-run` first
when only inspecting Drive metadata.
