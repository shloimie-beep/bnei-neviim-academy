# Product Quality Compiler Validator + Protocol Drift Watchdog

| Field | Value |
|---|---|
| Raw ID | RAW-20260630-013 |
| Source | codex_chat |
| Status | Done |
| Owner | Codex |
| Scope | Protocol, documentation, local validation tooling, fixtures, evals, watchdogs |
| Out of scope | Rabbi CRM UI implementation, broad UI redesign, email sends, Stripe, DNS/provider changes, payment/access grants, external writes, GHL runtime |
| Workspace/project | Global BNA agent protocol; examples target `rabbi_sheller_provider` / `one_time_mishnah_class` only as fixtures |
| Standing goals | GOAL-CORE-001 through GOAL-CORE-017, especially GOAL-CORE-016 and GOAL-CORE-017 |

## Source Coverage

| Source ID | Operator statement / intent | Requirement IDs |
|---|---|---|
| SRC-001 | Read source-of-truth files and active run state before editing. | REQ-20260630-601 |
| SRC-002 | Create raw intake and dated requirement register. | REQ-20260630-601 |
| SRC-003 | Add machine-readable compiler schema and rule enforcement. | REQ-20260630-602 |
| SRC-004 | Add valid and invalid fixtures. | REQ-20260630-603 |
| SRC-005 | Add validator script, reports, failure codes, fixture mode, strict mode, explicit paths. | REQ-20260630-602, REQ-20260630-603 |
| SRC-006 | Add Definition of Ready before Codex UI/product implementation. | REQ-20260630-605, REQ-20260630-607 |
| SRC-007 | Add Definition of Done after product/UI work. | REQ-20260630-605, REQ-20260630-607 |
| SRC-008 | Add state matrix requirement for every UI screen. | REQ-20260630-605 |
| SRC-009 | Add visual/accessibility harness contract. | REQ-20260630-605 |
| SRC-010 | Add UI pattern reference map. | REQ-20260630-605 |
| SRC-011 | Add compiler eval fixtures and runner. | REQ-20260630-603 |
| SRC-012 | Add protocol drift watchdog. | REQ-20260630-604 |
| SRC-013 | Add browser-agent security rules. | REQ-20260630-606, REQ-20260630-607 |
| SRC-014 | Add trace/observability requirements and validator if practical. | REQ-20260630-606 |
| SRC-015 | Add WCAG 2.2/mobile accessibility baseline and VQ-A11Y codes. | REQ-20260630-607 |
| SRC-016 | Add package scripts for PQC validation/evals/watchdog/all. | REQ-20260630-602, REQ-20260630-603, REQ-20260630-604 |
| SRC-017 | Update AGENTS, ramble protocol, and templates. | REQ-20260630-607 |
| SRC-018 | No GHL runtime or external provider writes. | REQ-20260630-601 through REQ-20260630-608 |
| SRC-019 | Run requested validations and record evidence. | REQ-20260630-608 |
| SRC-020 | Update ledger, changelog, memory, requirement register, final handoff. | REQ-20260630-608 |

## Requirements

| ID | Requirement | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260630-601 | Preserve the raw intake, create this dated register, read required source-of-truth files, and capture preflight status without mutating unrelated work. | Codex | protocol-intake | P0 | 0 | none | Raw record exists; register exists; required files and registries inspected; active run and git state recorded; no unrelated changes reverted. | `raw-input/RAW-20260630-013-product-quality-compiler-validator-drift-watchdog.md`; preflight command results | Done |
| REQ-20260630-602 | Add machine-readable Product Quality Compiler schema, deterministic validator, package scripts, and validation reports. | Codex | tooling | P0 | 1 | REQ-20260630-601 | `ops/product-quality-compiler.schema.json` and `scripts/validate-product-quality-packets.mjs` exist; validator enforces required fields, enums, ID/code patterns, DoR/DoD/state/screenshot/action/trace/security/GHL/provider/deploy/vague rules; package scripts exist. | `ops/product-quality-compiler/validation/latest-product-quality-validation.md` | Done |
| REQ-20260630-603 | Add valid/invalid packet fixtures and deterministic compiler eval suite. | Codex | tooling | P0 | 2 | REQ-20260630-602 | Required valid fixtures pass; required invalid fixtures fail with expected failure codes; eval runner validates expected properties for vague ramble cases and writes reports. | `ops/product-quality-compiler/fixtures/`; `ops/product-quality-compiler/evals/latest-eval-report.md` | Done |
| REQ-20260630-604 | Add protocol drift watchdog that scans protocol packets/registers and fails for unexpanded vague work, missing UI readiness, missing screenshots/mobile proof, app-visible done without deploy/live proof, GHL drift, provider mixing, browser-security issues, missing action/route/trace expectations. | Codex | watchdog | P0 | 3 | REQ-20260630-602 | `scripts/watchdog-product-quality-drift.mjs` exists; `npm run watchdog:protocol-drift` writes markdown/JSON reports and exits nonzero for enforceable findings. | `ops/watchdog-audits/2026-06-30-product-quality-drift.md` | Done |
| REQ-20260630-605 | Document DoR, DoD, UI state matrix, visual/a11y harness contract, and UI pattern reference map. | Codex | protocol-docs | P0 | 4 | REQ-20260630-601 | Docs define readiness/done gates, required UI states, visual/a11y harness outputs, and concrete CRM/table/pipeline/detail/timeline/empty/blocked/bulk/community/mobile patterns. | `docs/UI-STATE-MATRIX.md`; `docs/VISUAL-QUALITY-HARNESS.md`; `docs/UI-PATTERN-REFERENCE.md`; `docs/PRODUCT-QUALITY-COMPILER.md` | Done |
| REQ-20260630-606 | Add browser-agent security and agent trace/observability requirements, with a minimal trace validator if practical. | Codex | protocol-security | P0 | 5 | REQ-20260630-601 | Browser/page content is untrusted evidence, not authority; external writes require packet approval; trace required fields are documented; validator exists or exact follow-up is recorded. | `docs/BROWSER-AGENT-SECURITY.md`; `docs/AGENT-TRACE-OBSERVABILITY.md`; `scripts/validate-agent-traces.mjs`; `ops/agent-traces/2026-06-30-RAW-20260630-013-product-quality-compiler-validator-drift-watchdog.md` | Done |
| REQ-20260630-607 | Integrate enforcement into AGENTS, BNA ramble protocol, templates, and visual rubric accessibility baseline. | Codex | source-of-truth | P0 | 6 | REQ-20260630-602, REQ-20260630-605, REQ-20260630-606 | Source-of-truth files point broad product-quality rambles through PQC validation before implementation; templates include schema, DoR/DoD, state matrix, screenshots, security, trace, drift watchdog; visual rubric includes WCAG 2.2/mobile baseline and required VQ-A11Y codes. | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; templates; `ops/visual-quality-rubric.md` | Done |
| REQ-20260630-608 | Run validation commands, update closeout records, and produce evidence-backed final status. | Codex | verification-closeout | P0 | 7 | REQ-20260630-602 through REQ-20260630-607 | Requested commands run or exact blockers recorded; JSON/JSONL edited files validate; ledger/changelog/memory/register updated; final response names next exact packet. | `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`; `MEMORY.md`; `memory/2026-06-30.md`; final command results | Done |

