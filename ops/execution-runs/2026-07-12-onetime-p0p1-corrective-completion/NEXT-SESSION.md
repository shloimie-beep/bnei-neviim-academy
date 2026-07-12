# Next Session

PR #129 has been merged and the One Time production service has been deployed
and live-smoked.

Use a fresh clean worktree from `origin/master` for continuation work. Do not
resume from `C:\Users\User\BNA-onetime-p0p1-corrective-20260711` until its
unrelated dirty `server.js` / `src/lib/bna/one-time-delivery-outbox.js` state
is reconciled by its owner; that worktree currently contains an external
uncommitted change that breaks `node --check server.js`.

## Current Release Truth

- PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR state: merged
- Merge commit: `8e22e5d79844e994e94c4f3ed92ac51422649b8c`
- Deployed/live-smoked SHA:
  `8e61628ad3e3db7cd65fbbf5ebefbb34e39f9435`
- Railway deployment:
  `079c53ca-cb65-4cf9-af06-286a7705e7a1`
- Live URL:
  https://join.onetimeonetime.com

## Next Requirements

- `REQ-20260712-002`: add/push
  `.github/workflows/onetime-corrective.yml` with a GitHub credential that has
  `workflow` scope.
- `REQ-20260712-005`: provide `BNA_ONETIME_CRM_TEST_DATABASE_URL` and run
  `npm run one-time:smoke:crm-journey-local-db`.
- `REQ-20260712-006`: rerun/record the real local/test DB onboarding linkage
  proof after the database URL exists.
- `REQ-20260712-008` / `REQ-20260712-009`: decide whether to run a production
  intake/dropoff write-smoke packet, since it creates live raw/parse records.
- `REQ-20260712-010`: complete the remaining live screenshot/matrix set for
  provider login, canonical Rabbi dashboard, CRM list/detail, persisted CRM
  edit, targeted mailbox, and Robot launcher.
- `REQ-20260712-022`: operator personal deployed signup, live WAPI auto-reply/
  Telegram approval, and scheduler/CRON readiness remain open. One Time WAPI
  provider setup is configured and deployed. Do not send externally until the
  exact send scope is approved.

## First Commands

1. `git fetch origin master`
2. `git worktree add C:\Users\User\BNA-onetime-followup-YYYYMMDD origin/master`
3. `npm run bna:release-gate -- --allow-detached --remote-branch master`
4. `npm run bna:run:next`

Do not send messages, charge/refund, import historical data, grant access,
mutate DNS/accounts/credentials, or write to external providers unless a
separately scoped approval covers the exact action.
