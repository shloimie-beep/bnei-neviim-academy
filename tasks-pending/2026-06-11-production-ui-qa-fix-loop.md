# Production UI QA + Fix Loop Handoff

Status: deployed and verified
Priority: P0/P1 user-facing polish
Created: 2026-06-11

## Completion - 2026-06-12

Implemented, committed, pushed, deployed, and verified in production.

- Commits: `3ecd6a0`, `6344863`
- Railway deployment: `65e96817-8172-4288-a32e-8dd816207eba`
- Production health marker: `2026-06-12-clean-mobile-queue-3ecd6a0`
- Production mobile smoke: `ops/qa-runs/2026-06-12-clean-deploy-mobile-smoke-live/`
- Production app smoke: `ops/live-smokes/2026-06-12T12-15-04-039Z-live-app-smoke.md`
- Production OpenAI smoke: `ops/openai-smokes/2026-06-12T12-16-00-075Z-openai-sidekick-smoke.md`

The ramble was saved in this handoff. The reason it did not appear live earlier
was that the 2026-06-11 pass stopped at local QA because the original workspace
was too dirty to deploy safely. This release moved the clean patch through
Railway and verified the mobile menu collapse/loading behavior on production.

## Objective

Run a screenshot-driven production UI QA and fix loop for the
parent/student-facing pages, provider participant page, calendar, and only the
shared Operations shell pieces needed for role/workspace clarity.

Do not use this pass to polish the entire admin dashboard.

## Required Local Context

Read these first if present:

- `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/manifest.json`
- `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/issues.csv`
- `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/top-findings.md`
- `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/implementation-backlog.md`
- `ops/qa-runs/2026-06-11-operations-restructure-implementation.md`
- `ops/qa-runs/2026-06-11-parent-student-calendar-polish.md`

If Drive/API access is unavailable, use local screenshots and generated audit
artifacts rather than blocking.

## Focus Order

1. BNA Parent Portal
2. BNA Student Workspace
3. Calendar used by parent/student pages
4. Provider participant portal
5. Shared mobile nav/header/tab system
6. Operations shell only where needed for role/workspace clarity
7. Settings only where needed for bot/calendar/language config

## P0 Definition

- privacy leak
- parent/student page not safe to send
- calendar unusable
- mixed language UI in parent/student portals
- broken nav/back path
- primary button dead/no-op
- mobile layout unusable
- provider participant sees BNA accountability/private data
- bot/help entry missing where required

## P1 Definition

- page looks unprofessional
- spacing/tabs/buttons visibly broken
- labels unclear
- oversized cards/filters
- inconsistent button styles
- settings placeholder blocks on user-facing pages
- action exists but unclear/poorly placed

## Screenshot-Driven QA

For each parent/student/provider screenshot:

- identify route/page
- identify role
- identify workspace
- identify visible issue
- fix P0/P1 issues immediately
- save before/after screenshot references

Create report:

- `ops/qa-runs/2026-06-11-production-ui-parent-student-provider.md`

Include:

- issue
- screenshot evidence
- fix
- file changed
- after screenshot
- remaining blocker

## Language Consistency

Rules:

- English UI: all navigation, buttons, helper text, labels, errors, and empty
  states in English.
- Hebrew UI: all navigation, buttons, helper text, labels, errors, and empty
  states in Hebrew.
- Hebrew student names may remain Hebrew.
- Torah source text/names may remain Hebrew.
- User-generated content may remain original language.
- UI chrome must not randomly mix languages.
- Hebrew UI must use RTL.
- English UI must use LTR.

Audit:

- `public/parent.html`
- `public/student.html`
- `public/provider-participant.html`
- calendar UI
- bot/help labels
- account/help pages
- assignments/questions/documents pages
- mobile nav

Fix translation dictionaries rather than hardcoding mixed labels.

## Parent Portal

Parent nav:

- Home
- My Children
- Calendar
- Assignments / Questions / Documents
- Messages / Help
- Provider Index, if enabled
- Account

Fix:

- current child selector
- Home tab spacing
- tabs/header behavior on scroll
- mobile nav spacing
- button alignment
- cards too large
- calendar page
- help assistant entry
- account/password help
- no admin private data
- no other family data

