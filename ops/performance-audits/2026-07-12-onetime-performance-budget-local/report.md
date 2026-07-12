# One Time Performance Budget Local Audit

Status: PASS_WITH_RELEASE_GATE
Generated: 2026-07-12T20:24:14.7279528+03:00
Requirement: REQ-20260712-111

Local scope only. No external sends, payments, access grants, DNS changes, provider mutations, production database writes, or live deploys were performed.

## Bundle Delivery

| Asset | Bytes | Budget/status |
|---|---:|---|
| public/operations-bootstrap.html | 1,688 | small bootstrap |
| public/js/operations-shell.js | 1,059,582 | under 1,200,000 budget |
| public/js/operations-deferred-renderers.js | 820,475 | deferred heavy renderer chunk |
| public/css/operations-shell.css | 221,457 | extracted CSS |
| public/operations.html source | 2,389,844 | monolith fallback/source |

The splitter now emits deindented generated JS and keeps only startup-safe shared helpers in the shell. Heavy view renderers remain in `/js/operations-deferred-renderers.js`.

## CRM Budget

Evidence: `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`

- PASS CRM workbench across split shell and monolith fallback.
- Initial CRM request count: 1.
- Initial rendered cards: 50.
- Contact selection app-root rerenders: 0.
- Debounced search list request delta: 1.
- Scoped One Time Inbox context: PASS.

## Cache And Delivery

Evidence: `tests/one-time-intake-api-readback.test.js`

- PASS local cache policy keeps HTML/private Operations shell assets non-cacheable.
- PASS public assets remain cacheable with route-specific max-age.
- Live Brotli/gzip, `Vary`, and production-domain fingerprint/cache readback remain under REQ-20260712-112.

## Vimeo Lazy Load

Evidence: `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.md`

- PASS member library mounts no Vimeo iframe before Play Video.
- PASS member library makes zero Vimeo requests before Play Video.
- PASS playable local fixture loads `player.vimeo.com` only after Play Video.

## Verification

- PASS `node --check scripts\split-operations-shell.mjs`
- PASS `node scripts\split-operations-shell.mjs`
- PASS `node --check public\js\operations-shell.js`
- PASS `node --check public\js\operations-deferred-renderers.js`
- PASS `node --test tests\operations-shell-navigation-contract.test.js tests\one-time-intake-api-readback.test.js`
- PASS `node scripts\smoke-onetime-operations-crm-workbench-local.mjs`
- PASS `node --check scripts\smoke-onetime-portal-shell-local.mjs`
- PASS member-library inline script syntax check
- PASS `node scripts\smoke-onetime-portal-shell-local.mjs`
- PASS `npm run pqc:validate -- ops\prompt-packets\2026-07-12-onetime-crm-portal-production-correction\06-performance-budgets.product-quality.json`

Known unrelated failure: `node --test tests\one-time-classroom-calendar-community-bot.test.js tests\one-time-canonical-journey.test.js` still fails on existing static assertions for rabbi-member navigation text and classroom "Forgot parent password?" copy, outside the REQ111 performance split/lazy-load scope.

## Release Gate

REQ-20260712-112 must still provide commit/push/deploy/live-smoke proof, including production Brotli/gzip + `Vary` header readback and live static/fingerprinted cache evidence.
