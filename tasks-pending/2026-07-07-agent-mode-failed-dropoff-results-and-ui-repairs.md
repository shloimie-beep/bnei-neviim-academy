# Ramble Intake - 2026-07-07 - Agent Mode Failed Drop-Off Results And UI Repairs

## Raw Intake

Source raw record:
`raw-input/RAW-20260707-008-agent-mode-failed-dropoff-results.md`

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-080 | Repair Agent Mode report drop-off so agents have exact registered prompt keys, exact drop-off URLs, API fallback payloads, and an easy submit path. | RAW-20260707-008 | BNA Operations / Agent Review | Codex | dropoff-workflow | P0 | 1 | existing Agent Review Hub | Prompts include registered `prompt_key`, `context_key`, `requirement_id`, `dropoff_url`, and API payload. Drop-off page supports keyboard submit and visible fallback guidance. Tests cover the contract. | `public/agent-review-dropoff.html`, prompt packet files, `server.js`, tests | yes | Implemented locally; pending commit/deploy/live-smoke |
| REQ-20260707-081 | Recover the failed Agent Mode audit reports into durable Agent Review/task evidence. | RAW-20260707-008 | BNA Operations / One Time | Codex | report-recovery | P0 | 1 | REQ-20260707-080 | Failed reports are summarized in a register, optionally saved as AGR results through owner-auth API, and linked to follow-up tasks. | register, ledger/changelog, live API result records | no app deploy, live API write expected | Done |
| REQ-20260707-082 | Queue agent-fleet task for One Time backend IA/header/filter/button/mobile consistency repairs. | RAW-20260707-008 | rabbi_sheller_provider / one_time_mishnah_class | Agent fleet / Codex | product-quality | P1 | 2 | Product Quality Compiler packet | Task is visible in Operations and assigned to Codex/agent fleet with exact routes and findings from Prompt 01. | live task API, register | no deploy yet | Done - queued as task #2025 / job #408 |
| REQ-20260707-083 | Queue agent-fleet task for safe View-as Rabbi / provider / student / member navigation. | RAW-20260707-008 | One Time role views | Agent fleet / Codex | product-quality-security | P1 | 2 | Product Quality Compiler packet | Task is visible in Operations and assigned to Codex/agent fleet with exact view-as findings from Prompt 02. | live task API, register | no deploy yet | Done - queued as task #2026 / job #410 |
| REQ-20260707-084 | Queue agent-fleet task for role route mapping: `/rabbi-member`, `/student/login`, `/student.html`, `join.onetimeonetime.com`, provider login boundaries. | RAW-20260707-008 | One Time public/member/student/provider routes | Agent fleet / Codex | route-role-mapping | P1 | 2 | Product Quality Compiler packet | Task is visible in Operations and assigned to Codex/agent fleet with exact role matrix findings from Prompt 03. | live task API, register | no deploy yet | Done - queued as task #2027 / job #409 |
| REQ-20260707-085 | Switch the visible Super Admin `Open Rabbi Provider Portal` action to the safer read-only View-as Rabbi session instead of a live provider-session path. | RAW-20260707-008 | BNA Operations / provider portal | Codex | scoped-implementation | P0 | 1 | existing signed view-as endpoint | Button opens `/provider.html?review=one-time&view_as_rabbi=...`, shows read-only banner, and does not require Rabbi credentials. Tests cover the visible action. | `public/operations.html`, `ops/action-registry.json`, tests | yes | Implemented locally; pending commit/deploy/live-smoke |

## Recovered Findings

