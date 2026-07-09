# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-platform-after-hotfix
- Login: ok in 653ms via OPS
- Captured at: 2026-07-09T12:08:55.105Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 2707 |
| Operations shell visible | 3055 |
| One Time overview visible |  |
| Settled capture window | 39072 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 118 |
| Fetches before overview visible | 118 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1586 |
| P95 fetch duration | 3708 |
| Max fetch duration | 5118 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 2978 | 5118 | 200 |  |
| /api/bna/students | 2980 | 4584 | 200 |  |
| /api/bna/torah-learning | 2980 | 4584 | 200 |  |
| /api/bna/courses | 2980 | 4568 | 200 |  |
| /api/bna/content-prompts | 2980 | 3990 | 200 |  |
| /api/bna/agent-fleet/status | 2978 | 3708 | 200 |  |
| /api/bna/support-tickets | 33131 | 3636 | 200 |  |
| /api/bna/integrations/status | 2983 | 3593 | 200 |  |
| /api/bna/one-time/classroom | 2979 | 3570 | 200 |  |
| /api/bna/parent-leads | 2979 | 3201 | 200 |  |
| /api/bna/assignment-prompts | 2980 | 2951 | 200 |  |
| /api/bna/one-time/classes?limit=120 | 2979 | 2939 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 2 | 8754 | 5118 | 200 |
| /api/bna/students | 2 | 7229 | 4584 | 200 |
| /api/bna/courses | 2 | 7214 | 4568 | 200 |
| /api/bna/torah-learning | 2 | 6839 | 4584 | 200 |
| /api/bna/content-prompts | 2 | 6004 | 3990 | 200 |
| /api/bna/integrations/status | 2 | 5720 | 3593 | 200 |
| /api/bna/agent-fleet/status | 2 | 5536 | 3708 | 200 |
| /api/bna/one-time/classroom | 2 | 5483 | 3570 | 200 |
| /api/bna/one-time/classes | 2 | 4856 | 2939 | 200 |
| /api/bna/assignment-prompts | 2 | 4744 | 2951 | 200 |
| /api/bna/group-goals | 2 | 4685 | 2893 | 200 |
| /api/bna/integrations/buffer/health | 2 | 4634 | 2809 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 886 |
| Buttons | 176 |
| Links | 7 |
| Body text length | 8663 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 125 |
| Transfer size | 48660191 |
| Encoded body size | 48622691 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/app-select.js | 19763 | 19463 | 742 |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 795 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 858 |
| /js/operations-shell.js | 1209886 | 1209586 | 2073 |

## Console And Failures

- Console errors: 2
- Failed requests: 0
- Dashboard error banners: 0

