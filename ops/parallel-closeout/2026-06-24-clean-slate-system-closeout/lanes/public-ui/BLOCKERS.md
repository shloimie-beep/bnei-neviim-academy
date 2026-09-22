# Public UI Lane Blockers

## Lane Blockers

None for commit/push.

## Not Fixed By This Lane

- No deploy was run because the packet explicitly said not to deploy. Production still shows the homepage header/hero gap and missing active semantics until the branch is merged and deployed.
- `npm run watchdog:links` returned `ok: true` with two medium findings for `public/provider.html -> /one-time-email-review.html`; provider portal files and route registry edits were outside this lane.
- `npm run app:smoke:public-privacy` fails on live production because `/member` returns 200 instead of the expected 302. Server/live route behavior is outside this lane and `server.js` edits were disallowed.
- `npm run app:smoke:public-navigation-positioning` fails against live production/stale expectations. The lane-specific local browser smoke is the authoritative public UI proof for this branch.
