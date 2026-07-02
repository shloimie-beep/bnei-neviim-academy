# Ramble Protocol v3 - Product Quality Operating System

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260701-001 |
| Source | Codex chat `BNA_GOAL_MODE_EXECUTION_PACKET` |
| Raw path | raw-input/RAW-20260701-001-ramble-protocol-v3-product-quality-operating-system.md |
| Goal | Upgrade the ramble protocol into an enforced router/compiler/DAG/audit operating system. |
| Scope | Protocol, docs, schema, validators, watchdogs, eval fixtures, prompt templates, seed examples, source-of-truth updates. |
| Explicit non-scope | Rabbi UI implementation, email sends, Stripe, DNS/provider mutation, access grants, Drive/Zoom/Vimeo/WhatsApp/Telegram writes, GHL runtime. |
| Current status | done_verified |

## Source Coverage Matrix

| Source ID | Requirement ID | Coverage |
|---|---|---|
| SRC-20260701-001 | REQ-20260701-001 | Product Quality Operating System doc and source-of-truth integration |
| SRC-20260701-002 | REQ-20260701-002 | Ramble Router doc and template integration |
| SRC-20260701-003 | REQ-20260701-003 | Full loop doc and DoR/audit gating |
| SRC-20260701-004 | REQ-20260701-004 | Packet DAG doc, schema fields, templates, examples |
| SRC-20260701-005 | REQ-20260701-005 | Schema v2 and validator enforcement |
| SRC-20260701-006 | REQ-20260701-006 | Context budget / prompt overflow policy |
| SRC-20260701-007 | REQ-20260701-007 | Repo surface map requirement |
| SRC-20260701-008 | REQ-20260701-008 | UI pattern and visual harness v2 contracts |
| SRC-20260701-009 | REQ-20260701-009 | Eval suite v2 and watchdog v2 |
| SRC-20260701-010 | REQ-20260701-010 | Browser security, trace, packet templates, sample packets |
| SRC-20260701-011 | REQ-20260701-011 | AGENTS, ramble protocol, templates, memory, ledger, changelog |
| SRC-20260701-012 | REQ-20260701-012 | Validation and closeout evidence |

## Requirements

| ID | Requirement | Acceptance criteria | Evidence | Status |
|---|---|---|---|---|
| REQ-20260701-001 | Add Product Quality Operating System as the top-level loop for vague product rambles. | `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md` exists and states vague input must compile into validated artifacts before code. | `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md`; `docs/BNA-RAMBLE-TO-DONE.md` | Done |
| REQ-20260701-002 | Add Ramble Router classification before Codex implementation prompts. | `docs/RAMBLE-ROUTER.md` exists; AGENTS/protocol/templates require router output and next packet. | `docs/RAMBLE-ROUTER.md`; `AGENTS.md`; templates | Done |
| REQ-20260701-003 | Enforce audit-first UI loop before product implementation. | Protocol states product-quality UI work requires control tower plus current-state visual audit before implementation/DoR. | `docs/PRODUCT-QUALITY-OPERATING-SYSTEM.md`; `ops/prompt-packets/templates/01-current-state-visual-audit.template.md` | Done |
| REQ-20260701-004 | Add Packet DAG system for super-rambles. | `docs/PACKET-DAG.md`, prompt-packet README, schema/validator fields, templates, and Rabbi sample show dependencies/statuses. | `docs/PACKET-DAG.md`; `ops/prompt-packets/README.md`; Rabbi sample packet set | Done |
| REQ-20260701-005 | Update Product Quality Compiler schema and validator to v2 operating-system fields. | Schema includes router, DAG, design refs, browser security, context budget, drift, trace, packet constraints; validator enforces critical fields. | `ops/product-quality-compiler.schema.json`; `scripts/validate-product-quality-packets.mjs`; validation report | Done |
| REQ-20260701-006 | Add context budget and prompt overflow policy. | `docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md` exists and packet schema/validator include max surfaces/files/routes split fields. | `docs/CONTEXT-BUDGET-AND-PACKET-SPLITTING.md`; schema/validator | Done |
| REQ-20260701-007 | Add repo surface map requirement. | `docs/REPO-SURFACE-MAP.md` exists with Rabbi / One Time surface map contract and output paths. | `docs/REPO-SURFACE-MAP.md`; trace references surface-map path | Done |
| REQ-20260701-008 | Update UI pattern and visual harness contracts to v2. | `docs/UI-PATTERN-REFERENCE.md` and `docs/VISUAL-QUALITY-HARNESS.md` include v3-required BNA pattern/harness layers. | `docs/UI-PATTERN-REFERENCE.md`; `docs/VISUAL-QUALITY-HARNESS.md` | Done |
| REQ-20260701-009 | Extend eval suite and drift watchdog to v2 cases/rules. | Eval cases 1-8 exist and pass; watchdog detects router/DAG/audit/context/trace drift. | `ops/product-quality-compiler/evals/latest-eval-report.md`; `ops/watchdog-audits/2026-07-02-product-quality-drift.md` | Done |
| REQ-20260701-010 | Add browser security, trace requirements, packet templates, and Rabbi / One Time sample packet set. | Docs/templates/examples exist and include untrusted browser evidence, trace fields, no implementation, and next packet. | `docs/BROWSER-AGENT-SECURITY.md`; `docs/AGENT-TRACE-OBSERVABILITY.md`; `ops/prompt-packets/templates/`; sample packet set | Done |
| REQ-20260701-011 | Update source-of-truth docs and templates. | AGENTS, BNA-RAMBLE-TO-DONE, ramble template, and goal-mode output template point to router/compiler/DAG/validator/watchdog. | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; templates; `MEMORY.md`; `TASKS.md` | Done |
| REQ-20260701-012 | Run validation and closeout evidence. | Required commands run or exact blockers recorded; JSON/JSONL parse passes; ledger/changelog/memory/trace updated. | validation/eval/watchdog/trace reports; ledger/changelog/memory | Done |

