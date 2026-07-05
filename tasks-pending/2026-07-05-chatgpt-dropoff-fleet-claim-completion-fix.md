# Ramble Intake - 2026-07-05 - ChatGPT Dropoff Fleet Claim Completion Fix

## Raw intake

Shloimie said:

> Okay, fix it. Keep going until it's done.

Context: this refers to the discovered gap where ChatGPT dropoff packets can
be collected and queued, but the agent fleet did not claim the queued smoke
job because its linked task was outside the default task-list window.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-005 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-05-chatgpt-dropoff-fleet-claim-completion-fix.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Fix the ChatGPT dropoff agent-fleet completion gap end to end: preserve the operator instruction, patch the fleet claim path so queued ChatGPT dropoff jobs are claimable and completable, verify with focused tests and live/safe readbacks, and record evidence/status. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no; local supervisor/tooling fix with live API readback, deploy only if publishing server-visible changes later becomes necessary |
| Next requirement IDs to work | REQ-20260705-008 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-008 | Repair ChatGPT dropoff observable-job fleet claiming so queued packet jobs are claimable even when the default task-list window misses their linked task. | RAW-20260705-005 | bna_platform / chatgpt_codex_dropoff_workflow | Codex | agent_fleet | high | B1 | Existing PR #90 dropoff workflow and queued smoke job #385 | Fleet can validate linked task #1869 through an expanded/direct lookup path, focused tests cover the regression, and safe live readback shows job #385 is claimable/completed or records a precise remaining blocker. | scripts/agent-fleet-supervisor.mjs; tests/agent-fleet-hardening.test.js | no | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260705-008 | bna_platform\|chatgpt_dropoff\|REQ-20260705-008 | Fix fleet claim eligibility for ChatGPT dropoff jobs. | Codex | bna_platform / chatgpt_codex_dropoff_workflow | RAW-20260705-005 | REQ-20260705-008 | Patch supervisor and tests, then rerun focused verification and live readback. | internal Codex | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260705-008 | None currently. | None. | Codex | Proceed with local tooling fix and safe readbacks. | Stop after planning. | Stopping would leave queued ChatGPT packets unclaimed. | Implement and verify. | none | Done |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260705-008 | Does the live job complete after the local supervisor claim path can see task #1869? | Determines whether the remaining blocker is code, deploy/runtime state, or another queue policy. | yes | Done: live job #385 completed and task #1869 is done. |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260705-008 | Agent fleet observable jobs must not depend on a truncated default task list when the job itself links a task ID. | no | Implementation invariant belongs in tests/code unless it recurs as a durable operating rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260705-008 | scripts/agent-fleet-supervisor.mjs; tests/agent-fleet-hardening.test.js | Added linked-task hydration for observable jobs, queued-only claim filtering, ChatGPT dropoff claim prioritization, direct linked-task lookup after claim, and best-effort Telegram notifications. | PASS `node --check scripts/agent-fleet-supervisor.mjs`; PASS focused dropoff/fleet tests 15/15; PASS patched `npm run agent:fleet:status`; LIVE job #385 completed and task #1869 done. | pending | pending | not required for local tool verification; live API readback completed |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-008 | Done | `ops/chatgpt-ramble-dropoff/pickups/2026-07-05-fleet-claim-completion-fix.md`; packet `status.json`; live API readback for job #385/task #1869. | scripts/agent-fleet-supervisor.mjs; tests/agent-fleet-hardening.test.js; raw/register/memory/evidence/status/changelog/ledger files | PASS `node --check scripts/agent-fleet-supervisor.mjs`; PASS `node --test tests/agent-fleet-hardening.test.js tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-comment-collector.test.js` 15/15; PASS `npm run agent:fleet:status` showed job #385 first claimable; LIVE closeout job #385 completed/task #1869 done. | Non-blocking: task #1869 display title was rewritten to `Confirm Resend sender settings`; source metadata/raw packet content remained correct. Agent fleet watcher is stopped after smoke completion to avoid unrelated broad queued jobs in the dirty shared worktree. |
