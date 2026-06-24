# Next Session

Resume with `REQ-20260624-025`.

1. Work from
   `C:\Users\User\Documents\Codex\2026-06-24\clean-slate-integration`.
2. Confirm branch `codex/clean-slate-integration-20260624`.
3. Run deterministic local release gates against the exact release candidate
   SHA and record pass/fail/blockers.
4. Do not deploy, merge, apply production migrations, run class backfill, send,
   charge, upload, publish, change DNS, or expose secrets unless a later
   release gate authorizes the exact action.

`REQ-20260624-024` is complete as readiness review only. No production database
mutation or schema apply was performed. Class backfill remains blocked by
current unsafe evidence.
