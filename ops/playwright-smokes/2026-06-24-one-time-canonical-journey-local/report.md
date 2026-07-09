# One Time Canonical Journey Local Smoke

Started: 2026-07-09T05:25:25.695Z
Base URL: http://127.0.0.1:57482
Result: passed

## Checks
- One Time landing links to `/rabbi-member` and not `/one-time/member-login`.
- Legacy `/one-time/member-login` and `/member` redirect to `/rabbi-member`.
- Home, library, classroom, support, and logout expose module navigation without public-return detours.
- Logout clears local One Time member state.

## Screenshots
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/desktop-one-time-landing.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/desktop-member-home.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/desktop-member-library.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/desktop-classroom.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/mobile-one-time-landing.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/mobile-member-home.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/mobile-member-library.png
- ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/mobile-classroom.png

Guardrail: local server ran with `ONE_TIME_REVIEW_ONLY_NO_DB=1`; no production readback, database mutation, external send, publish, upload, charge, DNS, OAuth, or secret request was performed.
