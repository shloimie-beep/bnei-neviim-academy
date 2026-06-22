# Shared One Time Review Route Map

Base URL:

- Shared live: `https://bneineviimacademy.org`
- Local dev: `http://localhost:3000`

## Human Review Routes

| Area | Exact Path | Expected Review Scope |
| --- | --- | --- |
| Landing | `/one-time` | One Time public/customer language |
| Rabbi/admin login | `/operations-login.html?returnTo=%2Foperations%3Fworkspace%3Drabbi_sheller_provider%26project%3Done_time_mishnah_class%26view%3Dservice_providers%26section%3Doverview` | Existing private Operations auth |
| Rabbi/admin workspace | `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview` | One Time workspace context |
| Provider/Rabbi portal | `/provider.html?review=one-time` | TEST provider/admin scan surface |
| Parent portal | `/parent.html?review=one-time` | TEST parent sees only one linked TEST student |
| Student portal | `/student.html?review=one-time` | TEST student sees only own class/course/progress, no bot/goals |
| Classroom/library | `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` | TEST lesson, manual Vimeo reference, worksheet, threads |
| Email previews | `/one-time-email-review.html` | Preview-only/no-send transactional templates |

## Review API Routes

| Area | Route | Write Behavior |
| --- | --- | --- |
| Full packet | `/api/one-time-review` | Read-only |
| Parent fixture | `/api/one-time-review/parent` | Read-only |
| Student fixture | `/api/one-time-review/student` | Read-only |
| Provider fixture | `/api/one-time-review/provider` | Read-only |
| Classroom fixture | `/api/one-time-review/classroom` | Read-only |
| Email templates | `/api/one-time-review/email-templates` | Read-only/no-send |
| Classroom sample via access code | `/api/one-time-classroom?code=TEST-ONETIME-REVIEW-ACCESS` | Read-only sample |

## What To Inspect First

1. Navigation language and labels: does it feel like One Time, not BNA?
2. Parent and student scoping: confirm no unrelated people or BNA data appear.
3. Class/library structure: lesson, video, worksheet and class readiness, including the manual Vimeo `Pesachim perek 10` sample reference.
4. Email previews: subject, preview text, body, recipient scope and blocked-send reason.
5. Payments/trial/access wording: does the $67/month and 30-day trial language feel right?
6. Achievement/reward wording: make sure parent-safe explanations sound right.
7. Mobile shape at 390px: check obvious clipping, overflow, and awkward button rows.

## Expected Held Actions

- Live email send.
- WhatsApp send.
- Stripe live charge.
- Real Zoom meeting creation.
- Vimeo automated upload.
- Hosted transcription retry.
- Separate Railway provisioning or DNS hookup.
