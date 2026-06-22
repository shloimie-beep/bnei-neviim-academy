# Shared One Time Review Route Map

Base URL:

- Shared live: `https://bneineviimacademy.org`
- Local dev: `http://localhost:3000`
- Local no-database review smoke: `http://127.0.0.1:3210` after starting `ONE_TIME_REVIEW_ONLY_NO_DB=1 node server.js`

## Human Review Routes

| Area | Exact Shared URL | Expected Review Scope |
| --- | --- | --- |
| Landing | `https://bneineviimacademy.org/one-time` | Branded public/customer review page |
| Rabbi/admin login | `https://bneineviimacademy.org/operations-login.html?returnTo=%2Foperations%3Fworkspace%3Drabbi_sheller_provider%26project%3Done_time_mishnah_class%26view%3Dservice_providers%26section%3Doverview` | Existing private Operations auth |
| Rabbi/admin workspace | `https://bneineviimacademy.org/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview` | One Time workspace context |
| Provider/Rabbi portal | `https://bneineviimacademy.org/provider.html?review=one-time` | TEST provider/admin scan surface |
| Parent portal | `https://bneineviimacademy.org/parent.html?review=one-time` | TEST parent sees only one linked TEST student |
| Student portal | `https://bneineviimacademy.org/student.html?review=one-time` | TEST student sees only own class/course/progress, no bot/goals |
| Classroom/library | `https://bneineviimacademy.org/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS` | TEST lesson, manual Vimeo reference, worksheet, threads |
| Email previews | `https://bneineviimacademy.org/one-time-email-review.html` | 21 preview-only/no-send transactional templates |

Landing page checklist:

- Hero: `OneTimeOneTime Mishnah`, `Worldwide Live Mishnah Learning`, `Finish Masechtas. Love Learning Torah.`
- Sections: media proof strip, value pillars, live shiur, how it works, library preview, teaching gallery, portal preview, Rabbi story, interest form, FAQ, footer.
- Guardrails: no checkout, no access grant, no email/WhatsApp send, no Zoom creation, no Vimeo upload, no external CRM write.

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
2. Landing brand: logo, portrait, color, CTAs, proof strip, and final CTA.
3. Parent and student scoping: confirm no unrelated people or BNA data appear.
4. Class/library structure: lesson, video, worksheet and class readiness, including the manual Vimeo `Pesachim perek 10` sample reference.
5. Email previews: 21 no-send templates with subject, preview text, body, recipient scope and blocked-send reason.
6. Payments/trial/access wording: does the $67/month and 30-day trial language feel right?
7. Achievement/reward wording: make sure parent-safe explanations sound right.
8. Mobile shape at 390px: check obvious clipping, overflow, and awkward button rows.

## Expected Held Actions

- Live email send.
- WhatsApp send.
- Stripe live charge.
- Real Zoom meeting creation.
- Vimeo automated upload.
- Hosted transcription retry.
- Separate Railway provisioning or DNS hookup.
- Shared Railway deploy unless the existing shared app target is approved and safe.
