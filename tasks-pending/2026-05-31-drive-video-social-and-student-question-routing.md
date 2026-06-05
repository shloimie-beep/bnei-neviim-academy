# Drive Video Social + Student Question Routing

## Status

Implemented by Codex on 2026-05-31.

Updated by Codex on 2026-06-01.

## What Changed

- Telegram bridge now treats natural language Drive-upload requests as `/ingest_drive`.
- Telegram bridge now also auto-watches `BNA V2 / 01 Raw Intake` about every 10 seconds.
- Anything dropped there is ingested automatically:
  - audio/video: transcribed
  - image: described
  - all media: titled, saved as a Content job, linked back to Drive, moved to the next Drive stage
- After auto-ingest, Telegram sends action buttons:
  - `Make WhatsApp Copy`
  - `Make Facebook Post`
- The Drive picker now uses newest-first ordering for `BNA V2 / 01 Raw Intake`.
- The bot should title/name the content from the transcript instead of asking for a filename when the latest Raw Intake file is available.
- WhatsApp and Facebook drafts are generated separately:
  - WhatsApp: short parent-facing bullet caption.
  - Facebook: longer, warmer narrative caption saved as `facebook_post`.
- Both draft types get Telegram approval buttons.
- Facebook drafts also get a `Create Facebook Draft` button that sends the approved text/media into the connected GHL Facebook account as a draft.
- `/accounts` currently shows a connected Facebook account named `Bnei Neviim Academy`.
- Operations Content view now has filters for media type and upload date, with newest content first.
- Operations Tasks view no longer has a standalone Smoke Test filter. Smoke testing is shown as a verification status/action on completed work.
- Operations Tasks now includes urgency/date chips and labels the Kimi lane as `Changelog`.
- Operations Content now includes a project filter for `BNA` vs `Mishna Learning`.
- Dashboard content actions are wired:
  - `Make WhatsApp` copies the stored WhatsApp draft.
  - `Make Facebook post` creates a real GHL Facebook draft from the stored Facebook output.
  - `Break into tasks` creates a Kimi task tied to that content job.
- `Meeting rabbi sheller.m4a` was auto-ingested as Content job #7 and classified as Mishna Learning.
- Students view now has clickable student profiles. Each profile shows KPI counts, accountability chart, interests/topics, questions, goals, and private meetings/notes.
- Amitay's conversion/fairness question is visible under his student profile.
- Amitay/Amitai/Amitize aliases now fuzzy-match student `אמיתי קוסובסקי`.
- Student accountability capture now runs before task capture; if an accountability item is filed, it does not create a duplicate task.
- GHL Social diagnostics endpoint added at `/api/bna/ghl-social/diagnostics`.
- GHL Social smoke passed locally:
  - Content job #7 created a text-only Facebook draft in GHL.
  - Content job #6 uploaded the MP4 to GHL media storage and created a GHL draft with `type: reel`.
- Operations Tasks wording was tightened again:
  - no visible "raw capture" language
  - Kimi/Codex machine work appears as `Changelog`
  - Shloimie's view is reserved for real personal tasks and decisions
- Playwright mobile smoke passed for Tasks, Content, and Students after the UI changes.

## Database Cleanup

- Filed Amitay's question as Student Accountability event #8:
  - "If a non-Jew can become a Jew, why can't a Jew become a non-Jew?"
- Archived accidental task captures #28 and #29 because they belonged under student accountability, not Tasks.

## Current Drive Check

- `BNA V2 / 01 Raw Intake` was empty when Codex checked.
- `02 Ingesting`, `03 Transcribed`, and `07 Social Candidates` were also empty.
- The only visible video in the configured pipeline was old `20260527_140157.mp4` in `05 WhatsApp Ready`.
- If the operator's new video is not processed, first check whether it finished uploading to the correct `BNA V2 / 01 Raw Intake` folder/account.

## Next Agent Rule

When the operator says "the newest video I dropped in Drive" or similar, check Raw Intake first. Do not ask for filename/time unless Raw Intake is empty.

When the operator asks to make a Facebook post, create a GHL draft first. Do not publish live without a separate explicit approval.
