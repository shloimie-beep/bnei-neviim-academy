# Student Match Buttons - 2026-06-01

## Goal

When the Telegram bot captures a student-related accountability note but cannot confidently identify the student, it should not silently file the note under nobody or the wrong student. It should save the note, then ask Shloimie to choose the student with inline buttons.

## Completed

- Added protected backend update endpoint:
  - `PATCH /api/bna/accountability/:id`
- Updated Telegram bridge:
  - detects unmatched student-related accountability events
  - sends `Which student should this accountability note attach to?`
  - shows up to 8 student buttons
  - callback format: `student:<eventId>:<studentId>`
  - callback updates `student_id` and `student_name` on the saved event
- Restarted the local Telegram bridge so the running bot uses this code.

## Smoke Tests

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- Local backend smoke:
  - created temporary accountability event #11
  - patched it to a student
  - deleted the temporary event

## Still Pending

- Real Telegram callback click test the next time an unmatched student note is captured.

## Deployment

- Railway deployment `9cfa39d4-b60b-4d46-b3a4-6e0f50f833d0` is `SUCCESS`.
- Live smoke passed:
  - created temporary accountability event #12
  - patched it to a student
  - deleted the temporary event
