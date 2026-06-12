# Parent Login, Navigation, Weekly Update, Rabbi Audit

Started: 2026-06-12

Source prompt:
`ops/pro-codex/inbox/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md`

## Execution Rules

- Implementation pass, not planning-only.
- No deployment without explicit Shloimie approval.
- Do not stage unrelated dirty files.
- Do not store secrets in Git, reports, screenshots, or logs.

## Initial State

- Working checkout: `C:\Users\User\bna-release-clean`
- Branch: `release/operations-parent-student-action-registry-2026-06-11`
- Existing production release was deployed and smoke-tested before this pass.
- Current worktree already contains dirty source/report files from prior or
  concurrent work; this pass must avoid reverting them or staging them
  accidentally.

## Running Notes

- Pro-to-Codex folder structure created under `ops/pro-codex/`.
- Prompt copied into `ops/pro-codex/inbox/`.
- `ops/pro-codex/README.md` created to document the Pro -> Codex workflow.

Further audit and implementation notes will be appended as code and UI checks
run.
