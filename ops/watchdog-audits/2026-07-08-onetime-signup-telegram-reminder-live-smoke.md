# OneTime Signup Telegram Reminder - Live Smoke

Recorded at: 2026-07-08T19:44:01+03:00
Requirement: `REQ-20260708-072`
Raw input: `raw-input/RAW-20260708-016-onetime-signup-telegram-reminder.md`
Runtime commit: `fbabe124`
Railway service: `one-time-web`
Railway environment: `production`
Railway deployment: `85b1f0f0-b3ae-49b1-8b00-9932a1cd7631`
Deployment status: `SUCCESS`

## Implementation

- `POST /api/one-time/interest` and `/api/bna/product-leads` still save the
  first-party OneTime lead before any reminder logic.
- After lead creation, the route starts `sendOneTimeSignupTelegramReminder` in
  the background and catches errors so Telegram outages/config issues do not
  block signup completion.
- The Telegram message uses the existing BNA/Shloimie Telegram bot path and
  includes escaped lead fields: email, parent name, student name, region,
  source, lead id, and created time when present.
- `sendTelegramNotification` now normalizes text input, reports skipped/missing
  configuration without throwing, and returns a small status object.

## Verification

- `node --check server.js` passed.
- `node --test tests/one-time-product-system.test.js tests/one-time-onboarding-intake.test.js tests/parent-accountability-onboarding.test.js tests/one-time-focused-landing.test.js` passed: 18/18.
- `npm run watchdog:actions` passed.
- `npm run watchdog:protocol-drift` passed and refreshed drift reports.
- `npm run secrets:audit` passed.
- `git diff --check` passed with line-ending warnings only.
- Railway deployment `85b1f0f0-b3ae-49b1-8b00-9932a1cd7631` reached
  `SUCCESS`.
- Live smoke passed:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`.

## Guardrails

- No live signup form submit was performed during smoke testing, to avoid
  creating a production lead or intentionally triggering the Telegram bot.
- No parent/student email was sent.
- No WhatsApp/WAPI message was sent.
- No checkout, payment, access grant, Zoom, Vimeo, Drive, DNS, Stripe, or
  external CRM mutation was performed.
- The alert is an internal operator reminder only; signup remains first-party
  lead capture.
