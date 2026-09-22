# ChatGPT Dropoff Fleet Claim Completion Fix

Generated: 2026-07-05T14:58:00+03:00
Raw ID: RAW-20260705-004
Requirement: REQ-20260705-008
Packet: chatgpt-dropoff-smoke-test-20260705-001
Task: #1869
Agent job: #385

## Summary

The ChatGPT dropoff workflow could collect and queue a GitHub-comment packet,
but the agent fleet did not claim the queued job because its linked task was
outside the default `/api/bna/tasks` window.

The supervisor now hydrates linked tasks for observable jobs through
`/api/bna/tasks/:id`, filters only queued jobs as claimable, sorts ChatGPT
dropoff packet jobs first, and resolves linked tasks directly again after a job
is claimed. Telegram notification failures are now best-effort and cannot abort
agent-job execution.

## Verification

- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/agent-fleet-hardening.test.js tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-comment-collector.test.js` (`15/15`)
- PASS `npm run agent:fleet:status` after the claim fix showed:
  - Observable Codex jobs: 29
  - Claimable observable jobs: 28
  - Linked observable task lookup: fetched 29, missing 0
  - Next claimable job: `#385 / task #1869`
- LIVE READBACK: restarted fleet claimed job `#385`; task `#1869` moved to
  `in_progress`.
- PATCHED FOLLOW-UP: Telegram `chat not found` notification error no longer
  aborts job execution.
- LIVE CLOSEOUT: `POST /api/bna/agent-jobs/385/complete` succeeded.
- LIVE READBACK: job `#385` is `completed`; task `#1869` is `done`.

## Guardrails

- No sends, payments, access changes, DNS changes, credential changes,
  provider mutations, Drive writes, or production data mutations were performed
  by Codex.
- The agent fleet watcher was stopped after completing the smoke job so it
  would not automatically claim unrelated broad queued jobs from the dirty
  shared worktree.

## Remaining Non-Blocking Finding

The live task display title for task `#1869` was rewritten to `Confirm Resend
sender settings` even though the source metadata and original raw message point
to the ChatGPT dropoff packet. The task/job were still processed using the
correct packet metadata and original raw message. A future cleanup can harden
display-title preservation for `chatgpt_dropoff` tasks.
