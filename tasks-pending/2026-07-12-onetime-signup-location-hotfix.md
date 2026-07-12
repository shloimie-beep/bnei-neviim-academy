# One Time Signup Location Hotfix

Source: `raw-input/RAW-20260712-008-onetime-signup-location-hotfix.md`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`
Owner: Codex
Status: in_progress

## Requirements

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260712-401 | Confirm whether city/ZIP signup handling was already tracked. | done | Found `REQ-20260712-106` in `tasks-pending/2026-07-12-onetime-landing-visual-revision.md`; current production-base code already has free-text `city_label`. |
| REQ-20260712-402 | Remove city-picker ambiguity from the live signup form by making the required field visibly accept city, ZIP/postal code, or area. | done_local | `public/one-time/signup.html`; `node --test tests/one-time-direct-signup-page.test.js` pass |
| REQ-20260712-403 | Preserve existing first-party signup payload, timezone detection/fallback, reminder consent, and WhatsApp phone validation. | done_local | `npm run test:onetime:focused` pass 73/73 |
| REQ-20260712-404 | Commit, push, merge, deploy One Time production, verify live SHA, and smoke `/one-time/signup`. | in_progress | Pending deployment |
| REQ-20260712-405 | Replace the custom Family/School dropdown with always-visible Family and School choice buttons so Family cannot appear unloaded or clipped on mobile. | done_local | `public/one-time/signup.html`; `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js` pass 13/13; `npm run test:onetime:focused` pass 73/73 |

## Local Verification

- `node --test tests/one-time-direct-signup-page.test.js`: pass 2/2, including ZIP-style `city_label` value `11230`.
- `node --test tests/one-time-focused-landing.test.js`: pass 2/2.
- `npm run test:onetime:focused`: pass 73/73.
- `node scripts\generate-one-time-action-coverage.mjs`: pass.
- `node scripts\generate-universal-action-parity.mjs`: pass.
- `npm run watchdog:actions`: pass.
- `node --test tests/watchdog-action-registry.test.js`: pass 5/5.
- Follow-up Family/School button fix: live browser investigation showed the custom dropdown did set `signup_as=Family`, but opened low on mobile and could feel clipped/unloaded. Replaced it with always-visible Family and School buttons.
- Follow-up tests: `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js` pass 13/13; `npm run test:onetime:focused` pass 73/73; `npm run watchdog:actions` pass.
