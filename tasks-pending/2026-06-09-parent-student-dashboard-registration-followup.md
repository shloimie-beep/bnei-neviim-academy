# Parent/Student Dashboard And July Registration Follow-Up

Captured: 2026-06-09T21:15:00+03:00

## Intent

Make parent/student portal access and display feel direct and parent-ready:
parents should receive a login link at their email on file, click it, and land in
their dashboard without typing their email again. Student display should be
daily, collapsible, source-rich, and clear about upcoming goals and meetings.

## Requirements

- Fix Operations parent login buttons so email links are created from the
  record's stored parent email and clipboard failures do not make the send look
  failed after an email was already sent.
- Parent portal token links should consume the token and open the dashboard
  directly; the manual email request form is only a fallback when a parent opens
  `/parent` without a valid link/session.
- Student sources should display Hebrew refs (`heRef`) whenever available,
  regardless of English/Hebrew UI selection.
- Student cards for questions/resources/goals should be collapsible enough that
  the daily view stays scannable.
- Goal filters should clearly show today, upcoming, waiting/review, and done.
- Student and parent dashboards should show meeting date/time and a way to talk
  to Rabbi Shloimie.
- Assign all active boys a weekly private meeting slot between 9:00 and 10:00,
  roughly one boy per weekday while the roster is five boys.
- Parent dashboard needs attendance for today and overall attendance, defaulting
  to present unless BNA was notified otherwise.
- Parent dashboard needs financial status/reminders and a bottom WhatsApp button
  to Rabbi Shloimie.
- July registration email/flow needs verification for existing parent emails:
  existing records can resubmit, update info, sign all six documents, and agree
  to handbooks/proposals.
- Add an internal/external accountability distinction to the current
  filtering/dropdown work. Internal means BNA school students; external means
  accountability people who are not enrolled in the school. Do not rewrite the
  active filter agent's broad dropdown/date/time refactor; layer this
  requirement into that work.
- Add parent-entered bedtime/agreement controls tied to the child, parent weekly
  meeting schedule, Rabbi weekly meeting schedule, and the student's visible
  goals/agreements.
- Display should support boy/girl and external grouping so external family
  accountability people do not look like school-enrolled students.

## Dratler Live Data Update

- 2026-06-09: Menachem Mendel Dratler live signup #8 and student #2800 were
  updated so Ahuva Dratler is the parent portal contact at
  `hahuvadratler@gmail.com`; the prior Shloimie contact was preserved in notes.
- 2026-06-09: Esti Dratler was added as live student/accountability record
  #53986, tagged `external-accountability`, `external`, `dratler`, `girl`, and
  `not-bna-school`, with private student access code created. Esti email
  `estidratler@gmail.com` is stored in notes.
- Ahuva parent access link generation from Menachem was verified with
  `send_email: false`; no email was sent during verification.

## Payment/Email Copy Notes

- Prior parent payments should be described as covering end of May and June.
- July 1 starts registration and the billing cycle for the coming school year.
- Full school-year amount is ILS 12,000 with prorated billing structure.
- Braka/Baraka: mention ILS 200 pending balance.
- Braka/Baraka and Weber should receive the new July 1 credit-card billing link.
- The old link for other parents is still not known; do not send until confirmed.
- Mention future external game/activity/class options: not run directly by
  Rabbi Shloimie, interest-based, with discounted rates for families enrolled in
  the BNA program.

## Verification Needed

- Contract tests for parent-login link behavior and Hebrew source display.
- Local browser smoke of `/parent?token=...` if a safe test token can be
  generated.
- Signup flow smoke for an existing parent email without creating unwanted live
  duplicate/charge records.
- Live deploy plus Railway doctor/smoke before marking app-visible work done.

## Implemented 2026-06-10

- Parent portal now supports parent Goal Board section/status filters,
  Hebrew/English toggle, Hebrew/RTL default from parent language tags, per-child
  parent parser instructions, and multi-file/folder parent meeting upload.
- Added `bna_parent_accountability_pipelines` for parent/student parser
  instructions.
- Parent portal chat and parent meeting recordings now create parent-visible,
  student-hidden, pending-review Goal Board metadata for goals/chores,
  permissions, consequences, and incentives instead of hiding all parent input
  as admin-only.
- Shared Goal Board metadata now supports sources `parent_meeting` and
  `parent_update`, sections `learning`, `personal_home`, `permissions`,
  `incentives`, `meetings`, plus subsection and incentive fields.
- Signup-to-student sync now merges tags so Hebrew/internal/external tags are
  preserved during renewal instead of being overwritten to only `student,bna`.
- Live data verified:
  - Menachem Mendel Dratler #2800 parent portal payload opens for
    `hahuvadratler@gmail.com`, defaults Hebrew/RTL, and shows goal #81.
  - Menachem goal #81 is `Floor cleanup and bed by 10:00 PM`, section
    `personal_home`, parent-visible, student-hidden, pending review, with
    checklist, bedtime `22:00`, and no-going-out-next-day consequence.
  - Esti Dratler #53986 exists as an external accountability record.
  - Amitai Kosofsky #643 is tagged for Hebrew parent portal default.

Verification completed:
- `npm test` passed 136/136 before deployment.
- Focused Goal Board and parent/student portal contract tests passed after the
  final merge fix.
- Railway deployment `b086984f-904f-458f-8a2e-759a1dd4db3a` reached SUCCESS.
- Live app smoke passed:
  `ops/live-smokes/2026-06-10T03-43-51-633Z-live-app-smoke.md`.
- Direct no-email Ahuva parent magic-link API check opened a parent session and
  returned Menachem goal #81 without asking for email entry.

## Remaining Follow-Up

- Audit Telegram bot button/API coverage for Goal Board fields and parent
  accountability routes. It should support sections/subsections/checklists,
  bedtime agreements, consequences, incentives, parent meeting summaries, and
  reviewed student visibility while keeping parent recordings out of Content
  jobs.
- The broader student/parent side-menu layout request from live task #294 is
  separate from this shipped parent accountability work.
