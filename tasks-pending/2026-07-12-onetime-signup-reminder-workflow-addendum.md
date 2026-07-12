# One Time Signup And Reminder Workflow Addendum

Raw source:
`raw-input/RAW-20260712-002-onetime-signup-reminder-workflow-addendum.md`

Execution run:
`ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion`

Delivery lane: existing PR #129,
`codex/onetime-p0p1-corrective-20260711`.

## Priority Change

This P0 addendum supersedes the previous next-batch ordering for the active
run. The functioning direct signup, CRM capture, immediate confirmation,
Rabbi Telegram alert, and class-reminder workflow are now the next executable
slice. Remaining landing polish and older provider-login/CRM/ramble-service
requirements stay open, but they should not block this workflow.

## Requirements

| ID | Priority | Batch | Status | Requirement | Terminal Criteria |
| --- | --- | --- | --- | --- | --- |
| REQ-20260712-012 | P0 | signup-intake-addendum | Verified | Preserve the signup/reminder addendum as raw intake and attach it to the active PR #129 run. | Raw file, register, memory note, run source, and `latest.json` reference are current. |
| REQ-20260712-013 | P0 | direct-signup-page | Not started | Create canonical `/one-time/signup`, point all public `Sign Up Now` actions to the same form, remove internal workflow copy, and style it as a professional black/yellow/ice-blue standalone signup page. | Required fields, header/back link, responsive states at 1440/1024/768/430/390, no member-login/portal actions, and no duplicate signup implementation. |
| REQ-20260712-014 | P0 | city-timezone-consent | Not started | Implement city autocomplete/storage and server-side timezone validation for the worldwide 7:00 p.m. Israel class and 6:30 p.m. Israel reminder instant. | City stores unambiguous fields/timezone; browser timezone mismatches are stored for review; DST cases for Jerusalem/New York/London/Sydney pass; recipient local and Israel times render correctly. |
| REQ-20260712-015 | P0 | crm-confirmation-outbox | Not started | Extend `/api/one-time/interest` or a shared signup API to atomically upsert product lead, scoped CRM contact/lead, consent, suppression state, timeline, confirmation-email outbox, and Rabbi Telegram alert outbox with safe dedupe. | Repeat submissions do not duplicate CRM records, confirmations, reminders, or Telegram alerts; no hard-coded consent; `.invalid` tests perform no external send. |
| REQ-20260712-016 | P0 | confirmation-email | Not started | Send one immediate transactional email to every valid signup using server-side approved class-link alias only, with Resend failures preserved for retry. | Email copy/from/reply-to/subject match source; Zoom join URL is never public JS/diagnostics/evidence; no host/start link or meeting creation. |
| REQ-20260712-017 | P0 | reminder-dispatcher | Not started | Build dedicated protected One Time class-reminder dispatcher and durable outbox, separate from payment reminders, with exact idempotency and suppression handling. | Sends exactly once per person/class date/channel/30-minute window; supports paused/canceled/schedule/link changes, retries, unsubscribe/STOP/suppression, and CRM/provider-delivery timeline logs. |
| REQ-20260712-018 | P0 | whatsapp-gates | Not started | Add WhatsApp reminder eligibility, readiness, STOP/suppression behavior, and Rabbi-scoped Whapi settings without using BNA/Shloimie sender. | Phone required only for WhatsApp choices; WAPI readiness is redacted; expired auth reports the QR-scan action; no WhatsApp sends without explicit selected consent. |
| REQ-20260712-019 | P0 | rabbi-telegram-alert | Not started | Enqueue exactly one Rabbi Scheller Telegram alert per genuine signup through the scoped `one_time_rabbi_operator` role, excluding Zoom URL. | Alert fields include name, Family/School, city/country, reminder preference, CRM ref, and secure CRM deep link; generic BNA/Shloimie bot is not used. |
| REQ-20260712-020 | P0 | no-portal-negative-tests | Not started | Prove the signup form does not create portal/member/login/password/payment/access/classroom records or invitations. | Negative tests cover parent/student portal, member login, password/setup, recovery code, entitlements/access, Stripe/checkout, and trial/member invitation paths. |
| REQ-20260712-021 | P0 | local-class-preview-gate | Not started | Build redacted preview for exactly three scoped local-class contacts tagged `local_class_attendee`, `zoom_mishnayos_class`, or `local_student`, and gate activation until operator personal test passes. | Preview blocks if actual count is not exactly three; enrollment is email-only with approval source; no portal/access/WhatsApp; no invented city/timezone. |
| REQ-20260712-022 | P0 | readiness-deploy-operator-test | Needs operator decision | After implementation, tests, deployment, readiness, scheduler health, and visual proof, hand the operator the single personal E2E test instructions and guarded reminder simulation command. | Do not activate local-class segment or mark Done until operator submits their own details and confirms the personal test; then verify CRM/provider evidence and replay idempotency. |
| REQ-20260712-023 | P0 | signup-test-matrix | Not started | Run and record the required test matrix, screenshots, no-send tests, CI, watchdogs, and run/PR evidence for the signup/reminder workflow. | Matrix covers all requested form, timezone, consent, CRM, outbox, scheduler, Telegram, WAPI, local-contact, no-portal, cross-workspace, and `.invalid` cases. |