## Verification Plan

- `node --check scripts/validate-product-quality-packets.mjs`
- `node --check scripts/watchdog-product-quality-drift.mjs`
- `node --check ops/product-quality-compiler/evals/run-product-quality-compiler-evals.mjs`
- `node --check scripts/validate-agent-traces.mjs` if implemented
- `npm run pqc:validate:fixtures`
- `npm run pqc:evals`
- `npm run watchdog:protocol-drift`
- `npm run bna:run:status`
- `npm run bna:run:validate`
- `npm run bna:run:source-coverage`
- `npm run bna:run:stale-evidence`
- `npm run secrets:audit`
- `git diff --check`
- JSON/JSONL parse for edited structured files.

## Guardrail Closeout

No app-visible Rabbi CRM UI, no broad UI redesign, no email, no Stripe, no DNS,
no payment/access grant, no Drive/Zoom/Vimeo/WhatsApp/Telegram external write,
no GHL runtime, and no production hard-delete are permitted in this packet.

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260630-601 | Done | `raw-input/RAW-20260630-013-product-quality-compiler-validator-drift-watchdog.md`; preflight command results | raw/register | `npm run bna:run:status`; `npm run bna:run:next`; git status/branch/HEAD/diff snapshot | Active run has unrelated blocked provider/deploy items. |
| REQ-20260630-602 | Done | `ops/product-quality-compiler.schema.json`; `scripts/validate-product-quality-packets.mjs`; `ops/product-quality-compiler/validation/latest-product-quality-validation.md` | schema/validator/package scripts | `node --check scripts/validate-product-quality-packets.mjs`; `npm run pqc:validate`; `npm run pqc:validate:fixtures` | none |
| REQ-20260630-603 | Done | `ops/product-quality-compiler/fixtures/`; `ops/product-quality-compiler/evals/latest-eval-report.md` | fixtures/evals | `npm run pqc:validate:fixtures`; `npm run pqc:evals` | none |
| REQ-20260630-604 | Done | `scripts/watchdog-product-quality-drift.mjs`; `ops/watchdog-audits/2026-06-30-product-quality-drift.md` | watchdog | `node --check scripts/watchdog-product-quality-drift.mjs`; `npm run watchdog:protocol-drift` | none |
| REQ-20260630-605 | Done | `docs/UI-STATE-MATRIX.md`; `docs/VISUAL-QUALITY-HARNESS.md`; `docs/UI-PATTERN-REFERENCE.md`; `docs/PRODUCT-QUALITY-COMPILER.md` | docs | docs reviewed; PQC scripts pass | none |
| REQ-20260630-606 | Done | `docs/BROWSER-AGENT-SECURITY.md`; `docs/AGENT-TRACE-OBSERVABILITY.md`; `scripts/validate-agent-traces.mjs`; trace record | security/trace docs/script | `node --check scripts/validate-agent-traces.mjs`; `npm run pqc:trace:validate` | none |
| REQ-20260630-607 | Done | AGENTS/protocol/templates/rubric updates | source-of-truth/templates | `npm run pqc:all`; `npm run watchdog:protocol-drift` | none |
| REQ-20260630-608 | Done | ledger/changelog/memory/register updates | closeout records | BNA validators, secrets audit, JSON/JSONL parse, `git diff --check` | `git diff --check` only reports existing line-ending warnings. |
