# Next Session

Current run: `2026-06-23-complete-system-reconciliation`

Branch:
`codex/issue-8-complete-system-reconciliation`

Worktree:
`C:\Users\User\Documents\Codex\2026-06-23\goal-c-users-user-downloads-bna\work\bna-reconciliation`

Open requirements:

- `REQ-20260623-209`: blocked on approved external readback/backfill gates.
- `REQ-20260623-210`: in progress; stable display ID, prompt lifecycle bridge,
  GitHub/ChatGPT source adapter, and canonical intake service/persistence
  packet plus local persistence readback and watchdog contract slices are
  verified. Local synthetic E2E now covers canonical intake/readback, with
  remaining approved production persistence apply, UI/broader watchdog, deploy,
  and live verification work open.

Next exact commands for continuation:

```powershell
git fetch origin
git switch codex/issue-8-complete-system-reconciliation
git pull --ff-only origin codex/issue-8-complete-system-reconciliation
npm run bna:run:resume
```

Completed implementation slice:

- Shared canonical display ID helper.
- Source-aware parser/protocol/goal-memory IDs.
- Operations-timezone display date handling for timestamps.
- Regression tests for same-day source collisions, task/ticket prefix
  collisions, and Jerusalem date rendering.
- Prompt lifecycle bridge for `pass`/`passed`/`sealed_pass` package closeout
  through canonical parent `completed` status.
- GitHub issue/PR and ChatGPT export source provider/kind normalization,
  including GitHub dry-run intake alignment.
- Canonical intake service entrypoint that builds one source/parse/parent
  prompt/persistence-ready packet for adapters and contract scripts.
- Local canonical persistence memory adapter with idempotent apply/readback by
  raw intake, parse run, or parent prompt locator.
- Raw-intake watchdog contract checks for canonical service/readback and
  adapter/script drift.
- Local platform synthetic E2E wired through canonical intake service/readback
  with an updated no-external-write artifact.

Follow-on implementation scope:

- Approved production persistence apply/readback for source envelopes and
  adapter ingestion records across Telegram, Codex, Operations, Drive,
  recordings, approved uploads, and the now-normalized GitHub/ChatGPT source
  providers.
- Canonical tasks/decisions/content/community/integration persistence.
- Lifecycle state machine, auto-resume watchdogs, Operations UI source/audit
  tabs, deploy, and live read-only verification.

Do not deploy, delete worktrees, rewrite Git history, apply production backfill,
send messages, upload to Vimeo, or charge cards without explicit gates.
