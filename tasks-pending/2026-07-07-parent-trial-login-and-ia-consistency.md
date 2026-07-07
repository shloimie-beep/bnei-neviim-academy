# Ramble Intake - 2026-07-07 - Parent Trial Login And IA Consistency

## Raw Intake

Source raw record:
`raw-input/RAW-20260707-011-parent-trial-login-and-ia-consistency.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260707-011 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-07-parent-trial-login-and-ia-consistency.md |

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Execute the parent/student trial walkthrough and cross-workspace IA consistency request through raw capture, PQC, audit, prompt pack, safe fixes, and explicit live-send blocker where needed. |
| Goal tool used | yes |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260707-110 through REQ-20260707-117 |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260707-110 | Preserve the ramble, create the requirement register, and compile a validated Product Quality packet. | RAW-20260707-011 | `rabbi_sheller_provider` / `one_time_mishnah_class` plus shared platform shell | Codex | product-quality-protocol | P0 | 0 | none | Raw record, register, and PQC packet exist; PQC validation passes; broad work is split into safe batches. | raw-input, tasks-pending, ops/prompt-packets | no | Done |
| REQ-20260707-111 | Determine the safe path for an actual parent-style trial login email to the operator. | RAW-20260707-011 | One Time parent/member access | Codex + operator | access-email | P0 | 1 | REQ-20260707-110 | Existing signup/invite/magic-link routes are inspected; exact recipient, sender, class link, copy, and account scope are documented; no live email/access mutation occurs until exact auditable details are confirmed. | server.js, scripts, operations actions, tests | yes if sent | Needs operator decision |
| REQ-20260707-112 | Create or identify a test-only no-password Agent Mode parent/student walkthrough link. | RAW-20260707-011 | One Time parent/student audit | Codex | audit-access | P0 | 1 | REQ-20260707-110 | Agent Mode can open a stable test/review route as a fake parent/student without shared real credentials, real email send, billing mutation, or private data exposure; if missing, create an implementation packet. | public review routes, API test fixtures, route registry/action registry | yes if app-visible | Done |
| REQ-20260707-113 | Audit parent portal journey for signup welcome, schedule, library, trial/billing copy, and student click/attendance visibility. | RAW-20260707-011 | One Time parent portal | Codex + Agent Mode | ui-workflow-audit | P0 | 2 | REQ-20260707-112 | Desktop/mobile evidence shows whether the parent can see schedule, library, trial state, click tracking, attendance, and next class link; gaps become concrete implementation tasks. | parent portal routes, APIs, tests, audit report | no for audit; yes for fixes |
| REQ-20260707-114 | Audit student login and parent-managed student password/reset flow. | RAW-20260707-011 | One Time student portal + parent portal | Codex + Agent Mode | auth-workflow-audit | P0 | 2 | REQ-20260707-112 | Existing student password/account APIs are inspected; parent UI can or cannot set/reset student login is proven; missing pieces are listed with secure implementation criteria. | server.js, public/student.html, public/parent.html, tests | yes if app-visible |
| REQ-20260707-115 | Audit IA consistency across Super Admin, Rabbi/provider, parent, and student views. | RAW-20260707-011 | shared platform shell + One Time workspace | Codex + Agent Mode | ia-visual-audit | P0 | 2 | REQ-20260707-110 | Side panel, category names, top subcategories, filters, role labels, and drawer placement are compared at 1440 and 390 widths; every inconsistency has severity, route, screenshot, and recommendation. | public/operations.html, shared CSS/JS, parent/student/provider routes, audit harness | no for audit; yes for fixes |
| REQ-20260707-116 | Produce navigation-specific Agent Mode prompt templates for parallel audits and required drop-off/failure reporting. | RAW-20260707-011 | Operations Agent Review drop-off | Codex | prompt-pack | P0 | 1 | REQ-20260707-110 | Prompts tell agents exactly where to start, what to click, which routes/viewports to inspect, where to report, what to do if navigation/drop-off fails, and what external actions are forbidden. | Codex chat, ops prompt-packets | no | Done |
| REQ-20260707-117 | Implement safe scoped UI/workflow fixes after audit evidence and release them with proof. | RAW-20260707-011 | parent/student/provider/super-admin shell | Codex | implementation-release | P0 | 3 | REQ-20260707-113, REQ-20260707-114, REQ-20260707-115 | Fixes are bounded by audit evidence; tests and screenshot proof pass; route/action registries updated if actions/routes change; scoped changes are committed, pushed, deployed, and live-smoked before Done. | TBD after audit | yes | Done for email-preview overflow; broader audit fixes pending Agent Mode results |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260707-110 | Send an actual parent-style trial login email to the operator only after exact send details are confirmed. | Exact recipient email; exact class link; whether this should create/update a real One Time parent/member record or only send a preview/test link; final welcome copy/sender. | Operator + Codex | Use `sdratler@gmail.com` only if confirmed, and use a test-only One Time parent/member record until real launch rules are approved. | Send to an existing Dratler BNA parent record; generate a no-send preview only; use an Operations-only review route. | Wrong choice can mutate a real parent/student record, expose private data, or send a misleading enrollment email. | Confirm recipient email and class link, or let Codex generate a no-send preview/test link first. | REQ-20260707-111 | Needs operator decision |
| DEC-20260707-111 | Parent and student logins should remain separate roles even if the first release uses similar data. | Whether One Time students need independent device/login access now. | Operator + Codex | Keep both roles: parent manages household/billing/access/attendance; student sees class/library/student-safe actions. | Parent-only portal for MVP; student-only link inside parent portal. | A parent-only MVP is simpler, but loses clean future separation and student-safe audit coverage. | Audit existing support, then implement only the minimum secure split. | REQ-20260707-114 | In progress |

## Open Questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260707-110 | Is the intended email `sdratler@gmail.com`? | The operator said `sdrtler` / `ask drattler`, and the repo has prior `sdratler@gmail.com` references. | Blocks live send only | Open |
| Q-20260707-111 | What is the exact One Time class link to include in the welcome email? | The welcome/trial email cannot be sent accurately without the actual class destination. | Blocks live send only | Open |
| Q-20260707-112 | Should the first parent trial account be a no-send test/smoke record or a real One Time member lead? | Real account creation can affect access, billing, reporting, and parent/student records. | Blocks live mutation only | Open |

## Durable Memory Candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260707-110 | Across Super Admin, provider/Rabbi, parent, and student views, the navigation grammar should be consistent: side panel categories, top subcategories, filters, and detail/drawer placement should occupy the same visual positions. | Maybe after implementation | This is a durable UI/IA preference, but should be promoted after current audit validates exact pattern. |
| MEM-20260707-111 | One Time parent role should handle household/billing/access/student-click/attendance visibility; student role should be student-safe and class/library focused. | Maybe after implementation | Durable role split if accepted by audit/implementation. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260707-110 | raw-input, tasks-pending, ops/prompt-packets | Create and validate packet. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-07-parent-trial-login-and-ia-consistency/00-parent-trial-login-ia-consistency.product-quality.json` | Pending | Pending | Not required |
| REQ-20260707-111 | server.js parent access/email routes; scripts/tests | Inspect before any send. | Focused readback/no-send script or test. | Pending | Pending | Required only if sent |
| REQ-20260707-112 | review routes or test access route | Identify or create safe test-only link. | Browser smoke at desktop/mobile; privacy check. | PASS local/static tests; PASS live parent/student/classroom routes before email-overflow failure. | Pending deploy of prompt registry | Required if app-visible |
| REQ-20260707-113 | parent portal + APIs | Audit current journey. | Screenshots/report. | Pending | Pending | Required for fixes |
| REQ-20260707-114 | student portal + parent access APIs | Audit reset/set student login path. | Tests/browser proof. | Pending | Pending | Required for fixes |
| REQ-20260707-115 | Operations/provider/parent/student shell | Audit IA positions and labels. | Screenshots/report. | Pending | Pending | Required for fixes |
| REQ-20260707-116 | Codex chat + prompt packet | Produce thorough Agent Mode prompts. | Prompts include navigation/drop-off/failure rules. | PASS focused prompt tests; deployed prompt URL readback 200 with exact navigation/failure contract. | Deployed `a14d277b`; Railway `3506c5e2-a830-4067-983c-f6dc48ef0663` SUCCESS | Not required |
| REQ-20260707-117 | one-time email review mobile layout | Fix app-visible defect found by live smoke. | Local Playwright overflow check at 390px; focused tests; live smoke after deploy. | PASS local overflow 0px; PASS production overflow 0px; PASS live shared-review smoke all routes/viewports. | Deployed/live-smoked | Required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260707-110 | Done | Raw/register created; PQC packet created and validated. | raw-input/RAW-20260707-011-parent-trial-login-and-ia-consistency.md; tasks-pending/2026-07-07-parent-trial-login-and-ia-consistency.md; ops/prompt-packets/2026-07-07-parent-trial-login-and-ia-consistency/00-parent-trial-login-ia-consistency.product-quality.json | PASS `npm run pqc:validate -- ops\prompt-packets\2026-07-07-parent-trial-login-and-ia-consistency\00-parent-trial-login-ia-consistency.product-quality.json` | None for protocol packet; implementation/audit work continues. |
| REQ-20260707-111 | Needs operator decision | Prior repo memory suggests `sdratler@gmail.com`, but latest utterance was ambiguous and the class link is not yet exact. | None yet | Pending inspection | Live send/access grant blocked until exact details are confirmed. |
| REQ-20260707-112 | Done | Existing no-password TEST routes cover Agent Mode parent/student/classroom/email review: `/parent.html?review=one-time`, `/student.html?review=one-time`, `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`, `/one-time-email-review.html`. | src/platform/instances/one-time-shared-review-data.js; server.js; route registry; generated prompt pages | PASS `node --test tests\one-time-review-only-server.test.js tests\one-time-route-role-mapping.test.js`; PASS production shared-review smoke all routes/viewports. | None for test-only audit access. |
| REQ-20260707-113 | Pending Agent Mode audit | Parent route and classroom route are available; live smoke passed parent/classroom mobile before email-preview overflow stopped the run. | public/parent.html; public/one-time-classroom.html; public/one-time-email-review.html | PASS focused tests; live smoke blocked by email-review overflow, now locally fixed. | Need Agent Mode report and post-deploy live smoke. |
| REQ-20260707-114 | Pending Agent Mode audit | Existing backend supports parent-managed student username/password reset and separate student login sessions; tests pass. | server.js; public/parent.html; public/student.html | PASS `node --test tests\student-portal-auth-policy.test.js tests\parent-student-portal-contract.test.js` | Need Agent Mode UX report before broader UI changes. |
| REQ-20260707-115 | Pending Agent Mode audit | IA consistency prompt now covers Operations, Rabbi/provider, parent, student, member, classroom, and wrong-role routes with exact navigation. | src/lib/bna/agent-review-hub.js; public/agent-review-prompts/one-time-role-ia-consistency.md | PASS prompt tests | Need Agent Mode audit result before sweeping IA refactor. |
| REQ-20260707-116 | Done | Prompt registry now has 14 prompts; the three new One Time prompts include exact navigation, viewport matrix, required audit outputs, drop-off URL, API fallback, and failure-reporting contract. Deployed prompt readback for `one-time-parent-trial-journey.md` returned 200 and contained `## Exact Navigation` plus `OPERATIONS_DROPOFF_FAILED`. | src/lib/bna/agent-review-hub.js; public/agent-review-prompts/*.md; ops/prompt-packets/2026-07-07-parent-trial-login-and-ia-consistency/AGENT-MODE-PROMPTS.md | PASS `node --test tests\agent-review-hub.test.js tests\agent-mode-task-dropoff.test.js`; PASS `npm run watchdog:actions`; PASS production prompt readback | None for prompt availability. Agent Mode audit results still pending. |
| REQ-20260707-117 | Done for email-preview overflow | Production smoke found `/one-time-email-review.html` horizontal overflow of 179px at 390px; patch deployed and production Playwright readback reports 0px overflow at 390px. Full production shared-review smoke passed landing/provider/parent/student/classroom/email/operations at 390, 768, and 1440. | public/one-time-email-review.html | PASS local Playwright 390px overflow check; PASS 62-test focused suite; PASS `npm run pqc:validate`; PASS `npm run watchdog:actions`; PASS `npm run watchdog:protocol-drift`; PASS `npm run app:smoke:one-time-shared-review` after Railway deployment `3506c5e2-a830-4067-983c-f6dc48ef0663` for commit `a14d277b`. | Broader UI/IA fixes remain pending Agent Mode audit results; real parent email remains blocked under REQ-20260707-111. |
