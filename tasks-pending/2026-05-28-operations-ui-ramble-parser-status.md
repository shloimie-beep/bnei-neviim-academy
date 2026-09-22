# 2026-05-28 BNA Operations UI + Ramble Parser Status

## Current source of truth

- Repo and Railway Postgres are the operational source of truth.
- Drive is a content/memory workspace, not the primary task database.
- Telegram is the input/control surface. The dashboard is for monitoring.

## Completed in this pass

- Restructured `/operations.html` around the real BNA tabs:
  - Tasks
  - Students
  - Content
  - Contacts
  - Accounting
- Removed the visible dashboard-create workflow. Inputs should come through Telegram or Drive.
- Normalized old views:
  - `pipeline` and `ramble` route to `tasks`
  - `signups` routes to `contacts`
  - `billing` routes to `accounting`
  - `accountability` routes to `students`
- Added task summary cards for raw inputs, needs-decision items, machine tasks, and Shloimie tasks.
- Added content summary cards for open jobs, ingest/transcription, draft/approval, and approved/published.
- Added visible task owner badges (`Kimi`, `Codex`, `Shloimie`, etc.).
- Cleaned the operations UI to ASCII-only text to avoid Windows/CLI encoding weirdness.
- Fixed BNA task source constraints so `web`, `google_drive`, and `import` captures do not fail.
- Fixed fresh task category schema to include `accountability`.
- Improved heuristic ramble parsing so actionable machine/system phrases create assigned child tasks.
- Restarted the local BNA server on port `8080`.
- Restarted the active Telegram bridge for `@bneineviimacademy_bot`.
- Deployed the server/dashboard changes to Railway.

## Smoke tests

- Local health: OK, database connected, GHL configured.
- Hosted health: OK, database connected, GHL configured.
- Hosted `/operations.html?view=tasks`: HTTP 200 and includes new summary UI.
- Ramble parser test:
  - Raw capture task created.
  - Actionable child task created in `assigned`.
  - Child task owner recognized as `Kimi`.
  - Smoke-test tasks were archived after verification.

## Active long-running job

- Drive ingest for `20260527_140157.mp4` completed through the content pipeline.
- FFmpeg produced two WhatsApp parts:
  - `whatsapp-part-00.mp4`
  - `whatsapp-part-01.mp4`
- OpenAI transcription completed using `gpt-4o-mini-transcribe`.
- Content job was created with status `needs_approval` and Drive stage `05 WhatsApp Ready`.
- WhatsApp draft and both split video parts were sent to the Academy Telegram bot.
- Note: the original one-off job exposed a delivery bug when replying to old Telegram message IDs. The bridge sender was patched so content approval messages and file uploads retry without `reply_to_message_id`.

## AIOS reminder issue

- The old AIOS/Holy Flow Windows service is still installed:
  - service name: `aiosccbridge.exe`
  - display name: `ai-os-cc-bridge`
  - path: `C:\Users\User\holyflow-platform\bridge\daemon\aiosccbridge.exe`
- Normal PowerShell could not stop or disable it because Windows requires Administrator permission.
- Run an Administrator PowerShell and execute:

```powershell
cd "C:\Users\User\BNA v2.0"
powershell -ExecutionPolicy Bypass -File scripts\stop-old-aios-admin.ps1
```

## Next work

- Let the long Drive ingest finish, then verify the content job appears in `/api/bna/content-jobs`.
- Split the Drive job into separate explicit stages:
  - drive download
  - ffmpeg split
  - transcription
  - WhatsApp draft
  - Telegram approval
- Expand accountability parsing so private meeting recordings create:
  - student match
  - meeting date
  - goals
  - struggles
  - decisions
  - follow-up reminder
- Keep approved WhatsApp/Facebook drafts synced into `content-memory` so future drafts improve from actual examples.
