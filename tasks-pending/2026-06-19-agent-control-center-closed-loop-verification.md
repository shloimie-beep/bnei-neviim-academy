# Agent Control Center Closed-Loop Verification - 2026-06-19

## Raw intake

The full prompt is preserved at
`raw-input/RAW-20260619-001-agent-control-center-codex-queue-prompt.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260619-001 |
| Source | Codex chat path to `C:\Users\User\Downloads\BNA_AGENT_CONTROL_CENTER_CODEX_QUEUE_PROMPT.md` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-19-agent-control-center-closed-loop-verification.md` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no explicit Codex goal tool request; prompt itself says implement |
| Active goal objective | not created |
| Goal tool used | no |
| Execution directive | Execute after the active June 18 recovery run is complete or blocked solely on precise external/operator action. Current run is blocked on audit output, so local work may proceed. |
| Terminal statuses required | done / already_satisfied / blocked / needs_operator_decision / failed / archived |
| Deploy/live-smoke required for app-visible work | yes, but deployment is blocked until explicit approval |
| Next requirement IDs to work | REQ-20260618-121, REQ-20260618-123, then verification closeout for REQ-20260618-113 through REQ-20260618-118 and REQ-20260618-120 |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260618-112 | Agent Control Center and closed-loop verification | "IMPLEMENT THE SYSTEM" | One Operations control plane for task-specific verifier runs, prompts, progress, evidence, seal outcomes, task feedback, decisions, audit history, tests, and safe handoff. | Operations / Agents | API, UI, state-machine, RBAC, E2E, Playwright, evidence | In progress |
| REQ-20260618-113 | Agent profiles and capabilities | "Create a small, clear agent registry." | Codex Builder, Browser QA, Playwright Verifier, Research Agent, and Operator profiles exist with capability metadata. | Agents | Schema/API/unit tests | Needs verification |
| REQ-20260618-114 | Agent run schema and state machine | "Use a canonical state machine" | Agent runs/events/artifacts/templates and task verification fields exist with idempotent creation and server-side transition validation. | Agents / API | API/unit tests and negative transitions | Needs verification |
| REQ-20260618-115 | Agents menu and task-card handoff UI | "Add one clear Agents module" | Super Admin sees Agents tabs/cards and task detail handoff controls. | Operations UI | Static UI tests and Playwright responsive checks | Needs verification |
| REQ-20260618-116 | Prompt generation and versioning | "Create one deterministic prompt generator." | Browser QA prompt contains run URL, task, criteria, allowed/forbidden actions, start steps, no secrets, and stored prompt version. | Prompting | Unit/API tests | Needs verification |
| REQ-20260618-117 | Agent Run portal and progress reporting | "Create a focused Agent Run screen" | `/operations/agents/runs/:runKey` supports claim/progress/checklist/result flow after authentication. | Operations UI / API | API and Playwright flow tests | Needs verification |
| REQ-20260618-118 | Evidence submission and Seal Run | "Seal requires every criterion marked..." | Evidence references, submit, seal pass/fail/blocked, immutability, and task feedback are enforced. | Agents / Tasks | API tests | Needs verification |
| REQ-20260618-119 | Decisions and Codex feedback routing | "After sealed_fail... return task to Codex" | Failed runs requeue feedback; blocked/needs-operator runs create clean Decision cards without duplicates. | Tasks / Decisions | API tests | Done locally |
| REQ-20260618-120 | Workspace/RBAC/security controls | "A run URL alone must not grant access." | Auth, Super Admin-only control center, scoped query checks, and cross-scope denials protect runs. | Security | Negative API tests | Needs verification |
| REQ-20260618-121 | Verification policy and Playwright integration | "Every coherent implementation work package must have a verification plan." | Verification modes route work to automated, browser-agent, operator, or mixed flows without broad crawls/watch loops. | Tests / Policy | Unit/API tests | In progress |
| REQ-20260618-122 | Notifications and audit history | "Every important action records..." | Run events, task activity/comments, ledger/changelog references, and concise notification hooks are current. | Audit / Notifications | Evidence review + notification tests | In progress |
| REQ-20260618-123 | End-to-end tests, safe demo data, and manual Agent Mode smoke prompt | "Use safe test data" | Safe seeded/demo loop proves create-run, claim, progress, evidence, submit, seal pass/fail/block, cleanup, and manual Agent Mode prompt. | Tests / Demo data | Unit/API/UI/Playwright + manual prompt path | Not started |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260619-001 | Preserve prompt and register workstream | Codex | agent lifecycle | "Preserve the raw source." | Raw file, memory note, requirement register, execution-run IDs, ledger entry. | Done locally |
| TASK-20260619-002 | Build backend agent-run foundation | Codex | Codex Queue | "Data model and APIs" | Idempotent schema, APIs, prompt rendering, transitions, task feedback, syntax/tests. | Needs verification |
| TASK-20260619-003 | Build Agents UI and run portal | Codex | Codex Queue | "Super Admin Agents menu" | Agents view, task handoff, copy/open prompt, run page, mobile-safe controls. | Needs verification |
| TASK-20260619-004 | Add focused verification coverage | Codex | Codex Queue | "Run new targeted agent-control tests." | Unit/API/static UI tests and targeted Playwright where feasible. | In progress |
| TASK-20260619-005 | Create manual Agent Mode smoke prompt | Codex | Codex Queue | "Required generated operator prompt" | Copy-ready prompt stored in repo with safe run URL/checklist. | Pending |

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|
| DEC-20260619-001 | Deployment/release approval is required before production deploy or live smoke. | Prevents production mutation before local acceptance and operator approval. | This register / active execution run | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260619-001 | Where should the first real manual Agent Mode smoke run after local acceptance? | Needed for final live-ready evidence. | Not blocking local implementation | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260618-113 | `src/lib/bna/agent-control.js`, `server.js`, API routes | Create registry SQL, profile views, and profile list API. | `node --check`, targeted tests |
| REQ-20260618-114 | `src/lib/bna/agent-control.js`, `server.js` | Add run schema, state machine, idempotent task run creation, events/artifacts. | API tests |
| REQ-20260618-115 | `public/operations.html` | Add Agents navigation, tabs, cards, task detail Agent Verification section. | Static UI tests and Playwright |
| REQ-20260618-116 | `src/lib/bna/agent-control.js`, `server.js` | Render and store deterministic Browser QA prompts with exact run URLs. | Unit/API tests |
| REQ-20260618-117 | `public/operations.html`, `/operations/agents/runs/:runKey` | Render focused run portal with claim/progress/evidence/submit/seal controls. | Playwright/API tests |
| REQ-20260618-118 | `server.js` | Enforce evidence and criteria before seal; update task comments/status. | API tests |
| REQ-20260618-119 | `server.js` | Create linked Decision cards and Codex feedback on blocked/fail outcomes. | API tests |
| REQ-20260618-120 | `server.js` | Require auth, Super Admin control center, scoped project checks. | Negative tests |
| REQ-20260618-123 | `tests/*`, `ops/operator-prompts/*` | Add safe local acceptance loop and manual prompt. | Focused tests |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260618-112 | In progress | `raw-input/RAW-20260619-001-agent-control-center-codex-queue-prompt.md`; `src/lib/bna/agent-control.js`; `server.js`; `public/operations.html`; `tests/agent-control-center.test.js` | Agent helper/schema/API/UI/action-registry/tests and active-run docs updated | PASS `node --check server.js`; PASS `node --check src/lib/bna/agent-control.js`; PASS `node --test tests/agent-control-center.test.js`; PASS `npm run bna:run:validate` | DB/API smoke, negative RBAC tests, browser smoke, safe demo data/E2E, notification hooks, manual Agent Mode smoke, release approval remain |
| REQ-20260618-119 | Done locally | `server.js`; `tests/agent-control-center.test.js`; active `requirements.json` | Failed/blocked outcomes update task state and create/reuse linked operator Decision tasks | PASS focused contract/static test | Live/app closeout not claimed; parent remains open |
