# RAW-20260617-018 - Full System Debug Queue Unblock Watchdog

- Source channel: codex_chat
- Intake type: full_system_debug_queue_unblock_watchdog_audit
- Legacy descriptive alias: RAW-20260617-SYSTEMDEBUG-001
- Source file: `C:\Users\User\Downloads\bna_full_system_debug_queue_unblock_watchdog_prompt_2026_06_17.md`
- Received: 2026-06-17
- Parse status: registered
- Requirement register: `tasks-pending/2026-06-17-full-system-debug-queue-unblock-audit.md`

## Raw Summary

Operator dropped a full-system debug, queue unblock, watchdog, UI/action audit,
and next-ramble readiness prompt. The prompt requires Codex goal-mode execution:
audit current repo truth, register the task, clarify `Needs Attention`, audit
all queues, clean stale/duplicate/backlogged items, inspect UI/action/link
quality, verify raw intake readiness, run watchdogs, audit agent fleet state,
test/deploy when appropriate, and report only real remaining blockers.

## Parsed IDs

- `REQ-20260617-234` Register this dropped prompt as raw intake and system-debug requirement set.
- `REQ-20260617-235` Make `Needs Attention` mean only items requiring operator attention.
- `REQ-20260617-236` Audit all queue-like sources and classify ownership/action.
- `REQ-20260617-237` Clean, repair, archive, or explicitly block backlog items.
- `REQ-20260617-238` Audit app UI against desktop/tablet/mobile quality expectations.
- `REQ-20260617-239` Audit visible buttons/actions and route/link/security behavior.
- `REQ-20260617-240` Prove next-ramble raw intake readiness across available surfaces.
- `REQ-20260617-241` Run watchdogs and create/update missing reports.
- `REQ-20260617-242` Audit active agent fleet, stale jobs, duplicate requeues, and locks.
- `REQ-20260617-243` Run local tests, deploy if safe, smoke live, and provide final closeout.

## Notes

This raw record is part of the 2026-06-17 backlog-readiness sweep and must be
closed with evidence in the linked register, `ops/agent-task-ledger.jsonl`, and
`ops/agent-changelog.md`.
