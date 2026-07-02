# Ramble Intake - 2026-06-30 - Operations IA UI Cleanup

## Raw intake

Raw wording is preserved at
`raw-input/RAW-20260630-006-operations-ia-ui-cleanup-source.txt`.

Wrapper record:
`raw-input/RAW-20260630-006-operations-ia-ui-cleanup.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260630-006` |
| Source | Codex chat attachment |
| Parse status | implemented_local_verified_deploy_blocked |
| Requirement register | `tasks-pending/2026-06-30-operations-ia-ui-cleanup.md` |
| UI audit report | `ops/ui-audits/2026-06-30-operations-ia-redesign.md` |
| UI audit JSON | `ops/ui-audits/2026-06-30-operations-ia-redesign.json` |
| Goal-mode requested | no |
| Deploy/live-smoke required for app-visible work | yes |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260630-301` | Register the Operations IA cleanup packet, raw source, requirement register, ledger, and audit files. | `RAW-20260630-006` | repo-wide | Codex | intake | P0 | A | none | Raw source, wrapper, register, audit placeholders, memory, TASKS, and ledger record exist before broad UI coding. | raw/register/audit/memory/TASKS/ledger | no | Done |
| `REQ-20260630-302` | Enforce one consistent navigation model: sidebar primary modules only; top nav subcategories only. | `RAW-20260630-006` | Operations, One Time, BNA, provider/admin/mobile | Codex | navigation | P0 | B | `REQ-20260630-301` | Sidebar renders allowed primary modules; top rail renders current module subcategories; Communications is not duplicated as a same-level top tab; module toolbar duplication removed. | `public/operations.html`, watchdog/tests | yes | Blocked on deploy/live smoke |
| `REQ-20260630-303` | Remove top toolbar clutter and relocate helper/search to bottom-right floating helper. | `RAW-20260630-006` | Operations UI | Codex | header_helper | P0 | B | `REQ-20260630-302` | Header has breadcrumb/title/current action only; workspace/role switch is in sidebar; Ask/Search absent from header; helper dock floats bottom-right and is compact on mobile. | `public/operations.html`, action registry/tests | yes | Blocked on deploy/live smoke |
| `REQ-20260630-304` | Add compact filter-row contract under the subcategory rail. | `RAW-20260630-006` | Tasks, Communications, Content/Materials, Contacts | Codex | filters | P0 | C | `REQ-20260630-302` | Filter rows show record filters only, 4-6 primary controls plus More filters; no module labels appear as filters; mobile avoids horizontal overflow. | `public/operations.html`, tests | yes | Blocked on deploy/live smoke |
| `REQ-20260630-305` | Clean Tasks page density, hierarchy, contrast, actions, and empty states. | `RAW-20260630-006` | Operations Tasks | Codex | tasks_ui | P0 | C | `REQ-20260630-304` | Task cards show type/title/summary/owner/status/due/project/source, one primary action, overflow/details actions; raw internal labels are default-hidden; empty states compact. | `public/operations.html`, tests | yes | Blocked on deploy/live smoke |
| `REQ-20260630-306` | Keep communications records in Communications, not Tasks, and clean communication cards. | `RAW-20260630-006` | Communications, Tasks, One Time | Codex | communications_ui | P0 | C | `REQ-20260630-304` | WhatsApp/email/contact/import/bot logs render as Communications; task cards show only actionable derived tasks; long URLs/raw JSON/script are not displayed in normal communication cards; repeated records are deduped/grouped. | `public/operations.html`, tests/read-model if needed | yes | Blocked on deploy/live smoke |
| `REQ-20260630-307` | Simplify page copy and hide Settings/Advanced/Danger Zone technical clutter from normal pages. | `RAW-20260630-006` | Operations Settings and module pages | Codex | copy_settings | P1 | D | `REQ-20260630-302` | Long instructional copy removed from normal page headers; Advanced/Danger Zone is under Settings > Advanced only and collapsed/default-hidden where appropriate. | `public/operations.html`, tests | yes | Blocked on deploy/live smoke |
| `REQ-20260630-308` | Verify navigation IA, responsive behavior, screenshots, and audit evidence. | `RAW-20260630-006` | Operations UI | Codex | verification | P0 | E | `REQ-20260630-302`-`307` | `npm run watchdog:navigation-ia`, `npm run watchdog:ui`, focused tests, browser screenshots at 390x844, 768x1024, 1440x900, audit MD/JSON, secrets audit, and diff checks run or blockers recorded. | tests/scripts/audit files | yes | Done locally |
| `REQ-20260630-309` | Push/deploy/live-smoke app-visible UI changes from a clean release target, or record exact blocker. | `RAW-20260630-006` | Railway production | Codex | deployment | P0 | F | `REQ-20260630-308` | App-visible work is committed, pushed, deployed, Railway doctor/live smokes pass, or blocker names owner and next action. | branch/deploy/live smoke evidence | yes | Blocked |

## Parsed task

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260630-006` | `operations-ia-ui-cleanup` | Repair Operations and One Time workspace information architecture. | Codex | repo-wide / Operations / One Time | `RAW-20260630-006` | `REQ-20260630-302` | Create/use clean release target, push, deploy, run Railway/live smokes, then close app-visible requirements. | Agent Work | blocked_needs_release |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260630-301` | Choose clean release/deployment path for this UI batch if the main workspace remains dirty. | Whether to deploy from current dirty workspace, create a clean release worktree/branch, or defer live release until current systems closeout is reconciled. | Codex + Shloimie if deploy conflicts with unrelated dirty work | Use a clean release branch/worktree carrying only the UI IA diff after local verification. | Defer deployment; deploy dirty workspace with all unrelated changes if explicitly approved. | Without clean push/deploy/live smoke, app-visible requirements remain partial even if local tests pass. | After local verification, create/use a clean release target, push, deploy, and run live smokes, or leave `REQ-20260630-309` blocked with this decision. | `REQ-20260630-309` | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit/push | Deployment/live-smoke |
|---|---|---|---|---|---|
| `REQ-20260630-302` | `public/operations.html` nav config/rendering | Sidebar primary modules; top subnav current-module children; remove module toolbar duplication. | PASS `npm run watchdog:navigation-ia`; PASS `npm test` 1218/1218; PASS local Playwright smoke `ops/playwright-smokes/2026-06-30-operations-ia-local/report.md`. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-303` | `public/operations.html`, `ops/action-registry.json` | Header simplification; floating helper dock; mobile compact helper button. | PASS navigation IA watchdog; PASS action watchdog `ops/watchdog-audits/2026-06-30T12-39-watchdog-action-audit.md`; screenshots show one floating helper and no topbar helper. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-304` | `public/operations.html` | Global current-view filter row for Tasks/Communications/Content/Contacts. | PASS local Playwright smoke at 390x844, 768x1024, and 1440x900 for Tasks, Communications, Contacts, and Content; no horizontal overflow. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-305` | `public/operations.html` | Reduce task status toolbar density; hide debug labels; compact empty states. | PASS operations shell contract test; PASS One Time Operations UI Playwright smoke; screenshot `ops/playwright-smokes/2026-06-30-operations-ia-local/desktop-1440-tasks-tasks.png`. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-306` | `public/operations.html` | Communication card preview sanitization, dedupe, channel filters; no raw long URLs. | PASS operations shell contract test; PASS local Playwright smoke; screenshot `ops/playwright-smokes/2026-06-30-operations-ia-local/desktop-1440-communications-overview.png`. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-307` | `public/operations.html` | Copy cleanup and Advanced/Danger placement. | PASS operations shell contract test; PASS local Playwright smoke; screenshot `ops/playwright-smokes/2026-06-30-operations-ia-local/desktop-1440-settings-advanced.png`. | pending clean release branch/commit | blocked by `DEC-20260630-301` |
| `REQ-20260630-308` | `scripts/watchdog-navigation-ia.mjs`, `tests/operations-shell-navigation-contract.test.js`, `tests/operations-saas-crm-redesign.test.js`, `tests/one-time-operations-ui-smoke.test.js`, `scripts/smoke-rabbi-scheller-operations-navigation-local.mjs`, audit files | Add static watchdog, contract tests, responsive local smoke, screenshots, and evidence artifacts. | PASS `node --check server.js`; PASS `node --check scripts/watchdog-navigation-ia.mjs`; PASS focused tests; PASS `npm test` 1218/1218; PASS `npm run watchdog:navigation-ia`; PASS local IA smoke; PASS `npm run watchdog:ui`; PASS `npm run watchdog:actions`; PASS `npm run secrets:audit`; PASS `git diff --check` with line-ending warnings only. | pending clean release branch/commit | local verification done; deploy still blocked |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260630-301` | Done | Raw/register/audit files created before coding. | `raw-input/RAW-20260630-006-operations-ia-ui-cleanup-source.txt`; `raw-input/RAW-20260630-006-operations-ia-ui-cleanup.md`; this register; `memory/2026-06-30.md`; `TASKS.md`; ledger record. | PASS active run status/next checked; raw source preserved. | none |
| `REQ-20260630-302` | Blocked on deploy/live smoke | Local shell now renders sidebar modules, selected-module subnav, and no app-shell module toolbar. | `public/operations.html`; `tests/operations-shell-navigation-contract.test.js`; `scripts/watchdog-navigation-ia.mjs`; `ops/watchdog-audits/2026-06-30T12-38-58-074Z-navigation-ia-watchdog.md`. | PASS watchdog/tests/local smoke/full `npm test`. | Push/deploy/live smoke missing. |
| `REQ-20260630-303` | Blocked on deploy/live smoke | Topbar/mobile header omit global clutter; helper is one floating launcher. | `public/operations.html`; `ops/action-registry.json`; `ops/action-registry/one-time-action-coverage.json`; `ops/action-registry/universal-action-parity.json`; action watchdog report. | PASS navigation IA watchdog; PASS `npm run watchdog:actions`; PASS watchdog-action registry tests. | Push/deploy/live smoke missing. |
| `REQ-20260630-304` | Blocked on deploy/live smoke | Current-view filters render for Tasks, Communications, Content, and Contacts. | `public/operations.html`; screenshots under `ops/playwright-smokes/2026-06-30-operations-ia-local/`. | PASS local Playwright smoke 24 checks. | Push/deploy/live smoke missing. |
| `REQ-20260630-305` | Blocked on deploy/live smoke | Task cards use simpler hierarchy, primary action plus overflow, compact empty state styling, and filtered communication-only logs. | `public/operations.html`; `tests/operations-shell-navigation-contract.test.js`. | PASS focused tests; PASS One Time smoke. | Push/deploy/live smoke missing. |
| `REQ-20260630-306` | Blocked on deploy/live smoke | Communications card previews are sanitized/deduped, attachments are chipped, and message lanes are in Communications. | `public/operations.html`; `tests/operations-shell-navigation-contract.test.js`. | PASS focused tests; PASS local smoke. | Push/deploy/live smoke missing. |
| `REQ-20260630-307` | Blocked on deploy/live smoke | Settings hides Danger Zone from normal child tabs and shows it collapsed under Advanced. | `public/operations.html`; screenshot `ops/playwright-smokes/2026-06-30-operations-ia-local/desktop-1440-settings-advanced.png`. | PASS focused tests; PASS local smoke. | Push/deploy/live smoke missing. |
| `REQ-20260630-308` | Done locally | Watchdog, focused tests, full `npm test`, local Playwright screenshots, UI/action watchdogs, secrets audit, and diff check completed. | `scripts/watchdog-navigation-ia.mjs`; `ops/playwright-smokes/2026-06-30-operations-ia-local/report.md`; `ops/ui-audits/2026-06-30-operations-ia-redesign.md`; `ops/ui-audits/2026-06-30-operations-ia-redesign.json`. | PASS all local checks listed above, including `npm test` 1218/1218. | Live deploy proof remains under `REQ-20260630-309`. |
| `REQ-20260630-309` | Blocked | No clean release/push/deploy/live-smoke performed from this mixed dirty workspace. | `DEC-20260630-301`; active run status shows unrelated blockers/worktree context. | PASS `npm run bna:run:status`; PASS `npm run bna:run:next` found no unblocked active-run batch. | Need clean release branch/worktree, push, Railway deploy, doctor, and live smoke. |
