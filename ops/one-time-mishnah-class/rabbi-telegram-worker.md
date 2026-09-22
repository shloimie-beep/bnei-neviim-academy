# Rabbi Telegram Worker

Last updated: 2026-06-10

## Intended Hosted Runtime

- Railway project: `skillful-motivation`
- Web service: `skillful-motivation`
- Worker service: `rabbi-telegram-worker`
- Worker process selector: `BNA_RAILWAY_PROCESS=telegram-rabbi`
- Effective worker command: `npm run telegram:rabbi`
- Worker purpose: run Rabbi Elie Scheller's scoped One Time Telegram bridge as
  a long-lived polling worker separate from the public web app.

## Required Worker Variables

The worker should use Railway reference variables wherever possible so secrets
stay centralized on the web service until they are intentionally moved to
shared variables.

- `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`
- `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
- `ONE_TIME_OPS_USERNAME`
- `ONE_TIME_OPS_PASSWORD`
- `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`
- `OPENAI_API_KEY`
- `KIMI_API_KEY`
- `BNA_APP_URL=https://bneineviimacademy.org`
- `BNA_RAILWAY_PROCESS=telegram-rabbi`

## Current Blocker

`TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is not yet confirmed. The bridge
intentionally refuses to start without this value so the Rabbi bot cannot be
used by every Telegram chat that knows the bot token.

Do not use chat `8202155026` as Rabbi Elie's allowed chat unless Shloimie
explicitly confirms that this is the intended Rabbi chat. That update came from
an operator test and is useful only as proof that Telegram updates can reveal a
chat ID after the intended user sends `/start`.

## Config Notes

The root `railway.json` must stay generic. Do not put `node server.js`,
`npm run telegram:rabbi`, or a web-only healthcheck in that shared file unless
the repo is intentionally moved back to one Railway service.

The Docker image starts through `scripts/railway-start.mjs`:

- web service/default process: `node server.js`
- Rabbi worker process: `npm run telegram:rabbi`

Railway's config-as-code docs state that repo config overrides dashboard
settings for a deployment, so web-only settings in `railway.json` would break
the worker. The Dockerfile-level dispatcher avoids relying on service-specific
start-command edits while still keeping the worker command explicit.
