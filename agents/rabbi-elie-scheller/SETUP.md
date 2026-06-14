# Rabbi Elie Scheller Scoped Bot Setup

Status: wired in repo. The local Rabbi bot token file is configured and
Telegram `getMe` smoke passed on 2026-06-08. On 2026-06-10, the Rabbi bot
token was also added to Railway production service `skillful-motivation` and
`RABBI_ELIE_SCHELLER_CODEX_ENABLED=false` was set there. Later on 2026-06-10,
generated scoped One Time Operations credentials were installed locally and on
Railway. Live startup still needs the allowed Rabbi chat ID. The hosted Railway
worker service split is documented in
`ops/one-time-mishnah-class/rabbi-telegram-worker.md`.

## Runtime Commands

- Local foreground check: `npm run telegram:rabbi`
- Hidden background start: `npm run telegram:rabbi:start`

The Rabbi profile uses separate runtime files from the academy bot:

- `.runtime/telegram-kimi-bridge-rabbi-elie-scheller.lock`
- `.runtime/telegram-kimi-bridge-rabbi-elie-scheller.log`
- `.runtime/telegram-chat-modes-rabbi-elie-scheller.json`
- `.runtime/telegram-pending-decisions-rabbi-elie-scheller.json`

## Required Env Values

These values are required before the live Rabbi bot can run:

- `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`: Telegram bot token for Rabbi Elie
  Scheller's separate bot. Local file alternative:
  `.secrets/telegram-rabbi-elie-scheller-bot-token.txt`. The local file is
  configured on this workstation.
- `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`: allowed Telegram chat ID for Rabbi
  Elie Scheller. Without this, the Rabbi bridge refuses to start.
- `ONE_TIME_OPS_USERNAME`: scoped Operations username for the One Time Mishnah
  Class task workspace.
- `ONE_TIME_OPS_PASSWORD`: scoped Operations password for the One Time Mishnah
  Class task workspace.

The generated scoped Operations credentials are saved locally at
`.secrets/one-time-ops-credentials.txt` and are set on Railway production.

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
- create One Time support tickets for broken system behavior
- brainstorm, summarize, and ask before task creation when intent is not
  explicit

It does not request BNA Students, Accounting, Devices, broad Content jobs,
Drive pipeline, retired GHL posting, agent fleet, or OpenAI smoke commands.

## Login Handoff Guard

Do not send Rabbi Elie scoped Operations login information until the One Time
Drive/social ingestion setup is ready and Shloimie has confirmed the social
destinations. First WhatsApp should ask Rabbi for the best email address to
attach to his account. The current provider setup still needs Rabbi contact
email, WhatsApp/contact phone, and provider login username stored on the scoped
records before login handoff.

Drive/social setup is scoped to the One Time Mishnah Class Drive root:
`https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2`.
The generated backend map lives at
`ops/one-time-mishnah-class/drive-social-ingestion-map.json` after
`npm run drive:setup-one-time`.

## 2026-06-08 Smoke

- Telegram API accepted the configured token.
- Bot identity resolved as `onetimeaios_bot` / `onetime_bot`.
- No webhook was configured, so the bot is already compatible with bridge
  polling mode.
- `getUpdates` returned no pending messages, so no chat ID could be discovered.
- `npm run telegram:rabbi` now fails only on missing scoped One Time Operations
  credentials, which confirms the token path is being read by the Rabbi
  profile startup path.

## 2026-06-09 Smoke

- `node --check scripts/telegram-kimi-bridge.mjs` passed.
- Telegram API accepted the local token again. Bot identity resolved as
  `onetimeaios_bot`.
- `getWebhookInfo` still shows no webhook configured and 0 pending updates.
- `getUpdates` returned 0 recent updates, so the allowed Rabbi chat ID still
  cannot be inferred from Telegram.
- Local `.env.local` still does not define the Rabbi chat ID or scoped One Time
  Operations username/password.
- `npm run telegram:rabbi` reached the intended scoped profile guard and failed
  only because scoped One Time Operations credentials are missing.
- At the time of this smoke, Railway production service `skillful-motivation`
  was reachable, but the app service did not have the Rabbi bot token, Rabbi
  chat ID, scoped One Time username/password, or
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED` variable.
- The current Railway app service start command is `node server.js`; it does
  not host the long-running Rabbi bridge process.

## 2026-06-10 Credential Pass

- Railway production service `skillful-motivation` now has
  `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`.
- Railway production service `skillful-motivation` now has
  `RABBI_ELIE_SCHELLER_CODEX_ENABLED=false`.
- Railway still lacks `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`.
- Telegram API accepted the token again and resolved `onetimeaios_bot`.
- `getWebhookInfo` showed no webhook configured and 0 pending updates.
- Initial `getUpdates` returned 0 updates. A later 2026-06-10 recheck showed
  one `/start` update from Shlomo/chat `8202155026`, which is useful as an
  operator test but should not be treated as Rabbi Elie's allowed chat ID unless
  Shloimie explicitly confirms that chat is the intended allowed chat.
- Before the portal/ticketing deployment later that day, `npm run
  telegram:rabbi` still reached the scoped profile guard and failed on missing
  scoped One Time Operations credentials. That credential blocker is now fixed;
  the remaining startup blocker is the required allowed chat ID.

## 2026-06-10 Portal/Ticketing Deployment

- Railway production service `skillful-motivation` now has
  `ONE_TIME_OPS_USERNAME` and `ONE_TIME_OPS_PASSWORD`.
- Local `.env.local` has the same generated scoped login values from
  `.secrets/one-time-ops-credentials.txt`.
- The app now ships a first-pass `one_time_admin` external workspace with Tasks,
  Students, Content, Contacts, Accounting, Support, and Roadmap views.
- The Rabbi bridge can create One Time support tickets from `/ticket`,
  `support:`, or clear broken-system language.
- The Rabbi bridge now intentionally refuses to start without
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` or an accepted alias, so it cannot run
  open to every chat that knows the token.
- `npm run telegram:rabbi` now fails on the intended missing chat-ID guard.
- Deployed Railway `226ab9dd-42ff-4012-89fb-a4d0b3126a8f`; Railway doctor,
  standard live smoke, and focused One Time scoped smoke passed.

## 2026-06-10 Worker Prep

- Rechecked Railway production with values redacted: `skillful-motivation` has
  `TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER`, `ONE_TIME_OPS_USERNAME`,
  `ONE_TIME_OPS_PASSWORD`, and `RABBI_ELIE_SCHELLER_CODEX_ENABLED`.
- Railway still lacks `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, and the local
  workstation also has no allowed Rabbi chat ID configured.
- The root `railway.json` was made builder-only so future Railway services from
  this repo do not inherit the web app's `node server.js` command or `/api/health`
  check.
- The Docker image starts through `scripts/railway-start.mjs`; the web service
  defaults to `node server.js`, and the Rabbi worker uses
  `BNA_RAILWAY_PROCESS=telegram-rabbi` to run `npm run telegram:rabbi`.
- Hosted worker runbook:
  `ops/one-time-mishnah-class/rabbi-telegram-worker.md`.
