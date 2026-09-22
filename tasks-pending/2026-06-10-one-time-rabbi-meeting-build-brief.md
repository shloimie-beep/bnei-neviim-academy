# One Time Rabbi Meeting Build Brief

Captured: 2026-06-10  
Source: Meeting artifact #1, Content job #57, Drive media
`1cLQ7Rn3OEHfWIymhB1AUlTqV4WTWPAyg`

## Status

This is the build brief distilled from the Rabbi meeting drop. It does not mean
the full platform is built. The meeting-drop machinery is already live; this
brief defines the next One Time implementation direction and decision gates.

## Core Direction

Build One Time as an internal-first BNA-owned product surface. GHL/HighLevel is
optional infrastructure, not the default user experience.

Default assumption:

- BNA owns the clear parent, student, Rabbi/admin, task, meeting, assignment,
  calendar, messaging, and support experience.
- GHL is used only for a specific CRM, automation, payment, or follow-up feature
  after a read-only capability/cost audit proves it earns its place.
- Rabbi Elie's existing software/library/community stack may remain the primary
  content system if it already handles video hosting, library access, stats, or
  parent-facing trust better than a replacement.

## Meeting Signal

- The product should focus on the valuable core: structured, clear, exciting
  Mishnayos classes that parents can understand and buy.
- The working brand can be `One Time Mishnayos` / `One Time Mishnah Class`; the
  URL can redirect as needed.
- Non-class content can be bonus material or a separate surface, but it should
  not blur the main offer.
- If the existing subscription/funnel is not working, the task is to fix the
  product/system and access model, not only rename or move the website.

## Product Surfaces To Build

### Shloimie Super Admin

- Manage BNA and One Time separately.
- Manage Rabbi Elie's external admin account.
- See One Time tasks, team tickets, schedule, content, students, parents,
  accounting, integrations, and reporting.
- Configure project settings, integrations, and revenue/ownership metadata.

### Rabbi Elie External Admin

- Scoped One Time workspace only.
- Tasks, schedule, team tickets/messages, content/meeting drops, student and
  parent records, source-sheet/worksheet preparation, class/session planning,
  and simple reporting.
- No BNA private Students, Accounting, Devices, parent accountability, or
  operator-only programming controls.

### Parent Portal

- Project-scoped One Time parent login when enabled.
- Child/class access, upcoming Zoom/live sessions, recordings/library links,
  worksheets/source sheets, assignment status, billing/subscription status,
  support/contact, and WhatsApp delivery path.

### Student Portal

- Project-scoped One Time student login when enabled.
- Class/session list, assignments, source sheets, worksheets, motivational
  progress, questions, and review access.
- Do not leak BNA school accountability or private BNA student data.

## Required Discovery Before Build Choices

Run this as read-only discovery before committing to integrations or replacing
tools:

- Rabbi software/library stack: vendor, login model, data model, exports, APIs,
  content ownership, and current user roles.
- Vimeo or video hosting analytics: view stats, engagement stats, user-level
  analytics, export/API access, embed/access controls, and privacy limits.
- Current website/domain/offer setup: URLs, redirects, landing pages, pricing,
  checkout, membership/library access, and current customer path.
- Google Classroom/Workspace strategy: whether parents/students need Google
  accounts, whether Classroom is only assignment sync, and which teacher
  identity owns courses.
- Zoom scheduling: live class cadence, recurring links, calendar invites,
  attendance needs, recording flow, and host/license ownership.
- WhatsApp delivery: WATI/Wappy/Wacky/GHL/other provider, approved number,
  template needs, webhook/export access, and whether media URLs are supported.
- GHL capability/cost map: contacts, tags, fields, pipelines, payments,
  calendars, workflows, community/membership support, and browser-only gaps.
- Current customers and product tiers: existing `$9`, `$30`, library, live,
  cohort, or other purchase groups and reactivation lists.
- Ownership/revenue terms: what software, data, audience, expenses, and revenue
  belong to Shloimie, Rabbi Elie, or a shared One Time project.

## Decision Gates

### Platform Stack

- Option A: Internal BNA app with Resend, WhatsApp/WATI/Wappy/Wacky, Zoom,
  Google APIs, and Rabbi software integrations.
