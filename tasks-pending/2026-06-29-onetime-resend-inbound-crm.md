# OneTimeOneTime Resend Inbound CRM Wiring - 2026-06-29

Source raw input: `RAW-20260629-005`

Execution run: `ops/execution-runs/2026-06-29-rabbi-onetime-comms-crm-email-import`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Goal mode: yes. Codex goal is active for the Resend send/receive packet.

## 2026-06-29 Combined Release Update

The Resend inbound CRM code is now included in the deployed combined Operations
release branch `codex/rabbi-onetime-comms-scope-release-20260629` at commit
`784b3f4a`. Railway deployment `5b527404-bdf1-4df4-9b1d-7abf6536dafb`
reached `SUCCESS`.

Live no-send/UI smokes passed:

- `ops/live-smokes/2026-06-29T15-38-06-388Z-email-resend-ux-live-smoke.md`
- `ops/live-smokes/2026-06-29T15-38-06-396Z-whatsapp-ux-live-smoke.md`
- `ops/live-smokes/2026-06-29T15-39-02-233Z-communications-screening-live-smoke.md`

Remaining blocker is live Resend setup: `RESEND_FROM_EMAIL` and
`RESEND_WEBHOOK_SECRET` are not configured on the live status endpoint, and an
invalid Svix POST to `/api/resend/inbound` returns HTTP `503` setup-blocker
mode. Invalid-signature `401`, signed `email.received` fetch, and redacted CRM
row readback still need operator-owned Resend/Railway configuration.

## Requirement Register

