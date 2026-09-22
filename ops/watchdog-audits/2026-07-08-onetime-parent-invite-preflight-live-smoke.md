# OneTime Parent Invite Preflight Live Smoke

- Checked at: 2026-07-08T19:34:23+03:00
- Commit deployed: `c471afb8`
- Railway deployment: `c378f14c-e42c-4f59-bae7-b0dd602415ab`
- Base URL: `https://join.onetimeonetime.com`
- Result: PASS

## Verified

- `one-time-web` deployment reached `SUCCESS`.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed after deployment.
- The deployed patch adds structured no-send parent invite preflight blockers for:
  - `missing_parent_email`
  - `missing_parent_name`
  - `missing_student_name`
  - `invalid_live_class_url`
  - `missing_live_class_url`
- Production parent-trial invites now require a valid live shiur / Zoom link from the request or configured OneTime runtime env before any confirmed send can proceed.
- OneTime live class link aliases now include `ONE_TIME_LIVE_CLASS_URL`, `ONE_TIME_ZOOM_JOIN_URL`, and `ONE_TIME_TONIGHT_CLASS_LINK` in addition to the existing OneTime class-link aliases.
- Workspace-scope watchdog was updated and passed against the new preflight contract.

## No-Send Guardrails

- No parent invite email was sent.
- No WhatsApp/WAPI message was sent.
- No parent/member/student/access record was created or changed by this smoke.
- No payment, checkout, Zoom, Vimeo, Drive, DNS, Stripe, or external provider mutation was performed.

## Remaining Blockers

- Live parent invite resend still requires the exact live OneTime student display name.
- WhatsApp/WAPI sends still require Rabbi-scoped WAPI credentials, current class-link env/readiness, and explicit send approval.
