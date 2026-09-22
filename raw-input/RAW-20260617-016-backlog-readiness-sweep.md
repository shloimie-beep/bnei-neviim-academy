# RAW-20260617-016 - Backlog Readiness Sweep

- Source: codex_chat
- Captured at: 2026-06-17T18:45:00+03:00
- Parse status: registered
- Requirement register: `tasks-pending/2026-06-17-backlog-readiness-sweep.md`

## Raw Text

> Now that didn't come out clearly. What I want you to do is to finish up all the backlog stuff, all the tasks, everything that was queued, and everything that was stuck. Make sure all the updates, every single ramble, and every single file that was dropped in is parsed, and everything has been processed, parsed, and there's no stale data. I need to make a new ramble and make a bunch of updates, and I'm concerned that lots of what I said is still stuck in queue because the work tree is dirty and we weren't able to push it, and it's not live. A lot of my UI changes, I believe, are stuck like that. So therefore, finish everything up and get everything ready for the next ramble.

## Parsed Items

- `REQ-20260617-228`: Audit every current queue/intake source for unparsed, stale, duplicate, blocked, or local-only work.
- `REQ-20260617-229`: Finish executable queued Codex tasks and deploy/app-smoke them before marking done.
- `REQ-20260617-230`: Classify true human/external blockers out of the Codex queue with visible blocker status instead of leaving them as "waiting for Codex."
- `REQ-20260617-231`: Verify dropped prompt/files and rambles are parsed into registers/tasks/ledger, with no stale data.
- `REQ-20260617-232`: Prove the deployed app includes the latest queue/protocol/UI changes despite the dirty worktree.
- `REQ-20260617-233`: Produce a final readiness audit before the next ramble.

## Guardrails

- Do not stage or commit the mixed dirty worktree unless explicitly requested.
- Do not perform live sends, social publishes, payment charges, DNS writes, account grants, credential copies, uploads, or external connector writes.
- Use official app APIs for live task/job closeout; do not directly mutate production database state.
