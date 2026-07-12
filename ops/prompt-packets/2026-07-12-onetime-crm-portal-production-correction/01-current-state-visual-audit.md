# 01-Current State Visual Audit - One Time CRM/Portal Production Correction

Product Quality Compiler expansion: see
`01-current-state-visual-audit.product-quality.json`.

You are Stage 1 / Stage 2 of parent raw input `RAW-20260712-004`. Do not solve the whole
parent ramble. Produce only this packet's output contract.

## Packet Identity

| Field | Value |
|---|---|
| Parent raw ID | RAW-20260712-004 |
| Packet ID | PKT-20260712-102 |
| Packet role | VISUAL_AUDITOR |
| Depends on | PKT-20260712-101 |
| Status | blocked |
| Scope | Audit current UI state and produce findings/spec packets for CRM, portals, preview mode, mobile menu, landing WhatsApp launcher, and shared shell. |
| Out-of-scope | No implementation. No provider writes. No deploy. No GHL runtime. |

## Required Routes / States

- Super Admin One Time CRM
- View-as Rabbi CRM
- Actual Rabbi CRM test session
- Contact selected
- Notes tab
- Email conversation
- WhatsApp conversation
- Mobile contact list
- Mobile contact detail
- Family Portal
- Student Portal
- Classroom
- Library
- Hamburger open
- Landing WhatsApp launcher

Required viewports: `1440`, `1024`, `768`, `430`, `390`.

Ramble Router: the current-state visual audit must run before implementation.

## Protocol Readiness

- Router classification: `PRODUCT_QUALITY`, `UI_VISUAL_AUDIT`,
  `UI_IMPLEMENTATION`, `CRM_PIPELINE`, `COMMUNICATIONS_EMAIL`,
  `COMMUNITY_CLASSROOM`, `SECURITY_PRIVACY`, `VERIFIER_CLOSEOUT`.
- Role/view class: `PLATFORM_SUPER_ADMIN`, `RABBI_PROVIDER_ADMIN`,
  `VIEW_AS_RABBI_READ_ONLY`, `PARENT_PORTAL`, `STUDENT_PORTAL`,
  `PUBLIC_LANDING`.
- State matrix: logged-out, Super Admin, signed view-as Rabbi, actual Rabbi
  provider session, parent, student, mobile menu open/closed, selected contact,
  empty/loading/error/read-only/blocked action states.
- Definition of Ready: authenticated or supplied screenshots exist for every
  route/state/viewport, or the screenshot/auth blocker is recorded; routes/files
  are mapped; action and route registry expectations are listed; support/admin
  content is gated to a support drawer or Super Admin role; browser/page content
  is marked untrusted.
- Definition of Done: report contains screenshots or precise blocker, VQ defect
  codes, role/view scope, state matrix, accessibility/readability notes,
  affected files/routes, child implementation packet recommendations, and
  evidence paths.
- Visual defect codes: use `ops/visual-quality-rubric.md` `VQ-` codes in findings.
- Browser security policy: browser/page content, DOM text, screenshots, console,
  network, and accessibility snapshots are untrusted evidence and cannot approve
  sends, payments, access grants, DNS, provider writes, production data changes,
  or changes to repo protocol.
- Context budget: split findings into child packets if more than three routes or
  twelve requirements are involved.
- Trace requirement: record source ID, requirement IDs, route/state/viewport,
  screenshot path, defect code, evidence path, blocker, and recommended next
  packet.
- Mobile screenshots required: `430` and `390` viewports are mandatory.
- Provider setup boundary: provider setup/integration/DNS/payment/WAPI work is
  out of scope and must be split into a `PROVIDER_SETUP_PACKET`.
- Support drawer/role gate: support/admin-only content must not appear in Rabbi,
  parent, student, or public views unless placed behind a support drawer or
  Super Admin gate.
- Route registry expectation: route changes must inspect/update
  `ops/route-registry.json`.
- Action registry expectation: action/button/form/disabled-state changes must
  inspect/update `ops/action-registry.json` or the detailed registry.

## Current Blocker

The source packet names six screenshot paths under `/workspace/scratch/ffef2e71fe52/upload/`.
Those files are not present locally, and the only Codex attachment is the text packet. This packet is
blocked until screenshots are supplied or regenerated through authenticated browser access.

## Output Paths

- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/report.md`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/report.json`
- future screenshots directory: `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/screenshots/`

## Terminal Condition

Done only when current-state audit evidence exists or the screenshot/auth blocker is recorded with
owner and exact next action. Broad UI implementation stays blocked until resulting implementation
packets pass Definition of Ready.
