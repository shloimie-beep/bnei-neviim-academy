You are working in the Bnei Neviim Academy repo.

This is a FRONTEND NAVIGATION AND PORTAL USABILITY PASS.

Do not configure WAPI in this pass.
Do not configure Resend in this pass.
Do not build new provider integrations in this pass.
Do not deploy in this pass unless explicitly instructed later.
Do not create only another brief.
Do not only update MEMORY/TASKS.
Do not say “captured” or “queued” and stop.

Implement the navigation/UI corrections, run screenshots, and report exactly what was fixed and what remains.

Primary goal:
Make the app navigable and usable enough that Shloimie can actually use it now and send parent/student logins.

Immediate priorities:
1. Parent portal must be clean, Hebrew/English-safe, and ready to send.
2. Parent portal must show the latest weekly update/video/newsletter at the top.
3. Parent must see the child/student dashboard in read-only form.
4. Student portal must have a clean helper/bot entry point.
5. Operations app navigation must be reorganized from broad category → narrower subcategory → page-specific toolbar.
6. Huge square metric cards must become compact top toolbars/chips where appropriate.
7. Settings must become nested/drilldown, not an endless sidebar.
8. Tasks and decisions must become understandable.
9. The user must always know which workspace, role, view, and page they are in.
10. Every page and every visible button must be audited and either wired, moved, hidden, or clearly disabled.

Save this prompt first:
Create this file before coding:

ops/pro-codex/inbox/2026-06-11-navigation-parent-student-portal-polish.md

Then after implementing, move or summarize it into:

ops/pro-codex/implemented/2026-06-11-navigation-parent-student-portal-polish.md

If blocked, write:

ops/pro-codex/blocked/2026-06-11-navigation-parent-student-portal-polish.md

Include the blocker and exact next step.

Context:
Shloimie brainstorms best with ChatGPT Pro. Codex should use the files in ops/pro-codex/inbox as the durable handoff from Pro. Do not let this work become random tasks. Keep the loop clean.

Product model:
- Platform / Super Admin = Shloimie’s control layer.
- BNA School Workspace = the actual BNA school.
- Rabbi Sheller Provider Workspace = provider workspace, not another school.
- Rabbi Sheller = service provider / revenue-share partner.
- BNA students = school students.
- Rabbi Sheller users = participants/members unless actually enrolled in BNA.
- Parent Portal = parent-facing.
- Student Workspace = student-facing.
- Provider Participant Portal = simpler provider-facing participant experience.
- Public Provider Index = public.
- BNA Operations is canonical.
- External systems are connectors only: WAPI/WhatsApp, Resend/email, Publer/social, Google Calendar/Classroom, Vimeo/Replit, payments.

Important distinction:
BNA School Parent/Student Portal is not the same as Provider Participant Portal.

BNA Parent Portal:
- child/children overview
- latest weekly update/video/newsletter
- parent-visible child calendar
- private meetings
- assignments/questions/documents
- read-only child/student activity
- messages/help
- parent help assistant
- account/login help
- provider index if enabled
- no edit access to student records
- no admin-only notes
- no other family data

BNA Student Workspace:
- today/home
- calendar
- goals
- assignments
- questions
- documents
- Ask BNA Helper
- account
- no admin-only notes
- no other student data
- no raw internal prompt/psychoanalysis shown

Provider Participant Portal:
- program/class info
- schedule / next class
- worksheets/source sheets
- questions/posts
- messages/help
- payment/access status
- account
- no BNA goals
- no BNA check-ins
- no BNA accountability system
- no Google Classroom/accountability features unless explicitly enabled later

PHASE 0 — Read and audit before changing

Read:
- AGENTS.md
- MEMORY.md
- TASKS.md
- SYSTEM-STATE.md if present
- ops/pro-codex/README.md if present
- ops/qa-runs/2026-06-11-parent-login-whatsapp-action-audit.md if present
- ops/qa-runs/2026-06-11-parent-login-whatsapp-assistant-final.md if present
- ops/release/2026-06-11-operations-release-cleanup/release-cleanup-report.md if present
- ops/release/2026-06-11-operations-release-cleanup/deployment-readiness.md if present
- current public/operations.html
- current public/parent.html or parent.html
- current public/student.html or student.html
- current public/provider-participant.html or provider-participant.html
- server.js
- action registry files
- all screenshot audit files available under ops/ux-audit-runs/ and ops/release/

If Google Drive screenshot folder is accessible, inspect it:
https://drive.google.com/drive/folders/1J5SdQZKtfJcdd9UX37m4aWZxSBk9OXm0

If Drive is not accessible, document that and use local screenshot folders plus current live/local browser screenshots.

Create this report at the start and update it throughout:

