# One Time Class Reminder Live Dispatch - 2026-07-12T15:31:36Z

Raw sources: `RAW-20260712-005`, `RAW-20260712-006`

Scope: `rabbi_sheller_provider` / `one_time_mishnah_class`

Production runtime:

- URL: `https://join.onetimeonetime.com`
- Commit: `e4b57d0b63497f005098e48ce35951e9da58a798`
- Branch: `codex/onetime-signup-location-hotfix-20260712`
- Railway deployment: `94ee2e4b-f01a-4c62-8d65-5731851345de`
- Target: `one-time-production / production / one-time-web`

## Readiness

- Class reminders enabled: true
- Class reminder confirmation: true
- WhatsApp reminders enabled: true
- WhatsApp reminder confirmation: true
- CRON secret present: true
- Resend present: true
- One Time WAPI present: true
- Zoom link source: `ONE_TIME_WHATSAPP_CLASS_LINK`
- Zoom link: `https://us06web.zoom.us/j/83339110316?pwd=[redacted]`

## Queue Proof

- Dry-run enqueue: 5 candidates, 5 would queue, 0 skipped.
- Channels: 3 email, 2 WhatsApp.
- Schedule: 2026-07-12 class at 19:00 Israel time; reminder due at 18:30 Israel time.
- Live enqueue: 5 were already queued, 0 skipped.

## Delivery Proof

- Due dry-run at `2026-07-12T15:30:42.239Z`: 5 due, 5 would send, 0 would fail.
- Live dispatch at `2026-07-12T15:31:03.076Z`: 5 processed, 5 sent, 0 failed.
- Channel results: 3 `email:one_time_class_reminder`, 2 `whatsapp:one_time_class_reminder`.
- Providers: 3 Resend sends, 2 One Time WAPI sends.
- Dispatcher returned `message_body_returned=false` and `raw_join_url_returned=false` for every result.

Provider message ID hashes:

- outbox 16: `resend`, `a978c91ca0ed8cac`
- outbox 17: `resend`, `8ef690d895cff930`
- outbox 18: `resend`, `374c4fcd48275e24`
- outbox 19: `one_time_wapi`, `3c1c8b78639e3d63`
- outbox 20: `one_time_wapi`, `90dad375ea1221d2`

## Replay

- Post-send dry-run at `2026-07-12T15:31:22.611Z`: 0 due, 0 would send.
- Live replay at `2026-07-12T15:31:36.357Z`: 0 processed, 0 sent, 0 failed.

## Guardrails

- Raw contact values were not written to this evidence.
- The Zoom password URL was redacted.
- No legacy CRM, payment, access, DNS, credential, historical import, or Telegram write was performed.
