# Google Workspace Live Browser Smoke - 2026-06-14

App: `https://bneineviimacademy.org`

Deployment: `7b4f79be-baba-49b3-a567-82c9e9009344`

Route:
`/operations?view=settings&section=google_workspace&workspace=platform`

Result: passed

## Checks

- PASS authenticated Operations route loaded after sign-in.
- PASS desktop viewport rendered `BNA Operations`.
- PASS desktop URL resolved to the Google Workspace settings section.
- PASS desktop rendered 4 Google connector cards.
- PASS desktop text included Google Drive, Google Calendar, Google Classroom,
  and Google Business Profile.
- PASS desktop text included No-OAuth, Test-user OAuth, Production OAuth,
  Dry-run, and Test connection readiness states/actions.
- PASS desktop had no console errors.
- PASS desktop had no horizontal overflow (`scrollWidth` 1265,
  `innerWidth` 1280).
- PASS 390px mobile viewport rendered 4 Google connector cards.
- PASS 390px mobile text included the same readiness states/actions.
- PASS 390px mobile had no console errors.
- PASS 390px mobile had no horizontal overflow (`scrollWidth` 375,
  `innerWidth` 390).
- PASS direct live API read of `/api/bna/integrations/google/status` returned
  HTTP 200 and `success: true`.

## Notes

- No external Google write action was executed.
- Google connection count was 0 at smoke time, so the panel correctly remained
  in readiness/manual/test-user planning mode rather than claiming synced data.