ops/qa-runs/2026-06-11-navigation-parent-student-portal-polish.md

The report must track:
- files changed
- routes inspected
- screenshots inspected
- buttons audited
- nav changes made
- parent portal changes
- student portal changes
- settings changes
- task/decision changes
- remaining P0/P1/P2 issues

PHASE 1 — Implement the broad-to-specific navigation system

Problem:
The sidebar is too long. Subsections appear at the bottom of the sidebar. Settings becomes an endless list. Students has too many unrelated section buttons. Cards that should be toolbar filters are huge boxes. It is hard to know what page/view/workspace/role is active.

Implement a 3-level navigation system.

LEVEL 1: Primary global sidebar
Only broad modules.

For BNA Admin:
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

For Provider Admin:
- Dashboard
- Program
- Members
- Content
- Schedule
- Communications
- Tasks
- Reporting
- Settings

For Super Admin:
- Dashboard
- Workspaces
- Operations
- Providers
- Communications
- Automations
- API / Bots
- Settings

For Parent:
- Home
- My Child / My Children
- Calendar
- Updates
- Questions / Documents
- Messages / Help
- Account

For Student:
- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper
- Account

Rules:
- Use the current workspace and role to decide which nav tree appears.
- Do not show BNA school admin tools to parents/students.
- Do not show BNA accountability tools to provider participants.
- Do not show Super Admin tools to normal admins.
- Do not show provider participant content in the BNA school admin context unless explicitly linked.

LEVEL 2: Section drilldown sidebar
When a broad module is clicked, the sidebar should switch/drill down to that module’s subcategories.

It should show:
- Back to all modules
- current module title
- subcategories for that module

Do not leave all global items plus all subitems visible at once.
Do not put subcategories at the bottom of a giant sidebar.
Do not force long sidebar scrolling for settings or students.

Examples:

Students section:
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

Student Settings subsection:
- Bot Settings
- Tablet Access
- Google Classroom
- Portal Links
- Access & Permissions
- Language
- Notifications

Parents section:
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

Content section:
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

Communications section:
- Overview
- Parent Messages
- Student Messages
- Provider Messages
- Internal Dialogue
- WhatsApp
- Email
- Bot Conversations
- Announcements
- Templates
- Support Threads

Settings first-level categories:
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

Settings > Provider Index:
- Public Listings
- Provider Plans
- Provider Entitlements
- Provider Onboarding
- Commercial Models

LEVEL 3: Top toolbar / horizontal local controls
Use the top toolbar for page-specific tabs, filters, and actions.

Every page should have:
- breadcrumb
- page title
- current workspace chip
- current role/view chip
- primary action
- search if useful
- local tabs or segment controls
- filters/chips

Examples:

Tasks top toolbar:
- local tabs: Needs Decision, Waiting, Ready for Codex, Scheduled, Done, Archive
- filters: owner, workspace, due date, type
- search
- primary action: New Task

Students top toolbar:
- search student
- view tabs: Overview, Activity, Settings
- filters: status, parent, calendar, missing setup
- primary action: Add Student

Settings top toolbar:
- breadcrumb
- search settings
- Save / Test / Reset
- local settings tabs/chips

Content top toolbar:
- Library, Intake, Weekly Updates, Newsletters, WhatsApp Posts, Worksheets, Source Sheets
- filters: status, source, date, project
- primary action: New Content / Upload

Acceptance:
- Sidebar is not an endless scroll.
- Subcategories appear in a drilldown sidebar.
- There is a back path to all modules.
- Page-specific filters move to the top toolbar.
- Cards are not used as navigation where a toolbar/tabs should be used.
- User can find Students, Parent portal/login, Student portal/login, Calendar, WhatsApp settings, Bot settings, Tablet Access, Google Classroom, and Weekly Updates without guessing.

PHASE 2 — Replace huge cards with compact toolbars and aligned layouts

Problem:
Many screens show huge staggered rectangles with numbers:
- Decisions
- Students
- Accounting
- API/Bot
- Inbox/Parsed/Needs Decision/Ready for Codex
- Scheduled/In Progress/Done/Archive

These should not be huge vertical cards.

Fix:
- Convert metric cards into a compact KPI strip.
- Use small badges next to labels.
- Use toolbar chips for state counts.
- Use tables/lists/kanban only where it helps.
- Avoid staggered card columns.
- Keep cards only for actual content summaries, not navigation filters.
- Each card should have one clear action maximum.

Dashboard/task example:
Instead of stacked cards:
- Decisions 13
- Waiting for Shloimie 28
- Waiting for Rabbi Sheller 7
- Waiting for Access 8
- Scheduled 30
- Ready for Codex 0
- Done 7
- Archive 84

