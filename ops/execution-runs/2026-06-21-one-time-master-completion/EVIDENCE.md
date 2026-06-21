# Evidence

## Batch 0

- Source pointer:
  `raw-input/RAW-20260621-001-one-time-master-completion-goal.md`
- Prior run preserved:
  `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`
- Successor run:
  `ops/execution-runs/2026-06-21-one-time-master-completion/`
- Preflight live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`
- Preflight live smoke machine output:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.json`
- Successor-run validation:
  `npm run bna:run:validate` passed on 2026-06-21T11:11:03+03:00.
- Secret audit:
  `node scripts/audit-secrets.mjs` passed with 0 tracked secret-risk files.
- Diff hygiene:
  `git diff --check` passed with LF/CRLF warnings only.

## Batch 1

- Protocol docs and templates:
  `AGENTS.md`, `BNA-START-HERE.md`, `docs/BNA-RAMBLE-TO-DONE.md`,
  `templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md`,
  `templates/BNA-CODEX-VERIFICATION-PROMPT.md`,
  `tasks-pending/_template-ramble-intake.md`,
  `tasks-pending/_template-goal-mode-correction-output.md`, and
  `tasks-pending/2026-06-16-prompt-intake-register.md`.
- Execution runner and schema:
  `scripts/bna-execution-run.mjs`,
  `ops/execution-runs/requirements.schema.json`, and
  `tests/bna-execution-run.test.js`.
- Intake schema:
  `src/lib/bna/intake-schema.js`.
- Task lifecycle pointer:
  `TASKS.md`.

<!-- batch-2:start -->
## Batch 2 Evidence

- Reconciliation Markdown: `ops/one-time-mishnah/master-backlog-reconciliation.md`
- Reconciliation JSON: `ops/one-time-mishnah/master-backlog-reconciliation.json`
- Current source rows: 99
- Legacy statement rows preserved: 1164
- Visible Tasks created: 0
- Visible Decisions created: 0
- Production mutations: 0
- External writes: 0
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Evidence

- Live Task/Decision production census:
  `ops/one-time-mishnah/task-decision-production-census.md`
- Live Task/Decision production census machine output:
  `ops/one-time-mishnah/task-decision-production-census.json`
- Reversible cleanup dry-run/apply report:
  `ops/one-time-mishnah/task-decision-production-cleanup.md`
- Reversible cleanup machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup.json`
- Applied cleanup summary:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.md`
- Applied cleanup summary machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.json`

Live cleanup applied through existing authenticated Task APIs:

- Wave 1: 144 planned, 144 applied, 0 failed.
- Wave 2: 1 planned, 1 applied, 0 failed.
- Total applied: 145 reversible task-row actions.
- Action counts: 5 One Time re-scopes, 1 internal handoff quarantine, 139 duplicate archives.
- Hard deletes: 0.
- Parent/student/payment/communication record mutations: 0.
- Final isolation: 0 BNA records in One Time and 0 One Time records in BNA.
- Deployed commit: `f8a2fd62`
- Railway deployment: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Batch 3 live smoke:
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 Evidence

Workspace user and role implementation is deployed and live-verified.

- Canonical role model:
  `src/lib/bna/one-time-role-model.js`
- Platform RBAC normalization and permissions:
  `src/platform/rbac/index.js`
- Server-side workspace membership, role audit, and scoped user APIs:
  `server.js`
- Operations scoped Users screen and real membership actions:
  `public/operations.html`
- Focused role/auth/UI tests:
  `tests/workspace-user-role-management.test.js`,
  `tests/one-time-role-auth-model.test.js`, and
  `tests/external-access-persistence-workflow.test.js`

Implemented behavior:

- Rabbi Ellie Scheller is the public-facing One Time owner/admin identity while
  legacy Rabbi name aliases remain accepted.
- Shloimie retains platform super-admin status and One Time workspace
  admin/manager access for intentional workspace switching.
- Canonical platform, workspace, and member roles are normalized and validated.
- The scoped Operations Users screen supports no-send Add Member / Invite User,
  Assign Role, Deactivate, Reactivate, reversible Remove Membership, and
  role-change audit readback.
- Server APIs enforce workspace scope and deny scoped managers platform-role
  assignment and cross-workspace membership mutation.
- Production external writes, sends, billing changes, and hard deletes: 0.

Deployment and live evidence:

- Implementation commit: `c8d93646`
- Pushed commit: `c8d93646`
- Deployed commit: `c8d93646`
- Railway deployment: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke:
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Focused live smoke confirmed:

- `/api/bna/workspace-users?workspace_key=rabbi_sheller_provider` is readable.
- `/api/bna/workspace-users/role-audit?workspace_key=rabbi_sheller_provider`
  is readable.
- One Time users are scoped to `rabbi_sheller_provider`.
- Canonical roles are visible in live readback.
- `bna_main` does not leak into the One Time workspace-user readback.
- Operations Users HTML contains Add Member and role-audit controls.
- The old Provider Users dead placeholder is absent.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Evidence

Visible action coverage is implemented, pushed, deployed, and live-verified.

- One Time action coverage report:
  `ops/action-registry/one-time-action-coverage.md`
- One Time action coverage machine-readable registry:
  `ops/action-registry/one-time-action-coverage.json`
- Operations UI action-label/setup-path changes:
  `public/operations.html`
- Automated coverage tests:
  `tests/one-time-action-coverage.test.js`
- Implementation/pushed commit:
  `90da952bf3a0c57ce60b4532e193f869a677df47`
- Railway deployment:
  `9c31c21f-143e-46f3-b95d-2b458a848d9f`
- Deployed commit:
  `90da952bf3a0c57ce60b4532e193f869a677df47`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`
- Focused visible-action live smoke:
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`

Implemented behavior:

- Required controls are mapped to working handlers, setup paths, or gated
  blockers: Add Member, Invite User, Assign Role, Add Class, Add Session,
  Add Appointment, Add Task, Create Decision, Create Draft, Configure
  Integration, Test Connection, Preview Upload, Attach Vimeo Video, Approve,
  Publish, Unpublish, Archive, Restore, Retry, and View Evidence.
- Generic `showNotConfigured(...)` placeholder buttons were removed from Help,
  provider website import, and settings Test/Reset actions.
- The only remaining `showNotConfigured(...)` call is the disabled workspace
  switch denial for a user who lacks access.
- One Time appointment, Vimeo upload, and recording retry controls open exact
  setup prompts instead of silently failing.
- External-write controls remain no-send, preview-only, setup-only, disabled, or
  exact-approval gated.
- Production HTML was checked for the changed task/decision, One Time class,
  session, appointment, video setup, integration setup, and helper setup-path
  controls, and for removal of the old generic placeholder handlers.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Evidence

Operations UI/design correction is deployed and live-verified.

- Operations UI implementation:
  `public/operations.html`
- Existing full UI audit harness extension:
  `scripts/full-ui-audit.mjs`
- Shared audit viewport configuration:
  `tools/ops-ui-audit/config.js`
- Updated focused UI/navigation/audit tests:
  `tests/operations-shell-navigation-contract.test.js`,
  `tests/operations-saas-crm-redesign.test.js`,
  `tests/bna-brand-shell.test.js`,
  `tests/ops-ui-audit-harness.test.js`, and
  `tests/one-time-operations-ui-smoke.test.js`
- Local Playwright Operations UI smoke:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`
- Production before-audit report:
  `ops/ui-audits/2026-06-21-batch6-before-prod/ui-audit-report.md`
- Production before-audit manifest:
  `ops/ui-audits/2026-06-21-batch6-before-prod/manifest.json`
- Production before-audit screenshot index:
  `ops/ui-audits/2026-06-21-batch6-before-prod/screenshot-index.csv`
- Production after-audit report:
  `ops/ui-audits/2026-06-21-batch6-after-prod/ui-audit-report.md`
- Production after-audit manifest:
  `ops/ui-audits/2026-06-21-batch6-after-prod/manifest.json`
- Production after-audit screenshot index:
  `ops/ui-audits/2026-06-21-batch6-after-prod/screenshot-index.csv`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`
- Focused Operations filter-rail live smoke:
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`

Before-audit coverage:

- Target mode: `batch6`
- Base URL: `https://bneineviimacademy.org`
- Screenshots: 141
- Errors: 0
- Viewports: 1440px, 1024px, 768px, 430px, 390px, 360px

After-audit coverage:

- Target mode: `batch6`
- Base URL: `https://bneineviimacademy.org`
- Screenshots: 141
- Errors: 0
- Viewports: 1440px, 1024px, 768px, 430px, 390px, 360px

Deployment and live evidence:

- Implementation commit: `c98c06d7735ec19dec1684684a594de0636064c7`
- Pushed commit: `c98c06d7735ec19dec1684684a594de0636064c7`
- Deployed commit: `c98c06d7735ec19dec1684684a594de0636064c7`
- Railway deployment: `d6c09c49-8372-42d7-8b3b-a049ab24ad63`
- Railway doctor: PASS
- Standard live smoke: PASS
- Focused Operations filter-rail live smoke: PASS at 430px, 390px, and 360px

Implemented behavior:

- The left side panel is primary module navigation only.
- The top rail uses current-module filters/subviews only.
- Module controls are no longer duplicated in the top horizontal rail.
- Filter rails render horizontally and remain single-row with local overflow
  scrolling instead of becoming vertical button stacks.
- Mobile and tablet layouts keep the filter rail horizontal and avoid page-wide
  horizontal overflow.
- Status chips and workspace context were compacted so toolbar text does not
  clip or overlap at desktop and mobile widths.

Intermediate live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T11-03-20-126Z-operations-filter-rail-live-smoke.md`
  failed because the smoke expected the Blocked filter ID to be `blocked`; the
  live app's stable ID is `pending`.
- `ops/live-smokes/2026-06-21T11-04-55-135Z-operations-filter-rail-live-smoke.md`
  failed because the smoke waited for Playwright `networkidle`; the Operations
  page remains active after DOM readiness. The successful rerun used explicit
  DOM selector waits.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 Evidence

WhatsApp UX is implemented, deployed, and live-verified without sending
WhatsApp messages or performing external writes.

- Operations WhatsApp UX implementation:
  `public/operations.html`
- Workspace-scoped/sanitized WhatsApp readback:
  `server.js`
- Scoped WAPI phonebook report builder:
  `src/lib/bna/wapi-phonebook-report.js`
- Focused tests:
  `tests/one-time-communications-workspace.test.js`,
  `tests/wapi-phonebook-report.test.js`, and
  `tests/communications-integrations-contract.test.js`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T11-33-08-112Z-live-app-smoke.md`
- Focused/repeatable WhatsApp UX live smoke:
  `ops/live-smokes/2026-06-21T11-47-26-966Z-whatsapp-ux-live-smoke.md`

Deployment and live evidence:

- Implementation commit: `b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`
- Pushed commit: `b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`
- Deployed commit: `b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`
- Railway deployment: `3265d380-9a93-488d-844f-f523367aa4e2`
- Railway doctor: PASS
- Standard live smoke: PASS
- Focused/repeatable WhatsApp UX live smoke: PASS

Implemented behavior:

- Desktop WhatsApp workspace remains three-pane: contact/conversation list,
  selected conversation, and details/related work.
- Mobile uses sequential pane state with List, Conversation, and Details
  navigation plus Back to list.
- Contact list cards show display name, phone/channel identity, workspace,
  role/classification, last preview, timestamp, review state, confidence,
  linked record summary, and open work indicator.
- Conversation timeline is chronological and combines local WhatsApp/WAPI
  communications, internal notes, Telegram notes, tasks, Decisions, and
  tickets.
- Details pane shows contact identity, workspace, linked records,
  parent/student/provider relationship hints, class/enrollment context,
  correction state, tasks, tickets, Decisions, and internal notes.
- Attachment metadata is summarized when available.
- Raw provider payloads are hidden by default.
- Send controls remain no-send and expose exact readiness/confirmation gates;
  the server still requires `SEND_WHATSAPP` before any real send.
- No GHL, GoHighLevel, LeadConnector, broadcast, external CRM write, or
  WhatsApp send path was introduced.

Live smoke covered:

- Production health and Operations login.
- Workspace-scoped WAPI phonebook readback for `rabbi_sheller_provider`.
- Sanitized `/api/bna/whatsapp/messages` readback with raw payloads hidden by
  default.
- Deployed Operations WhatsApp bundle markers for desktop three-pane workspace,
  mobile back navigation, and send-readiness gate.
- Live Communications > WhatsApp rendering at 1024px and 390px with no
  page-level horizontal overflow.
- Disabled send readiness and confirmation-gated WhatsApp controls.
- Absence of GHL, GoHighLevel, and LeadConnector UI terms.

Intermediate focused live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T11-31-29-921Z-whatsapp-ux-live-smoke.md`
  failed before app access because the clean PR worktree did not contain
  `.env.local`.
- `ops/live-smokes/2026-06-21T11-33-10-414Z-whatsapp-ux-live-smoke.md`
  failed on a stale selector; the deployed Operations root is `#app`.
- `ops/live-smokes/2026-06-21T11-34-54-870Z-whatsapp-ux-live-smoke.md`
  failed because the smoke expected a legacy `success` wrapper on
  `/api/bna/whatsapp/messages`; the live contract returns a sanitized
  `messages` array.
- `ops/live-smokes/2026-06-21T11-35-53-288Z-whatsapp-ux-live-smoke.md`
  failed because an ad hoc DOM check assumed an empty message dataset should
  force an empty phonebook view; the phonebook workspace can still render local
  phonebook records or its own empty state.
- `ops/live-smokes/2026-06-21T11-41-52-261Z-whatsapp-ux-live-smoke.md`
  failed because Playwright waited for visible state on a responsive workspace
  pane; the final smoke waits for DOM attachment and then asserts actual
  desktop/mobile rendered state.
- `ops/live-smokes/2026-06-21T11-45-19-349Z-whatsapp-ux-live-smoke.md`
  repeated the same visible-state wait issue before the attached-state smoke
  rerun passed.
<!-- batch-7:end -->

<!-- batch-8:start -->
## Batch 8 Evidence - Email and Resend UX

Requirement: `REQ-20260621-504`

Status: done / deployed / verified live

Implementation evidence:

- Operations Email/Resend UI, disabled send controls, webhook-event readback,
  and Communications > Settings integration panel:
  `public/operations.html`
- Resend health, domain/status/events, webhook, draft, send, DNS, and recipient
  scope server paths:
  `server.js`
- Resend client readiness, send approval, Svix webhook verification, safe event
  summary storage, and mocked webhook processing:
  `src/lib/integrations/resend-client.js`
- Resend API-key versus sender/domain Railway propagation split:
  `scripts/provider-env-railway-propagate.mjs`
- Focused live smoke script:
  `scripts/smoke-email-resend-ux-live.mjs`
- Integration handoff:
  `docs/integrations/RESEND.md`
- Sender/domain Decision:
  `ops/one-time-mishnah/resend-sender-domain-decision.md`