- Option B: GHL-backed CRM/community/course builder behind the scenes.
- Option C: Hybrid internal UI with GHL only for specific CRM automations if it
  earns its cost.

Recommended build assumption: Option C with an internal-first UI. Treat every
GHL use as an integration ticket with current-state audit, cost justification,
approval gate, and smoke test.

### Parent And Student Login Model

- Option A: Every One Time parent and student gets a project-scoped login.
- Option B: Parent logins only, with student data managed by Rabbi/admin.
- Option C: Admin-only first, then family logins after the first cohort.

Recommended build assumption: design the data/session model for Option A, but
launch can start with Option C if Shloimie wants speed and fewer support risks.

### App Ownership And Revenue Split

- Option A: Shloimie owns the software and gives Rabbi a percentage tied to One
  Time growth.
- Option B: Shared platform ownership with a negotiated split.
- Option C: Separate service/revenue agreement for Rabbi use only.

Needs Shloimie/Rabbi decision before finance automation, partner distribution,
or public agreement language is treated as final.

### Google Workspace And Classroom Setup

- Option A: Create/require Google Workspace accounts for parents/students.
- Option B: Use Google Classroom only for assignments while parent login stays
  in BNA.
- Option C: Skip Workspace at first and use internal assignments/calendar.

Recommended build assumption: keep internal assignments/calendar canonical, then
sync to Classroom only after real course IDs, teacher OAuth, and student account
mapping are confirmed.

### Rabbi Existing Software Integration Map

- Option A: Integrate Rabbi app/library/Vimeo analytics as the primary content
  system.
- Option B: Mirror selected data into BNA and leave analytics in Rabbi software.
- Option C: Replace pieces only when API access or workflow limits force it.

Recommended build assumption: Option B first. Mirror only what BNA needs for
parents, students, tasks, worksheets, reporting, and support.

## Implementation Slices

1. **Discovery Pack**
   - Produce a One Time stack inventory from Rabbi answers and read-only audits.
   - Output: integration map, blocked credentials list, and recommended build
     path.

2. **User/Account Foundation**
   - Broaden super-admin user/account management beyond the first
     `one_time_admin` login.
   - Preserve hard project separation between BNA and One Time parents/students.
   - Add tests proving Rabbi cannot read BNA private areas.

3. **Internal Classroom And Calendar MVP**
   - Reuse BNA assignment/session/calendar primitives where possible.
   - Add One Time class sessions, Zoom/live links, recordings, source sheets,
     worksheets, due dates, and simple student/parent status.
   - Google Classroom/Calendar sync stays preview/confirm until accounts are
     mapped.

4. **Content And Media Pipeline**
   - One Time Drive drops -> Meeting Drops -> class/session records -> source
     sheets -> worksheets -> question digests -> clips/ad candidates -> approval
     -> posting/reporting.
   - Keep media/source provenance linked to content job #57 and future meeting
     artifacts.

5. **Messaging And Delivery**
   - Email via Resend or current provider.
   - WhatsApp through the chosen API-capable provider only after media URL and
     webhook/export support are verified.
   - Telegram Rabbi bot remains scoped and blocked until real chat ID/runtime is
     confirmed.

6. **Reporting And Finance**
   - Track leads, customers, revenue, expenses, churn, failed payments, refunds,
     support tickets, partner distributions, class attendance, video/library
     engagement, and campaign performance.
   - Do not automate partner distributions until ownership/revenue terms are
     decided.

## Immediate Next Actions

- Run the Rabbi software-stack discovery call/checklist from this brief.
- Map GHL as one optional connector, not as the base product.
- Decide whether the first live cohort is admin-only, parent-login-only, or full
  parent/student login.
- Confirm ownership/revenue terms before final proposal/agreement automation.
- Build the internal One Time classroom/calendar MVP only after the discovery
  pack identifies which existing Rabbi systems should be integrated instead of
  replaced.

## Acceptance Criteria

- Meeting artifact #1 has a clear implementation handoff tied to Content job
  #57 and the One Time project.
- Future Codex workers know the default stack assumption: internal-first,
  project-scoped, GHL optional.
- The five visible decision gates remain explicit and do not get buried inside
  generic roadmap text.
- Next implementation tasks can be picked up without rereading the raw meeting
  transcript.
