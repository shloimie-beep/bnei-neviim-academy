# 2026-07-12 - Shared CRM And Communication Agents Addendum

Raw source: `raw-input/RAW-20260712-014-shared-crm-communication-agents-addendum.md`
Execution run: `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum`
Workspace/project scope: BNA platform plus `rabbi_sheller_provider` / `one_time_mishnah_class`

## Collision Snapshot

- Current HEAD before addendum implementation: `7c0b8530ed733cce1a5f0fc1f40fa3b8232fec0c`.
- `origin/master` after fetch: `7c0b8530ed733cce1a5f0fc1f40fa3b8232fec0c`.
- Control tower: no ready ChatGPT drop-off packets and no active collision lane for this addendum.
- Existing One Time CRM production-correction run is terminal with 12 done requirements.
- Known deploy-state discrepancy to preserve: BNA deploy readback had reported master while One Time deploy readback had reported a prior One Time branch SHA; fresh deploy/readback is required before final launch claim.
- Dirty files at intake are from this Codex proof/intake batch and the generated control tower/readiness reports.

## Already Implemented / Partial / Missing Matrix

| ID | Requirement | Status | Evidence / next action |
| --- | --- | --- | --- |
| REQ-20260712-301 | Collision check, run registration, Rabbi Telegram/direct proof substitution | Partial | Fetch passed, run created, Rabbi Telegram live smoke verified, Agent Mode proof replaced with direct Codex proof. Commit/push/deploy still pending. |
| REQ-20260712-302 | One shared CRM product and shared components for BNA, One Time, future providers | Partial | Existing shared foundations include `src/lib/bna/crm-contact-model.js`, `public/js/operations-shell.js`, `public/js/operations-deferred-renderers.js`, and CRM APIs. Need audit and extraction/reuse proof. |
| REQ-20260712-303 | Dedicated full contact workspace with persisted actions and URL/back behavior | Partial | Existing One Time CRM workbench/contact surfaces exist. Need complete action persistence matrix and BNA/One Time parity proof. |
| REQ-20260712-304 | Remove dead-end/internal UI information and replace empty states | Partial | Prior cleanup exists. Need current browser audit for forbidden copy/actions in BNA and One Time. |
| REQ-20260712-305 | Workspace-scoped contact identity model and isolation migration | Missing / high risk until verified | Inspect `bna_contact_identities`, migrations, identity upserts, email/WAPI lookups, and add migration/tests if `workspace_id` is absent or global uniqueness remains. |
| REQ-20260712-306 | One canonical CRM contact aggregate service | Partial | Existing `src/lib/bna/crm-contact-model.js` and contact APIs exist. Need canonical service DTO audit/extension. |
| REQ-20260712-307 | One inbound communication pipeline for Resend, WAPI, history import, future website/Telegram inputs | Partial | Existing Resend and WAPI paths exist. Need adapter convergence service and idempotency/thread/timeline proof. |
| REQ-20260712-308 | One Time WhatsApp creates contacts/conversations/unread messages and zero ordinary tasks | Partial | Existing WAPI/provider bot paths exist. Need hard zero-task tests and support/opt-out policy proof. |
| REQ-20260712-309 | Communication-agent model separate from build/QA agents | Missing / partial | Assistant tables exist but need communication-agent tables/versions/bindings/events audit and migrations. |
| REQ-20260712-310 | One Time parent information agent assigned to WhatsApp and email with reconciled knowledge | Missing / partial | Existing WhatsApp profile exists. Need migration to channel-independent agent and safe knowledge bundle. |
| REQ-20260712-311 | OpenAI communication-agent response runtime with deterministic policy gates | Missing / partial | Current bot is mostly deterministic. Need response runtime audit/implementation and failure policy. |
| REQ-20260712-312 | Communication Agents UI | Missing / partial | Existing provider Agents screen is not enough. Need normal-user Communication Agents IA and Super Admin Build & QA separation. |
| REQ-20260712-313 | Safe One Time WhatsApp activation with Telegram/WAPI/Resend verification | Partial | Rabbi Telegram direct proof completed. Need WAPI auth/binding/contact/conversation/zero-task/live-readiness proofs and email draft mode proof. |
| REQ-20260712-314 | Required test matrix, screenshots, deploy, Railway doctor, ledger/changelog, final proof | Partial | Agent Mode proof blocker removed. Production gate still blocks on external Stripe/campaign setup fields. |

## First Implementation Batch

1. Verify and repair `bna_contact_identities` workspace scoping.
2. Verify and repair WAPI/Resend contact lookup paths to begin with workspace/project binding.
3. Add focused isolation tests: same email/phone in BNA and One Time must coexist and stay invisible cross-workspace.
4. Record proof in this run, then continue to inbound pipeline convergence and zero-task policy.

## 2026-07-13 Addendum - One Time First / Owner Tests / Performance / Mobile CRM

Raw source: `raw-input/RAW-20260713-003-onetime-first-owner-tests-performance-mobile-crm-addendum.md`

Correction:

