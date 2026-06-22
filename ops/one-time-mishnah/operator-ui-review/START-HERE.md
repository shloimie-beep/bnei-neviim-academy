# Shared One Time UI Review Start Here

Status: refreshed for Shloimie UI/workflow review on the existing shared app codebase after the Phase 2 brand pass.

No Railway provisioning, service creation, DNS hookup, PR merge, or unrelated `skillful-motivation` topology change is part of this packet.

## Review Base URL

Current shared live base:

- `https://bneineviimacademy.org`

Local branch/dev base when reviewing before a shared deploy:

- `http://localhost:3000`

Use the same paths below on either base URL.

Local no-database review mode is available when a developer needs to smoke the shared review routes without local database secrets:

```powershell
$env:ONE_TIME_REVIEW_ONLY_NO_DB='1'
$env:HOST='127.0.0.1'
$env:PORT='3210'
node server.js
```

Then use `http://127.0.0.1:3210` as the base URL.

## Exact Review Links

| Role / Area | Shared Live URL |
| --- | --- |
| One Time landing | `https://bneineviimacademy.org/one-time` |
| Rabbi/admin login | `https://bneineviimacademy.org/operations-login.html?returnTo=%2Foperations%3Fworkspace%3Drabbi_sheller_provider%26project%3Done_time_mishnah_class%26view%3Dservice_providers%26section%3Doverview` |
| Rabbi/admin direct after login | `https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview` |
| Provider/Rabbi review mode | `https://bneineviimacademy.org/provider.html?review=one-time` |
| Parent review mode | `https://bneineviimacademy.org/parent.html?review=one-time` |
| Student review mode | `https://bneineviimacademy.org/student.html?review=one-time` |
| Classroom/library review mode | `https://bneineviimacademy.org/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` |
| Email template previews | `https://bneineviimacademy.org/one-time-email-review.html` |

## Secure Test-Identity Handoff

Local ignored file:

- `C:\Users\User\Documents\Codex\2026-06-22\one-time-shared-review-a8190b04\.runtime\onetime-review-identities\one-time-shared-review-logins-20260622.json`

The parent, student, provider and classroom review links use synthetic `TEST-` records and do not need real test passwords. Rabbi/admin Operations review uses the existing private Operations login credentials; no secret value is stored in Git.

## Review Order

1. Open the One Time landing page.
2. Confirm the hero reads `OneTimeOneTime Mishnah`, `Worldwide Live Mishnah Learning`, and `Finish Masechtas. Love Learning Torah.`
3. Confirm the visual direction uses the real OneTimeOneTime logo, Rabbi portrait, press/logo inventory strip, and stage-only teaching stills.
4. Log in to Operations as Shloimie/Rabbi-admin and confirm the One Time workspace context.
5. Open Provider/Rabbi review mode.
6. Open Parent review mode and verify only the linked TEST student appears.
7. Open Student review mode and verify no bot, BNA goals, or unrelated records appear.
8. Open Classroom/library review mode and inspect the sample lesson/video/worksheet structure, including the manual Vimeo `Pesachim perek 10` reference.
9. Open Email template previews and inspect all 21 no-send templates.
10. Record UI/workflow corrections using `NEXT-RAMBLE-TEMPLATE.md`.

## What Is Real

- The shared Express/static app and current PR branch codebase.
- One Time workspace/project keys: `rabbi_sheller_provider` and `one_time_mishnah_class`.
- Read-only review APIs under `/api/one-time-review`.
- Parent, student, provider, classroom and email preview routes.
- Manual Vimeo reference UI state.
- Legacy OneTimeOneTime logo and hero image on the shared review landing/portals.
- Organized brand-kit/config files under `brand-kit/one-time/`, `config/brands/one-time.json`, and `config/service-provider-sites/one-time.json`.
- Stage-only teaching stills under `public/images/one-time/teaching/` derived from the traced promo video.
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
- Press/publication logo strip is legacy-site inventory only and does not imply sponsorship, endorsement, or permission status.

## Externally Blocked

- Live email sending: blocked until Resend sender/domain readiness and send policy are approved.
- Live Stripe charges: blocked until live billing decisions and operator approval.
- Real Zoom class meeting creation: operator-gated to avoid duplicate meetings.
- Automated Vimeo upload: blocked until user-level Vimeo authorization and upload policy are approved.
- Separate One Time Railway instance and `app.onetimeonetime.com`: intentionally paused for now.
- Hosted transcription `REQ-20260621-902`: still blocked on valid hosted transcription credential after previous `401 invalid_credential`.
- Shared live deploy remains blocked unless the existing shared app Railway target is explicitly approved/relinked; do not create a new Railway project/service/database or touch unrelated topology.
