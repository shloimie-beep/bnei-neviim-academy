# Status

Status as of 2026-06-21T17:04:18+03:00.

Batch 0 and Batch 1 are done locally. The successor run is the single active
run. The execution CLI now validates structured requirements, reports the next
unblocked batch, lists external blockers, reports source coverage, and detects
stale evidence. The next executable batch is `REQ-20260621-501`, master backlog
reconciliation.

<!-- batch-2:start -->
## Batch 2 - Master Backlog Reconciliation

Status: done / verified local

Updated `ops/one-time-mishnah/master-backlog-reconciliation.md` and `ops/one-time-mishnah/master-backlog-reconciliation.json` for the June 21 active run. No visible Task fan-out, production mutation, external write, or app runtime change was performed.

Next unblocked batch after verification: `REQ-20260619-302` production Task and Decision cleanup.
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 - Production Task And Decision Cleanup

Status: done / deployed / verified live

Created the live production Task/Decision census and reversible cleanup tooling.
Applied only reversible production changes through existing authenticated task
APIs: One Time task re-scopes, one internal handoff quarantine, and
non-private duplicate fan-out archive actions. No hard deletes and no
parent/student/payment/communication records were mutated.

Final post-cleanup census:

- Tasks seen: 864
- Lane counts: Decisions 16, Blocked 14, Tasks 406, Calendar 18, Codex Queue 6, Completed/Activity 404
- Duplicate groups remaining in dry-run plan: 12
- Workspace isolation: 0 BNA records in One Time, 0 One Time records in BNA

The Operations UI/server changes for default Task and Decision views are
deployed in Railway deployment `89967278-38dc-49f3-a70d-4536c59f82f6` at
commit `f8a2fd62` and verified by standard plus focused live smokes.

Next unblocked batch: `REQ-20260619-303` workspace users and roles.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 - Workspace Users And Roles

Status: done / deployed / verified live

The canonical One Time role model now includes platform, workspace, and member
roles; Rabbi Ellie Scheller is the public-facing One Time owner/admin identity
with legacy aliases preserved; and Shloimie retains platform super-admin plus
One Time workspace admin/manager access.

The Operations Users screen now has real no-send workspace-user actions for Add
Member / Invite User, Assign Role, Deactivate, Reactivate, reversible Remove
Membership, and role-change audit readback. Server APIs enforce workspace scope,
block scoped users from assigning platform roles, and keep external sends and
account writes disabled.

Focused local verification passed with 58 tests and syntax checks. The safe
app-visible changes were deployed to Railway deployment
`04fde749-fca1-4e54-a7c4-f2ece847847b` at commit `c8d93646`. Standard live
smoke and focused workspace-user role live smoke passed.

Next unblocked batch: `REQ-20260621-502` visible action coverage.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 - Visible Action Coverage

Status: done / verified live

Created the One Time action coverage registry and report, mapped required
visible controls to handlers/endpoints/setup paths, and removed generic
placeholder actions from Help, provider website import, and settings Test/Reset.
Task/Decision creation now has visible Add Task and Create Decision actions,
One Time class/library controls use explicit labels, and gated appointment,
Vimeo upload, and recording retry controls open exact setup prompts.

Focused verification passed with 52 tests. The safe app-visible Operations UI
changes were pushed at `90da952bf3a0c57ce60b4532e193f869a677df47`, deployed to
Railway deployment `9c31c21f-143e-46f3-b95d-2b458a848d9f`, and verified by
standard plus focused visible-action live smokes.

Next unblocked batch: `REQ-20260619-304` Operations UI/design correction.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 - Operations UI And Design Correction

Status: done / deployed / verified live

Operations module navigation and top filters are now separated: the left side
panel renders primary modules, while the sticky top rail renders only the
current module's filters/subviews. The top filter rail is horizontal,
single-row, touch-scrollable, and keeps module buttons out of the toolbar.

