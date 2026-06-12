# BNA Codex Super Prompt — Parent Login, Navigation, Bots, Weekly Update, Rabbi App Audit

**Date:** 2026-06-11
**Owner:** Shloimie / BNA
**Repo:** `shloimie-beep/bnei-neviim-academy`
**Working branch if available:** `release/operations-parent-student-action-registry-2026-06-11`

---

## 0. Non-negotiable execution rules

You are working in the Bnei Neviim Academy repo.

This is an implementation pass, not a planning-only pass.

Do not only create a brief.
Do not only update `MEMORY.md`, `TASKS.md`, or a task ledger.
Do not only say “captured,” “queued,” or “planned.”
Implement the changes, run screenshots/tests, and report what was completed and what remains blocked.

Do not deploy unless Shloimie explicitly approves deployment after the release report.

Do not run `git add .`.

Do not include unrelated dirty files, screenshots, generated artifacts, secrets, or old worktree changes in a deploy/commit.

Do not configure WAPI or Resend as the first step if the parent/student UI is still not navigable.

Do not store raw passwords, API keys, OAuth secrets, payment secrets, or unredacted credential screenshots in Git, Drive, reports, logs, screenshots, or Telegram messages.

If secrets are accidentally found, do not print them.  Record only the secret type, file path, and mitigation.

---

## 1. Save this Pro → Codex handoff before coding

Create or verify this folder structure:

```text
ops/pro-codex/
  README.md
  inbox/
  implemented/
  blocked/
  decisions/
  summaries/
```

Create this file before coding:

```text
ops/pro-codex/inbox/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md
```

Copy this entire prompt into that file.

After successful implementation, create:

```text
ops/pro-codex/implemented/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md
```

If blocked, create:

```text
ops/pro-codex/blocked/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md
```

The blocked file must state the exact blocker, the route/file/command involved, and the next action.

`ops/pro-codex/README.md` must explain:

- Shloimie brainstorms with ChatGPT Pro.
- Pro creates structured implementation prompts.
- Codex reads prompts from `ops/pro-codex/inbox/`.
- Codex implements or blocks.
- Codex moves completed prompts to `implemented/`.
- Codex moves blocked prompts to `blocked/` with a reason.
- Codex writes summaries to `summaries/`.
- “Brief saved” is not implementation.

---

## 2. Immediate release goal

The immediate goal is to send real parent logins.

Before focusing on WAPI, Resend, or the Rabbi app integration, the parent/student UI must be clean enough to use.

Shloimie needs to be able to:

1. Send parents a login link.
2. Let parents set a password or access their secure family dashboard.
3. Show each parent the latest weekly update/video/newsletter at the top of the portal.
4. Show each parent the child’s upcoming private meeting.
5. Show each parent read-only child/student activity.
6. Show clean Hebrew or clean English, not a mixed UI.
7. Give parents a clear Parent Help Assistant / BNA coaching bot entry point.
8. Let parents submit suggestions/bugs in a controlled way.
9. Let Shloimie use Super Admin tools to find parent/student links and inspect login status.

This pass must prioritize:

```text
1. Parent portal
2. Student portal
3. Calendar/private meeting display
4. Weekly update/video/newsletter display
5. Navigation/sidebar/top toolbar cleanup
6. Bot/helper placement and safe scoped behavior
7. Task/decision clarity
8. Rabbi Sheller app intake/audit scaffolding
```

---

## 3. Product model to preserve

BNA Operations is the canonical operating system.

External systems are connectors only:

- WAPI / WhatsApp
- Resend / Gmail / email
- Publer / social
- Google Calendar / Google Classroom
- Vimeo / Replit / Rabbi app
- payment processor
- Drive

Roles and workspaces:

```text
Super Admin = Shloimie / platform owner
BNA Admin = BNA school workspace admin
Provider Admin = Rabbi Sheller or another service provider admin
Parent = BNA parent or provider-program parent/member parent
Student = BNA school student
Provider Participant / Member = user enrolled in Rabbi Sheller/provider program
Public = public provider index visitor
```

