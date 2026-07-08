# Operations Startup Residual Slowness Profile

- Base URL: https://join.onetimeonetime.com
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: live-current
- Login: ok in 1421ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:40:39.240Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 1080 |
| Operations shell visible | 1929 |
| One Time overview visible | 1939 |
| Settled capture window | 11942 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 2 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 0 |
| Median fetch duration | 250 |
| P95 fetch duration | 368 |
| Max fetch duration | 368 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 1070 | 368 | 200 | false |
| /api/bna/auth/me | 1484 | 250 | 200 | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 618 | 368 | 200 |

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
| Transfer size | 308212 |
| Encoded body size | 304612 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui.js | 9861 | 9561 | 375 |
| /js/platform-ui/platform-ui-fixtures.js | 4938 | 4638 | 506 |
| /js/app-select.js | 4743 | 4443 | 255 |
| /js/operations-shell.js | 208051 | 207751 | 597 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