The existing UI audit harness was extended rather than replaced. Batch 6 mode
captures the requested 1440px, 1024px, 768px, 430px, 390px, and 360px
viewports across Operations, communications, content/classroom/library,
settings/agents, One Time public, and portal surfaces. Production before-audit
evidence was captured before deploying the local fix, and after-audit evidence
was captured after Railway deployment `d6c09c49-8372-42d7-8b3b-a049ab24ad63`
at commit `c98c06d7735ec19dec1684684a594de0636064c7`.

Focused local verification, standard production smoke, production after-audit,
and focused Operations filter-rail live smoke passed. Next unblocked batch:
`REQ-20260621-503` WhatsApp UX.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 - WhatsApp UX

Status: base slice deployed / verified live; parent requirement reopened for
new child requirements

The existing first-party WAPI/Whapi workspace was extended rather than
replaced. Operations Communications > WhatsApp now keeps the desktop
phonebook/conversation/details model, adds sequential mobile pane state, shows
chronological local timelines, links related tasks, Decisions, tickets, and
internal/Telegram notes, and exposes explicit send-readiness gates without
sending WhatsApp messages.

Server readback for `/api/bna/whatsapp/messages` is workspace-scoped and hides
raw provider payloads by default. The WAPI phonebook report now supports a
workspace-scoped report for scoped One Time users while preserving account-wide
reporting for unscoped platform admins.

Focused local verification passed. The safe app-visible changes were pushed at
`b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`, deployed to Railway deployment
`3265d380-9a93-488d-844f-f523367aa4e2`, and verified by standard plus
focused WhatsApp UX live smokes. No WhatsApp send or external write was
performed.

Next unblocked batch: `REQ-20260621-504` Email and Resend UX.
<!-- batch-7:end -->

<!-- batch-8:start -->
## Batch 8 - Email and Resend UX

Status: done / deployed / verified live

Operations Communications > Email and Communications > Settings now expose
first-party Email/Resend readiness without sending email. Provider API
readiness, sender identity, domain readiness, recipient/workspace scope, DNS
tasks, webhook event readback, and the exact `SEND_RESEND_EMAIL` confirmation
gate are separated in the UI. The visible send controls remain disabled unless
the draft is reviewed, scoped, send-ready, and explicitly confirmed.

The Resend webhook route now uses raw-body Svix-header verification, stores a
safe first-party event summary in `bna_resend_webhook_events`, updates local
email communication/email-log rows when message IDs match, and keeps raw
provider payloads hidden by default. Resend API-key propagation is separated
from sender/domain readiness so a key can be installed without inventing a
sender domain.

Focused local verification passed. The app-visible implementation landed at
`fdd39bf327356675f8006bcc4ce04425061ef57e`, then Resend API-key propagation
evidence and closeout tests were pushed at
`847649198dfaf9f12fd69db958c3f927b460ecd8`. Final Railway deployment
`3ec03a01-2141-401f-988f-a734176a778c` picked up the propagated
`RESEND_API_KEY`; focused live smoke confirmed `configured: true`, one domain
readable through the domain endpoint, sender/domain readiness still blocked,
and no send path enabled. No email send, DNS verification/mutation, Resend
domain mutation, or provider send was performed.

Next unblocked batch: `REQ-20260619-306` product, schedule, booking, portals,
and billing/access foundations.
<!-- batch-8:end -->

<!-- batch-9-10:start -->
## Batch 9/10 - Product, Scheduling, Booking, And Portal Foundations

Status: base slice deployed / verified live; parent requirement reopened for
new child requirements

The One Time product system now has safe internal product-offer contracts for
the $67 monthly membership and premium Masechta intensive, with final pricing,
payment links, checkout, invoices, refunds, and access automation explicitly
disabled until the operator approves billing fields.

The product API now returns availability rules, appointment intent templates,
saved appointment intents, and scoped parent/student/provider portal
foundations. Operations > Provider Workspace exposes Add Class and Add
Appointment as real internal actions. These actions create only One Time
calendar-event and appointment-intent records; they do not create Zoom meetings,
send reminders, charge cards, grant access, invite participants, or write to an
external calendar.

