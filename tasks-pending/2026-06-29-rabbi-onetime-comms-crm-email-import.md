# Rabbi OneTime Communications CRM Email Import - 2026-06-29

Source raw input: `RAW-20260629-004`

Execution run: `ops/execution-runs/2026-06-29-rabbi-onetime-comms-crm-email-import`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Goal mode: yes. Codex goal created for this packet.

## 2026-06-29 Combined Release Update

Original Communications/CRM/Email/WAPI/contact-import correction work is now
deployed and live-smoked from combined branch
`codex/rabbi-onetime-comms-scope-release-20260629` at commit `784b3f4a`.
Railway deployment `5b527404-bdf1-4df4-9b1d-7abf6536dafb` reached `SUCCESS`.

- Done now includes `REQ-20260629-102`, `REQ-20260629-103`,
  `REQ-20260629-106`, `REQ-20260629-107`, and `REQ-20260629-108`.
- Still blocked: Resend production sending/receiving closeout
  `REQ-20260629-110` through `REQ-20260629-116`, because live status reports
  `RESEND_FROM_EMAIL` and `RESEND_WEBHOOK_SECRET` missing and the invalid Svix
  inbound probe returns HTTP `503` setup-blocker mode.
- Latest live smoke evidence:
  `ops/live-smokes/2026-06-29T15-38-06-388Z-email-resend-ux-live-smoke.md`,
  `ops/live-smokes/2026-06-29T15-38-06-396Z-whatsapp-ux-live-smoke.md`,
  `ops/live-smokes/2026-06-29T15-39-02-233Z-communications-screening-live-smoke.md`,
  `ops/live-smokes/2026-06-29T15-40-onetime-resend-status-live.md`, and
  `ops/live-smokes/2026-06-29T15-40-resend-inbound-invalid-signature-blocker-live.md`.

## 2026-06-29 Earlier Update

Local implementation, contact import, and required verification are complete.
This earlier blocker was resolved by the combined release branch deployment
above.

- Done: `REQ-20260629-101`, `REQ-20260629-102`, `REQ-20260629-103`,
  `REQ-20260629-104`, `REQ-20260629-105`, `REQ-20260629-106`,
  `REQ-20260629-107`, `REQ-20260629-108`, `REQ-20260629-109`,
  `REQ-20260629-117`.
- Blocked: `REQ-20260629-110` through `REQ-20260629-116`.
- Applied contact import evidence:
  `ops/imports/2026-06-29-one-time-launch-contacts-import-applied.md`.
- Redacted DB readback evidence:
  `ops/imports/2026-06-29-one-time-launch-contacts-readback.md`.
- Safe fixture browser evidence:
  `ops/playwright-smokes/2026-06-29-rabbi-onetime-communications-layout-local/report.md`.

## Prior Evidence To Reuse

- `RAW-20260628-005` / `REQ-20260628-013` through `REQ-20260628-023`
  already completed One Time safe-mode contact inventory/import-preview,
  no-send email readiness, Resend DNS handoff, overlap audit, deployment, and
  live smokes.
- Current packet is a new correction because the production Communications
  route is still visually broken and Shloimie explicitly asked for the latest
  Downloads contact import and scope separation to be checked again.

## Requirement Register

