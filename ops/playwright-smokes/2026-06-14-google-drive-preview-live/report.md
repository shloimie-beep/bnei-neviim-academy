# Google Drive Preview Live Smoke

Date: 2026-06-14T18:09:02+03:00

App: `https://bneineviimacademy.org`

## Result

PASS

## Scope

- Logged in through the Operations login form using local smoke credentials.
- Opened `/operations?view=settings&section=google_workspace`.
- Verified the Google Workspace panel rendered.
- Verified the four Google cards:
  - Google Drive
  - Google Calendar
  - Google Classroom
  - Google Business Profile
- Verified Google Drive preview buttons rendered:
  - Find/list
  - Doc preview
  - Folder preview
  - Move preview
- Clicked `Find/list` and verified the live action runner returned:
  - HTTP status: 200
  - action id: `google_drive_find_file_preview`
  - preview drive action: `find_or_list_files`

## Browser Checks

- No console errors.
- No horizontal overflow at 1280x900.
- No external Google Drive read or write was performed.

## Deployment

- Railway deployment: `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9`
- Post-deploy live smoke:
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`