Use:
A compact horizontal/scrollable status bar:
[Needs Decision 13] [Waiting Shloimie 28] [Waiting Rabbi 7] [Waiting Access 8] [Scheduled 30] [Ready Codex 0] [Done 7] [Archive 84]

Clicking a chip filters the list below.

Acceptance:
- No giant staggered count cards.
- No huge empty white area after metric cards.
- Status counts are compact.
- Mobile uses horizontal scroll chips or dropdown filter.
- Counts and filters are accessible but do not dominate page.

PHASE 3 — Fix task states and decisions

Problem:
“In Progress” is noisy and confusing.
Tasks sit in huge lanes without clarity.
Decisions do not explain what is being decided.

Rule:
A task should never sit in a vague state without:
- owner
- next action
- blocker/decision
- due date or reason
- workspace
- related object if relevant

User-facing task lanes:
- Needs Decision
- Waiting for Shloimie
- Waiting for Rabbi Sheller
- Waiting for Access
- Ready for Codex
- Scheduled
- Done
- Archive

Remove/de-emphasize:
- In Progress as a major user-facing lane
- Parsed as a giant lane
- Raw counts as primary navigation

If “In Progress” exists internally:
- show only active agent work
- do not use it as a dumping ground
- completed Codex work should move to Done/Archive

Decision cards:
Every decision must be understandable from the card itself.

Each decision must show:
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

Example:
Bad:
“Decide One Time Zoom/access sharing policy”

Good:
Question:
“How should Rabbi Sheller class Zoom access be shared?”

Option A:
One recurring Zoom link for all active members.
Pros:
- fastest to launch
- easy to explain
Cons:
- link can be shared
- harder to revoke individual access

Option B:
Member-only class link shown inside portal.
Pros:
- better access control
- easier to revoke
Cons:
- requires portal login
- slightly more setup

Recommendation:
Use Option B for launch if portal access is ready; use Option A only for short pilot.

Acceptance:
- Decisions are clear.
- User can decide without opening original capture.
- In Progress is not a huge noisy lane.
- Stale/waiting tasks show why they are waiting.

PHASE 4 — Parent portal layout and weekly update

Parent portal is the immediate release target.

Fix parent.html and related scripts/styles.

Required parent layout:
Top:
- BNA logo/header
- language toggle
- secure family dashboard label
- parent identity
- selected child
- child selector only if needed

Main first section:
Weekly Update / Latest Update

This must be the first content section.

Weekly Update should show:
- latest approved update
- title
- date
- video/image thumbnail if available
- short summary
- what we learned this week
- student questions if parent-visible
- worksheet/source links if available
- private meeting/calendar note
- attendance/check-in if parent-visible
- payment/form alert if relevant

Buttons:
- View full update
- Watch video if video exists
- Ask about this update

If no update:
Show polished empty state.

Parent read-only child view:
Parent should be able to see what is happening in the child/student workspace, but not edit it.

Show:
- child snapshot
- calendar
- private meeting
- assignments
- questions
- documents
- goals/progress only if parent-visible
- updates
- messages/help

Do not show:
- edit controls
- admin notes
- private student analysis unless explicitly parent-visible
- raw bot prompt/context
- other families
- other students

Language:
If English mode:
- UI chrome English.
If Hebrew mode:
- UI chrome Hebrew and RTL.
Hebrew names, Torah sources, and user-generated content may remain Hebrew.
But UI labels/buttons/nav/help text/calendar labels must match language.

Label:
If one child:
- English: My Child
- Hebrew equivalent
If multiple:
- English: My Children
- Hebrew equivalent
Do not say “My Kids.”

Parent help assistant:
- not “Send a message to me”
- use “Ask for help” / “Parent Help Assistant”
- clean assistant panel or bottom helper
- no ugly floating black tooltip covering content
- may draft message/help/WhatsApp request
- no real WAPI send without approval/config

Acceptance:
- Parent portal can be sent to a real parent.
- Hebrew mode is correct.
- English mode is correct.
- Weekly update is visible on top.
- Read-only child view works.
- Help assistant is professional.
- No private data leaks.

PHASE 5 — Student portal layout

Fix student.html and related scripts/styles.

Student nav:
- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper
- Account

Student home:
- today’s plan
- next calendar item
- goals
- assignments/questions/documents
- latest update if student-visible
- Ask BNA Helper

Remove:
- “Use a different link” from main dashboard unless real account switch exists.
- “Send message to me” wording.

Student helper:
- English: Ask BNA Helper / Ask your learning helper
- Hebrew equivalent
- desktop: side panel / dock
- mobile: bottom sticky ask bar or full-screen sheet
- no overlap with content
- no raw prompt exposed