- Focused tests:
  `tests/resend-client.test.js`,
  `tests/communications-integrations-contract.test.js`,
  `tests/one-time-communications-workspace.test.js`, and
  `tests/provider-env-railway-propagate.test.js`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T12-12-08-310Z-live-app-smoke.md`
- Focused Email/Resend UX live smoke:
  `ops/live-smokes/2026-06-21T12-10-31-966Z-email-resend-ux-live-smoke.md`
- Resend Railway API-key propagation dry run:
  `ops/qa-runs/2026-06-21T12-08-03-312Z-provider-env-railway-propagation.md`
- Resend Railway API-key propagation apply:
  `ops/qa-runs/2026-06-21T12-08-11-738Z-provider-env-railway-propagation.md`

Deployment and live evidence:

- Implementation commit: `fdd39bf327356675f8006bcc4ce04425061ef57e`
- Final pushed commit: `847649198dfaf9f12fd69db958c3f927b460ecd8`
- Deployed commit: `847649198dfaf9f12fd69db958c3f927b460ecd8`
- Railway deployment: `3ec03a01-2141-401f-988f-a734176a778c`
- Railway doctor/poll: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS
- Focused Email/Resend UX live smoke: PASS

Implemented behavior:

- Email operations are usable as local drafts/readbacks without live sends.
- Provider API readiness is separate from sender identity and domain readiness.
- Domain list/status endpoints are readable or return safe setup blockers.
- Webhook events require Resend Svix signatures and raw request body
  verification when the signing secret is configured.
- Webhook processing stores safe event summaries, not raw email bodies, and the
  readback endpoint hides payload by default.
- Recipient draft creation rejects known cross-workspace/project recipient
  conflicts.
- `DEC-RESEND-SENDER-DOMAIN-IDENTITY` exists for the sender/domain/from/reply-to
  decision.
- Resend API-key propagation is independent from sender/domain propagation,
  and was applied to Railway with no secret values printed.

Live smoke covered:

- Production health and Operations login.
- Resend readiness shape, including configured, connected, sender, domain,
  domain verification, and send gate booleans.
- Live `RESEND_API_KEY` readback (`configured: true`) with sender/domain/send
  readiness still blocked.
- Resend domain endpoint safe readback with one connected domain.
- Resend webhook events endpoint with raw payload hidden by default.
- Live Communications > Email rendering at 1024px and 390px.
- Communications > Settings Resend panel rendering at 1024px and 390px.
- Disabled email send controls and no page-level horizontal overflow.

Intermediate focused live-smoke failure recorded:

- `ops/live-smokes/2026-06-21T12-03-06-468Z-email-resend-ux-live-smoke.md`
  failed because the smoke expected the communications integration panel in
  Communications > Settings while the live app still rendered a placeholder
  there. The UI was corrected to render the real panel from that subtab, then
  redeployed and rerun successfully.
- `ops/live-smokes/2026-06-21T12-06-50-692Z-email-resend-ux-live-smoke.md`
  passed the UI/no-send contract before `RESEND_API_KEY` propagation. The final
  post-propagation smoke above verified the live key/domain readback.
<!-- batch-8:end -->

<!-- batch-9-10:start -->
## Batch 9/10 Evidence - Product, Scheduling, Booking, And Portal Foundations

Requirement: `REQ-20260619-306`

Status: base slice deployed / verified live; parent requirement reopened for
new child requirements

Implementation evidence:

- Product offer, availability, appointment intent, and portal foundation
  contracts: `src/lib/bna/one-time-product-system.js`
- Scoped server readback and internal create routes:
  `server.js`
- Forward-only schema and safe seed data:
  `railway-migration-2026-06-16-one-time-product-system.sql`
- Operations Provider Workspace panels and actions:
  `public/operations.html`
- Focused live smoke script:
  `scripts/smoke-one-time-product-booking-live.mjs`
- Focused tests:
  `tests/one-time-product-system.test.js`

Implemented behavior:

- Product offers include `membership_67_monthly` at 6700 cents as a candidate
  draft and `premium_masechta_intensive` as a fixed-duration decision-pending
  offer with upfront and weekly-installment support.
- Checkout, payment links, invoices, charges, refunds, access grants, and
  access automation remain disabled.
- Availability supports recurring rules, exceptions, blackout dates, Masechta
  windows, preparation/follow-up blocks, cancellations, rescheduling, and makeup
  classes without external calendar or Zoom writes.
- Appointment intents support consultation, placement call, parent progress
  call, student progress call, and office hours with buffers, booking window,
  cancellation cutoff, parent confirmation, private notes, parent-visible
  summary, and entitlement/payment requirement fields.
- Operations Add Class creates an internal One Time calendar event only.
- Operations Add Appointment creates an internal One Time appointment intent
  only.
- Parent, student, and provider portal foundations expose scoped section lists
  and loaded counts without BNA student data by default; student Join Class is
  gated until Zoom and entitlement validation are approved.

Deployment and live evidence:

- Implementation commit: `45ed36787ca519819a1adfb8f372267d96330a64`
- Pushed commit: `45ed36787ca519819a1adfb8f372267d96330a64`
- Deployed commit: `45ed36787ca519819a1adfb8f372267d96330a64`
- Railway deployment: `8c20ae67-9acc-43f2-b77d-c10fcd425d73`
- Railway doctor/poll: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-36-43-923Z-live-app-smoke.md`
- Focused One Time product/booking live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-38-45-981Z-one-time-product-booking-live-smoke.md`

Focused live smoke covered:

- Product offers readable with the $67 monthly membership and premium Masechta
  intensive contracts.
- Availability readable with the 7pm Israel rule.
- Parent/student/provider portal foundations readable, with student Join Class
  gated.
- Internal class-event creation and readback.
- Internal appointment-intent creation and readback.
- Operations schedule UI at 1440px and 390px with no page-level horizontal
  overflow.
- No payment, invoice, email, WhatsApp, Zoom meeting, access grant,
  participant invite, upload, or external calendar write.

Intermediate focused live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T12-36-42-823Z-one-time-product-booking-live-smoke.md`
  failed because the smoke waited for a native select to be visible after the
  app's select enhancer intentionally hid it. The smoke now waits for DOM
  attachment.
- `ops/live-smokes/2026-06-21T12-38-15-716Z-one-time-product-booking-live-smoke.md`
  failed because the smoke over-flagged an unrelated in-app `Send` control. The
  forbidden-action check now targets external sends, Zoom, and payment actions.

Follow-up split:

- `RAW-20260621-002` split parent `REQ-20260619-306` into child requirements
  `REQ-20260621-901` through `REQ-20260621-910`.
- Parent `REQ-20260619-306` must remain open until those child requirements
  reach terminal statuses with evidence or explicit blockers.
- Decision packet:
  `ops/one-time-mishnah/revenue-launch-parser-followup-decisions.md`
<!-- batch-9-10:end -->

<!-- batch-9A:start -->
## Batch 9A Evidence - Source-Envelope And Mixed-Context Parser V2

Requirement: `REQ-20260621-901`

Status: done / deployed / verified live

Implementation evidence:

- Source-envelope classifier and local segment context routing:
  `src/platform/ingestion/intake-source.js`
- W3 parser output source-envelope and per-item context metadata:
  `src/platform/ingestion/canonical-parser.js`
- Canonical intake parser item-level workspace/project assignment:
  `src/lib/bna/intake-parser.js`
- Live intake parse route filename/title handoff:
  `server.js`
- Focused dry-run live smoke script:
  `scripts/smoke-source-envelope-parser-live.mjs`
- Focused tests:
  `tests/ingestion/w3-intake-source.test.js`,
  `tests/ingestion/w3-parser-queue.test.js`,
  `tests/intake-parser-workspace-ambiguity.test.js`

Implemented behavior:

- Source envelopes include source ID/hash, filename/title, source channel,
  upload time, source date, uploader, language, default workspace/project,
  default context type, source-level confidence, privacy level, parser version,
  processing status, source kind, and local override records.
- Supported context types are `class_recording`, `family_meeting`,
  `provider_meeting`, `operations_ramble`, `crm_spreadsheet`,
  `content_recording`, `mixed`, and `unknown_needs_review`.
- Filename/title defaults route Dratler family meetings to
  `dratler_family`, Rabbi Scheller/One Time class cues to
  `rabbi_sheller_provider` / `one_time_mishnah_class`, Operations rambles to
  `internal_super_admin` / `bna_operations`, CRM spreadsheets to the
  first-party Operations CRM path, and content recordings to BNA content.
- Local fragments such as `Operations task:` override the source default for
  the individual parsed item and preserve the decision in
  `metadata.source_context`.
- The live `/api/bna/intake/parse` path now passes filename/source title into
  the parser and parse-run metadata, so app/API parsing sees the same envelope
  inputs as local W3 source records.

Deployment and live evidence:

- Implementation commit: `efe1d86d194cef483f5d6d9d418a769e20800989`
- Pushed commit: `efe1d86d194cef483f5d6d9d418a769e20800989`
- Deployed commit: `efe1d86d194cef483f5d6d9d418a769e20800989`
- Railway deployment: `c1623618-a00c-46d0-8be9-5a8e4102b376`
- Railway doctor/poll: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-21-50-721Z-live-app-smoke.md`
- Focused source-envelope parser live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-22-11-379Z-source-envelope-parser-live-smoke.md`

Focused live smoke covered:

- Authenticated production `/api/bna/intake/parse` dry-run parser path.
- Synthetic Dratler-family filename default classified as
  `family_meeting` with `dratler_family` workspace/project.
- Required envelope fields present in live response.
- Embedded `Operations task:` item locally routed to
  `internal_super_admin` / `bna_operations`.
- No parse-run apply, task filing, external send, billing, Zoom, Vimeo,
  Buffer, DNS, CRM/GHL, or external-account write.

QA caveat:

- A broader `tests/one-time-intake-api-readback.test.js` run still fails on a
  pre-existing HEAD fixture mismatch: the auth helper returns
  `Rabbi Ellie Scheller`, while the test expects `Rabbi Elie Scheller`. The
  Batch 9A parser/W3/media-routing suites passed and no Batch 9A code changes
  touched the One Time owner-name helper.
<!-- batch-9A:end -->

<!-- batch-9B:start -->
## Batch 9B Evidence - Today's Class-Upload Trace

Requirement: `REQ-20260621-902`

Status: blocked / live blocker verified

Trace evidence:

- Live content job: `#78`
- Title: `Drive Class Sunday balak`
- Source type: `google_drive`
- Project: `bna`
- Created at: `2026-06-21T10:04:38.843Z`
- Drive stage/status after closeout: `02 Ingesting` / `blocked`
- Drive file: `Class Sunday balak.m4a`
- Dry-run result:
  `would_update: transcribe_and_patch_existing_job`, no production mutation.
