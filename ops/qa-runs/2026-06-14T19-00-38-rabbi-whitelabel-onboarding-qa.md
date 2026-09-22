# Rabbi White-Label Onboarding QA

Date: 2026-06-14T19:00:38+03:00
Base URL: `http://127.0.0.1:8099`
Viewport: 390x844

## Result

PASS

## Scope

Fresh local Playwright context with fake stale `bnaStudentAccessCode` injected
before each route. The audit checked that public/provider/parent/student routes
do not inherit stale student portal state and that unauthenticated private
surfaces show login/public shells instead of private records.

## Routes Checked

- `/`
- `/index.html`
- `/?public`
- `/parent`
- `/parent.html`
- `/parent/login`
- `/parent/login?onboard=accountability`
- `/parent?source=pwa`
- `/student`
- `/student.html`
- `/student/login`
- `/student/login?public`
- `/provider/login`
- `/service-providers`
- `/providers`
- `/become-service-provider`
- `/operations`

## Findings

- Public home/index routes rendered public BNA site content.
- Parent routes rendered the parent login/onboarding shell.
- Student routes rendered the student access-code/login shell.
- Provider public/index/join routes rendered provider-public shells.
- Operations redirected to `/operations-login.html?returnTo=%2Foperations`.
- No email-like text was rendered in the unauthenticated route text captured by
  the audit.
- No private dashboard/task/linked-student/payment/WhatsApp/admin signals were
  visible in the audited unauthenticated route text.
- Stale `bnaStudentAccessCode` was cleared on every audited route.

## Fix Applied During QA

The first Playwright pass found that provider public routes did not clear stale
student access codes. Added explicit stale-code clearing to:

- `public/service-providers.html`
- `public/providers-join.html`
- `public/provider-profile.html`

Added regression coverage in:

- `tests/universal-assistant-contract.test.js`

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/parent-student-portal-contract.test.js tests/universal-assistant-contract.test.js tests/operations-pwa-login.test.js` - 36/36
- PASS local Playwright route audit - 17/17 routes
- PASS `npm test` - 357/357
- PASS Railway deployment `f2595077-6c36-4a04-a5b8-a69452d3dfa5`
- PASS post-deploy `npm run railway:doctor`
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-02-47-718Z-live-app-smoke.md`
- PASS live provider/privacy smoke:
  `ops/playwright-smokes/2026-06-14-rabbi-whitelabel-provider-privacy-live/report.md`

## Notes

The public home page contains intentional public copy saying daily tracking is
admin-only. That is not a data leak and was removed from the private-data signal
list after inspection.