Focused local verification passed. The safe app-visible changes were pushed at
`45ed36787ca519819a1adfb8f372267d96330a64`, deployed to Railway deployment
`8c20ae67-9acc-43f2-b77d-c10fcd425d73`, and verified by standard plus focused
One Time product/booking live smokes. The focused live smoke created only
clearly marked internal One Time class-event and appointment-intent records.

The base product/booking slice remains deployed and live-verified. The latest
`RAW-20260621-002` revenue-launch/parser follow-up split parent
`REQ-20260619-306` into child requirements `REQ-20260621-901` through
`REQ-20260621-910`; do not mark the parent complete until those children are
terminal. Next unblocked child: `REQ-20260621-901` source-envelope and
mixed-context parser v2.
<!-- batch-9-10:end -->

<!-- batch-9A:start -->
## Batch 9A - Source-Envelope And Mixed-Context Parser V2

Status: done / deployed / verified live

The intake source layer now creates a `source-envelope-v2` record with source
ID/hash, filename/title, channel, upload/source time, uploader, language,
default workspace/project/context, source confidence, privacy level, parser
version, processing status, source kind, and local context overrides.

Supported context types are `class_recording`, `family_meeting`,
`provider_meeting`, `operations_ramble`, `crm_spreadsheet`,
`content_recording`, `mixed`, and `unknown_needs_review`. Title and filename
defaults now route Dratler family material, Rabbi Scheller/One Time class
material, Operations rambles, CRM spreadsheets, and content recordings before
item filing, while explicit local fragments can override that default.

The canonical parser now attaches `metadata.source_context` to parsed items and
uses the local context when assigning `workspace_key` and `project_key`, so an
Operations task inside a Dratler-family source is filed under
`internal_super_admin` / `bna_operations` instead of inheriting the family
scope. The live intake parse route now passes filename/source title into the
parser and parse-run metadata.

Focused local verification passed. The implementation commit
`efe1d86d194cef483f5d6d9d418a769e20800989` was pushed, deployed to Railway
deployment `c1623618-a00c-46d0-8be9-5a8e4102b376`, and verified by standard
plus focused live smokes. The focused live smoke used a synthetic
`dry_run: true` parser fixture only; it did not apply/file parse results or
perform external writes.

Known unrelated QA caveat: `tests/one-time-intake-api-readback.test.js` has a
pre-existing HEAD fixture mismatch where the live auth helper returns
`Rabbi Ellie Scheller` while the test expects `Rabbi Elie Scheller`; Batch 9A
focused parser and media-routing regressions passed.

Next unblocked child: `REQ-20260621-902` today's class-upload trace.
<!-- batch-9A:end -->

<!-- batch-9B:start -->
## Batch 9B - Today's Class-Upload Trace

Status: blocked / live blocker verified

The latest live class-upload candidate is content job `#78`, title
`Drive Class Sunday balak`, source type `google_drive`, project `bna`, created
`2026-06-21T10:04:38.843Z`, drive stage `02 Ingesting`, and Drive file
`Class Sunday balak.m4a`. The job has source provenance but no transcript text
and no parse run for source `content_recording` / `78`.

Dry-run reprocess confirmed the existing job would be transcribed and patched
in place. The actual reprocess downloaded the audio and began transcription
chunking, but stopped before any transcript or parse run was saved because the
hosted transcription credential returned `401 invalid_credential`.

The live content-job notes were patched to a sanitized blocker summary without
secret-like credential material. Focused live smoke
`ops/live-smokes/2026-06-21T13-37-45-376Z-class-upload-trace-live-smoke.md`
verified the blocked source readback, sanitized notes, zero transcript chars,
and absence of a parse run. Standard live smoke also passed at
`ops/live-smokes/2026-06-21T13-37-11-961Z-live-app-smoke.md`.

No deployment was required because Batch 9B made no app-visible runtime code
change. The only committed code change is the repeatable focused live smoke
command at `72b5723a`; the live production data mutation was limited to marking
job `#78` blocked with sanitized notes.

