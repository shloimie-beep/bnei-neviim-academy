# One Time Reminder Sequence Metadata

Generated: 2026-07-01T19:13:57+03:00

Requirement: `REQ-20260701-607`

Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Status

Dry-run metadata prepared. Reminder activation is blocked.

No reminder email, WhatsApp, SMS, Telegram, portal notification, calendar write,
Zoom write, task auto-close, cron activation, or external CRM write was
performed.

## Draft Sequence

The first safe reminder sequence should stay disabled until Shloimie supplies
the final live class schedule, reminder cadence, approved copy, and test member
for smoke proof.

Proposed disabled windows:

- `class_24h`: one day before class start.
- `class_same_day`: morning of the class, timezone `Asia/Jerusalem` unless
  Shloimie approves another timezone.
- `class_60m`: one hour before class start.
- `link_changed`: only after an approved class-link change notice replaces the
  stale link.
- `class_canceled_or_rescheduled`: only after Shloimie approves cancellation or
  reschedule copy.

## Eligibility Rules

- Send only to active One Time members with live access or an explicitly
  approved trial/live access grant.
- Do not send to library-only members unless they later receive live access.
- Suppress do-not-contact, bounced, complained, manually suppressed,
  canceled/refunded, revoked access, and manual-review rows.
- Use class/session ID, member ID, schedule version, reminder window, and
  template key for idempotency.
- Never infer class dates or Zoom links from old recordings, ad copy, or legacy
  CRM notes.

## Required Inputs Before Activation

- Final class date/time and timezone.
- Final Zoom/session destination policy.
- Final reminder windows/cadence.
- Approved subject/body for each reminder window.
- Exact eligible member source/segment.
- Suppression policy and rollback/no-send path.
- Approved seed/test recipient or synthetic member for one smoke.
- Explicit approval to activate reminder sends.

## Verification Before Activation

- Dry-run recipient matrix shows eligible, suppressed, and no-send rows.
- Dry-run idempotency replay shows no duplicate sends.
- Stale-link smoke shows old links are not sent after a link change.
- Post-approval smoke sends only to the approved test member/recipient.

## Decision

This requirement remains `Needs operator decision` until the required inputs and
explicit activation approval are supplied.
