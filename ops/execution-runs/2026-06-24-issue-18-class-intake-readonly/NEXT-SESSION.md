# Next Session

Resume from:
`C:\Users\User\Documents\Codex\2026-06-24\issue-18-class-intake-readonly`

Active run:
`ops/execution-runs/2026-06-24-issue-18-class-intake-readonly`

Current branch:
`codex/issue-18-class-intake-readonly-20260624`

Terminal requirement:

- `REQ-20260624-028` - read-only class intake reconciliation and safe backfill
  evidence

Current state:

- Read-only reconciliation evidence is generated under
  `ops/class-drive-intake/2026-06-24-issue-18/`.
- Terminal verdict is `NOT SAFE TO APPLY - reasons listed`.
- Local verification passed.
- Requirement status is `done`.
- Draft PR #21 is open:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/21`.
- GitHub issue #18 terminal comment is posted:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18#issuecomment-4792923047`.

Next safe steps:

1. Create or continue the Issue #20 parent run.
2. Keep the Issue #18 no-write verdict intact unless new source evidence
   changes the dry-run result.

Do not run:

- `APPLY_GUARDED_CLASS_BACKFILL`
- production database mutation;
- Drive move/upload/write;
- new transcription calls;
- worker restarts;
- email/Telegram/WhatsApp/social sends;
- charges/refunds/access grants;
- DNS/account permission/credential changes.
