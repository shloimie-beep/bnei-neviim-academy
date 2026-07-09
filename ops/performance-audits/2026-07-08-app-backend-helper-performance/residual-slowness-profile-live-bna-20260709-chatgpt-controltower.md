# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?view=tasks
- Output suffix: live-bna-20260709-chatgpt-controltower
- Login: ok in 628ms via OPS
- Captured at: 2026-07-09T05:51:23.902Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 2590 |
| Operations shell visible | 2720 |
| One Time overview visible |  |
| Settled capture window | 38738 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 18 |
| Fetches before overview visible | 18 |
| Fetches after overview visible | 0 |
| Median fetch duration | 247 |
| P95 fetch duration | 689 |
| Max fetch duration | 689 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/agent-fleet/status | 2684 | 689 | 200 |  |
| /api/bna/tasks | 2684 | 631 | 200 |  |
| /api/bna/tasks | 32669 | 599 | 200 |  |
| /api/bna/ops/queue-health | 2684 | 555 | 200 |  |
| /api/bna/agent-fleet/status | 32669 | 501 | 200 |  |
| /api/bna/ops/queue-health | 32669 | 488 | 200 |  |
| /api/bna/workspace-settings/platform/branding | 2684 | 311 | 200 |  |
| /api/bna/pipeline-cards | 2684 | 283 | 200 |  |
| /api/bna/auth/me | 2406 | 259 | 200 |  |
| /api/bna/workspace-directory?workspace=platform | 32668 | 247 | 200 |  |
| /api/bna/auth/me | 32424 | 244 | 200 |  |
| /api/bna/workspace-directory?workspace=platform | 2684 | 241 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/tasks | 2 | 1230 | 631 | 200 |
| /api/bna/agent-fleet/status | 2 | 1190 | 689 | 200 |
| /api/bna/ops/queue-health | 2 | 1043 | 555 | 200 |
| /api/bna/workspace-settings/platform/branding | 2 | 548 | 311 | 200 |
| /api/bna/pipeline-cards | 2 | 520 | 283 | 200 |
| /api/bna/auth/me | 2 | 503 | 259 | 200 |
| /api/bna/workspace-directory | 2 | 488 | 247 | 200 |
| /api/bna/agent-runs | 2 | 477 | 240 | 200 |
| /api/bna/agent-profiles | 2 | 476 | 239 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 12593 |
| Buttons | 1481 |
| Links | 7 |
| Body text length | 161963 |
| Long tasks | 4 |
| Long task total ms | 577 |
| Long task max ms | 234 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 26 |
| Transfer size | 15762372 |
| Encoded body size | 15754572 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18103 | 17803 | 1126 |
| /js/platform-ui/platform-ui.js | 45158 | 44858 | 1157 |
| /js/app-select.js | 19763 | 19463 | 246 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0
