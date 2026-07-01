# Finish Product Quality Protocol + Brand Kits + Rabbi Control Tower

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260701-003 |
| Source | Codex chat `BNA_GOAL_MODE_EXECUTION_PACKET` |
| Raw path | raw-input/RAW-20260701-003-finish-product-quality-protocol-brand-kits-rabbi-control-tower.md |
| Scope | Finish protocol/tooling state, correct brand/pipeline memory/config, create provider smoke packets, create Rabbi / One Time control tower and visual audit packets, validate, and prepare commit/push/PR/deploy status. |
| Explicit non-scope | Rabbi UI implementation, screen redesign, GHL runtime, DNS mutation, live Stripe payments, bulk campaign send, hard deletes, secret exposure. |
| Current status | merged_deploy_blocked |

## Source Coverage Matrix

| Source ID | Requirement ID | Coverage |
|---|---|---|
| SRC-20260701-101 | REQ-20260701-101 | Inspect/reconcile Product Quality Protocol implementation |
| SRC-20260701-102 | REQ-20260701-102 | Finish protocol enforcement gaps |
| SRC-20260701-103 | REQ-20260701-103 | Validate protocol scripts/templates/watchdogs |
| SRC-20260701-104 | REQ-20260701-104 | Correct Rabbi/One Time and BNA brand-kit source of truth |
| SRC-20260701-105 | REQ-20260701-105 | Correct provider pipeline source of truth |
| SRC-20260701-106 | REQ-20260701-106 | Add memory-topic lookup/contradiction rule |
| SRC-20260701-107 | REQ-20260701-107 | Add durable design-reference capture rule |
| SRC-20260701-108 | REQ-20260701-108 | Create Resend send-enabled smoke/readback packet |
| SRC-20260701-109 | REQ-20260701-109 | Create Stripe sandbox smoke/readback packet |
| SRC-20260701-110 | REQ-20260701-110 | Generate Rabbi/One Time 00-control-tower |
| SRC-20260701-111 | REQ-20260701-111 | Generate Rabbi/One Time 01-current-state-visual-audit |
| SRC-20260701-112 | REQ-20260701-112 | Commit/push/PR/merge/deploy as permitted |
| SRC-20260701-113 | REQ-20260701-113 | Validate source coverage/evidence/handoff |

## Requirements

| ID | Requirement | Acceptance criteria | Evidence | Status |
|---|---|---|---|---|
| REQ-20260701-101 | Inspect and reconcile existing Product Quality Protocol implementation. | Existing v3 docs/schema/scripts/templates/evals are inspected and not duplicated. | Existing v3 docs/scripts/templates were present locally; clean release branch copied the scoped protocol set. | done |
| REQ-20260701-102 | Finish Product Quality Operating System enforcement if incomplete. | Minimum router/compiler/DAG/DoR/DoD/state/screenshot/security/trace/context/validator/watchdog/eval/template set exists. | `docs/*`, `ops/product-quality-compiler*`, scripts, templates, fixtures, evals, and watchdog exist in release branch. | done |
| REQ-20260701-103 | Validate protocol scripts/templates/watchdogs. | PQC validation, evals, drift watchdog, trace validation, BNA run checks, secrets audit, and JSON/JSONL parse pass or exact blocker recorded. | PASS command matrix below in both dirty workspace and clean release worktree. | done |
| REQ-20260701-104 | Correct brand-kit source of truth. | One Time config clearly uses black/yellow; BNA config holds cream/navy/teal/cyan; audit package records the correction. | `config/brands/one-time.json`, `config/brands/bna.json`, `src/platform/brands/index.js`, `ops/design-references/2026-07-01-brand-kit-correction/`. | done |
| REQ-20260701-105 | Correct provider pipeline source of truth. | Memory/docs state separate provider classroom/content/community pipelines and add `DEC-20260701-ONETIME-SEPARATE-PROVIDER-PIPELINE`. | `MEMORY.md`, `memory-topics/provider-pipelines.md`, `memory-topics/rabbi-scheller-onetime.md`, `memory-topics/workspace-scope-isolation.md`. | done |
| REQ-20260701-106 | Add memory-topic lookup and contradiction rule. | AGENTS and ramble protocol require memory-topic/config/design-reference lookup and contradiction handling before acting. | `AGENTS.md`, `docs/BNA-RAMBLE-TO-DONE.md`. | done |
| REQ-20260701-107 | Add durable design-reference capture rule. | `docs/DESIGN-REFERENCE-CAPTURE.md` and `memory-topics/design-references.md` define package path and fields. | `docs/DESIGN-REFERENCE-CAPTURE.md`, `memory-topics/design-references.md`, brand correction package. | done |
| REQ-20260701-108 | Convert Resend from generic blocker to configured smoke/readback packet. | `09-resend-send-enabled-smoke.md` exists with safe send/test/readback instructions and no bulk-send permission. | `ops/prompt-packets/2026-07-01-provider-config-readback/09-resend-send-enabled-smoke.md`. | done |
| REQ-20260701-109 | Convert Stripe from generic blocker to sandbox smoke/readback packet. | `10-stripe-sandbox-smoke.md` exists with test-mode-only, no-real-card, reversible readback instructions. | `ops/prompt-packets/2026-07-01-provider-config-readback/10-stripe-sandbox-smoke.md`. | done |
| REQ-20260701-110 | Generate Rabbi/One Time 00-control-tower. | Packet exists with corrected brand/pipeline, DAG, child packets, scope, exclusions, and next packet. | `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/00-control-tower.md`. | done |
| REQ-20260701-111 | Generate Rabbi/One Time 01-current-state-visual-audit. | Packet exists with routes, viewport matrix, output paths, VQ/scope/brand/pipeline finding requirements, and no implementation rule. | `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/01-current-state-visual-audit.md`. | done |
| REQ-20260701-112 | Commit/push/PR/merge/deploy as permitted. | Scoped commit/PR/deploy performed if safe; otherwise exact blocker records dirty tree, owner, next action. | Commit `73542446`; PR #59 merged to `master` as `1fd7ddcc514cc7e0e3f98b7787c7b177d38f376a`; Railway deploy blocked by target guard requiring explicit project/service. | blocked |
| REQ-20260701-113 | Validate source coverage, evidence, and next-session handoff. | Register, ledger, changelog, memory, memory-topics, trace, and NEXT-SESSION/status are updated with terminal statuses. | Register, ledger, changelog, memory, memory-topics, and trace updated; next packet named. | done |

