# Academy Telegram Worker

Last updated: 2026-06-18

## Intended Hosted Runtime

- Railway project: `skillful-motivation`
- Web service: `skillful-motivation`
- Worker service: `academy-telegram-worker`
- Worker process selector: `BNA_RAILWAY_PROCESS=telegram-academy`
- Effective worker command: `npm run telegram:kimi`
- Worker purpose: run the academy Telegram bridge as a long-lived polling
  worker so `@bneineviimacademy_bot` does not depend on a local Windows
  session staying alive.

## Required Worker Variables

Use Railway reference variables from the web service when possible so the
academy worker stays in sync with the production app secrets/settings.

- `BNA_RAILWAY_PROCESS=telegram-academy`
- `TELEGRAM_BOT_TOKEN=${{skillful-motivation.TELEGRAM_BOT_TOKEN}}`
- `TELEGRAM_CHAT_ID_BNA=${{skillful-motivation.TELEGRAM_CHAT_ID_BNA}}`
- `BNA_APP_URL=${{skillful-motivation.APP_URL}}`
- `OPS_USERNAME=${{skillful-motivation.OPS_USERNAME}}`
- `OPS_PASSWORD=${{skillful-motivation.OPS_PASSWORD}}`
- `OPENAI_API_KEY=${{skillful-motivation.OPENAI_API_KEY}}`
- `KIMI_API_KEY=${{skillful-motivation.KIMI_API_KEY}}`
- `BNA_AI_PRIMARY_PROVIDER=openai`

Optional but useful:

- `TELEGRAM_DEFAULT_REPLY_MODE`
- `TELEGRAM_PRIMARY_AGENT`
- `TELEGRAM_TASK_WATCH_INTERVAL_MS`
- `GOOGLE_CLIENT_ID=${{skillful-motivation.GOOGLE_CLIENT_ID}}`
- `GOOGLE_CLIENT_SECRET=${{skillful-motivation.GOOGLE_CLIENT_SECRET}}`
- `GOOGLE_REFRESH_TOKEN=${{skillful-motivation.GOOGLE_REFRESH_TOKEN}}`
- `GOOGLE_DRIVE_PIPELINE_CONFIG=${{skillful-motivation.GOOGLE_DRIVE_PIPELINE_CONFIG}}`
- `GOOGLE_DRIVE_PIPELINE_FOLDER_ID=${{skillful-motivation.GOOGLE_DRIVE_PIPELINE_FOLDER_ID}}`
- `GOOGLE_DRIVE_PIPELINE_ROOT_NAME=${{skillful-motivation.GOOGLE_DRIVE_PIPELINE_ROOT_NAME}}`

The Google variables are optional for plain Telegram chat, but required for the
hosted worker to run Drive Raw Media Intake and Website Images auto-watch.
Without them, the bot can answer messages but Drive intake will log Google auth
or pipeline-config blockers.

## Verification

1. `railway service status --service academy-telegram-worker --environment production`
   should reach `SUCCESS`.
2. `GET /api/bna/integrations/telegram/status` should show:
   - `runtime_source: agent_runtime_status`
   - `runtime_agent_key: telegram-academy-bridge`
   - `bridge_runtime_healthy: true`
3. Telegram `getWebhookInfo` should still show no webhook URL.
4. Send `/status` from the allowed academy chat and confirm the worker replies.

Latest known-good proof from 2026-06-18:

- Google Drive worker reference variables were added without recording raw
  secret values.
- Current worker deployment `c57df355-a5e2-4cfd-a5fe-462356376c34` reached
  `SUCCESS` after the Railway process dispatcher fix. The worker starts through
  `node scripts/railway-start.mjs`, detects
  `BNA_RAILWAY_PROCESS=telegram-academy`, and launches `npm run telegram:kimi`.
- Runtime heartbeat row showed `telegram-academy-bridge` running in
  `academy-polling`.
- Drive auto-watch picked up the 2026-06-18 Raw Media Intake files; latest
  audit `ops/drive-audits/2026-06-18T14-47-52-309Z-google-drive-audit.md`
  showed Raw Media Intake empty and the files in processed media.
- Stalled content jobs `#72`, `#73`, and `#74` were repaired to
  `drive_stage='04 Parsed'`.
- The weekly report detector now recognizes Erev/Arab Shabbos, Parsha,
  WhatsApp, latest-video, and weekly-learning wording; weekly report prompts
  default BNA to Beit Shemesh / Israel.
- Current OpenAI-primary proof:
  - code deployment `d4df557d-c041-4293-add1-e8ccd8f0bc79` reached `SUCCESS`;
  - provider-order deployment `ae652bb9-572d-4a22-b2e9-ecc9dae5cb9a` reached
    `SUCCESS`;
  - startup log showed
    `ApiPath=OpenAI API (gpt-4.1-mini) -> Kimi API (kimi-k2.6)`,
    `OpenAIKey=yes`, and `KimiKey=yes`;
  - Telegram status API reported configured with no blockers;
  - Telegram `getWebhookInfo` reported no webhook URL, pending updates 0, and
    no last error.

## Safe Restart

1. Confirm the latest code is deployed to both the web service and the academy
   worker service.
2. Restart the worker:
   `railway service restart --service academy-telegram-worker --environment production`
3. Re-check `railway service status`.
4. Re-check `/api/bna/integrations/telegram/status`.
5. Re-send `/status` in the academy chat.

## Notes

- The academy worker heartbeat reports into `bna_agent_runtime_status` under
  `telegram-academy-bridge`.
- The web service Telegram status card prefers that DB heartbeat over local
  `.runtime/telegram-kimi-bridge.*` files, but local files remain a fallback
  for manual/local bridge runs.
- Rabbi/One Time bot runtime stays separate and should continue using
  `ops/one-time-mishnah-class/rabbi-telegram-worker.md`.
- The bridge supports both local `.secrets/google-oauth-client.json`,
  `.secrets/google-refresh-token.txt`, `.secrets/google-drive-pipeline.json`
  and hosted Railway env variables. Prefer Railway reference variables on the
  worker; do not paste raw secret values into docs, chat, or repo files.
