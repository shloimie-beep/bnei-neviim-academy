# One Time Launch Priority - Landing, Robot Scheller, CRM, Follow-Up

## Raw Intake

Source raw record: `raw-input/RAW-20260710-002-onetime-launch-priority-landing-crm-assistant.md`

Related dropoff packet:
`ops/chatgpt-ramble-dropoff/incoming/onetime-launch-priority-ui-crm-automation-20260710-001/`

Active Codex goal:

> Execute the 2026-07-10 One Time launch-priority handoff through raw intake,
> requirement registration, first safe implementation waves, verification, and
> terminal statuses or precise blockers for landing, Robot Scheller, CRM/contact
> timeline, mailbox reconciliation, transactional follow-up, and Rabbi backend
> launch-readiness.

## Goal-Mode Execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Goal tool used | yes |
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| Priority | P0 launch-critical |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260710-013 | Preserve and atomize the launch-priority handoff. | SRC-20260710-002-001 | agent_ops | Codex | intake | P0 | B0 | none | Raw intake exists, source statements are mapped, private full WhatsApp number is not committed. | `raw-input/RAW-20260710-002-onetime-launch-priority-landing-crm-assistant.md`; this register | no | Done |
| REQ-20260710-014 | Create a focused Product Quality Compiler packet for the first launch-visible wave. | SRC-20260710-002-002..007 | one_time_mishnah_class | Codex | product_quality | P0 | B0 | REQ-20260710-013 | PQC packet validates and names routes/files/states/screenshots/out-of-scope. | `ops/prompt-packets/2026-07-10-onetime-launch-priority/01-landing-robot-scheller.product-quality.json` | no | Done |
| REQ-20260710-015 | Reconcile landing copy and asset slots. | SRC-20260710-002-002..004 | one_time_mishnah_class | Codex | public_landing | P0 | B1 | REQ-20260710-014 | Copy matrix and asset manifest exist; approved repo assets are used where clear; remaining image slots are documented and replaceable. | `ops/design-references/2026-07-10-onetime-landing-copy-and-assets/*` | yes | Done |
| REQ-20260710-016 | Replace public landing TODO/placeholders/internal language with polished visitor-facing copy and media. | SRC-20260710-002-002..004 | one_time_mishnah_class | Codex | public_landing | P0 | B1 | REQ-20260710-014, REQ-20260710-015 | No visible/source TODO for hero media; no public review-only/protocol/test/no-write copy; hero and program cards use approved media; mobile 390/430 and desktop 1440 are screenshot-verified. | `public/one-time/index.html`; `config/service-provider-sites/one-time.json`; `config/brands/one-time.json` | yes | Done |
| REQ-20260710-017 | Implement Robot Scheller identity and scoped helper copy. | SRC-20260710-002-005..007 | one_time_mishnah_class | Codex | assistant | P0 | B1 | REQ-20260710-014 | One Time public helper title is `Robot Scheller`, subtitle is `Rabbi Scheller's digital assistant`, options are concise, avatar/face treatment exists, and non-public One Time helper surfaces retain recognizable Robot Scheller identity with scoped permissions. | `public/js/bna-bot-widget.js`; `ops/action-registry.json` | yes | Done |
| REQ-20260710-018 | Wire the public WhatsApp affordance through runtime configuration without committing the full number. | SRC-20260710-002-007, SRC-20260710-002-012 | one_time_mishnah_class | Codex | communications_readiness | P0 | B1 | REQ-20260710-017 | A public same-origin WhatsApp redirect/readiness path exists, uses `ONE_TIME_PUBLIC_WHATSAPP_NUMBER`/aliases at runtime, reveals no full number in Git, and degrades to a precise blocker when missing. | `server.js`; `public/one-time/index.html`; `public/js/bna-bot-widget.js`; `ops/action-registry.json` | yes | Done; runtime activation blocked by DEC-20260710-002 |
| REQ-20260710-019 | Prove form-to-visible-CRM end-to-end. | SRC-20260710-002-008..010 | one_time_mishnah_class | Codex / ChatGPT code-prep | CRM | P0 | B2 | REQ-20260710-016 | Synthetic `TEST-` lead submit creates/upserts one scoped record, CRM search finds it, detail opens, timeline shows interaction, and cleanup/readback is recorded. | `server.js`; `public/operations.html`; focused CRM smoke/tests | yes | Done |
| REQ-20260710-020 | Build/finish searchable CRM list/detail/timeline workbench. | SRC-20260710-002-009..010 | one_time_mishnah_class | Codex / ChatGPT code-prep | CRM | P0 | B3 | REQ-20260710-019 | Contact rows support search/filter/sort and open a useful detail pane/route with overview, timeline, class/trial/access, notes, and next actions. | `public/operations.html`; workbench smoke/tests | yes | Done |
| REQ-20260710-021 | Reconcile the roughly 2,600-record historical email/contact truth. | SRC-20260710-002-011 | one_time_mishnah_class | Codex / ChatGPT code-prep | mailbox_import | P0 | B4 | none | Redacted report identifies source artifact/type/counts/import status/visibility; no raw message bodies or exports are committed. | `ops/system-audits/2026-07-10-onetime-historical-inbox-reconciliation/*`; mailbox/import code as needed | no, unless code changes | Needs operator decision via DEC-20260710-004 |
| REQ-20260710-022 | Implement or precisely block immediate free-class transactional email/WhatsApp follow-up. | SRC-20260710-002-012 | one_time_mishnah_class | Codex / ChatGPT code-prep | transactional_followup | P0 | B5 | REQ-20260710-018, REQ-20260710-019 | Email/WhatsApp attempts are idempotent, readiness-gated, logged to contact timeline, and real sends remain blocked unless exact readiness/approval gates are satisfied. | `server.js`; WAPI/Resend modules; tests | yes | Open |
| REQ-20260710-023 | Remove normal-view Rabbi backend support/test/scoping/protocol noise. | SRC-20260710-002-013..015 | one_time_mishnah_class | Codex / ChatGPT code-prep | provider_backend_ui | P1 | B6 | REQ-20260710-014 | Normal Rabbi/provider views hide irrelevant diagnostics or move them to support/admin drawers; buttons work, are hidden, or show concise blocked states; layout/card/toolbars pass manual screenshots. | `public/provider.html`; `public/operations.html`; One Time CSS/tests | yes | Open |
| REQ-20260710-024 | Generate non-overlapping ChatGPT code-package lanes for unresolved launch work. | SRC-20260710-002-016 | agent_ops / one_time_mishnah_class | Codex | packet_compiler | P0 | B0-B6 | REQ-20260710-013 | Only real unresolved lanes get outgoing prompts; each prompt requires repo-visible code package with diffs/tests and no external writes. | `ops/chatgpt-ramble-dropoff/outgoing/2026-07-10-onetime-launch-priority-*` | no | Open |
| REQ-20260710-025 | Ingest/apply/test/push/deploy/live-smoke launch-priority implementation slices. | all | one_time_mishnah_class | Codex | closeout | P0 | B7 | implementation slices | App-visible work is committed, pushed, deployed to verified One Time target, live-smoked, screenshot-reviewed, and source statements are terminal or blocked. | implementation/evidence files | yes | Open |