| ID | Packet ID | Requirement | Owner | Status | Acceptance / Evidence Target | Evidence |
|---|---|---|---|---|---|---|
| `REQ-20260629-101` | `BNA_GOAL_MODE_EXECUTION_PACKET` | Register the raw packet, requirement register, active run, and source mapping before implementation. | Codex | Done | Raw source preserved; dated register created; active execution run selected; existing active run has no unblocked batch. | `raw-input/RAW-20260629-004-rabbi-onetime-comms-crm-email-import.md`; `raw-input/RAW-20260629-004-rabbi-onetime-comms-crm-email-import-source.txt`; this register; `ops/execution-runs/2026-06-29-rabbi-onetime-comms-crm-email-import/requirements.json`; `npm run bna:run:status`; `npm run bna:run:next`; `npm run bna:run:blockers`. |
| `REQ-20260629-102` | `REQ-ONETIME-COMMS-001`, `REQ-ONETIME-UI-007` | Repair the Rabbi / One Time Communications overview layout and top channel rail. | Codex | Done | Channel tabs move to the primary top rail, duplicate side count cards are removed, import logs are demoted to history/audit, New Message is gated/demoted, and layout works at 1440/1024/768/430/390/360. | Combined branch `784b3f4a` deployed; live Email/WhatsApp/communications smokes passed. |
| `REQ-20260629-103` | `REQ-ONETIME-COMMS-002` | Repair CRM, contacts, email audience, communications, and related data scope separation. | Codex | Done | One Time views only show `rabbi_sheller_provider` / `one_time_mishnah_class`; BNA contacts/WAPI/email/notes do not leak into One Time; global audit remains visibly scoped. | Combined branch deployed; communications/import/WAPI live smoke passed. |
| `REQ-20260629-104` | `REQ-ONETIME-CONTACTS-003` | Re-inventory recent Windows Downloads spreadsheets with privacy-safe metadata. | Codex | Done | `npm run inventory:downloads-spreadsheets` runs against Downloads; new files from last 10 days are detected; no raw rows, raw private headers, names, emails, or phones are committed. | `ops/imports/2026-06-28-downloads-spreadsheet-inventory.json`. |
| `REQ-20260629-105` | `REQ-ONETIME-CONTACTS-004` | Safely import or stage Rabbi Sheller contacts from Downloads after dry-run and dedupe. | Codex | Done | Import only safe Rabbi/One Time files; dedupe by email then phone; apply required scoped tags; keep `no_send`; never send or write to external CRM; produce post-import/no-send/isolation reports. | Applied import report and redacted DB readback passed: 1520 scoped rows, all no-send, 0 BNA project matches. |
| `REQ-20260629-106` | `REQ-ONETIME-EMAIL-005` | Repair Email section structure, audience filters, and Resend readiness display without sending. | Codex | Done | Email tab is scoped, tag-filterable, and preview-only; Resend readiness shows domain/from/reply-to/DNS/send blocker; no bulk or test email send. | Live Email UX smoke passed; real Resend sending remains blocked under `REQ-20260629-110`. |
| `REQ-20260629-107` | `REQ-ONETIME-WAPI-006` | Separate WhatsApp/WAPI from Email and BNA data for the Rabbi workspace. | Codex | Done | Rabbi WhatsApp phonebook/report is scoped; BNA WAPI records do not appear; email imports do not become WhatsApp messages; `npm run wapi:phonebook-report` passes or blocks precisely. | Live WhatsApp UX smoke passed with raw payloads hidden and no external send. |
| `REQ-20260629-108` | `REQUIRED_VERIFICATION` | Run required local checks, browser/visual checks, deployment/live-smoke where applicable, and closeout records. | Codex | Done | Required scripts pass or exact blockers are recorded; app-visible changes have deploy/live-smoke proof before Done; ledger/changelog/register final audit are updated. | Combined branch pushed/deployed; live Email, WhatsApp, and communications/import smokes passed. |

## Canonical Agent Task

