# Live Rabbi White-Label Provider Privacy Smoke

Date: 2026-06-14T19:04:56+03:00
Base URL: `https://bneineviimacademy.org`
Viewport: 390x844

## Result

PASS

## Deployment

Railway deployment: `f2595077-6c36-4a04-a5b8-a69452d3dfa5`

## Routes Checked

- `/parent/login?onboard=accountability`
- `/student/login`
- `/provider/login`
- `/service-providers`
- `/providers`
- `/become-service-provider`
- `/operations`

## Checks

Each route was loaded in a fresh Playwright context after injecting a fake stale
`bnaStudentAccessCode`.

- Expected login/public shell rendered: yes for all routes.
- Stale student code cleared: yes for all routes.
- Email-like text rendered: no.
- Private dashboard/task/linked-student/payment/WhatsApp/admin signals visible:
  no.
- `/operations` resolved to `/operations-login.html?returnTo=%2Foperations`.

## Supporting Verification

- PASS pre-deploy `npm run railway:doctor`
- PASS local `npm test` 357/357
- PASS Railway deployment `f2595077-6c36-4a04-a5b8-a69452d3dfa5` reached SUCCESS
- PASS post-deploy `npm run railway:doctor`
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-02-47-718Z-live-app-smoke.md`