Parent help assistant:

- desktop: bottom-right dock or panel
- mobile: sticky Ask for help bar or floating button
- does not cover important controls
- clear scope: parent-visible child info only

## Student Workspace

Student nav:

- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper
- Account

Fix:

- Today/home view
- next event
- calendar
- goals
- assignments/questions/documents
- Ask BNA Helper entry
- tab spacing
- mobile nav
- no admin controls
- no other student data

Student helper:

- desktop: bottom-right dock/panel
- mobile: sticky Ask BNA Helper bar or floating button
- friendly label, not corporate/admin language
- context-safe

## Calendar

Rules:

- Calendar must load without Google connected.
- Mobile must default to List/Agenda, not a tiny month grid.
- Month/week can exist on desktop.
- Event cards must be readable.
- Event click opens detail drawer/sheet.
- Google disconnected state must not break the page.
- Classroom disconnected state must not break the page.
- BNA calendar is full.
- Provider schedule is simple.

Desktop views:

- Month
- Week
- List
- Today
- Previous/Next

Mobile views:

- List/Agenda default
- compact event cards
- filter sheet if needed
- event detail sheet

Event card fields:

- title
- date/time
- event type
- source badge
- visibility badge
- related student/assignment/task
- link if available

## Provider Participant Portal

Provider participant nav:

- Home
- Program / Class
- Schedule
- Worksheets / Source Sheets
- Questions / Posts
- Messages / Help
- Payment / Access
- Account

Fix:

- do not show BNA goals
- do not show BNA check-ins
- do not show BNA accountability
- do not call participants BNA students
- simple schedule
- clear worksheets/questions/posts
- message/help path
- payment/access status
- mobile usable

## Buttons And Actions

For parent/student/provider user-facing pages:

- every primary button works or is disabled with helper text
- no dead buttons
- no raw browser buttons
- no destructive action without confirmation
- buttons aligned consistently
- labels clear
- close/back buttons present in drawers/modals

## Visual Polish Rules

Fix:

- uneven tab spacing
- tabs wrapping badly
- sticky header overlap
- Home tab misalignment
- header jitter on scroll
- too much whitespace
- giant cards
- tiny text
- mismatched colors
- raw buttons
- inconsistent border radius
- inconsistent shadows
- oversized filter boxes
- missing empty states

## Screenshot QA Requirements

Take before/after screenshots at:

- 360x800
- 390x844
- 430x932
- 768x1024
- 1440x1000

Pages:

Parent:

- Home
- My Children
- Calendar
- Assignments / Questions / Documents
- Messages / Help
- Account
- Help assistant open
- mobile nav open

Student:

- Home
- Calendar
- Goals
- Assignments
- Questions
- Documents
- Ask Helper open
- mobile nav open

Provider Participant:

- Home
- Schedule
- Worksheets
- Questions / Posts
- Messages / Help
- Payment / Access
- mobile nav open

Calendar:

- desktop month/week/list
- mobile list
- event detail drawer
- Google disconnected state

## Tests

Run:

- `npm test`
- `npm run screenshot`
- `npm run app:smoke` if available
- `npm run openai:smoke` if available
- `npm run railway:doctor` if safe
- `npm run lighthouse` if local server is available

Do not deploy if the workspace contains unrelated dirty changes.

## Final Report

Create:

- `ops/qa-runs/2026-06-11-production-ui-parent-student-provider.md`

Report must include:

- files changed
- pages fixed
- screenshots generated
- language QA
- mobile QA
- calendar QA
- bot placement QA
- provider participant separation QA
- remaining P0/P1/P2 issues
- commands run
- tests passed/failed
- whether parent portal is ready to send
- whether student portal is ready to send
- whether provider participant portal is ready
- whether calendar is ready

## Acceptance Criteria

- Parent portal is ready to send to a real parent.
- Student portal is ready to send to a real student.
- Provider participant portal is clearly separate.
- Calendar is readable on mobile.
- UI language is consistent.
- Tabs/headers/buttons are clean.
- Bot/help entry exists on parent/student pages.
- No private/admin data leaks.
- No dead primary buttons.
- Screenshots prove fixes.
