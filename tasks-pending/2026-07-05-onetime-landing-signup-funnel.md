# OneTimeOneTime Landing Signup Funnel - 2026-07-05

## Raw intake

See `raw-input/RAW-20260705-006-onetime-landing-signup-funnel.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260705-006 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-05-onetime-landing-signup-funnel.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Register first, then implement the focused public landing-page packet locally with verification and explicit deploy/publish blockers. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260705-101 through REQ-20260705-105 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260705-101 | Preserve and register the landing-page request with stable IDs. | RAW-20260705-006 / SRC-20260705-005-001 | rabbi_sheller_provider / one_time_mishnah_class | Codex | intake | P0 | B0 | none | Raw intake, register, design reference, PQC packet, ledger/changelog records exist. | raw-input, tasks-pending, ops/design-references, ops/prompt-packets, memory, ledger, changelog | no | Done |
| REQ-20260705-102 | Inspect the current `/one-time` route, brand memory/config, existing landing implementation, action/route registry, and current tests before editing. | RAW-20260705-006 / SRC-20260705-005-002 | same | Codex | current_state_audit | P0 | B0 | REQ-20260705-101 | Current static route, server mapping, brand config, original-site reference image, and relevant tests are inspected. | public/one-time/index.html, server.js, config, tests, ops/action-registry.json, ops/route-registry.json | no | Done |
| REQ-20260705-103 | Replace `/one-time` with a focused responsive Mishnayos signup funnel matching black/white/yellow OneTimeOneTime visual direction. | RAW-20260705-006 / SRC-20260705-005-003..010 | same | Codex | frontend | P0 | B1 | REQ-20260705-102 | Page includes the requested announcement bar, header/nav, hero, ticker, logos, program cards, who-it-is-for, features, outcome, FAQ, final CTA/form, TODO comments, no checkout/payment/auth regression, and mobile-safe layout. | public/one-time/index.html | yes | Done - local verified; deploy/live smoke blocked |
| REQ-20260705-104 | Keep public action/config/test contracts aligned with the new funnel copy and CTA destinations. | RAW-20260705-006 / SRC-20260705-005-011 | same | Codex | contracts_tests | P0 | B1 | REQ-20260705-103 | Config copy/nav, action registry selectors, and tests/smokes no longer assert the old Vimeo promo headline/CTA. | config/service-provider-sites/one-time.json, ops/action-registry.json, tests, scripts | yes | Done - local verified; deploy/live smoke blocked |
| REQ-20260705-105 | Verify locally and record proof; keep production deploy/live smoke blocked until a clean release gate is available. | RAW-20260705-006 / SRC-20260705-005-012 | same | Codex | verification_closeout | P0 | B2 | REQ-20260705-103, REQ-20260705-104 | Focused tests, PQC validation, local browser smoke/screenshots, watchdog checks where relevant, ledger/changelog entries, and explicit publish/deploy blocker are recorded. | tests, ops/playwright-smokes, ops/agent-task-ledger.jsonl, ops/agent-changelog.md | yes | Blocked - production deploy/live smoke |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260705-101 | onetime-landing-signup-funnel | Implement the public OneTimeOneTime Mishnayos landing signup funnel. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260705-006 | REQ-20260705-101..105 | Publish/deploy/live-smoke from a clean release branch when approved. | Agent lifecycle | local_verified_deploy_blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260705-101 | Final public hero media and live signup/checkout route are not approved in this packet. | Final hero image/video asset, final dark-header logo approval, and production signup/checkout URL if different from the first-party interest form. | Shloimie / One Time launch owner | Keep placeholders and `#start-free` interest form locally; route all CTAs to the existing safe interest flow until signup/checkout is explicitly approved. | Keep the old Vimeo promo embed or route to checkout now. | Old media would conflict with the prompt; live checkout without approval risks payment/access changes. | Provide final media/logo assets and exact live signup route in a later packet. | Final media replacement, live checkout routing | Open |
| DEC-20260705-102 | Production deploy/live smoke cannot be claimed from the current dirty branch state. | Clean scoped release branch or approval to stage only this packet's files, plus release gate/deploy readiness. | Codex / Shloimie | Keep this packet local-verified and publish from a clean branch after unrelated dirty work is reconciled. | Stage around the dirty worktree now. | Staging around many unrelated modified files risks mixing separate release lanes. | Create a clean release branch or explicitly approve scoped staging/push/deploy for this packet. | App-visible terminal Done | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260705-101 | Should the final Start Free flow remain the interest form or move to a live checkout/signup URL? | Changes CTA route and payment/access behavior. | No for local placeholder funnel; yes for production checkout. | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260705-101 | OneTimeOneTime public landing should use the black/white/yellow original-site direction and a signup-funnel structure for the Mishnayos launch. | no | This is current product implementation scope; existing memory already stores black + yellow brand direction. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260705-103 | `/one-time`, `/one-time/mishnayos`; `public/one-time/index.html` | Replace static inline page with requested funnel sections, placeholder hero/card media, safe form, and member link. | Passed local landing smoke with desktop/tablet/mobile screenshots and interest-form preview submit. | n/a | n/a | Blocked by DEC-20260705-102 |
| REQ-20260705-104 | Config, action registry, focused tests, live smoke script expectations | Align old copy/selector assertions with new funnel. | Focused tests passed 15/15; action watchdog passed 0 findings. | n/a | n/a | Blocked by DEC-20260705-102 |

