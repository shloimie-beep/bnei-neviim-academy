# 2026-06-16 On-Page Scoped Helper Tool Parity

Cycle ID: `2026-06-16-on-page-scoped-helper-tool-parity`
Status: Local implementation verified; deploy and live migration follow-up required
Owner: Codex

## Raw Input Queue

| Field | Value |
| --- | --- |
| Raw ID | RAW-20260616-002 |
| Source channel | `codex_chat` / downloaded prompt |
| Source file | `C:\Users\User\Downloads\2026-06-16-codex-on-page-scoped-helper-tool-parity-prompt (1).md` |
| Parse status | `implemented` locally; `registered` for deploy follow-up |
| Requirement register | `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md` |
| Created requirements | REQ-20260616-002 through REQ-20260616-009 |
| Created tasks | TASK-20260616-002 through TASK-20260616-007 |
| Decisions | DEC-20260616-002 |
| Open questions | Q-20260616-002 |
| Durable memory candidates | MEM-20260616-002 |

Raw prompt summary:

Shloimie asked Codex to pause browser-workbench work and build the foundation
for a real page-native helper: every person/workspace gets one scoped helper
on the page, with role-aware identity, tone/profile memory, knowledge sources,
tool registry parity with buttons and APIs, planner, confirmation gates,
audit logs, safe result links, error/blocker handling, and child-safe student
mode.

Raw excerpt:

> Every person/workspace gets one scoped helper on the page. The helper understands that person's tone, role, knowledge base, and permissions. It can do, in natural language, the same things that person could do through buttons/forms/API calls in that workspace.

