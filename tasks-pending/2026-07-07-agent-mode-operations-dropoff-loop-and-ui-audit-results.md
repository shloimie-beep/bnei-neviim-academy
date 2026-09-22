# Ramble Intake - 2026-07-07 - Agent Mode Operations Drop-Off Loop And UI Audit Results

## Raw intake

Source raw record:
`raw-input/RAW-20260707-006-agent-mode-operations-dropoff-ui-audit-results.md`

The operator wants Agent Mode audits to run in parallel and save their reports
inside BNA Operations instead of depending on GitHub write access. The failed
Agent Mode result should be preserved and used: it identified provider
diagnostic leakage, Payments/Access IA problems, duplicated/competing filter
systems, Studio duplicate tabs, inconsistent filter rows, and inconsistent
buttons.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260707-006 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-07-agent-mode-operations-dropoff-loop-and-ui-audit-results.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no explicit goal tool request |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Preserve the failed Agent Mode result, make Operations drop-off the primary prompt contract, then leave UI implementation packets gated by audit evidence. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes for generated prompt/app text changes; UI implementation deferred |
| Next requirement IDs to work | REQ-20260707-060 through REQ-20260707-064 |

## Product Quality Compiler Packet

| Field | Value |
|---|---|
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class`, plus BNA Operations support context |
| View classes | Super Admin Operations, Rabbi/provider admin, admin-on-provider preview, member/parent, student |
| Routes/screens | Operations One Time workspace, provider portal, communications/email, payments/access, tasks, studio, member route, student route |
| User-facing goal | Agent Mode can audit UI consistency and role views in parallel, save the report into Operations, and create evidence Codex/fleet can pick up without relying on GitHub connector availability. |
| IA rules | Categories, top subcategories, filter rows, toolbar actions, and button sizing must be consistent and logical across One Time backend surfaces. Provider/student/member views must not show Super Admin diagnostic clutter. |
| Visual requirements | No wasted top-section space, equal/control-consistent buttons, mobile-safe 390/430 layouts, no duplicated tab bars, no competing filter systems, no horizontal overflow. |
| Data/API needs | Existing Agent Review `AGR-*` result save path and task-linked `Open drop-off` panel. |
| Privacy/security | No shared passwords, no secret capture, no external sends, no payment/access grants, no provider mutation, no production data mutation. |
| Definition of Ready | Each future UI implementation packet must include exact routes, current-state screenshots/blocked evidence, role scope, state matrix, action states, likely files, verification, and deployment gate. |
| Definition of Done | Implementation evidence, before/after screenshots including 390/430 where app-visible, tests/watchdogs, route/action registry coverage, ledger/changelog/register closeout, deploy/live smoke or explicit blocker. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-060 | Preserve the failed Agent Mode result and its UI findings as source input. | RAW-20260707-006 | BNA / One Time | Codex | intake | P0 | 1 | none | Raw record and register include handoff failure plus actionable UI findings. | `raw-input/`, `tasks-pending/`, `memory/2026-07-07.md` | no | Done |
| REQ-20260707-061 | Make Operations task Agent Review drop-off the preferred Agent Mode handoff path, with GitHub only as fallback. | RAW-20260707-006 | BNA Operations | Codex | agent-dropoff | P0 | 1 | existing Agent Review hub | Prompt packet README, prompt files, manifest, and generated prompt text instruct Agent Mode to save `AGR-*` through Operations first. | `ops/prompt-packets/...`, `src/lib/bna/agent-review-hub.js` | yes | Done |
| REQ-20260707-062 | Redo the One Time UI audit prompts so they are parallel-safe and produce detailed Operations-saved reports. | RAW-20260707-006 | One Time | Codex | prompt-packet | P0 | 1 | REQ-20260707-061 | Prompts 01-03 can run in parallel, Prompt 04 is synthesis, every prompt has the Operations drop-off contract and detailed evidence requirements. | `ops/prompt-packets/...` | no | Done |
| REQ-20260707-063 | Convert the attached Agent Mode findings into future Codex implementation candidates without coding UI before audit evidence. | RAW-20260707-006 | One Time | Codex | product-quality | P1 | 2 | REQ-20260707-060 | Register names candidate packets for provider diagnostic separation, Payments/Access IA, task filters, Studio tabs, shared filters/buttons, toolbar/mobile spacing. | this register | no | Done |
| REQ-20260707-064 | Define the parallel loop: Agent Mode saves reports in Operations; Codex/fleet ingests saved `AGR-*` results and creates repair work from there. | RAW-20260707-006 | BNA Operations | Codex | agent-fleet | P1 | 2 | REQ-20260707-061 | Memory/register record Operations drop-off as primary loop and prompt files tell agents not to depend on `/mnt/data` or GitHub-only output. | `memory-topics/ui-quality-goals.md`, prompt packet files | no | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260707-060 | agent-mode-operations-dropoff-contract | Update Agent Mode prompts and generated prompt text to use Operations task drop-off first. | Codex | BNA Operations | RAW-20260707-006 | REQ-20260707-061 | Patch prompt packet files and tests. | Codex queue | Done |
| TASK-20260707-061 | ui-audit-finding-candidates | Preserve Agent Mode UI findings as implementation candidates gated by current-state audit. | Codex | One Time | RAW-20260707-006 | REQ-20260707-063 | Record candidate packets in this register. | Codex queue | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260707-060 | Whether to configure GitHub write access for Agent Mode or use Operations drop-off first. | None for prompt/drop-off design. | Shloimie / Codex | Use Operations drop-off first; GitHub is optional fallback. | GitHub connector only; chat-only reports. | Operations drop-off allows parallel agents to save results without connector setup; GitHub-only repeats the observed failure mode. | Implement prompt contract now. | none | Done |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260707-060 | Should future Agent Mode sessions receive pre-created Operations task cards for each prompt, or should they use the Agent Review hub prompt list first? | Pre-created tasks make the save target clearer for non-GitHub Agent Mode sessions. | no | Open follow-up |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260707-060 | Agent Mode UI audits should save into BNA Operations Agent Review drop-off first; GitHub comments/packets are fallback, not the main path. | yes, topic memory | This is a reusable operating rule for future parallel Agent Mode audits. |

## Implementation candidates from attached Agent Mode result

| Candidate | Severity | Scope | Future packet |
|---|---|---|---|
| Provider diagnostics separation | P0-SCOPE | Provider/Rabbi pages | Move Super Admin diagnostics to support/platform drawer; keep provider views role-scoped and actionable. |
| Payments/Access IA | P1-IA | One Time Payments/Access | Replace stale subcategories with Overview, Invoices, Transactions, Access Requests, Failed Payments, Discounts, Settings. |
| Task filter simplification | P1-IA/P2-TOOLBAR | Operations Tasks | Collapse competing tabs/pill filters into one nav row plus advanced filter drawer. |
| Studio duplicate tab bars | P1-IA | Studio | Collapse duplicate tab bars into one consistent tab/subcategory row. |
| Shared filter row | P2-TOOLBAR/P2-RESPONSIVE | Contacts/content/communications/payments/tasks/studio | Introduce/reuse a standard filter row with stable slots and mobile collapse behavior. |
| Shared button contract | P2-TOOLBAR | Backend UI components | Normalize button heights, active/disabled states, icon/text use, and brand token overrides. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260707-060 | raw/register/memory | Preserve raw and parsed findings. | PASS raw/register/memory readback. | `18948a7b` | `18948a7b` | n/a |
| REQ-20260707-061 | prompt packet + Agent Review prompt generator | Make Operations drop-off primary. | PASS `node --test tests/agent-mode-task-dropoff.test.js`; PASS `node --check src/lib/bna/agent-review-hub.js`; PASS prompt manifest parse. | `18948a7b` | `18948a7b` | PASS Railway deployment `8a8551cd-c859-47cd-a7bb-06dbd18e716a` SUCCESS; PASS `npm run app:smoke:one-time-agent-mode-acceptance`; report `ops/live-smokes/2026-07-07T10-36-50-000Z-one-time-agent-mode-acceptance-live-smoke.md` |
| REQ-20260707-062 | prompt packet files | Replace GitHub-first dropoff with Operations-saved `AGR-*` contract. | PASS `node --test tests/agent-mode-operations-dropoff-prompts.test.js`. | `18948a7b` | `18948a7b` | n/a |
| REQ-20260707-063 | register | Capture implementation candidates only; no UI code yet. | PASS implementation candidate table recorded; no UI code started without audit evidence. | `18948a7b` | `18948a7b` | n/a |
| REQ-20260707-064 | memory topic + prompt files | Record reusable parallel loop. | PASS `npm run watchdog:protocol-drift`; PASS `npm run secrets:audit`; PASS `git diff --check`. | `18948a7b` | `18948a7b` | n/a |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260707-060 | Done | `raw-input/RAW-20260707-006-agent-mode-operations-dropoff-ui-audit-results.md`; memory note in `memory/2026-07-07.md`. | Raw/register/memory files. | PASS file readback during implementation. | n/a |
| REQ-20260707-061 | Done | Operations-first prompt contract in README, prompt manifest, prompt files, and generated Agent Review prompt text. | `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/`; `src/lib/bna/agent-review-hub.js`; tests. | PASS `node --test tests/agent-mode-task-dropoff.test.js`; PASS `node --check src/lib/bna/agent-review-hub.js`; PASS prompt manifest parse; PASS Railway deployment `8a8551cd-c859-47cd-a7bb-06dbd18e716a` SUCCESS; PASS `npm run app:smoke:one-time-agent-mode-acceptance`. | Runtime proof report: `ops/live-smokes/2026-07-07T10-36-50-000Z-one-time-agent-mode-acceptance-live-smoke.md`. |
| REQ-20260707-062 | Done | `OPERATIONS-DROPOFF.md` and prompts 01-04 require `OPERATIONS_DROPOFF_SAVED` or `OPERATIONS_DROPOFF_FAILED`. | Prompt packet files and `tests/agent-mode-operations-dropoff-prompts.test.js`. | PASS `node --test tests/agent-mode-operations-dropoff-prompts.test.js`. | n/a |
| REQ-20260707-063 | Done | Implementation candidate table in this register. | This register. | PASS register readback; no UI code started without current-state audit packet. | Future UI implementation requires current-state audit and before screenshots. |
| REQ-20260707-064 | Done | Memory topic and prompt files record Operations drop-off as primary parallel loop. | `memory-topics/ui-quality-goals.md`; prompt packet files. | PASS `npm run watchdog:protocol-drift`; PASS `npm run secrets:audit`; PASS `git diff --check`. | Agent fleet DB ingestion of saved `AGR-*` results remains a follow-up if not already automated. |
