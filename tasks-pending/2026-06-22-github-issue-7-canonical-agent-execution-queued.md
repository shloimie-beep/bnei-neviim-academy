# Ramble Intake - 2026-06-22 - github-issue-7-canonical-agent-execution-queued

## Raw intake

GitHub issue #7 is a goal-mode work order for the unified ramble-to-execution
operating system. It is registered as a queued canonical source only. The
current active execution run remains
`ops/execution-runs/2026-06-21-one-time-master-completion/`, and draft PR #5
must not be reset, rebased, overwritten, merged, or repurposed for this work.

Raw wording is preserved at
`raw-input/RAW-20260622-001-github-issue-7-canonical-agent-execution-system.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260622-001 |
| Canonical parent ID | PARENT-20260622-001 |
| Source | GitHub issue #7 and issue comment 4767984220 |
| Parse status | registered |
| Queue status | queued after the current active run is closed or explicitly paused |
| Requirement register | this queued-source handoff only; implementation register/run deferred |
| Existing active run | ops/execution-runs/2026-06-21-one-time-master-completion |
| Active PR context | PR #5, draft, `codex/agent-control-center-20260619` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Register GitHub issue #7 as one queued canonical source without creating a second active execution run. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register the source now; defer implementation until the current active run is safely closed or explicitly paused. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes, when implementation begins |
| Next requirement IDs to work | Continue active run `REQ-20260619-303`; issue #7 implementation waits behind it. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260622-001 | Register GitHub issue #7 as a queued canonical source | RAW-20260622-001 / PARENT-20260622-001 | bna_platform / ramble_to_agent_execution_system | Codex | intake_registration | P0 | queue-registration | Current session only | Raw issue preserved; source registered in active run metadata; no visible Task fan-out; no second active run; PR #5 untouched; GitHub issue acknowledged | raw-input/RAW-20260622-001-github-issue-7-canonical-agent-execution-system.md; tasks-pending/2026-06-22-github-issue-7-canonical-agent-execution-queued.md; ops/execution-runs/2026-06-21-one-time-master-completion/requirements.json; ops/execution-runs/2026-06-21-one-time-master-completion/SOURCE.md; memory/2026-06-22.md; ops/agent-task-ledger.jsonl; ops/agent-changelog.md | no | Done |

## Deferred implementation milestones

These are not active-run requirements yet. Convert them into a dedicated
requirement register or execution run only after the current active run is
safely closed or explicitly paused.

| Future ID | Milestone | Next action | Status |
|---|---|---|---|
| REQ-20260622-002 | Audit and canonical contract | Inventory current intake/parser/queue/task/Decision/agent paths and define the smallest missing integration delta. | Deferred |
| REQ-20260622-003 | GitHub-to-canonical intake | Implement idempotent issue/comment ingestion CLI/API and protected Operations action. | Deferred |
| REQ-20260622-004 | Automatic agent handoff | Convert machine outcomes into locked work packages with progress, evidence, verification, and seal lifecycle. | Deferred |
| REQ-20260622-005 | Operator compact views | Implement Working now, Waiting for you, My Tasks, Recently accomplished, Problems, parent detail, and history search behavior without flooding default UI. | Deferred |
| REQ-20260622-006 | Cleanup, parity, and watchdogs | Add dry-run reversible cleanup and parity/watchdog coverage for provenance loss, parser divergence, duplicate fan-out, stale claims, and visibility leakage. | Deferred |
| REQ-20260622-007 | Final verification and issue closeout | Run focused/broad tests, API/browser smokes, PR/deploy/live-smoke gates where approved, and post final GitHub status. | Deferred |

## Parsed tasks

No visible Shloimie Tasks were created. The only task-like output is this
internal Codex handoff and the source registration event.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260622-001 | github-issue-7-queued-source-registration | Register issue #7 as queued canonical source | Codex | bna_platform / ramble_to_agent_execution_system | RAW-20260622-001 | REQ-20260622-001 | Continue active run batch 4; do not start issue #7 implementation yet. | Agent lifecycle only | Done |

## Decisions

No new operator Decision was created. The only blocker is sequencing:
implementation of issue #7 waits for the current active run to close or be
explicitly paused.

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260622-001 | When should issue #7 implementation start? | Whether PR #5/current run is closed or explicitly paused | Codex / Shloimie only if a pause is requested early | Continue current run first, then branch/worktree from verified platform line | Explicitly pause current run before completion | Starting early risks colliding with PR #5 and the dirty active worktree | Do not begin implementation until current run is closed or Shloimie explicitly pauses it | REQ-20260622-002 through REQ-20260622-007 | Waiting on run sequencing; not a visible Decision card |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260622-001 | Which verified platform line should seed the dedicated issue #7 branch/worktree after the current run closes or pauses? | Determines clean implementation base without disturbing PR #5. | yes, later | Deferred |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260622-001 | GitHub issues/comments from trusted assistants should become canonical intake sources through the BNA raw/parent/execution system, not a separate queue. | no, already covered by AGENTS.md/issue #7 for now | Avoid duplicating durable rules until implementation begins. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260622-001 | raw-input; tasks-pending; active run source metadata; memory; ledger/changelog; GitHub issue comment | Register only, with no active-run pointer change and no visible Task fan-out | `npm run bna:run:validate`; `npm run bna:run:source-coverage`; `npm run bna:run:next`; JSONL parse check; git diff inspection | none | none | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260622-001 | Done | Raw file, queued handoff, active run source metadata, memory note, ledger/changelog entry, GitHub acknowledgement comment `4768106423` | See implementation map | `npm run bna:run:validate`; `npm run bna:run:source-coverage`; `npm run bna:run:next`; JSONL parse check | Implementation milestones deferred behind current active run / PR #5 |
