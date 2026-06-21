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