Next unblocked child: `REQ-20260621-903` Downloads spreadsheet inventory.
<!-- batch-9B:end -->

<!-- batch-9C:start -->
## Batch 9C - Downloads Spreadsheet Inventory

Status: done / verified locally

Downloads spreadsheet inventory is complete without committing spreadsheet
rows, contact values, raw headers, formulas, private exports, or absolute local
paths. The inventory script scans spreadsheet-like files under Downloads,
computes SHA-256 hashes, row/column estimates, sheet/header fingerprints,
redacted filename labels, redacted schema signals, classifications, duplicate
hash groups, and import-candidate lanes.

Generated inventory:

- `ops/one-time-mishnah/downloads-spreadsheet-inventory.json`
- `ops/one-time-mishnah/downloads-spreadsheet-inventory.md`

Summary:

- Files inventoried: 203
- Import candidates: 56
- One Time Rabbi Scheller follower workbook: 1
- Email audience exports: 5
- Legacy CRM/pipeline exports: 29
- Contact-list candidates: 21
- External lead lists: 48
- Unknown spreadsheets needing review: 78

The highest-priority import candidate is `Rabbi Scheller Followers.xlsx` for
One Time CRM review. Email audience exports are marked for reconciliation
before any campaign send. Historical GHL/CRM/opportunity exports are labeled as
first-party BNA Operations migration candidates only; no GHL runtime, client,
API key, env var, schema, or connector was added.

Verification passed: syntax check, inventory command, privacy regression test,
JSON parse, tracked secret audit, and diff check. No deployment or live smoke
was required because this batch only produced local redacted inventory and
repo tooling.

Next unblocked child: `REQ-20260621-904` CRM import and deduplication.
<!-- batch-9C:end -->

<!-- batch-12:start -->
## Batch 12 - Zoom Meeting And Attendance Foundation

Status: done / deployed / verified live

The existing first-party Zoom integration helper now models the credential-free
parts of Batch 12 without creating a real Zoom meeting. It includes
Server-to-Server OAuth token retrieval with cache support, API client
scaffolding, meeting and registrant request builders, participant/recording/
transcript/summary readback request builders, webhook signature verification,
replay protection, idempotency keys, quick-ack/queued/dead-letter planning, and
attendance reconciliation that treats dashboard clicks as non-attendance.

The One Time migration now declares internal Zoom foundation tables for
meetings, occurrences, registrants, protected join references, webhook events,
participant events, attendance results, recording/transcript/summary assets,
retry jobs, and audit events. Operations > Live Classes now describes the full
no-write Zoom/attendance foundation while keeping meeting creation, registrant
writes, live webhook attendance writes, join redirects, external sends, portal
publishing, recording/transcript/summary reads, and attendance corrections
disabled.

Focused local verification passed. The safe app-visible changes were pushed at
`7685133a6e675db6883135eb775ae4cae6b44ad2`, deployed to Railway deployment
`b2d02f20-64a8-4183-9dba-3587d0449ef7`, and verified by standard plus focused
One Time Zoom/attendance live smokes. The focused smoke confirmed the Zoom
status/readiness API, preview routes, Operations Live Classes panel, blocked
meeting-create route, desktop/mobile rendering, and no real Zoom writes.

Next: continue with the runner-selected `batch-11-13` / `REQ-20260619-308`
Vimeo, member-library, recording, transcript, and publication pipeline. Manual
Vimeo mode must be usable now; automated upload remains disabled behind setup
and authorization gates.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 - Vimeo, Member Library, Recording, Transcript, And Publication Pipeline

Status: done / deployed / verified live

Vimeo is now recorded as the selected One Time video-hosting direction while
manual Vimeo mode remains the usable production path. Operations can create or
update class packages with a Vimeo URL, validated Vimeo ID, Masechta, Perek,
Mishnah range, class date, duration, thumbnail, transcript state, source
assets, review state, approval, publish, unpublish/rollback, and member-library
visibility/tier controls.

