# Google Workspace Disconnect Live Smoke - 2026-06-14

App: `https://bneineviimacademy.org`

Deployment: `d2ee16bc-cacd-4025-a77d-f1d358d1230c`

Route:
`/operations?view=settings&section=google_workspace&workspace=platform`

Result: passed

## Checks

- PASS Railway deployment `d2ee16bc-cacd-4025-a77d-f1d358d1230c` reached
  SUCCESS.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy live app smoke:
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status` returned
  HTTP 200 with `success: true`, OAuth readiness, and Business Profile
  readiness fields.
- PASS direct non-mutating route probe of
  `/api/google/connections/999999999/disconnect?dry_run=true` returned HTTP
  404 `Google connection was not found`, proving the deployed disconnect route
  is present without touching any real token.
- PASS desktop viewport rendered 4 Google connector cards and required
  readiness actions/text.
- PASS desktop had no console errors and no horizontal overflow
  (`scrollWidth` 1265, `innerWidth` 1280).
- PASS 390px mobile viewport rendered 4 Google connector cards and required
  readiness actions/text.
- PASS 390px mobile had no console errors and no horizontal overflow
  (`scrollWidth` 375, `innerWidth` 390).

## Notes

- No real Google account was connected at smoke time, so no disconnect button
  was expected and no revocation was attempted.
- The disconnect endpoint is confirmation-gated with `DISCONNECT_GOOGLE` and
  removes local refresh tokens before future live Google actions can run.