Student helper can use:
- student-visible calendar
- goals
- assignments
- questions
- documents
- allowed notes
- Google Classroom assignments once synced

Cannot use/show:
- admin-only notes
- other students
- raw psychoanalysis/prompt
- private parent communications
- provider private data

Acceptance:
- Student portal ready for real student pilot.
- Helper is visible and safe.
- Hebrew/English UI chrome correct.
- Calendar readable.

PHASE 6 — Provider participant portal stays separate

Fix provider-participant.html if needed.

Provider participant nav:
- Home
- Program / Class
- Schedule
- Worksheets / Source Sheets
- Questions / Posts
- Messages / Help
- Payment / Access
- Account

Rules:
- call them Participants/Members
- not BNA Students
- no goals/check-ins/accountability
- no Google Classroom/accountability tools
- no BNA private data
- simple schedule and content access

Acceptance:
- Provider participant portal does not look like BNA student portal.
- No BNA accountability features appear.

PHASE 7 — Bot/assistant placement only, not WAPI config

Do not configure WAPI now.
But make assistant placement/navigation correct.

Super Admin assistant:
- right-side dock/panel
- visible only to Super Admin
- shows current page/workspace/role
- can list available actions
- can route to Action Registry
- can create dry-run previews
- can send code/system requests to Codex only for Super Admin
- logs actions

Parent help assistant:
- restricted
- safe
- parent-visible child context only
- ask for help / message admin
- no code tasks

Student helper:
- restricted
- student-visible context only
- Ask BNA Helper

Report Problem:
- Super Admin can report any UI problem
- allowed admins can report if enabled
- parent/student only if explicitly granted feedback permission
- report captures route, role, workspace, screenshot, note, selected area
- creates ticket/task/audit log

Acceptance:
- assistant placement is visible and professional
- no assistant covers content
- parent/student do not see Super Admin assistant
- Report Problem exists for Super Admin

PHASE 8 — Button and route audit

Go through every current visible button on:
- Operations dashboard
- Tasks
- Students
- Parents
- Content
- Calendar
- Communications
- Settings
- Parent portal
- Student portal
- Provider participant portal

For each:
- works
- moved
- hidden
- disabled with helper text
- or logged as blocked

No dead primary buttons.
No raw browser buttons.
No unlabeled icon-only actions without tooltip.
No destructive action without confirmation.
No real external send/publish/payment in this pass.

Create/update:
ops/qa-runs/2026-06-11-navigation-button-audit.md

Include:
- route
- button label
- expected behavior
- actual behavior
- fix made
- remaining blocker

PHASE 9 — Screenshot QA

Generate screenshots at:
- 360x800
- 390x844
- 430x932
- 768x1024
- 1440x1000

Screenshots required:
- Operations main nav
- Operations settings drilldown
- Tasks compact toolbar/lanes
- Decision card with options/pros/cons
- Student admin overview
- Student settings drilldown
- Parent admin overview
- Parent portal English
- Parent portal Hebrew
- Parent weekly update
- Parent read-only child snapshot
- Parent help assistant
- Student portal English
- Student portal Hebrew
- Student helper
- Student calendar
- Provider participant portal
- Super Admin assistant
- Report Problem mode

Save to:
ops/qa-runs/2026-06-11-navigation-parent-student-portal-polish-screenshots/

Create:
ops/qa-runs/2026-06-11-navigation-parent-student-portal-polish-screenshot-index.md

PHASE 10 — Tests

Run:
- node --check server.js
- node --check scripts/telegram-kimi-bridge.mjs
- npm test
- npm run screenshot
- npm run app:smoke
- npm run railway:doctor
- npm run openai:smoke if API key is available
- npm run lighthouse if local server is available

Do not deploy.
Do not configure WAPI.
Do not configure Resend.

PHASE 11 — Final report

Create:
ops/qa-runs/2026-06-11-navigation-parent-student-portal-polish.md

Report must answer:
- Is the parent portal ready to send logins? yes/no
- Is weekly update visible on parent portal? yes/no
- Is parent read-only child view working? yes/no
- Is the student portal ready? yes/no
- Is the provider participant portal separate? yes/no
- Is navigation broad-to-specific? yes/no
- Is settings no longer an endless sidebar? yes/no
- Are huge status cards replaced with compact toolbar/chips? yes/no
- Are task decisions understandable? yes/no
- Is Hebrew/English UI fixed? yes/no
- Is assistant placement clean? yes/no
- Are all primary buttons audited? yes/no
- What P0 blockers remain?
- What P1 blockers remain?
- Files changed
- Screenshots generated
- Tests run and results
- Clean branch/dirty workspace status

Stop rule:
Do not end by saying “brief created.”
Do not end by saying “planned.”
Implement the UI/navigation changes or state the exact blocker.