- Actual reprocess attempt:
  `node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --parse`
- Actual blocker:
  hosted transcription rejected the configured credential with
  `401 invalid_credential` before transcript text or a parse run could be
  saved.

Implementation/evidence files:

- Repeatable focused live smoke:
  `scripts/smoke-class-upload-trace-live.mjs`
- NPM command:
  `npm run app:smoke:class-upload-trace -- 78`
- Focused live smoke report:
  `ops/live-smokes/2026-06-21T13-37-45-376Z-class-upload-trace-live-smoke.md`
- Standard live smoke report:
  `ops/live-smokes/2026-06-21T13-37-11-961Z-live-app-smoke.md`

Safety evidence:

- The live job notes were patched to a sanitized Batch 9B blocker summary.
- Focused smoke verified the notes contain no secret-like credential material.
- Focused smoke verified transcript chars remain `0`.
- Focused smoke verified no parse run exists for source type
  `content_recording` and source id `78`, because the blocker occurred before
  transcription completed.
- No parse-run apply, task filing, external send, billing, Zoom, Vimeo, Buffer,
  DNS, CRM/GHL, WhatsApp, email, or external-account write was performed.

Closeout result:

- `REQ-20260621-902` is terminal as `blocked`.
- Blocker owner: operator/keyholder.
- Next action: fix or rotate the hosted transcription credential, then rerun
  `node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --parse`
  with live env and Drive credentials.
<!-- batch-9B:end -->

<!-- batch-9C:start -->
## Batch 9C Evidence - Downloads Spreadsheet Inventory

Requirement: `REQ-20260621-903`

Status: done / verified locally

Implementation evidence:

- Repeatable inventory script:
  `scripts/inventory-download-spreadsheets.mjs`
- Package command:
  `npm run inventory:downloads-spreadsheets`
- Privacy regression test:
  `tests/downloads-spreadsheet-inventory.test.js`
- Redacted inventory JSON:
  `ops/one-time-mishnah/downloads-spreadsheet-inventory.json`
- Redacted inventory Markdown:
  `ops/one-time-mishnah/downloads-spreadsheet-inventory.md`

Inventory result:

- Source directory: Downloads; absolute path intentionally omitted in outputs.
- Files inventoried: 203
- Import candidates: 56
- Classification counts:
  - `one_time_rabbi_scheller_followers`: 1
  - `email_audience_export`: 5
  - `legacy_crm_or_pipeline_export`: 29
  - `contact_list_candidate`: 21
  - `external_lead_list`: 48
  - `communications_export`: 13
  - `accounting_export`: 2
  - `import_mapping_reference`: 2
  - `research_or_campaign_working_file`: 4
  - `unknown_spreadsheet`: 78

Import-candidate findings:

- `Rabbi Scheller Followers.xlsx` is the highest-priority One Time CRM import
  candidate.
- `subscribed`, `unsubscribed`, `cleaned`, and `subscribers` audience exports
  need email-audience reconciliation before any send.
- Historical GHL/opportunity/pipeline exports are inventory-only migration
  candidates for first-party BNA Operations CRM and dedupe planning.
- Communication logs and accounting exports are marked as references, not
  immediate CRM import files.

Privacy and scope guardrails:

- No spreadsheet rows, email addresses, phone numbers, names, raw headers,
  formulas, or private export contents were committed.
- Filename labels are redacted for provider/account-like tokens; original
  source names are represented by hashes where needed.
- Historical GHL/GoHighLevel/LeadConnector-named exports did not create any
  GHL runtime, client, API key, env var, route, schema, dashboard control, or
  connector.
- No production data import, CRM write, email send, WhatsApp send, billing,
  deploy, or external-account write was performed.
<!-- batch-9C:end -->

<!-- batch-12:start -->
## Batch 12 Evidence - Zoom Meeting And Attendance Foundation

Requirement: `REQ-20260619-307`

Status: done / deployed / verified live

Implementation evidence:

- Zoom API/token/cache/request-builder/webhook/attendance helpers:
  `src/lib/integrations/zoom.js`
- Zoom status route expanded with API readiness, workflow foundation, and
  webhook-processing preview: `server.js`
- Operations Live Classes Zoom readiness panel:
  `public/operations.html`
- Route registry metadata:
  `ops/route-registry.json`
- Forward-only internal Zoom foundation schema:
  `railway-migration-2026-06-16-one-time-product-system.sql`
- Focused live smoke script:
  `scripts/smoke-one-time-zoom-attendance-live.mjs`
- Focused tests:
  `tests/one-time-zoom-attendance-automation.test.js`

Implemented behavior:

- Token retrieval uses Server-to-Server OAuth credentials and cache support
  with secrets redacted from readiness output.
- Meeting request builder enforces unique meeting per session, no PMI,
  generated passcode path, waiting room, join-before-host disabled,
  registration enabled, and no student host-start URL exposure.
- Registrant request builder stages protected join references without returning
  raw join URLs to students.
- Report readers are modeled for participant reports, recordings, transcripts,
  and summaries without live reads in this batch.
- Webhook plan includes signature verification, replay protection, idempotency,
  quick acknowledgement, queued processing, retry, and dead-letter state.
- Attendance reconciliation ignores dashboard clicks, merges reconnects, and
  maps Zoom join/leave data to on-time, late, partial, absent, excused, or
  technical-issue states with audit-ready correction metadata.
- Internal tables model Zoom meetings, occurrences, registrants, join
  references, webhook events, participant events, attendance results, assets,
  retry jobs, and audit events.

Deployment and live evidence:

- Implementation commit: `7685133a6e675db6883135eb775ae4cae6b44ad2`
- Pushed commit: `7685133a6e675db6883135eb775ae4cae6b44ad2`
- Deployed commit: `7685133a6e675db6883135eb775ae4cae6b44ad2`
- Railway deployment: `b2d02f20-64a8-4183-9dba-3587d0449ef7`
- Railway doctor/poll: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-55-46-834Z-live-app-smoke.md`
- Focused One Time Zoom/attendance live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-56-08-966Z-one-time-zoom-attendance-live-smoke.md`

Intermediate focused live-smoke failure recorded:

- `ops/live-smokes/2026-06-21T12-54-52-064Z-one-time-zoom-attendance-live-smoke.md`
  failed because the smoke-script secret check matched safe status field names
  such as `host_start_url_returned_to_students`. The script now checks actual
  secret-like values and Zoom start-token patterns instead.

Focused live smoke covered:

- Authenticated Zoom status/readiness readback without exposing secret-like
  values, host start URLs, or access tokens.
- Zoom workflow foundation, webhook processing plan, and blocked meeting-create
  route.
- Session automation and webhook attendance preview routes.
- Operations Live Classes Zoom readiness panel at 1440px and 390px without
  page-level horizontal overflow.
- No Zoom meeting, registrant, webhook attendance write, attendance correction,
  recording read, transcript read, summary read, external send, portal publish,
  participant invite, or host-start URL exposure.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 Evidence - Vimeo, Member Library, Recording, Transcript, And Publication Pipeline

Requirement: `REQ-20260619-308`

Status: done / deployed / verified live

Implementation evidence:

- Vimeo selected-provider/readiness/manual workflow/automated upload and
  publication lifecycle helpers:
  `src/lib/integrations/video-hosting.js`
- One Time class package, asset, package-preview, member-preview,
  approve-library, publish-library, rollback, library-smoke, and package
  metadata routes: `server.js`
- Operations Class Package Manager and Vimeo/recording readiness UI:
  `public/operations.html`
- Member library horizontal filters, grouping, metadata, assets, and local
  watch-progress UI: `public/member-library.html`
- Forward-only class-session metadata columns:
  `railway-migration-2026-06-16-one-time-product-system.sql`
- Vimeo direction and setup documentation:
  `docs/integrations/VIMEO.md`,
  `docs/integrations/onetime-vimeo-zoom-resend-readiness.md`
- Focused live smoke script:
  `scripts/smoke-one-time-vimeo-member-library-live.mjs`
- Focused tests:
  `tests/one-time-recording-vimeo-pipeline.test.js`,
  `tests/one-time-member-library.test.js`

Implemented behavior:

- Vimeo is the recorded One Time video-hosting direction.
- Manual Vimeo URL validation extracts and persists the Vimeo video ID.
- Class packages persist Masechta, Perek, Mishnah range, class date, duration,
  thumbnail, transcript state, description, summary, source-sheet draft, and
  source assets.
- Review, approval, publish, smoke/member visibility, rollback, and package
  archive paths are real first-party actions.
- Automated Vimeo upload readiness is visible but disabled until a user-level
  token and account details are authorized.
