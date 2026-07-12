# One Time Learning Motivation And Commandments Build Brief

Captured: 2026-07-10
Source raw record:
`raw-input/RAW-20260710-005-onetime-meeting-drop-3-learning-motivation-build-brief.md`
Source: Meeting artifact #3, Content job #103, Drive media
`1HFXw0L_xfhFXTfkgonq0epKupLgU3CeW`

## Status

This is the build brief distilled from the One Time meeting drop. It does not
mean the full platform is built, the class package is published, or any
external system has been changed.

The raw transcript preview was not copied into this repo file. Use the scoped
Drive/content-job source when transcript review is needed, and keep transcript
evidence out of public/member/student surfaces unless explicitly approved.

## Core Direction

Build One Time as an internal-first, first-party BNA Operations product
surface for the Rabbi Scheller provider workspace. Legacy CRM is optional
infrastructure only, not the default parent, student, Rabbi, or admin
experience.

Default assumption:

- BNA owns the clear parent, student, Rabbi/admin, class/session, content,
  assignment, calendar, messaging, support, and follow-up experience.
- One Time records stay scoped to `rabbi_sheller_provider` /
  `one_time_mishnah_class`; they do not merge into BNA Academy classroom,
  content, community, contacts, payments, or student records without an
  explicit cross-workspace link.
- Legacy CRM/community/course-builder features are evaluated only as optional
  connectors or implementation inspiration. They do not authorize GHL,
  LeadConnector, env vars, API writes, external CRM sync, or a CRM-owned user
  experience.
- Rabbi Elie's existing software, library, Vimeo/media analytics, Zoom,
  Google, WhatsApp, and current app stack should be inventoried before BNA
  replaces or integrates anything.

## Meeting Signal

The meeting topic points to a core One Time product promise: Mishnayos learning
should be exciting, serious, and internally meaningful, not only driven by
external rewards.

Product implications:

- Class sessions need to preserve Rabbi-led discussion, student questions, and
  motivation themes, not just store a recording.
- Parent and student views should connect each class to the recording,
  source-sheet/worksheet, discussion theme, Rabbi-approved takeaway, and next
  review action.
- Rewards, progress, badges, and parent updates must be worded carefully:
  recognize effort, consistency, review, and joy in learning without making
  Torah learning feel transactional.
- Question digests, bot knowledge, public clips, newsletters, worksheets, and
  student-visible summaries all need scoped approval before publication.
- The class package for this drop should be able to produce a private
  transcript review, source-sheet prompt, worksheet/reflection prompt, parent
  recap draft, and organic clip/ad-candidate notes.

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Status | Evidence | Next action |
|---|---|---|---|---|---|---|---|---|---|
| REQ-20260710-031 | Preserve the meeting drop as redacted raw intake and link it to a build brief. | SRC-20260710-005-001 | agent_ops / one_time_mishnah_class | Codex | intake | P0 | Done | `raw-input/RAW-20260710-005-onetime-meeting-drop-3-learning-motivation-build-brief.md`; this brief | none |
| REQ-20260710-032 | Translate the Learning Motivation and Commandments meeting signal into One Time classroom/content build requirements. | SRC-20260710-005-002 | one_time_mishnah_class | Codex | product_brief | P0 | Done | Meeting Signal and Implementation Slices sections in this brief | Future content/classroom work should create a scoped content package or PQC packet before UI/product code. |
| REQ-20260710-033 | Keep the internal-first, first-party product direction explicit and block active legacy CRM runtime assumptions. | SRC-20260710-005-003, SRC-20260710-005-004 | rabbi_sheller_provider / one_time_mishnah_class | Codex | architecture_decision | P0 | Done | Core Direction; `DEC-20260710-005` | Use first-party Operations by default; legacy CRM remains a decision-gated connector. |
| REQ-20260710-034 | Preserve the One Time access model decision gate for Shloimie, Rabbi Elie, parents, and students. | SRC-20260710-005-005 | one_time_mishnah_class | Codex | access_model | P0 | Done | Access Model section; `DEC-20260710-006` | Shloimie/Rabbi decision still required before broad account rollout. |
| REQ-20260710-035 | Convert the required meeting follow-up into a Rabbi discovery checklist and build sequencing guardrail. | SRC-20260710-005-006 | one_time_mishnah_class | Codex | discovery | P0 | Done | Required Discovery and Decision Gates sections; `DEC-20260710-007` through `DEC-20260710-009` | Run the discovery checklist before replacing or integrating external systems. |

