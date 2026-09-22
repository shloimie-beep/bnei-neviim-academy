# RAW-20260705-012 - Telegram Drive Sync OAuth Error And Cleanup Continuation

- source_channel: codex_chat
- created_at: 2026-07-05T21:56:07+03:00
- parse_status: registered
- requirement_register: `tasks-pending/2026-07-05-telegram-drive-sync-oauth-error-and-cleanup-continuation.md`
- related_goal: repo release workflow hardening and clean publish/deploy flow

## Raw Operator Wording

> Yeah I'm still getting an error message from the in the telegram chat

> Drive transcript library sync failed for content job #102: Error: Invalid Google OAuth client JSON at /app/.secrets/google-oauth-client.json
>     at loadClient (file:///app/scripts/sync-drive-content-library.mjs:76:11)
>     at authWithRefreshToken (file:///app/scripts/sync-drive-content-library.mjs:92:18)
>     at main (file:///app/scripts/sync-drive-content-library.mjs:991:16)
>     at file:///app/scripts/sync-drive-content-library.mjs:1053:1
>     at ModuleJob.run (node:internal/modules/esm/module_job:195:25)
>     at async ModuleLoader.import (node:internal/modules/esm/loader:337:24)
>     at async loadESM (node:internal/process/esm_loader:34:7)
>     at async handleMainPromise (node:internal/modules/run_main:106:12) this is one error message that I got and I got a couple times this error message

> Just make sure that when you're done you go back to finishing the whole Cleanup in the repo and the whole debugging clean up hardening and fortifying I don't even know what the next steps are you know fix everything make it better whatever I don't know what to say you know just do those things for me so after you're done

## Parsed Summary

The Telegram chat surfaced a deployed Drive transcript sync failure for content
job `#102`. The failure came from the deployed `/app` runtime and showed the
Drive sync script rejecting `/app/.secrets/google-oauth-client.json` before it
could use hosted worker environment credentials.

The same session also requires returning to the broader repo cleanup/hardening
goal after the Telegram/Drive error is addressed.

## Extracted Requirements

- `REQ-20260705-801`: Fix the Drive transcript library sync OAuth loader so
  Railway/worker `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_REFRESH_TOKEN`, and inline OAuth JSON can satisfy auth even if a
  local JSON file is malformed.
- `REQ-20260705-802`: Add regression coverage for the Drive sync auth-loader
  failure so a malformed local JSON file cannot hide valid worker env
  credentials again.
- `REQ-20260705-803`: Harden the Telegram bridge local launcher/status flow so
  stale lock files and duplicate poller conflicts are explicit.
- `REQ-20260705-804`: Verify the Telegram duplicate-poller state without
  sending Telegram messages or mutating external services.
- `REQ-20260705-805`: Publish the scoped code/protocol fix through a clean PR
  and deploy/restart only the correct BNA `skillful-motivation` runtime.
- `REQ-20260705-806`: Resume the broader cleanup/hardening goal after this
  Telegram/Drive repair batch.

## Guardrails

No secret values should be printed or committed. No Google Drive writes,
Telegram sends, production database mutation, payment/access/DNS/provider
mutation, or external CRM/WhatsApp/email send is authorized by this raw input.
