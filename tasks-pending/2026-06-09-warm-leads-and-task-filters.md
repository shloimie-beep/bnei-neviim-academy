# Warm Leads and Compact Task Filters

## Request

The operator wants BNA-owned lead tracking for parents who are interested but
not signed up yet, because WhatsApp/GHL tagging is hard to use reliably. The
Contacts section should include an `Interested Parents` / warm-leads lane.

The operator also wants the Tasks top controls redesigned. The current large
overview metric cards duplicate the counts already shown near the task lane
buttons and take too much space, especially on mobile.

## Findings

- Current GHL token can access:
  - `GET /conversations/search`
  - `GET /conversations/messages/export?channel=WhatsApp`
- Probe result: WhatsApp export returned 200 with total 840 messages. Message
  bodies were intentionally not printed.
- Existing code has GHL contact/tag helpers and social/media posting, but no
  internal GHL conversation import surface.
- Live screenshots:
  - `screenshots/2026-06-09-operations-task-filters-mobile.png`
  - `screenshots/2026-06-09-operations-task-filters-desktop.png`
- Current Tasks overview duplicates information:
  - header count pills
  - lane nav buttons
  - large `Urgent / Today`, `Decisions`, `Changelog Queue` metric cards

## 2026-06-09 Follow-Up GHL Probe

The operator specifically asked to find the recent WhatsApp contacts in GHL
that may be interested parents and map how the Contacts section should track
them.

Read-only GHL notes:
- The installed HighLevel connector returned `401 Reauthentication required`.
  Local repo PIT-token access still works through the existing LeadConnector
  API path.
- `GET /conversations/messages/export?channel=WhatsApp` returned 580 WhatsApp
  messages across 70 unique contacts for the exact two-week window ending
  `2026-06-09T05:24:05Z`.
- The same export returns 841 total WhatsApp messages without a date filter.
- Date filtering is sensitive: using an `endDate` later than the current UTC
  moment can return zero messages. Use `now`, not end-of-day, for smoke tests.
- GHL's generic `callback-requested` tag is noisy. It appeared on most recent
  WhatsApp contacts and should not be treated as a real interested-parent
  status.
- Only one recent contact already had a `warm-lead` style tag in GHL. That
  record should be imported as a lead candidate but still reviewed before any
  school-stage decision.
- Full WhatsApp message bodies were not printed or stored in this brief. A
  local classifier counted lead-related keyword categories only.

Initial lead-candidate review list from the last-14-day WhatsApp export:

| Priority | GHL contact | Phone | Signal |
| --- | --- | --- | --- |
| High | Malka Shifra Klotzman (`DbtFT37ieSgMJSLz0Lmx`) | `***4564` | 7 inbound keyword hits across child/school categories |
| High | Adina Block (`N9v4lIyYkzX7enPY3F8R`) | `***2344` | admissions, child, and school keyword signals; new contact |
| Medium | Leah Baars (`lTEHj31JRS7OmvQwnBoH`) | `***1391` | admissions, child, and school keyword signals |
| Medium | Devorah Ganendel Rbs (`ybY7PbsKwaOMJD0ybHfC`) | `***6582` | repeated inbound messages with child/school signals |
| Medium | Shifra (`uSJkhcnc4W95to8nqXVt`) | `***8087` | new contact with child-related inbound signals |
| Medium | Netanel (`m4RgVC2EPcUOZKSNLmtD`) | `***8387` | new contact with child-related inbound signals |
| Medium | Aviel (`d3UXyUsAfHQjML8ACxz9`) | `***1900` | admissions-related inbound signals |
| Medium | Chaim Dovid Bauer (`7PDI4x4w77rXLqdreMgG`) | `***4100` | school/program inbound signals |
| Review | Yoga Flow with Elana Kahan (`eZWgH1kGueXkK5KtkbSz`) | `***8626` | school/child keyword signal but likely not a parent lead based on name |
| Review | Yehoshua King / Automate Anything AI (`qi9HKcYTwcS8gvD0ZUp5`) | `***5144` | keyword signal but likely business/vendor context |
| Review | GHL contact `vSv1awowuivBXz47RNjg` | `***6817` | existing `warm-lead`/`wa-source` tags, no keyword signal in this window |

