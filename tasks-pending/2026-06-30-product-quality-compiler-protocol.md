# Ramble Intake - 2026-06-30 - Product Quality Compiler Protocol

## Raw intake

Raw wording and key operator statements are preserved at
`raw-input/RAW-20260630-009-product-quality-compiler-protocol-source.txt`.

Wrapper record:
`raw-input/RAW-20260630-009-product-quality-compiler-protocol.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260630-009` |
| Source | Codex chat goal-mode packet |
| Parse status | implemented_verified |
| Requirement register | `tasks-pending/2026-06-30-product-quality-compiler-protocol.md` |
| Goal-mode requested | yes |
| Active goal objective | Harden ramble/product-quality protocol so vague operator quality language compiles into exact specs, packet splitting, visual proof, verification gates, and closeout rules. |
| Goal tool used | yes |
| Deploy/live-smoke required for app-visible work | no for this documentation-only protocol update; yes for future app-visible implementation packets |

## Source statement coverage

| Source statement | Requirement IDs | Coverage |
|---|---|---|
| No GHL; first-party BNA / One Time remains the CRM/community/Mishnayos platform. | `REQ-20260630-506` | Covered in `AGENTS.md`, `docs/PRODUCT-QUALITY-COMPILER.md`, `MEMORY.md`, and this register. |
| "Million-dollar app" means complete, polished, credible, fast, clear, workflow-complete, and business-ready. | `REQ-20260630-502` | Covered in Product Quality Compiler and Quality Goals. |
| The assistant/agent must turn vague rambles into specific specs before Codex implementation. | `REQ-20260630-502`, `REQ-20260630-505` | Covered in AGENTS, ramble protocol, product compiler doc, and templates. |
| Giant prompts may split through multiple ChatGPT/Codex packets. | `REQ-20260630-503`, `REQ-20260630-505` | Covered in Super-Ramble Packet Splitter and prompt-packets README. |
| Visual cleanup requires screenshot proof. | `REQ-20260630-504` | Covered in visual rubric and screenshot-first loop. |
| Mobile screenshots are required for UI cleanup. | `REQ-20260630-504` | Covered with 390/430/768/1024/1440 viewport set. |
| App-visible work requires deploy/live smoke. | `REQ-20260630-502`, `REQ-20260630-505` | Covered in compiler, templates, AGENTS, and ramble protocol. |
| Rabbi/One Time UI is the first target after protocol update. | `REQ-20260630-502`, `REQ-20260630-503` | Covered as examples and next recommended packet. |
| Email and Stripe are later provider setup packets. | `REQ-20260630-506` | Covered as provider packet rules; no sends/charges in this task. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260630-501` | Register raw source, requirement register, source coverage, and goal-mode objective for this protocol update. | `RAW-20260630-009` | repo-wide | Codex | intake | P0 | 0 | none | Raw source wrapper, dated register, source coverage matrix, and goal tool record exist before protocol edits. | `raw-input/*009*`; this register | no | Done |
| `REQ-20260630-502` | Add Product Quality Compiler and Million-Dollar App Quality Standard. | `RAW-20260630-009` | repo-wide protocol | Codex | protocol | P0 | 1 | `REQ-20260630-501` | Vague phrases compile into exact product/UI/IA/workflow/data/action/scope/responsive/evidence/done criteria; "million-dollar app" has concrete checks. | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; `QUALITY-GOALS.md`; `GOAL-MODE.md` | no | Done |
| `REQ-20260630-503` | Add Super-Ramble Packet Splitter and multi-ChatGPT/Codex prompt-packet workflow. | `RAW-20260630-009` | repo-wide protocol | Codex | protocol | P0 | 1 | `REQ-20260630-501` | Super-rambles are classified and decomposed into parent raw input, manifest, child packets, stages, packet roles, and handback rules. | `docs/SUPER-RAMBLE-PACKET-SPLITTING.md`; `ops/prompt-packets/README.md`; templates | no | Done |
| `REQ-20260630-504` | Add visual defect taxonomy and screenshot-first UI proof loop. | `RAW-20260630-009` | repo-wide protocol | Codex | visual_quality | P0 | 1 | `REQ-20260630-501` | Visual findings use VQ codes, severity, route, viewport, screenshot paths, before/after evidence, owner, REQ ID, and terminal status; UI cleanup requires mobile/tablet/desktop proof or blocker. | `ops/visual-quality-rubric.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; templates | no | Done |
| `REQ-20260630-505` | Update ramble/goal-mode templates and packet output contract. | `RAW-20260630-009` | repo-wide protocol | Codex | template | P0 | 2 | `REQ-20260630-502`, `REQ-20260630-503`, `REQ-20260630-504` | GPT/ChatGPT outputs to Codex include parent raw ID, packet ID, stage, role, scope, affected routes/files, product expansion, screenshots, tests, registries, blockers, evidence, terminal rules, and "do not solve whole parent" language. | `tasks-pending/_template-ramble-intake.md`; `tasks-pending/_template-goal-mode-correction-output.md` | no | Done |
| `REQ-20260630-506` | Record no-GHL, role/view scope, IA compiler, test-data, sloppy-system replacement, and late provider-packet rules. | `RAW-20260630-009` | repo-wide protocol / Rabbi One Time examples | Codex | safety_scope | P0 | 2 | `REQ-20260630-502` | GHL-like means first-party pattern inspiration only; view classes are required; IA category/subcategory/filter rules exist; test data is gated/TEST-prefixed; sloppy UI can be replaced without preserving broken duplicates; email/Stripe are later provider packets. | `AGENTS.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; `MEMORY.md`; `GOAL-MODE.md` | no | Done |
| `REQ-20260630-507` | Run validation and record closeout in ledger, changelog, memory, and final audit. | `RAW-20260630-009` | repo-wide protocol | Codex | verification | P0 | 3 | `REQ-20260630-501`-`506` | Required CLI checks, focused template/protocol tests where present, JSON/JSONL validation, diff check, ledger/changelog/memory updates, and final evidence-backed statuses are recorded. | register; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`; `memory/2026-06-30.md` | no | Done |

## Parsed task

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260630-009` | `product-quality-compiler-protocol` | Harden the ramble protocol so vague product-quality language compiles into exact implementation packets. | Codex | repo-wide protocol | `RAW-20260630-009` | `REQ-20260630-501`-`REQ-20260630-507` | Protocol docs/templates patched and verified. | Agent Work | completed |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260630-NO-GHL-FIRST-PARTY-CRM` | BNA / One Time remains first-party CRM/community. GHL-like means pattern inspiration only. | None for this task. Future reversal would require an explicit operator Decision. | Shloimie | Keep first-party BNA Operations and adopt useful CRM patterns only. | Reintroduce GHL/LeadConnector only through a future explicit Decision and setup packet. | Avoids external runtime drift, duplicated CRM source of truth, and accidental external writes. | Record policy in protocol and memory. | Future GHL-like implementation packets | Decided |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit/push | Deployment/live-smoke |
|---|---|---|---|---|---|
| `REQ-20260630-501` | raw/register files | Create `RAW-20260630-009` wrapper/source and this register. | File existence and source coverage review. | not requested | not required |
| `REQ-20260630-502` | protocol docs | Add compiler, million-dollar standard, trigger dictionary, and done gates. | Markdown review, focused protocol/template tests. | not requested | not required |
| `REQ-20260630-503` | splitter docs / prompt-packets README | Add classification, manifests, packet roles, stages, and handback rules. | Markdown review, focused tests. | not requested | not required |
| `REQ-20260630-504` | visual rubric / compiler docs | Add taxonomy and screenshot loop. | Markdown review. | not requested | not required |
| `REQ-20260630-505` | templates | Add packet output contract fields and "do not solve whole parent" language. | Template inspection and focused tests. | not requested | not required |
| `REQ-20260630-506` | AGENTS/MEMORY/GOAL-MODE/compiler docs | Add first-party/no-GHL, scope, IA, provider-packet, test-data, and cleanup rules. | Source coverage and grep review. | not requested | not required |
| `REQ-20260630-507` | ledger/changelog/memory/final audit | Append closeout records and validation evidence. | CLI checks and JSON/JSONL parse. | not requested | not required |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260630-501` | Done | Raw/source/register files created and source coverage matrix included. | `raw-input/RAW-20260630-009-product-quality-compiler-protocol-source.txt`; `raw-input/RAW-20260630-009-product-quality-compiler-protocol.md`; this register | PASS source-of-truth read and active run status/next before edits | none |
| `REQ-20260630-502` | Done | Product Quality Compiler and million-dollar app standard added. | `AGENTS.md`; `docs/BNA-RAMBLE-TO-DONE.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; `QUALITY-GOALS.md`; `GOAL-MODE.md` | PASS focused protocol tests 6/6; PASS grep/source review | none |
| `REQ-20260630-503` | Done | Super-Ramble Packet Splitter and prompt-packet workflow added. | `docs/SUPER-RAMBLE-PACKET-SPLITTING.md`; `ops/prompt-packets/README.md`; templates | PASS focused protocol tests 6/6 | none |
| `REQ-20260630-504` | Done | Visual defect taxonomy and screenshot-first loop added. | `ops/visual-quality-rubric.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; templates | PASS focused protocol tests 6/6 | none |
| `REQ-20260630-505` | Done | Ramble intake and goal-mode packet templates updated. | `tasks-pending/_template-ramble-intake.md`; `tasks-pending/_template-goal-mode-correction-output.md` | PASS focused protocol tests 6/6 | none |
| `REQ-20260630-506` | Done | No-GHL decision, scope/IA/test-data/sloppy cleanup/provider-packet rules recorded. | `AGENTS.md`; `docs/PRODUCT-QUALITY-COMPILER.md`; `MEMORY.md`; `GOAL-MODE.md` | PASS source coverage matrix; no GHL runtime files/code added | none |
| `REQ-20260630-507` | Done | Ledger/changelog/memory/TASKS/register closeout recorded. | `TASKS.md`; `MEMORY.md`; `memory/2026-06-30.md`; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md` | PASS `npm run bna:run:status`; PASS `npm run bna:run:validate`; PASS `npm run bna:run:source-coverage` with 0 unmapped executable statements; PASS `npm run bna:run:stale-evidence` none; PASS focused protocol tests 6/6; PASS `npm run secrets:audit`; PASS structured JSON/JSONL validation; PASS `git diff --check` with line-ending warnings only | Deployment not required because no runtime/app-visible code changed. |