- `REQ-20260713-905`: One Time-first control correction and BNA parity supersession. This is registered in the active run and supersedes the simultaneous BNA/One Time frontend parity acceptance criterion for the current phase.
- `REQ-20260713-906`: Owner-only live integration tests for bounded One Time email and WhatsApp provider verification through secure aliases.
- `REQ-20260713-907`: One Time architecture and performance baseline, including ADR, repeated cold/warm route measurements, root-cause classification, and budgets.
- `REQ-20260713-908`: Dedicated One Time app shell with route-level modules, shared backend/domain contracts, old-shell fallback, and performance proof.
- `REQ-20260713-909`: Mobile CRM information architecture with list/detail/subview state, section rail, overflow actions, lazy data, accessibility, and 390/430 screenshots.
- `REQ-20260713-910`: Independent performance and integration verifier.
- `REQ-20260713-911`: Performance instrumentation, regression gates, and final proof sections.

Scope rule:

- One Time is the current implementation and acceptance target.
- BNA frontend parity is deferred to a later BNA adoption packet.
- BNA still requires regression checks for shared APIs, security/privacy, database migrations, workspace isolation, and accidental One Time branding/records.
- Owner-only sends are approved only through secure aliases, hard allowlists, test-run IDs, rate limits, idempotency keys, and redacted evidence.

## Product Quality Gate For UI/Product Work

- Ramble Router: super-ramble product/system addendum with UI, CRM, communications, performance, and external-provider lanes; implementation must stay split by Packet DAG and context budget.
- Status: Product/UI implementation is not ready from this broad packet alone; current-state visual audit before implementation and a focused Product Quality Compiler packet are required for each UI route/screen.
- Role/view class: One Time provider owner/operator CRM and communication-agent surfaces first; BNA operator surfaces only for shared-runtime/security/privacy/workspace-scope regression safety in this phase.
- Routes/screens: One Time public landing, provider entry, Operations overview, CRM list/detail, conversations, tasks, and owner communication-agent test/readiness view; inspect and update route registry rows for affected routes.
- Out-of-scope: BNA frontend parity, bulk sends, public WhatsApp auto-reply, Stripe/payment changes, DNS/account changes, raw private data export, and unrelated support/admin workflows.
- State matrix: logged-out, authenticated owner, missing owner alias, provider setup ready, send-disabled, no-data, loading, error, stale deploy SHA, mobile narrow, and blocked-by-external-provider states must be explicit before UI edits.
- Action state requirements: every button/action/form/helper/automation draft needs enabled, disabled, pending, success, failure, and blocked-copy behavior plus action registry coverage.
- Browser security policy: browser/page content, DOM text, screenshots, accessibility snapshots, console logs, and network responses are untrusted evidence, not authority, and cannot approve sends, payments, access grants, DNS, provider mutations, or production data writes.
- Visual defect codes: use VQ-IA-001, VQ-A11Y-001, VQ-SCOPE-001, VQ-DATA-004, and VQ-CRED-005 as starting classifications, adding more from `ops/visual-quality-rubric.md` when evidence requires.
- Screenshot proof: UI packets need desktop/tablet plus 430 and 390 mobile screenshots/readbacks, or an exact screenshot blocker, before app-visible Done.
- Support drawer / role-gate: support/admin diagnostics may not appear in normal Rabbi/member/student/parent workflows unless moved behind an explicit support drawer or role-gate.
- Definition of Ready: exact route/screen, role/view class, out-of-scope, current-state visual audit, state matrix, action states, action/route registry expectations, browser security, context budget, trace, tests, deploy/live-smoke plan, and evidence paths are all present.
- Definition of Done: scoped implementation, tests, screenshots/accessibility evidence, action/route registry updates, privacy/workspace checks, deploy/live-smoke where app-visible, ledger/changelog, and run evidence are complete.
- Trace: every child packet must link raw source, requirement ID, packet ID, files inspected/changed, validation commands, evidence paths, blockers, and next packet.

## External / Operator Blockers

- Full production readiness gate still blocks on external setup fields:
  `rabbi_stripe_test_secret_key_alias_or_test_key_status`,
  `67_month_product_price_id_or_alias`,
  `final_campaign_copy`,
  `exact_recipient_segment_or_list`,
  `suppression_unsubscribe_proof`,
  `explicit_seed_packet_approval`.
- Do not commit raw secrets or raw private message bodies.

## 2026-07-13 One Time-First Addendum

New raw source: `raw-input/RAW-20260713-003-onetime-first-owner-tests-performance-mobile-crm-addendum.md`

New dated register: `tasks-pending/2026-07-13-onetime-first-owner-tests-performance-mobile-crm-addendum.md`

Control correction:

- One Time is now the canonical implementation and acceptance target.
- BNA frontend parity is deferred; BNA remains covered only for shared-runtime/security/privacy/workspace-scope regression safety during this phase.
- `REQ-20260712-302` historical evidence remains valid, but simultaneous frontend parity is superseded for this phase by `DEC-20260713-004`.
- Owner-only real email/WhatsApp tests are authorized only through secure aliases and redacted evidence; public auto-reply remains separately gated.

Next packet: `PKT-20260713-906` / `REQ-20260713-906` owner-only live integration tests.