## Decisions

| ID | Decision | Status |
|---|---|---|
| DEC-20260701-ONETIME-SEPARATE-PROVIDER-PIPELINE | One Time uses shared BNA platform primitives/patterns but a separate provider classroom/content/community data pipeline scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`. | decided |

## Final Audit

| Requirement ID | Terminal status | Evidence | Verification |
|---|---|---|---|
| REQ-20260701-101 | done | Source files inspected; no duplicate protocol tree created. | PASS source readback and clean release diff scope. |
| REQ-20260701-102 | done | Protocol docs/schema/scripts/templates/evals/watchdog present. | PASS `npm run pqc:all`. |
| REQ-20260701-103 | done | Validator, eval, watchdog, BNA run, focused tests, secrets, JSON, diff checks run. | PASS command matrix below. |
| REQ-20260701-104 | done | Brand configs split and brand audit package created. | PASS JSON parse and focused One Time tests. |
| REQ-20260701-105 | done | Separate provider pipeline memory recorded with Decision. | PASS memory-topic/source coverage review. |
| REQ-20260701-106 | done | Memory lookup and contradiction handling added to AGENTS/protocol. | PASS drift watchdog. |
| REQ-20260701-107 | done | Design-reference capture doc/memory/package added. | PASS JSON parse and source review. |
| REQ-20260701-108 | done | Resend provider packet created. | PASS drift watchdog. |
| REQ-20260701-109 | done | Stripe sandbox provider packet created. | PASS drift watchdog. |
| REQ-20260701-110 | done | 00-control-tower generated. | PASS drift watchdog. |
| REQ-20260701-111 | done | 01-current-state-visual-audit generated. | PASS drift watchdog. |
| REQ-20260701-112 | blocked | Commit `73542446`; PR #59 `https://github.com/shloimie-beep/bnei-neviim-academy/pull/59`; merge commit `1fd7ddcc514cc7e0e3f98b7787c7b177d38f376a`; remote feature branch deleted. Railway deploy/live-smoke blocked. | BLOCKED deploy: `npm run railway:target:doctor` reports missing explicit Railway project and service target. Owner: Shloimie/keyholder. Next action: set explicit Railway project/service target, then deploy/smoke if this runtime brand preset change must be live. |
| REQ-20260701-113 | done | Closeout records updated with PR/merge/deploy status and next packet. | PASS ledger JSONL parse; trace validator pending after closeout follow-up. |

## Validation Matrix

| Command | Context | Result |
|---|---|---|
| `node --check scripts/validate-product-quality-packets.mjs` | main + clean release worktree | PASS |
| `node --check scripts/watchdog-product-quality-drift.mjs` | main + clean release worktree | PASS |
| `node --check ops/product-quality-compiler/evals/run-product-quality-compiler-evals.mjs` | main + clean release worktree | PASS |
| `node --check scripts/validate-agent-traces.mjs` | main + clean release worktree | PASS |
| `npm run pqc:all` | main + clean release worktree | PASS |
| `npm run bna:run:status` | main + clean release worktree | PASS, active run still has unrelated blocked requirements |
| `npm run bna:run:validate` | main + clean release worktree | PASS |
| `npm run bna:run:source-coverage` | main + clean release worktree | PASS, 0 unmapped executable statements |
| `npm run bna:run:stale-evidence` | main + clean release worktree | PASS, none |
| `npm run secrets:audit` | main + clean release worktree | PASS |
| `node --test tests/instances/w4-onetime-instance.test.js tests/one-time-launch-readiness.test.js tests/platform-core/platform-core-migration-contract.test.js` | main workspace | PASS 14/14 |
| `node --test tests/instances/w4-onetime-instance.test.js tests/one-time-launch-readiness.test.js tests/platform-core/platform-core-migration-contract.test.js` | clean release worktree | PASS 8/8 available tests |
| JSON parse for edited JSON files | main + clean release worktree | PASS |
| `git diff --check` | main + clean release worktree | PASS with line-ending warnings only |
| `npm run railway:target:doctor` | clean release worktree | BLOCKED: missing explicit Railway project and service target |

## PR / Merge / Deploy Status

- Clean release worktree:
  `C:\Users\User\BNA-product-quality-protocol-release-20260701`
- Branch: `codex/product-quality-protocol-brand-packets-20260701`
- Local release commit: `73542446`
- PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/59`
- Merge commit: `1fd7ddcc514cc7e0e3f98b7787c7b177d38f376a`
- Remote feature branch: deleted after merge.
- Railway deploy/live smoke: blocked, not run. `npm run railway:target:doctor`
  requires an explicit Railway project ID/name and service ID/name; no
  production fallback is allowed.

Next exact packet:

`Run ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/01-current-state-visual-audit.md`
