# One Time Parallel Frontend Audit, Static Chrome, Landing Reframe, Agent Mode Prompts

## Raw intake

Source: `RAW-20260709-011`

Shloimie asked for goal-mode execution on GitHub issue #128, but explicitly in
parallel-safe audit mode first. The current batch must audit and generate
prompts/packets before shared app implementation. If the control tower or dirty
worktree shows another active agent touching overlapping app-visible One Time
files, implementation stops and the static chrome packet is marked blocked by
active deploy lane.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260709-011 |
| Source | codex_chat attachment + GitHub issue #128 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-09-onetime-parallel-frontend-audit.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Execute GitHub issue #128 in parallel-safe audit mode first: preserve the One Time frontend audit request, create/update the requirement register, run control-tower and dirty-branch checks, capture current-state screenshots/evidence for the specified routes/viewports, generate Agent Mode audit prompts, and only implement the first safe static-chrome packet if no active lane collision exists. |
| Goal tool used | yes |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then work audit/prompt/packet requirements in batches. Do not edit shared app files while the active lane collision exists. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260709-061 through REQ-20260709-068, plus follow-up REQ-20260709-070 |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260709-061 | Preserve raw intake and register the Issue #128 parallel-safe audit lane. | RAW-20260709-011 | agent_ops | Codex | intake | P0 | 0 | none | Raw input, memory note, dated register, ledger entry, and source readback exist. | raw-input, memory, tasks-pending, ops ledgers | no | Done |
| REQ-20260709-062 | Run control-tower, dirty-worktree, current-branch, active-agent, and issue readback before implementation. | RAW-20260709-011 | agent_ops | Codex | coordination | P0 | 0 | REQ-20260709-061 | `npm run chatgpt:dropoff:tower`, `git status --short --branch`, active execution-run status, and GitHub issue #128 readback are recorded. If collision exists, implementation is blocked. | ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md | no | Done - collision found |
| REQ-20260709-063 | Compile Product Quality packets for the One Time frontend audit DAG. | RAW-20260709-011 | rabbi_sheller_provider / one_time_mishnah_class | Codex | product-quality | P0 | 1 | REQ-20260709-062 | `00-control-tower`, `01-current-state-visual-audit`, `02-static-chrome-implementation`, `03-public-landing-reframe`, and `04-provider-operations-layout-parity-audit` packets exist and validate or record exact validation blockers. | ops/prompt-packets/2026-07-09-onetime-full-frontend-audit-static-chrome/* | no | Done |
| REQ-20260709-064 | Run the Playwright current-state frontend audit for the requested routes and viewports. | RAW-20260709-011 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual-audit | P0 | 2 | REQ-20260709-063 | Audit captures full-page, first-viewport, header/topbar, footer where present, ARIA/DOM snapshots where possible, and metrics for overflow, clipped text, first-content y, topbar height, active nav styling, tap target size, logo size, duplicate nav/filter rows. | scripts/audit-onetime-parallel-frontend.mjs; ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/* | no | Done - 113 findings captured |
| REQ-20260709-065 | Write the senior-designer audit report and manifest. | RAW-20260709-011 | rabbi_sheller_provider / one_time_mishnah_class | Codex | visual-audit | P0 | 2 | REQ-20260709-064 | `report.md`, `report.json`, and `manifest.json` exist in `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/` with exact defects, routes, screenshots, likely files, and implementation packet routing. | ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/* | no | Done |
| REQ-20260709-066 | Generate the eight requested Agent Mode prompts through the approved Agent Review prompt system. | RAW-20260709-011 | agent_ops / one_time_mishnah_class | Codex | agent-mode | P0 | 1 | REQ-20260709-063 | All eight prompt files and index entries exist under `public/agent-review-prompts/`; each includes exact routes, viewports, screenshots, visual defect checklist, forbidden external actions, output format, pass/fail/blocked rules, and autonomous submit/seal instructions. | src/lib/bna/agent-review-hub.js; public/agent-review-prompts/*.md; public/agent-review-prompts/index.json | app-visible static prompt content | Done - pushed, deployed, live readback passed |
| REQ-20260709-067 | Keep static One Time chrome implementation blocked while the active deploy/edit lane overlaps shared app files. | RAW-20260709-011 | rabbi_sheller_provider / one_time_mishnah_class | Codex | implementation-blocker | P0 | 3 | REQ-20260709-062, REQ-20260709-064 | Static chrome packet names canonical header/footer/larger-logo/active-yellow-nav/mobile-safe-nav scope, likely files, tests, and patch plan, but status is `Blocked by active deploy lane` until dirty files clear. | public/one-time/index.html; public/rabbi-member.html; public/member-library.html; public/one-time-classroom.html; shared CSS; tests | yes if later implemented | Blocked by active deploy lane |
| REQ-20260709-068 | Verify packets/prompts/audit outputs and record closeout without external writes. | RAW-20260709-011 | agent_ops | Codex | verification | P0 | 4 | REQ-20260709-063, REQ-20260709-064, REQ-20260709-066 | Run focused syntax/tests/validator/protocol checks possible without touching active app lane; record Drive mirror availability; append ledger/changelog; do not claim app-visible UI Done without deploy/live smoke. | validation reports, ops ledgers | no for audit docs; yes for future app UI | Done with blockers recorded |
| REQ-20260709-070 | Capture and start fixing the OneTime live app lag and UI follow-up as evidence, separating response-time lag from visual polish defects. | RAW-20260709-013 | rabbi_sheller_provider / one_time_mishnah_class | Codex | performance-audit | P0 | follow-up | REQ-20260709-062, REQ-20260709-064 | A no-write live lag audit exists, TTFB readback exists, Product Quality Compiler packet validates, likely bottleneck is classified, active collision lanes are clear, and the first conservative static/cache delivery fix is implemented, verified, deployed, and live-smoked. | server.js; tests/bna-helper-tools.test.js; tests/one-time-intake-api-readback.test.js; scripts/audit-onetime-live-performance.mjs; ops/performance-audits/2026-07-09-onetime-live-lag-audit/*; ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/*; ops/prompt-packets/2026-07-09-onetime-live-lag-performance/05-live-lag-performance-fix.product-quality.json | yes | Done - cache policy deployed/live-smoked; parent-review desktop residual tracked |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260709-041 | onetime-parallel-frontend-audit | Capture current One Time frontend visual audit evidence for Issue #128. | Codex | one_time_mishnah_class | RAW-20260709-011 | REQ-20260709-064, REQ-20260709-065 | Use `report.md` findings to split next implementation packet after lane clears. | agent/audit | Done - findings captured |
| TASK-20260709-042 | onetime-agent-mode-prompt-series | Generate the eight One Time frontend Agent Mode prompts. | Codex | agent_ops / one_time_mishnah_class | RAW-20260709-011 | REQ-20260709-066 | Use the live prompt URLs to run parallel Agent Mode audits; static chrome implementation remains a separate next packet. | agent-mode | Done - pushed, deployed, live readback passed |
| TASK-20260709-043 | onetime-static-chrome-blocked-packet | Prepare but do not implement the static chrome packet while app-visible files are dirty. | Codex | one_time_mishnah_class | RAW-20260709-011 | REQ-20260709-067 | Keep packet blocked until control tower shows no collision. | blocked-implementation | Blocked by active deploy lane |
| TASK-20260709-044 | onetime-live-lag-audit | Capture current OneTime live lag and classify whether it is UI, API, runtime, or cache/static delivery. | Codex | one_time_mishnah_class | RAW-20260709-013 | REQ-20260709-070 | Use the 2026-07-10 live readback to decide whether the single remaining parent-review desktop DCL threshold should become a follow-up, then resume visual chrome fixes from REQ-20260709-067. | performance/audit | Done - cache policy deployed/live-smoked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260709-009 | Static One Time chrome implementation is blocked by the current active deploy/edit lane. | Dirty worktree contains `server.js`, `package.json`, One Time action registry files, One Time tests, watchdog reports, and an untracked One Time interest smoke script; control tower also shows active app/UI jobs. | Codex / active deploy owner | Produce audit evidence, prompt files, and implementation packets only; wait for clean lane before shared app edits. | Edit shared files anyway. | Editing now risks overwriting another agent's active app-visible work. | Re-run control tower after active lane is clean; then start the static chrome packet from the audit findings. | REQ-20260709-067 | Active blocker |
| DEC-20260709-010 | Countdown deadline should use Israel time and configured campaign data, not a UI hardcoded guess. | Exact 2026 Gregorian cutoff time if owner wants a different Erev Rosh Hashanah/sundown time than the configured `/api/one-time/campaign` contract. | Shloimie / campaign owner | Use `Asia/Jerusalem` and `/api/one-time/campaign`; treat deadline config as source of truth. | Hardcode a date in static UI. | Hardcoded deadline can drift and produce false urgency. | Provide any correction to the campaign deadline config if the existing API/config is wrong. | Later landing implementation only | Not blocking audit |
| DEC-20260709-011 | Drive mirror is optional and must not block repo evidence. | Whether an approved Drive audit-upload utility and safe credential path is available. | Codex | Keep repo evidence; mirror only if a known approved utility exists and screenshots contain no secrets/private data. | Block the audit on Drive upload. | Blocking on Drive would stall the audit and risk unsafe upload work. | Search for approved utility after local audit; record unavailable if not present. | REQ-20260709-068 | Repo evidence saved; Drive mirror unavailable/not attempted |
| DEC-20260709-012 | Do not treat the lag complaint as only a visual/UI issue. | Direct live readback showed multi-second and variable first-byte responses on HTML, assets, and small APIs; the first cache/static delivery fix deployed on 2026-07-10 and reduced live lag samples needing attention from 18/18 to 1/18. | Codex / next performance lane owner | Keep the cache policy; continue deeper runtime/hosting response variability investigation only if repeated live samples remain slow, and continue visual chrome polish separately. | Jump straight to component-level UI tweaks. | Component tweaks may improve polish but will not fix multi-second TTFB or request resets. | Treat the remaining parent-review desktop DCL threshold as a follow-up performance/UI audit item, not proof that the deployed cache policy failed. | REQ-20260709-070 | Cache policy done; residual parent-review threshold tracked |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260709-053 | Does Shloimie want the Rosh Hashanah cutoff at candle-lighting, sunset, or another Israel-time launch cutoff? | Only matters for later deadline config if the existing API/env deadline is absent or wrong. | Blocks only future deadline config edits, not audit/prompts. | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260709-007 | One Time Issue #128 frontend work must run audit/prompt/packet first and leave shared app implementation blocked while another active deploy/edit lane touches overlapping files. | maybe | Current coordination rule; useful while parallel lanes are active. |
| MEM-20260709-008 | OneTime app lag is currently evidenced as slow and variable first-byte/runtime/static-delivery behavior, while UI polish defects are tracked separately in the visual audit. | maybe | Prevents future agents from reducing Shloimie's lag complaint to only CSS/layout work. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260709-063 | `ops/prompt-packets/2026-07-09-onetime-full-frontend-audit-static-chrome/*.product-quality.json` | Created control tower, visual audit, blocked static chrome, landing reframe, and provider Operations parity audit packets. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-09-onetime-full-frontend-audit-static-chrome/00-control-tower.product-quality.json ... 04-provider-operations-layout-parity-audit.product-quality.json` | n/a | n/a | Not required for packet docs |
| REQ-20260709-064 | `scripts/audit-onetime-parallel-frontend.mjs`; specified One Time routes | Ran live/read-only Playwright audit against `https://join.onetimeonetime.com`; Operations routes skipped because login did not succeed. | PASS `node --check scripts/audit-onetime-parallel-frontend.mjs`; PASS audit command with `Status: captured` | n/a | n/a | Not required for audit docs |
| REQ-20260709-066 | `src/lib/bna/agent-review-hub.js`; generated `public/agent-review-prompts/*` | Added eight prompt definitions and regenerated prompt files through `npm run agent-review:prompts`. | PASS `npm run agent-review:prompts`; PASS `node --test tests/agent-review-hub.test.js`; PASS live readback of index and three new prompt URLs on `https://join.onetimeonetime.com` | `84b73e2e` | `84b73e2e` | OneTime deployment `b54e6e9d-3447-454d-88a9-4a6d0a67dbb5` reached `SUCCESS`; live prompt readback passed in `ops/live-smokes/2026-07-09T14-31-36-900Z-onetime-agent-prompts-live-readback.md` |
| REQ-20260709-067 | static One Time public/member/classroom chrome | Do not edit shared app files now. Packet contains likely files and patch plan only. | Control tower collision evidence | n/a | n/a | Blocked by active deploy lane |
| REQ-20260709-070 | `https://join.onetimeonetime.com` OneTime public, member, classroom, provider-review, student-review, and parent-review routes | Added a reusable no-write Playwright lag audit, captured direct TTFB readback, validated `PKT-20260709-133`, then implemented and deployed the first conservative cache/static delivery fix for public JS/CSS/media while preserving no-store/no-cache for HTML, service worker, manifests, APIs, and Operations shell assets. | PASS `node --check server.js`; PASS `node --test tests/one-time-intake-api-readback.test.js tests/bna-helper-tools.test.js`; PASS OneTime Railway doctor/deploy; PASS live header readback; PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; PASS `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`; PASS `npm run app:smoke:one-time-interest-dry-run`; PASS fresh no-write lag audit with 1/18 samples needing attention, down from 18/18. | `4908c905` | `4908c905` | OneTime deployment `50533728-970f-4936-bc14-bbe439992f6e`; live header/readback evidence in `ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/`. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260709-061 | Done | Raw/register created and raw wording preserved. | `raw-input/RAW-20260709-011-onetime-parallel-frontend-audit.md`; this file; `memory/2026-07-09.md` | PASS source readback and issue readback | Ledger/changelog appended in closeout. |
| REQ-20260709-062 | Done - collision found | `npm run chatgpt:dropoff:tower` reported dirty worktree and collision warning; `git status --short --branch` showed dirty `server.js`, `package.json`, One Time action registry/test files, watchdog reports, and untracked One Time smoke script; GitHub issue #128 read back open with latest owner comments. | `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md`; `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.json` | PASS control tower; PASS git status; PASS `gh issue view 128` | Static chrome implementation remains blocked. |
| REQ-20260709-063 | Done | Five packets validate. | `ops/prompt-packets/2026-07-09-onetime-full-frontend-audit-static-chrome/00-control-tower.product-quality.json`; `01-current-state-visual-audit.product-quality.json`; `02-static-chrome-implementation.product-quality.json`; `03-public-landing-reframe.product-quality.json`; `04-provider-operations-layout-parity-audit.product-quality.json` | PASS Product Quality Compiler validation | None for docs. |
| REQ-20260709-064 | Done - 113 findings captured | `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/report.md` captured 105 screenshots, 113 findings, 10 Operations auth skips. | `scripts/audit-onetime-parallel-frontend.mjs`; `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/*` | PASS syntax; PASS live audit status `captured` | Operations audit requires authenticated session/redaction path. |
| REQ-20260709-065 | Done | `report.md`, `report.json`, and `manifest.json` exist with screenshot paths, finding codes, and patch plan. | `ops/ui-audits/2026-07-09-onetime-parallel-frontend-audit/*` | PASS report readback | Findings route to later packets; not implemented in this lane. |
| REQ-20260709-066 | Done - pushed, deployed, live readback passed | 26 generated prompt files/index; eight new One Time prompts added; OneTime deployment `b54e6e9d-3447-454d-88a9-4a6d0a67dbb5` reached `SUCCESS`; live readback passed for index and representative new prompt URLs. | `src/lib/bna/agent-review-hub.js`; `tests/agent-review-hub.test.js`; generated `public/agent-review-prompts/*`; `ops/live-smokes/2026-07-09T14-31-36-900Z-onetime-agent-prompts-live-readback.md` | PASS `npm run agent-review:prompts`; PASS `node --test tests/agent-review-hub.test.js`; PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; PASS `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`; PASS `npm run app:smoke:one-time-interest-dry-run`; PASS direct prompt readback | Static UI fixes are not implemented in this audit/prompt lane; they remain the next packet after a fresh control-tower check. |
| REQ-20260709-067 | Blocked by active deploy lane | Control tower collision evidence. | none | PASS collision check | Re-run after dirty app-visible files clear. |
| REQ-20260709-068 | Done with blockers recorded | Validator, audit, prompt generation, prompt tests, protocol drift watchdog, ledger, changelog, audit-governance report, OneTime deploy, and live readback evidence exist. | `ops/product-quality-compiler/validation/latest-product-quality-validation.md`; `ops/audit-governance/latest.md`; `ops/watchdog-audits/2026-07-09-product-quality-drift.md`; `ops/agent-task-ledger.jsonl`; `ops/agent-changelog.md`; `ops/live-smokes/2026-07-09T14-31-36-900Z-onetime-agent-prompts-live-readback.md` | PASS validator/audit/prompt/test/governance commands; PASS `npm run watchdog:protocol-drift`; PASS OneTime deploy/readbacks | Audit governance remains `NEEDS TASK MAPPING` because of historical debt; static UI implementation remains a separate next packet, not complete in this lane. |
| REQ-20260709-070 | Done - cache policy deployed/live-smoked; residual parent-review desktop threshold tracked | `ops/performance-audits/2026-07-09-onetime-live-lag-audit/report.md` and `ttfb-readback.md` show the original 18/18 lag samples needing attention; `ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/report.md` shows the deployed cache-policy pass reduced attention samples to 1/18; `header-readback.md` proves exact live cache headers. | `raw-input/RAW-20260709-013-onetime-app-lag-ui-followup.md`; `server.js`; `tests/bna-helper-tools.test.js`; `tests/one-time-intake-api-readback.test.js`; `scripts/audit-onetime-live-performance.mjs`; `ops/performance-audits/2026-07-09-onetime-live-lag-audit/*`; `ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/*`; `ops/prompt-packets/2026-07-09-onetime-live-lag-performance/05-live-lag-performance-fix.product-quality.json`; this register | PASS `node --check server.js`; PASS `node --test tests/one-time-intake-api-readback.test.js tests/bna-helper-tools.test.js`; PASS OneTime deploy `50533728-970f-4936-bc14-bbe439992f6e`; PASS live OneTime smokes; PASS live header readback; PASS fresh no-write lag audit | One residual parent-review desktop sample crossed `slow_dom_content_loaded`; continue runtime/parent-review follow-up only if repeated samples stay slow. |

## 2026-07-10 cache/static delivery implementation update

Fresh control-tower readback on 2026-07-10 showed no dirty worktree at sample
time, no ready ChatGPT packets, no claimable agent-fleet jobs, and no active
UI collision lane. Codex therefore opened the first non-overlapping performance
implementation slice for `REQ-20260709-070`.

Implemented locally:

- Added a conservative public static asset cache policy in `server.js`.
- Public JS/CSS assets now return `Cache-Control: public, max-age=300,
  must-revalidate`.
- Public media/font assets now return `Cache-Control: public, max-age=86400,
  stale-while-revalidate=604800`.
- HTML, `sw.js`, manifests, API/private routes, and Operations shell assets
  keep no-store/no-cache behavior.

Verification so far:

- PASS `node --check server.js`.
- PASS `node --test tests/one-time-intake-api-readback.test.js
  tests/bna-helper-tools.test.js` with 18/18 passing.
- Behavioral fake-Express readback proves `bna-bot-widget.js` and
  `one-time-shared-review.css` use the short public cache, OneTime logo media
  uses the longer media cache, and `one-time/index.html`, `sw.js`,
  `manifest.json`, `operations-shell.js`, and
  `operations-deferred-renderers.js` remain no-store/no-cache.

Deployment/live-smoke completed:

- Committed and pushed cache policy fix `4908c905`.
- Deployed to OneTime Railway target `one-time-production / one-time-web`;
  deployment `50533728-970f-4936-bc14-bbe439992f6e` reached `SUCCESS`.
- Live-read headers on `https://join.onetimeonetime.com/js/bna-bot-widget.js`,
  `/css/one-time-shared-review.css`, `/images/one-time/brand/onetimelogo.webp`,
  `/one-time/`, `sw.js`, `manifest.json`, and Operations shell assets.
- Re-ran scoped no-write lag audit:
  `ops/performance-audits/2026-07-10-onetime-cache-policy-live-readback/report.md`.
  Samples needing attention dropped from 18/18 to 1/18; the remaining finding is
  parent-review desktop `slow_dom_content_loaded`.
