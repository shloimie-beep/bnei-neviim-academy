# One Time Readiness Readback

Generated: 2026-07-07T22:52:43+03:00

Mode: read-only. No external write, provider mutation, DNS mutation, email send,
WhatsApp send, live payment, credential change, Drive upload, Vimeo upload, or
database mutation was performed.

## Commands

| Command | Exit | Result |
|---|---:|---|
| `npm run one-time:setup:check` | 1 | Full setup is not ready. Current Railway variable readback says `Service 'one-time-web' not found`; ready count is 2/8. |
| `npm run one-time:railway-target:guard` | 0 | Railway-only report is ready from the historical guarded provisioning report, but the same current variable readback still says `Service 'one-time-web' not found`. |
| `npm run one-time:db:bootstrap` | 0 | Dry-run only; mutation performed `false`; confirmation required is `BOOTSTRAP_ONE_TIME_DATABASE`; current local apply guards are empty for `APP_INSTANCE`, `DEFAULT_WORKSPACE_KEY`, and `DEFAULT_PROJECT_KEY`. |
| `git status --short --untracked-files=all` | 0 | Clean after read-only checks. |

## Current Blockers

### Railway / Database

- Current Railway token/env cannot read `one-time-web` variables: `Service 'one-time-web' not found`.
- The full setup check therefore marks the separate One Time database not ready because the `DATABASE_URL` service reference cannot be proven non-empty from the current context.
- The bootstrap script is available and dry-runs correctly, but apply is still blocked until the One Time service target and environment guards are proven in the active Railway context.

### Provider / Campaign Inputs

- Zoom: missing `ONE_TIME_ZOOM_SESSION_ALIAS_or_zoom_join_url_alias`.
- Vimeo/Drive/OBS: current readback sees Vimeo credentials/access token by safe alias, but still needs `ONE_TIME_DRIVE_DROP_FOLDER_ALIAS`.
- Stripe: needs Rabbi Stripe sandbox/test key status and `$67/month` product/price alias; live Stripe appears configured but must not be used for sandbox smoke.
- Whapi/WAPI: missing instance ID and phone number.
- Campaign: missing final campaign copy, exact recipient segment/list, suppression/unsubscribe proof, and explicit seed approval packet.

## Next Safe Action

Reconcile the Railway auth/target context so the current CLI/token can see
`one-time-production` / `one-time-web` / `production`, then rerun:

1. `npm run one-time:setup:check`
2. `npm run one-time:db:bootstrap`
3. The post-setup deploy/live-smoke packet only after the setup check is ready.
