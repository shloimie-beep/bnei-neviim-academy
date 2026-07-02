# Telegram Spreadsheet Routing Worker Release

## Source

- Raw intake: `RAW-20260630-011`
- Task: `TASK-20260630-011`
- Evidence: `ops/imports/2026-06-30-telegram-spreadsheet-routing-repair.md`
- Related CRM import evidence:
  `ops/imports/2026-06-30-telegram-one-time-phonebook-readback.md`

## Current Status

Local repo-side repair is implemented and verified:

- `scripts/telegram-kimi-bridge.mjs` detects spreadsheet documents and returns
  before publish/content/transcription routing.
- Transcription/provider errors are sanitized before Telegram replies.
- `tests/telegram-media-routing.test.js` covers spreadsheet bypass and error
  sanitization.
- Misrouted Content jobs `93`, `96`, and `98` were archived with readback.

Production worker release is still blocked:

- Hosted worker: `academy-telegram-worker`
- Worker command: `npm run telegram:kimi`
- Current branch: `codex/closeout-vimeo-media-20260624`
- Blocker: current workspace has a large mixed dirty worktree with unrelated
  app-visible changes, including work already recorded elsewhere as
  deploy-blocked. Do not deploy this whole workspace just for the Telegram
  spreadsheet patch.

## Next Safe Batch

1. Create or use a clean release target based on the current production worker
   source.
2. Carry only the Telegram spreadsheet-routing patch and its focused test into
   that release target, or include it in the next already-approved worker/app
   release.
3. Run:
   - `node --check scripts/telegram-kimi-bridge.mjs`
   - `node --test tests/telegram-media-routing.test.js tests/telegram-runtime-status.test.js`
   - `npm run secrets:audit`
4. Deploy or restart `academy-telegram-worker` from the clean release target.
5. Verify:
   - `/api/bna/integrations/telegram/status` reports healthy
     `telegram-academy-bridge`.
   - A safe spreadsheet-upload smoke does not create a Content job, does not
     call transcription, and does not suggest Buffer/social drafting.

## Guardrails

- Do not commit raw spreadsheet/contact rows.
- Do not send email, WhatsApp, SMS, Telegram campaigns, Buffer drafts/posts, or
  CRM campaigns.
- Do not add GHL/LeadConnector runtime.
- Do not deploy unrelated dirty UI/app changes as part of this narrow worker
  release.
- Actual audio/video transcription still needs a valid OpenAI provider key;
  this worker release only prevents spreadsheets from depending on it.
