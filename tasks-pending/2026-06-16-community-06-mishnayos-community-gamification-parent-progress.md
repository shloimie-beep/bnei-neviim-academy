# COMMUNITY-06 Mishnayos Community Additive Extension

## Status

Local implementation and verification are complete. Live rollout is pending a
clean or explicitly approved release path because the shared worktree contains
many unrelated dirty files, so deploying now would ship more than this
COMMUNITY-06 extension.

## Implemented

- Extended the WS11/One Time Mishnayos foundation with assigned course
  questions and per-student responses in first-party tables:
  `bna_course_questions` and `bna_course_question_responses`.
- Added worksheet `due_at` support and standalone migration SQL:
  `railway-migration-2026-06-16-community-06.sql`.
- Added admin APIs for course questions, question responses, and shoutout
  review readback.
- Added student APIs for assigned course-question readback and answering. The
  answer path is scoped to the current student session or private access code,
  ignores client-supplied student/approval/visibility fields, and creates a
  student-visible gamification event only.
- Added parent portal aliases for progress, activity, worksheets, questions,
  and shoutouts. These all use a single parent-scoped guard and return generic
  not-found behavior for unlinked students.
- Added Operations Community module surfaces for overview, course library,
  worksheets, questions, approval queue, event ledger, and parent preview.
- Added student portal Mishnah Community rendering for course-question counts
  and assigned-answer forms.
- Added parent portal WS11 summary readback for courses, worksheets, questions,
  shoutouts, and latest approved parent-visible responses.
- Added shared select enhancer loading to `public/one-time/index.html` because
  that public preview page has native selects and is covered by the app-wide
  select contract.

## Verification

- PASS `node --check server.js`
- PASS `node --check src/lib/bna/gamification.js`
- PASS `node --check src/lib/bna/parent-progress.js`
- PASS inline script parsing for:
  - `public/operations.html`
  - `public/student.html`
  - `public/parent.html`
- PASS focused tests:
  `node --test tests\ws11-community-model-contract.test.js tests\gamification-events.test.js tests\parent-progress-privacy.test.js`
  15/15.
- PASS refreshed contract tests:
  - `node --test tests\app-select-dropdown.test.js`
  - `node --test tests\google-workspace-settings-contract.test.js`
  - `node --test tests\one-time-external-user-portal.test.js`
  - `node --test tests\operations-people-filter.test.js`
- PASS full `npm test` 640/640.
- PASS local Playwright screenshot smoke with server on
  `http://localhost:8080`:
  - `screenshots/community-06/operations-community-desktop.png`
  - `screenshots/community-06/operations-community-mobile.png`
  - `screenshots/community-06/student-community-desktop.png`
  - `screenshots/community-06/student-community-mobile.png`
  - `screenshots/community-06/parent-progress-desktop.png`
  - `screenshots/community-06/parent-progress-mobile.png`

## Browser Notes

- Operations Community rendered at desktop and mobile widths.
- Student Mishnah Community rendered at desktop and mobile widths through the
  real private access-code fallback discovered via authenticated Operations API.
- Parent portal remained at the login-gated screen locally. No parent password
  or parent access code was available, and no parent credential was created,
  reset, rotated, or exposed.

## Remaining

- Deploy from a clean/approved release path.
- Apply `railway-migration-2026-06-16-community-06.sql` in production.
- Run Railway doctor plus live app, public privacy, student-auth, and WS11
  parent-progress smokes after deploy.
- Decide later whether any public leaderboard/shoutout layer should exist.
  Current implementation keeps public/community recognition approval-gated.

## Guardrails

- No GHL, LeadConnector, external CRM, Google, Buffer, WhatsApp, email, billing,
  payment, Zoom/Vimeo, Drive, account-grant, or member-publishing write was
  added or executed.
- Parent visibility is explicit-link plus approval gated.
- Student access-code fallback remains supported.
