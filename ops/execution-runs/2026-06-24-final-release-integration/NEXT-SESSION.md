# Next Session

Resume with `REQ-20260624-030`.

1. Work from
   `C:\Users\User\Documents\Codex\2026-06-24\clean-slate-integration`.
2. Confirm branch `master`.
3. Continue canonical records closeout (`REQ-20260624-030`) and then safe
   worktree cleanup (`REQ-20260624-031`).
4. Do not apply production migrations, run class backfill, send, charge,
   upload, publish, change DNS, rotate/copy credentials, or expose secrets
   unless a later release gate authorizes the exact action.

`REQ-20260624-025` is complete. Local gates passed on pushed release-code SHA
`03454ea4a9152946d21452141ed427277705fab1`, including `npm test` 1301/1301,
dry-run release gate, owner-review route/role/visual/assistant/external
readiness checks, watchdogs, secret audit, diff check, Stripe safe smoke, and
Vimeo preview-only smoke.

`REQ-20260624-024` is complete as readiness review only. No production database
mutation or schema apply was performed. Class backfill remains blocked by
current unsafe evidence.

`REQ-20260624-026`, `REQ-20260624-027`, and `REQ-20260624-029` are complete.
PR #16 merged at `c14507ab121daa221689ba285c203605bf2d64bf`; Railway
deployment `e26fec62-1a08-43a8-abb9-1b030b0ea786` deployed the same SHA and
live smokes passed. Summary:
`ops/execution-runs/2026-06-24-final-release-integration/LIVE-VERIFY.md`.
