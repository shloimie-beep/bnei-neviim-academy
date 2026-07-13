# 2026-07-13 - One Time First Owner Tests, Performance, and Mobile CRM Addendum

Raw source: `raw-input/RAW-20260713-003-onetime-first-owner-tests-performance-mobile-crm-addendum.md`
Execution run: `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum`
Packet manifest: `ops/prompt-packets/2026-07-13-onetime-first-owner-tests-performance-mobile-crm-addendum/manifest.json`
Source matrix: `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum/source-statement-matrix-RAW-20260713-003.json`

## Router Classification

- Type: super-ramble addendum to an existing active goal-mode execution run.
- Current run policy: continue the existing run; do not create a competing active run.
- Primary workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`.
- BNA scope during this phase: security, privacy, shared API, migration, workspace-isolation, branding, and basic shared-runtime regression only.
- External writes: owner-only email/WhatsApp test sends are authorized only through secure owner aliases, hard allowlists, idempotency, and redacted evidence. Public auto-reply is not authorized by this addendum.

## Correction Decisions

| ID | Decision | Status |
| --- | --- | --- |
| DEC-20260713-003 | One Time is the canonical implementation and acceptance target now; BNA feature parity is deferred to a later adoption packet. | Active |
| DEC-20260713-004 | The simultaneous BNA/One Time CRM parity criterion in `REQ-20260712-302` is superseded for this phase; preserve historical evidence and split the target into One Time canonical app now, shared contracts where useful, and later BNA adoption. | Active |
| DEC-20260713-005 | Bounded owner-only live email and WhatsApp tests are authorized only to Shloimie-controlled test aliases resolved from secure configuration, with strict send limits and redacted evidence. | Active |

## Requirement Register

| ID | Title | Status | Next Action |
| --- | --- | --- | --- |
| REQ-20260713-906 | Record One Time-first control correction and packet DAG addendum | Done | Continue `REQ-20260713-907`. |
| REQ-20260713-907 | Owner-only live integration tests for One Time email and WhatsApp | Not started | Inspect guarded send scripts and secure owner aliases without printing secrets; run readiness/preflight first. |
| REQ-20260713-908 | One Time architecture and performance baseline | Not started | Write ADR and collect repeated cold/warm performance baseline before app-shell implementation. |
| REQ-20260713-909 | Dedicated One Time application shell and route-level modules | Not started | Wait for `REQ-20260713-908`, then implement incrementally with fallback and proof. |
| REQ-20260713-910 | Mobile CRM information architecture | Not started | Create current-state visual audit and validated Product Quality packet before CRM UI edits. |
| REQ-20260713-911 | Performance and integration verifier/final report | Not started | Wait for owner-test, architecture, shell, and mobile CRM packets; verify without duplicate sends. |

## Packet DAG

| Packet | Requirement | Role | Status | Scope |
| --- | --- | --- | --- | --- |
| PKT-20260713-906 | REQ-20260713-906 | Control correction | Done | Register raw addendum, correction decisions, source matrix, and One Time-first run order. |
| PKT-20260713-907 | REQ-20260713-907 | Provider test packet | Ready | Guarded owner-only email/WhatsApp readiness, preflight, optional send, provider readback, CRM readback, idempotency, redacted evidence. |
| PKT-20260713-908 | REQ-20260713-908 | Architecture/performance packet | Ready | ADR, route/surface map, instrumentation, repeated baseline, budgets, root-cause classification. |
| PKT-20260713-909 | REQ-20260713-909 | Implementation packet | Blocked by `REQ-20260713-908` | Dedicated One Time frontend shell and route modules with old-shell fallback. |
| PKT-20260713-910 | REQ-20260713-910 | Product quality packet | Ready | CRM mobile IA current-state visual audit, PQC validation, list/detail/subview model, section rail, overflow actions, lazy data, screenshots. |
| PKT-20260713-911 | REQ-20260713-911 | Verifier packet | Blocked by dependencies | Independent final proof for owner tests, performance, mobile CRM, BNA safety, and deployed SHA. |

## Guardrails

- Do not hardcode, paste, commit, log, screenshot, or report full owner email or phone values.
- Evidence may use only labels such as `owner_test_email` / `owner_test_whatsapp`, masked destinations, one-way fingerprints, provider message IDs, and test-run IDs.
- Maximum sends for this run: three owner-test emails and five owner-test WhatsApp messages.
- Public WhatsApp auto-reply remains gated separately; owner tests must not enable unrestricted public live mode.
- Rabbi Scheller personal accounts, parents, students, leads, imported contacts, campaign lists, payment/access messages, and bulk sends are out of scope.
- Product/UI implementation for CRM mobile IA must wait for current-state visual audit and a valid Product Quality packet.
- Performance completion needs repeated cold/warm evidence, not one successful smoke or cache-header proof.

## Immediate Next Packet

Start `PKT-20260713-907`:

1. Inspect existing guarded email smoke and One Time WAPI readiness scripts.
2. Determine whether secure owner-test aliases are available through existing config/Railway/keyholder paths without printing raw values.
3. Run no-send/no-write readiness and dry-run checks first.
4. If aliases or gates are missing, record a precise blocker for `REQ-20260713-907` only and continue `REQ-20260713-908`.
5. If aliases and guardrails are present, run at most one owner-test send per channel scenario and record redacted provider/CRM readback.

Do not solve the whole parent ramble. Complete only this packet's scope and record the next packet or blocker.
