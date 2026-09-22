# BNA Accountability And Ramble Routing

Status: active rule set after the May 28 cleanup.

## Routing Rules

- Telegram rambles are raw operator input. They should be parsed into Tasks unless they clearly belong to Content, Contacts, Accounting, or named Student Accountability.
- Student Accountability is not a dumping ground for general rambles. Only create accountability entries when a named student is matched, or when the operator clearly says this is a private meeting, check-in, student goal, attendance note, or next meeting note.
- Class recordings and long videos should enter through Google Drive `BNA V2/01 Raw Intake`, not Telegram, unless they are small enough and intentionally uploaded to the bot.
- General app/API/dashboard/Kimi/Codex/pipeline/Drive/Whisper/GHL rambles belong in Tasks or Content, not Student Accountability.

## Dashboard Language

- Top tabs: Tasks, Students, Content, Contacts, Accounting.
- Task columns shown in the dashboard: Needs Your Decision, My Tasks, Kimi Tasks, Doing Now, Done.
- Do not show raw captures as a normal visible column. Rambles are an input method, not a task-management destination.
- Archive remains an internal status only. Do not show it as a normal active lane.
- The dashboard should not be the main input surface. New items come from Telegram or Drive.

## Student Accountability Target Model

- Each student profile should show active weekly goals, daily progress/check-ins, private meeting notes, struggles, interests, decisions, next check-in, and a short meeting analysis.
- Goal progress should support numeric tracking, for example: goal is 20 focused minutes daily; student did 10 minutes; daily score is 50%.
- Weekly review should summarize average progress and what blocked the student.
- If a student cannot be matched confidently, ask in Telegram with quick buttons instead of filing the note under the wrong student.

## Current Cleanup

- Removed generic rambles that were incorrectly filed as student goals/questions.
- Tightened the Telegram bridge so generic system/content rambles no longer create accountability events.
- Stopped creating duplicate raw-capture task cards from every Telegram ramble. The parser should create actual tasks or decision items.
