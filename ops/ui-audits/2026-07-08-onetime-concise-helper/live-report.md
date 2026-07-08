# OneTime Concise Helper Timing - Live Proof

Recorded at: 2026-07-08T20:09:00+03:00
Requirement: `REQ-20260708-073`
Raw input: `raw-input/RAW-20260708-017-onetime-landing-helper-concise-timed.md`
Runtime commit: `27f55f6e`
Railway deployment: `76610b3c-3cfa-44d3-80f8-76a43f744a2b`
Deployment status: `SUCCESS`
Live URL: `https://join.onetimeonetime.com/one-time`

## Live Result

- Standard OneTime live smoke passed for `https://join.onetimeonetime.com`.
- Live browser timed smoke passed at mobile viewport `390x844`.
- First nudge appeared after waiting 11 seconds:
  `Hi. Do you want your son to love Torah?`
- Second nudge appeared after waiting 21 more seconds:
  `We are up to Maseches Berachos now. It is a great time to join.`
- Live page attribute readback:
  `data-one-time-current-masechta="Maseches Berachos"`.

## Evidence

- JSON readback:
  `ops/ui-audits/2026-07-08-onetime-concise-helper/live-helper-timing-report.json`
- First live nudge screenshot:
  `ops/ui-audits/2026-07-08-onetime-concise-helper/live-mobile-first-nudge.png`
- Second live nudge screenshot:
  `ops/ui-audits/2026-07-08-onetime-concise-helper/live-mobile-second-nudge.png`

## Verification

- `node --check server.js` passed.
- `node --test tests/one-time-brand-helper-isolation.test.js tests/one-time-focused-landing.test.js` passed: 11/11.
- `npm run watchdog:actions` passed.
- `npm run watchdog:protocol-drift` passed.
- `npm run secrets:audit` passed.
- `git diff --check` passed with line-ending warnings only.
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com` passed.

## Guardrails

- No signup form was submitted.
- No parent email, WhatsApp, payment, access grant, Zoom, Vimeo, Drive, DNS,
  Stripe, or external CRM mutation was performed.
- Parent/student/member helper safety copy was not changed.