| ID | Requirement | Owner | Status | Acceptance / Evidence Target |
|---|---|---|---|---|
| `REQ-20260629-109` | Register this Resend packet as raw input, source mapping, requirement rows, and a canonical agent task. | Codex | Done | `RAW-20260629-005` exists, this register exists, active run validates, and the first unblocked Resend batch is selectable. |
| `REQ-20260629-110` | Ensure OneTimeOneTime outbound Resend config resolves to the approved sender identity without sending email. | Codex | Blocked | Code/docs/tests/live no-send smokes prove `OneTimeOneTime Mishnah <info@onetimeonetime.com>` and reply-to `info@onetimeonetime.com`; final Done is blocked because live status reports `email_provider=gmail`, `resend_configured=false`, and missing `RESEND_FROM_EMAIL`. |
| `REQ-20260629-111` | Add a public Resend inbound endpoint at `/api/resend/inbound` with raw-body Svix signature verification. | Codex | Blocked | Endpoint is deployed and local tests prove invalid signatures return 401, but live invalid-signature proof is blocked because `RESEND_WEBHOOK_SECRET` is not configured and the route returns a safe 503 setup blocker. |
| `REQ-20260629-112` | Fetch full received email content from Resend and store inbound mail idempotently. | Codex | Blocked | Local implementation and mocked tests are complete; live Resend Received Email API fetch requires server-side `RESEND_WEBHOOK_SECRET` plus a signed `email.received` replay. |
| `REQ-20260629-113` | Route inbound mail to the One Time CRM/contact/conversation scope. | Codex | Blocked | Local routing/contact tests are complete; live CRM readback needs a signed inbound test/replay. |
| `REQ-20260629-114` | Make inbound messages visible in Operations/CRM and document the route. | Codex | Blocked | `bna_communications` storage and Operations merge markers are deployed; live Operations CRM row proof needs one signed inbound test/replay. |
| `REQ-20260629-115` | Add safe tests/smokes for Resend inbound and no-send outbound behavior. | Codex | Blocked | Local tests and live no-send/UI smokes pass; final inbound live coverage waits on `RESEND_WEBHOOK_SECRET` and a signed `email.received` replay. |
| `REQ-20260629-116` | Update operator docs/env placeholders and record final evidence/blockers. | Codex | Blocked | Docs/run evidence include DNS/current state, webhook URL, Railway vars, Resend dashboard steps, no Zoho mailbox note, CRM routing behavior, tests, live smokes, and value-free blocker checks. Final Done waits on `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, webhook setup, and signed live readback proof. |

## Guardrails

- Do not send real email, bulk email, or test email without explicit operator approval and recipient.
- Do not change DNS, nameservers, public website routing, Replit/root/www records, or Zoho records.
- Do not print, commit, echo, screenshot, or log secret values.
- Do not use `bneineviimacademy.org` as the OneTimeOneTime sender.
- Store private email bodies only in the database/runtime, not tracked evidence files.

## Implementation Map

| ID | Files/routes/components | Verification |
|---|---|---|
| `REQ-20260629-110` | `.env.example`, `server.js`, `src/lib/integrations/resend-client.js`, existing email smokes | `npm run app:smoke:email-resend-ux`, focused Resend tests |
| `REQ-20260629-111` | `server.js`, `src/lib/integrations/resend-client.js`, `ops/route-registry.json` | invalid signature and ignored-event tests |
| `REQ-20260629-112` | `server.js`, `src/lib/integrations/resend-client.js`, `src/lib/integrations/resend-inbound-crm.js`, `bna_communications` indexes/metadata | fetch and dedupe tests |
| `REQ-20260629-113` | `server.js`, `src/lib/integrations/resend-inbound-crm.js` | scoped routing/contact tests |
| `REQ-20260629-114` | `server.js`, `src/lib/integrations/resend-inbound-crm.js`, `public/operations.html`, existing Operations communications API/UI, docs | local API/UI contract tests or documented route proof |
| `REQ-20260629-115` | `tests/resend-client.test.js`, `tests/resend-inbound-crm.test.js`, `tests/resend-inbound-webhook.test.js`, `tests/communications-screening-import-ui.test.js`, `tests/assistant-portal-communications-contract.test.js`, existing no-send smokes | `node --test ...`; no external send |
| `REQ-20260629-116` | `docs/integrations/RESEND.md`, `docs/operator-walkthroughs/integrations/resend-email.md`, `.env.example`, run docs, ledger/changelog | `npm run bna:run:validate`; env names only |

## Decisions / Blockers

Reuses `DEC-20260629-101`: all real sends, DNS/account changes, and external
provider mutations remain blocked until Shloimie gives the exact action,
recipient/account/domain if relevant, confirmation phrase, and rollback
expectation.

Clean release proof:

- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/52`
- Branch: `codex/onetime-resend-inbound-crm-release-20260629`
- Current head: `e28cb72da1106cb8f6705bcde883bfd8acfcf1f0`
- Included commits:
  `1997751c2a28a466d90d9d35bd74717c3bb17d29`,
  `8db33f13ef2d32a58239602383b4f47a4ae0b095`,
  `e28cb72da1106cb8f6705bcde883bfd8acfcf1f0`
- Clean worktree: `C:\Users\User\BNA-resend-inbound-release`
- Combined deployed branch: `codex/rabbi-onetime-comms-scope-release-20260629`
- Combined deployed commit: `784b3f4a`
- Combined Railway deployment: `5b527404-bdf1-4df4-9b1d-7abf6536dafb`

Current deploy / live blocker:

- Railway service `skillful-motivation` / production deployment
  `5b527404-bdf1-4df4-9b1d-7abf6536dafb` reached `SUCCESS`, and live
  no-send/UI smokes passed from the combined branch.
- Final Done still needs value-free `RESEND_FROM_EMAIL` and
  `RESEND_WEBHOOK_SECRET` setup/proof, a Resend `email.received` webhook, and
  approved signed live inbound CRM readback.