- Automated upload foundation models token/setup, idempotency, resumable upload,
  progress, retry/failure, title/description/privacy/folder update, transcode
  polling, thumbnail retrieval, playback/embed verification, final Vimeo ID
  storage, and audit trail without enabling real upload.
- Recording/publication lifecycle supports scheduled through archive states,
  review queues, reprocessing/retry, correction, rejection, approval,
  publication, unpublish, retention policy, and deletion gates.
- Member library filters render horizontally and include grouping, duration,
  progress, continue-watching, assets, empty/loading/error states, and mobile
  behavior.

Deployment and live evidence:

- Implementation commit: `37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92`
- Pushed commit: `37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92`
- Deployed commit: `23e16a126f6e7461858b5701f2dbd2ba719a35c7`
- Railway deployment: `38393641-ee8e-46ed-8daf-16e67b1cde2a`
- Railway doctor/poll: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-37-16-293Z-live-app-smoke.md`
- Focused One Time Vimeo/member-library live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-37-41-388Z-one-time-vimeo-member-library-live-smoke.md`
- Source-envelope parser regression smoke on the same current deployed bundle:
  PASS,
  `ops/live-smokes/2026-06-21T13-38-09-230Z-source-envelope-parser-live-smoke.md`

Focused live smoke covered:

- Authenticated video-hosting status/readiness readback with Vimeo selected,
  manual fallback ready, automated API upload disabled, lifecycle present, and
  no secret-like values exposed.
- Temporary One Time class package creation with Vimeo URL, validated Vimeo ID,
  Masechta/Perek/Mishnah metadata, duration, thumbnail, and approved transcript
  state.
- Source asset attachment, package-preview manual Vimeo readiness, member
  preview, approval, publish to smoke-scoped library visibility/tier, rollback
  of the library item, member-library smoke rollback, and archive of the
  temporary class.
- Operations content/library UI at 1440px and 390px without page-level
  horizontal overflow.
- Public member-library filter/grouping/progress UI at 1440px and 390px with
  horizontal filter rail behavior.

Cleanup and safety evidence:

- Follow-up production API check found
  `active_unarchived_codex_vimeo_smoke_classes: 0`.
- No Vimeo upload, provider publish/unpublish/delete, OAuth exchange, email,
  WhatsApp, payment, Zoom meeting, participant invite, real member access
  grant, DNS, or external portal write was performed.

Intermediate live-smoke failures recorded:

- `ops/live-smokes/2026-06-21T13-21-13-527Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke omitted the `smoke` tier when checking preview
  visibility; the app correctly hid the smoke item until the smoke sent a
  matching tier.
- `ops/live-smokes/2026-06-21T13-21-36-456Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke targeted the legacy content section name instead of
  `section=one_time_library`; the final smoke targeted the deployed panel and
  passed.
<!-- batch-11-13:end -->

<!-- batch-9D:start -->
## Batch 9D Evidence

Requirement: `REQ-20260621-904`

Status: done / deployed / verified live

Implementation evidence:

- Scoped import preview hardening in `server.js`:
  `contactImportPreviewScope`, `contactImportSourceFromBody`,
  `contactImportDedupeKey`, scoped duplicate lookup, raw `source_row` stripping,
  preview-only import policy, no-send flags, no local write, no external write,
  and forbidden GHL/LeadConnector runtime metadata.
- One Time CRM import readiness in `server.js`:
  `oneTimeCrmImportPreviewReadiness`, metadata-only inventory summary,
  candidate source list, current scoped lead counts, dedupe policy, and
  read-only `/api/bna/one-time/crm-import-preview` route.
- Operations UI in `public/operations.html`:
  `renderOneTimeCrmImportPreviewPanel`, candidate source cards, One Time scoped
  counts, Preview Mapping navigation, Open Import Decision navigation, and
  disabled Apply Import with explicit approval blocker.
- Focused live smoke script:
  `scripts/smoke-one-time-crm-import-dedupe-live.mjs`.
- Focused tests:
  `tests/communications-screening-import-ui.test.js`,
  `tests/downloads-spreadsheet-inventory.test.js`,
  `tests/one-time-product-system.test.js`,
  `tests/one-time-communications-workspace.test.js`,
  `tests/communications-integrations-contract.test.js`, and
  `tests/assistant-portal-communications-contract.test.js`.

Implemented behavior:

- Import previews are workspace/project scoped and return
  `rabbi_sheller_provider` / `one_time_mishnah_class` metadata.
- Duplicate lookup is constrained to the resolved One Time project/workspace.
- Preview rows carry scoped deterministic dedupe keys, dedupe basis metadata,
  and omit raw source rows.
- Preview responses and One Time readiness responses are dry-run/no-send with
  `external_write_performed: false`, `external_crm_write_performed: false`, and
  `local_write_performed: false`.
- Warm leads remain no-send until explicit approval; commit remains blocked
  until the operator approves contact import with `APPROVE_CONTACT_IMPORT`.
- GHL/LeadConnector remain inactive and are represented only as forbidden
  external runtimes in guardrail metadata.
- The Batch 9C Rabbi Scheller follower inventory source is referenced by
  metadata/hash only; raw spreadsheet rows and private exports remain absent.
- Current CRM counts are scoped to the One Time project and do not return
  contact values or raw spreadsheet content.

Verification and live evidence:

- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-crm-import-dedupe-live.mjs`
- PASS `node --test tests/communications-screening-import-ui.test.js tests/downloads-spreadsheet-inventory.test.js`
- PASS `node --test tests/communications-screening-import-ui.test.js tests/downloads-spreadsheet-inventory.test.js tests/one-time-product-system.test.js tests/one-time-communications-workspace.test.js tests/communications-integrations-contract.test.js tests/assistant-portal-communications-contract.test.js`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only
- Implementation/pushed/deployed commit:
  `aedb04aade8d518427b9f4df011c8b5a9d07f306`
- Railway deployment:
  `4919c095-6301-4806-a712-0d64b4d01850`
- Railway doctor/poll:
  PASS, deployment status `SUCCESS`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T14-03-28-563Z-live-app-smoke.md`
- Focused One Time CRM import/dedupe live smoke:
  `ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md`

Focused live smoke covered:

- Read-only `/api/bna/one-time/crm-import-preview` readiness route.
- Operations CRM Import Preview panel with disabled Apply Import.
- Operations login and authenticated live preview POST to
  `/api/bna/contact-imports/preview`.
- Synthetic `.invalid` CSV rows only.
- Source inventory ID `DL-SHEET-f93f34d98e` and source hash echoed as metadata.
- Scope `rabbi_sheller_provider / one_time_mishnah_class`.
- Two preview rows with dedupe keys, no-send/write flags, and
  `import_status: preview_only_approval_required`.
- No raw `source_row` returned.
- No contact, tag, email, WhatsApp, external CRM, GHL/LeadConnector, billing,
  or local import write.
<!-- batch-9D:end -->

<!-- batch-9E:start -->
## Batch 9E Evidence - CRM Contacts UX

Requirement: `REQ-20260621-905`

Status: done / deployed / verified live

Implementation evidence:

- Operations One Time CRM Contacts UX, CRM Contacts tab, scoped counts,
  no-send/dedupe/source/communications columns, and guarded direct actions:
  `public/operations.html`
- Selected workspace/project parent-lead scoping and project metadata readback:
  `server.js`
- Focused live smoke script and package command:
  `scripts/smoke-one-time-crm-contacts-ux-live.mjs`, `package.json`
- Focused tests:
  `tests/operations-contacts-intake-cleanup.test.js`,
  `tests/operations-module-scoping.test.js`, and
  `tests/one-time-communications-workspace.test.js`

Implemented behavior:

- Operations passes `workspaceDataProjectFilters()` into `api.getParentLeads`.
- `/api/bna/parent-leads` honors selected workspace/project query scope using
  `appendRequestedProjectScopeCondition`.
- Provider Contacts has a CRM Contacts tab and count for One Time scoped rows.
- The CRM table combines scoped One Time parent leads, product-interest leads,
  and member/access rows.
- Each row surfaces record status, source/status, no-send state,
  dedupe/review state, communication linkage, next action, and a direct action
  cell.
- Duplicate email/phone keys inside the One Time scoped dataset are marked for
  duplicate contact review.
- Product-interest and member rows stay no-send and route to internal review
  surfaces only.
- Private BNA goals, check-ins, admin notes, and school-only student data are
  explicitly excluded from the One Time Contacts copy and scoped fetch path.

Verification and live evidence:

- PASS `node --test tests/operations-contacts-intake-cleanup.test.js tests/operations-module-scoping.test.js tests/one-time-communications-workspace.test.js`
  with 15/15 tests passing.
