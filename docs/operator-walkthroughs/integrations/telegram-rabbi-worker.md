# Telegram Rabbi Worker Walkthrough

Purpose: separate Rabbi Elie Scheller Telegram worker profile for One Time
workspace communication.

1. Open `/integration-setup.html#telegram-rabbi-worker`.
2. Open https://t.me/BotFather.
3. Confirm the Rabbi-specific bot token and chat ID.
4. Use these variable names:
   - `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`
   - `RABBI_ELIE_SCHELLER_TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
   - `RABBI_ELIE_SCHELLER_TELEGRAM_CHAT_ID`
   - `ONE_TIME_TELEGRAM_CHAT_ID`
   - `BNA_RAILWAY_PROCESS`
5. Store token values only in approved secret storage.
6. Run `npm run telegram:rabbi` only when the worker run is intended.
7. Expected success: Rabbi profile starts and reports scoped configuration.
8. Expected missing target: token exists but chat ID or process selector is
   missing.
9. External effects: starting the worker can receive/send Telegram updates.
10. Live acceptance requires scoped worker deployment logs and no cross-scope
    data leakage.
