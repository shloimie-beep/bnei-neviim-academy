# Next Session

Current run: `2026-06-23-complete-system-reconciliation`

Branch:
`codex/issue-8-complete-system-reconciliation`

Worktree:
`C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`

Open requirements:

- `REQ-20260623-209`: blocked on approved external readback/backfill gates.
- `REQ-20260623-210`: follow-on canonical implementation package.

Next exact commands after this PR is reviewed:

```powershell
git fetch origin
git switch master
git pull --ff-only origin master
git switch -c codex/issue-8-canonical-persistence
npm run bna:run:resume
```

Follow-on implementation scope:

- Durable source envelopes and adapter ingestion for ChatGPT, Telegram, Codex,
  Operations, Drive, recordings, and approved uploads.
- Canonical tasks/decisions/content/community/integration persistence.
- Lifecycle state machine, auto-resume watchdogs, Operations UI source/audit
  tabs, synthetic E2E, deploy, and live read-only verification.

Do not deploy, delete worktrees, rewrite Git history, apply production backfill,
send messages, upload to Vimeo, or charge cards without explicit gates.