Current/internal contacts detected by heuristic and excluded from lead
candidates: Nicki Weber, Eli Scheller, Leslie Dratler, Naomi Braka, Menachem
Dratler, Dad, Rabbi Danny Meyers, Shalom Galombo, and Ayala Galombo.

Classification caveat: the keyword pass was ASCII-only because PowerShell
mangled Hebrew regex literals in the inline script. A production importer
should use a checked-in UTF-8-safe script or normal JS source file for Hebrew
lead classification.

## 2026-06-09 Actual Status / 21-Day Audit

Actual build status:
- The Contacts section has not yet been rebuilt into a full internal CRM for
  leads.
- Current live Contacts subtabs are `Parents`, `Students`, `Intake`,
  `Needs Follow-up`, and `Tags`.
- There is no `bna_parent_leads` table, no `Interested Parents` subtab, and no
  lead-candidate review workflow yet.
- The concept is mapped and queued in `TASKS.md`; it still needs
  implementation and deployment.

21-day GHL WhatsApp audit:
- Window: `2026-05-19T05:48:18Z` through `2026-06-09T05:48:18Z`.
- Export returned 749 WhatsApp messages across 85 unique GHL contacts.
- The generic `callback-requested` tag appeared on 79 contacts and is still too
  broad to use as a lead tag.
- One GHL record had `warm-lead`; several legacy Webcraft/business tags also
  appeared and should not be treated as BNA school leads automatically.
- The classifier found 24 high-confidence school/admissions-signal candidates,
  but it also surfaced at least one known/current parent. The production import
  must match against BNA signups/current parents by phone/email/name before
  anything enters the visible Leads lane.

Current-parent false-positive example:
- `רחלי קוסובסקי` scored high from school/admissions keywords but is a current
  BNA parent/payment contact, not a new lead. This confirms the first import
  step must be `match_existing_parent` before `lead_candidate`.

Useful review candidates from the 21-day audit, after excluding obvious current
parents and obvious vendor/business contexts where possible:

| Priority | GHL contact | Phone | Signal |
| --- | --- | --- | --- |
| High | Unknown name (`AmF2bJrhN9q5qWUEjhbn`) | `***7700` | 14 inbound / 9 outbound, strong admissions keyword signal |
| High | נחמן (`TqYS4wdoMcz70WjJ25aX`) | `***4165` | 25 inbound / 10 outbound, repeated admissions signal |
| High | Malka Shifra Klotzman (`DbtFT37ieSgMJSLz0Lmx`) | `***4564` | admissions, child, and school/program signals |
| High | שרי קאפלין (`YyNCniLPrdB7fJwsHdMq`) | `***5151` | new contact, admissions/child/school signals |
| High | גולדה לאה הולטרמן סאמעטt (`GjRsN7HEwpY90JQfKpsP`) | `***6221` | new contact, admissions/child/school signals |
| High | Adina Block (`N9v4lIyYkzX7enPY3F8R`) | `***2344` | admissions, child, and school keyword signals |
| Medium | Yardena Slater (`OwzSd0ANTbtehuG0J07M`) | `***4962` | admissions, child, and school/program signals |
| Medium | Leah Baars (`lTEHj31JRS7OmvQwnBoH`) | `***1391` | admissions, child, and school/program signals |
| Medium | Unknown name (`BJT5hfupbOKSQoaW0olQ`) | `***6977` | new contact, admissions signal |
| Medium | Shlomo Kaner (`AYtaa4spz9PZgKk4nLnk`) | `***0611` | new contact, admissions/child/school signals |
| Medium | Devorah Hadasah Lieberman (`lI4wCdwAi5vlhx4wSYi4`) | `***7124` | admissions, child, and school/program signals |
| Medium | Devorah Ganendel Rbs (`ybY7PbsKwaOMJD0ybHfC`) | `***6582` | repeated inbound messages with child/school signals |
| Medium | Jonny Crow (`y9PBYJjdaVcOOaGNLq4I`) | `***4791` | new contact, admissions/child signal |
| Medium | Existing warm-lead GHL contact (`vSv1awowuivBXz47RNjg`) | `***6817` | has `warm-lead` / `wa-source` tags |
| Medium | Aviel (`d3UXyUsAfHQjML8ACxz9`) | `***1900` | admissions signal |
| Medium | Shifra (`uSJkhcnc4W95to8nqXVt`) | `***8087` | new contact, child signal |
| Medium | Netanel (`m4RgVC2EPcUOZKSNLmtD`) | `***8387` | new contact, child signal |
| Review | Aviva Miles (`kCb5PInL6xCA7F5CW66Z`) | `***3788` | child/school signal |
| Review | Chaim Dovid Bauer (`7PDI4x4w77rXLqdreMgG`) | `***4100` | school/program signal |

