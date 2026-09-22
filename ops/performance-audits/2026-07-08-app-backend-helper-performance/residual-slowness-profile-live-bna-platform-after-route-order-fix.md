# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-platform-after-route-order-fix
- Login: ok in 2361ms via OPS
- Captured at: 2026-07-09T12:20:57.766Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 2774 |
| Operations shell visible | 3137 |
| One Time overview visible |  |
| Settled capture window | 39157 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 118 |
| Fetches before overview visible | 118 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1064 |
| P95 fetch duration | 2855 |
| Max fetch duration | 3622 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 33808 | 3622 | 200 |  |
| /api/bna/support-tickets | 3060 | 3567 | 200 |  |
| /api/bna/projects | 3058 | 2884 | 200 |  |
| /api/bna/notifications?status=all&limit=100 | 3065 | 2878 | 200 |  |
| /api/bna/workspace-users?status=all | 33807 | 2859 | 200 |  |
| /api/bna/students | 33811 | 2855 | 200 |  |
| /api/bna/courses | 33813 | 2635 | 200 |  |
| /api/bna/torah-learning | 33812 | 2609 | 200 |  |
| /api/bna/courses | 3064 | 2364 | 200 |  |
| /api/bna/students | 3063 | 2305 | 200 |  |
| /api/bna/torah-learning | 3063 | 2262 | 200 |  |
| /api/bna/content-prompts | 3062 | 1815 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 2 | 7189 | 3622 | 200 |
| /api/bna/students | 2 | 5160 | 2855 | 200 |
| /api/bna/courses | 2 | 4999 | 2635 | 200 |
| /api/bna/torah-learning | 2 | 4871 | 2609 | 200 |
| /api/bna/projects | 2 | 4016 | 2884 | 200 |
| /api/bna/notifications | 2 | 4012 | 2878 | 200 |
| /api/bna/workspace-users | 2 | 3655 | 2859 | 200 |
| /api/bna/content-prompts | 2 | 3526 | 1815 | 200 |
| /api/bna/integrations/status | 2 | 2906 | 1673 | 200 |
| /api/bna/one-time/classroom | 2 | 2650 | 1397 | 200 |
| /api/bna/agent-fleet/status | 2 | 2596 | 1365 | 200 |
| /api/bna/one-time/classes | 2 | 2567 | 1348 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 886 |
| Buttons | 176 |
| Links | 7 |
| Body text length | 8661 |
| Long tasks | 1 |
| Long task total ms | 56 |
| Long task max ms | 56 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 124 |
| Transfer size | 44518810 |
| Encoded body size | 44481610 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 733 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 1042 |
| /js/operations-shell.js | 1209886 | 1209586 | 1536 |
| /js/app-select.js | 19763 | 19463 | 835 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

