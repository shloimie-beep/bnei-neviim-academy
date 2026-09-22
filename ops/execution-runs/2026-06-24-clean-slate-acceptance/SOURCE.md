# Source

Source ID: `RAW-20260624-007`

Raw source path:
`raw-input/RAW-20260624-007-clean-slate-acceptance-goal.md`

Requirement register:
`tasks-pending/2026-06-24-clean-slate-acceptance.md`

The operator requested goal-mode clean-slate acceptance after the reported
final release. This run verifies the release truth, repairs the active
run/handoff pointer, reconciles queue counts without hiding real blockers,
proves a synthetic next ramble, writes an owner walkthrough, preserves local
worktree state, and produces a GitHub-visible final handoff.

Safety constraints from the source:

- Do not rerun the old final-release integration prompt unless release truth is
  inconsistent.
- Do not apply class backfill in this goal.
- Preserve `REQ-20260624-028` as a real blocked/read-only reconciliation
  requirement linked to GitHub issue #18.
- Preserve the shared `C:\Users\User\BNA v2.0` Vimeo checkout and its
  local-only history.
- Do not delete historical evidence or unique local-only work.
- Do not expose secrets, credentials, private student data, transcripts, or
  fabricated evidence.
