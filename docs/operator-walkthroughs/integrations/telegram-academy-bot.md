# Telegram Academy Bot Walkthrough

Purpose: academy Telegram bridge for Assistant/Codex mode switching, intake,
media capture, task routing, and social draft handoff.

1. Open `/integration-setup.html#telegram-academy-bot`.
2. Open https://t.me/BotFather.
3. Confirm the bot belongs to the academy bot, not the old family bot.
4. Use these variable names:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_TOKEN_BNA`
   - `TELEGRAM_WEBHOOK_SECRET`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_CHAT_ID_BNA`
   - `TELEGRAM_BRIDGE_PROFILE`
   - `TELEGRAM_PRIMARY_AGENT`
   - `TELEGRAM_DEFAULT_REPLY_MODE`
5. Store token values only in approved secret storage.
6. Run `node scripts/telegram-kimi-bridge.mjs --status`.
7. Expected success: bridge status names profile, bot identity, provider path,
   and configured/missing state without printing tokens.
8. External effects: status check should not send messages.
9. Live acceptance requires correct bot profile, allowed chat IDs, media
   capture, provider routing, and concise completion reports when requested.
