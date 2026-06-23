# Downloads Prompt Implementation Audit - 2026-06-15

## Purpose

Shloimie asked Codex to audit the Markdown implementation prompts in
`C:\Users\User\Downloads`, reconcile them with work already completed by Codex
and Kimi, and keep working through the remaining implementation gaps.

This file is the status map for the active BNA-related prompt packet. It
intentionally does not treat old WebCraft, GHL, LeadConnector, and unrelated
client prompt files as current BNA runtime instructions. The current repo rule
is no active GHL/LeadConnector runtime.

## Inventory Summary

- Total Markdown files in Downloads: 117.
- Unique files by content hash: 81.
- Active BNA/Rabbi/Codex prompt candidates after duplicate collapse: 37.
- Recent WS/Kimi/Rabbi prompts are the current implementation source.
- Older GHL/WebCraft/other-client prompts are historical/legacy unless a
  current BNA prompt explicitly imported their requirement in no-GHL-safe form.
- File-level coverage for all 81 unique top-level Markdown content groups is
  recorded in
  `ops/download-prompt-audit/2026-06-16-downloads-file-coverage-index.md`.
- On 2026-06-16, Shloimie clarified that the actual prompt list to reconcile is
  the WS01-WS11 attachment at
  `C:\Users\User\.codex\attachments\7e3bb822-96a8-43ff-b206-aa750f56a73a\pasted-text.txt`.
  The exact workstream map and resumed-pass patch are recorded in
  `ops/download-prompt-audit/2026-06-16-actual-ws-prompt-list-map.md`.

## Current Status Matrix

