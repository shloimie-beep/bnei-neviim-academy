# Telegram/GHL Publish Workflow Audit

Date: 2026-06-06

## Status

Partially implemented and live, but not closed as fully verified because the
final proof requires creating a real GHL Social Planner post or draft and then
deleting/archiving it.

## Implemented Code Paths

- `scripts/telegram-kimi-bridge.mjs` supports text commands:
  - `publish draft <target aliases> | <caption>`
  - `publish now <target aliases> | <caption>`
- Telegram media captions can use the same publish command shape. The bridge:
  - downloads the Telegram media
  - uploads it to GHL media storage
  - resolves target aliases from `/accounts`
  - creates a GHL social draft or publish-now request
  - saves the job under `ops/pending/` or `ops/completed/`
- `scripts/ghl-ops.mjs` implements:
  - `listSocialAccounts()`
  - `buildAccountAliases()`
  - `uploadLocalFileToGhl()`
  - `createSocialPost()`
  - `deleteSocialPost()`
- Alias safety exists in the Telegram bridge. If one platform maps to multiple
  accounts, the command refuses platform-only names and tells the operator to
  use `/accounts` aliases.
- Server-side Content Facebook draft creation was hardened separately: it uses
  the only active Facebook account or `GHL_DEFAULT_FACEBOOK_ACCOUNT_ID`, and
  refuses ambiguous multi-Facebook account selection.

## Latest Non-Posting Verification

- `npm run app:smoke -- --require-drive` passed on live deployment
  `38253aaf-4c05-4bb8-9e6b-5727dc856a19`.
- Latest report:
  `ops/live-smokes/2026-06-06T18-39-30-826Z-live-app-smoke.md`.
- GHL diagnostics in that smoke returned:
  - configured: true
  - Facebook accounts: 1
  - other social accounts: 3
  - posts read check: true

## Remaining Proof Needed

To close the TASKS item for true Telegram-to-GHL publishing, run one explicit
safe write smoke:

1. Send `/accounts` in Telegram and confirm the intended alias.
2. Create a harmless draft only, not a live post:
   `publish draft <facebook-alias> | Smoke test draft. Delete after verification.`
3. Confirm Telegram reports a GHL draft id/status.
4. Delete/archive the smoke draft through GHL or add a guarded script that calls
   `deleteSocialPost(postId)`.
5. Record the post id, deletion result, and smoke output in this audit file or a
   new `ops/system-audits/` report.

Do not run `publish now` until the operator explicitly approves a real public
post target and copy.
