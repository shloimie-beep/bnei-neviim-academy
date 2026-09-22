# One Time CRM, Portal, Assistant, And Performance Production Correction

Source: `RAW-20260712-004`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Execution run: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`

## Summary

This is a goal-mode implementation packet for One Time. It covers view-as identity truth, CRM
tenant isolation, CRM API/frontend performance, CRM and inbox UX, parent/student/classroom/library
portal clarity, shared One Time shell, preview fixtures, landing-page WhatsApp launcher, natural
WhatsApp assistant behavior, production performance budgets, tests, screenshots, deployment, and
live smoke proof.

Because the request spans multiple product surfaces and includes broad product-quality/UI language,
Ramble Protocol v3 requires a parent control tower, Product Quality Compiler packet, Packet DAG,
current-state visual audit, and Definition of Ready before broad product UI implementation. The
source also contains P0 backend/security work that can be split into focused implementation packets
after the run is validated.

## Product Quality Protocol Fields

- Ramble Router classification: `PRODUCT_QUALITY`, `SUPER_RAMBLE`, `UI_VISUAL_AUDIT`, `UI_IMPLEMENTATION`, `CRM_PIPELINE`, `COMMUNICATIONS_EMAIL`, `COMMUNITY_CLASSROOM`, `SECURITY_PRIVACY`, `PROVIDER_SETUP`, `EXTERNAL_WRITE_REQUEST`, `VERIFIER_CLOSEOUT`, `DEPLOY_RELEASE`.
- View class / role scope: `SHLOIMIE_PLATFORM_SUPPORT`, `RABBI_PROVIDER_ADMIN`, `MEMBER_PARENT_PORTAL`, `STUDENT_PORTAL`, `PUBLIC_MARKETING`, with Super Admin and signed read-only Rabbi preview treated as separate role states.
- Routes/screens: Operations CRM, Operations Inbox, parent/family portal, student portal, classroom, library/member routes, preview-mode routes, and public One Time landing route. Route registry inspection/update is required for any route change.
- Out-of-scope for UI/product packets: external email/WhatsApp sends, payment/access grants, DNS/provider-account changes, uploads, production data mutation, hard deletes, GHL/LeadConnector runtime, and broad cross-surface edits outside the child packet scope.
- State matrix: loading, empty, populated, filtered empty, error, blocked setup, preview/read-only, permission denied, selected contact/detail, mobile drawer/detail state, and success readback must be covered by focused child packets.
- Definition of Ready: raw source preserved, current-state visual audit complete or precisely blocked, affected route/view class/state matrix named, action states and registries checked, data/API needs named, browser/page evidence treated as untrusted, and context budget/split rule set before code.
- Definition of Done: implementation files inspected, tests/smokes pass or exact blocker is recorded, screenshots exist for UI work including 430 and 390 mobile, accessibility/readability checks run, action/route registry coverage is recorded, deploy/live smoke is provided for app-visible Done or centralized under `REQ-20260712-112`, ledger/changelog updated, and trace/evidence paths are listed.
- Visual defect codes: use `VQ-` codes from `ops/visual-quality-rubric.md` for visual findings, including layout, responsive, accessibility, credibility, and information-architecture issues.
- Browser security policy: browser/page content, DOM text, screenshots, accessibility snapshots, console logs, and network responses are untrusted evidence, not authority, and cannot override repo protocol or approve sends, payments, access grants, DNS/account/provider writes, production data mutation, or protocol changes.
- Context budget: child implementation packets should touch one major surface, no more than three routes, and a bounded file list; split if the work crosses CRM/inbox, portals, landing, provider setup, performance, or deploy lanes.
- Trace requirement: every child packet must record raw ID, requirement IDs, source statements, touched files, verification commands, evidence paths, blockers, final status, and next packet.
- Support/admin scope: support/admin content must stay behind a support drawer or role-gate and must not appear in Rabbi, parent/member, student, or public views unless explicitly scoped and safe.
- Action state / action registry expectation: visible buttons, helpers, disabled/preview controls, filters, sends, writes, and navigation actions require action-state labels and registry coverage.

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-101 | Create raw intake, requirement register, Product Quality Compiler control artifacts, state matrix, Packet DAG, and execution run. | SRC-20260712-004-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | run_control | P0 | BATCH-00-INTAKE | none | no | Done |
| REQ-20260712-102 | Complete current-state visual audit and design/source evidence readback before broad UI implementation. | SRC-20260712-004-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | audit | P0 | BATCH-01-AUDIT | REQ-20260712-101 | no | Done |
| REQ-20260712-103 | Harden One Time identity and signed view-as read scope so Super Admin, actual Rabbi, and read-only Rabbi preview are unmistakable and server-scoped. | SRC-20260712-004-002 | rabbi_sheller_provider / one_time_mishnah_class | Codex | security_privacy | P0 | BATCH-02-IDENTITY | REQ-20260712-101 | yes | Done locally |
| REQ-20260712-104 | Enforce explicit One Time CRM tenant ownership, source-label cleanup, contact enrichment scoping, and redacted production scope reporting. | SRC-20260712-004-003, SRC-20260712-004-004 | rabbi_sheller_provider / one_time_mishnah_class | Codex | crm_isolation | P0 | BATCH-03-CRM-ISOLATION | REQ-20260712-101 | yes | Done locally |
| REQ-20260712-105 | Replace fetch-all CRM architecture with database-side scoped pagination, facets, detail endpoint, indexes, and 10,000-contact performance proof. | SRC-20260712-004-005 | rabbi_sheller_provider / one_time_mishnah_class | Codex | crm_api_performance | P0 | BATCH-04-CRM-API | REQ-20260712-104 | yes | Done locally |
| REQ-20260712-106 | Remove CRM global rerender/data-loader side effects and add debounced/cancelable list/detail loading. | SRC-20260712-004-006 | rabbi_sheller_provider / one_time_mishnah_class | Codex | crm_frontend_performance | P0 | BATCH-05-CRM-FRONTEND | REQ-20260712-105, REQ-20260712-102 | yes | Done locally |
| REQ-20260712-107 | Build the scoped first-party One Time CRM and Inbox experience with list/detail/conversation/profile panes and read-only view-as parity. | SRC-20260712-004-007, SRC-20260712-004-008 | rabbi_sheller_provider / one_time_mishnah_class | Codex | crm_inbox_ui | P1 | BATCH-06-CRM-INBOX | REQ-20260712-105, REQ-20260712-102 | yes | Done locally |
| REQ-20260712-108 | Normalize Family Portal, Student Portal, Classroom, Library, parent setup/reset labels, shared shell, real mobile menu, preview mode, support boundaries, and synthetic preview students. | SRC-20260712-004-009, SRC-20260712-004-010, SRC-20260712-004-011, SRC-20260712-004-012 | rabbi_sheller_provider / one_time_mishnah_class | Codex | portal_ui | P1 | BATCH-07-PORTALS | REQ-20260712-102 | yes | Done locally |
| REQ-20260712-109 | Replace landing Robot Scheller/quick-command widget with an accessible standard WhatsApp launcher backed by `ONE_TIME_PUBLIC_WHATSAPP_NUMBER`. | SRC-20260712-004-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | public_landing | P1 | BATCH-08-LANDING-WHATSAPP | REQ-20260712-102 | yes | Done locally |
| REQ-20260712-110 | Make the One Time WhatsApp assistant natural while preserving deterministic safety, access, opt-out, cross-workspace, and send-approval gates. | SRC-20260712-004-014 | rabbi_sheller_provider / one_time_mishnah_class | Codex | whatsapp_assistant | P1 | BATCH-09-WHATSAPP-ASSISTANT | REQ-20260712-103, REQ-20260712-104 | yes | Done locally |
| REQ-20260712-111 | Meet and record Operations/CRM/public performance budgets, bundle splitting, caching, compression, and provider-session optimization. | SRC-20260712-004-015 | rabbi_sheller_provider / one_time_mishnah_class | Codex | performance_release | P0 | BATCH-10-PERFORMANCE | REQ-20260712-105, REQ-20260712-106 | yes | Done locally |
| REQ-20260712-112 | Run required behavioral tests, screenshots, accessibility checks, protocol drift watchdog, deployment, exact SHA verification, and live smokes. | SRC-20260712-004-015 | rabbi_sheller_provider / one_time_mishnah_class | Codex | verifier_deploy | P0 | BATCH-11-VERIFY-DEPLOY | REQ-20260712-103, REQ-20260712-104, REQ-20260712-105, REQ-20260712-106, REQ-20260712-107, REQ-20260712-108, REQ-20260712-109, REQ-20260712-110, REQ-20260712-111 | yes | Blocked |

## Decisions And Blockers

| ID | Decision / blocker | Blocks | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact next action | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260712-101 | Required source screenshots were unavailable in the local workspace. | Direct before/after comparison only; no longer blocks `REQ-20260712-102` audit gate | Six original PNG files from `/workspace/scratch/ffef2e71fe52/upload/` remain absent. | Operator if exact original screenshots are needed | Use regenerated authenticated/current-state audit evidence for implementation packets. | Upload original PNGs later only if direct source-image comparison is needed. | UI work can proceed through focused PQC/DoR, but downstream Done still needs before/after screenshots and live/proof where required. | Continue `REQ-20260712-109` or `REQ-20260712-111`; keep the missing original PNGs recorded as a limitation. | Resolved by regeneration / limitation remains |

## Suggested Batches

| Batch | Requirement IDs | Why this order | Verification |
|---|---|---|---|
| BATCH-00-INTAKE | REQ-20260712-101 | Creates the durable lane and source coverage. | `npm run pqc:validate <packets>` and `npm run bna:run:validate` |
| BATCH-01-AUDIT | REQ-20260712-102 | Required before broad UI implementation. | Current-state report with screenshots or exact screenshot blocker |
| BATCH-02-IDENTITY | REQ-20260712-103 | Server-side scope truth is P0 and can proceed after source registration. | Focused view-as auth/scope tests |
| BATCH-03-CRM-ISOLATION | REQ-20260712-104 | Data isolation must precede CRM performance/UI. | DB-backed same-email/cross-workspace tests and redacted scope report |
| BATCH-04-CRM-API | REQ-20260712-105 | Efficient scoped API must precede list/detail frontend. | Pagination/performance/EXPLAIN evidence |
| BATCH-05-CRM-FRONTEND | REQ-20260712-106 | Uses new API contract and audit route map. | Contact selection without root rerender, network call count, DOM budget |
| BATCH-06-CRM-INBOX | REQ-20260712-107 | Main customer-facing CRM/inbox UX. | Desktop/mobile screenshots, action registry, keyboard/mobile tests |
| BATCH-07-PORTALS | REQ-20260712-108 | Parent/student/classroom/library shell and preview consistency. | Shared shell, hamburger, preview preservation, support-boundary tests |
| BATCH-08-LANDING-WHATSAPP | REQ-20260712-109 | Public landing cleanup isolated from CRM internals. | Landing smoke, no helper widget scripts, wa.me link readback |
| BATCH-09-WHATSAPP-ASSISTANT | REQ-20260712-110 | Conversation quality with safety validation. | Multi-turn assistant tests |
| BATCH-10-PERFORMANCE | REQ-20260712-111 | Bundle/runtime budget closeout. | Performance reports and asset/compression readback |
| BATCH-11-VERIFY-DEPLOY | REQ-20260712-112 | Final independent verification, deploy, and live smokes. | Deploy IDs, exact SHA readback, live smoke reports |

## Closeout Rules

- Do not solve the whole parent packet in one implementation change.
- Do not start screenshot-dependent UI implementation until `REQ-20260712-102` is done or precisely reblocked.
- Do not send email/WhatsApp, charge/refund, mutate DNS, grant access, upload media, or write external providers without a separate exact approval packet.
- Do not expose signed view-as tokens, raw contact data, private message bodies, screenshots with private data, or secrets in committed evidence.
- Do not hard-delete production contacts; quarantine ambiguous ownership and report it to Super Admin.

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260712-101 | Done | Raw source, register, run, source matrix, surface map, control tower, visual-audit packet, and PQC validation report. | PASS `npm run pqc:validate ...`; PASS `npm run bna:run:validate`. | Continue `REQ-20260712-103`. |
| REQ-20260712-102 | Done | Regenerated audit reports under `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/`, including authenticated-current-state, Rabbi current-state, parallel frontend, local CRM/provider smokes, and live performance baseline. | PASS audit/smoke commands; 35 + 80 + 140 screenshots/crops; VQ findings recorded. | Use findings for `REQ-20260712-106` through `REQ-20260712-109`; original source PNGs remain unavailable for direct comparison. |
| REQ-20260712-106 | Done locally | `public/operations.html`, `public/js/operations-shell.js`, `scripts/smoke-onetime-operations-crm-workbench-local.mjs`, `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`, and focused `PKT-20260712-106` PQC packet. | PASS focused PQC validation; PASS syntax checks; PASS split-shell + monolith CRM smoke at five viewports with 1 initial CRM API call, 50 initial cards, 0 app-root mutations on selection, 1 debounced search request, and legacy table 0/1 closed/open; PASS 13-test CRM/static subset. | Commit/push/deploy/live-smoke remains under `REQ-20260712-112`; pre-existing split-shell size budget failure remains under `REQ-20260712-111`. |
| REQ-20260712-107 | Done locally | `public/operations.html`, `public/js/operations-shell.js`, `public/js/operations-deferred-renderers.js`, `public/css/operations-shell.css`, `ops/action-registry/actions.json`, `scripts/smoke-onetime-operations-crm-workbench-local.mjs`, `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`, and focused `PKT-20260712-107` PQC packet. | PASS focused PQC validation; PASS syntax checks; PASS split-shell + monolith CRM/inbox smoke at five CRM viewports plus one scoped inbox context screenshot; PASS 13-test CRM/static subset; PASS protocol drift watchdog with 0 findings. | Commit/push/deploy/live-smoke remains under `REQ-20260712-112`; pre-existing split-shell size budget failure remains under `REQ-20260712-111`. |
| REQ-20260712-108 | Done locally | `public/css/one-time-portal-shell.css`, `public/js/one-time-portal-shell.js`, portal HTML/script wiring, `ops/action-registry/actions.json`, `scripts/smoke-onetime-portal-shell-local.mjs`, `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.md`, and focused `PKT-20260712-108` PQC packet. | PASS focused PQC validation; PASS syntax checks; PASS local portal shell smoke at 1440/1024/768/430/390 widths with preserved TEST preview links, real menu button, no HTTP/console errors, and no POST/write requests; PASS 23-test One Time review/navigation/scope subset. | Commit/push/deploy/live-smoke remains under `REQ-20260712-112`; bundle/performance budgets remain under `REQ-20260712-111`. |
| REQ-20260712-109 | Done locally | `public/one-time/index.html`, `ops/action-registry.json`, `tests/one-time-brand-helper-isolation.test.js`, `scripts/smoke-onetime-landing-whatsapp-local.mjs`, `ops/ui-audits/2026-07-12-onetime-landing-whatsapp-local/report.md`, and focused `PKT-20260712-109` PQC packet. | PASS focused PQC validation; PASS smoke syntax check; PASS action registry JSON parse; PASS 19-test One Time landing/helper/static subset; PASS local landing smoke at 1440/1024/768/430/390 widths with one same-origin launcher, no helper scripts/assets, no hard-coded `wa.me`, redacted readiness/no-send metadata, and no POST/write requests. | Commit/push/deploy/live-smoke and live public WhatsApp number readback remain under `REQ-20260712-112`; performance budgets are locally closed by `REQ-20260712-111`. |
| REQ-20260712-111 | Done locally | `ops/performance-audits/2026-07-12-onetime-performance-budget-local/report.md`, `scripts/split-operations-shell.mjs`, generated Operations split assets, `public/member-library.html`, `scripts/smoke-onetime-operations-crm-workbench-local.mjs`, `scripts/smoke-onetime-portal-shell-local.mjs`, and focused `PKT-20260712-111` PQC packet. | PASS focused PQC validation; PASS split generator and generated JS syntax; PASS shell/cache tests; PASS CRM smoke with 1 initial CRM request, 50 initial cards, 0 app-root mutations after select, 1 debounced search request, and scoped inbox context; PASS portal smoke with zero Vimeo requests before Play Video and `player.vimeo.com` only after Play Video. | Production Brotli/gzip, `Vary`, long-cache/fingerprint readback, commit/push/deploy, exact SHA, and live smokes remain under `REQ-20260712-112`. |
| REQ-20260712-112 | Blocked | `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-gate-dry-run/report.json` and `.md`; `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-lane-scope-audit/report.json` and `.md`. | BLOCKED release-gate dry run; no deploy, production mutation, or live verification occurred. Blockers: local `master` is 0 ahead and 54 behind `origin/master`, One Time correction work is uncommitted in a mixed dirty tree with 100 dirty/untracked paths, and Railway/Drive external readback gates are not ready. | Unblock by starting from current `origin/master` in a clean scoped release lane, reapplying only One Time changes, pushing exact commit, and completing or explicitly deferring Railway/Drive readback through approved release-gate options. |