## Product Surfaces To Build Around This Drop

### Shloimie Super Admin

- See the One Time meeting drop, source media, transcript-review status,
  generated class-package checklist, decision blockers, and follow-up owner.
- Manage One Time separately from BNA Academy.
- Keep support/diagnostic/credential/readiness details behind Super Admin or
  support-only surfaces, not in Rabbi's normal provider dashboard.

### Rabbi Elie External Admin

- Scoped One Time workspace only.
- Review transcript-derived class notes, student questions, worksheet/source
  sheet prompts, parent recap drafts, class package status, and next-session
  planning.
- Approve what becomes member-visible, parent-visible, bot knowledge, social
  draft, or public clip/ad candidate.
- No access to unrelated BNA Academy students, parents, private accounting,
  global integrations, credentials, or Super Admin diagnostics.

### Parent Portal

- When enabled, show class-specific recording/library link, Rabbi-approved
  takeaway, worksheet/source sheet, assignment/review status, class calendar,
  support path, and billing/access state.
- Avoid raw transcript dump, internal protocol labels, test data, or admin-only
  notes.

### Student Portal

- When enabled, show the class session, source sheet, worksheet/reflection
  prompts, review action, progress, and private question path.
- Reward/progress language should reinforce effort and love of learning rather
  than make the learning only prize-driven.
- Do not expose adult/private notes, other students' responses, parent-only
  contact details, or BNA Academy data.

## Required Discovery Before Build Choices

- Rabbi software/library stack: vendor, login model, member roles, exports,
  APIs, content ownership, analytics availability, and current production
  source of truth.
- Vimeo or video hosting analytics: view stats, engagement stats, user-level
  analytics, export/API access, embed/access controls, privacy limits, and
  manual fallback path.
- Current website/domain/offer setup: active URLs, redirects, landing pages,
  pricing, checkout, free-class path, membership/library access, and current
  customer journey.
- Google Classroom/Workspace strategy: whether parents/students need Google
  accounts, whether Classroom is assignment-only, which teacher identity owns
  courses, and whether BNA login remains canonical.
- Zoom scheduling: live class cadence, recurring links, calendar invites,
  attendance needs, recording flow, host/license ownership, and cancellation/
  reschedule handling.
- WhatsApp delivery: WAPI/Whapi/WATI/Wappy/Wacky or other provider, approved
  number, template needs, media URL support, webhook/export/readback access,
  and no-send approval path.
- Ownership/revenue terms: software ownership, audience/data ownership,
  expenses, revenue split, billing source of truth, refunds/cancellations, and
  partner distribution policy.

## Decision Gates

### DEC-20260710-005 - Platform Stack

- Option A: Internal BNA app with Resend, WhatsApp/WAPI or approved provider,
  Zoom, Google APIs, and Rabbi software integrations.
- Option B: First-party community-backed CRM/community/course-builder pattern
  behind the scenes.
- Option C: Hybrid internal UI with legacy CRM only for specific automations if
  it earns its cost.

Recommended working assumption: Option A/C with internal-first UI. No active
GHL, LeadConnector, external CRM write, or CRM-owned UX unless Shloimie makes a
new explicit approved Decision and a read-only capability/cost audit supports
it.

### DEC-20260710-006 - Parent And Student Login Model

- Option A: Give every One Time parent and student a project-scoped login.
- Option B: Parent logins only, with student data managed by admin.
- Option C: Admin-only to start, then add family logins after the first cohort.

