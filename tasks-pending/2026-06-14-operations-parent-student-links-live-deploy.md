# Operations Parent-to-Student Links Live Deploy

Created: 2026-06-14T00:08:27+03:00
Source: chat request: "make the student linked from parents".

## Intent

Ship the locally verified Operations change that lets a parent/contact record
resolve and open its linked student profile.

## Local Changes

- Updated `public/operations.html`:
  - Contacts now loads the student roster through `needsStudentRosterData`, so
    parent records can resolve linked students without first opening Students.
  - `linkedStudentForSignup(signup)` now matches by:
    1. `student.signup_id === signup.id`
    2. parent email plus student name
    3. student name fallback
  - Parent/contact cards show a `Student linked` pill when a matching student
    record exists.
  - Parent detail has a new `Linked Records` section.
  - Parent detail overview and Linked Records include an `Open linked student`
    action that calls `selectStudentAndOpen(student.id, 'profile')`.
- Updated `tests/operations-people-filter.test.js` with regression coverage for
  Contacts loading the student roster and parent detail opening the linked
  student record.

## Verification

- PASS `node --test tests/operations-people-filter.test.js` (5/5)
- PASS `node --check server.js`
- PASS `git diff --check -- public\operations.html tests\operations-people-filter.test.js`
- PASS mocked Playwright smoke on `http://bna.local/operations.html?workspace=bna&view=contacts&section=parents`:
  Contacts loaded `/api/bna/students`, parent card showed `Student linked`,
  `Linked Records` showed `Student #34` with `Signup ID`, and `Open linked
  student` opened the student profile.
- PASS current focused verification:
  `node --test tests/operations-people-filter.test.js tests/operations-saas-crm-redesign.test.js tests/parent-student-portal-contract.test.js --test-reporter=spec`
  (35/35)
- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `npm test` 350/350
- PASS production `operations.html` readback confirmed the deployed bundle
  contains `linkedStudentForSignup` and `Open linked student`.

## Deployment Gate

Completed.

- Current Railway deployment: `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9`.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-08-19-575Z-live-app-smoke.md`.
- PASS PII-safe live Operations browser smoke:
  `ops/playwright-smokes/2026-06-14-operations-parent-student-links-live/report.md`.

Live smoke verified:

- Operations Contacts / Parents loads parent rows.
- Opening a parent with a matching student shows the `Student linked` pill or
  linked detail.
- `Linked Records` shows the student record and match source.
- `Open linked student` opens the matching student profile.
- The report records only internal IDs and match source; no parent/student
  names, emails, phones, or screenshots were written.

## Status

Closed for this scoped parent-to-student link fix. Broader goal-mode follow-up
work remains open for onboarding, helper action coverage, CRM/WAPI, provider
login, automations/prompts, and deeper Rabbi/One Time implementation.
