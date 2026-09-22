# RAW-20260708-024 - Operations shell split performance batch

## Metadata

- Source channel: codex_chat
- Captured at: 2026-07-08T21:55:00+03:00
- Parse status: registered
- Requirement register: `tasks-pending/2026-07-08-app-backend-helper-performance.md`
- Requirement IDs: `REQ-20260708-086`
- Privacy classification: internal_operations

## Raw Intake

> Use today's app/helper performance audit as the starting point and implement the next batch: split or lazy-load the 2.35MB Operations shell so `/operations` and the Rabbi / One Time views stop feeling heavy. Read the current register and performance reports first, make the code changes, verify with the same measurements, and show me the before/after.

## Follow-up Clarification

> Yeah, it's crazy how long it takes for the data to load up. It like takes a long time for the data to load up.

## Parsed Requirement

- `REQ-20260708-086`: Split the Operations shell delivery and add a Rabbi /
  One Time overview fast-pass so the initial `/operations` route no longer
  serves a 2.35MB HTML document or waits on full Program hydration before
  the first useful view.

## Guardrails

- No external sends, payments, access grants, DNS, WhatsApp/WAPI, Zoom, Vimeo,
  Drive, Stripe, or production-data writes are authorized by this intake.
- Verification should reuse the app/helper performance audit measurements and
  record before/after local evidence.
