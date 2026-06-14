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

## Live Blocker

Do not deploy from the current checkout without an explicit decision: the
worktree contains a very large set of unrelated uncommitted changes and
deleted/archived files. A Railway deploy from this checkout would likely ship
unrelated local work.

## Next Step

Use a clean deploy scope or get explicit approval to deploy the full dirty
worktree, then run Railway doctor and live smoke before marking the task done.
Live smoke should verify:

- Operations Contacts / Parents loads parent rows.
- Opening a parent with a matching student shows the `Student linked` pill or
  linked detail.
- `Linked Records` shows the student record and match source.
- `Open linked student` opens the matching student profile.
