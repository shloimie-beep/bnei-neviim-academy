# One Time CRM Mailbox Goal

Raw ID: `RAW-20260706-909`

Created: 2026-07-06 Asia/Jerusalem

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Goal: Build a real One Time CRM mailbox for `info@onetimeonetime.com` so Rabbi
can log in, see received emails, read threads, draft/reply through the approved
sender path when configured, and keep the communication history attached to
scoped One Time contacts.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | `RAW-20260706-909` |
| Source | `codex_chat` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-06-onetime-crm-mailbox-goal.md` |
| PQC packet | `ops/prompt-packets/2026-07-06-onetime-crm-mailbox/00-mailbox-mvp.product-quality.json` |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Build Rabbi / One Time CRM inbox MVP for `info@onetimeonetime.com` |
| Goal tool used | yes |
| Execution directive | Register first, validate Product Quality packet, then implement the scoped mailbox MVP. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | `REQ-20260706-940` through `REQ-20260706-946` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `REQ-20260706-940` | Product Quality compile the One Time mailbox MVP. | `SRC-20260706-909-001` through `SRC-20260706-909-006` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | product_quality | P0 | B0 | none | PQC packet validates, names route/API/state/action/privacy/deploy gates, and scopes external sends. | `ops/prompt-packets/2026-07-06-onetime-crm-mailbox/00-mailbox-mvp.product-quality.json` | no | Done |
| `REQ-20260706-941` | Add provider-scoped mailbox read API for inbound/outbound One Time email threads. | `SRC-20260706-909-001`, `SRC-20260706-909-002` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | backend | P0 | B1 | `REQ-20260706-940` | Rabbi/provider session can list mailbox threads and open a thread without unrelated workspace data. | `server.js`; `tests/provider-mailbox-portal.test.js` | yes | Local verified; deploy/live blocked |
| `REQ-20260706-942` | Add provider portal mailbox UI with inbox list, thread detail, contact metadata, readiness, and empty/error states. | `SRC-20260706-909-002`, `SRC-20260706-909-004` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | frontend | P0 | B1 | `REQ-20260706-941` | Provider portal exposes a polished Mailbox section, readable on desktop/mobile, with loading/empty/populated/error/readiness states. | `public/provider.html`; inline scoped CSS | yes | Local verified; deploy/live blocked |
| `REQ-20260706-943` | Add reply draft and guarded send flow for mailbox threads. | `SRC-20260706-909-003` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | communications_email | P0 | B2 | `REQ-20260706-941`; Resend readiness | Draft save is local/no-send; send requires explicit confirmation and readiness, logs outbound message into thread. | `server.js`; `public/provider.html`; `tests/provider-mailbox-portal.test.js` | yes | Local verified; live send readiness blocked |
| `REQ-20260706-944` | Add sender/compliance readiness without committing the physical mailing address. | `SRC-20260706-909-003`, `SRC-20260706-909-006` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | provider_setup | P0 | B2 | none | UI/API reports configured/missing sender, reply-to, inbound webhook, and mailing-address config; exact address remains runtime-only. | `server.js`; runtime env/keyholder `ONE_TIME_MAILING_ADDRESS` | yes | Local verified; runtime config blocked |
| `REQ-20260706-945` | Update route/action registries and tests for all visible mailbox actions. | `SRC-20260706-909-004` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | registry_tests | P0 | B3 | UI/API implementation | Every visible action has registry coverage; focused tests pass. | `ops/action-registry.json`; `ops/route-registry.json`; `tests/provider-mailbox-portal.test.js` | yes | Done |
| `REQ-20260706-946` | Verify, record evidence, and leave deploy/live-smoke status. | `SRC-20260706-909-004` | `rabbi_sheller_provider / one_time_mishnah_class` | Codex | verification_closeout | P0 | B4 | implementation | PQC validation, focused backend/frontend tests, watchdogs, screenshot/browser smoke where feasible, ledger/changelog updates, and deploy/live blocker or proof recorded. | evidence, ledger, changelog, register | yes | Blocked for publish/deploy/live proof |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260706-940` | onetime-crm-mailbox-mvp | Build One Time CRM mailbox MVP | Codex | `rabbi_sheller_provider / one_time_mishnah_class` | `RAW-20260706-909` | `REQ-20260706-940` through `REQ-20260706-946` | Publish/deploy/live smoke after scoped branch/worktree is safe and Resend runtime env is confirmed. | Agent Work | Local verified; blocked for production proof |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-20260706-940` | Store One Time physical mailing address as runtime config, not tracked source. | Exact configured runtime value and target environment. | Shloimie / deployment owner | Set `ONE_TIME_MAILING_ADDRESS` in the keyholder/Railway environment. | Use Google/Workspace footer only; keep CRM footer hidden until configured. | Campaign/commercial footer cannot show the address from code until runtime config is set. | Add the approved address to server-side env/keyholder; do not commit it. | `REQ-20260706-944`; bulk campaign follow-up | Needs operator/deploy setup |
| `DEC-20260706-941` | Bulk broadcast sending is a later guarded packet. | Exact list, suppression/unsubscribe readiness, copy, sender, seed proof, and confirmation. | Shloimie / Rabbi | Use Resend Broadcasts or a guarded CRM campaign packet after mailbox MVP. | Manual Gmail/Workspace list send; no broadcast. | Mailbox can launch first; bulk send remains blocked until compliance and approval are explicit. | Create a separate campaign packet after inbox is usable. | Bulk emails only; not the inbox MVP | Blocked follow-up |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| `Q-20260706-940` | Is `RESEND_WEBHOOK_SECRET` already installed in production for `/api/resend/inbound`? | Determines whether live inbound capture is currently active or only code-ready. | Blocks live proof, not local implementation. | Open |
| `Q-20260706-941` | Should Rabbi be allowed to send replies directly, or should replies require Shloimie approval at first? | Controls send confirmation/permission copy. | No; default is guarded direct send only when explicit confirmation and readiness pass. | Open |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| `REQ-20260706-941` | `/api/provider-portal/mailbox`, `/api/provider-portal/mailbox/:threadKey`, `/api/provider-portal/mailbox/:threadKey/draft`, `/api/provider-portal/mailbox/:threadKey/send` | Reuse `bna_communications` Resend inbound/outbound thread model. | PASS `node --check server.js`; PASS `node --test tests/provider-mailbox-portal.test.js`; PASS WAPI regression bundle. | clean publication branch prepared; commit pending | pending push | required; not run |
| `REQ-20260706-942` | `public/provider.html` Mailbox section | Add polished mailbox tab/list/detail/reply composer/readiness card. | PASS inline script parse; PASS action watchdog finding_count=0. | clean publication branch prepared; commit pending | pending push | required; not run |
| `REQ-20260706-943` | `/draft`, `/send`, composer controls | Save local draft rows; send via Resend only after readiness and `SEND_RESEND_EMAIL`. | PASS `tests/provider-mailbox-portal.test.js`; no external send performed. | clean publication branch prepared; commit pending | pending push | required; not run |
| `REQ-20260706-944` | readiness payload | Runtime-only `ONE_TIME_MAILING_ADDRESS` boolean; no tracked address text. | PASS static test; no physical address committed. | clean publication branch prepared; commit pending | pending push | target env required |
| `REQ-20260706-945` | route/action registries | Add four API routes and four visible actions. | PASS `npm run watchdog:actions`; PASS JSON parse via tests. | clean publication branch prepared; commit pending | pending push | required; not run |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260706-940` | Done | PQC validation PASS, latest report `ops/product-quality-compiler/validation/latest-product-quality-validation.md`. | `ops/prompt-packets/2026-07-06-onetime-crm-mailbox/00-mailbox-mvp.product-quality.json` | `npm run pqc:validate -- ops\prompt-packets\2026-07-06-onetime-crm-mailbox\00-mailbox-mvp.product-quality.json` | none |
| `REQ-20260706-941` | Local verified; deploy/live blocked | Provider mailbox APIs added and static contract passed. | `server.js`; `tests/provider-mailbox-portal.test.js` | `node --check server.js`; `node --test tests\provider-mailbox-portal.test.js` | clean publication branch is ready; commit/push/PR/deploy/live smoke still required; live DB/Resend readback not run |
| `REQ-20260706-942` | Local verified; deploy/live blocked | Mailbox section added to provider portal with search, thread list, timeline, readiness, composer, and mobile constraints. | `public/provider.html` | inline script parse; action watchdog | browser/live smoke not run |
| `REQ-20260706-943` | Local verified; live send readiness blocked | Draft endpoint logs no-send CRM rows; send endpoint requires Resend readiness and exact `SEND_RESEND_EMAIL`, then logs sent row/audit. | `server.js`; `public/provider.html`; `tests/provider-mailbox-portal.test.js` | focused mailbox test and WAPI regression bundle PASS | no external send performed; production Resend readiness not proven |
| `REQ-20260706-944` | Local verified; runtime config blocked | Readiness reports webhook, sender, reply-to, and `ONE_TIME_MAILING_ADDRESS` configured/missing as boolean only. | `server.js` | focused mailbox test PASS | deployment owner must set runtime `ONE_TIME_MAILING_ADDRESS`; exact address not committed |
| `REQ-20260706-945` | Done | Route/action registry entries added; action watchdog reports zero findings. | `ops/action-registry.json`; `ops/route-registry.json`; `tests/provider-mailbox-portal.test.js` | `npm run watchdog:actions`; combined provider mailbox/WAPI tests PASS | none |
| `REQ-20260706-946` | Blocked for publish/deploy/live proof | Local mailbox verification passed; global protocol drift watchdog failed on unrelated full-UI audit prompt-series artifacts already on current `origin/master`. | register, watchdog/PQC reports, tests | PASS `node --test tests\provider-wapi-setup-portal.test.js tests\provider-mailbox-portal.test.js`; FAIL `npm run watchdog:protocol-drift` due existing `ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/*` drift findings, not the mailbox PQC packet | commit/push/PR/deploy/live smoke still required; global drift blocker belongs to the existing prompt-series packet |
