# RAW-20260709-007 - OneTimeAIOS Bot Token Credential Intake

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-09T14:12:00+03:00
- Parse status: registered
- Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
- Linked register:
  `tasks-pending/2026-07-08-rabbi-telegram-ticket-agent-loop.md`
- Linked existing blockers:
  `DEC-20260708-016`, `DEC-20260708-021`

## Raw Source

Shloimie pasted the BotFather confirmation for `t.me/onetimeaios_bot`,
including a live Telegram Bot API token.

The token is intentionally redacted from this tracked raw record because it can
control the bot. Do not copy the token into committed files, prompts, issue
comments, logs, public artifacts, or Agent Mode instructions.

## Parsed Meaning

- `t.me/onetimeaios_bot` is the intended Rabbi / One Time Telegram bot.
- The local ignored Rabbi bot token file was already present before this
  intake.
- `npm run telegram:rabbi:readiness` reports the Rabbi token is configured and
  the scoped One Time Operations credentials are configured.
- `npm run telegram:rabbi:chat-id` resolved the bot as `onetimeaios_bot`,
  performed no external write, and found 0 pending chat candidates.
- The live Rabbi Telegram runtime remains blocked because
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is not configured.
- The next safe action is for the intended Rabbi account or group to send
  `/start` or any message to `t.me/onetimeaios_bot`; after that, Codex can run
  a safe `getUpdates`/readiness flow, set the allowed chat ID in ignored local
  and hosted runtime config, and run the scoped live smoke.

## Privacy

The pasted token is a secret and is not stored here. No raw contact exports,
private message bodies, student-sensitive details, passwords, API keys, access
links, or chat IDs were added to this tracked record.
