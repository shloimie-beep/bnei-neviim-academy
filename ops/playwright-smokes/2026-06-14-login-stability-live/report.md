# Live Login Stability Smoke

Date: 2026-06-14T22:18:03+03:00

Target: `https://bneineviimacademy.org`

## Standard Live Smoke

`npm run app:smoke` passed:

- public health endpoint
- operations login session
- session auth `/me`
- protected API reads
- Torah public cumulative progress
- Torah admin cumulative fields
- task create/comment/delete
- signup submit dry-run validation
- Buffer social diagnostics
- Drive website image lane

Report: `ops/live-smokes/2026-06-14T19-18-03-287Z-live-app-smoke.md`

## Forced Mobile Playwright Context

Configuration: viewport `390x844`, `isMobile: true`, `hasTouch: true`, `deviceScaleFactor: 2`.

- Operations login:
  - URL stayed on `/operations-login.html`
  - `window.innerWidth`: `390`
  - `(pointer: coarse)`: `true`
  - active field after typing: `password`
  - username value retained: `AAHUVADRATLER`
  - password length retained: `17`
  - `--login-vh`: `844px`
  - username font size: `16px`
  - horizontal scroll: `0`
  - body overflow-x: `hidden`
- Provider join:
  - URL stayed on `/providers/join?onboard=provider`
  - initial active element: `BODY`
  - first provider answer advanced to contact-name prompt
  - active element after step advance: `BUTTON`
  - horizontal scroll: `0`
- Parent login/onboarding:
  - URL stayed on `/parent/login?onboard=accountability`
  - initial active element: `BODY`
  - login and onboarding panels were visible
  - parent email value retained after typing
  - password length retained: `17`
  - active field after typing: `parentPassword`
  - horizontal scroll: `0`

Result: passed.