## Verification evidence

| Check | Result | Evidence |
|---|---|---|
| Product Quality Compiler | Passed | `npm run pqc:validate ops/prompt-packets/2026-07-05-onetime-landing-signup-funnel/01-public-landing-signup-funnel.product-quality.json`; report `ops/product-quality-compiler/validation/latest-product-quality-validation.md` |
| Focused One Time tests | Passed 15/15 | `node --test tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-shared-review-branding.test.js` |
| Local canonical journey smoke | Passed | `npm run one-time:smoke:canonical-journey-local`; report `ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/report.md` |
| Local landing visual/form smoke | Passed | `ops/playwright-smokes/2026-07-05-onetime-landing-signup-funnel/report.md`; screenshots `desktop-landing.png`, `tablet-landing.png`, `mobile-landing.png` |
| Action watchdog | Passed, 0 findings | `npm run watchdog:actions`; report `ops/watchdog-audits/2026-07-05T11-44-watchdog-action-audit.md` |
| Protocol-drift watchdog | Failed on unrelated older helper-bot prompt README findings | `npm run watchdog:protocol-drift`; report `ops/watchdog-audits/2026-07-05-product-quality-drift.md`; findings all point to `ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/README.md`, not this packet |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260705-101 | Done | raw/register/PQC/design package created and PQC validates | raw-input, tasks-pending, ops/design-references, ops/prompt-packets | PQC validation passed | none |
| REQ-20260705-102 | Done | Existing route/config/tests/reference image inspected | none | `rg`, file reads, visual reference inspection | none |
| REQ-20260705-103 | Done - local verified | Public page patched with requested funnel and screenshots | `public/one-time/index.html` | local landing smoke passed; desktop/tablet/mobile screenshots inspected | production deploy/live smoke blocked |
| REQ-20260705-104 | Done - local verified | Config/registry/tests patched | config, ops/action-registry.json, tests, scripts | focused tests 15/15; action watchdog 0 findings | production deploy/live smoke blocked |
| REQ-20260705-105 | Blocked - production deploy/live smoke | local verification recorded; protocol drift unrelated blocker documented | evidence reports, ledger, changelog | PQC/focused tests/canonical smoke/local landing smoke/action watchdog passed; protocol drift failed on older unrelated helper-bot README | deploy/live smoke blocked by DEC-20260705-102 |
