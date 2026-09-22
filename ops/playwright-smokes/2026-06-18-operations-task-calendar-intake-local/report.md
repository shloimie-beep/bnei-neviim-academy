# Operations Task/Calendar/Intake Local Smoke - 2026-06-18

Result: passed

Checked local Operations on http://127.0.0.1:8092 with Operations basic auth loaded in-memory.

## Assertions
- Task status toolbar order: Decisions, Tasks, Codex Queue, Blocked, Calendar, Done / Activity.
- Top/task text no longer shows Agent working.
- Owner filter is visible; old task diagnostics panel is not rendered on Tasks.
- Intake Review / Review Queue are not visible as workspace navigation.
- Calendar overview shows Internal Events and does not show Google Calendar/Classroom sync language.
- No body/document horizontal overflow at 390px or 1440px.

## Screenshots
- mobile-390: ops/playwright-smokes/2026-06-18-operations-task-calendar-intake-local/mobile-390.png
- desktop-1440: ops/playwright-smokes/2026-06-18-operations-task-calendar-intake-local/desktop-1440.png
