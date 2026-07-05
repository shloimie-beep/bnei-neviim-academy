# Ramble Intake - 2026-07-05 - Task 1851 BNA Brand Shell Verification

## Raw intake

See `raw-input/RAW-20260705-011-task-1851-bna-brand-shell-verification.md`.

This register is for the agent-fleet pickup of task 1851, which appears to be a
new live-task record for the app-wide BNA brand shell already shipped under
historical task #402. The current batch must verify the existing implementation
against the current task acceptance criteria and record any blocker or gap.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-011 |
| Source | agent_fleet |
| Source task | 1851 |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-05-task-1851-bna-brand-shell-verification.md` |
| Product-quality packet | `ops/prompt-packets/2026-07-05-task-1851-bna-brand-shell-verification/01-bna-brand-shell-verifier.product-quality.json` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-701 | Verify the current BNA app shell source against task 1851 scope. | RAW-20260705-011 / SRC-20260705-011-001 | bna_platform / app_shell | Codex | verification | P0 | B0 | Inspect Operations, parent, student, provider, login, public/external pages, shared CSS, select enhancer, route/action registries, and prior task #402 evidence. | `public/css/bna-app-shell.css`, `public/js/app-select.js`, `public/operations.html`, `public/parent.html`, `public/student.html`, `public/provider.html`, `public/operations-login.html`, route/action registries, tests | yes | Done |
| REQ-20260705-702 | Validate the Product Quality Compiler packet before making any UI/product code change. | RAW-20260705-011 / SRC-20260705-011-002 | bna_platform / product_quality | Codex | protocol | P0 | B0 | PQC packet covers affected roles/routes, state matrix, visual proof, action states, privacy, tests, and live-smoke gate; `npm run pqc:validate <packet>` passes. | `ops/prompt-packets/2026-07-05-task-1851-bna-brand-shell-verification/01-bna-brand-shell-verifier.product-quality.json` | no | Done |
| REQ-20260705-703 | Run fresh local/static verification for the brand shell and action preservation. | RAW-20260705-011 / SRC-20260705-011-003 | bna_platform / app_shell | Codex | tests | P0 | B1 | Focused brand-shell tests pass; UI watchdog/static route checks pass or name exact unrelated findings. | tests and watchdog reports | no | Done |
| REQ-20260705-704 | Capture fresh desktop/mobile visual evidence and live smoke for the deployed app without deploy or production mutation. | RAW-20260705-011 / SRC-20260705-011-004 | bna_platform / app_shell | Codex | visual_live_smoke | P0 | B2 | Fresh screenshots cover desktop and mobile app shell routes; live app smoke passes, or blocker states missing credential/network owner and exact next command. | `ops/playwright-smokes/task-1851-brand-shell-live-20260705/`, `ops/live-smokes/` | yes | Done |
| REQ-20260705-705 | Record task-specific closeout evidence without marking the live task done directly. | RAW-20260705-011 / SRC-20260705-011-005 | bna_platform / agent_fleet | Codex | closeout | P0 | B3 | Ledger/changelog note summarizes verification, files inspected, screenshots/live-smoke evidence, and any blocker; supervisor remains responsible for final live task status. | `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md` | no | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260705-701 | Deployment is not performed from this worker. | None; task worker instructions set Tier 2 deploy/live-smoke through parent release gate. | Supervisor / release gate | Verify current deployed app and leave deploy to parent release gate if a code gap is found. | Attempt deploy from worker. | Worker deploy would violate current tier policy. | Run local/static checks, browser screenshots, and live smoke only. | None unless a code gap requires release. | Decided |

## Watchdog findings outside task scope

| ID | Finding | Route | Evidence | Severity | Expected behavior | Scope decision | Status |
|---|---|---|---|---|---|---|
| WATCH-20260705-701 | Broad visual watchdog found `Naki logo placeholder` copy and a 28px input target on the separate One Time home route. | `/one-time/` | `ops/watchdog-audits/2026-07-05T18-04-watchdog-visual-baseline.md` | high because tiny targets were present on tablet/desktop | One Time home should remove placeholder copy and use at least 32px controls. | Not part of task 1851 BNA app-wide shell verification; One Time brand/workflow is scoped separately to `rabbi_sheller_provider / one_time_mishnah_class`. | Recorded for separate One Time visual cleanup |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260705-701 | `/operations`, `/parent`, `/student`, `/provider`, `/operations-login.html`, public/external provider/sign-up pages, shared CSS/select enhancer | Verification-first; patch only if a real gap appears. | Source inspection found existing task #402 implementation and current tests/source cover static BNA shell, portal shell, Operations topbar/mobile header, top filter rail, and in-app select enhancer. | n/a | n/a | Existing deployment live-smoked |
| REQ-20260705-702 | PQC packet | Validate exact product-quality scope before code edits. | PASS `npm run pqc:validate ops/prompt-packets/2026-07-05-task-1851-bna-brand-shell-verification/01-bna-brand-shell-verifier.product-quality.json`. | n/a | n/a | n/a |
| REQ-20260705-703 | Static tests/watchdogs | Run focused tests and relevant watchdogs. | PASS focused static tests 12/12; PASS `npm run watchdog:ui`; PASS `npm run watchdog:protocol-drift`. | n/a | n/a | n/a |
| REQ-20260705-704 | Playwright screenshots and live smoke | Capture fresh evidence without production mutation. | PASS focused live screenshot smoke for `/`, `/signup.html`, `/service-providers`, `/operations-login.html`, `/parent`, `/student`, and `/provider` at 390/430/768/1440; PASS `npm run app:smoke`. | n/a | n/a | Live smoke report `ops/live-smokes/2026-07-05T18-02-41-116Z-live-app-smoke.md` |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-701 | Done | Current source inspection plus task #402 historical closeout: `ops/agent-changelog.md`, `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/report.md`. | none; verification/register only | Source files inspected; no code gap found | none for BNA shell |
| REQ-20260705-702 | Done | `ops/product-quality-compiler/validation/latest-product-quality-validation.md` shows PASS for the task-1851 PQC packet. | PQC packet | PASS `npm run pqc:validate ...` | none |
| REQ-20260705-703 | Done | `ops/watchdog-audits/2026-07-05T18-02-watchdog-ui-smoke.md`; `ops/watchdog-audits/2026-07-05-product-quality-drift.md`. | none | PASS focused tests 12/12; PASS `npm run watchdog:ui`; PASS `npm run watchdog:protocol-drift` | none |
| REQ-20260705-704 | Done | `ops/playwright-smokes/task-1851-brand-shell-live-20260705/focused-bna-shell/report.md`; broad matrix `ops/playwright-smokes/task-1851-brand-shell-live-20260705/visual-baseline-browser-matrix.md`; live smoke `ops/live-smokes/2026-07-05T18-02-41-116Z-live-app-smoke.md`. | screenshot/report artifacts | PASS focused screenshot smoke; PASS `npm run app:smoke`; broad `watchdog:visual` captured screenshots but failed only on unrelated `/one-time/` findings recorded as WATCH-20260705-701 | unrelated One Time home visual cleanup remains separate |
| REQ-20260705-705 | Done | `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`. | ledger/changelog | closeout recorded | supervisor marks live task status |
