# Status

Status as of 2026-06-21T16:05:00+03:00.

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

Status: done / deployed / verified live

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

Status: done / deployed / verified live

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

Next unblocked batch: `REQ-20260619-308` Vimeo and member-library pipeline.
<!-- batch-9-10:end -->

<!-- batch-12:start -->
## Batch 12 - Zoom Meeting And Attendance Foundation

Status: implemented local / deploy pending

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

Local focused verification passed. Next required step is commit, push, Railway
deploy, standard live smoke, focused One Time Zoom/attendance live smoke, then
mark `REQ-20260619-307` verified live and continue automatically.
<!-- batch-12:end -->
