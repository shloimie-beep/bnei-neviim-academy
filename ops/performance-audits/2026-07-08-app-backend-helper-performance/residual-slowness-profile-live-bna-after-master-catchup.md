# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-after-master-catchup
- Login: ok in 591ms via OPS
- Captured at: 2026-07-09T12:01:42.275Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 2201 |
| Operations shell visible |  |
| One Time overview visible |  |
| Settled capture window | 68237 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 119 |
| Fetches before overview visible | 119 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1101 |
| P95 fetch duration | 3703 |
| Max fetch duration | 5345 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 62649 | 5345 | 200 |  |
| /api/bna/integrations/status | 62652 | 4861 | 200 |  |
| /api/bna/courses | 62651 | 4852 | 200 |  |
| /api/bna/students | 62650 | 4649 | 200 |  |
| /api/bna/torah-learning | 62651 | 4271 | 200 |  |
| /api/bna/support-tickets | 32621 | 3703 | 200 |  |
| /api/bna/integrations/buffer/channels | 62651 | 3491 | 200 |  |
| /api/bna/content-prompts | 62650 | 3131 | 200 |  |
| /api/bna/students | 32623 | 2575 | 200 |  |
| /api/bna/courses | 32623 | 2575 | 200 |  |
| /api/bna/torah-learning | 32623 | 2359 | 200 |  |
| /api/bna/integrations/status | 32624 | 2272 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 2 | 9048 | 5345 | 200 |
| /api/bna/courses | 2 | 7427 | 4852 | 200 |
| /api/bna/students | 2 | 7224 | 4649 | 200 |
| /api/bna/integrations/status | 2 | 7133 | 4861 | 200 |
| /api/bna/torah-learning | 2 | 6630 | 4271 | 200 |
| /api/bna/content-prompts | 2 | 5296 | 3131 | 200 |
| /api/bna/integrations/buffer/channels | 2 | 4991 | 3491 | 200 |
| /api/bna/one-time/classroom | 2 | 4022 | 2200 | 200 |
| /api/bna/integrations/buffer/health | 2 | 4019 | 2199 | 200 |
| /api/bna/agent-fleet/status | 2 | 3965 | 2142 | 200 |
| /api/bna/one-time/classes | 2 | 3916 | 2094 | 200 |
| /api/bna/assignment-prompts | 2 | 3822 | 2001 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 27 |
| Buttons | 0 |
| Links | 0 |
| Body text length | 25 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 114 |
| Transfer size | 37560967 |
| Encoded body size | 37526767 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 684 |
| /js/app-select.js | 19763 | 19463 | 698 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 781 |
| /js/operations-shell.js | 1205494 | 1205194 | 1609 |

## Console And Failures

- Console errors: 4
- Failed requests: 0
- Dashboard error banners: 0

