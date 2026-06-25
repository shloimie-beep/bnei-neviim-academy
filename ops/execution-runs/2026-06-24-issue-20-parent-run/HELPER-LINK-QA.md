# Helper Link QA Batch C

Requirement: `REQ-20260624-043`

Status: Done after merge, deploy, and live verification.

## Implementation

- Added `src/lib/bna/helper/destination-resolver.js`.
- Wired helper `open_operations_view` through the resolver in
  `src/lib/bna/helper/tool-registry.js`.
- Added registry row `ACTION-HELPER-OPEN-OPERATIONS-VIEW` in
  `ops/action-registry.json`.
- Added `tests/helper-destination-resolver.test.js`.
- Added `scripts/watchdog-helper-destinations.mjs` and npm script
  `watchdog:helper-destinations`.

## Resolver Contract

Each resolved destination returns:

- same-origin path or safe fallback;
- route key/surface from `ops/route-registry.json`;
- required role and public/private access classification;
- actor role, workspace, project, and channel scope;
- helper action key or typed action ID;
- reason and denial reasons;
- checks for route registration, action registration, role, workspace,
  typed-action permission, and browser-click-substitution policy.

Denied destinations use role-safe fallbacks:

- parent -> `/parent`;
- student -> `/student`;
- provider/member -> `/provider`;
- other private failures -> `/operations-login.html`.

## Matrix Evidence

Generated watchdog report:

- `ops/helper-destination-qa/20260624T203546Z/helper-destination-matrix.md`
- `ops/helper-destination-qa/20260624T203546Z/helper-destination-matrix.json`
- `ops/watchdog-audits/2026-06-24T20-27-watchdog-action-audit.md`

Matrix result: 10/10 cases passed.

Covered cases:

- owner Operations tasks/Decisions link;
- owner schedule/calendar mode link;
- parent self portal;
- student self portal;
- provider workspace;
- public provider index;
- parent blocked from Operations with parent fallback;
- provider blocked from BNA Operations with provider fallback;
- nonexistent route rejected;
- external URL rejected.

## Verification

- `node --check src\lib\bna\helper\destination-resolver.js` passed.
- `node --check src\lib\bna\helper\tool-registry.js` passed.
- `node --check scripts\watchdog-helper-destinations.mjs` passed.
- `node --test tests\helper-destination-resolver.test.js` passed 5/5.
- `node --test tests\bna-helper-tools.test.js tests\helper-destination-resolver.test.js` passed 15/15.
- `node --test tests\action-registry-telegram-ui-bot.test.js` passed 33/33.
- `node --test tests\universal-control-plane-scope-policy.test.js` passed 10/10.
- `npm run watchdog:actions` passed with 0 findings.
- `npm run watchdog:helper-destinations` passed with 10/10 matrix cases.
- Post-deployment `npm run watchdog:helper-destinations` passed 10/10 cases
  against the released Issue #20 tree.
- The live Issue #20 verifier confirmed the Operations helper button was
  present on the deployed app.

## Guardrails

- No production mutation.
- No external write.
- No browser profile screenshot or private page capture.
- No send, charge, DNS change, credential change, class backfill, Drive write,
  or public publishing.

## Release Gate

`REQ-20260624-043` changed server-visible helper behavior and is now terminal
Done because PR #22 deployed successfully and live verification passed on
Railway deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa`.
