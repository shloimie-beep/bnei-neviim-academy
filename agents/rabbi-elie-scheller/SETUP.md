# Rabbi Elie Scheller Scoped Bot Setup

Status: wired in repo, needs live secrets before use.

## Runtime Commands

- Local foreground check: `npm run telegram:rabbi`
- Hidden background start: `npm run telegram:rabbi:start`

The Rabbi profile uses separate runtime files from the academy bot:

- `.runtime/telegram-kimi-bridge-rabbi-elie-scheller.lock`
- `.runtime/telegram-kimi-bridge-rabbi-elie-scheller.log`
- `.runtime/telegram-chat-modes-rabbi-elie-scheller.json`
- `.runtime/telegram-pending-decisions-rabbi-elie-scheller.json`

## Required Env Values

These are still needed before the live Rabbi bot can run:

- `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`: Telegram bot token for Rabbi Elie
  Scheller's separate bot. Local file alternative:
  `.secrets/telegram-rabbi-elie-scheller-bot-token.txt`.
- `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`: allowed Telegram chat ID for Rabbi
  Elie Scheller. Without this, the bot permits all chats that know the token.
- `ONE_TIME_OPS_USERNAME`: scoped Operations username for the One Time Mishnah
  Class task workspace.
- `ONE_TIME_OPS_PASSWORD`: scoped Operations password for the One Time Mishnah
  Class task workspace.

Backward-compatible aliases also work:

- `RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN`
- `RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID`
- `RABBI_ELIE_SCHELLER_OPS_USERNAME`
- `RABBI_ELIE_SCHELLER_OPS_PASSWORD`

## Optional Env Values

- `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`

Keep this false unless Shloimie explicitly wants the Rabbi bot to execute Codex
repo work. The default scoped path is OpenAI/Kimi chat plus One Time
task/comment APIs only.

## Scope

The bot is scoped to One Time Mishnah Class project routes:

- list One Time tasks
- create explicit One Time tasks
- add comments to One Time tasks
- brainstorm, summarize, and ask before task creation when intent is not
  explicit

It does not request BNA Students, Accounting, Devices, broad Content jobs, Drive
pipeline, GHL posting, agent fleet, or OpenAI smoke commands.