## Parsed Requirements

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| REQ-20260616-002 | Audit current helper, Operations, source-of-truth, and newest handoff context before editing | Done | `git status`, `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `SYSTEM-STATE.md`, `README.md`, `server.js`, `package.json`, `public/operations.html`, `scripts/telegram-kimi-bridge.mjs`, newest `tasks-pending/` inspected |
| REQ-20260616-003 | Add scoped helper resolver for admin, Rabbi, provider, parent, student, and family contexts | Done | `src/lib/bna/helper/scope.js`, `src/lib/bna/helper/safety.js`, tests in `tests/helper-scope-profile-knowledge.test.js` |
| REQ-20260616-004 | Add helper profile, questionnaire, and scoped knowledge storage | Done | `src/lib/bna/helper/profile.js`, `src/lib/bna/helper/knowledge.js`, startup SQL in `server.js`, migration `railway-migration-2026-06-16-helper-profile-knowledge.sql` |
| REQ-20260616-005 | Extend tool registry with side-effect levels, allowed scopes, roles, confirmation policies, audit metadata, and safe client metadata | Done | `src/lib/bna/helper/tool-registry.js`, `src/lib/bna/helper/confirmation-gates.js`, `src/lib/bna/helper/permissions.js` |
| REQ-20260616-006 | Add helper API endpoints for context/chat/profile/questionnaire/knowledge/action-log without external sends | Done | `server.js` routes under `/api/bna/helper/*`, route allowlist updates, focused tests |
| REQ-20260616-007 | Add on-page Operations helper scope card, scoped name, suggestions, tool count, and teach-helper entry | Done | `public/operations.html`; browser smoke screenshots in `screenshots/helper-parity-operations-desktop.png` and `screenshots/helper-parity-operations-mobile.png` |
| REQ-20260616-008 | Generate Markdown and JSON helper tool parity maps | Done | `scripts/generate-helper-tool-parity-map.mjs`, `ops/helper-tool-parity-map.md`, `ops/helper-tool-parity-map.json`, `npm run helper:parity` |
| REQ-20260616-009 | Record helper action/audit storage and no-secret audit behavior | Done locally | `bna_helper_tool_audit_log` remains canonical; compatibility `bna_helper_action_log` added in `server.js`, `src/lib/bna/helper/audit-log.js`, and Railway migration |

## Tasks

| ID | Task | Status | Evidence / Blocker |
| --- | --- | --- | --- |
| TASK-20260616-002 | Implement helper scope/profile/knowledge/safety modules | Done | New helper modules under `src/lib/bna/helper/`; focused tests pass |
| TASK-20260616-003 | Harden helper permissions for provider, parent, family, and student scopes | Done | Cross-scope permission tests pass |
| TASK-20260616-004 | Extend helper registry and planner metadata for confirmation and audit decisions | Done | Registry metadata tests pass; confirmation-gate tests pass |
| TASK-20260616-005 | Add helper profile/knowledge/action-log API routes | Done | Route tests pass; `node --check server.js` pass |
| TASK-20260616-006 | Add scoped helper UI to Operations and verify actual launcher click | Done | Playwright smoke passed on desktop and mobile against `http://127.0.0.1:8095/operations` |
| TASK-20260616-007 | Deploy bundle, apply Railway helper migration, and run Railway doctor/live helper smoke | Pending | Local verification complete; no deploy or migration application performed in this turn |

## Decision

| ID | Decision | Rationale | Status |
| --- | --- | --- | --- |
| DEC-20260616-002 | Do not build browser/Chrome/Playwright external-site workbench in this pass | Prompt explicitly superseded browser-workbench direction; current priority is page-native helper parity | Applied |

## Open Question

| ID | Question | Why It Matters | Current Answer |
| --- | --- | --- | --- |
| Q-20260616-002 | Which `tool_needed` parity records should become first-class helper handlers next? | The generated map found many app actions that are not yet exposed as safe helper tools | Keep them in the parity map until Shloimie chooses the next helper expansion lane or a future Codex cycle prioritizes by surface/risk |

## Durable Memory Candidate

| ID | Memory | Status |
| --- | --- | --- |
| MEM-20260616-002 | The page-native helper is intended to become a main interface: scoped per person/workspace, permission-aware, profile/tone-aware, child-safe for students, and tool-parity-driven rather than a fake chat bubble. | Promoted to `MEMORY.md` |

## Implementation Summary

- Added scoped helper resolver, safety policy, profile/questionnaire, knowledge,
  confirmation-gate, and planner compatibility modules under
  `src/lib/bna/helper/`.
- Tightened helper permissions so provider/parent/family/student contexts do
  not inherit admin-wide tool access.
- Expanded helper tool metadata with side-effect level, scope, role,
  confirmation, and audit fields for client display and planning.
- Added helper profile, knowledge, and compatibility action-log startup SQL
  plus `railway-migration-2026-06-16-helper-profile-knowledge.sql`.
- Added `/api/bna/helper/chat`, `/profile`, `/profile/questionnaire`,
  `/knowledge`, and `/action-log` routes.
- Added the Operations scoped helper card, suggestions, tool count, safety
  badge, and `Teach helper` entry.
- Added `npm run helper:parity` and generated
  `ops/helper-tool-parity-map.md/json` with 254 records.

## Verification

| Check | Result |
| --- | --- |
| `npm run helper:parity` | PASS; wrote 254 helper parity records |
| `node --check server.js` | PASS |
| `node --check scripts/telegram-kimi-bridge.mjs` | PASS |
| `node --check scripts/agent-fleet-supervisor.mjs` | PASS |
| `node --check scripts/generate-helper-tool-parity-map.mjs` | PASS |
| `node --test tests/bna-helper-tools.test.js tests/helper-scope-profile-knowledge.test.js` | PASS 14/14 |
| Playwright local Operations desktop smoke | PASS; clicked visible `Ask / Search`, fetched `/api/bna/helper/context`, rendered Shloimie Helper and suggestions |
| Playwright local Operations mobile smoke | PASS; clicked visible `Ask`, fetched context, rendered scoped card and footer |
| `npm test` | PASS 666/666 |
| `npm run prompts:audit` | PASS; scanned 227 sources and marked the source prompt `done_verified` |
| `npm run watchdog:audit` | PASS; wrote `ops/watchdog-audits/2026-06-16T19-38-watchdog-audit.md`, 0 ramble protocol findings, existing high queue-hygiene findings remain |

## Parity Map Snapshot

- Total records: 254.
- Current status counts: `tool_available` 34, `requires_confirmation` 26,
  `student_safe_only` 11, `external_blocker` 23, `tool_needed` 160.
- Surfaces covered: Operations, parent, provider, Rabbi, and student.

## Final Audit Table

| ID | Status | Evidence | Remaining Blocker |
| --- | --- | --- | --- |
| REQ-20260616-002 | Done | Repo/status/source-of-truth audit completed before code changes | None |
| REQ-20260616-003 | Done | Scope resolver names Shloimie, Rabbi Scheller, provider, parent, student, and family helpers | None |
| REQ-20260616-004 | Done locally | Tables/routes/modules created and covered by tests | Railway migration still needs live application/readback |
| REQ-20260616-005 | Done | Tool metadata and confirmation policy exposed to client and tests | Expand more `tool_needed` actions later |
| REQ-20260616-006 | Done locally | Helper routes added and tested | Live deploy/smoke pending |
| REQ-20260616-007 | Done locally | Desktop/mobile Playwright screenshots saved | Live deploy/smoke pending |
| REQ-20260616-008 | Done | Parity map files generated and tested | Future cycles should convert high-value `tool_needed` records |
| REQ-20260616-009 | Done locally | Audit compatibility log and no-secret redaction path added | Railway migration still needs live application/readback |

## Guardrails

- No browser-workbench, Chrome workbench, or external-site automation was built.
- No email, WhatsApp, Telegram, Buffer, Zoom, Vimeo, Stripe, DNS, Google,
  payment, account-grant, credential-copy, publish, upload, or external CRM
  write was performed.
- Student scope remains child-safe and cannot access admin/private/cross-student
  data through helper tools.