Recommended working assumption: design the data/session model for Option A,
but allow launch to operate as Option C if support risk and speed matter more
for the first cohort.

### DEC-20260710-007 - App Ownership And Revenue Split

- Option A: Shloimie owns the software and gives Rabbi a percentage tied to One
  Time growth.
- Option B: Shared platform ownership with a negotiated split.
- Option C: Separate service/revenue agreement for Rabbi use only.

Needs Shloimie/Rabbi decision before finance automation, partner distribution,
public agreement language, or ownership metadata is treated as final.

### DEC-20260710-008 - Google Workspace And Classroom Setup

- Option A: Create/require Google Workspace accounts for parents/students.
- Option B: Use Google Classroom only for assignments while parent login stays
  in BNA.
- Option C: Skip Workspace at first and use internal assignments/calendar.

Recommended working assumption: keep internal assignments/calendar canonical,
then sync to Classroom only after real course IDs, teacher OAuth, and student
account mapping are confirmed.

### DEC-20260710-009 - Rabbi Existing Software Integration Map

- Option A: Integrate with Rabbi app/library/Vimeo analytics as the primary
  content system.
- Option B: Mirror only selected data into BNA and leave analytics in Rabbi
  software.
- Option C: Replace pieces only when API access or workflow limits force it.

Recommended working assumption: Option B first. Mirror only what BNA needs for
parents, students, class-package status, tasks, worksheets, reporting, and
support.

## Implementation Slices

1. **Meeting Drop #3 Class Package**
   - Create a scoped One Time content package from Content job #103.
   - Expected outputs: transcript-review checklist, source-sheet prompt,
     worksheet/reflection prompt, parent recap draft, student question digest,
     clip/ad-candidate notes, and class/session linkage.
   - Guardrail: no member-library publish, bot knowledge promotion, public
     clip, email, WhatsApp, Drive/Vimeo write, or external publish without
     approval.

2. **Motivation And Rewards Product Rules**
   - Define how awards, progress, review status, and parent summaries should
     talk about motivation and commandments.
   - Avoid copy that makes Torah learning sound only prize-driven.
   - Add Rabbi approval before student-visible or parent-facing automated
     summaries.

3. **Classroom/Library Context Linking**
   - Keep recording, source sheet, worksheet, discussion theme, questions,
     comments, progress, and review actions attached to one class/session
     context.
   - Use authenticated/session-based parent/student access where enabled; do
     not make logged-in users rejoin by access code as the primary experience.

4. **Rabbi Stack Discovery Pack**
   - Run the discovery checklist above and output an integration map, blocked
     credential/action list, and recommended build path.
   - Treat external systems as read-only until target, credentials, approval,
     rollback, and smoke paths exist.

5. **Scoped Access And Admin Model**
   - Keep Shloimie as global super admin and One Time project admin/manager.
   - Keep Rabbi Elie as One Time external admin/owner, not a parent.
   - Keep future One Time parents/students project-scoped and separate from BNA
     Academy parents/students.

## Immediate Next Actions

- Use this brief as the handoff for any Content job #103 class-package work.
- Run Rabbi software-stack discovery before replacing or integrating external
  systems.
- Decide the initial One Time access model: admin-only, parent-login-only, or
  full parent/student login.
- Decide ownership/revenue terms before finance automation or public agreement
  copy.
- If UI/product implementation follows from this brief, compile the exact
  route/view/state requirements into a Product Quality Compiler packet first.

## Acceptance Criteria

- Meeting artifact #3 and Content job #103 have a repo-visible build handoff.
- The meeting signal is translated into concrete One Time classroom/content
  product requirements.
- The five decision gates remain explicit and visible.
- The default architecture is internal-first and first-party; legacy CRM is not
  assumed as runtime.
- No raw transcript body, private student context, external send, payment,
  access grant, Drive/Vimeo/Zoom write, credential mutation, or production data
  mutation is introduced by this brief.