Automated Vimeo upload is implemented only as readiness and workflow
foundation behind a disabled feature flag. The setup screen states the exact
remaining external requirements: authenticated Vimeo user, account owner, plan,
upload scope and capability, storage/quota, folder, privacy default, allowed
embed domains, callback URL, token state, and last verification. No real Vimeo
upload, provider publish/unpublish/delete, OAuth exchange, or external account
write was performed.

The member library now has horizontal filters for All, Recently Added, Continue
Watching, Masechta, Perek, Review, and Completed, with Masechta/Perek grouping,
class metadata, duration, assets, local continue-watching progress, empty
states, loading states, and mobile-safe filter scrolling.

The recording/publication pipeline now models the safe lifecycle from scheduled
through recording/transcript/summary readiness, privacy review, Rabbi review,
approval, Vimeo manual/automated upload states, playback verification,
member-library publication, indexing, archive, retries, rejection, unpublish,
retention checks, and deletion gates. Webhook-originated material is not
published directly.

Focused local verification passed. The implementation commit
`37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92` was pushed, and the current PR head
`23e16a126f6e7461858b5701f2dbd2ba719a35c7` was deployed to Railway deployment
`38393641-ee8e-46ed-8daf-16e67b1cde2a`. Standard, focused Vimeo/member-library,
and source-envelope parser regression smokes passed against that deployed
bundle. The focused live smoke created only a temporary smoke-scoped class
package and smoke-scoped library item, then rolled back the library item and
archived the temporary class. A follow-up production API check found zero
unarchived `Codex Vimeo Smoke` classes.

Next: run `npm run bna:run:next` after the closeout evidence commit is pushed
and continue with the next unblocked requirement selected by the runner.
<!-- batch-11-13:end -->

<!-- batch-9D:start -->
## Batch 9D - CRM Import And Deduplication

Status: done / deployed / verified live

The first-party One Time CRM import preview/dedupe path is now scoped to the
Rabbi Ellie Scheller workspace and `one_time_mishnah_class` project. The
generic contact-import preview endpoint attaches metadata-only source inventory
references, computes scoped dedupe keys, strips raw source rows from preview
responses, and keeps every preview row no-send/no-local-write/no-external-write.

The One Time product system now exposes a read-only CRM import readiness
payload and direct `/api/bna/one-time/crm-import-preview` route. Operations >
Provider Workspace > Tiers renders a CRM Import Preview panel with candidate
source cards, scoped counts, Preview Mapping/Open Import Decision actions, and
a disabled Apply Import action with the exact approval blocker.

Duplicate lookup is constrained to the resolved workspace/project, preview
responses carry `import_policy.mode: preview_only`, warm leads remain no-send
until operator approval, and GHL/GoHighLevel/LeadConnector remain explicitly
forbidden inactive runtimes. The focused live smoke submitted only synthetic
`.invalid` rows and verified the readiness route, Operations panel, no raw
`source_row` data, no local writes, no external writes, no external CRM writes,
no sends, no billing records, and no GHL records.

The implementation was committed and pushed at
`aedb04aade8d518427b9f4df011c8b5a9d07f306`, deployed to Railway deployment
`4919c095-6301-4806-a712-0d64b4d01850`, and verified by standard plus focused
live smokes:

- `ops/live-smokes/2026-06-21T14-03-28-563Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md`

Next unblocked child: `REQ-20260621-905` CRM Contacts UX.
<!-- batch-9D:end -->

<!-- batch-9E:start -->
## Batch 9E - CRM Contacts UX

Status: done / deployed / verified live

Operations Contacts for the Rabbi/One Time workspace now has a first-party CRM
Contacts tab and review table. The UX combines scoped parent leads, One Time
product-interest leads, and member/access rows into one read-only review
surface with explicit record status, source/status, no-send state,
dedupe/review state, local communication linkage, next action, and guarded
direct actions.

