# Operations Startup Residual Slowness Profile

- Base URL: https://join.onetimeonetime.com
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: live-after-deploy
- Login: ok in 536ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:50:43.072Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 991 |
| Operations shell visible | 1318 |
| One Time overview visible | 1325 |
| Settled capture window | 11332 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 8 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 6 |
| Median fetch duration | 269 |
| P95 fetch duration | 330 |
| Max fetch duration | 330 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/rabbi/members | 1773 | 330 | 200 | true |
| /api/bna/rabbi/config | 1773 | 320 | 200 | true |
| /api/bna/rabbi/access-grants | 1773 | 320 | 200 | true |
| /api/bna/rabbi/tiers | 1773 | 269 | 200 | true |
| /api/bna/rabbi/checkouts | 1773 | 269 | 200 | true |
| /api/bna/auth/me | 980 | 265 | 200 | false |
| /api/bna/auth/me | 1519 | 253 | 200 | true |
| /api/bna/service-providers?approved_only=false | 1260 | 244 | 200 | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 518 | 265 | 200 |
| /api/bna/rabbi/members | 1 | 330 | 330 | 200 |
| /api/bna/rabbi/config | 1 | 320 | 320 | 200 |
| /api/bna/rabbi/access-grants | 1 | 320 | 320 | 200 |
| /api/bna/rabbi/tiers | 1 | 269 | 269 | 200 |
| /api/bna/rabbi/checkouts | 1 | 269 | 269 | 200 |
| /api/bna/service-providers | 1 | 244 | 244 | 200 |

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
| Transfer size | 320304 |
| Encoded body size | 314904 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 4938 | 4638 | 247 |
| /js/platform-ui/platform-ui.js | 9863 | 9563 | 318 |
| /js/operations-shell.js | 209103 | 208803 | 562 |
| /js/app-select.js | 4743 | 4443 | 327 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

