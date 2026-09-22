# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: live-bna-onetime-workspace-after-master-catchup
- Login: ok in 581ms via OPS
- Captured at: 2026-07-09T12:02:04.193Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 2148 |
| Operations shell visible | 2468 |
| One Time overview visible | 2477 |
| Settled capture window | 8492 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 8 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 6 |
| Median fetch duration | 274 |
| P95 fetch duration | 304 |
| Max fetch duration | 304 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/config | 3180 | 304 | 200 | true |
| /api/bna/rabbi/members | 3180 | 293 | 200 | true |
| /api/bna/rabbi/checkouts | 3180 | 284 | 200 | true |
| /api/bna/rabbi/access-grants | 3180 | 283 | 200 | true |
| /api/bna/auth/me | 2905 | 274 | 200 | true |
| /api/bna/auth/me | 2138 | 266 | 200 | false |
| /api/bna/service-providers?approved_only=false | 2418 | 254 | 200 | false |
| /api/bna/rabbi/tiers | 3180 | 252 | 200 | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 540 | 274 | 200 |
| /api/bna/rabbi/config | 1 | 304 | 304 | 200 |
| /api/bna/rabbi/members | 1 | 293 | 293 | 200 |
| /api/bna/rabbi/checkouts | 1 | 284 | 284 | 200 |
| /api/bna/rabbi/access-grants | 1 | 283 | 283 | 200 |
| /api/bna/service-providers | 1 | 254 | 254 | 200 |
| /api/bna/rabbi/tiers | 1 | 252 | 252 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 521 |
| Buttons | 123 |
| Links | 3 |
| Body text length | 2249 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 18 |
| Transfer size | 1958221 |
| Encoded body size | 1952821 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 662 |
| /js/app-select.js | 19763 | 19463 | 642 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 744 |
| /js/operations-shell.js | 1205494 | 1205194 | 1564 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

