# 2026-06-25 Drive Transcript Library Sync OAuth Error

## Source

- `RAW-20260625-004`
- Production/Railway error for content job #83:
  `Invalid Google OAuth client JSON at /app/.secrets/google-oauth-client.json`

## Requirements

| ID | Title | Status | Evidence |
| --- | --- | --- | --- |
| `REQ-20260625-006` | Preserve the Drive sync OAuth failure and explain background-agent impact | Done | Raw record created. This was an auth/config crash before Drive transcript sync, not proof that task parsing closed the work. |
| `REQ-20260625-007` | Harden Drive sync and bridge Google OAuth loading for Railway/env config | Done locally; production release blocked | `scripts/sync-drive-content-library.mjs` now loads merged runtime env, prefers `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, supports inline `GOOGLE_OAUTH_CLIENT_JSON`, keeps file fallback, and reports redacted config errors. `scripts/telegram-kimi-bridge.mjs` now also avoids parsing the OAuth file when direct env credentials are present. Not deployed because the repo worktree contains many unrelated dirty changes. |
| `REQ-20260625-008` | Verify safe diagnostics/tests without printing secrets | Done | `node --check scripts/sync-drive-content-library.mjs`; `node --test tests/sync-drive-content-library-auth.test.mjs`; focused Telegram/audio suite passed 44/44; `npm run bna:run:validate` passed. |

## Current Understanding

The background path appears to have reached the Drive transcript sync step for
content job #83, then failed before Drive work because the Google OAuth client
config read from `/app/.secrets/google-oauth-client.json` was not valid for the
script. This is an auth/config blocker, not proof that the task parser or
background task queue closed the work.

## Implementation

- Added safe JSON config parsing to the Drive content sync script.
- Changed auth loading so Railway/local env credentials are honored before
  `.secrets/google-oauth-client.json`.
- Passed the merged `.env.local` plus process env into both pipeline config and
  OAuth auth construction.
- Kept `.secrets/google-oauth-client.json` and `.secrets/google-refresh-token.txt`
  as local fallback paths.
- Exported auth helpers behind a CLI guard so focused tests can import them
  without running Drive sync.
- Added `tests/sync-drive-content-library-auth.test.mjs` with synthetic-only
  coverage for invalid-file-plus-valid-env, inline OAuth JSON, redacted invalid
  JSON error handling, env refresh-token auth, env pipeline parsing, and missing
  refresh-token diagnostics.
- Hardened `scripts/telegram-kimi-bridge.mjs` so Drive-related bridge actions
  also use direct Google OAuth env credentials before consulting a local OAuth
  client file.
- Updated `tests/telegram-runtime-status.test.js` to keep that hosted-worker
  env auth contract visible.

## Verification

- PASS `node --check scripts/sync-drive-content-library.mjs`
- PASS `node --test tests/sync-drive-content-library-auth.test.mjs` (6/6)
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --test tests/sync-drive-content-library-auth.test.mjs tests/intake-parser.test.js tests/telegram-media-routing.test.js tests/intake-parser-class-recording.test.js tests/telegram-runtime-status.test.js` (44/44)
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `npm run bna:run:validate`
- PASS `git diff --check` exited 0; output was line-ending warnings only.

## Production Status

The local fix is not deployed. Content job #83 should be considered still
blocked in production until:

1. this exact patch is released from a clean branch/worktree, and
2. Railway has valid `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REFRESH_TOKEN`, and `GOOGLE_DRIVE_PIPELINE_CONFIG` values, or a valid
   `GOOGLE_OAUTH_CLIENT_JSON` plus refresh token and pipeline config.

If those env values are already present in Railway, this patch should stop an
invalid `/app/.secrets/google-oauth-client.json` file from masking them after
deploy. If they are not present, the job will remain blocked with a clearer
missing/incomplete config error.

## Guardrails

- Do not print Google OAuth client secret, refresh token, or raw client JSON.
- Do not mutate Drive while auth is known broken.
- Do not start a long-running Telegram bridge or agent fleet without explicit
  operator direction.
