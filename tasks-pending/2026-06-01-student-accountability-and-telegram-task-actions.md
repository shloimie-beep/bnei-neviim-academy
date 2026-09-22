# Student Accountability + Telegram Task Actions

Date: 2026-06-01

## Implemented

- Expanded `bna_accountability_events` with structured accountability fields:
  - `goal_target_value`
  - `goal_actual_value`
  - `goal_unit`
  - `progress_percent`
  - `attendance_status`
  - `next_check_in_date`
  - `engagement_level`
  - `follow_up_required`
  - `metadata`

- Updated accountability API:
  - `POST /api/bna/accountability` accepts those fields.
  - `GET /api/bna/students` returns `avg_goal_progress` and `next_check_in_date`.

- Updated Operations Students UI:
  - student profile KPIs now show questions, goals, average progress, and follow-ups.
  - accountability chart uses structured progress data when available.
  - event cards show progress, actual/target, attendance, engagement, next check-in, and follow-up badges.

- Updated Telegram bridge:
  - student accountability capture extracts simple progress details from natural language.
  - captured tasks get Telegram buttons:
    - `Mine`
    - `Kimi`
    - `Urgent`
    - `Done`
  - task callback buttons update the stored BNA task.

## Verified

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- temporary structured accountability event create/read/delete passed.
- Playwright mobile smoke passed for Tasks, Content, and Students locally.
- Deployed to Railway as `448f71a2-c025-4ce9-84d4-db44c1d6bb3f`.
- Live smoke passed:
  - `/api/health`
  - live structured accountability create/read/delete
  - live mobile Students and Tasks pages

## Still Open

- Add student-match buttons when a student accountability note is captured but the student is ambiguous.
- Build richer weekly/daily goal scoring views once real student meeting data accumulates.
