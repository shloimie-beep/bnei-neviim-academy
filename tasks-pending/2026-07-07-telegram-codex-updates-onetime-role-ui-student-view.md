# Telegram Codex Updates, One Time Role UI, Student View

Raw ID: `RAW-20260707-003`

Created: 2026-07-07 Asia/Jerusalem

Workspace/project: `bna_platform` plus `rabbi_sheller_provider` /
`one_time_mishnah_class`

Goal: Restore useful Telegram progress updates for Codex work, then audit and
repair One Time role-specific product views so Super Admin diagnostics stay in
Super Admin and provider/student views feel production-grade.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260707-003` |
| Source | `codex_chat` |
| Parse status | `registered` |
| Raw file | `raw-input/RAW-20260707-003-telegram-codex-updates-onetime-role-ui-student-view.md` |
| Product packet manifest | `ops/prompt-packets/2026-07-07-telegram-updates-onetime-ui-access/manifest.json` |

## Router output

| Field | Value |
|---|---|
| Classifications | `BUG_REPORT`, `PRODUCT_QUALITY`, `SUPER_RAMBLE`, `UI_VISUAL_AUDIT`, `UI_IMPLEMENTATION`, `COMMUNICATIONS_EMAIL`, `PROVIDER_SETUP`, `SECURITY_PRIVACY`, `SOURCE_OF_TRUTH_UPDATE`, `DECISION_REQUIRED` |
| Product Quality Compiler required | yes |
| Super-ramble splitter required | yes |
| Current-state visual audit before UI implementation | yes |
| Implementation forbidden until Definition of Ready passes | yes for One Time UI/product work |
| Immediate non-UI diagnostic found | `npm run telegram:kimi:status` reports `Running: False` / `blocked_conflict`; `npm run agent:fleet:status` reports supervisor not running with 26 claimable jobs. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260707-030` | Preserve raw intake and create validated control-tower/visual-audit packets. | all | `bna_platform`; `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | protocol | P0 | 0 | none | Raw record, register, manifest, control tower, and current-state visual audit packet exist; PQC validation passes. | raw/register/prompt packets | no | Done |
| `REQ-20260707-031` | Restore concise Telegram progress updates for current Codex work without replaying stale queue noise. | `SRC-20260707-003-001` to `SRC-20260707-003-003` | `bna_platform` / `agent_ops` | Codex | Telegram/agent fleet | P0 | 1 | `REQ-20260707-030` | Diagnose Telegram bridge conflict and stopped agent fleet; define one notification source of truth; ensure task completion updates include completed item, verification, next step, and link/context; do not blindly process old stale jobs. | `scripts/send-codex-progress-telegram.mjs`, `package.json`, `tests/codex-progress-telegram.test.js` | no app deployment required for command-only sender; publish required for GitHub-visible workflow | Done for notification-only Codex closeout path; Telegram bridge poller restart remains blocked |
| `REQ-20260707-032` | Run current-state visual/product audit for One Time role-specific UI before UI edits. | `SRC-20260707-003-004` to `SRC-20260707-003-007` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | UI/product audit | P0 | 1 | `REQ-20260707-030` | Screenshots and findings cover Super Admin Operations, admin-on-provider portal, provider portal, member/student routes, filters/buttons/actions, random diagnostic leakage, mobile/tablet/desktop, and proposed implementation slices. | `scripts/audit-onetime-role-ui-current-state.mjs`; `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/` | no for audit | Done |
| `REQ-20260707-033` | Convert broad product-quality language into focused One Time UI implementation packets. | `SRC-20260707-003-004`, `SRC-20260707-003-005` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | UI implementation | P1 | 2 | `REQ-20260707-032` | Each packet has exact routes, states, VQ findings, actions, tests, screenshots, and deploy/live-smoke gate; no vague "fix everything" task is used as implementation scope. | `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/` | yes | Agent Mode audit prompts ready; implementation still blocked pending audit reports/PQC packets |
| `REQ-20260707-034` | Separate Super Admin diagnostics from normal One Time provider admin view. | `SRC-20260707-003-006`, `SRC-20260707-003-007` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | role/scope UI | P0 | 2 | `REQ-20260707-032` | Provider account view hides global setup/debug/readiness clutter by default; Super Admin retains diagnostics in Operations/support drawers; provider view remains scoped and production-facing. | TBD after audit | yes | Blocked pending visual audit |
| `REQ-20260707-035` | Add or clarify admin "view as student" path with privacy guardrails. | `SRC-20260707-003-008`, `SRC-20260707-003-009` | `bna_platform`; `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | access/role view | P1 | 2 | `REQ-20260707-032` | Super Admin/admin can inspect the student-facing experience through an audited view-as path or exact login instructions; student scope does not expose provider/admin/private cross-student data. | likely `server.js`, student portal files, route/action registry, tests | yes | Blocked pending current-state access audit |
| `REQ-20260707-036` | Close out implemented batches with evidence, Telegram update behavior, deploy/live-smoke, ledger, and changelog. | all | all affected | Codex | verification/closeout | P0 | 3 | implementation batches | Tests/watchdogs pass, app-visible changes are deployed and live-smoked, Telegram update behavior is verified or blocked, and status is recorded. | register, ledger, changelog, live smoke evidence | yes | Pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260707-030` | Choose the source of truth for Telegram Codex progress notifications. | Whether the intended live Telegram poller is hosted on Railway, local, or both; how to avoid duplicate getUpdates pollers. | Codex | Use a notification-only `sendMessage` command for current Codex closeouts; keep Telegram bridge/fleet polling separate until ownership is known. | Restart local Telegram bridge blindly; leave hosted poller unknown; send updates only in app. | Blind restart can conflict or spam; command-only closeout notifications restore useful updates without claiming stale jobs or duplicating `getUpdates`. | Keep using `npm run telegram:codex-progress -- --send ...` for approved progress closeouts; separately identify the active poller before restarting the bridge/fleet. | bridge/fleet restart only | Partially resolved |
| `DEC-20260707-031` | Define provider/student view-as safety model. | Whether provider/student impersonation should be true session switching, signed read-only preview, or admin-visible simulated view. | Codex / Shloimie if privacy tradeoff needed | Prefer audited view-as sessions with visible banner and no password disclosure. | Shared passwords; global Super Admin page with filters only; read-only screenshots only. | Shared passwords are unsafe; filters alone do not prove the user experience. | Audit current student/provider portal auth and propose exact route/session model. | `REQ-20260707-034`, `REQ-20260707-035` | Open |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260707-030` | Is the live Telegram intake bot supposed to run locally, on Railway, or both with separate profiles? | Current local bridge is blocked by Telegram `409 Conflict`, meaning another poller exists. | Blocks safe restart only | Open |
| `Q-20260707-031` | Should Telegram progress updates be sent for every Codex commit/deploy only, or also for intermediate task claims and blockers? | Controls notification volume. | Not blocking first audit; blocks final notification policy | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| `MEM-20260707-030` | Shloimie expects Codex/agent work to produce concise Telegram progress updates: what was fixed, verification, and next step. | yes, after implementation verifies the path | This is a durable cross-channel operating preference. |
| `MEM-20260707-031` | Super Admin diagnostics belong in Super Admin/support surfaces, not in normal One Time provider/student views. | yes, after audit confirms exact surfaces | Durable role-scope UI rule. |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260707-030` | raw/register/prompt packets | Create control tower and visual-audit packet; validate PQC. | `npm run pqc:validate -- ops/prompt-packets/2026-07-07-telegram-updates-onetime-ui-access/00-control-tower.product-quality.json` | pending | pending | not required |
| `REQ-20260707-031` | command-only Telegram progress sender | Added `npm run telegram:codex-progress`, a dry-run-by-default `sendMessage` sender for concise Codex updates. It requires fixed/verified/next fields, redacts by refusal when secret-shaped text appears, does not print token/chat target, and does not start `getUpdates` or claim queue jobs. | PASS `node --check scripts/send-codex-progress-telegram.mjs`; PASS `node --test tests/codex-progress-telegram.test.js`; PASS dry-run JSON formatting; PASS one operator-requested live send returned `ok: true`, `sent: true`, `message_id_present: true`. | pending | pending | publish only; no app-visible deploy required |
| `REQ-20260707-032` | Operations/provider/student routes | Ran live redacted Playwright current-state audit across 7 routes and 5 viewports. | PASS `npm run audit:onetime-role-ui`; 35 screenshots; report `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md` | pending | pending | audit only |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260707-030` | Done | This register; raw record; prompt packet manifest/control tower; `ops/product-quality-compiler/validation/latest-product-quality-validation.md`. | raw/register/prompt packets | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-07-telegram-updates-onetime-ui-access/00-control-tower.product-quality.json` | none |
| `REQ-20260707-031` | Done for notification-only Codex closeout path | Added `scripts/send-codex-progress-telegram.mjs`, `npm run telegram:codex-progress`, and `tests/codex-progress-telegram.test.js`; live send proof returned `ok: true`, `sent: true`, `message_id_present: true`; initial diagnostics still show Telegram bridge stopped due 409 conflict and agent fleet supervisor not running. | `package.json`; `scripts/send-codex-progress-telegram.mjs`; `tests/codex-progress-telegram.test.js` | PASS `node --check scripts/send-codex-progress-telegram.mjs`; PASS `node --test tests/codex-progress-telegram.test.js`; PASS dry-run JSON formatting; PASS one live operator-requested progress send with no token/chat output | Do not restart local bridge or full fleet until active poller ownership and stale-job policy are clear. |
| `REQ-20260707-032` | Done | `ops/ui-audits/2026-07-07-telegram-updates-onetime-ui-access/report.md`; 35 screenshots under `screenshots/`; report JSON and state matrix. | `scripts/audit-onetime-role-ui-current-state.mjs`; `package.json`; audit evidence directory | PASS `node --check scripts/audit-onetime-role-ui-current-state.mjs`; PASS `npm run audit:onetime-role-ui` | Audit found 21 automated findings. Admin-provider route is inconsistent across viewports; student/member routes need a Super Admin view-as access design. |

## Verification log

- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-07-telegram-updates-onetime-ui-access/00-control-tower.product-quality.json`
- PASS `npm run watchdog:protocol-drift`
- PASS `npm run secrets:audit`
- PASS `npm run agent:fleet:readiness`
- PASS `node scripts/agent-fleet-supervisor.mjs --once --dry-run --max-tasks 1`
  without claiming/executing a job; it reported it would claim job `#397` for
  task `#1945`.