Important distinction:

### BNA school parent/student portal

This is the full BNA school experience:

- parent dashboard
- student dashboard
- private meeting schedule
- weekly update/video/newsletter
- goals/accountability where parent-visible
- assignments
- questions
- documents
- calendar
- messages/help
- BNA Parent Self-Governance Coach / Parent Help Assistant
- BNA Student Helper / tutor bot
- Google Classroom later

### Rabbi/provider participant portal

This is simpler:

- program/class info
- next class/schedule
- Zoom/class links later
- worksheets/source sheets
- questions/posts
- messages/help
- payment/access status
- optional simple provider helper

Do not show BNA goals, BNA check-ins, BNA private accountability, or Google Classroom accountability tools in the provider participant portal unless explicitly enabled later.

---

## 4. Phase 0 — Read current repo state and existing reports

Before changing code, read:

```text
AGENTS.md
MEMORY.md
TASKS.md
SYSTEM-STATE.md if present
tasks-pending/2026-06-11-action-registry-telegram-ui-bot.md if present
tasks-pending/2026-06-11-production-ui-qa-fix-loop.md if present
tasks-pending/2026-06-11-provider-onboarding-integrations.md if present
ops/release/2026-06-11-operations-release-cleanup/release-cleanup-report.md if present
ops/release/2026-06-11-operations-release-cleanup/deployment-readiness.md if present
ops/release/2026-06-11-operations-release-cleanup/deployment-blockers.md if present
ops/action-registry/actions.json if present
ops/action-registry/ui-button-map.md if present
public/operations.html
public/parent.html or parent.html
public/student.html or student.html
public/provider-participant.html or provider-participant.html
server.js
scripts/telegram-kimi-bridge.mjs
```

Create the working report immediately:

```text
ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-rabbi-audit.md
```

The report must be updated throughout the work.

---

## 5. Phase 1 — Parent portal must be ready to send

Fix `public/parent.html` and any shared parent portal scripts/styles.

### Required parent portal structure

The parent portal should look like a secure family dashboard.

Top/header:

- BNA logo in brand colors, not just black/white if brand assets exist.
- Bnei Neviim Academy name.
- Parent portal label.
- Secure family dashboard label.
- Language toggle.
- Parent/family identity.
- Current child/children context.

Main content should start with:

```text
Weekly Update / Latest Update
```

This weekly update section must be the first real dashboard content, above the small progress/stat cards.

### Weekly Update card

The weekly update card must show:

- title
- date
- parsha/week label if available, Hebrew and English where appropriate
- video/image thumbnail if available
- short summary
- “What we learned this week”
- topics discussed
- student questions if parent-visible
- worksheet/source links if available
- attendance/check-in snapshot if parent-visible
- next private meeting
- payment/form alerts if relevant
- button: View full update
- button: Watch video, if video exists
- button: Ask about this update

If no update exists, show a polished empty state:

```text
No weekly update has been published yet.
```

Do not leave blank space.

### Latest approved Telegram/Drive content

If the system has a latest approved parent update from Telegram/Drive/content pipeline, it should be used for the weekly update card.

If there is a latest Drive video/audio from the raw media intake, the system should be able to attach it or show a placeholder.  Do not block the portal if video processing is not ready.

If Remotion is already part of the pipeline, create a task/action to render or attach the weekly update video, but do not make parent login depend on a finished video render.

### Parent child labels

If a parent has one child, do not say “My Kids.”

Use:

```text
English: My Child
Hebrew: equivalent Hebrew label
```

If a parent has multiple children:

```text
English: My Children
Hebrew: equivalent Hebrew label
```

Keep “My Children” only when plural is true or when a plural section is intentionally generic.

### Parent read-only child view

Parent can see what is happening in the child/student workspace, but cannot edit it.

Show read-only:

- child name
- English and Hebrew name if available
- private meeting
- calendar/upcoming schedule
- attendance status
- goals/progress if parent-visible
- assignments
- questions
- documents
- weekly updates
- messages/help
- payment/forms if relevant

