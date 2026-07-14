# Intent Preservation Gate v1 - Requirement Register

Raw source: `raw-input/RAW-20260714-001-intent-preservation-gate.md`

Workspace/project: `bna_platform` / `protocol_tooling`

Out of scope: repair of the One Time landing page, landing performance work,
external sends, payment/access/provider mutations, production data changes.

## Requirements

| ID | Requirement | Source | Status | Evidence |
|---|---|---|---|---|
| REQ-20260714-001 | Register this execution packet, verify branch/worktree/drop-off/active-run state, and preserve unrelated dirty work. | RAW-20260714-001 | Done | `git status --short`; `npm run chatgpt:dropoff:tower`; `npm run bna:run:status`; `npm run bna:run:next`; raw/register files created |
| REQ-20260714-002 | Add the Intent Preservation Gate documentation, strict schema, and reusable validation module for raw hashes, exact spans, hard-signal coverage, readiness, supersession, and fingerprints. | RAW-20260714-001 | Done | `docs/INTENT-PRESERVATION-GATE.md`; `ops/intent-preservation.schema.json`; `src/lib/bna/intent-preservation.js`; `node --check` passed |
| REQ-20260714-003 | Add deterministic CLIs for intent spec validation, receipt generation, prompt generation, and eval execution. | RAW-20260714-001 | Done | `scripts/validate-intent-spec.mjs`; `scripts/generate-intent-receipt.mjs`; `scripts/generate-intent-codex-prompt.mjs`; `ops/intent-preservation/evals/run-intent-preservation-evals.mjs`; `npm run intent:validate`; `npm run intent:receipt`; `npm run intent:prompt`; `npm run intent:eval` |
| REQ-20260714-004 | Integrate ramble ingestion so new rambles receive a draft intent spec/readiness record instead of implementation-ready fragments. | RAW-20260714-001 | Done | `src/platform/ingestion/operator-ramble-service.js`; `node --test tests/ingestion/operator-ramble-service.test.js tests/ingestion/ramble-regression-suite.test.js` |
| REQ-20260714-005 | Integrate ChatGPT drop-off validation so new implementation/UI/product/correction/prompt packets require RAW.md, SPEC.json, generated receipt, generated Codex prompt, raw hash, and spec fingerprint; preserve legacy packet compatibility with an explicit warning. | RAW-20260714-001 | Done | `scripts/chatgpt-dropoff-ingestor.mjs`; `tests/chatgpt-dropoff-ingestor.test.js`; `npm run chatgpt:dropoff:scan` showed legacy warnings and zero queued |
| REQ-20260714-006 | Update the prompt splitter so child lanes require atomic spec ownership and full-source authority rather than generic lanes and truncated excerpts. | RAW-20260714-001 | Done | `scripts/chatgpt-packet-prompt-splitter.mjs`; `tests/chatgpt-packet-prompt-splitter.test.js` |
| REQ-20260714-007 | Add mandatory regression evals and mutation tests covering containment, scoped styling, unconditional removal, stale supersession, mobile CTA invariants, exact-copy survival, generated artifact integrity, and the July 13 landing mistranslation. | RAW-20260714-001 | Done | `tests/intent-preservation-gate.test.js`; `ops/intent-preservation/evals/latest-intent-eval-report.md`; 8/8 eval cases passed and 11/11 mutations rejected |
| REQ-20260714-008 | Repair root `AGENTS.md` instruction loading by moving the full guide to canonical docs, keeping concise root guidance under the byte budget, adding the gate trigger near the beginning, and producing a section migration map. | RAW-20260714-001 | Done | `AGENTS.md` now 8,708 UTF-8 bytes; `docs/BNA-AGENT-OPERATING-GUIDE-FULL.md` preserves prior 45,914-byte guide; `docs/AGENTS-MIGRATION-MAP.md` |
| REQ-20260714-009 | Add an instruction-size watchdog/test that measures UTF-8 byte size and asserts critical trigger text is present. | RAW-20260714-001 | Done | `scripts/watchdog-agents-instruction-budget.mjs`; `tests/agents-instruction-budget.test.js`; `npm run watchdog:agents-instructions` |
| REQ-20260714-010 | Run focused and existing protocol/PQC/drop-off/watchdog verification, update ledger/changelog, and commit/push the scoped protocol changes when safe. | RAW-20260714-001 | Blocked for full closeout | Focused tests passed 24/24; `npm run intent:validate:fixtures`, `npm run intent:eval`, `npm run watchdog:agents-instructions`, `npm run pqc:validate`, `npm run pqc:validate:fixtures`, `npm run pqc:evals`, `npm run chatgpt:dropoff:scan`, and `npm run bna:run:status` passed. `npm run watchdog:protocol-drift` failed on unrelated pre-existing prompt packets: `ops/prompt-packets/2026-07-13-onetime-drive-classroom-video-automation/06-class-package-classroom-and-latest-video.md` and untracked `ops/prompt-packets/2026-07-13-zoom-live-super-followup/MANIFEST.md`. Scoped commit/push required partial-index staging because the worktree contains unrelated dirty files and overlapping `package.json`, ledger, and changelog changes. |

## Current-State Notes

- Branch before edits: `codex/onetime-member-library-audit-evidence`.
- Worktree before edits: dirty with unrelated One Time/Zoom/runtime evidence.
- Active execution run: `ops/execution-runs/2026-07-12-shared-crm-communication-agents-addendum`.
- Drop-off tower: no ready packets, dirty worktree collision warning.
- Current PQC evals pass structurally but do not verify fidelity to original source.
- Current root `AGENTS.md` measured 45,914 UTF-8 bytes before migration.

## Closeout Gate

This register is terminal only when each requirement above has `Done`,
`Already satisfied`, `Blocked`, `Needs operator decision`, `Failed`, or
`Archived` with evidence and verification. Protocol-only changes do not require
product deployment unless runtime tooling changed in a way that the release
rules require.

## Verification Summary

Passed:

- `node --check src/lib/bna/intent-preservation.js`
- `node --check scripts/validate-intent-spec.mjs`
- `node --check scripts/generate-intent-receipt.mjs`
- `node --check scripts/generate-intent-codex-prompt.mjs`
- `node --check ops/intent-preservation/evals/run-intent-preservation-evals.mjs`
- `node --check src/platform/ingestion/operator-ramble-service.js`
- `node --check scripts/chatgpt-dropoff-ingestor.mjs`
- `node --check scripts/chatgpt-packet-prompt-splitter.mjs`
- `node --test tests/intent-preservation-gate.test.js tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-packet-prompt-splitter.test.js tests/ingestion/operator-ramble-service.test.js tests/ingestion/ramble-regression-suite.test.js tests/agents-instruction-budget.test.js`
- `npm run intent:validate:fixtures`
- `npm run intent:validate -- ops/intent-preservation/fixtures/valid-unconditional-removal.json`
- `npm run intent:receipt -- ops/intent-preservation/fixtures/valid-unconditional-removal.json`
- `npm run intent:prompt -- ops/intent-preservation/fixtures/valid-unconditional-removal.json`
- `npm run intent:eval`
- `npm run watchdog:agents-instructions`
- `npm run pqc:validate`
- `npm run pqc:validate:fixtures`
- `npm run pqc:evals`
- `npm run chatgpt:dropoff:scan`
- `npm run bna:run:status`

Blocked:

- `npm run watchdog:protocol-drift` reported 17 findings in unrelated
  pre-existing prompt packet lanes. This packet did not edit those lanes.
