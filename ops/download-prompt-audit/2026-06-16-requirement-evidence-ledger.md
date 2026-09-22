# Downloads Prompt Requirement Evidence Ledger - 2026-06-16

## Purpose

This ledger turns the Downloads Markdown prompt pile into requirement-level
evidence. It complements
`ops/download-prompt-audit/2026-06-15-downloads-prompt-status.md`, which is the
short status matrix.

Scope is the top-level BNA/Rabbi/One Time/Codex prompt packet in
`C:\Users\User\Downloads`. Legacy WebCraft, old GHL/LeadConnector, unrelated
client, package `node_modules`, and historical prompt files are not active BNA
runtime instructions unless a current BNA prompt imported a requirement in a
no-GHL-safe form.

## Inventory Evidence

- Top-level Downloads Markdown files inspected on 2026-06-16: 117.
- Unique top-level Markdown files by content hash: 81.
- Current active prompt packet: WS01-WS11, Kimi/Rabbi/One Time handoffs,
  ChatGPT Pro prompts 01-10, ramble protocol/router prompts, BNA/Rabbi June 11-
  June 15 superprompts, and BNA registration/document prompts.
- Read-only GitHub reachability check on 2026-06-16:
  - `shloimie-beep/one-time-app.git` HEAD:
    `a3463bc6756ac34d8f304451fa0e5190309b8ae1`
  - `shloimie-beep/one-time-one-time.git` HEAD:
    `050fe2468a3f5601e74e738c219cbe5c1bdf398e`
- These HEADs match `ops/audits/2026-06-14-one-time-repo-inventory.md`.

## Requirement Ledger