## Decisions And Blockers

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260710-002 | One Time public WhatsApp runtime number activation | Full public business WhatsApp number must be placed in runtime/keyholder config, not Git. The source says the number ends in `8614`. | Shloimie / runtime keyholder | Set `ONE_TIME_PUBLIC_WHATSAPP_NUMBER` on the One Time service and run readiness smoke. | Keep WhatsApp CTA routed to the public form until runtime is configured. | Without runtime config, UI can show the affordance but cannot open the exact WhatsApp business chat from deployed code. | Add runtime env value, then run `/api/one-time/public-whatsapp` readback and redirect smoke. | REQ-20260710-018, REQ-20260710-022 | Needs operator/runtime action |
| DEC-20260710-003 | GitHub issue #128 direct readback | Local `gh issue view 128 --comments` failed because the token lacks `read:project`. | Shloimie / GitHub auth owner | Refresh local gh auth with the needed scope when direct issue readback is required. | Use the materialized trusted dropoff packet for this turn. | Direct current issue-comment reconciliation may be incomplete until auth is fixed. | Run `gh auth refresh -s read:project` or provide a scoped issue export. | source reconciliation depth | Blocked external |
| DEC-20260710-004 | Historical One Time email/contact import source and suppression policy | The located local source family totals 2,335 June 21 audience/follower rows, or 2,423/2,509 rows when older subscriber exports are included, but current live One Time CRM shows 0 email-import-tagged records. Need canonical source package and policy for subscribed, unsubscribed, cleaned/bounced, and follower rows. | Shloimie / One Time data owner | Approve a redacted no-write dry-run normalizer for the June 21 source package before any production import. | Import only subscribed rows as no-send contacts; keep unsubscribed/cleaned as suppression-only; provide a different canonical export; or keep all historical sources out of production until campaign/compliance plan is approved. | Mailbox/CRM completion cannot be claimed while the current One Time service has only 4 parent leads, 12 CRM cards, 0 email-import-tagged records, and only the prior 9-email Resend backfill is proven. | Choose/approve the canonical source package and suppression/import policy, then run no-write dry-run normalization. | REQ-20260710-021 and any future historical import apply | Needs operator decision |

