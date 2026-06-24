# Next Session

Resume with `REQ-20260624-026`.

1. Work from
   `C:\Users\User\Documents\Codex\2026-06-24\clean-slate-integration`.
2. Confirm branch `codex/clean-slate-integration-20260624`.
3. Inspect final PR #16 mergeability, release policy, supersession state, and
   rollback plan.
4. Merge only if release policy permits and no new blocker appears. Do not
   deploy, apply production migrations, run class backfill, send, charge,
   upload, publish, change DNS, or expose secrets unless a later release gate
   authorizes the exact action.

`REQ-20260624-025` is complete. Local gates passed on pushed release-code SHA
`03454ea4a9152946d21452141ed427277705fab1`, including `npm test` 1301/1301,
dry-run release gate, owner-review route/role/visual/assistant/external
readiness checks, watchdogs, secret audit, diff check, Stripe safe smoke, and
Vimeo preview-only smoke.

`REQ-20260624-024` is complete as readiness review only. No production database
mutation or schema apply was performed. Class backfill remains blocked by
current unsafe evidence.
