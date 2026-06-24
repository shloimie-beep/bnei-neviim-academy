# Next Session

Resume from:
`C:\Users\User\Documents\Codex\2026-06-24\clean-slate-integration`

Current run:
`ops/execution-runs/2026-06-24-clean-slate-acceptance`

Current branch:
`codex/clean-slate-acceptance-20260624`

## Next Safe Steps

1. Finish `REQ-20260624-039`: final validation, commit, push, PR, merge, and
   post-merge verification.
2. Do not run a manual Railway deploy unless application/runtime code or live
   Operations behavior changed.
3. Preserve `REQ-20260624-028` as blocked safety work. The next separate
   executable owner-approved run should start from GitHub issue #18 with
   read-only reconciliation only.

## Blocked Requirement

`REQ-20260624-028` remains blocked. Do not run
`APPLY_GUARDED_CLASS_BACKFILL` or any production class backfill apply until a
future read-only reconciliation proves safe candidates or no candidates and a
row-level owner-approved plan exists.

## Do Not Run Yet

- Class backfill apply.
- Production migration.
- Stripe charge/refund/subscription/access grant.
- Vimeo upload/publication/unpublish/delete.
- Email/WhatsApp/Telegram/social send.
- DNS write or credential copy/rotation.
- Worktree/branch pruning or cleanup of unique local-only work.