| Requirement area | Source prompts | Evidence inspected | Current status | Remaining blocker/action |
| --- | --- | --- | --- | --- |
| Ramble protocol: split rambles, preserve raw intent, produce focused prompts/handoffs, update memory/tasks/ledger/changelog | `00_MASTER_ramble_protocol_v2_map_and_questions*.md`, `Custom_GPT_Ramble_Router_Instructions_2026-06-15.md`, `AGENTS.md` | `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `tasks-pending/2026-06-15-downloads-prompt-implementation-audit.md`, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`, `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-planning-intent.test.js`, `tests/telegram-ramble-routing-regression.test.js`, `tests/task-title-cleanup-dry-run.test.js` | Implemented as repo process and Telegram/planning behavior. This audit follows the same contract. | Continue applying it to new rambles; no separate local implementation gap found. |
| WS01 Operations mobile/layout/readability | WS01 prompt variants | `public/css/bna-app-shell.css`, `tests/operations-ws01-layout-readability.test.js`, focused browser smoke, full `npm test` | Local complete and verified. | Production deploy/live smoke waits for safe deploy or isolated release path. |
| WS02 decision lifecycle and comment reprocessing | WS02 prompt variants, Rabbi decision advice | `server.js`, `public/operations.html`, `scripts/audit-decision-lifecycle.mjs`, `tests/decision-lifecycle-reprocessing.test.js`, ledger records | Local complete. | Live DB/deploy closeout needed for existing-decision classification/readback. |
| WS03 pending/access dedupe, Done/Received, proof links | WS03 prompt variants | `server.js`, `public/operations.html`, `scripts/pending-access-dedupe-done-links-audit.mjs`, `tests/pending-access-dedupe-done-links.test.js`, ledger records | Local complete. | Reachable DB and safe deploy/live smoke needed. |
| WS04 queue/agent visibility and reconciler | WS04 prompt variants | `scripts/lib/ops-queue-reconciler.mjs`, `scripts/ops-queue-audit.mjs`, queue report records, Railway deployment records | Deployed and verified. | None for WS04 core. |
| WS05 BNA Helper tool-using assistant | WS05 prompt variants, Task UI/Rabbi superprompt | `server.js`, `public/operations.html`, `src/lib/bna/helper/*`, `tests/bna-helper-tools.test.js`, helper ledger records | Local complete. | Safe deploy/isolated branch and live support-ticket blocker decision remain. |
| WS06 Buffer/Resend communications | WS06 prompt variants | `server.js`, `public/operations.html`, `src/lib/integrations/*`, `scripts/buffer-ops.mjs`, communications tests | Local complete with draft/preview gates. | Buffer/Resend credentials, DNS values, deploy, doctor, and live readiness smokes needed. |
| WS07 Automation Center compact layout | WS07 prompt variants | `server.js`, `public/operations.html`, `railway-migration-2026-06-15-automation-center.sql`, `tests/operations-automation-center.test.js` | Local complete. | Reachable DB/deploy access for migration readback and live smoke. |
| WS08 workspace directory/category and role clarity | WS08 prompt variants, Rabbi decision advice, Task UI/Rabbi superprompt | `server.js`, `public/operations.html`, workspace/brand/shell tests, Kimi two-login records | Local complete. | DB readback plus safe deploy/live scoped-login smoke. |
| WS09 people identity dedupe | WS09 prompt variants | `src/lib/bna/person-resolution.js`, `src/lib/bna/student-identity-dedupe.js`, related tests and ledger records | Local complete. | Live Menachem duplicate inspection needs reachable live data/app deploy. |
| WS10 One Time product/payments decisions | WS10 prompt variants, Rabbi decision advice | `tasks-pending/2026-06-15-one-time-product-payments-decisions.md`, `ops/rabbi-scheller/green-invoice-billing-options.md`, `tests/rabbi-scheller-audit-docs.test.js`, `tests/rabbi-checkout-access.test.js` | Decision/product state reconciled; preview/gated checkout model exists. | Human approvals for pricing, provider of record, refund policy, public launch, payment account, webhook, and rollback. |
| WS11 gamification, Mishnah community, parent progress | WS11 prompt variants, forum/gamification sections | `server.js`, `public/student.html`, `public/parent.html`, `src/lib/bna/gamification.js`, `src/lib/bna/parent-progress.js`, WS11/privacy tests | Local complete. | Safe deploy/live schema readback and parent/student privacy smoke. |
| One Time Classroom/calendar/community/source-grounded bot | Operator classroom ramble, ChatGPT Pro 03/04/05/09/10, Rabbi superprompts | `server.js`, `public/one-time-classroom.html`, `public/member-library.html`, `public/parent.html`, `tests/one-time-classroom-calendar-community-bot.test.js`, deploy/live smoke records | Deployed and verified. | External writes remain gated: Google, email, WhatsApp, Buffer, Drive/video host, Zoom, billing/access grants. |
| Kimi One Time two-login, white-label branding, contact identity, scoped parsing | `kimi-one-time-rabbi-whatsapp-workspace-handoff*.md`, Kimi launch superprompt | `server.js`, `public/operations.html`, `.env.example`, `tests/one-time-external-user-portal.test.js`, `tests/bna-brand-shell.test.js`, `tests/operations-saas-crm-redesign.test.js` | Local complete and tested. | Railway env vars, exact brand assets/colors, Rabbi WhatsApp number, deploy/live smoke. |
| Rabbi/One Time external repo inventory | `BNA_Codex_Superprompt_Task_UI_Rabbi_App_Audit_Bot_Workspace_2026-06-14.md`, `BNA_Rabbi_Scheller_Decision_Advice_Brief_2026-06-14.md` | `git ls-remote` on both One Time repos, `ops/audits/2026-06-14-one-time-repo-inventory.md`, `tests/rabbi-scheller-audit-docs.test.js` | Complete as of matching HEADs on 2026-06-16. | Deeper live data audit needs admin/member credentials, DB, Stripe/Resend/Vimeo/phone-provider access. |
| Rabbi website preview and no live replacement without approval | Rabbi decision brief, ChatGPT Pro 06, Task UI/Rabbi superprompt | `public/rabbi.html`, `public/rabbi-member.html`, `public/js/rabbi-launch.js`, `public/js/rabbi-member.js`, `tests/rabbi-checkout-access.test.js` | Preview/gated model implemented. | Public replacement requires owner approval and live launch decisions. |
| Vimeo/video-host/worksheet/member-library work | ChatGPT Pro 04, Task UI/Rabbi content sections | One Time content library records, member library/classroom pages, content media intake tests, repo inventory showing Vimeo lessons in external repo | First-party safe scope complete. | Real Vimeo/video-host uploads/writes need approved account/API policy and credentials. |
| Zoom/live classes/tiered access | ChatGPT Pro 05 | `src/lib/bna/live-access.js`, live class schema/routes, member/classroom tests | Gated live-access model implemented. | Zoom API writes remain out of scope until separately approved. |
| Service provider index/free funnel | ChatGPT Pro 07, provider onboarding superprompt | `src/lib/bna/provider-index.js`, provider/public pages, service-provider/provider-index tests | Implemented/deployed first passes. | Live provider integrations remain gated; ongoing profile/content polish is future scoped work. |
| Parent/family/student accountability linking | ChatGPT Pro 08, parent/rabbi UI superprompts | Parent/student portals, identity-linking helpers/tests, parent-progress privacy tests, registration flow tests | Implemented/deployed/local depending on slice. | WS09 live duplicate review remains for named data. |
| Assistant action layer, memory, tickets | ChatGPT Pro 09, WS05, ramble router | Universal assistant, helper action registry, Telegram bridge routing, support ticket tests | Implemented/ongoing with local WS05 helper pending production deploy. | Live deploy and support-ticket smoke blocker decision remain. |
| Natural-language parser/docs/transcripts/sections | ChatGPT Pro 10, ramble protocol | `src/lib/bna/intake-parser.js`, `server.js` parser routes, Telegram routing tests, natural-language classroom scheduling tests | Implemented/ongoing. | Add parser coverage as real new docs/transcripts arrive. |
| Bilingual BNA registration documents and student contract | `bnei_neviim_registration_documents_bilingual_codex.md`, `Bnei Neviim Academy Student Contract.md` | `public/signup.html`, `public/signup-he.html`, `public/documents/registration-document.html`, `public/js/signup-documents.js`, `public/js/registration-document-page.js`, `tests/signup-permissions-mobile-homepage.test.js`, `tests/parent-student-portal-contract.test.js` | Implemented/superseded by current bilingual parent-signed document flow. | No student signature needed; parent confirms review with child. |
| No active GHL/LeadConnector runtime | No-GHL prompt, AGENTS/MEMORY, multiple BNA superprompts | `AGENTS.md`, `MEMORY.md`, tests and code search policy records | Implemented as policy and guardrails. | Continue keeping old GHL prompt files historical only. |