| Finding ID | Source prompt | Summary | Severity | Proposed routing |
|---|---|---|---|---|
| FIND-20260707-080 | Prompt 01 | Top toolbar/subcategory rows are duplicated and waste vertical space across One Time provider routes. | P1-IA / P2-TOOLBAR / P2-RESPONSIVE | REQ-20260707-082 |
| FIND-20260707-081 | Prompt 01 | Participants, payments/access, tasks, and studio project lists lack clear first-load filters/search/sorting. | P1-DEADEND | REQ-20260707-082 |
| FIND-20260707-082 | Prompt 01 | Communications has duplicate message-type tabs, hidden filters, and a tab-switching/bad-display loop. | P1-IA / P1-DEADEND | REQ-20260707-082 |
| FIND-20260707-083 | Prompt 01 | Rabbi/provider surfaces expose super-admin or developer diagnostics such as Codex/Agent, Command Bot, Worker Handoff, Whapi logs, and token/cost metrics. | P2-RELEVANCE | REQ-20260707-082 |
| FIND-20260707-084 | Prompt 02 | `Open Rabbi Provider Portal` did not behave like safe view-as; agent observed a public provider login and no clear return path. | P1-DEADEND / P0-SCOPE risk | REQ-20260707-083 / REQ-20260707-085 |
| FIND-20260707-085 | Prompt 02 | Super Admin can reach provider data, but provider messaging looked live instead of preview/read-only. | P0-SCOPE risk | REQ-20260707-083 |
| FIND-20260707-086 | Prompt 02 | No built-in view-as student or view-as parent path from Operations was found. | P1-DEADEND | REQ-20260707-083 |
| FIND-20260707-087 | Prompt 03 | `/rabbi-member` displayed provider-login shell; `/student/login` displayed One Time member preview; `join.onetimeonetime.com` redirected to Student Goal Board. | P1-IA / P1-DEADEND | REQ-20260707-084 |

## Product Quality Compiler Gate

The UI/product findings are queued for product-quality packet work. Broad UI implementation is not ready until the task packet includes affected routes, state matrix, screenshot evidence or screenshot blocker, action matrix, mobile requirements, privacy/security guardrails, tests, and deploy/live-smoke gate.

## Live Recovery Evidence

- Agent Review FAIL result `AGR-cc397d5a121c3c5b` saved from attachment 1 for Prompt 01 (`navigation-ia-duplicate-control-audit`).
- Agent Review FAIL result `AGR-e47ff4bc5894732e` saved from attachment 2 for Prompt 02 (`rabbi-provider-admin`).
- Agent Review FAIL result `AGR-b9ee5a9f7eac9600` saved from attachment 3 for Prompt 03 (`cross-role-wrong-permission`).
- Operations task `#2025` / Codex job `#408` queued for One Time provider UI consistency repairs.
- Operations task `#2026` / Codex job `#410` queued for safe view-as navigation repairs. Codex corrected a false auto-parse `waiting_on: rabbi` state before the job spawned.
- Operations task `#2027` / Codex job `#409` queued for route-role mapping repairs.
- `npm run agent:fleet:status` readback listed jobs `#408`, `#410`, and `#409` as the first three claimable observable jobs.

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260707-080 | Implemented locally; pending deploy/live-smoke | Prompt files now include exact registered drop-off coordinates and `autosave=1`; `public/agent-review-dropoff.html` supports autosave and Ctrl/Cmd+Enter; `server.js` PATCH route avoids duplicate `agent_status` assignment during job-spawn patches. | PASS `node --test tests/agent-mode-task-dropoff.test.js tests/agent-mode-operations-dropoff-prompts.test.js tests/agent-review-hub.test.js tests/one-time-admin-mailbox-access.test.js`; PASS `node --check server.js`; PASS prompt manifest JSON parse. | Commit, push, deploy/live-smoke still required before terminal Done. |
| REQ-20260707-081 | Done | Recovered reports saved as `AGR-cc397d5a121c3c5b`, `AGR-e47ff4bc5894732e`, `AGR-b9ee5a9f7eac9600`. | PASS owner-authenticated live API writes returned success for all three recovered reports. | none |
| REQ-20260707-082 | Done - queued | Operations task `#2025`, Codex job `#408`. | PASS `npm run agent:fleet:status` listed job `#408` as next claimable. | Child task owns implementation/proof. |
| REQ-20260707-083 | Done - queued | Operations task `#2026`, Codex job `#410`. | PASS task patch readback showed `waiting_on: null`, `agent_status: queued`, `agent_job_id: 410`; PASS fleet status listed job `#410` as next claimable. | Child task owns implementation/proof. |
| REQ-20260707-084 | Done - queued | Operations task `#2027`, Codex job `#409`. | PASS `npm run agent:fleet:status` listed job `#409` as next claimable. | Child task owns implementation/proof. |
| REQ-20260707-085 | Implemented locally; pending deploy/live-smoke | Operations email workspace button label changed to `View One Time as Rabbi`; action now calls `/api/bna/one-time/view-as-rabbi/start`; action registry updated to read-only view-as behavior. | PASS focused tests above. | Commit, push, deploy/live-smoke still required before terminal Done. |
