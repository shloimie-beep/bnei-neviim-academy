# Operations Startup Residual Slowness Profile

- Base URL: https://bneineviimacademy.org
- Path: /operations?workspace=platform&view=dashboard&section=overview
- Output suffix: live-bna-platform-after-support-ticket-hotfix
- Login: ok in 709ms via OPS
- Captured at: 2026-07-09T12:56:14.955Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 1845 |
| Operations shell visible | 3186 |
| One Time overview visible |  |
| Settled capture window | 39207 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 32 |
| Fetches before overview visible | 32 |
| Fetches after overview visible | 0 |
| Median fetch duration | 822 |
| P95 fetch duration | 2577 |
| Max fetch duration | 2979 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/tasks | 2726 | 2979 | 200 |  |
| /api/bna/payment-intake | 32900 | 2577 | 200 |  |
| /api/bna/payments | 32900 | 2576 | 200 |  |
| /api/bna/devices | 2727 | 2575 | 200 |  |
| /api/bna/workspace-settings/platform/branding | 2726 | 1862 | 200 |  |
| /api/bna/payments | 2727 | 1861 | 200 |  |
| /api/bna/signups | 2727 | 1761 | 200 |  |
| /api/bna/payment-reminders/due | 2727 | 1585 | 200 |  |
| /api/bna/workspace-directory?workspace=platform | 2726 | 1234 | 200 |  |
| /api/bna/auth/me | 31850 | 1049 | 200 |  |
| /api/bna/students | 2727 | 1039 | 200 |  |
| /api/bna/tasks | 32900 | 990 | 200 |  |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/payments | 2 | 4437 | 2576 | 200 |
| /api/bna/tasks | 2 | 3969 | 2979 | 200 |
| /api/bna/devices | 2 | 3395 | 2575 | 200 |
| /api/bna/payment-intake | 2 | 2842 | 2577 | 200 |
| /api/bna/workspace-settings/platform/branding | 2 | 2683 | 1862 | 200 |
| /api/bna/signups | 2 | 2566 | 1761 | 200 |
| /api/bna/payment-reminders/due | 2 | 2405 | 1585 | 200 |
| /api/bna/workspace-directory | 2 | 2056 | 1234 | 200 |
| /api/bna/auth/me | 2 | 1926 | 1049 | 200 |
| /api/bna/content-jobs | 2 | 1538 | 821 | 200 |
| /api/bna/agent-fleet/status | 2 | 1478 | 910 | 200 |
| /api/bna/contact-communications | 2 | 1425 | 821 | 200 |

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
| Resource count | 41 |
| Transfer size | 35927463 |
| Encoded body size | 35915163 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 620 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 738 |
| /js/app-select.js | 19763 | 19463 | 687 |
| /js/operations-shell.js | 1210651 | 1210351 | 1306 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
- Dashboard error banners: 0