Hide:

- edit buttons
- admin-only notes
- raw student analysis
- raw psychoanalysis
- raw bot prompt/context
- other students
- other families
- internal task notes
- provider private notes

If a button is admin-only, label it as admin-only and show only to Super Admin/BNA Admin.

Example:

```text
Reset student access
```

This should not appear to normal parents.  If Super Admin is previewing parent portal, show a clear “Admin preview” banner.

### Private meeting schedule

Fix the private meeting logic.

BNA school has a small group of boys, one private meeting per student per week/day pattern.

Rules for current pilot:

- School starts at 10:00.
- Private meeting is 20 minutes.
- Preferred meeting window is before school, especially 9:40–10:00 if only one student is scheduled that day.
- There are five school days: Sunday through Thursday.
- There are about five students, so each student can get one day/week slot.
- If only one student has a meeting that morning, show the actual 20-minute slot, not a generic 09:00–10:00 block.
- Do not show “09:00–10:00” as the private meeting if it is only a 20-minute meeting.

Add a clean meeting display:

```text
Private meeting
Tuesday 09:40–10:00
Location: Park / BNA meeting location if configured
```

If exact slot is not configured:

```text
Private meeting slot not assigned yet.
```

Create a task/action if meeting assignment data is missing.

### Hebrew/English names

The system must support English and Hebrew spelling for parents and students.

For each parent/student record, support:

```text
english_name
hebrew_name
preferred_display_language
```

Example issue:

- Amitai is stored only in English, so Hebrew UI still shows English name.
- Add Hebrew name fields and display Hebrew name in Hebrew UI when available.

If Hebrew name missing:

- show English name as fallback
- create a missing-data task for admin
- do not break the UI

### Remove mistaken question

In Shalom Galambo / Eitan Chaim Golombo parent portal, remove the incorrect question:

```text
Question about unclear coastal transcript term
```

This appears to be a mistaken parsed item.  It should not show in the parent portal.  Either delete it if test data, archive it, or mark it hidden from parent/student display.

Log what was done.

### Parent Help Assistant

Replace vague “send update” or “send message” language.

The parent chat should clearly be a bot/assistant.

Use a name like:

```text
English: BNA Parent Coach
English alternative: Parent Help Assistant
Hebrew: appropriate Hebrew equivalent
```

It is trained on Shloimie’s tone and BNA self-governance / intrinsic motivation approach.

It should not look like an ugly tooltip.  It should open as a professional chat panel:

- desktop: right-side drawer or bottom-right assistant panel
- mobile: floating button or bottom sticky bar that opens full-screen sheet
- includes message history
- clearly says what it can help with
- has safe scope label: “Uses parent-visible child information only.”

The parent can ask questions and make suggestions.

If parent reports a broken UI/bug:

- create ticket/suggestion
- do not create code task directly
- route to Shloimie/admin review

If parent asks for help:

- create help thread
- optionally prepare WhatsApp/manual link if enabled
- log to communications

### Parent portal localization

English mode:

- All UI chrome in English.

Hebrew mode:

- All UI chrome in Hebrew and RTL.

UI chrome includes:

- nav labels
- buttons
- dropdowns
- section headings
- tab labels
- form labels
- empty states
- calendar labels
- assistant labels
- helper text
- account/help text

Hebrew names, Torah sources, and user content may remain Hebrew in either mode.  User-generated English content may remain English if that is the actual content.

Do not mix Hebrew and English in UI chrome.

Acceptance:

- Parent English screenshot: all UI chrome English.
- Parent Hebrew screenshot: all UI chrome Hebrew/RTL.
- Weekly update is first.
- Private meeting shows correct 20-minute time.
- Parent sees read-only child data.
- Parent cannot edit child records.
- Bot is clearly a bot/assistant.
- Bad mistaken question is hidden/removed.
- Parent portal is ready to send to a real parent.

---

## 6. Phase 2 — Parent signup form → login workflow

Audit and fix the flow from parent intake form to parent login.

Goal:

