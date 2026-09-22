# Local Login Stability Smoke

Date: 2026-06-14T22:14:07+03:00

Target: `http://127.0.0.1:3000`

## Browser Checks

- Operations login was opened in the in-app browser, username and password fields were filled, focus stayed on `#password`, the URL stayed on `/operations-login.html`, and horizontal scroll stayed at `0`.
- Parent login was opened in the in-app browser at `/parent/login?onboard=accountability`, parent email and password fields were filled, focus stayed on `#parentPassword`, the URL stayed stable, and horizontal scroll stayed at `0`.
- Provider join was opened in the in-app browser at `/providers/join?onboard=provider`; a first answer advanced to the next question without navigation or horizontal scroll.

## Forced Mobile Playwright Context

Configuration: viewport `390x844`, `isMobile: true`, `hasTouch: true`, `deviceScaleFactor: 2`.

- Operations login:
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
  - initial active element: `BODY`
  - first provider answer advanced to contact-name prompt
  - active element after step advance: `BUTTON`
  - horizontal scroll: `0`
- Parent login/onboarding:
  - initial active element: `BODY`
  - login and onboarding panels were visible
  - parent email value retained after typing
  - password length retained: `17`
  - active field after typing: `parentPassword`
  - horizontal scroll: `0`

Result: passed.
