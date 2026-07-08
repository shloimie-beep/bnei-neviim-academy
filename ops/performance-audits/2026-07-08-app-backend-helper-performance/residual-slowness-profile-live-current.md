# Operations Startup Residual Slowness Profile

- Base URL: https://join.onetimeonetime.com
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: live-current
- Login: ok in 512ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:46:38.061Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 1018 |
| Operations shell visible | 1341 |
| One Time overview visible | 1348 |
| Settled capture window | 11363 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 2 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 0 |
| Median fetch duration | 243 |
| P95 fetch duration | 255 |
| Max fetch duration | 255 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 1008 | 255 | 200 | false |
| /api/bna/auth/me | 1310 | 243 | 200 | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 498 | 255 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 523 |
| Buttons | 123 |
| Links | 3 |
| Body text length | 2311 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 12 |
| Transfer size | 308181 |
| Encoded body size | 304581 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 4937 | 4637 | 256 |
| /js/app-select.js | 4742 | 4442 | 246 |
| /js/platform-ui/platform-ui.js | 9861 | 9561 | 384 |
| /js/operations-shell.js | 208026 | 207726 | 568 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 1
  - Some dashboard data could not load: emailInboxFilters is not defined