Likely vendor/business-context contacts surfaced by keyword/tag heuristics and
should not be auto-filed as school leads without review: Yoga Flow with Elana
Kahan, Yehoshua King / Automate Anything AI, Hip Hop Chug, Psychodrama, and
Webcraft/imported business contacts.

## Contact Taxonomy

Contacts should not rely on one flat GHL tag list. The BNA Contacts section
should show two parent-facing lanes:

1. Current Parents
   - Signed up or otherwise active in the school/accounting system.
   - Links to student(s), signup/payment status, parent notes, and follow-up
     tasks.
   - GHL contact IDs are secondary linkage only.

2. Interested Parents
   - Not signed up yet, but there is school/admissions interest.
   - Status options: `new`, `interested`, `follow_up`, `visit_scheduled`,
     `application_sent`, `accepted_not_paid`, `not_now`, `not_fit`, `archived`.
   - Interest level: `hot`, `warm`, `cool`, `unknown`.
   - Source: `whatsapp`, `website_form`, `telegram`, `referral`,
     `manual`, `ghl_import`, `event`, `other`.
   - Required operational fields: parent name, phone, optional email, child
     name/age/grade if known, source detail, GHL contact ID, GHL conversation
     ID, last inbound date, last outbound date, next follow-up date, tags,
     notes, and owner.

Recommended import behavior:
- First import creates `lead_candidate` records, not final leads.
- Before creating a lead candidate, match against current BNA parents/signups
  by normalized phone, email, and name so current parents do not appear as new
  leads.
- The UI shows a Review queue where Shloimie can mark `Lead`, `Current Parent`,
  `Vendor/Internal`, `Archive`, or `Merge`.
- No GHL tags should be written back until the BNA record is reviewed or an
  explicit admin action is clicked.
- After review, the app may optionally write normalized GHL tags such as
  `bna-current-parent`, `bna-interested-parent`, `bna-lead-hot`,
  `bna-lead-warm`, `bna-not-now`, and `bna-internal`.

## 2026-06-09 Contacts Card UI Direction

The operator clarified that Contacts cards should open inside the clicked card
itself, not in a separate detail surface below/next to the whole parent list.
The current UI patch changes signed-up parent cards to inline expandable cards,
keeps the full contact/signup/payment/notes/tags detail inside that card, and
uses dropdowns for variable tag lists.

Conversation history is not implemented yet. The intended placement is inside
the expanded parent/lead card:
- Match each card to GHL by saved `ghl_contact_id` when available, otherwise by
  normalized phone and optionally email/name.
- Store/sync conversation IDs, message IDs, channel, direction, sender, sent
  timestamp, and message body or safe preview according to an explicit privacy
  rule.
