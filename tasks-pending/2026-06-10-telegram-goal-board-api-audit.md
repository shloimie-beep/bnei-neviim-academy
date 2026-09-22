# Telegram Goal Board API Audit

Captured: 2026-06-10T07:04:00+03:00

Live Operations task: #311

## Intent

Audit the academy Telegram bot so parent/student accountability commands and
buttons can reach all Goal Board fields now supported by the app.

## Scope

- Review Telegram parser routing and button/API handlers for:
  - Goal Board section: `learning`, `personal_home`, `permissions`,
    `incentives`, `meetings`
  - child-specific subsection
  - checklist items
  - bedtime/home agreements
  - chosen consequences and recovery paths
  - incentives and percent targets
  - parent meeting summaries/uploads
  - parent-visible vs student-visible review gating
- Confirm parent recordings and parent chat stay in accountability routes and do
  not create Content jobs or WhatsApp/social drafts.
- Confirm Telegram can create/update parent-created goals as
  parent-visible/student-hidden/pending-review when needed.
- Add tests for Telegram phrases that mention chores, bedtime, permissions,
  consequences, incentives, and parent meetings.

## Current App State

- Server Goal Board metadata supports `parent_meeting`, `parent_update`,
  sections, subsections, checklists, agreements, consequences, and incentives.
- Parent portal chat and parent meeting uploads already write reviewed Goal
  Board metadata.
- Parent portal UI supports parser instructions and multi-file/folder meeting
  uploads.

## Verification Target

- Focused Telegram routing/API tests pass.
- `npm test` passes.
- If app-visible/server-visible behavior changes, deploy to Railway, run
  `npm run railway:doctor`, and run `npm run app:smoke`.