## Current Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260710-016 | `/one-time`, `public/one-time/index.html` | Replace placeholder hero/program media, remove public internal language, keep first viewport CTA and responsive layout. | PASS `node --test tests/one-time-focused-landing.test.js`; PASS local Playwright visual audit at `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/report.md`; PASS live join-domain smoke. | `f240b031`, `9599e708` | `9599e708` | Railway `0db8b757-4a7c-4a27-922a-30404f74ceb8` SUCCESS; live smokes passed |
| REQ-20260710-017 | `public/js/bna-bot-widget.js` | Rename One Time helper identity to Robot Scheller, use Rabbi portrait avatar, keep role-scoped action sets. | PASS `node --test tests/one-time-brand-helper-isolation.test.js`; PASS helper-open screenshot `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/mobile-390-helper-open.png`; PASS live readback for `Robot Scheller`. | `f240b031` | `f240b031` | Railway `0db8b757-4a7c-4a27-922a-30404f74ceb8` SUCCESS; live readback passed |
| REQ-20260710-018 | `server.js`, `/api/one-time/public-whatsapp`, `/api/one-time/public-whatsapp/redirect` | Runtime-only WhatsApp compose/readiness path; no number in Git. | PASS readiness JSON `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/api-public-whatsapp-readiness.json`; PASS `node --check server.js`; PASS `npm run watchdog:actions`; PASS live readiness readback (`full_number_returned:false`, `no_whatsapp_sent:true`, `external_write_performed:false`). | `f240b031` | `f240b031` | Railway `0db8b757-4a7c-4a27-922a-30404f74ceb8` SUCCESS; direct WhatsApp redirect activation still blocked by DEC-20260710-002 |
| REQ-20260710-019 | `/api/one-time/interest`, `/api/bna/parent-leads`, `/api/bna/crm/contacts/:id/timeline` | Add TEST-safe no-Telegram branch for synthetic E2E, add live smoke that submits a TEST/example.invalid lead, verifies CRM list/search/timeline, and archives the CRM lead. | PASS `node --check server.js`; PASS `node --check scripts/smoke-one-time-interest-crm-e2e-live.mjs`; PASS focused tests; PASS live E2E smoke with CRM lead `8` archived; PASS regression smokes. | `1d1a84b2` | `1d1a84b2` | Railway `a261ef2c-1f27-485f-8d28-5361e1f7b8ff` SUCCESS; live E2E passed |
| REQ-20260710-020 | `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=contacts&section=crm_contacts`, `public/operations.html`, `/api/bna/crm/contacts`, `/api/bna/crm/contacts/:id/timeline` | Replace the One Time CRM section with an API-backed workbench: filter/search/sort controls, contact cards, selected detail, class/trial/access context, local timeline, and no-send next-action guard. | PASS PQC validation for `02-crm-list-detail`; PASS focused tests; PASS local screenshot smoke at five viewports; PASS action watchdog and protocol-drift watchdog; PASS live workbench smoke with 12 scoped CRM cards and read-only selected timeline; PASS live TEST lead E2E with CRM lead `9` archived; PASS regression smokes. | `353a0f33` | `353a0f33` | Railway `73676e6e-b489-4da1-9c95-f366a4aa7c92` SUCCESS; live smokes passed |
| REQ-20260710-021 | Historical audience/contact source metadata and live visibility | Identify likely source package, compare it to prior small import/backfill evidence, read current live CRM counts, and record the exact source/import-policy blocker without committing raw contact data. | PASS metadata-only source inspection; PASS live Operations readback showing 4 parent leads, 12 CRM cards, 0 email-import-tagged records, no-send true, external-write false; provider mailbox current readback blocked by invalid stored provider credential; report `ops/system-audits/2026-07-10-onetime-historical-inbox-reconciliation/report.md`. | pending | pending | No deploy needed; no code/product write performed |