## Decisions And Blockers

| ID | Decision | Missing information | Owner | Recommended option | Blocks requirements | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DEC-20260712-002 | Personal operator E2E test authorization | The operator must submit their own approved email/phone/city/reminder choices in the deployed form before Codex can verify the real external send path and activate the exact three-contact local segment. | Operator | Complete local implementation/no-send proof first, deploy after approved release gate, then ask operator to submit exactly one personal test. | Terminal Done for REQ-20260712-022 and local-class activation. | Needs operator decision after deploy readiness |
| DEC-20260712-003 | Local-class three-contact activation | The exact three-contact segment may not be activated until the personal test passes and the preview count is exactly three. | Operator / Codex | Produce redacted preview and leave activation blocked until personal test passes. | REQ-20260712-021 final activation only. | Needs operator decision after preview and personal test |

## Guardrails

- No competing PR.
- No reset or overwrite of unknown dirty work.
- No public JavaScript or evidence containing raw Zoom join URL.
- No Zoom host/start URL or new Zoom meeting creation.
- No portal, member account, password/setup, checkout/payment, Stripe, trial,
  classroom/recovery-code, or access-grant workflow from this form.
- No WhatsApp send unless the signup explicitly selected WhatsApp or both.
- No local-class activation until the operator personal test passes.
- No external production sends from synthetic `.invalid` tests.

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-20260712-013 | `public/one-time/signup.html` or shared component, `/one-time/signup`, `/one-time`, route/action registries | Build standalone form route and redirect/link public CTAs to it. | Browser responsive proof and action/route watchdog. | Pending | Pending | Required before Done |
| REQ-20260712-014 | city/timezone helper, signup API, tests | Add structured city selection, IANA timezone validation, DST-safe class/reminder conversion. | Timezone unit tests and API tests. | Pending | Pending | Required before Done |
| REQ-20260712-015..019 | `server.js`, CRM/outbox helpers, Resend/WAPI/Telegram helpers, migrations/tests | Extend signup capture, confirmation, reminder outbox/worker, WAPI gates, Telegram alert. | API tests, no-send tests, idempotency tests, readiness checks. | Pending | Pending | Required before Done |
| REQ-20260712-020..023 | tests, scripts, run evidence, screenshots | Add negative tests, local-class preview, operator test command, and final matrix. | Required matrix plus `npm run bna:run:validate`. | Pending | Pending | Required before Done |

## Current Next Action

Inspect current `/api/one-time/interest`, landing/signup/onboarding files,
CRM contact model, email/outbox helpers, Telegram notification helper, WAPI
readiness code, and scheduler/cron conventions. Then implement
`REQ-20260712-013` through `REQ-20260712-015` first.
