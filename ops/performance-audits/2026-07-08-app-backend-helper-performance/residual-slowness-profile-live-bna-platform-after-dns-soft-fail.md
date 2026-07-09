# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-platform-after-dns-soft-fail
- Login: ok in 565ms via OPS
- Captured at: 2026-07-09T12:15:12.813Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 1901 |
| Operations shell visible | 2227 |
| One Time overview visible |  |
| Settled capture window | 38253 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 118 |
| Fetches before overview visible | 118 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1157 |
| P95 fetch duration | 3022 |
| Max fetch duration | 4447 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 32358 | 4447 | 200 |  |
| /api/bna/students | 32360 | 3858 | 200 |  |
| /api/bna/courses | 32360 | 3669 | 200 |  |
| /api/bna/support-tickets | 2169 | 3560 | 200 |  |
| /api/bna/workspace-directory?workspace=platform | 32353 | 3027 | 200 |  |
| /api/bna/integrations/status | 32361 | 3022 | 200 |  |
| /api/bna/internal-dialogue | 2169 | 2538 | 200 |  |
| /api/bna/signups | 2169 | 2537 | 200 |  |
| /api/bna/students | 2171 | 2536 | 200 |  |
| /api/bna/courses | 2171 | 2383 | 200 |  |
| /api/bna/one-time/classroom | 32359 | 2013 | 200 |  |
| /api/bna/agent-fleet/status | 32358 | 2012 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/support-tickets | 2 | 8007 | 4447 | 200 |
| /api/bna/students | 2 | 6394 | 3858 | 200 |
| /api/bna/courses | 2 | 6052 | 3669 | 200 |
| /api/bna/integrations/status | 2 | 4988 | 3022 | 200 |
| /api/bna/one-time/classroom | 2 | 3831 | 2013 | 200 |
| /api/bna/one-time/question-moderation | 2 | 3716 | 1898 | 200 |
| /api/bna/integrations/buffer/health | 2 | 3714 | 1897 | 200 |
| /api/bna/agent-fleet/status | 2 | 3592 | 2012 | 200 |
| /api/bna/one-time/classes | 2 | 3577 | 1998 | 200 |
| /api/bna/assignment-prompts | 2 | 3477 | 1899 | 200 |
| /api/bna/live-sessions | 2 | 3475 | 1898 | 200 |
| /api/bna/group-goals | 2 | 3475 | 1898 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 886 |
| Buttons | 176 |
| Links | 7 |
| Body text length | 8661 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 119 |
| Transfer size | 39725423 |
| Encoded body size | 39689723 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 626 |
| /js/app-select.js | 19763 | 19463 | 637 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 727 |
| /js/operations-shell.js | 1209886 | 1209586 | 1353 |

## Console And Failures

- Console errors: 2
- Failed requests: 0
- Dashboard error banners: 0