## Verification Evidence - 2026-07-10 Local Wave 1

- PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-10-onetime-launch-priority/01-landing-robot-scheller.product-quality.json`.
- PASS `node --test tests/one-time-brand-helper-isolation.test.js tests/one-time-focused-landing.test.js tests/one-time-product-system.test.js tests/one-time-shared-review-branding.test.js`.
- PASS `npm run watchdog:actions` with report `ops/watchdog-audits/2026-07-10T08-02-watchdog-action-audit.md` and 0 findings.
- PASS `npm run watchdog:protocol-drift` with report `ops/watchdog-audits/2026-07-10-product-quality-drift.md` and 0 findings.
- PASS local Playwright visual audit at `ops/ui-audits/2026-07-10-onetime-launch-priority-landing-robot-local/report.md` with desktop/mobile/helper screenshots and no external writes.
- PASS no-secret grep for the full WhatsApp number variants across the edited/evidence paths.

## Deploy And Live Smoke Evidence - 2026-07-10 Wave 1

- Pushed commits `f240b031` and guardrail-copy hotfix `9599e708` to `origin/master`.
- Deployed clean committed bundles from an isolated temp worktree with `BNA_DEPLOY_APP=one-time`, leaving unrelated dirty worktree changes untouched.
- Railway deployment `f4d8578c-9dfc-4c41-85a8-cffb3338df91` reached `SUCCESS`; live smoke exposed missing no-charge/no-portal guardrail copy.
- Railway deployment `0db8b757-4a7c-4a27-922a-30404f74ceb8` reached `SUCCESS` after hotfix.
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`.
- PASS `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`; report `ops/live-smokes/2026-07-10T08-12-46-559Z-rabbi-onetime-landing-smoke.md`.
- PASS `npm run app:smoke:one-time-interest-dry-run`; report `ops/live-smokes/2026-07-10T08-12-46-630Z-one-time-interest-dry-run-live-smoke.md`.
- PASS direct live readback for `/`: `Robot Scheller`, `onetime-hero-vertical.webp`, the same-origin WhatsApp redirect, and the no-spam/no-charge/no-portal guardrail are present.
- PASS direct live readback for `/api/one-time/public-whatsapp`: `configured:false`, `missing_runtime:["ONE_TIME_PUBLIC_WHATSAPP_NUMBER"]`, `full_number_returned:false`, `no_whatsapp_sent:true`, and `external_write_performed:false`.

## Form-To-CRM E2E Evidence - 2026-07-10 Wave 2

- Pushed commit `1d1a84b2` with TEST-safe no-Telegram CRM E2E support and `npm run app:smoke:one-time-interest-crm-e2e`.
- Deployed clean committed bundle to OneTime Railway `one-time-production / one-time-web`; deployment `a261ef2c-1f27-485f-8d28-5361e1f7b8ff` reached `SUCCESS`.
- PASS `npm run app:smoke:one-time-interest-crm-e2e`; report `ops/live-smokes/2026-07-10T08-22-45-952Z-one-time-interest-crm-e2e-live-smoke.md`.
- E2E proof: public `/api/one-time/interest` accepted a synthetic `TEST` / `example.invalid` payload, skipped Telegram reminder with `synthetic_test_lead_no_external_reminder`, returned `crm_lead_id:8`, parent-leads readback found the scoped `one_time_mishnah_class` row, CRM contact search returned `bna_parent_leads:8`, timeline readback found `OneTime free-class public signup captured`, and cleanup archived CRM lead `8`.
- PASS regressions after deploy: `npm run app:smoke:one-time-interest-dry-run`, `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`, and `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`.
- PASS `npm run watchdog:protocol-drift`.

## CRM Workbench Evidence - 2026-07-10 Wave 3

