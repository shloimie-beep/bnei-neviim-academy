# Shared One Time UI Review Start Here

Status: prepared for Shloimie UI/workflow review on the existing shared app codebase.

No Railway provisioning, service creation, DNS hookup, or `skillful-motivation` changes are part of this packet.

## Review Base URL

Current shared live base:

- `https://bneineviimacademy.org`

Local branch/dev base when reviewing before a shared deploy:

- `http://localhost:3000`

Use the same paths below on either base URL.

## Exact Review Links

| Role / Area | Path |
| --- | --- |
| One Time landing | `/one-time` |
| Rabbi/admin login | `/operations-login.html?returnTo=%2Foperations%3Fworkspace%3Drabbi_sheller_provider%26project%3Done_time_mishnah_class%26view%3Dservice_providers%26section%3Doverview` |
| Rabbi/admin direct after login | `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview` |
| Provider/Rabbi review mode | `/provider.html?review=one-time` |
| Parent review mode | `/parent.html?review=one-time` |
| Student review mode | `/student.html?review=one-time` |
| Classroom/library review mode | `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` |
| Email template previews | `/one-time-email-review.html` |

## Secure Test-Identity Handoff

Local ignored file:

- `C:\Users\User\Documents\Codex\2026-06-22\one-time-shared-review-a8190b04\.runtime\onetime-review-identities\one-time-shared-review-logins-20260622.json`

The parent, student, provider and classroom review links use synthetic `TEST-` records and do not need real test passwords. Rabbi/admin Operations review uses the existing private Operations login credentials; no secret value is stored in Git.

## Review Order

1. Open the One Time landing page.
2. Log in to Operations as Shloimie/Rabbi-admin and confirm the One Time workspace context.
3. Open Provider/Rabbi review mode.
4. Open Parent review mode and verify only the linked TEST student appears.
5. Open Student review mode and verify no bot, BNA goals, or unrelated records appear.
6. Open Classroom/library review mode and inspect the sample lesson/video/worksheet structure, including the manual Vimeo `Pesachim perek 10` reference.
7. Open Email template previews and inspect all no-send templates.
8. Record UI/workflow corrections using `NEXT-RAMBLE-TEMPLATE.md`.

## What Is Real

- The shared Express/static app and current PR branch codebase.
- One Time workspace/project keys: `rabbi_sheller_provider` and `one_time_mishnah_class`.
- Read-only review APIs under `/api/one-time-review`.
- Parent, student, provider, classroom and email preview routes.
- Manual Vimeo reference UI state.
- Legacy OneTimeOneTime logo and hero image on the shared review landing/portals.
- No-send email template preview surface.
- Local-only review submit behavior for parent/student/classroom feedback forms.

## What Is Mock/Test-Only

- `TEST-ONETIME-PARENT-001`
- `TEST-ONETIME-STUDENT-001`
- `TEST Weekly Mishnah Live Class`
- Attendance/minutes/progress examples.
- $67/month and 30-day trial examples.
- Milestone, achievement and reward examples.
- Private question and support ticket examples.
- Manual Vimeo sample reference `https://vimeo.com/1178363755/282ea2577c`, traced from the legacy OneTimeOneTime downloaded site.

## Externally Blocked

- Live email sending: blocked until Resend sender/domain readiness and send policy are approved.
- Live Stripe charges: blocked until live billing decisions and operator approval.
- Real Zoom class meeting creation: operator-gated to avoid duplicate meetings.
- Automated Vimeo upload: blocked until user-level Vimeo authorization and upload policy are approved.
- Separate One Time Railway instance and `app.onetimeonetime.com`: intentionally paused for now.
- Hosted transcription `REQ-20260621-902`: still blocked on valid hosted transcription credential after previous `401 invalid_credential`.
