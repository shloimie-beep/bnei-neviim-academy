# Ramble Intake - 2026-07-08 - Agent Review Start, Copy, And Drop-off Repair

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-002-agent-review-start-copy-dropoff-repair.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-002 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-agent-review-start-copy-dropoff-repair.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Implement the Agent Review Start Audit -> Copy -> Drop-off save -> Readback flow, record the failed partial One Time audit, verify with tests/smoke where safe, and leave all related requirements in terminal or explicitly blocked status. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260708-007 through REQ-20260708-014 |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-007 | Add explicit Start Audit state to Agent Review prompt cards. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | agent-review-workflow | P0 | 1 | none | Hub exposes Start Audit / I started this agent mode; starting records in-progress prompt/run/idempotency context, owner context when available, status, started_at, and visible timer/state. | server.js, public/agent-review.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-008 | Gate Copy Agent Prompt behind started audit state and include draft/result ID. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | prompt-contract | P0 | 1 | REQ-20260708-007 | Copy auto-starts or blocks until start; copied prompt includes in-progress AGR/draft/result ID, exact drop-off URL, API fallback, and top/bottom drop-off rules. | server.js, public/agent-review.html, prompt files/tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-009 | Harden Agent Mode prompt language for drop-off-first behavior. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | prompt-contract | P0 | 1 | REQ-20260708-008 | Generated prompts contain mandatory Start Audit, keep drop-off open, blocked-save, no-manual-upload, emergency paste, API fallback, and final response language. | src/lib/bna/agent-review-hub.js, public/agent-review-prompts, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-010 | Support partial BLOCKED saves in the Agent Review drop-off form/API. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | drop-off-api | P0 | 1 | none | Drop-off accepts `blocked`, `fail`, and `pass`; BLOCKED can save without full route matrix and includes blocked route/step, attempted action, observed failure, partial routes, helper responses, suggested correction, evidence notes, and idempotency key. | server.js, public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-011 | Add readback confirmation after Agent Review save. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | result-readback | P0 | 1 | REQ-20260708-010 | Save confirmation shows AGR ID, status, prompt key, idempotency key, readback URL, timestamp, and Open saved readback link. Prompt tells agent to verify readback before final. | server.js, public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-012 | Add autosave/draft persistence for drop-off notes without storing secrets. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | draft-persistence | P1 | 2 | REQ-20260708-010 | Drop-off page locally or server-side autosaves draft text/state and excludes cookies, passwords, API keys, screenshots with private data, refresh tokens, and reusable access secrets. | public/agent-review-dropoff.html, tests | yes | Done locally, pending deploy/live smoke |
| REQ-20260708-013 | Add watchdog/tests for generated prompt compliance and blocked partial save. | RAW-20260708-002 | BNA Operations / Agent Review | Codex | verification | P0 | 2 | REQ-20260708-007, REQ-20260708-010 | Tests verify generated prompts include Start Audit, Copy, drop-off URL, blocked save, final answer format, API fallback, no manual upload language; blocked partial save is accepted. | tests/agent-review-hub.test.js, tests/agent-mode-task-dropoff.test.js, tests/agent-mode-operations-dropoff-prompts.test.js | no | Done locally |
| REQ-20260708-014 | Record the failed One Time Agent Mode audit as durable fail/partial evidence. | RAW-20260708-002 | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | audit-record | P0 | 0 | none | Durable record exists with fail/partial status, blocker, visited routes, partial findings, and future backlog recommendations. It does not mark Issue #24 complete. | raw-input, tasks-pending, ledger/changelog | no | Done locally |

## Parsed Tasks

No new human-facing Tasks should be created from this packet. The work belongs
in the Agent Review/Codex lifecycle and this internal register. Future UI
cleanup prompts should be created only after the drop-off flow is reliable.

## Decisions