- PASS `node --check server.js`
- PASS `node --check scripts/smoke-one-time-crm-contacts-ux-live.mjs`
- PASS `node scripts/audit-secrets.mjs`
- PASS `git diff --check` with line-ending warnings only.
- PASS `npm run watchdog:actions`
- PASS `npm run railway:doctor` after final deployment
  `bf53e21c-a793-4af8-8630-a0e855d857c7`.
- PASS standard live smoke:
  `ops/live-smokes/2026-06-21T14-25-34-360Z-live-app-smoke.md`
- PASS focused One Time CRM Contacts UX live smoke:
  `ops/live-smokes/2026-06-21T14-25-06-483Z-one-time-crm-contacts-ux-live-smoke.md`

Deployment and live evidence:

- Implementation commit: `b2371cdc5a58fabb70ba1e764ead9dbe3d0eb7e8`
- Final pushed/deployed commit:
  `35db6c0e876243e61e7bce2f94db787a44626f06`
- Railway deployment:
  `bf53e21c-a793-4af8-8630-a0e855d857c7`
- Focused live smoke counts:
  88 scoped One Time parent leads, 88 rows with returned
  `project_key=one_time_mishnah_class`, and 94 scoped contact communications.

Guardrails:

- No email send, WhatsApp send, payment write, external CRM write, GHL,
  GoHighLevel, LeadConnector, DNS mutation, billing write, bulk campaign, or
  external-account write.
- Focused smoke records scoped counts and UI markers only; it intentionally
  avoids raw contact bodies and raw private notes.
- The first Railway deploy was run from a clean detached worktree at
  `b2371cdc5a58fabb70ba1e764ead9dbe3d0eb7e8`; after a newer pushed commit
  landed, the final deploy was rerun from a clean detached worktree at
  `35db6c0e876243e61e7bce2f94db787a44626f06`.

Known unrelated QA caveat:

- Full `npm test` is not currently green because stale/unrelated assertions
  fail in `tests/agent-control-center.test.js`,
  `tests/developer-tester-ticket-capture.test.js`, and
  `tests/ui-01-public-operations-shell.test.js`. The Batch 9E focused tests,
  syntax checks, action watchdog, deployment doctor, standard live smoke, and
  focused live smoke all passed.
<!-- batch-9E:end -->

<!-- batch-9F:start -->
## Batch 9F - Warm-Lead Trial And Referral Configuration

Status: done / deployed / verified live

Implementation evidence:

- Trial/referral policy defaults, policy acceptance storage contract, referral
  model, and readiness section:
  `src/lib/bna/one-time-product-system.js`
- Stripe local-beta preview/readiness helper with no billing writes:
  `src/lib/integrations/stripe.js`
- Product-system payload and direct
  `/api/bna/one-time/trial-referral-config` readback route:
  `server.js`
- Operations Trial / Referral Configuration panel:
  `public/operations.html`
- Durable forward migration for promotion policies, acceptance records,
  referral candidates, and manual referral-credit candidates:
  `railway-migration-2026-06-21-one-time-trial-referral-config.sql`
- Route registry and focused live-smoke command:
  `ops/route-registry.json`, `package.json`,
  `scripts/smoke-one-time-trial-referral-live.mjs`
- Focused local tests:
  `tests/one-time-stripe-local-beta.test.js`

Implemented behavior:

- Default warm-lead promotion is configurable as a 30-day intro trial with
  `$67` monthly renewal, renewal amount/date support, card-required rule, and
  one-intro-trial-per-household rule.
- Policy version and acceptance storage are modeled through local durable
  tables; public acceptance is not enabled.
- Referral reward is modeled as a manual month-credit candidate that activates
  only after trusted first-successful-paid-cycle evidence.
- Self-referral, duplicate reward, failed/refunded payment, and no-send
  suppression guardrails are represented for review.
- Real checkout sessions, live charges, subscriptions, payment links, access
  automation, and invoice credits remain disabled.
- The legal wording blocker reuses `DEC-20260621-901`; it blocks only public
  copy/live billing, not local test-mode configuration.

Local verification:

- PASS focused product/Operations suite: 25/25 tests.
- PASS focused Stripe/Rabbi/provider integration guardrail suite: 16/16 tests.
- PASS syntax checks for `server.js`, `src/lib/integrations/stripe.js`, and
  the focused live-smoke script.
- PASS execution-run validation, tracked secret audit, action watchdog, and
  diff check with line-ending warnings only.

Deployment and live evidence:

- App implementation commit:
  `32708bfa5aa1d673a44ed5765178081ad57dc3de`
- Local evidence commit before live closeout correction:
  `4edeef1fdbcf8dcc904ff578cb0ddccd2b62e1a4`
- Deployed app-visible commit:
  `32708bfa5aa1d673a44ed5765178081ad57dc3de`
- Railway deployment:
  `12249b2b-f11c-44b0-b9fa-ba75c511c633`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`
- Focused trial/referral live smoke:
  `ops/live-smokes/2026-06-21T14-50-38-537Z-one-time-trial-referral-live-smoke.md`

Focused live smoke verified:

- Production `/api/bna/one-time/trial-referral-config` returns
  `REQ-20260621-906`.
- Trial days: `30`.
- Renewal amount: `6700` cents.
- Card required: `true`.
- One intro trial per household: `true`.
- Referral trigger: `first_successful_paid_cycle`.
- Acceptance table: `bna_one_time_policy_acceptances`.
- Promotion policy count: `3`.
- Live charges, real invoice credits, and external writes are disabled.
- Operations ships the trial/referral panel and no-write guardrail copy.

Guardrails:

- No card charge, checkout session, payment link, subscription, invoice,
  invoice credit, email send, WhatsApp send, access grant, external CRM write,
  GHL/LeadConnector runtime, DNS mutation, or secret exposure was performed.
<!-- batch-9F:end -->

<!-- batch-9G:start -->
## Batch 9G - Payment-To-Access And Class-Link Flow

Status: done / deployed / verified live

Implemented the One Time test-mode payment-to-access and class-link readiness
surface. The shared product-system helper now models paid test/manual checkout
state, approved-local-test-event access gating, and relationship-scoped class
link visibility without creating charges, payment links, subscriptions, access
grants, sends, external CRM writes, Zoom meetings, raw member Zoom URLs, or
Zoom host/start URLs.

Implemented files:

- Readiness helper and row views:
  `src/lib/bna/one-time-product-system.js`
- Product-system payload, member-scoped class-link sanitization, and focused
  `/api/bna/one-time/payment-access-class-links` route:
  `server.js`
- Operations Payment / Access / Class Links panel with active review actions
  and disabled Grant Access / Reveal Join Link blockers:
  `public/operations.html`
- Member page rendering uses protected class-link state instead of
  `session.zoom_url`:
  `public/js/rabbi-member.js`
- Route/action registry and focused live-smoke command:
  `ops/route-registry.json`, `ops/action-registry.json`, `package.json`,
  `scripts/smoke-one-time-payment-access-class-links-live.mjs`
- Focused tests:
  `tests/rabbi-checkout-access.test.js`,
  `tests/one-time-external-user-portal.test.js`

Local verification:

- PASS focused 9G/Rabbi/external-user suite: 40/40 tests.
- PASS broader focused product/Operations/workspace suite: 60/60 tests.
- PASS syntax checks for `server.js`, `public/js/rabbi-member.js`, and the
  focused 9G live-smoke script.
- PASS route/action registry JSON parse.
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS action watchdog:
  `ops/watchdog-audits/2026-06-21T15-05-watchdog-action-audit.md`
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed commit:
  `62715fd68ad0956d92134560af303ba9d5fc7720`
- Deployed commit:
  `53c66d204604ac94801a33bfa4c29306bdedb83b`
- Final active Railway deployment:
  `ec7724a3-76b9-4858-85e2-370af327759a`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T15-10-55-665Z-live-app-smoke.md`
- Focused payment/access/class-link live smoke:
  `ops/live-smokes/2026-06-21T15-11-14-543Z-one-time-payment-access-class-links-live-smoke.md`

Deployment note:

- Manual deploy from the clean detached worktree first reached Railway
  deployment `a0b6dcb5-a593-41f9-9743-bcc717d41730`. A later Railway status
  check showed active deployment
  `ec7724a3-76b9-4858-85e2-370af327759a` at `SUCCESS`, so standard and focused
  live smokes were rerun against the final active deployment and passed.

Focused live smoke verified:

- Production `/api/bna/one-time/payment-access-class-links` returns
  `REQ-20260621-907`.
- Payment state keeps live charges, checkout-session creation, payment-link
  creation, subscriptions, and external writes disabled.