Parents fill out the form, submit waivers/forms, and automatically get linked to their child and receive a login/password setup link.

Audit:

- intake/signup form route
- required fields
- waivers/consents text
- parent record creation
- student linking
- both-parent support
- email/login link generation
- password setup flow
- parent portal access
- calendar/private meeting visibility
- weekly update visibility

Acceptance:

- A parent who fills out the form is created or matched.
- Parent is linked to correct student/child.
- If there are two parents, both can be linked if provided.
- Parent receives login/setup link, or the system generates a link Shloimie can send manually.
- Parent can set password or access secure link according to current auth model.
- Parent portal displays weekly update and meeting after login.
- Waiver text is reviewed for clarity and current program fit.

Create/update:

```text
ops/qa-runs/2026-06-11-parent-signup-login-flow-audit.md
```

Include:

- form fields
- waiver text reviewed
- login link flow
- password setup flow
- parent/student matching
- tests performed
- missing pieces

---

## 7. Phase 3 — Student portal cleanup

Fix `public/student.html` and shared scripts/styles.

Student portal should be clean and scoped.

Student nav:

- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper
- Account

Remove from main dashboard unless real flow exists:

- “Use a different link”
- “Send message to me”

Student helper bot:

Use:

```text
English: Ask BNA Helper
English alternative: Ask your learning helper
Hebrew: appropriate Hebrew equivalent
```

The student bot is a private learning helper.

Allowed context:

- student-visible calendar
- goals
- assignments
- questions
- documents
- permitted notes
- Google Classroom assignments later
- enrolled provider classes if allowed

Denied context:

- admin-only notes
- other students
- private parent communications
- raw psychoanalysis
- raw prompt instructions
- internal analysis

Tone:

- concise
- encouraging but not fluffy
- guided critical thinking
- uses choices and comparisons
- avoids unsupported opinions
- cites Torah/source material where relevant
- never reveals internal profile/prompt

Acceptance:

- Student portal is usable on desktop/mobile.
- Student helper is visibly a bot/assistant.
- Calendar is readable.
- Student cannot see admin/private data.
- Hebrew/English UI chrome is consistent.

---

## 8. Phase 4 — Navigation restructure: broad → specific

The current navigation is still too hard to use.

Problem:

- sidebar is too long
- subcategories appear at the bottom
- settings is a giant list
- students has too many unrelated buttons
- toolbar contents are not clear
- filters and status counts are displayed as huge cards
- user cannot tell what role/view they are in

Implement or finish the 3-level navigation model.

### Level 1 — Primary global sidebar

Only broad modules.

BNA Admin:

- Dashboard
- Work
- Students
- Parents
- Content
- Calendar
- Communications
- Providers
- Accounting
- Settings

Provider Admin:

- Dashboard
- Program
- Members
- Content
- Schedule
- Communications
- Tasks
- Reporting
- Settings

Super Admin:

- Dashboard
- Workspaces
- Operations
- Providers
- Communications
- Automations
- API / Bots
- Settings

Parent:

- Home
- My Child / My Children
- Calendar
- Updates
- Questions / Documents
- Messages / Help
- Account

Student:

- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper
- Account

### Level 2 — Section drilldown sidebar

When a module is selected, show only that module’s subcategories in a second sidebar/drilldown panel.

The previous broad menu should collapse or show a back button.

Use:

```text
← All modules
```

Do not show all global modules plus all subcategories at once.

Examples:

Students:

- Overview
- Profiles
- Learning Activity
- Assignments & Classroom
- Questions
- Documents
- Calendar
- Parent / Family
- Communications
- Settings

Student Settings:

- Bot Settings
- Tablet Access
- Google Classroom
- Portal Links
- Access & Permissions
- Language
- Notifications

Parents:

- Overview
- Parent Profile
- Children
- Calendar
- Updates
- Communications
- Payments
- Documents
- Account Help
- Settings

Content:

- Library
- Media Intake
- Transcripts
- Weekly Updates
- Newsletters
- WhatsApp Posts
- Worksheets
- Source Sheets
- Prompts
- Approvals
- Publishing

