# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after-light-overview
- Login: ok in 1657ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:37:51.720Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 489 |
| Operations shell visible | 1813 |
| One Time overview visible | 1824 |
| Settled capture window | 15841 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 16 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 14 |
| Median fetch duration | 2039 |
| P95 fetch duration | 4324 |
| Max fetch duration | 4324 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/one-time/product-system | 3432 | 4324 | 200 | true |
| /api/bna/rabbi/communications | 3432 | 2842 | 200 | true |
| /api/bna/one-time/agent-mode-acceptance | 3432 | 2710 | 200 | true |
| /api/bna/rabbi/site | 3432 | 2701 | 200 | true |
| /api/bna/one-time/test-identities-preview | 3432 | 2559 | 200 | true |
| /api/bna/rabbi/live-sessions | 3432 | 2540 | 200 | true |
| /api/bna/rabbi/members | 3431 | 2266 | 200 | true |
| /api/bna/rabbi/checkouts | 3431 | 2090 | 200 | true |
| /api/bna/rabbi/provider-settings | 3431 | 2039 | 200 | true |
| /api/bna/rabbi/access-grants | 3431 | 2038 | 200 | true |
| /api/bna/rabbi/tiers | 3431 | 2028 | 200 | true |
| /api/bna/rabbi/library-items | 3432 | 1851 | 200 | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/one-time/product-system | 1 | 4324 | 4324 | 200 |
| /api/bna/rabbi/communications | 1 | 2842 | 2842 | 200 |
| /api/bna/one-time/agent-mode-acceptance | 1 | 2710 | 2710 | 200 |
| /api/bna/rabbi/site | 1 | 2701 | 2701 | 200 |
| /api/bna/one-time/test-identities-preview | 1 | 2559 | 2559 | 200 |
| /api/bna/rabbi/live-sessions | 1 | 2540 | 2540 | 200 |
| /api/bna/rabbi/members | 1 | 2266 | 2266 | 200 |
| /api/bna/rabbi/checkouts | 1 | 2090 | 2090 | 200 |
| /api/bna/rabbi/provider-settings | 1 | 2039 | 2039 | 200 |
| /api/bna/rabbi/access-grants | 1 | 2038 | 2038 | 200 |
| /api/bna/rabbi/tiers | 1 | 2028 | 2028 | 200 |
| /api/bna/auth/me | 2 | 1860 | 931 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 518 |
| Buttons | 122 |
| Links | 3 |
| Body text length | 2244 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 26 |
| Transfer size | 2024181 |
| Encoded body size | 2016381 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 6 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 6 |
| /js/app-select.js | 19763 | 19463 | 6 |
| /js/operations-shell.js | 1185676 | 1185376 | 9 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
