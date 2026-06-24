# Next Session

Resume with `REQ-20260624-024`.

1. Work from
   `C:\Users\User\Documents\Codex\2026-06-24\clean-slate-integration`.
2. Confirm branch `codex/clean-slate-integration-20260624`.
3. Review migration/database readiness: required migrations, backup/snapshot,
   dry-run, rollback, transaction strategy, tenant isolation, deployed-code
   compatibility, and secret audit.
4. Do not apply production database changes unless a later release gate
   authorizes the exact operation.

`REQ-20260624-023` is locally verified for the release candidate. Final
app-visible proof remains under `REQ-20260624-027` after merge/deploy/live
smoke. Do not run class backfill from current evidence.
