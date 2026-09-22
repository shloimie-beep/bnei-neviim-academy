# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-before
- Login: ok in 2317ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:28:02.257Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 3207 |
| Operations shell visible | 4571 |
| One Time overview visible | 4588 |
| Settled capture window | 10601 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 2 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 0 |
| Median fetch duration | 889 |
| P95 fetch duration | 898 |
| Max fetch duration | 898 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 4153 | 898 | 200 | false |
| /api/bna/auth/me | 3196 | 889 | 200 | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 1787 | 898 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 520 |
| Buttons | 122 |
| Links | 3 |
| Body text length | 2298 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 12 |
| Transfer size | 1645961 |
| Encoded body size | 1642361 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 6 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 6 |
| /js/app-select.js | 19763 | 19463 | 7 |
| /js/operations-shell.js | 1180207 | 1179907 | 9 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 1
  - Some dashboard data could not load: emailInboxFilters is not defined
