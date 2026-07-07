# One Time Railway Auth Diagnostic Readback

Generated: 2026-07-07T23:36:00+03:00

Mode: read-only tooling hardening. No external write, provider mutation, DNS
mutation, email send, WhatsApp send, live payment, credential mutation, Drive
upload, Vimeo upload, or database mutation was performed.

## What Changed

`scripts/check-onetime-external-setup-readiness.mjs` now treats a current
Railway readback that cannot see `one-time-web` as a live blocker, even when a
historical guarded provisioning report exists. It also reads current Railway
status after `Service 'one-time-web' not found` and reports the current project
and visible services.

This prevents the One Time railway-only guard from saying the target is ready
when the current token is actually pointed at BNA production.

## Current Readback

Current Railway auth context:

- Project visible to the token: `skillful-motivation`
- Environment: `production`
- Visible services: `Postgres`, `academy-telegram-worker`,
  `rabbi-telegram-worker`, `skillful-motivation`
- Expected One Time service: `one-time-web`
- Result: blocked, because `one-time-web` is not visible in the current auth
  context.

## Commands

| Command | Exit | Result |
|---|---:|---|
| `node --check scripts/check-onetime-external-setup-readiness.mjs` | 0 | Syntax passed. |
| `node --test tests/one-time-external-setup-readiness.test.js` | 0 | 5/5 focused readiness tests passed, including the stale-provisioning/current-auth mismatch regression. |
| `npm run one-time:setup:check` | 1 | Correctly blocked full setup. Ready count is now 1/8; Railway target and DB are blocked because current auth cannot see `one-time-web`. |
| `npm run one-time:railway-target:guard` | 1 | Correctly blocked railway-only readiness. Ready count is now 0/1 with `current_railway_auth_can_read_one-time-web` missing. |

## Next Safe Action

Provide a Railway auth/target context that can read:

- project: `one-time-production`
- service: `one-time-web`
- environment: `production`

Then rerun:

1. `npm run one-time:railway-target:guard`
2. `npm run one-time:setup:check`
3. `npm run one-time:db:bootstrap`

Only after those are ready should Codex run the post-setup deploy/live-smoke
packet for `join.onetimeonetime.com`.