| ID | Canonical Key | Title | Owner | Workspace/project | Source | Requirement | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| `TASK-20260629-004` | `rabbi-onetime-comms-crm-email-import` | Execute Rabbi OneTime Communications, CRM, Email, WAPI, and contact-import correction packet. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260629-004` | `REQ-20260629-101` | agent_activity | running |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| `DEC-20260629-101` | Keep external send/DNS/campaign/account actions blocked. | Verified Resend DNS records, approved test recipient, explicit send phrase, any DNS/account mutation approval. | Shloimie / Resend account owner / DNS account owner | Keep this packet no-send and preview-only; approve only exact external actions later. | Approve DNS records only; approve a single test send later; defer email launch. | Without explicit approval, Codex can repair UI/import/readiness but cannot send, mutate DNS, or launch campaigns. | Provide exact account/domain/action/recipient/confirmation phrase and rollback expectation. | External sends and DNS only; implementation stays executable. | Needs operator decision |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Deployment/live-smoke |
|---|---|---|---|---|
| `REQ-20260629-102` | `public/operations.html`, `server.js`, communications smokes/tests | Inspect current Communications render, move channel rail, remove duplicate side cards, demote gated sends/import logs. | Browser screenshots and communications smoke. | Required if app-visible code changes. |
| `REQ-20260629-103` | `server.js`, `src/lib/*`, import/contact scripts, Operations UI | Audit workspace/project filters across CRM, contacts, email audience, communications, WAPI, templates, notes, and support. | Scope tests and smokes. | Required if server/UI behavior changes. |
| `REQ-20260629-104` | `scripts/inventory-downloads-spreadsheets.mjs`, `ops/imports/*` | Run inventory, update script only if new recent files are missed. | `npm run inventory:downloads-spreadsheets`. | Not required. |
| `REQ-20260629-105` | `scripts/import-one-time-launch-contacts.mjs`, first-party import/readback paths | Dry-run, verify safe files, apply only first-party scoped no-send import if credentials and guard are available. | Import report, dedupe audit, no-send audit, workspace isolation audit. | Live/readback required if production/server-visible data changes. |
| `REQ-20260629-106` | `public/operations.html`, `server.js`, `src/lib/bna/one-time-launch-readiness.js` | Keep email tab clean, scoped, filterable, and gated; show Resend readiness and blockers. | Email smoke and no-send proof. | Required if app-visible code changes. |
| `REQ-20260629-107` | `src/lib/bna/wapi-phonebook-report.js`, WAPI UI/API | Recheck WAPI phonebook/report and channel separation. | `npm run wapi:phonebook-report`, WhatsApp smoke/watchdog. | Required if app-visible/server behavior changes. |
| `REQ-20260629-108` | run docs, ledger, changelog, smokes | Run required verification and update final audit. | `npm run bna:run:validate`, watchdogs, secrets audit, deploy/live smoke or blocker. | Required for closed app-visible requirements. |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| `REQ-20260629-101` | Done | Raw/register/run paths above. | Raw/register/run metadata, TASKS, memory, ledger. | `npm run bna:run:status`, `npm run bna:run:next`, `npm run bna:run:blockers`; validation pending after register fill. | Implementation requirements still open. |
| `REQ-20260629-102` | Done | Local UI patch; fixture screenshots/report; combined release live smokes. | `public/operations.html`, tests. | Focused tests; fixture browser smoke 54/54; live Email/WhatsApp/communications smokes. | None for this packet. |
| `REQ-20260629-103` | Done | WAPI scope patch; import readback; fixture request audit; live communications/WAPI smoke. | `server.js`, `public/operations.html`, `src/lib/bna/wapi-phonebook-report.js`. | Scope tests; redacted DB readback; browser request audit; live communications/import smoke. | None for this packet. |
| `REQ-20260629-104` | Done | Downloads inventory JSON. | Inventory output only. | `npm run inventory:downloads-spreadsheets`. | None. |
| `REQ-20260629-105` | Done | Applied import report and readback MD/JSON. | `scripts/import-one-time-launch-contacts.mjs`; import evidence. | Import smoke, guarded apply, redacted DB readback, CRM contacts UX smoke. | Future sends/campaigns remain decision-gated. |
| `REQ-20260629-106` | Done | Email readiness smoke, fixture readiness panel, live Email UX smoke. | `public/operations.html`; email smoke script. | `npm run app:smoke:email-resend-ux` live passed. | Real Resend production sending remains blocked under `REQ-20260629-110`. |
| `REQ-20260629-107` | Done | Scoped WAPI report and live WhatsApp smoke. | WAPI report lib/script, Operations client, package script. | `npm run app:smoke:whatsapp-ux` live passed; WAPI test suite. | None for this packet. |
| `REQ-20260629-108` | Done | Run docs, watchdogs, secrets audit, fixture browser report, deployment and live smokes. | Run docs, ledger/changelog. | Focused tests, push, Railway deploy, live Email/WhatsApp/communications smokes. | Resend receiving blockers remain under `REQ-20260629-110` through `REQ-20260629-116`. |