- Access gate requires an approved local/test event and manual admin review;
  automated access grants and real grants from this flow are disabled.
- Class-link state requires member session plus active live grant, requires a
  protected reference, and does not return raw Zoom join URLs or host/start
  URLs.
- Operations ships the Payment / Access / Class Links panel marker, requirement
  ID, guardrail copy, disabled Grant Access action, and disabled Reveal Join
  Link action.
- Member portal script does not render `session.zoom_url` and instead renders
  the protected relationship-scoped join blocker.

Guardrails:

- No live charge, checkout session, payment link, subscription, invoice,
  invoice credit, access grant, email send, WhatsApp send, external CRM write,
  Zoom meeting, Zoom registrant, join redirect, DNS change, or secret exposure
  was performed.
- Existing access grants and checkouts are counted as read-only evidence only;
  the readiness route does not mutate them.
- Member-facing class links are represented as protected relationship-scoped
  readiness state. Raw Zoom join URLs and Zoom host/start URLs are not returned
  to members.
<!-- batch-9G:end -->

<!-- batch-9H:start -->
## Batch 9H - Authenticated Questions And Support-Ticket Bot

Status: done / deployed / verified live

Implemented authenticated One Time member questions and support tickets for
`REQ-20260621-908`.

Implemented files:

- Member question/support APIs, schema hardening, ticket/question views, and
  support-ticket context: `server.js`
- Member portal forms and API handlers: `public/rabbi-member.html`,
  `public/js/rabbi-member.js`
- Telegram support-ticket metadata/readback: `scripts/telegram-kimi-bridge.mjs`
- Classroom action-label compatibility: `public/operations.html`
- Route/action registry and live-smoke command: `ops/route-registry.json`,
  `ops/action-registry.json`, `package.json`
- Focused live smoke: `scripts/smoke-one-time-authenticated-support-live.mjs`
- Focused tests: `tests/one-time-member-support-questions.test.js`,
  `tests/one-time-external-user-portal.test.js`,
  `tests/rabbi-checkout-access.test.js`,
  `tests/developer-tester-ticket-capture.test.js`,
  `tests/one-time-classroom-calendar-community-bot.test.js`,
  `tests/one-time-action-coverage.test.js`

Local verification:

- PASS syntax checks for `server.js`, `public/js/rabbi-member.js`, and
  `scripts/smoke-one-time-authenticated-support-live.mjs`.
- PASS focused support/community suite: 19/19.
- PASS broader portal/member-library/classroom/action suite: 59/59.
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T15-29-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T15-29-watchdog-security-routes.md`
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `b71b14c5252ca2145b738e11fe4ab547bb412c3a`
- Core support-flow implementation commit:
  `98b293d9b8957ec4567d8ede45f3e0d05bb1178b`
- Final Railway deployment:
  `977430a7-fa56-480d-9289-5abbd6536658`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T15-38-11-038Z-live-app-smoke.md`
- Focused authenticated support live smoke:
  `ops/live-smokes/2026-06-21T15-38-32-390Z-one-time-authenticated-support-live-smoke.md`

Focused live smoke verified:

- Member portal ships Private Questions and Support forms plus guarded API
  handlers.
- Logged-out support/question APIs reject requests without a member session.
- A disposable One Time member can open a dry-run member session.
- Authenticated member support creates `OT-SUP-######` scoped tickets.
- Project-visible staff replies return to the member while internal notes stay
  hidden.
- Authenticated private questions create `OT-Q-######` rows with no public
  forum, no member feed, no send, and no external write.
- Member lists return only sanitized own support/question rows.
- Ticket close creates no external-send notification.

Guardrails:

- No email send, WhatsApp send, SMS send, Telegram send, public forum post,
  member-feed publish, payment/billing write, access grant, external CRM write,
  GHL/LeadConnector runtime, Google/Zoom write, DNS mutation, or secret
  exposure was performed.
<!-- batch-9H:end -->

<!-- batch-9I:start -->
## Batch 9I - Test Identities And Mock Data

Status: done / deployed / verified live

Implemented a read-only, TEST-prefixed beta identity and mock data preview for
`REQ-20260621-909`.

Implemented files:

- Fixture builder and safety checks:
  `src/platform/instances/one-time-test-fixtures.js`
- Admin preview route and route allowlist: `server.js`
- Operations preview panel and disabled Apply/Cleanup blockers:
  `public/operations.html`
- Synthetic E2E artifact integration:
  `scripts/platform-synthetic-e2e.mjs`,
  `ops/parallel-runs/PARALLEL-20260619-001/integration-evidence/synthetic-e2e-acceptance.json`
- Route/action registry and live-smoke command:
  `ops/route-registry.json`, `ops/action-registry.json`, `package.json`,
  `scripts/smoke-one-time-test-identities-live.mjs`
- Focused tests:
  `tests/one-time-synthetic-pilot.test.js`

Local verification:

- PASS syntax checks for `server.js`, `scripts/platform-synthetic-e2e.mjs`, and
  `scripts/smoke-one-time-test-identities-live.mjs`.
- PASS focused 9I/security/action suite: 49/49.
- PASS `npm run platform:synthetic-e2e`.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T15-49-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T15-49-watchdog-security-routes.md`
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `f741fa91a909db89a79a33b6de5193c6c481732c`
- Railway deployment:
  `5751098c-2095-4d24-97db-712aba136915`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T15-52-36-326Z-live-app-smoke.md`
- Focused test-identity live smoke:
  `ops/live-smokes/2026-06-21T15-53-01-681Z-one-time-test-identities-live-smoke.md`

Focused live smoke verified:

- The preview API is admin-only, no-write, and scoped to
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- It returns eight `TEST-` identities with `example.test` contact values.
- It returns five mock records covering CRM, payment/access, class links,
  questions, and support.
- It returns twelve negative authorization cases.
- Cleanup is marked ready only for TEST-prefixed dry-run targets.
- Operations ships the preview panel plus disabled Apply Mock Data and Cleanup
  TEST Records blockers.

Guardrails:

- No real private exports, raw private rows, production record creation, email
  send, WhatsApp send, SMS send, Telegram send, payment/billing write, access
  grant, Zoom/Vimeo/Google mutation, DNS mutation, external CRM write,
  GHL/LeadConnector runtime, or secret exposure was performed.
<!-- batch-9I:end -->

<!-- batch-9J:start -->
## Batch 9J - Agent Mode End-To-End Acceptance

Status: done / deployed / verified live

Implemented read-only Agent Mode acceptance for `REQ-20260621-910` across the
currently credential-free One Time launch flow. The acceptance artifact covers
source-envelope parsing, CRM import/dedupe, trial/referral, payment/access/class
links, authenticated support/questions, and TEST-prefixed beta identities.

Implemented files:

- Acceptance builder: `src/platform/agent-control/one-time-acceptance.js`
- Acceptance evidence generator: `scripts/one-time-agent-mode-acceptance.mjs`
- Focused live smoke:
  `scripts/smoke-one-time-agent-mode-acceptance-live.mjs`
- Admin API and Operations panel: `server.js`, `public/operations.html`
- Route/action/package registration:
  `ops/route-registry.json`, `ops/action-registry.json`, `package.json`
- Generated acceptance evidence:
  `ops/one-time-mishnah/agent-mode-acceptance.json`,
  `ops/one-time-mishnah/agent-mode-acceptance.md`
- Focused tests: `tests/one-time-agent-mode-acceptance.test.js`

Local verification:

- PASS syntax checks for `server.js`,
  `scripts/one-time-agent-mode-acceptance.mjs`, and
  `scripts/smoke-one-time-agent-mode-acceptance-live.mjs`.
- PASS focused Agent Mode/action/readback suite: 17/17.
- PASS `npm run one-time:agent-mode-acceptance`.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T16-01-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T16-01-watchdog-security-routes.md`
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `6c45c4a4f5be60ae8b5dcceee66087f3d54430ae`
- Railway deployment:
  `b006acf0-41d5-458c-b661-2b673d8de1f7`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T16-05-41-875Z-live-app-smoke.md`
- Focused Agent Mode acceptance live smoke:
  `ops/live-smokes/2026-06-21T16-06-05-717Z-one-time-agent-mode-acceptance-live-smoke.md`

Focused live smoke verified:

- The production admin API returns the scoped acceptance artifact for
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Six credential-free stages are present and passing.
- External blockers are explicit for hosted transcription, Resend sender/domain
  fields, Vimeo user token, and separate One Time infrastructure.
- No live charges, real sends, external CRM/GHL writes, production mutations,
  private exports, Zoom/Vimeo/Google/DNS mutations, or secret-like values are
  reported.
- Operations renders the Agent Mode acceptance panel with active evidence/status
  controls and a disabled, explicitly blocked `Run Live Agent Mode` control.