| Source prompt | Status | Evidence | Remaining action |
| --- | --- | --- | --- |
| `00_MASTER_ramble_protocol_v2_map_and_questions*.md` and `Custom_GPT_Ramble_Router_Instructions_2026-06-15.md` | Active process requirements implemented in repo/Telegram workflow | `AGENTS.md` captures the ramble protocol, `MEMORY.md` preserves durable rules, Telegram planning mode and ramble routing are covered by `src/lib/bna/telegram-planning-intent.js`, `scripts/telegram-kimi-bridge.mjs`, and tests for planning intent, raw-title cleanup, and ramble routing. This audit itself follows the requested split/status/ledger/changelog contract. | Continue using this protocol for future rambles; no separate runtime feature is missing from this prompt group. |
| `WS01-operations-ui-mobile-layout-codex-spec.md` and `2026-06-15-WS01-operations-ui-layout-codex-spec*.md` | Local complete, verified; deploy blocked for safe release window | `public/css/bna-app-shell.css` now has the formal WS01 readability closeout: no page-level horizontal overflow, contained app shell, light modal/form/detail surfaces, wrapping 40px action controls, and mobile one-column task rows. Verification on 2026-06-16: `node --check server.js`, Operations inline parse, `npm test` 615/615, focused WS01/brand/shell tests, and in-app Browser smoke over `http://127.0.0.1:43787/operations.html` confirming shared shell CSS loaded, body/html overflow hidden, document width 375/375, modal light rule present, and first `.task-action` min-height 40px with normal wrapping. | Deploy/live-smoke only after a safe deploy window or isolated release path is approved, because the shared worktree contains many unrelated local workstreams. |
| `WS02-decision-lifecycle-reprocessing-codex-spec*.md` | Local complete, blocked for live DB/deploy closeout | Ledger records local schema/API/UI/comment reprocess work, focused tests, audit script, browser smoke, and blocked live classification. | Need reachable live DB/deploy approval to apply/read back migration and classify existing decisions live. |
| `WS03_pending_access_dedupe_done_links_codex_spec*.md` and `2026-06-15-WS03-pending-access-dedupe-done-links-codex-spec*.md` | Local complete, blocked for live DB/deploy closeout | Ledger records pending/access dedupe fields, Received/Done flow, proof links, audit script, focused/full tests, and browser smoke. | Need reachable DB to run dry-run/apply duplicate/proof audit and then deploy/live-smoke. |
| `2026-06-15-cycle-ops-queue-helper-integrations-WS04-codex-spec*.md` | Done, deployed, verified | `npm run ops:audit-queue`, queue-health APIs/UI, report links, requeue policy, Railway deployment `5650e674-7717-4a10-b306-f64eb4a72698`, live queue smoke. | None for WS04 core. |
| `2026-06-15-cycle-ops-queue-helper-integrations-WS05-codex-spec*.md` | Local complete, blocked for safe deploy | Helper tool plan/audit tables, `/api/bna/helper/*`, tool registry modules, global Operations helper drawer, local tests and browser smoke exist. | Need safe deploy window or isolated branch. Also decide whether to fix the live `/api/bna/support-tickets` smoke blocker in same release. |
| `2026-06-15-cycle-ops-queue-helper-integrations-WS06-codex-spec*.md` | Local complete, blocked on credentials/DNS/deploy | Buffer/Resend readiness, draft-only social/email paths, keyholder-safe secret loader, DNS setup tasks, Operations Communications UI, Telegram readiness, tests. | Need server-side Buffer/Resend credentials, channel IDs, full DNS values, deploy, doctor, live readiness smokes. |
| `2026-06-15-WS07-automation-center-compact-layout-codex-spec*.md` | Local complete, blocked on live DB/deploy | Automation registry/run tables, list/detail/metadata APIs, compact Automations view, filters, setup blockers, tests, local browser smoke. | Need reachable DB/deploy access for migration/readback and live smoke. |
| `WS08-codex-workspace-directory-model-spec*.md` | Local complete, blocked on DB/safe deploy | Workspace directory API, four display categories, sidebar/admin directory UI, active workspace role/category display, SDDraftler review handling, tests. | Need DB readback plus safe deploy/live scoped-login smoke. |
| `WS09-people-identity-dedupe-codex-spec*.md` | Local complete, blocked on live Menachem inspection | Identity helper modules/tests, Menachem Hebrew/English alias handling, review-first merge policy, full tests. | Need reachable live DB or app deploy so Menachem duplicate can be reviewed, not guessed. |
| `WS10-one-time-product-payments-decisions-codex-spec*.md` | Done as decision/product reconciliation | Canonical handoff captures Stripe/GreenInvoice direction, Rabbi business/payment assumptions, preview/gated checkout reality, website asset blockers. | Human decisions still required before live checkout or public launch. |
| `ws11-gamification-community-parent-progress-codex-spec*.md` | Local complete, blocked for safe deploy | Gamification/course/worksheet/shoutout/parent-progress schema, helper modules, admin/student/parent APIs, tests, local verification. | Need safe deploy/live schema readback and parent/student privacy smoke. |
| `kimi-one-time-rabbi-whatsapp-workspace-handoff*.md` | Implemented; live env/assets remain blocked | Two-login owner/manager auth, workspace integration/branding/contact audit/note tables, contact identity helpers, parser scoping, branding API/UI, env docs. | Set Railway env vars, confirm brand assets and Rabbi WhatsApp number, then live-smoke scoped logins/branding. |
| `KIMI-rabbi-workspace-launch-ui-isolation-super-prompt.md` | Active implementation scope complete; live launch blockers remain | Route privacy, One Time workspace, scoped branding, parent/member/classroom, helper gates, no-GHL guardrails, approval gates, and classroom work exist. | Same blockers as WS05/WS06/WS08/WS11 plus human launch decisions and final brand/contact assets. |
| `six-chatgpt-mapping-prompts-bna-assistant-buildout*.md` | Active implementation scope complete across slices | Public/helper assistant, action registry, media/classroom/content intake, portal funnels, brand shell, queue audit, and deploy smokes exist. | Remaining work is prompt accounting plus dirty-worktree/safe-deploy closeout, not a missing local implementation theme. |
| `01_CHATGPT_PRO_prompt_local_install_demo_package.md` | Local complete; live Operator Setup rollout pending | `docs/local-setup.md`, `docs/install-package/`, `scripts/local-setup.mjs`, `scripts/doctor.mjs`, and Operator Setup bootstrap exist. | Operator Setup live deploy still pending. |
| `02_CHATGPT_PRO_prompt_bot_ticket_codex_queue.md` | Implemented | Observable ticket/task/agent-job lifecycle, queue reconciler, agent fleet status, Telegram/Codex routing records. | Keep monitoring queue health. |
| `03_CHATGPT_PRO_prompt_rabbi_task_manager_natural_language.md` | Implemented/ongoing | Rabbi task dialogue, One Time task shaping, decision/comment lifecycle, Operations helper and classroom scheduling exist. | Live closeout follows WS02/WS05/WS08 blockers. |
| `04_CHATGPT_PRO_prompt_rabbi_vimeo_upload_worksheets_member_library.md` | First-party safe scope complete; external video-host writes gated out | One Time content library, member-library publish gate, class sessions, worksheets/source sheets, transcript/media lanes, classroom page exist. | Real Vimeo/video-host writes remain approval-gated and out of current scope until source/account policy is approved. |
| `05_CHATGPT_PRO_prompt_zoom_live_classes_tiers_access.md` | Implemented as gated live-access model | Live class/access/tier helpers, One Time classroom live/today item, and access rules exist. | Zoom API writes remain out of scope unless separately approved. |
| `06_CHATGPT_PRO_prompt_payments_checkout_access_site.md` | Implemented as preview/gated checkout/access | Rabbi checkout/access schemas, public preview/member access pieces, Stripe/GreenInvoice direction, tests. | Live checkout/access grants require owner-approved pricing/account/webhook/rollback decisions. |
| `07_CHATGPT_PRO_prompt_service_provider_index_free_funnel.md` | Implemented/deployed | Provider index/funnel tests, provider pages, public helper paths, service provider workspace work. | Ongoing content/profile polish only. |
| `08_CHATGPT_PRO_prompt_parent_family_student_accountability_linking.md` | Implemented/deployed | Parent/student portals, identity linking, privacy tests, Menachem/Ahuva corrections, parent progress hooks. | WS09 live duplicate review remains. |
| `09_CHATGPT_PRO_prompt_assistant_bot_actions_memory_tickets.md` | Implemented/ongoing | Assistant intake, helper action engine, memory/task lifecycle, source-bounded retrieval, support/ticket paths. | WS05 helper deploy and support-ticket smoke blocker remain. |
| `10_CHATGPT_PRO_prompt_natural_language_parser_docs_transcripts_sections.md` | Implemented/ongoing | Intake parser, transcript/doc/media routing, scoped meeting-note parser, natural-language classroom assignment preview, tests. | Continue adding parsers as real docs/transcripts arrive. |
| `BNA_Codex_Rabbi_Sheller_WhiteLabel_Onboarding_Google_Content_Superprompt_2026-06-14*.md` | Implemented in multiple deployed/local slices | Route privacy, One Time content library, classroom, Google approval gates, white-label scope, helper no-write gates. | Remaining blockers are explicit approvals, DB/deploy access, and live credentials/assets. |
| `BNA_Codex_GoalMode_Google_Onboarding_CRM_Workspace_Followup_2026-06-14*.md` | Implemented as no-GHL, first-party workspace work | Google remains approval-gated; BNA uses first-party Operations tables/APIs instead of CRM runtime. | OAuth/scope/public verification remains owner-gated. |
| `BNA_Codex_GoalMode_Onboarding_Helper_CRM_Workspace_Security_Rabbi_2026-06-14.md` | Local active scope complete; secure rollout pending | Public privacy hotfixes, helper, provider/parent onboarding, operator bootstrap, workspace clarity. | Secure Operator Setup live deploy remains. |
| `BNA_Codex_Superprompt_Task_UI_Rabbi_App_Audit_Bot_Workspace_2026-06-14.md` | Active scope split and implemented across WS01-WS11/Rabbi workstreams | UI/brand cleanup maps to WS01, task/decision lifecycle to WS02/WS03, workspace clarity to WS08/Kimi, helper tools to WS05, Rabbi app inventory to `ops/audits/2026-06-14-one-time-repo-inventory.md`, billing/referral to `ops/rabbi-scheller/green-invoice-billing-options.md`, website preview to Rabbi preview/member pages, forum/gamification to One Time Classroom/WS11, and tracking to ledger/changelog records. On 2026-06-16, `git ls-remote` confirmed One Time repo HEADs still match the inventory report. | Live deploy/DB/credential/human approval blockers remain by sub-workstream; no additional local mega-prompt implementation should be started outside those tracked lanes. |
| `BNA_Rabbi_Scheller_Decision_Advice_Brief_2026-06-14.md` | Decisions captured as gated product/implementation work | Workspace/role advice is covered by WS08/Kimi, decision-card advice by WS02 and Operations task UI, preview-only Rabbi launch by `public/rabbi.html`/`public/rabbi-member.html` and `tests/rabbi-checkout-access.test.js`, and billing/refund guidance by `tasks-pending/2026-06-15-one-time-product-payments-decisions.md` plus `ops/rabbi-scheller/green-invoice-billing-options.md`. | Human decisions remain for pricing, provider of record, refund policy, public replacement, and live checkout/access activation. |
| `BNA_Codex_Master_Cleanup_Community_No_GHL_Prompt_2026-06-13.md` | Implemented as active repo policy and repeated guardrails | `AGENTS.md`, `MEMORY.md`, tests, and code guardrails enforce no active GHL/LeadConnector runtime. | Continue not importing old GHL prompt behavior. |
| `bna-universal-helper-tagging-settings-hebrew-codex-prompt.md` | Active baseline implemented; future polish screenshot-driven | Public helper, action registry, Hebrew/RTL portal fixes, settings/admin shell polish, contact history helper. | Any remaining Hebrew/mobile polish should be driven by fresh screenshots. |
| `mapping-out-inner-dialogue-between-members-community-dialogue-codex-prompt.md` | Active One Time classroom/community scope complete; generic reuse later | Rabbi-thread classroom, moderated responses, parent safety context, leaderboard, source bot. | Full generic member inner-dialogue product remains a later BNA reuse project using the shared classroom/community foundations. |
| `bna_codex_super_prompt_parent_rabbi_ui_2026-06-11*.md` | Active implementation scope complete/deployed where safe | Parent portal, Rabbi/provider portal, weekly updates, navigation, bots, approvals, live smokes. | Ongoing launch decisions and safe deploy blockers. |
| `bna_provider_onboarding_codex_super_prompt*.md` | Implemented/deployed first passes | Provider onboarding, provider index/funnel, commercial model/entitlements, login/readiness. | Live provider integrations remain gated. |
| `bna_master_codex_execution_prompt.md` | Superseded by current AGENTS/TASKS/MEMORY state | Its major themes are implemented across parent/student, Operations action registry, and SaaS polish. | No separate action unless a fresh requirement is extracted. |
| `bnei_neviim_registration_documents_bilingual_codex.md` and `Bnei Neviim Academy Student Contract.md` | Implemented/superseded by current bilingual registration document flow | `public/signup.html`, `public/signup-he.html`, `public/documents/registration-document.html`, `public/js/signup-documents.js`, and `public/js/registration-document-page.js` provide separate document pages/modals, English/Hebrew flow, parent acknowledgment, timestamp/version/language payloads, first-tuition-payment wording, no smartphone exception language, and parent review of the Student Handbook/Code of Conduct. Covered by `tests/signup-permissions-mobile-homepage.test.js` and `tests/parent-student-portal-contract.test.js`. | No separate student-signature workflow is needed; the later registration prompt supersedes the older standalone student contract by requiring parent confirmation that the handbook/code was reviewed with the child. |
| `bnei_neviim_full_website_blog_faq_codex_prompt.md` and `bnei-neviim-kimi-prompt.md` | Older public website prompts, mostly superseded | Current public site/helper/SEO/privacy work exists and is live-smoked. | Treat future website copy/SEO work as a new scoped content task. |
| Old WebCraft/GHL/LeadConnector/other-client prompt files | Legacy/out of scope | Current repo explicitly rejects active GHL/LeadConnector runtime and unrelated client work. | Do not implement as active BNA product. |

## Implementation Priority From This Audit

1. WS01 is closed locally and verified; keep deploy/live-smoke pending until a
   safe release window or isolated deploy path is approved.
2. Close audit accounting: keep this file plus `tasks-pending` as the single
   prompt pile map.
3. Keep the 2026-06-16 actual WS01-WS11 attachment map as the reference when
   the operator refers to "the real list" or "the prompts I gave GPT."
4. When DB/deploy access is available, finish live closeouts for WS02, WS03,
   WS05, WS07, WS08, WS09, WS11, secure Operator Setup, and Kimi scoped login.
5. Do not add GHL/LeadConnector runtime, public student data, live checkout,
   sends, Buffer publishes, Google writes, Zoom writes, Vimeo writes, or access
   grants without existing approval gates.