- Pushed commit `353a0f33`, adding the One Time CRM Workbench detail pane, selected-contact timeline readback, class/trial/access context, no-send lock, PQC packet `ops/prompt-packets/2026-07-10-onetime-launch-priority/02-crm-list-detail.product-quality.json`, and local/live workbench smokes.
- Local verification passed:
  - `npm run pqc:validate -- ops/prompt-packets/2026-07-10-onetime-launch-priority/02-crm-list-detail.product-quality.json`.
  - `node --check server.js`.
  - `node --check scripts/smoke-onetime-operations-crm-workbench-local.mjs`.
  - `node --test tests/one-time-communications-workspace.test.js tests/crm-contact-model.test.js`.
  - `node --test tests/job101-contacts-helper-smoke.test.js`.
  - `npm run one-time:smoke:operations-crm-workbench-local`; report `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`.
  - `npm run watchdog:actions`; report `ops/watchdog-audits/2026-07-10T08-38-watchdog-action-audit.md`.
  - `npm run watchdog:protocol-drift`.
- Deployed a clean committed bundle from temp worktree commit `353a0f33` to OneTime Railway `one-time-production / one-time-web`; deployment `73676e6e-b489-4da1-9c95-f366a4aa7c92` reached `SUCCESS`.
- PASS `npm run app:smoke:onetime-operations-crm-workbench`; report `ops/live-smokes/2026-07-10T08-45-30-918Z-one-time-operations-crm-workbench-live-smoke.md`. The live smoke logged in through One Time Railway auth fallback, confirmed deployed `operations.html` workbench/detail markers, read 12 scoped CRM cards, and verified selected timeline readback stayed no-send/read-only without saving raw contact data.
- PASS `npm run app:smoke:one-time-interest-crm-e2e`; report `ops/live-smokes/2026-07-10T08-45-40-132Z-one-time-interest-crm-e2e-live-smoke.md`. The live E2E created CRM lead `9`, found it in parent-leads and CRM contact search, verified the signup capture timeline item, skipped Telegram reminder for the TEST proof, and archived lead `9`.
- PASS regressions after deploy: `npm run app:smoke:one-time-interest-dry-run`, `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`, `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`, and `npm run watchdog:protocol-drift`.
- Guardrails: no email send, WhatsApp/WAPI send, Telegram send for TEST proof, payment/access mutation, DNS/credential mutation, Drive/Zoom/Vimeo mutation, raw private contact body commit, or external CRM write.

## Historical Inbox / Contact Reconciliation - 2026-07-10 Wave 4

- Redacted audit report created at `ops/system-audits/2026-07-10-onetime-historical-inbox-reconciliation/report.md` and `.json`.
- Source candidates found locally by metadata/count only:
  - `subscribed_email_audience_export_b12dfa345d.csv`: 1,311 rows.
  - `unsubscribed_email_audience_export_b12dfa345d.csv`: 152 rows.
  - `cleaned_email_audience_export_b12dfa345d.csv`: 60 rows.
  - `Rabbi Scheller Followers.xlsx`: 812 non-empty rows.
  - Older `subscribers.csv`: 88 rows, already covered by the June 16 small import lane.
  - Older `subscribers_detailed.csv`: 86 rows.
- Current live One Time Operations readback against `https://join.onetimeonetime.com` found 4 scoped parent leads, 12 CRM cards, 0 `one-time-list:rabbi-email-contacts` records, no-send true, and external-write false.
- Prior evidence remains partial only: the June 16 small import report covers 88 contacts, and the July 6 mailbox backfill covers 9 Resend received emails. Neither proves the complete historical import.
- Current provider mailbox login using the stored provider mailbox credential returned 401, so fresh Rabbi-provider mailbox thread counts could not be taken in this pass. The latest usable mailbox count evidence remains the July 6 backfill report.
- `npm run audit:governance` ran for closeout and reported broad pre-existing audit debt; its generated inventory did not list this new reconciliation folder, so the authoritative mapping for this lane is this register row, `DEC-20260710-004`, and the ledger/changelog records.
- `REQ-20260710-021` is terminal as `Needs operator decision` via `DEC-20260710-004`, not Done. Exact next action is to approve the canonical source package and suppression/import policy before any production import/write. No raw email addresses, contact exports, message bodies, received-email ids, subjects, provider credentials, or setup links were committed.

## Closeout Rules

- App-visible done requires pushed commit, verified One Time deploy target, live smoke, screenshots, and manual source-level review.
- Real email/WhatsApp sends, bulk campaigns, payments, access grants, DNS, credentials, and provider mutations remain approval-gated.
- Artifact completion does not close the underlying product requirement.
