# RAW-20260705-005 - ChatGPT Dropoff Fleet Claim Completion Fix

Source channel: codex_chat
Captured at: 2026-07-05
Operator: Shloimie
Parse status: registered
Requirement register: tasks-pending/2026-07-05-chatgpt-dropoff-fleet-claim-completion-fix.md

## Raw wording

> Okay, fix it. Keep going until it's done.

## Immediate context

This followed the status update that the ChatGPT-to-Codex dropoff workflow can
collect and queue a GitHub-comment packet, but the agent fleet did not claim
or complete the queued job.

Observed before implementation:

- PR #90 merged the core ChatGPT dropoff protocol and scripts to `master`.
- A smoke packet from GitHub PR comment
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/90#issuecomment-4885699190`
  materialized under
  `ops/chatgpt-ramble-dropoff/incoming/chatgpt-dropoff-smoke-test-20260705-001/`.
- `scripts/chatgpt-dropoff-ingestor.mjs` queued the packet as task `#1869`
  and agent job `#385`.
- Live readback showed job `#385` was still `queued` and unclaimed.
- The default `/api/bna/tasks` list returned 500 tasks with max ID `1762`, so
  the fleet claim filter did not see task `#1869`.
- `/api/bna/tasks?limit=2000` returned 1000 tasks and included task `#1869`.

## Parsed requirement

- `REQ-20260705-008`: repair the agent-fleet claim path so observable queued
  ChatGPT dropoff jobs can validate and claim their linked task even when the
  default task list window misses that task.

## Guardrails

- No external sends, payments, access changes, DNS changes, credential changes,
  provider mutations, Drive writes, or production data mutations.
- Do not alter unrelated dirty UI/app/server work.
- Do not mark complete until focused local tests and safe live readbacks prove
  the dropoff job is claimable or completed, or a precise remaining blocker is
  recorded.