- PASS `node --check scripts/send-codex-progress-telegram.mjs`
- PASS `node --test tests/codex-progress-telegram.test.js`
- PASS dry-run `npm run telegram:codex-progress -- --dry-run --json ...`
- PASS operator-requested live `npm run telegram:codex-progress -- --send --json ...`
  returned `ok: true`, `sent: true`, and `message_id_present: true` without
  printing a token or chat target.
- PASS `node --check scripts/audit-onetime-role-ui-current-state.mjs`
- PASS `npm run audit:onetime-role-ui`
  captured 35 redacted screenshots across 7 routes and 5 viewports.
- PASS Agent Mode prompt reconciliation: task `#1945` consumed job `#397`;
  packet `onetime-agent-prompt-series-20260706-911` is `done_verified`.
- NOTE the agent-fleet wrapper for task `#1945` returned `ok: false` because
  broad `npm test` failed on action-registry/hash freshness assertions; focused
  prompt-packet verification passed.

## Current blockers / next exact packets

1. Execute
   `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/01-navigation-filter-consistency-agent-mode.md`
   and
   `ops/prompt-packets/2026-07-07-onetime-ui-consistency-view-as-agent-audit/02-view-as-navigation-agent-mode.md`
   in GitHub-connected Agent Mode or use the marked GitHub comment fallback.
2. After at least two Agent Mode audit reports land, run the synthesis prompt
   and generate focused implementation packets for provider admin diagnostics
   cleanup and student view-as access.
3. Separate follow-up: identify the active Telegram poller owner before
   restarting the local bridge or full agent-fleet worker. The command-only
   Codex progress sender is available now for current approved closeouts.
