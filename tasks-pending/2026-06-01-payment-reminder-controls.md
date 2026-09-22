# Payment Reminder Controls - 2026-06-01

## Goal

Give BNA Accounting a safe way to manage recurring parent payment reminders from our own app, without accidentally sending live Gmail messages during testing.

## Completed

- Refactored payment reminders into one shared backend engine:
  - `getPaymentReminderCandidates`
  - `summarizePaymentReminderCandidate`
  - `runPaymentReminderSweep`
- Added protected BNA endpoints:
  - `GET /api/bna/payment-reminders/due`
  - `POST /api/bna/payment-reminders/run`
- Live send through the BNA endpoint requires `confirm: "SEND_REMINDERS"`.
- Existing cron route now reuses the shared reminder engine.
- Cron live sending is blocked unless `CRON_SECRET` is configured and provided.
- Added Accounting UI panel:
  - preview due reminders
  - dry-run reminders
  - live send with typed confirmation

## Smoke Tests

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- Local API smoke:
  - health endpoint returned 200
  - reminder preview returned 200
  - reminder dry-run returned 200 and sent no emails
  - live reminder endpoint refused without confirmation
- Mobile Playwright smoke:
  - `/operations?view=accounting`
  - `Payment Reminder Control` rendered
  - no browser errors using a real operations session cookie

## Deployment

- Railway deployment `4c46a762-cf77-464b-ab3c-04a4786c48d0` is `SUCCESS`.
- Live smoke passed:
  - `/api/health`
  - `/api/bna/payment-reminders/due`
  - `/api/bna/payment-reminders/run` dry-run
  - live send refusal without `SEND_REMINDERS`
  - mobile Accounting dashboard

## Still Pending

- Decide whether to enable a true scheduled reminder run in Railway or keep reminders operator-triggered for now.
