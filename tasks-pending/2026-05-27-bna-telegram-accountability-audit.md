# BNA Telegram + Accountability Audit

Date: 2026-05-27

## Completed

- Confirmed production is the BNA Academy app at `https://bneineviimacademy.org/operations`.
- Confirmed the local Telegram bridge is using `@bneineviimacademy_bot`, not the Shlomo Fam bot.
- Added BNA dashboard routes for students and accountability.
- Added `bna_students` and `bna_accountability_events` tables.
- Synced existing signups into students automatically.
- Added the Accountability dashboard tab for class notes, student questions, goals, decisions, and private meetings.
- Added Telegram capture support so plain-language rambles can create BNA tasks and accountability entries.
- Added Academy dashboard buttons for Pipeline, Signups, Billing, Accountability, and Dashboard.
- Removed stale `/operations.html` dashboard links from the old Telegram helper.
- Smoke-tested live tasks, signups, payments, students, and accountability APIs.
- Smoke-tested live browser login and `/operations?view=accountability`.
- Added pre-signup payment intake for parents who pay before filling out the signup form.
- Added Billing dashboard section for unmatched/payment-intake records.
- Updated the Green Invoice webhook so completed payments without a matching signup are recorded for later matching instead of failing.
- Updated Telegram ramble capture so payment language can create a payment-intake record.

## Current Working Model

- Operational work goes to the task pipeline.
- Payment tracking goes to Billing.
- Payments without a signup go to Billing > Pre-Signup / Unmatched Payments.
- Parents and submitted forms go to Signups.
- Student-specific learning notes, goals, questions, decisions, and private meeting notes go to Accountability.
- Telegram text rambles should be treated as the capture inbox for both tasks and accountability.
- Media uploads are stored in the bridge media inbox and can be pushed to GHL media/social workflows.

## Next Safeguards To Build

- Add a richer class-recording upload flow with transcription, speaker labels, and per-student extraction.
- Add manual edit/delete controls in the Accountability UI.
- Add safer payment logging with confirmation and receipt fields.
- Add a payment matching workflow that converts a payment-intake item into a full signup payment once the parent submits the form.
- Add a student profile page showing all goals, questions, meetings, and parent contact info.
- Add GHL tags for each student and parent once the final naming convention is chosen.
- Add a daily review queue so Telegram rambles do not create noisy tasks without operator approval.
