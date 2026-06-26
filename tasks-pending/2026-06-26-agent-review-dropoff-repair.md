# Agent Review Drop-Off, Scoped Context Access, and Helper Repair

## Raw intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260626-001 |
| Parent ID | PARENT-20260626-001 |
| Source | Codex chat attachment pasted-text.txt |
| Source path | raw-input/RAW-20260626-001-agent-review-dropoff-repair.md |
| Linked Issue | GitHub Issue #24 |
| Prior Issue #24 closeout | https://github.com/shloimie-beep/bnei-neviim-academy/issues/24#issuecomment-4802269945 |
| Execution run | ops/execution-runs/2026-06-26-agent-review-dropoff-repair/ |
| Parse status | registered |

Additional clarification source: `RAW-20260626-002` at `raw-input/RAW-20260626-002-agent-mode-task-decision-dropoff.md`. It adds `REQ-20260626-008` for hybrid Agent Mode prompt/drop-off workflow on visible owner Tasks and Decisions, extending the existing Issue #7 task/Decision system without a second queue.

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260626-001 | Register Agent Review repair run and baseline | RAW-20260626-001-S001 | bna_platform / agent_review_hub | Codex | run_control | P0 | 0 | none | no | done |
| REQ-20260626-002 | Agent Review dashboard prompt cards and copy metadata | RAW-20260626-001-S002, RAW-20260626-001-S003 | bna_platform / agent_review_hub | Codex | app_security_ui | P0 | A | REQ-20260626-001 | yes | not_started |
| REQ-20260626-003 | Agent Review drop-off form and repair/rerun flow | RAW-20260626-001-S004 | bna_platform / agent_review_hub | Codex | agent_result_bridge | P0 | B | REQ-20260626-002 | yes | not_started |
| REQ-20260626-004 | Review-context login return and scoped access blocking | RAW-20260626-001-S005 | bna_platform / agent_review_hub | Codex | auth_security | P0 | C | REQ-20260626-002, REQ-20260626-003 | yes | not_started |
| REQ-20260626-005 | Helper false-success and public private-data behavior repair | RAW-20260626-001-S006 | bna_platform / helper_correctness | Codex | helper_actions | P0 | D | REQ-20260626-001 | yes | not_started |
| REQ-20260626-006 | Repair tests and watchdog coverage | RAW-20260626-001-S007 | bna_platform / agent_review_hub | Codex | test_coverage | P0 | E | REQ-20260626-002, REQ-20260626-003, REQ-20260626-004, REQ-20260626-005 | no | not_started |
| REQ-20260626-008 | Hybrid Agent Mode prompt/drop-off on owner Tasks and Decisions | RAW-20260626-002-S001 through RAW-20260626-002-S005 | bna_platform / agent_review_hub | Codex | app_security_ui | P0 | F | REQ-20260626-002, REQ-20260626-003 | yes | in_progress |
| REQ-20260626-007 | Merge, deploy, live verification, and final closeout | RAW-20260626-001-S008 | bna_platform / agent_review_hub | Codex | release_closeout | P0 | Z | REQ-20260626-002, REQ-20260626-003, REQ-20260626-004, REQ-20260626-005, REQ-20260626-006, REQ-20260626-008 | yes | not_started |

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260626-001 | Done | raw/register/run files | baseline checks | none |
| REQ-20260626-002 | Not started | pending | pending | dashboard repair |
| REQ-20260626-003 | Not started | pending | pending | drop-off repair |
| REQ-20260626-004 | Not started | pending | pending | auth/context repair |
| REQ-20260626-005 | Not started | pending | pending | helper repair |
| REQ-20260626-006 | Not started | pending | pending | tests |
| REQ-20260626-008 | In progress | `src/lib/bna/agent-review-hub.js`, `server.js`, `public/operations.html`, `public/agent-review-dropoff.html`, registries, `tests/agent-mode-task-dropoff.test.js` | focused tests pass locally; deploy/live proof pending | app-visible Task/Decision Agent Mode workflow must be deployed/live-smoked before Done |
| REQ-20260626-007 | Not started | pending | pending | deploy/live closeout |
