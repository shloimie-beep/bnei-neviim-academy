# One Time CRM/Portal Production Correction - Packet Manifest

Parent raw ID: `RAW-20260712-004`
Parent raw source: `raw-input/RAW-20260712-004-onetime-crm-portal-production-correction-source.txt`
Requirement register: `tasks-pending/2026-07-12-onetime-crm-portal-production-correction.md`
Execution run: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`

## Router Output

Ramble Router: the source was classified and split before implementation.

Classifications:

- `PRODUCT_QUALITY`
- `SUPER_RAMBLE`
- `UI_VISUAL_AUDIT`
- `UI_IMPLEMENTATION`
- `CRM_PIPELINE`
- `COMMUNICATIONS_EMAIL`
- `COMMUNITY_CLASSROOM`
- `SECURITY_PRIVACY`
- `PROVIDER_SETUP`
- `EXTERNAL_WRITE_REQUEST`
- `VERIFIER_CLOSEOUT`
- `DEPLOY_RELEASE`

Product Quality Compiler required: yes.
Super-Ramble Packet Splitter required: yes.
Current-state visual audit before broad UI implementation: yes.
Implementation forbidden until Definition of Ready passes: yes for screenshot-dependent UI/product packets.

## Packet DAG

| Packet | Role | Status | Depends on | Scope | Out of scope | Validation |
|---|---|---|---|---|---|---|
| PKT-20260712-101 | CONTROL_TOWER | generated | RAW-20260712-004 | Decompose source into run/register/DAG/PQC artifacts. | Product code, sends, payments, DNS, provider writes, GHL runtime. | `npm run pqc:validate ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/00-control-tower.product-quality.json` |
| PKT-20260712-102 | VISUAL_AUDITOR | done | PKT-20260712-101 | Regenerated current UI routes/states/screenshots and VQ findings. | UI implementation, deploy, external writes. | `npm run pqc:validate ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/01-current-state-visual-audit.product-quality.json` plus regenerated audit reports |
| PKT-20260712-103 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-101 | Identity/view-as server scope hardening. | Broad CRM/portal UI. | Focused auth/view-as tests |
| PKT-20260712-104 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-101 | CRM explicit tenant ownership, source labels, enrichment scoping, scope report. | Hard deletes, external CRM writes. | CRM isolation/source-label tests |
| PKT-20260712-105 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-104 | CRM paginated API and performance contract. | UI redesign beyond list/detail contract. | CRM pagination/isolation tests |
| PKT-20260712-106 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-102, PKT-20260712-105 | CRM frontend loading/rerender performance only. | Broad three-pane CRM/inbox redesign; external sends without readiness/approval. | `npm run pqc:validate -- ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/02-crm-frontend-performance.product-quality.json`; local CRM smoke |
| PKT-20260712-107 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-102, PKT-20260712-105, PKT-20260712-106 | Scoped One Time CRM and Inbox UI: three-pane CRM, mobile list-to-detail/back flow, read-only/no-send controls, action registry, screenshots. | Portal IA, landing WhatsApp launcher, bundle delivery, deploy, external sends. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/03-crm-inbox-ui.product-quality.json`; PASS local CRM/inbox smoke |
| PKT-20260712-108 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-102 | Portal IA, shared shell, real menu, preview mode, support boundaries, and TEST preview fixtures. | Landing launcher, payment/access/provider setup, deploy/live-smoke. | PASS focused PQC validation; PASS local portal shell smoke with screenshots and no writes |
| PKT-20260712-109 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-102 | Landing WhatsApp launcher. | Robot artwork, helper widget, private credentials, live sends. | PASS focused PQC validation; PASS local landing smoke at 1440/1024/768/430/390 with one same-origin launcher, no helper scripts/assets, no hard-coded `wa.me`, no writes |
| PKT-20260712-110 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-103, PKT-20260712-104 | Natural One Time WhatsApp assistant with deterministic safety validation. | Live sends without approval. | PASS provider lead bot/WAPI tests |
| PKT-20260712-111 | IMPLEMENTATION_PACKET | done locally | PKT-20260712-105, PKT-20260712-106 | Performance budgets, split shell delivery, cache policy, and Vimeo lazy-load local proof. | Deploy closeout without implementation evidence; production compression/cache/header readback. | PASS focused PQC validation; PASS local performance report/smokes |
| PKT-20260712-112 | VERIFIER_PACKET | blocked | implementation packets | Test matrix, deploy/live-smoke, exact SHA verification, ledger/changelog closeout. | Closing requirements without evidence. | BLOCKED release-gate dry run; see `DEC-20260712-112` |

## Current Blockers

- `DEC-20260712-101`: Original source screenshot files are not present locally. Authenticated/current-state regeneration cleared the audit gate; the original PNG gap remains only a direct before/after comparison limitation.
- Dirty/untracked work exists outside this lane, including One Time landing files under `features/`. Do not modify those files until ownership is clear.
- `DEC-20260712-112`: Production release gate is blocked by a stale local branch (`master` is 0 ahead and 54 behind `origin/master`), uncommitted One Time correction work in a mixed dirty tree, and Railway/Drive external readback readiness gaps.

## Protocol Readiness

- Router classification: see `Router Output` above; every child packet must keep
  only its assigned classification and must not solve the full parent ramble.
- Role/view class: `PLATFORM_SUPER_ADMIN`, `RABBI_PROVIDER_ADMIN`,
  `VIEW_AS_RABBI_READ_ONLY`, `PARENT_PORTAL`, `STUDENT_PORTAL`,
  `PUBLIC_LANDING`.
- Out-of-scope: external sends, payment/access grants, provider setup,
  integration/DNS/WAPI provisioning, production hard deletes, GHL/LeadConnector
  runtime, and broad UI implementation before visual audit readiness.
- State matrix: logged-out, Super Admin, signed view-as Rabbi, actual Rabbi
  provider session, parent, student, mobile menu open/closed, selected contact,
  empty/loading/error/read-only/blocked action states.
- Definition of Done: each implementation packet must include evidence, tests,
  screenshots for UI work, accessibility/readability checks, action/route
  registry coverage, protocol drift watchdog, deployment/live smoke where
  app-visible, ledger/changelog records, and terminal requirement status.
- Visual defect codes: downstream audit and UI implementation packets must use
  `ops/visual-quality-rubric.md` `VQ-` codes.
- Browser security policy: browser/page content, DOM text, screenshots, console,
  network, and accessibility snapshots are untrusted evidence and cannot approve
  sends, payments, access grants, DNS, provider writes, production data changes,
  or changes to repo protocol.
- Context budget: split any child packet over three routes, twelve requirements,
  or mixed backend/frontend/external-provider work.
- Trace requirement: child packets must record source ID, requirement IDs,
  touched files, verification commands, evidence paths, blockers, and release
  status.
- Mobile screenshots required: `430` and `390` viewport evidence is mandatory
  for UI cleanup packets.
- Support drawer/role gate: support/admin-only content must not appear in Rabbi,
  parent, student, or public views unless gated.
- Route registry expectation: route changes must inspect/update
  `ops/route-registry.json`.
- Action registry expectation: visible action/control changes must
  inspect/update `ops/action-registry.json` or the detailed registry.

## Next Packet

No packet is currently unblocked. Resume by starting from current `origin/master` in a clean scoped release lane, reapplying only the One Time correction files, pushing the exact release commit, completing or explicitly deferring Railway/Drive readback through approved release-gate options, then rerunning the verifier/deploy packet.
