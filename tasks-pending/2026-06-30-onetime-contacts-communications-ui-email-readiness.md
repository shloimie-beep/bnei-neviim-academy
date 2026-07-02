# Ramble Intake - 2026-06-30 - One Time Contacts Communications UI Email Readiness

## Raw intake

Raw source is preserved at
`raw-input/RAW-20260630-003-onetime-contacts-communications-ui-email-readiness.md`.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260630-003` |
| Source | `codex_chat` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-06-30-onetime-contacts-communications-ui-email-readiness.md` |
| Related run | `ops/execution-runs/2026-06-29-rabbi-onetime-comms-crm-email-import` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Goal tool used | no |
| Execution directive | Implement the approved no-send Contacts/Communications/email-readiness plan. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260630-006` through `REQ-20260630-009` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260630-005` | Register the June 30 One Time contacts/email UI request with source provenance. | `RAW-20260630-003` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | intake | P0 | intake | none | Raw file and register exist; no raw contact rows/secrets committed. | raw/register files | no | Done |
| `REQ-20260630-006` | Add privacy-safe aggregate One Time contact readiness data. | `RAW-20260630-003` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | api | P0 | implementation | `REQ-20260630-005` | Endpoint returns counts by segment/status/batch/no-send/leak check and no names/emails/phones. | `server.js`, tests | yes | Blocked - deploy/live smoke pending |
| `REQ-20260630-007` | Rework Rabbi/provider Contacts as the CRM hub. | `RAW-20260630-003` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | ui | P0 | implementation | `REQ-20260630-006` | Contacts nav/tabs show All Contacts, Warm Leads, Active Members, Parents, Students, Email Audience, Needs Review, Suppressed/No-send, Activity; uploaded contacts have readable chips. | `public/operations.html`, tests | yes | Blocked - deploy/live smoke pending |
| `REQ-20260630-008` | Demote noisy readiness/not-configured rectangles from working views. | `RAW-20260630-003` | Rabbi workspace and Super Admin where shared views apply | Codex | ui | P1 | implementation | `REQ-20260630-007` | Actual lists/filter controls appear before readiness panels; diagnostics/setup is collapsible or in Settings; empty non-clickable panels are not prominent. | `public/operations.html`, tests | yes | Blocked - deploy/live smoke pending |
| `REQ-20260630-009` | Verify and record closeout. | `RAW-20260630-003` | `rabbi_sheller_provider` / `one_time_mishnah_class` | Codex | verification | P0 | verification | `REQ-20260630-006`-`008` | Focused tests/smokes run or blockers recorded; ledger/changelog updated; deploy/live-smoke blocker recorded if not run. | tests, ledger/changelog | yes | Done |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260630-003` | `onetime-contacts-communications-ui-email-readiness` | Implement One Time Contacts/Communications UI and email readiness cleanup. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260630-003` | `REQ-20260630-006` | Deploy from a clean release target and run live Operations/API smokes. | agent_activity | local_verified_deploy_blocked |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| `DEC-20260629-101` | Keep external send/DNS/campaign/account actions blocked. | Verified Resend DNS/webhook, approved test recipient, approved copy, explicit send phrase, unsubscribe and sender-address policy. | Shloimie / account owner | Keep this batch no-send and UI/readiness only. | Approve a single test later; approve DNS only later; defer campaign launch. | Contacts/UI can be repaired, but no real send occurs. | Provide exact action/recipient/domain/confirmation phrase and rollback expectation. | Actual sends, DNS, account mutations. | Needs operator decision |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260630-006` | `server.js`, `ops/route-registry.json`, focused tests | Added `/api/bna/one-time/contact-readiness` aggregate endpoint with no private values and registered route. | `node --check server.js`; focused tests; `npm run watchdog:security`. | not committed | not pushed | blocked - no clean deploy target used in this turn |
| `REQ-20260630-007` | `public/operations.html`, focused tests | Renamed/simplified provider Contacts, added segment tabs, aggregate counts, contact rows, and type/status chips. | Static contract tests; One Time Operations browser smoke with Contacts click. | not committed | not pushed | blocked - no clean deploy target used in this turn |
| `REQ-20260630-008` | `public/operations.html`, `ops/action-registry.json`, generated action coverage | Collapsed Communications readiness/screening/import tools, replaced settings not-configured panel with Settings shortcut, and made empty metric buttons static info cards. | Static tests; `npm run watchdog:actions`; generated action coverage/parity reports. | not committed | not pushed | blocked - no clean deploy target used in this turn |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260630-005` | Done | Raw file renamed to `RAW-20260630-003` to avoid collision with existing `RAW-20260630-002`; this register links the raw source. | `raw-input/RAW-20260630-003-onetime-contacts-communications-ui-email-readiness.md`, this register, `memory/2026-06-30.md` | `rg` confirmed no contacts-intake references to duplicate `RAW-20260630-002` / `TASK-20260630-002`. | none |
| `REQ-20260630-006` | Blocked - deploy/live smoke pending | Local aggregate endpoint exists and is route-registered; response contract is aggregate/no-private-values. | `server.js`, `ops/route-registry.json`, `tests/one-time-communications-workspace.test.js`, `tests/rabbi-scheller-auth-navigation-contract.test.js` | PASS `node --check server.js`; PASS focused 74-test sweep; PASS `npm run watchdog:security`. | Needs deploy from clean release target and live authenticated API smoke. |
| `REQ-20260630-007` | Blocked - deploy/live smoke pending | Rabbi/provider workspace nav now says Contacts/Communications; Contacts tabs are All Contacts, Warm Leads, Active Members, Parents, Students, Email Audience, Needs Review, Suppressed/No-send, Activity; local browser smoke clicks Contacts. | `public/operations.html`, `tests/rabbi-scheller-auth-navigation-contract.test.js`, `tests/one-time-external-user-portal.test.js`, `tests/one-time-operations-ui-smoke.test.js` | PASS `node --test tests/one-time-operations-ui-smoke.test.js`; PASS `npm run app:smoke:one-time-crm-contacts-ux`. | Needs deploy from clean release target and live Operations Contacts smoke. |
| `REQ-20260630-008` | Blocked - deploy/live smoke pending | Communications overview now keeps diagnostics/import/readiness inside collapsed details; settings/templates show Settings shortcut; no empty metric button remains clickable. | `public/operations.html`, `ops/action-registry.json`, `ops/action-registry/one-time-action-coverage.*`, `ops/action-registry/universal-action-parity.*`, `ops/watchdog-audits/2026-06-30T06-17-watchdog-action-audit.md` | PASS `npm run watchdog:actions`; PASS focused 74-test sweep; PASS communications import/screening tests. | Needs deploy from clean release target and live Operations Communications smoke. |
| `REQ-20260630-009` | Done | Verification and closeout recorded; external send/DNS/campaign actions remain blocked by `DEC-20260629-101`; deploy/live smoke blocker explicit. | this register, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md` | PASS all local verification listed above; PASS `npm run app:smoke:email-resend-ux` with `email_send_performed=false`. | Deployment/live smoke still required before app-visible requirements can be marked Done. |
