# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after-long
- Login: ok in 1590ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:35:17.403Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 441 |
| Operations shell visible | 1798 |
| One Time overview visible | 1807 |
| Settled capture window | 15822 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 22 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 20 |
| Median fetch duration | 3656 |
| P95 fetch duration | 5130 |
| Max fetch duration | 5130 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/one-time/classes?limit=120 | 5442 | 5130 | 200 | true |
| /api/bna/notification-preferences?workspace=rabbi_sheller_provider | 5443 | 4949 | 403 | true |
| /api/bna/notifications?status=all&workspace=rabbi_sheller_provider&limit=100 | 5443 | 4745 | 403 | true |
| /api/bna/one-time/question-moderation?limit=80 | 5442 | 4717 | 200 | true |
| /api/bna/content-bundles | 5443 | 4514 | 200 | true |
| /api/bna/project-meetings?project=one_time_mishnah_class | 5442 | 4032 | 200 | true |
| /api/bna/one-time/classroom | 5442 | 3889 | 403 | true |
| /api/bna/contact-communications?project_key=one_time_mishnah_class&workspace=rabbi_sheller_provider | 5441 | 3757 | 200 | true |
| /api/bna/class-sessions?project_key=one_time_mishnah_class | 5442 | 3689 | 200 | true |
| /api/bna/parent-leads?project_key=one_time_mishnah_class&workspace=rabbi_sheller_provider | 5441 | 3656 | 200 | true |
| /api/bna/content-jobs?project_key=one_time_mishnah_class | 5441 | 3304 | 200 | true |
| /api/bna/workspace-platform?workspace=rabbi_sheller_provider | 5440 | 2498 | 200 | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/one-time/classes | 1 | 5130 | 5130 | 200 |
| /api/bna/notification-preferences | 1 | 4949 | 4949 | 403 |
| /api/bna/notifications | 1 | 4745 | 4745 | 403 |
| /api/bna/one-time/question-moderation | 1 | 4717 | 4717 | 200 |
| /api/bna/content-bundles | 1 | 4514 | 4514 | 200 |
| /api/bna/project-meetings | 1 | 4032 | 4032 | 200 |
| /api/bna/one-time/classroom | 1 | 3889 | 3889 | 403 |
| /api/bna/contact-communications | 1 | 3757 | 3757 | 200 |
| /api/bna/class-sessions | 1 | 3689 | 3689 | 200 |
| /api/bna/parent-leads | 1 | 3656 | 3656 | 200 |
| /api/bna/content-jobs | 1 | 3304 | 3304 | 200 |
| /api/bna/workspace-platform | 1 | 2498 | 2498 | 200 |

## Browser Work

| Metric | Value |
| --- | ---: |
| DOM nodes | 518 |
| Buttons | 122 |
| Links | 3 |
| Body text length | 2229 |
| Long tasks | 0 |
| Long task total ms | 0 |
| Long task max ms | 0 |

## Assets

| Metric | Value |
| --- | ---: |
| Resource count | 28 |
| Transfer size | 7393132 |
| Encoded body size | 7384732 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 6 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 6 |
| /js/app-select.js | 19763 | 19463 | 7 |
| /js/operations-shell.js | 1185217 | 1184917 | 11 |

## Console And Failures

- Console errors: 3
- Failed requests: 0
