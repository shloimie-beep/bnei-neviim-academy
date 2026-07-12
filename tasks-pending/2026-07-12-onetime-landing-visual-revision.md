# Ramble Intake - 2026-07-12 - One Time landing visual revision

## Raw intake

Raw source is preserved exactly at:
`raw-input/RAW-20260712-004-onetime-landing-visual-revision.md`.

Attachment source path:
`C:\Users\User\.codex\attachments\a4d4b60b-b5c6-4d39-a4df-6d061f779a4a\pasted-text.txt`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260712-004 |
| Source | codex_chat attachment |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-12-onetime-landing-visual-revision.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Implement the focused visual revision in a clean branch, verify locally, present screenshots for approval, and do not merge or deploy before approval. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | blocked until visual approval |
| Next requirement IDs to work | REQ-20260712-101 through REQ-20260712-107 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260712-101 | Use a clean current `origin/master` worktree and preserve the stale branch/commit lane. | RAW-20260712-004:S1 | rabbi_sheller_provider / one_time_mishnah_class | Codex | repo safety | P0 | B0 | none | Separate clean worktree/branch; no merge/deploy before approval; stale commit not used. | git worktree, branch metadata | no | Done |
| REQ-20260712-102 | Revise `/one-time` hero, section order, exact copy, visual system, feature tiles, benefits, flow, audience cards, footer order, and signup CTAs. | RAW-20260712-004:S2-S7 | rabbi_sheller_provider / one_time_mishnah_class | Codex | UI implementation | P0 | B1 | REQ-20260712-101 | Required order and exact copy present; old hero paragraph/proof/static promo removed; all public signup links route to `/one-time/signup`; no horizontal overflow in proof viewports. | public/one-time/index.html, config/service-provider-sites/one-time.json, tests | blocked until approval | Implemented, needs screenshot approval |
| REQ-20260712-103 | Move Rabbi section near bottom and add accessible teaching-location carousel with placeholder slides plus separate transparent press-logo marquee. | RAW-20260712-004:S8 | rabbi_sheller_provider / one_time_mishnah_class | Codex | UI implementation | P0 | B1 | REQ-20260712-102 | Rabbi copy and book photo present; carousel has labels, controls, pagination, auto advance, hover/focus pause, swipe, reduced motion; press logos remain separate. | public/one-time/index.html, ops/action-registry.json, tests | blocked until approval | Implemented, needs screenshot approval |
| REQ-20260712-104 | Replace static Rosh Hashanah promotion with a dynamic non-fixed chrome-yellow ticker above footer. | RAW-20260712-004:S9 | rabbi_sheller_provider / one_time_mishnah_class | Codex | UI implementation | P0 | B1 | REQ-20260712-102 | Days are calculated in JS using Asia/Jerusalem calendar date 2026-09-11; ticker loops, pauses, supports reduced motion, and links Sign Up Now to `/one-time/signup`. | public/one-time/index.html, tests | blocked until approval | Implemented, needs screenshot approval |
| REQ-20260712-105 | Render Robot Scheller with the full uncropped robot PNG in launcher and open panel while preserving current-class information behavior. | RAW-20260712-004:S10 | rabbi_sheller_provider / one_time_mishnah_class | Codex | assistant widget | P0 | B2 | REQ-20260712-101 | Launcher and panel use contained `<img>`; no cropping at 1440/768/430/390; current class info prompt still answers. | public/js/bna-bot-widget.js, tests | blocked until approval | Implemented, needs screenshot approval |
| REQ-20260712-106 | Change direct signup city capture to required free text and store detected/fallback IANA timezone while preserving signup/reminder guardrails. | RAW-20260712-004:S11 | rabbi_sheller_provider / one_time_mishnah_class | Codex | signup workflow | P0 | B2 | REQ-20260712-101 | No city datalist/matching requirement; arbitrary city accepted and stored exactly; browser timezone saved as `browser_timezone` and `timezone`; manual fallback appears only when detection fails; phone remains required only for WhatsApp/both. | public/one-time/signup.html, src/lib/bna/one-time-signup-workflow.js, tests, scripts | blocked until approval | Implemented, needs screenshot approval |
| REQ-20260712-107 | Produce verification matrix, screenshots, and protocol closeout without merge/deploy. | RAW-20260712-004:S12 | rabbi_sheller_provider / one_time_mishnah_class | Codex | verification | P0 | B3 | REQ-20260712-102..106 | Screenshots at 1440/1024/768/430/390; robot open/closed proof; countdown value proof; signup submission proof; tests/watchdogs recorded; deployment explicitly blocked pending approval. | ops/ui-audits/2026-07-12-onetime-landing-visual-revision/*, ops/agent-task-ledger.jsonl, ops/agent-changelog.md | blocked until approval | Needs operator decision |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260712-101 | onetime.visual.revision | Present screenshots and requirement matrix for approval after local verification. | Codex | rabbi_sheller_provider / one_time_mishnah_class | RAW-20260712-004 | REQ-20260712-107 | Capture final screenshots and summarize proof. | internal Codex | In progress |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260712-101 | Merge/deploy approval is intentionally withheld until desktop/mobile screenshots are approved. | Operator visual approval. | Shloimie | Review screenshots from this branch before merge/deploy. | Request further visual revisions or approve a follow-up merge/deploy lane. | No production deployment or merge can be called Done in this branch. | Approve screenshots or request revisions. | REQ-20260712-107 | Needs operator decision |
| DEC-20260712-102 | Reference screenshot path from the prompt is unavailable on this machine. | Actual screenshot file or approved replacement reference. | Shloimie | Use the prompt text and local before/after screenshots as evidence for this focused revision. | Provide the missing reference screenshot for another pass. | Visual comparison to that exact image cannot be performed locally. | Provide `/workspace/scratch/ffef2e71fe52/upload/8d1a83ad-4652-409b-869d-269e98173323.png` or approve without it. | none | Blocked external artifact |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260712-101 | Are the final desktop/mobile screenshots approved for merge/deploy? | The prompt forbids merge/deploy until approval. | yes for merge/deploy only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260712-101 | One Time landing visual approval branches must not merge/deploy before screenshots are approved. | no | This is request-specific unless repeated as a standing rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260712-102 | `/one-time`, `public/one-time/index.html` | Implement exact public landing order/copy/visual system. | Static tests and screenshots. | pending | pending | blocked pending approval |
| REQ-20260712-105 | `public/js/bna-bot-widget.js` | Render robot via contained image and verify current-class behavior. | Static tests and Playwright robot checks. | pending | pending | blocked pending approval |
| REQ-20260712-106 | `/one-time/signup`, signup workflow normalizer | Free-text city plus detected/fallback timezone. | Node/browser signup tests and screenshot proof. | pending | pending | blocked pending approval |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260712-101 | Done | Clean worktree `C:\Users\User\BNA-onetime-landing-visual-20260712` on branch `codex/onetime-landing-visual-20260712`. | git worktree | `git fetch origin`; branch created from `origin/master`; stale commit not used. | none |
| REQ-20260712-102 | Implemented, needs screenshot approval | `ops/ui-audits/2026-07-12-onetime-landing-visual-revision/after-landing-*.png` | public/one-time/index.html, config/service-provider-sites/one-time.json, tests/scripts | focused test batch, `npm run test:onetime:focused` | visual approval |
| REQ-20260712-103 | Implemented, needs screenshot approval | `after-landing-*.png`, `after-metrics.json` carousel registry checks | public/one-time/index.html, ops/action-registry.json, tests | `node --test tests/one-time-focused-landing.test.js` passed | visual approval |
| REQ-20260712-104 | Implemented, needs screenshot approval | `after-metrics.json` shows 61 days and reduced-motion animation `none` | public/one-time/index.html | focused test batch and Playwright metrics | visual approval |
| REQ-20260712-105 | Implemented, needs screenshot approval | `robot-closed-*.png`, `robot-open-*.png`, current-info metric true | public/js/bna-bot-widget.js, tests/scripts | focused test batch and Playwright metrics | visual approval |
| REQ-20260712-106 | Implemented, needs screenshot approval | `after-signup-*.png`, `after-signup-success-430.png`, payload stores `Buenos Aires` exactly | public/one-time/signup.html, src/lib/bna/one-time-signup-workflow.js, tests/scripts | focused test batch and Playwright intercepted payload | visual approval |
| REQ-20260712-107 | Needs operator decision | `ops/ui-audits/2026-07-12-onetime-landing-visual-revision/REPORT.md` | audit artifacts, ledger/changelog | syntax checks, 45-test batch, `npm run pqc:validate`, `npm run watchdog:actions`, `npm run watchdog:protocol-drift`, `npm run test:onetime:focused` | visual approval and no deploy |