The `/api/bna/parent-leads` route now honors the selected workspace/project
query scope and returns project metadata for verification. Operations passes
the selected `workspaceDataProjectFilters()` into parent-lead loading, so an
unscoped admin switching into One Time does not load BNA school leads into the
One Time contacts surface.

The final PR head `35db6c0e876243e61e7bce2f94db787a44626f06` was deployed
from a clean detached worktree to Railway deployment
`bf53e21c-a793-4af8-8630-a0e855d857c7`. Standard live smoke and focused One
Time CRM Contacts UX smoke passed. The focused smoke verified 88 scoped One
Time parent leads, 94 scoped contact communications, the deployed UX markers,
and the absence of raw contact bodies in the report.

Guardrails: no email send, WhatsApp send, payment write, external CRM write,
GHL/LeadConnector runtime, raw private contact dump, or BNA private
goals/check-ins/admin notes in the One Time Contacts UX.

Next unblocked child: `REQ-20260621-906` warm-lead trial and referral
configuration.
<!-- batch-9E:end -->

<!-- batch-9F:start -->
## Batch 9F - Warm-Lead Trial And Referral Configuration

Status: done / deployed / verified live

Implemented the configurable One Time warm-lead launch promotion and referral
model in test/local mode. The product system now exposes the 30-day trial,
`$67` renewal, card-required rule, one-intro-trial-per-household rule,
policy-version acceptance storage, referral-after-first-paid-cycle model,
single legal wording Decision, and Stripe local-beta no-write guardrails.

Operations renders a Trial / Referral Configuration panel under the One Time
provider workspace. The focused readback route is
`/api/bna/one-time/trial-referral-config`; it returns policy metadata only and
keeps checkout, live charges, payment links, subscriptions, invoice credits,
access automation, sends, and external CRM writes disabled.

Local verification passed:

- Focused product/Operations suite: 25/25.
- Focused Stripe/Rabbi/provider integration guardrail suite: 16/16.
- Syntax checks, execution-run validation, tracked secret audit, action
  watchdog, and diff check with line-ending warnings only.

The app-visible implementation was committed in `32708bfa5aa1d673a44ed5765178081ad57dc3de`. Local evidence was committed and pushed in `4edeef1fdbcf8dcc904ff578cb0ddccd2b62e1a4`; the safe app-visible bundle from `32708bfa5aa1d673a44ed5765178081ad57dc3de` was deployed from a clean detached worktree to Railway deployment `12249b2b-f11c-44b0-b9fa-ba75c511c633`.

Standard live smoke passed at
`ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`. Focused Batch 9F
live smoke passed at
`ops/live-smokes/2026-06-21T14-50-38-537Z-one-time-trial-referral-live-smoke.md`.

An intermediate standard smoke at
`ops/live-smokes/2026-06-21T14-49-04-951Z-live-app-smoke.md` failed after login
because `/api/bna/auth/me` did not return success; the final standard smoke
rerun passed.

Next unblocked child: `REQ-20260621-907` payment-to-access and class-link flow.
<!-- batch-9F:end -->

<!-- batch-9G:start -->
## Batch 9G - Payment-To-Access And Class-Link Flow

Status: implementation started / locally verified / deploy pending

Implemented the safe test-mode flow for `REQ-20260621-907`:

- Product-system readiness maps paid test/manual checkout state to access
  readiness without live charges, checkout sessions, payment links, or
  subscriptions.
- Access readiness requires an approved local/test event and manual admin
  review; automated access grants remain disabled.
- Class-link readiness is scoped to member/session plus active live grant, and
  raw member Zoom URLs plus Zoom host/start URLs are blocked.
- Operations renders the Payment / Access / Class Links panel in the One Time
  provider workspace.
- Member page rendering now uses protected class-link state instead of
  `session.zoom_url`.

Local tests and guardrail checks passed. Next step is committing, pushing,
deploying the safe app-visible bundle, running standard plus focused live
smokes, and closing the requirement as `verified_live` if production matches
the local evidence.
<!-- batch-9G:end -->
