# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after-overview-launch
- Login: ok in 1843ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:39:20.673Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 419 |
| Operations shell visible | 1758 |
| One Time overview visible | 1768 |
| Settled capture window | 15783 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 8 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 6 |
| Median fetch duration | 946 |
| P95 fetch duration | 2252 |
| Max fetch duration | 2252 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/members | 3153 | 2252 | 200 | true |
| /api/bna/rabbi/access-grants | 3154 | 2100 | 200 | true |
| /api/bna/rabbi/checkouts | 3153 | 2031 | 200 | true |
| /api/bna/rabbi/config | 3153 | 1111 | 200 | true |
| /api/bna/service-providers?approved_only=false | 1315 | 946 | 200 | false |
| /api/bna/auth/me | 407 | 892 | 200 | false |
| /api/bna/auth/me | 2265 | 887 | 200 | true |
| /api/bna/rabbi/tiers | 3153 | 680 | 200 | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/members | 1 | 2252 | 2252 | 200 |
| /api/bna/rabbi/access-grants | 1 | 2100 | 2100 | 200 |
| /api/bna/rabbi/checkouts | 1 | 2031 | 2031 | 200 |
| /api/bna/auth/me | 2 | 1779 | 892 | 200 |
| /api/bna/rabbi/config | 1 | 1111 | 1111 | 200 |
| /api/bna/service-providers | 1 | 946 | 946 | 200 |
| /api/bna/rabbi/tiers | 1 | 680 | 680 | 200 |

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
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 6 |
| /js/app-select.js | 19763 | 19463 | 7 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 6 |
| /js/operations-shell.js | 1186118 | 1185818 | 8 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
