# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-platform-after-dashboard-light-pass
- Login: ok in 671ms via OPS
- Captured at: 2026-07-09T12:37:54.425Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 7237 |
| Operations shell visible | 8574 |
| One Time overview visible |  |
| Settled capture window | 44584 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 17 |
| Fetches before overview visible | 17 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1117 |
| P95 fetch duration | 35859 |
| Max fetch duration | 35859 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 8225 | 35859 | 200 |  |
| /api/bna/students | 8225 | 2992 | 200 |  |
| /api/bna/workspace-settings/platform/branding | 8224 | 1599 | 200 |  |
| /api/bna/content-jobs | 8225 | 1454 | 200 |  |
| /api/bna/agent-fleet/status | 8224 | 1316 | 200 |  |
| /api/bna/workspace-directory?workspace=platform | 8224 | 1296 | 200 |  |
| /api/bna/tasks | 8224 | 1296 | 200 |  |
| /api/bna/devices | 8225 | 1141 | 200 |  |
| /api/bna/contact-communications | 8225 | 1117 | 200 |  |
| /api/bna/ops/queue-health | 8224 | 1110 | 200 |  |
| /api/bna/auth/me | 7226 | 980 | 200 |  |
| /api/bna/accountability | 8225 | 885 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 1 | 35859 | 35859 | 200 |
| /api/bna/students | 1 | 2992 | 2992 | 200 |
| /api/bna/workspace-settings/platform/branding | 1 | 1599 | 1599 | 200 |
| /api/bna/content-jobs | 1 | 1454 | 1454 | 200 |
| /api/bna/agent-fleet/status | 1 | 1316 | 1316 | 200 |
| /api/bna/workspace-directory | 1 | 1296 | 1296 | 200 |
| /api/bna/tasks | 1 | 1296 | 1296 | 200 |
| /api/bna/devices | 1 | 1141 | 1141 | 200 |
| /api/bna/contact-communications | 1 | 1117 | 1117 | 200 |
| /api/bna/ops/queue-health | 1 | 1110 | 1110 | 200 |
| /api/bna/auth/me | 1 | 980 | 980 | 200 |
| /api/bna/accountability | 1 | 885 | 885 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 863 |
| Buttons | 166 |
| Links | 7 |
| Body text length | 8699 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 27 |
| Transfer size | 18857364 |
| Encoded body size | 18849264 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 1298 |
| /js/app-select.js | 19763 | 19463 | 1297 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 1551 |
| /js/operations-shell.js | 1210646 | 1210346 | 6037 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