## Current Local Gap Check

The resumed 2026-06-16 pass used the actual WS01-WS11 attachment supplied by
Shloimie. One local-only cross-surface gap was found and patched:

- public website/registration/provider surfaces now consistently load the
  public helper knowledge bundle before the BNA Helper widget where the widget
  is present,
- public provider pages now use the shared BNA main-site nav instead of the
  older provider mini-toolbar,
- `public/js/bna-bot-widget.js` no longer misclassifies `/providers` or
  `/provider-signup` as the private provider workspace.

Focused verification passed 47/47 across assistant/provider/signup/app-select
contracts.

No remaining active prompt group in this ledger has an obvious local-only
implementation gap after that resumed pass. Remaining open items require one of:

- reachable DB/live app access,
- safe deploy or isolated release path,
- server-side credentials/DNS/account access,
- owner/Rabbi/Shloimie product/legal/billing/asset decisions,
- future scoped content/polish from new screenshots or new source material.

## Verification To Rerun After This Ledger

- Focused prompt-accounting/document tests:
  `node --test tests/telegram-planning-intent.test.js tests/telegram-ramble-routing-regression.test.js tests/task-title-cleanup-dry-run.test.js tests/rabbi-scheller-audit-docs.test.js tests/rabbi-checkout-access.test.js tests/signup-permissions-mobile-homepage.test.js tests/parent-student-portal-contract.test.js`
- Diff hygiene on audit/task/changelog files.