None required for this implementation batch. Live deployment may be blocked
later if branch drift, auth, or unrelated dirty work prevents a safe push/deploy.

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260708-003 | Should the failed partial audit be replayed from the live hub immediately after this repair deploy, or should it wait for a new owner Agent Mode session? | A real Agent Mode rerun needs owner login/session timing and should not be faked by local tests. | No for implementation; may block live Agent Mode evidence only | Open |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260708-001 | Agent Review prompts must treat drop-off as a workflow state: Start Audit, keep drop-off open, save pass/fail/blocked, verify readback, then final chat response. | Maybe after implementation | This appears durable for future Agent Mode prompt reliability, but should be promoted after code/test proof. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-014 | raw-input, tasks-pending, ops agent-review evidence | Record failed audit before code edits. | PASS raw record and execution-run evidence include failed/partial findings, routes visited, and blocker. | Pending | Pending | Not required |
| REQ-20260708-007..011 | `server.js`, `public/agent-review.html`, `public/agent-review-dropoff.html`, `src/lib/bna/agent-review-hub.js`, agent review prompt files | Reuse typed result API; add start state, copy gate, partial blocked fields, readback UI, and regenerated prompt contract. | PASS `node --check server.js`; PASS 66 focused tests; PASS `npm run watchdog:actions`; PASS `git diff --check`. | Pending | Pending | Required |
| REQ-20260708-012..013 | drop-off UI/tests/scripts | Add local draft autosave, secret-looking draft guard, compliance tests, registries. | PASS 66 focused tests; PASS action watchdog; route/action registries updated. | Pending | Pending | App-visible deployment required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-007 | Done locally, pending deploy/live smoke | Hub prompt cards show Start Audit, workflow state, start/result ref, timer, and call `/api/bna/agent-review/prompts/start` with CSRF. | `server.js`; `public/agent-review.html`; `ops/action-registry.json`; `ops/route-registry.json`; `tests/agent-review-hub.test.js` | PASS focused tests 66/66; PASS action watchdog. | Commit, push, deploy, live readback. |
| REQ-20260708-008 | Done locally, pending deploy/live smoke | Copy Agent Prompt now calls Start Audit first and prepends the in-progress AGR/draft ID, workflow state, started_at, idempotency key, and readback URL. | `public/agent-review.html`; `server.js` | PASS focused tests 66/66. | Commit, push, deploy, live readback. |
| REQ-20260708-009 | Done locally, pending deploy/live smoke | Generated prompts include `## Required Workflow State`, keep drop-off open, save BLOCKED if blocked, API fallback, readback requirement, and final markers. | `src/lib/bna/agent-review-hub.js`; `public/agent-review-prompts/*` | PASS `npm run agent-review:prompts`; PASS focused tests 66/66. | Commit, push, deploy, production prompt readback. |
| REQ-20260708-010 | Done locally, pending deploy/live smoke | Drop-off supports blocked route/step, attempted action, observed failure, partial routes, partial helper responses, and evidence notes; API metadata stores these fields. | `server.js`; `public/agent-review-dropoff.html` | PASS focused tests 66/66. | Commit, push, deploy, live blocked-save smoke. |
| REQ-20260708-011 | Done locally, pending deploy/live smoke | Save confirmation shows AGR ID, status, prompt key, idempotency key, readback URL, timestamp, and readback/repair links. | `public/agent-review-dropoff.html`; `server.js` | PASS focused tests 66/66. | Commit, push, deploy, live readback. |
| REQ-20260708-012 | Done locally, pending deploy/live smoke | Drop-off autosaves local browser drafts under prompt/run/idempotency scope and refuses secret-looking drafts. | `public/agent-review-dropoff.html` | PASS focused tests 66/66; inline script parse passed. | Commit, push, deploy. |
| REQ-20260708-013 | Done locally | Added registry/test coverage for start route/action, regenerated prompts, partial blocked save fields, and drop-off/readback contract. | `tests/agent-review-hub.test.js`; registries | PASS 66 focused tests; PASS `npm run watchdog:actions`; PASS `git diff --check`. | None after deploy evidence is recorded. |
| REQ-20260708-014 | Done locally | `RAW-20260708-002` and execution-run evidence preserve the failed partial audit, routes visited, blocker, and partial findings without marking Issue #24 complete. | `raw-input/RAW-20260708-002-agent-review-start-copy-dropoff-repair.md`; `ops/execution-runs/2026-06-26-agent-review-dropoff-repair/evidence/2026-07-08-one-time-brand-helper-toolbar-audit-failed-partial.md`; this register | PASS file/readback inspection. | None. |