Guardrails:

- No real Agent Mode external write run was performed. The acceptance mode is
  read-only and keeps live Agent Mode execution behind explicit authorization.
<!-- batch-9J:end -->

<!-- batch-14:start -->
## Batch 14 - Transcript Privacy

Status: done / deployed / verified live

Implemented `REQ-20260619-309` transcript privacy enforcement for One Time.
The code now models transcript review state, privacy class, timestamped segment
metadata, version metadata, Hebrew/Aramaic glossary metadata, and release audit
metadata on the existing `bna_class_sessions` anchor.

Implemented files:

- Transcript privacy policy: `src/lib/bna/transcript-privacy.js`
- Server storage fields, class APIs, member-safe redaction, and readiness route:
  `server.js`
- Operations readiness panel: `public/operations.html`
- Additive migration companion:
  `railway-migration-2026-06-21-one-time-transcript-privacy.sql`
- Focused smoke:
  `scripts/smoke-one-time-transcript-privacy-live.mjs`
- Tests and route registration:
  `tests/one-time-transcript-privacy.test.js`, `ops/route-registry.json`,
  `package.json`

Local verification:

- PASS syntax checks for `src/lib/bna/transcript-privacy.js`, `server.js`, and
  `scripts/smoke-one-time-transcript-privacy-live.mjs`.
- PASS focused transcript/member-library/recording/action suite: 24/24.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T16-23-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T16-23-watchdog-security-routes.md`
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `b89c17c0ec34a9ba871289afbec7b065c3a0d78f`
- Railway deployment:
  `7feae8ec-f34f-4e33-9e2d-9dcb479b1f14`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T16-25-45-794Z-live-app-smoke.md`
- Focused transcript privacy live smoke:
  `ops/live-smokes/2026-06-21T16-26-14-021Z-one-time-transcript-privacy-live-smoke.md`

Focused live smoke verified:

- The production transcript privacy route is One Time scoped and admin-only.
- The route returns `REQ-20260619-309`, `implemented_read_only`, no-write flags,
  no raw transcript body, no transcript body, no secret-like values, and no
  blockers.
- Raw transcript public RAG, cross-student retrieval, unreviewed segment
  retrieval, public helper raw transcript dump, and guessed-speaker-to-student
  mapping gates are all disabled.
- Operations renders the transcript privacy panel with guessed-speaker guardrail
  copy and `Live smoke ready` state.

Guardrails:

- No transcript content was written to student records.
- No raw transcript body, staff-private note, cross-student private segment,
  send, charge, public helper corpus mutation, Zoom/Vimeo/Google/DNS mutation,
  external CRM/GHL write, or secret exposure was performed.
<!-- batch-14:end -->

<!-- batch-15:start -->
## Batch 15 - Gamification

Status: done / deployed / verified live

Implemented `REQ-20260619-310` gamification completion. Server-side event
creation now awards automatic badges through the shared per-badge evaluator
instead of broad event-type/points matching. Rabbi-awarded badges remain
review-gated and can be awarded only through an audited admin/Rabbi endpoint
with student scope, source evidence, and a human reason. Manual badge reversal
now requires a reason and writes a badge audit event. The readiness route and
Operations panel remain read-only.

Implemented files:

- Badge policy and readiness: `src/lib/bna/gamification.js`
- Event-driven badge award path, manual reversal route, route allowlist:
  `server.js`
- Rabbi-awarded badge audit route:
  `server.js`, `ops/route-registry.json`
- Operations badge readiness copy: `public/operations.html`
- Route/package/smoke registration:
  `ops/route-registry.json`, `package.json`,
  `scripts/smoke-one-time-gamification-live.mjs`
- Focused tests:
  `tests/gamification-events.test.js`,
  `tests/one-time-gamification-badge-audit.test.js`

Local verification:

- PASS syntax checks for `src/lib/bna/gamification.js`, `server.js`, and
  `scripts/smoke-one-time-gamification-live.mjs`.
- PASS focused gamification suite: 13/13.
- PASS adjacent Operations/model/privacy suite: 12/12.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T16-38-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T16-38-watchdog-security-routes.md`
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `68e62775a0f0414427e6b5e6a592022c78d84742`
- Docs/status closeout commit:
  `93c07e05f0e640c4da1fc9bb86e78a85f1f56a0c`
- Railway deployment:
  `b6f0a4de-2857-4de0-9053-be0c74c7ab74`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T16-44-28-806Z-live-app-smoke.md`
- Focused gamification live smoke:
  `ops/live-smokes/2026-06-21T16-44-00-049Z-one-time-gamification-live-smoke.md`
- Intermediate standard smoke with scoped One Time credentials failed before
  final rerun:
  `ops/live-smokes/2026-06-21T16-44-00-563Z-live-app-smoke.md`

Focused live smoke verified:

- The production badge readiness route returns `REQ-20260619-310`,
  `implemented_read_only`, no-write flags, 11 automatic badges, 6
  Rabbi-awarded badges, and no blockers.
- Event-driven automatic badge pipeline and manual reversal pipeline are
  reported as implemented; Rabbi-awarded badge writes require the separate
  audited admin/Rabbi route.
- The readiness route does not award badges, reverse badges, notify anyone,
  grant access, create prizes/credits, or enable a public individual
  leaderboard.
- Operations renders the badge audit panel and no-leaderboard guardrails.

Guardrails:

- Focused smoke was read-only. No gamification event, badge award, badge
  reversal, parent/student notification, access grant, prize/coupon/credit,
  charge, external CRM/GHL write, Zoom/Vimeo/Google/DNS mutation, or secret
  exposure was performed.
<!-- batch-15:end -->

<!-- batch-16:start -->
## Batch 16 - Community

Status: done / deployed / verified live

Implemented `REQ-20260619-311` community moderation readiness as a no-write,
private-safe workflow. The contract now reports `implemented_read_only`, keeps
public promotion writes disabled, and exposes the complete private-to-public
review path: private student submission, Rabbi/moderator review, reviewer edit
or anonymization, visibility selection, linked original/published versions, and
no identifying private data publication.

Implemented files:

- Community moderation contract:
  `src/lib/bna/community-moderation.js`
- Operations readiness panel and copy:
  `public/operations.html`
- Focused live smoke:
  `scripts/smoke-one-time-community-live.mjs`
- Package and tests:
  `package.json`, `tests/one-time-community-moderation-workflow.test.js`

Local verification:

- PASS syntax checks for `src/lib/bna/community-moderation.js`, `server.js`,
  and `scripts/smoke-one-time-community-live.mjs`.
- PASS focused community/action suite: 14/14.
- PASS `npm run watchdog:actions`:
  `ops/watchdog-audits/2026-06-21T16-48-watchdog-action-audit.md`
- PASS `npm run watchdog:security`:
  `ops/watchdog-audits/2026-06-21T16-48-watchdog-security-routes.md`
- PASS `npm run bna:run:validate`.
- PASS tracked secret audit.
- PASS `git diff --check` with line-ending warnings only.

Deployment and live evidence:

- Implementation/pushed/deployed commit:
  `be7e46ae9fefd2ea9f31c403c114b008ec7fc899`
- Latest branch evidence commit before closeout:
  `c098a0ca22c13deafee67040f92c924384c27a1e`
- Railway deployment:
  `44220c69-fdb0-4796-96fc-80d39771e244`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T16-54-31-139Z-live-app-smoke.md`
- Focused community live smoke:
  `ops/live-smokes/2026-06-21T16-55-06-536Z-one-time-community-live-smoke.md`

Focused live smoke verified:

- The production community moderation route returns `REQ-20260619-311`,
  `implemented_read_only`, no-write flags, no blockers, body-free readiness,
  and no unrestricted student messaging.
- The private-to-public workflow exposes all six required steps and keeps
  public promotion writes disabled.
- Rabbi announcements, cohort discussions, private questions, parent-visible
  holds, staff-only notes, report/flag flow, private-to-public anonymization,
  no-unrestricted-messaging policy, and audit release readiness are present.
- Operations renders the community readiness panel, implemented no-write copy,
  private-to-public workflow, no-unrestricted-messaging guardrail, and
  `Live smoke ready` state.

Intermediate smoke caveat:

- The first standard/focused smoke attempts failed before making authenticated
  app requests because this PR worktree did not contain `.env.local`.
  The reruns loaded the established local env file into the process and passed.

Guardrails:

- No community thread, message, approval, parent-visible message, public post,
  staff note, notification, send, charge, Zoom/Vimeo/Google/DNS mutation,
  external CRM/GHL write, delete purge, or secret exposure was performed.
<!-- batch-16:end -->
