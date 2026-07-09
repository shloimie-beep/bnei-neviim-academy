# Operations Startup Residual Slowness Profile

- Base URL: https://join.onetimeonetime.com
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: live-20260709-chatgpt-controltower
- Login: ok in 1102ms via ONE_TIME_OPS
- Captured at: 2026-07-09T05:47:19.562Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 1141 |
| Operations shell visible | 1471 |
| One Time overview visible | 1484 |
| Settled capture window | 7498 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 8 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 6 |
| Median fetch duration | 270 |
| P95 fetch duration | 336 |
| Max fetch duration | 336 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/config | 1933 | 336 | 200 | true |
| /api/bna/rabbi/checkouts | 1933 | 329 | 200 | true |
| /api/bna/rabbi/members | 1933 | 329 | 200 | true |
| /api/bna/rabbi/access-grants | 1933 | 329 | 200 | true |
| /api/bna/auth/me | 1131 | 270 | 200 | false |
| /api/bna/service-providers?approved_only=false | 1416 | 262 | 200 | false |
| /api/bna/auth/me | 1683 | 249 | 200 | true |
| /api/bna/rabbi/tiers | 1933 | 246 | 200 | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 519 | 270 | 200 |
| /api/bna/rabbi/config | 1 | 336 | 336 | 200 |
| /api/bna/rabbi/checkouts | 1 | 329 | 329 | 200 |
| /api/bna/rabbi/members | 1 | 329 | 329 | 200 |
| /api/bna/rabbi/access-grants | 1 | 329 | 329 | 200 |
| /api/bna/service-providers | 1 | 262 | 262 | 200 |
| /api/bna/rabbi/tiers | 1 | 246 | 246 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 521 |
| Buttons | 123 |
| Links | 3 |
| Body text length | 2248 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 18 |
| Transfer size | 319828 |
| Encoded body size | 314428 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui.js | 9861 | 9561 | 384 |
| /js/platform-ui/platform-ui-fixtures.js | 4938 | 4638 | 632 |
| /js/app-select.js | 4725 | 4425 | 538 |
| /js/operations-shell.js | 208463 | 208163 | 603 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0
