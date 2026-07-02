# Local Setup

This is the Shloimie developer/operator setup for the existing hosted/local BNA
Operations system. It is not a native desktop app and it is not the Rabbi use
path.

## Prerequisites

- Node.js 20 or newer.
- npm.
- git.
- A Postgres database URL, normally the Railway `DATABASE_URL`.
- Optional: Railway CLI for deploy/doctor checks.
- Optional: local BNA keyholder at `C:\Users\User\BNA-Keyholder`.

## Clone And Install

```powershell
git clone https://github.com/shloimie-beep/bnei-neviim-academy.git
cd bnei-neviim-academy
npm install
```

For a one-click Windows laptop installer package from an existing trusted BNA
workspace:

```powershell
npm run operator:laptop:package
```

The generated ZIP is safe/no-secret by default and belongs under ignored
`install-packages/`.

From the existing local workspace:

```powershell
cd "C:\Users\User\BNA v2.0"
npm install
```

## Create `.env.local`

```powershell
npm run setup:local
notepad .env.local
```

The setup script creates `.runtime/`, copies `.env.example` to `.env.local`
only if `.env.local` does not already exist, checks Node/npm, and prints next
steps without printing secret values.

Required for local app start:

```dotenv
DATABASE_URL=
OPS_USERNAME=
OPS_PASSWORD=
```

Recommended core values:

```dotenv
PORT=8080
HOST=127.0.0.1
BNA_BIND_HOST=127.0.0.1
APP_URL=http://localhost:8080
BNA_APP_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:8080
```

`server.js` loads `.env.local` for local development when a variable is not
already set in the shell. Set `BNA_SKIP_ENV_LOCAL=1` only if you want to force
the server to ignore `.env.local`.

## Optional Vars

Optional Telegram:

```dotenv
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID_BNA=
TELEGRAM_CHAT_ID_SHLOIMIE=
TELEGRAM_DEFAULT_REPLY_MODE=openai
TELEGRAM_BOT_TOKEN_RABBI_ELIE_SCHELLER=
TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER=
```

Optional hosted AI:

```dotenv
BNA_AI_PRIMARY_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
KIMI_API_KEY=
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2.6
```

Optional Google/Gmail/Drive:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_REDIRECT_URI=https://your-domain.example/api/google/oauth/callback
GOOGLE_SCOPES=
```

Optional Railway:

```dotenv
RAILWAY_TOKEN=
RAILWAY_API_TOKEN=
RAILWAY_SERVICE_NAME=skillful-motivation
RAILWAY_ENVIRONMENT=production
```

Optional agent fleet:

```dotenv
CODEX_CLI_COMMAND=codex
AGENT_FLEET_POLL_MS=60000
AGENT_FLEET_VERIFY_COMMANDS=
AGENT_FLEET_AUTO_DEPLOY=1
```

Optional payments and cron:

```dotenv
PAYMENT_LINK=
CHECKOUT_ATTEMPT_SECRET=
GREEN_INVOICE_SECRET=
CRON_SECRET=
```

## Start The App

```powershell
npm run doctor
npm run dev
```

Open:

```text
http://localhost:8080/operations
```

If you want a different port:

```powershell
$env:PORT="8090"
npm run dev
```

## Doctor And Smoke

Run the local doctor:

```powershell
npm run doctor
```

Run the full local smoke:

```powershell
npm run smoke:local
```

Run the smoke without re-running the test suite:

```powershell
npm run smoke:local -- --skip-tests
```

Smoke an already running app:

```powershell
npm run smoke:local -- --base-url http://localhost:8080 --skip-tests
```

Optional write mode creates a temporary task titled
`SMOKE TEST - safe temporary task`, verifies it, and deletes it:

```powershell
npm run smoke:local -- --write --skip-tests
```

Smoke writes a redacted JSON report to:

```text
.runtime/smoke-local-latest.json
```

## Troubleshooting

Missing DB:

- Symptom: `FATAL: DATABASE_URL not set` or doctor reports `DATABASE_URL`
  missing.
- Fix: add the Railway/Postgres URL to `.env.local` or provide it in the shell.
- Do not paste the URL into chat, screenshots, tracked docs, or logs.

Auth failure:

- Symptom: `/api/operations/login` returns 401.
- Fix: confirm `OPS_USERNAME` and `OPS_PASSWORD` match the intended local or
  Railway Operations credentials.
- For Rabbi/One Time scoped access, use `ONE_TIME_OPS_USERNAME` and
  `ONE_TIME_OPS_PASSWORD`.

Port failure:

- Symptom: the app cannot bind or the smoke cannot connect.
- Fix: set another port:

```powershell
$env:PORT="8090"
npm run dev
```

Stale env:

- Symptom: a shell variable overrides `.env.local`.
- Fix: close the terminal or clear the variable:

```powershell
Remove-Item Env:DATABASE_URL
Remove-Item Env:OPS_USERNAME
Remove-Item Env:OPS_PASSWORD
```

Railway CLI:

- Symptom: `npm run railway:doctor` cannot authenticate.
- Fix: place a project token in `.secrets\railway-token.txt` or set
  `RAILWAY_TOKEN` in the shell/keyholder workflow. Do not commit it.
