# 2026-07-08 Rabbi Telegram Ticket Deploy Live Smoke

- Commit deployed: `74a1d4960c301052bcbb0cc22fe7da05a7e969e4`
- Railway target: `one-time-production / production / one-time-web`
- Deployment ID: `02195be0-33a2-4bee-96b3-c559a5c51256`
- Deployment status: `SUCCESS`
- External sends performed by this smoke: `false`

## Live Checks

- `npm run one-time:target:guard`: PASS after commit/push and after deploy.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`: PASS.
- Live Agent Review prompt readback:
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`
  returned `200` and contained:
  - `REQ-20260708-084`
  - Operations drop-off instructions
  - `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`
  - no-WhatsApp-send guard text

## Remaining Blockers

- Rabbi Telegram delivery remains blocked until
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured.
- A live synthetic support ticket was not created during smoke, so no real
  production Telegram ticket alert was sent. The alert path was verified with
  unit/mocked send tests and will run for real tickets when hosted production
  config is enabled.
