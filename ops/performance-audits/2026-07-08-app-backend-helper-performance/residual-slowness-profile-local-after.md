# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after
- Login: ok in 1621ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:34:33.190Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 484 |
| Operations shell visible | 1835 |
| One Time overview visible | 1846 |
| Settled capture window | 9850 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 22 |
| Fetches before overview visible | 2 |
| Fetches after overview visible | 20 |
| Median fetch duration | 1860 |
| P95 fetch duration | 2403 |
| Max fetch duration | 2403 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 4623 | 2403 | 200 | true |
| /api/bna/signups | 7027 | 2260 | 200 | true |
| /api/bna/workspace-settings/rabbi_sheller_provider/branding | 7026 | 2144 | 200 | true |
| /api/bna/projects | 7027 | 1860 | 200 | true |
| /api/bna/pipeline-cards?workspace=rabbi_sheller_provider | 7027 | 1821 | 200 | true |
| /api/bna/auth/me | 473 | 904 | 200 | false |
| /api/bna/service-providers?approved_only=false | 1390 |  |  | false |
| /api/bna/workspace-directory?workspace=rabbi_sheller_provider | 7026 |  |  | true |
| /api/bna/workspace-platform?workspace=rabbi_sheller_provider | 7026 |  |  | true |
| /api/bna/parent-leads?project_key=one_time_mishnah_class&workspace=rabbi_sheller_provider | 7027 |  |  | true |
| /api/bna/service-providers?approved_only=false | 7027 |  |  | true |
| /api/bna/contact-communications?project_key=one_time_mishnah_class&workspace=rabbi_sheller_provider | 7027 |  |  | true |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/auth/me | 2 | 3307 | 2403 | 200 |
| /api/bna/signups | 1 | 2260 | 2260 | 200 |
| /api/bna/workspace-settings/rabbi_sheller_provider/branding | 1 | 2144 | 2144 | 200 |
| /api/bna/projects | 1 | 1860 | 1860 | 200 |
| /api/bna/pipeline-cards | 1 | 1821 | 1821 | 200 |
| /api/bna/service-providers | 2 | 0 | 0 |  |
| /api/bna/workspace-directory | 1 | 0 | 0 |  |
| /api/bna/workspace-platform | 1 | 0 | 0 |  |
| /api/bna/parent-leads | 1 | 0 | 0 |  |
| /api/bna/contact-communications | 1 | 0 | 0 |  |
| /api/bna/content-jobs | 1 | 0 | 0 |  |
| /api/bna/class-sessions | 1 | 0 | 0 |  |

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
| Resource count | 16 |
| Transfer size | 1654345 |
| Encoded body size | 1649545 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 6 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 7 |
| /js/app-select.js | 19763 | 19463 | 7 |
| /js/operations-shell.js | 1185217 | 1184917 | 10 |

## Console And Failures

- Console errors: 0
- Failed requests: 0