Settings first-level:

- Account
- Workspace
- Users & Roles
- Communications
- Learning
- Calendar & Classroom
- Bots & AI
- Provider Index
- Billing & Payments
- Integrations
- Advanced

Settings > Communications:

- Email Identities
- WhatsApp / WAPI
- Templates
- Announcements
- Message Logs
- Support Threads

Settings > Learning:

- Student Portal
- Parent Portal
- Assignments
- Questions
- Documents
- Tablet Access
- Google Classroom

Settings > Bots & AI:

- Super Admin Assistant
- Parent Help Assistant
- Student Helper
- Provider Helper
- Action Registry
- Safety / Alerts
- Bot Logs
- Context Files

Settings > Calendar & Classroom:

- Internal Calendar
- Google Calendar
- Google Classroom
- Sync Logs
- Visibility Rules

### Level 3 — Top toolbar

Page-specific controls go on top, not in huge cards or endless sidebars.

Every page should show:

- breadcrumb
- page title
- workspace chip
- role/view chip
- primary action
- search if useful
- local tabs/chips
- filters

Examples:

Tasks top toolbar:

- Needs Decision
- Waiting
- Ready for Codex
- Scheduled
- Done
- Archive
- filters: owner/workspace/date/type
- search
- New Task

Students top toolbar:

- search student
- view: Overview / Activity / Settings
- filters: status/parent/missing setup
- Add Student

Settings top toolbar:

- search settings
- breadcrumb
- Save / Test / Reset

Acceptance:

- Sidebar is not an endless scroll.
- Settings is nested and navigable.
- Students is grouped logically.
- Tablet Access and Bot Settings are under settings, not random top-level side buttons.
- Parent login/student login links are findable.
- Role/view is always visible.
- Workspace is always visible.

---

## 9. Phase 5 — Replace huge count cards with compact status bars

Current issue:

- dashboard/task areas show giant staggered rectangles with numbers
- this wastes space and looks unprofessional

Replace with compact KPI strips and toolbar chips.

Example:

```text
[Needs Decision 13] [Waiting Shloimie 28] [Waiting Rabbi 7] [Waiting Access 8] [Scheduled 30] [Ready Codex 0] [Done 7] [Archive 84]
```

Clicking a chip filters the list below.

Do not use giant squares for navigation/filtering.

Acceptance:

- no giant staggered cards
- no huge empty white areas after metrics
- mobile uses scrollable chips or compact dropdown
- counts are informative but not dominant

---

## 10. Phase 6 — Task lanes and decisions cleanup

Task states must be understandable.

Do not use “In Progress 94” as a huge user-facing lane.

Use lanes:

- Needs Decision
- Waiting for Shloimie
- Waiting for Rabbi Sheller
- Waiting for Access
- Ready for Codex
- Scheduled
- Done
- Archive

Each task must have:

- owner
- next action
- blocker/decision if blocked
- due date or reason
- workspace
- related object/provider/student/parent if relevant

Decision cards must show:

- exact question
- context summary
- option A
- option B
- option C if relevant
- pros
- cons
- recommendation
- why it matters
- owner
- due date
- approve/defer/ask assistant buttons

Bad:

```text
Decide One Time Zoom/access sharing policy
```

Good:

```text
Question: How should Rabbi Sheller class Zoom access be shared?

Option A: One recurring Zoom link for all active members.
Pros: fastest, easy.
Cons: link can be shared, harder to revoke individual access.

Option B: Member-only portal link.
Pros: better access control, revoke individual users.
Cons: requires portal login.

Recommendation: Option B unless launch speed requires a short pilot with Option A.
```

Acceptance:

- Decisions are understandable without original capture.
- Stale/waiting tasks show why they are waiting.
- “In Progress” is no longer a dumping ground.

---

## 11. Phase 7 — Weekly update pipeline

Shloimie uploaded a Drive video/audio and approved a parent-ready Telegram update.  The parent portal should use that.

Implement/fix the weekly update pipeline.