## Decisions

| ID | Decision | Status |
|---|---|---|
| DEC-20260630-NO-GHL-FIRST-PARTY-CRM | BNA / One Time remains first-party CRM/community; GHL-like means pattern inspiration only. | decided |

## Final Audit

| Requirement ID | Terminal status | Evidence | Verification |
|---|---|---|---|
| REQ-20260701-001 | Done | Product Quality Operating System doc created and linked. | PASS `npm run pqc:all` |
| REQ-20260701-002 | Done | Ramble Router doc created and integrated into AGENTS/protocol/templates. | PASS `npm run watchdog:protocol-drift` |
| REQ-20260701-003 | Done | Audit-first UI loop documented in OS doc and visual-audit template. | PASS `npm run pqc:validate:fixtures` |
| REQ-20260701-004 | Done | Packet DAG doc, README, templates, schema fields, and Rabbi sample exist. | PASS `npm run pqc:validate` |
| REQ-20260701-005 | Done | Schema v2 plus validator checks for router/DAG/context/security/drift. | PASS `npm run pqc:validate:fixtures` |
| REQ-20260701-006 | Done | Context budget doc and schema/validator fields added. | PASS `npm run pqc:validate:fixtures` |
| REQ-20260701-007 | Done | Repo surface map requirement and output paths documented. | PASS trace validator references surface-map path |
| REQ-20260701-008 | Done | UI pattern reference and visual harness v2 contracts updated. | PASS `npm run watchdog:protocol-drift` |
| REQ-20260701-009 | Done | Eval suite cases 1-8 and invalid fixture checks pass; watchdog reports 0 findings. | PASS `npm run pqc:evals`; PASS `npm run watchdog:protocol-drift` |
| REQ-20260701-010 | Done | Browser security/trace docs, packet templates, and Rabbi sample packets exist. | PASS `npm run pqc:trace:validate` |
| REQ-20260701-011 | Done | AGENTS, ramble protocol, goal-mode template, ramble-intake template, memory, tasks updated. | PASS source coverage / drift watchdog |
| REQ-20260701-012 | Done | Validation, JSON/JSONL parse, ledger, changelog, memory, and trace closeout recorded. | PASS final validation commands; no app deploy required |

## Closeout

- Product Quality validation report:
  `ops/product-quality-compiler/validation/latest-product-quality-validation.md`.
- Eval report:
  `ops/product-quality-compiler/evals/latest-eval-report.md`.
- Drift watchdog report:
  `ops/watchdog-audits/2026-07-02-product-quality-drift.md`.
- Trace:
  `ops/agent-traces/2026-07-01-RAW-20260701-001-ramble-protocol-v3-product-quality-operating-system.md`.
- Deployment/live smoke: not required for this packet because it changed docs,
  templates, fixtures, and local validation tooling only; it did not change
  app-visible or server-visible runtime behavior.
- Next exact packet: Generate Rabbi Sheller / One Time `00-control-tower` and
  `01-current-state-visual-audit` packets using Ramble Protocol v3 / Product
  Quality Operating System.