- Render the recent WhatsApp thread inside the card with clear inbound/outbound
  direction and timestamps.
- Do not show raw message bodies in task titles or broad list views.

## 2026-06-09 First-Pass Lead CRM Build Completed

Completed and deployed:
- Added `bna_parent_leads` with lead categories `school_interest`,
  `content_interest`, and `group_member`.
- Added `bna_contact_communications` for lead/signup/student/general contact
  touchpoints.
- Added protected APIs for listing/creating/updating parent leads and listing/
  creating communication notes.
- Added Contacts subtabs `Interested Parents` and `Communications`.
- Added lead category, status, interest, tag, and date filters.
- Added expandable lead cards with notes, source/GHL fields, next follow-up,
  quick status/interest actions, and per-lead communication history.
- Seeded school-interest leads:
  - Adina Block: interested, interest unknown, needs WhatsApp-note review.
  - Sari Kaplan: hot/interested; operator spoke to her husband, who is very
    interested and liked the operator's authenticity.
- Railway deployment `c79744c8-94ca-42bc-a889-637084075f00` reached SUCCESS.
- Verification passed:
  - `node --check server.js`
  - Operations HTML script syntax check
  - `npm test`
  - local dashboard browser smoke
  - `npm run railway:doctor`
  - `npm run app:smoke` ->
    `ops/live-smokes/2026-06-09T06-15-10-568Z-live-app-smoke.md`
  - live production CRM API check for both seeded leads and notes
  - live production dashboard UI check for Interested Parents and
    Communications

Still not built:
- Automated GHL WhatsApp lead-candidate review importer.
- Current-parent matching before surfacing GHL candidates as leads.
- Full WhatsApp conversation message-history sync/rendering.
- Optional reviewed-only GHL tag writeback.

## Suggested Implementation

1. Add a BNA-owned warm-leads data model.
   - Suggested table: `bna_parent_leads`
   - Fields: parent name, phone, email, student name/age, status, tags,
     source, source detail, GHL contact ID, GHL conversation ID, latest
     message metadata, notes, next follow-up date, archived flag.
   - Statuses: `new`, `interested`, `follow_up`, `visit_scheduled`,
     `application_sent`, `not_now`, `archived`.

2. Add Contacts `Interested Parents` subtab.
   - Compact lead cards with status/tag chips.
   - Detail panel for notes, follow-up, source, GHL link fields, and actions.
   - Keep this separate from signed-up parent roster.

3. Add GHL WhatsApp sync carefully.
   - Start with read-only import of contact/conversation IDs, timestamps,
     channel, direction, and short latest-message preview.
   - Avoid dumping full WhatsApp message bodies into task titles or visible
     lists.
   - Add explicit admin action for deeper transcript/message-body review if
     needed.
   - Treat `callback-requested` as generic legacy noise. Do not map it directly
     to interested-parent status.
   - Use the exact `now` end date in export queries; do not request an
     end-of-day future timestamp.

4. Redesign Tasks top controls.
   - Remove the large overview metric cards from the default Tasks overview.
   - Put counts inside or under the existing lane buttons:
     `Overview`, `Decisions`, `My Tasks`, `Changelog`.
   - Add compact category chips for `Marketing`, `Accounting`, `Technology`,
     `Operations`, etc., preferably only inside the active lane/filter area.
   - Keep urgency/date/project filters collapsed or as one-line chips.

## Verification

- Live desktop and mobile screenshots before/after.
- GHL sync endpoint smoke that checks status/counts without printing message
  bodies.
- GHL import smoke for `2026-05-26T05:24:05Z` through `2026-06-09T05:24:05Z`
  should return 580 messages, 6 pages, and 70 unique contacts, unless the
  underlying GHL account data has changed.
- Existing `npm test`.
- Live Railway doctor and app smoke before marking app-visible work done.