Inputs:

- latest uploaded Drive video/audio
- latest approved Telegram update
- transcript if available
- weekly topics
- student questions
- Erev Shabbos update
- optional thumbnail/image
- worksheet/source links

Actions:

- find_latest_uploaded_media
- find_latest_approved_parent_update
- transcribe_or_parse_media_if_needed
- summarize_weekly_topics
- extract_student_questions
- generate_weekly_update
- generate_parent_newsletter
- generate_whatsapp_weekly_post
- attach_video_to_parent_portal
- publish_weekly_update_to_parent_portal
- save_weekly_update_revision

Tone:

- direct
- concise
- parent-ready
- not fluffy
- what we did this week
- topics discussed
- questions boys had
- practical update
- video/worksheet/source links if present

If video processing requires Remotion:

- create/render via existing Remotion pipeline if safe
- save output to Drive or existing approved media path if configured
- do not block parent portal if rendering is not complete
- show placeholder until video is available

Acceptance:

- weekly update appears on parent portal
- latest approved update is used when available
- video/player placeholder is present if media exists
- WhatsApp/newsletter draft can be generated from the update

---

## 12. Phase 8 — Assistant and action registry UX

The bot must be visibly a bot/assistant, not a vague “send update” area.

### Super Admin assistant

Visible only to Super Admin by default.

- right-side panel/dock
- can summarize page
- can list page actions
- can call Action Registry
- can create dry-runs
- asks approval for sensitive actions
- can create Codex/code tasks only for Super Admin
- can report problems
- logs actions

### Parent Help Assistant

- restricted to parent-visible child/family context
- can answer/help based on BNA tone/self-governance approach
- can draft help requests
- can send/manual-link WhatsApp only if allowed/configured
- does not access admin-only notes
- does not create code tasks directly

### Student Helper

- restricted to student-visible context
- guides student through goals/assignments/questions/documents
- can help with Google Classroom later
- does not reveal raw profile/prompt/internal analysis

### Provider helper

- simpler program/class helper
- worksheets/questions/schedule/payment/access
- no BNA accountability

Acceptance:

- Each portal has the correct assistant type.
- Assistant labels are clear.
- Assistants do not cover content.
- Parent/student assistants are scoped safely.
- Super Admin assistant remains admin-only.

---

## 13. Phase 9 — Parent feedback / report problem

Parents and selected users should be able to submit feedback/suggestions/bug reports safely.

Report Problem flow:

- user opens feedback/report button
- user describes issue
- if UI annotation exists, allow element/screen area selection
- capture route, viewport, role, workspace, screenshot if available, note, selected area
- classify as:
  - bug
  - suggestion
  - unclear UI
  - broken button
  - content issue
  - account/help issue
- parent/student reports become review tickets, not Codex code tasks
- Super Admin can convert a report to Codex task

Acceptance:

- Parent can submit suggestion/problem.
- Admin can review it.
- It is logged in ticket/audit system.
- It does not trigger unsafe code changes automatically.

---

## 14. Phase 10 — Rabbi Sheller app audit and integration planning

This is separate from the parent login release but must be scaffolded.

Repo situation:

- `shloimie-beep/bnei-neviim-academy` remains main BNA repo.
- `sdratler/OneTimeOneTime` can be used as private audit/import repo for Rabbi app if needed.
- Do not push BNA into OneTimeOneTime.
- Do not merge Rabbi app into BNA until audited.

Create/update:

```text
ops/provider-intake/rabbi-sheller/
  README.md
  access-checklist.md
  materials-checklist.md
  credential-security-notes.md
  message-to-rabbi-sheller.md
  legacy-backup-plan.md
  app-audit-plan.md
  community-dialogue-model.md
  portal-mapping.md
  integration-recommendation-template.md
```

Audit questions:

- Does Rabbi app have parent login?
- Does it have student/member login?
- Does it have admin backend?
- Does it have video/Vimeo library?
- Does it have communication/dialogue?
- Does it have comments/questions/threads?
- Does it have moderation?
- Does Rabbi approve/quote student questions?
- Does it have payment/access tracking?
- Does it have analytics?
- Does it have CRM/member records?
- Does it have calendar/Zoom integration?
- Does it have API/export/database access?
- Which design patterns are worth copying?
- Should BNA integrate, embed, sync, copy patterns, or leave it external?

Security:

Do not ask Rabbi to upload passwords as screenshots if avoidable.

Use:

- Replit collaborator invite
- GitHub collaborator invite
- direct account invitation
- one-time secret link
- password manager shared item
- redacted screenshots for non-secret config
- Drive folder for non-secret materials only

Create message draft to Rabbi Sheller explaining what to send and how.

---

## 15. Phase 11 — Telegram/Drive meeting parser audit

Audit whether the meeting upload from yesterday was parsed correctly.

Create:

```text
ops/qa-runs/2026-06-11-meeting-intake-task-parser-audit.md
```

Check:

- meeting upload detected?
- content item created?
- tasks extracted?
- decisions extracted?
- research items extracted?
- Rabbi/provider tasks routed to Rabbi workspace?
- calendar items extracted?
- access requests extracted?
- comments/dialogue attached to tasks?
- owners assigned?
- next actions clear?
- duplicates avoided?
- stale tasks fixed?

If missing, create exact tasks or fix parser if small/safe.

Do not only report.

---

## 16. Phase 12 — Tests and screenshots

Run:

```text
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
npm test
npm run screenshot
npm run app:smoke
npm run railway:doctor
npm run openai:smoke if API key is available
npm run lighthouse if local server is available
```

Do not deploy unless explicitly instructed.

Generate screenshots at:

- 360x800
- 390x844
- 430x932
- 768x1024
- 1440x1000

Required screenshots:

- Parent English home
- Parent Hebrew home
- Parent weekly update top section
- Parent read-only child snapshot
- Parent private meeting display
- Parent help assistant open
- Parent feedback/report problem
- Student English home
- Student Hebrew home
- Student Ask BNA Helper open
- Student calendar
- Provider participant portal
- Operations navigation broad module
- Operations navigation drilldown
- Settings first-level categories
- Settings second-level category
- Tasks compact toolbar/chips
- Decision card with options/pros/cons
- Rabbi Sheller access checklist

Save screenshots to:

```text
ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshots/
```

Create screenshot index:

```text
ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-screenshot-index.md
```

---

## 17. Phase 13 — Final report

Create final report:

```text
ops/qa-runs/2026-06-11-parent-login-navigation-weekly-update-final.md
```

It must answer:

- Is parent portal ready to send logins? yes/no
- Is weekly update visible at top? yes/no
- Is latest approved update connected? yes/no
- Is video/player/thumbnail supported? yes/no/placeholder
- Is private meeting displayed correctly as a 20-minute slot? yes/no
- Is parent child view read-only? yes/no
- Is Hebrew UI fully Hebrew/RTL? yes/no
- Is English UI fully English/LTR? yes/no
- Are Hebrew/English names supported? yes/no
- Was mistaken “coastal transcript” question removed/hidden? yes/no
- Is Parent Help Assistant clearly a bot? yes/no
- Is Student Helper clearly a bot? yes/no
- Is navigation broad-to-specific? yes/no
- Is settings no longer endless? yes/no
- Are huge cards replaced by compact toolbars/chips? yes/no
- Are task decisions understandable? yes/no
- Is parent signup/login flow working? yes/no
- Are waiver/form texts reviewed? yes/no
- Is meeting parser audited? yes/no
- Is Rabbi Sheller app intake/audit scaffolded? yes/no
- What files changed?
- What screenshots were generated?
- What tests passed/failed?
- What P0 blockers remain?
- What P1 blockers remain?
- Is deployment safe? yes/no

Final response to Shloimie must include:

- report path
- screenshots path
- files changed
- tests run
- readiness answers
- blockers
- exact next step

Stop rule:

Do not finish with “brief created.”
Do not finish with “captured.”
Either implement and test, or state exact blocker.
