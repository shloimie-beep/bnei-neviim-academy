# WAPI / WhatsApp / CRM Audit And Plan

Date: 2026-06-14

## Current Reality

- Whapi/WAPI is the active WhatsApp API path.
- Buffer is the active social scheduler connector.
- BNA is not using GHL, GoHighLevel, LeadConnector, or LeadConnectorHQ as an
  active CRM runtime.
- Communications data belongs in first-party BNA Operations tables and APIs.
- Existing task backlog already includes WAPI/Whapi lead-candidate review and
  conversation history sync work.

## What Exists

- WAPI diagnostics and sync routes are present in Operations API wiring.
- WAPI phonebook grouping now has a read-only dry-run report:
  - CLI: `npm run wapi:phonebook-report`
  - API: `/api/bna/wapi/phonebook-report`
  - Operations: Communications > WhatsApp > Phonebook grouping
- `contactCommunications` feed stores contact notes and message-like records.
- Communications UI has sections for parents, students, providers, internal,
  WhatsApp, email, bots, announcements, templates, support threads, and
  settings.
- Support tickets and internal dialogue can be tied to workspaces.
- Manual WhatsApp actions and access-link sends are guarded by explicit
  confirmation paths in server workflows.

## Main Gaps

1. Contact grouping has a first dry-run phonebook report, but not a full
   three-pane phonebook-first workspace yet.
2. WhatsApp messages/calls need a full phonebook-first conversation view.
3. Contact role/tag inference now has report confidence/review flags and a
   local manual correction apply/readback path, but not the full three-pane
   conversation workspace yet.
4. Telegram notes like "that WhatsApp with X was about Y" now have a deployed
   local matcher, but the full phonebook-first conversation workspace still
   needs to show those notes beside messages.
5. Parent announcements now have a durable "last approved parent announcement"
   record and Operations UI readback through the weekly updates table.

## Nati Freeze / Fries Rule

Do not tag Nati Freeze/Fries as a school lead or hot lead unless actual message
content indicates school interest. Treat as friend/general contact by default
and allow manual correction.

## Target Contact Types

- recognized parent
- recognized student
- provider
- school interest
- content interest
- group member
- general contact
- unknown phone
- friend/non-lead
- spam/irrelevant

## UI Plan

Desktop:

- Left: phonebook/contact list.
- Middle: conversation pane.
- Right: details, notes, tags, pipeline, tickets, tasks, linked records.

Mobile:

- Contact list -> conversation -> details.
- Back navigation between panes.
- Filters as compact tabs/dropdowns.

## Conversation History Contract

Clicking a person should show:

- WhatsApp messages.
- Calls when available.
- Telegram notes.
- Emails if linked.
- Tickets.
- Pipeline status.
- Tasks and decisions tied to the contact.

## Telegram Note-To-CRM Flow

When the operator leaves a Telegram note:

1. Parse contact clue, channel clue, and topic.
2. Match the latest WhatsApp/call/contact by normalized phone, name, and time.
3. Attach the note to the contact/conversation.
4. Optionally create or move a pipeline card.
5. Optionally create a task/ticket.
6. Confirm in Telegram with what was matched.

## Implementation Order

1. DONE: Add WAPI contact grouping report script: dry-run first.
2. DONE: Add normalized phone/contact matching and confidence values.
3. PARTIAL: Render phonebook-first Communications readback while preserving
   existing data.
4. DONE: Add manual local correction and "friend/non-lead" apply path.
5. DONE: Add Telegram note-to-CRM parser/matcher.
6. DONE: Add durable parent announcement approval/readback.
7. Add tests for grouping, Nati cleanup, timeline readback, and note matching.

## No-Send Guard

The CRM repair work must not send WhatsApp messages or create broadcasts.
Message sending remains explicit-confirmation only.

## 2026-06-14 Deployed Slice

- Added shared grouping logic in `src/lib/bna/wapi-phonebook-report.js`.
- Added CLI `npm run wapi:phonebook-report`.
- Added admin-only read endpoint `/api/bna/wapi/phonebook-report`.
- Added Operations WhatsApp tab readback with aggregate report metrics and
  manual correction candidates.
- The report returns `dry_run: true`, `no_send: true`, and
  `external_write_performed: false`.
- Nati Freeze/Fries defaults to `friend_non_lead` unless actual message text
  shows school interest.
- Deployed in Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`.
- Live smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.

## 2026-06-14 Telegram Note-To-CRM Deployed Slice

- Added shared parser/scorer logic in
  `src/lib/bna/telegram-note-to-crm.js`.
- Added admin endpoint
  `POST /api/bna/contact-communications/match-note`.
- Added Telegram `/crm_note`, `/whatsapp_note`, and `/wa_note` handling plus
  natural-language matching for notes such as "that WhatsApp with X was about
  Y".
- The endpoint scores recent local WhatsApp/WAPI communications by
  communication id, normalized phone, matched names, summary/body text, and
  linked first-party record names.
- On a confident match it creates a local `telegram` / `internal_note`
  communication that points back to the matched WhatsApp communication in
  `source_context`. Dry-run/no-match calls save nothing.
- The flow returns `no_send: true` and `external_write_performed: false`; it
  never sends WhatsApp messages or creates broadcasts.
- Deployed in Railway deployment
  `73a812e2-572e-4231-a971-20aef4f52450`.
- Live endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.

## 2026-06-14 WAPI Manual Correction Deployed Slice

- Added local-only correction persistence in
  `bna_wapi_phonebook_corrections`.
- Added admin endpoint
  `POST /api/bna/wapi/phonebook-corrections`.
- The phonebook report overlays the latest correction per `phonebook_key`,
  exposes applied correction metadata, and removes already-corrected groups
  from the manual correction candidate queue.
- Operations Communications > WhatsApp now shows Apply recommended,
  Friend/non-lead, and School interest buttons after building the report.
- The Operations apply flow now calls a dry-run preview first and shows the
  planned local CRM changes before asking for final approval.
- Non-dry-run writes require `APPLY_WAPI_CORRECTION`. Confirmed applies can
  update first-party `bna_contacts` tags/status and linked
  `bna_parent_leads` tags/status/lead type. Student, signup, and provider
  records are deliberately skipped.
- Dry-run calls write nothing and return `dry_run: true`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
- The route never sends WhatsApp messages, creates broadcasts, or writes to an
  external CRM.
- Deployed in Railway deployment
  `4c152697-dbd0-4dd7-8834-83b483999459`.
- Live endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`.
- Live UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`.

## 2026-06-14 Parent Announcement Deployed Slice

- Added guarded parent announcement aliases over `bna_weekly_updates`:
  - `GET /api/bna/parent-announcements`
  - `POST /api/bna/parent-announcements`
- Operations Communications > Announcements now reads back the latest
  parent-visible announcement, shows local draft/approved counts, and exposes
  an Approve Draft action.
- Non-dry-run approval requires `APPROVE_PARENT_ANNOUNCEMENT`, unselects older
  parent-visible updates for the same workspace, and stores the new selected
  update locally.
- Dry-run calls write nothing and return `dry_run: true`, `no_send: true`,
  `external_write_performed: false`, and `local_write_performed: false`.
- This flow does not send email, WhatsApp, or social posts.
- Deployed in Railway deployment
  `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e`.
- Live endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`.
- Live UI smoke:
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
