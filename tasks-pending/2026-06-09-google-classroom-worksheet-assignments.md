# Google Classroom Worksheet Assignment System

Captured: 2026-06-09

## Intent

Build the BNA assignment lane where an admin can paste a YouTube URL, generate a
worksheet, patch the saved worksheet prompt, customize per student, schedule in
natural language, show the work in student/parent portals, and later sync to
Google Classroom and Google Calendar.

## Confirmed Google API Mapping

- Classroom coursework create:
  `POST https://classroom.googleapis.com/v1/courses/{courseId}/courseWork`
- Required Classroom coursework scope:
  `https://www.googleapis.com/auth/classroom.coursework.students`
- CourseWork supports:
  - `materials`
  - `youtubeVideo`
  - `dueDate`
  - `dueTime`
  - `scheduledTime`
  - `assigneeMode`
  - `individualStudentsOptions`
- Calendar event create:
  `POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
- Calendar event insert uses `calendarId`, with `primary` meaning the logged-in
  user's primary calendar.
- Calendar event write scope added:
  `https://www.googleapis.com/auth/calendar.events`

Official docs:
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork/create
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork
- https://developers.google.com/workspace/classroom/guides/manage-coursework
- https://developers.google.com/calendar/api/v3/reference/events/insert
- https://developers.google.com/calendar/api/guides/create-events

## Implemented In This Batch

- Added DB bootstrap tables:
  - `bna_assignment_prompts`
  - `bna_assignment_prompt_versions`
  - `bna_assignments`
  - `bna_assignment_students`
- Added default worksheet-generation prompt and prompt versioning.
- Added natural-language schedule parser for common forms:
  - `Tomorrow at 10:30`
  - `Every Monday at 11`
  - `Split this into 3 sessions this week`
  - `20 minutes a day for the next 4 days`
- Added worksheet generation with AI when configured and deterministic fallback
  when no AI key is available.
- Added assignment prompt patching from worksheet feedback.
- Added Google Classroom and Calendar payload builders.
- Added Google sync preview and a gated live sync action requiring
  `confirm: SYNC_GOOGLE`.
- Added an Operations assignment-card live sync button that requires typing
  `SYNC_GOOGLE` before sending the guarded backend request.
- Added a Google integration service module:
  - role-scoped OAuth scopes for admin/teacher, student, and parent connections
  - connection status endpoint
  - Classroom course list endpoint
  - Calendar event read endpoint
  - Classroom coursework create wrapper
  - Calendar event insert/update/delete wrappers
- Added `bna_google_connections` so role-specific OAuth connections are not
  treated as the same global Drive token.
- Added explicit assignment-level and parent/teacher prompt patches plus a
  resolved worksheet prompt preview.
- Calendar sync now updates an existing synced event when possible instead of
  always inserting a duplicate, and there is a guarded delete-calendar-events
  backend action.
- Student/parent assignment payloads now include schedule buckets and Google
  Classroom/Calendar sync status.
- Added assignment display in:
  - Operations > Students > Assignments
  - Student portal
  - Parent portal
- Added regression coverage in `tests/google-assignment-system.test.js`.

## Live Google Sync Blockers

- Existing Google refresh token must be reauthorized with the updated role
  scopes before live writes can work.
- Classroom sync needs the real `classroom_course_id`.
- Per-student Classroom assignment needs each student's Classroom user ID when
  using `individualStudentsOptions`.
- The current UI exposes live sync, but it is still intentionally gated by a
  typed `SYNC_GOOGLE` browser prompt plus the backend `confirm: SYNC_GOOGLE`
  sentinel.

## Next Steps

1. Re-run `/api/google/oauth/start` or the role-specific OAuth URLs in
   `.env.example`, then update Railway `GOOGLE_REFRESH_TOKEN` / `GOOGLE_SCOPES`
   for the admin/teacher connection if needed.
2. Add a visible Classroom course picker using the new
   `/api/google/classroom/courses` endpoint.
3. Add student Classroom ID mapping on student records or assignment rows.
4. Add Playwright coverage for Operations assignment creation and student portal
   assignment display after deployment.

## 2026-06-09 Follow-Up Spec Implementation

Added locally in response to the worksheet/YouTube/scheduling spec:

- Assignment schema now stores `original_prompt_text`, `final_resolved_prompt`,
  `generated_worksheet`, and `edited_worksheet`.
- Student assignment rows now store their own final prompt, generated worksheet,
  and edited worksheet.
- Added `bna_assignment_regenerations` for practical regeneration history.
- Added `bna_video_processing_jobs` for optional server-side YouTube processing
  with statuses `pending`, `downloading`, `downloaded`, `failed`, and `skipped`.
- Added `bna_schedule_items` for normalized schedule rows per
  assignment/student/session.
- YouTube assignment URLs are validated, YouTube video IDs are stored, and
  best-effort oEmbed metadata is saved when available.
- Optional yt-dlp downloading is behind `BNA_YTDLP_ENABLED`; browsers never run
  downloads.
- Natural-language scheduling now covers the common examples from the operator:
  tomorrow at a time, multiple weekdays, split into lessons/sessions, every
  morning for a number of days, and "after the required class" as a dependency
  note.
- Operations assignment UI now exposes the requested worksheet types and lets
  the admin edit per-student prompt patches, patch instructions, statuses, and
  student worksheet bodies directly under the assignment.
- Fixed the live Calendar sync path to store `synced.data` instead of the
  non-existent `created.data`.

Still blocked for live verification:

- Google Classroom live writes still require admin/teacher OAuth reauth with the
  needed Classroom/Calendar scopes.
- Classroom course IDs and per-student Classroom user IDs still need real
  mapping before individual Classroom sync can be proven.
- yt-dlp processing should stay disabled unless the server has yt-dlp installed
  and BNA confirms the media is owned/permissioned for internal processing.

## 2026-06-09 Closeout

Status: deployed and verified.

- Patched visible Operations form labels to match the operator spec:
  `Paste YouTube URL` and `Worksheet Type`.
- Restored the student access-code lookup to a minimal `id, name` query so the
  parent/student portal privacy contract remains green.
- Verified locally:
  - `node --check server.js`
  - `node --test tests/google-assignment-system.test.js`
  - `node --test tests/parent-student-portal-contract.test.js`
  - `npm test` 120/120
  - local assignment UI/API smoke
- Deployed Railway `6b210aa5-b85a-4328-b2bd-2d41d5c31ed2`.
- Verified live:
  - Railway doctor returned `SUCCESS`
  - `npm run app:smoke` passed
  - live assignment endpoints returned 200 for students, assignment prompts,
    assignments, and Google connection status
  - live Operations assignment screen rendered the requested controls
  - screenshot:
    `ops/playwright-smokes/2026-06-09-live-google-assignment-operations-smoke.png`

Remaining follow-up, not a deploy blocker:

- Reauthorize Google with Classroom/Calendar scopes.
- Pick/store real Classroom course IDs and per-student Classroom user IDs.
- Keep `BNA_YTDLP_ENABLED=false` until media ownership and server yt-dlp support
  are confirmed.
