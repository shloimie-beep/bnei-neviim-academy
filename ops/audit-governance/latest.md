# Audit Governance Report

Generated: 2026-11-08T13:17:40.477Z

Result: NEEDS TASK MAPPING

This report answers whether audit artifacts are implemented/proven, linked to
active work, blocked, stale/unmapped, untracked, or archive-only candidates.
The JSON report contains the full inventory.

## Status Counts

- active_requirement_or_task: 51
- archive_candidate: 39
- blocked_or_needs_decision: 123
- implemented_or_proven: 30
- needs_task_mapping: 4
- stale_needs_task_mapping: 52
- unclear_needs_review: 2
- untracked_needs_registration: 2

## Needs Task Mapping

These audit artifacts contain likely actionable gap language but do not have a
stable requirement/task/decision/watchdog mapping.

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| stale_needs_task_mapping | `tasks-pending/2026-05-26-login-ghl-audit` | none | clean | Create a scoped REQ/TASK/DEC/WATCH mapping or archive with rationale. |
| stale_needs_task_mapping | `tasks-pending/2026-05-27-bna-telegram-accountability-audit` | none | clean | Create a scoped REQ/TASK/DEC/WATCH mapping or archive with rationale. |
| stale_needs_task_mapping | `tasks-pending/2026-06-01-railway-auth-audit` | none | clean | Create a scoped REQ/TASK/DEC/WATCH mapping or archive with rationale. |


## Untracked Audit Packages

These packages exist in the local worktree but are not registered in Git. They
must be inspected for private data before they are committed or archived.

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| untracked_needs_registration | `ops/watchdog-audits/2026-10-29-product-quality-drift` | none | ?? ops/watchdog-audits/2026-10-29-product-quality-drift.json; ?? ops/watchdog-audits/2026-10-29-product-quality-drift.md | Inspect for private data, then register as evidence, map to a task, or archive intentionally. |
| untracked_needs_registration | `ops/watchdog-audits/2026-10-30-product-quality-drift` | none | ?? ops/watchdog-audits/2026-10-30-product-quality-drift.json; ?? ops/watchdog-audits/2026-10-30-product-quality-drift.md | Inspect for private data, then register as evidence, map to a task, or archive intentionally. |


## Blocked Or Needs Decision

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| blocked_or_needs_decision | `ops/ui-audits/2026-06-11-full-app-ui-audit` | none | clean | Keep the blocker owner, consequence, and exact next action visible. |
| blocked_or_needs_decision | `ops/ux-audit-runs/2026-06-11-click-map` | none | clean | Keep the blocker owner, consequence, and exact next action visible. |
| blocked_or_needs_decision | `ops/audits/2026-06-14-bna-production-cleanup-audit` | none | clean | Keep the blocker owner, consequence, and exact next action visible. |


## Active Requirement Or Task

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| active_requirement_or_task | `ops/system-audits/2026-06-06-closeout-task-system` | none | clean | Work the linked requirement/task/decision/watchdog item to terminal status. |
| active_requirement_or_task | `ops/system-audits/2026-06-11-task-226-google-workspace-sender-name` | none | clean | Work the linked requirement/task/decision/watchdog item to terminal status. |
| active_requirement_or_task | `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis` | none | clean | Work the linked requirement/task/decision/watchdog item to terminal status. |


## Implemented Or Proven

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| implemented_or_proven | `tasks-pending/2026-06-10-telegram-goal-board-api-audit` | none | clean | Keep as evidence; no new task needed unless a newer regression exists. |
| implemented_or_proven | `ops/audits/2026-06-14-one-time-repo-inventory` | none | clean | Keep as evidence; no new task needed unless a newer regression exists. |
| implemented_or_proven | `ops/system-audits/2026-06-14-task-title-cleanup-dry-run` | none | clean | Keep as evidence; no new task needed unless a newer regression exists. |


## Archive Or Manual Review Candidates

| Status | Path | IDs | Git | Recommendation |
|---|---|---|---|---|
| archive_candidate | `ops/system-audits/2026-06-11-task-queue-reconciler` | none | clean | Archive as provenance or add a mapping if it still has actionable work. |
| archive_candidate | `ops/system-audits/2026-06-12-task-queue-reconciler` | none | clean | Archive as provenance or add a mapping if it still has actionable work. |
| archive_candidate | `ops/watchdog-audits/2026-06-17-communications-alerts` | none | clean | Archive as provenance or add a mapping if it still has actionable work. |
