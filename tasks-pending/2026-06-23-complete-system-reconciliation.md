# Complete System Reconciliation

Source: `RAW-20260623-002`

Execution run:
`ops/execution-runs/2026-06-23-complete-system-reconciliation/`

Branch/worktree:

- Branch: `codex/issue-8-complete-system-reconciliation`
- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`
- Base: `origin/master` at `a9528b2d9467174d76d4c25bfb028f9308f24b4f`

Current safe batch:

1. Preserve the source pointer/hash and create the successor execution run.
2. Contain the Issue #8 autonomous deploy risk by making agent-fleet auto
   deploy opt-in.
3. Add deterministic truth commands:
   `system:truth`, `worktree:truth`, `source:truth`, `asset:truth`,
   `drive:intake:truth`, `ui:source-coverage`, and
   `intake:github -- --issue <n> --dry-run`.
4. Generate evidence reports without printing secrets or mutating production
   records.
5. Open a draft PR and post a concise Issue #8 checkpoint.

Known blockers that must remain explicit:

- Live database readback/backfill requires `DATABASE_URL` or another approved
  read-only production gate.
- Railway deploy-to-commit traceability requires Railway token/service
  metadata readback.
- Drive source truth beyond repo artifacts requires read-only Drive connector
  results.
- Production backfill and external sends/uploads/charges remain blocked until
  their normal approvals.