- Value-free local keyholder check on 2026-06-29 found
  `.secrets/resend-api-key.txt` and `BNA-Keyholder/resend-api-key.txt`, but no
  file/key name for `RESEND_WEBHOOK_SECRET`; the archived One Time Resend env
  source did not contain `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, or
  `RESEND_API_KEY` keys by name.

Potential expected blockers:

- `RESEND_API_KEY` missing in Railway blocks live fetch/send readiness.
- `RESEND_WEBHOOK_SECRET` missing in Railway blocks verified live webhook use.
- Receiving MX propagation may remain pending externally even after app code is
  ready.
- App-visible/server-visible deploy/live smoke for the combined branch is
  complete; only signed live Resend receiving proof remains blocked.

## Final Audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| `REQ-20260629-109` | Done | Raw/register/run/source mapping exists under `RAW-20260629-005`, this register, and the active run. | `npm run bna:run:status`; `npm run bna:run:next`; `npm run bna:run:source-coverage`. | None. |
| `REQ-20260629-110` | Blocked | `.env.example`; `docs/integrations/RESEND.md`; `server.js`; `src/lib/integrations/resend-client.js`; `scripts/smoke-email-resend-ux.mjs`; `tests/resend-client.test.js`; live status report. | PASS syntax checks; PASS Resend/One Time tests; PASS live no-send smoke; PASS live OneTime sender identity. | Live `/api/bna/resend/status` still reports `resend_configured=false` and missing `RESEND_FROM_EMAIL`. |
| `REQ-20260629-111` | Blocked | `server.js`; `src/lib/integrations/resend-client.js`; `ops/route-registry.json`; `tests/resend-client.test.js`; `tests/assistant-portal-communications-contract.test.js`; `tests/resend-inbound-webhook.test.js`; PR #52; live status report. | PASS main focused suite 28/28; PASS clean release suite 34/34 at `e28cb72d`; PASS route security watchdog; PASS live route returns safe setup blocker. | Needs Railway `RESEND_WEBHOOK_SECRET`, Resend webhook setup, invalid-signature 401 proof, and signed live webhook smoke. |
| `REQ-20260629-112` | Blocked | `server.js`; `src/lib/integrations/resend-client.js`; `src/lib/integrations/resend-inbound-crm.js`; `tests/resend-client.test.js`; `tests/resend-inbound-crm.test.js`; PR #52. | PASS focused tests prove Received Email API fetch, body/header/attachment metadata mapping, and pre/post fetch dedupe. | Needs deployed code, server-side `RESEND_API_KEY`/`RESEND_WEBHOOK_SECRET`, and approved live inbound test/replay. |
| `REQ-20260629-113` | Blocked | `src/lib/integrations/resend-inbound-crm.js`; `server.js`; `tests/resend-inbound-crm.test.js`; PR #52. | PASS routing/contact tests for `info@onetimeonetime.com` and `@onetimeonetime.com` catch-all into `rabbi_sheller_provider` / `one_time_mishnah_class`. | Needs deployed live CRM readback from an approved inbound test/replay. |
| `REQ-20260629-114` | Blocked | `server.js`; `src/lib/integrations/resend-inbound-crm.js`; `public/operations.html`; `tests/communications-screening-import-ui.test.js`; existing Operations communications APIs; `docs/integrations/RESEND.md`; PR #52; live status report. | PASS local insert metadata excludes secret-like headers; PASS 28/28 focused inbound/UI bridge tests; PASS clean branch 34/34 Resend/inbound/UI suite at `e28cb72d`; PASS live Operations merge markers. | Needs live Operations CRM row proof after signed inbound test/replay. |
| `REQ-20260629-115` | Blocked | `tests/resend-client.test.js`; `tests/resend-inbound-crm.test.js`; `tests/resend-inbound-webhook.test.js`; `tests/communications-screening-import-ui.test.js`; `tests/assistant-portal-communications-contract.test.js`; no-send smokes; PR #52; live reports. | PASS main focused suite 28/28; PASS clean release suite 34/34; PASS live `npm run app:smoke:email-resend-ux`; PASS live communications and WhatsApp smokes; PASS watchdogs/secrets audit. | Final Done waits on `RESEND_WEBHOOK_SECRET`, signed webhook verification, and live inbound CRM readback. |
| `REQ-20260629-116` | Blocked | `.env.example`; `docs/integrations/RESEND.md`; `docs/operator-walkthroughs/integrations/resend-email.md`; run evidence; ledger/changelog; live status report. | PASS docs/tests/smokes/watchdogs/secrets audit; env names documented without secret values; current PR #52 head and Railway deployment recorded. | Final Done waits on `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET`, Resend webhook creation, signed live inbound test, and live proof append. |
