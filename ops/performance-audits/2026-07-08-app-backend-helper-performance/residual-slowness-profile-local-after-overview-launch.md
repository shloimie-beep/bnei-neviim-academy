# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after-overview-launch
- Login: ok in 2188ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:46:44.169Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 448 |
| Operations shell visible | 1810 |
| One Time overview visible | 1818 |
| Settled capture window | 15836 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 8 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 6 |
| Median fetch duration | 1160 |
| P95 fetch duration | 2301 |
| Max fetch duration | 2301 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/members | 3426 | 2301 | 200 | true |
| /api/bna/rabbi/checkouts | 3426 | 2127 | 200 | true |
| /api/bna/rabbi/access-grants | 3426 | 2127 | 200 | true |
| /api/bna/rabbi/tiers | 3425 | 2042 | 200 | true |
| /api/bna/rabbi/config | 3425 | 1160 | 200 | true |
| /api/bna/service-providers?approved_only=false | 1372 | 1098 | 200 | false |
| /api/bna/auth/me | 2477 | 947 | 200 | true |
| /api/bna/auth/me | 436 | 920 | 200 | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/members | 1 | 2301 | 2301 | 200 |
| /api/bna/rabbi/checkouts | 1 | 2127 | 2127 | 200 |
| /api/bna/rabbi/access-grants | 1 | 2127 | 2127 | 200 |
| /api/bna/rabbi/tiers | 1 | 2042 | 2042 | 200 |
| /api/bna/auth/me | 2 | 1867 | 947 | 200 |
| /api/bna/rabbi/config | 1 | 1160 | 1160 | 200 |
| /api/bna/service-providers | 1 | 1098 | 1098 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 518 |
| Buttons | 122 |
| Links | 3 |
| Body text length | 2236 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 18 |
| Transfer size | 1924397 |
| Encoded body size | 1918997 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 7 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 7 |
| /js/operations-shell.js | 1186118 | 1185818 | 11 |
| /js/app-select.js | 19763 | 19463 | 8 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

