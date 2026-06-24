# Public UI Lane Tests

## Passed

| Command | Result | Notes |
|---|---|---|
| `node --check scripts/smoke-public-ui-closeout.mjs` | PASS | Lane smoke script syntax. |
| `node --check public/js/bna-site-nav.js; node --check public/js/bna-pages.js` | PASS | Edited public JavaScript syntax. |
| `node scripts/smoke-public-ui-closeout.mjs` | PASS | Required local routes/viewports, aliases, computed assertions, screenshots, and read-only production comparison. |
| `npm run watchdog:links` | PASS | `ok: true`; reported two medium findings for `public/provider.html -> /one-time-email-review.html`, outside this lane. |
| `npm run watchdog:actions` | PASS | `ok: true`, zero findings. |
| `npm run watchdog:security` | PASS | `ok: true`, zero findings. |
| `git diff --check` | PASS | Exit code 0; Git reported line-ending warnings only. |
| `npm run secrets:audit` | PASS | 4351 tracked paths checked, zero tracked secret-risk files found. |
| `node --test tests\public-homepage-privacy.test.js tests\public-content-contamination-guard.test.js tests\public-route-privacy-contract.test.js tests\public-helper-bot-landing-sodas.test.js tests\owner-review-route-inventory.test.js` | PASS | 20 tests passed. |
| `node --test tests\signup-permissions-mobile-homepage.test.js tests\rabbi-scheller-route-map-contract.test.js tests\rabbi-scheller-auth-navigation-contract.test.js` | PASS | 15 tests passed. |

## Non-Lane Existing/Live Findings

| Command | Result | Reason Not Fixed In This Lane |
|---|---|---|
| `npm run app:smoke:public-navigation-positioning` | FAIL | Live-production check against `https://bneineviimacademy.org`; production has not received this lane and the script expects stale page copy. No deploy was allowed. |
| `npm run app:smoke:public-privacy` | FAIL | Live-production `/member` returned 200 where the smoke expects 302. This is server/live route behavior outside the public UI lane, and `server.js` edits were explicitly disallowed. |

## Primary Browser Evidence

- `PUBLIC-UI-SMOKE.md` result: PASS.
- Local screenshot count: 42 integration-base screenshots.
- Production screenshot count: 18 anonymous public screenshots.
- Required local aliases all passed, including `/one-time/member-login` -> 302 `/rabbi-member`.
