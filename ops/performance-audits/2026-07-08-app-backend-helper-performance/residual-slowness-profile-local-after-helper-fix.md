# Operations Startup Residual Slowness Profile

- Base URL: http://127.0.0.1:8100
- Path: /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview
- Output suffix: local-after-helper-fix
- Login: ok in 1617ms via ONE_TIME_OPS
- Captured at: 2026-07-08T20:31:15.624Z

## Milestones

| Marker | ms |
| --- | ---: |
| DOM content loaded | 431 |
| Operations shell visible | 1790 |
| One Time overview visible | 1801 |
| Settled capture window | 9818 |

## Fetch Fanout

| Metric | Value |
| --- | ---: |
| Total fetches | 4 |
| Fetches before overview visible | 4 |
| Fetches after overview visible | 0 |
| Median fetch duration | 1693 |
| P95 fetch duration | 2425 |
| Max fetch duration | 2425 |

## Slowest Fetches

| Path | Start ms | Duration ms | Status | After overview |
| --- | --- | --- | --- | --- |
| /api/bna/service-providers?approved_only=false | 1323 | 2425 | 200 | false |
| /api/bna/workspace-settings/rabbi_sheller_provider/branding | 1323 | 1693 | 403 | false |
| /api/bna/auth/me | 417 | 890 | 200 | false |
| /api/bna/workspace-directory?workspace=rabbi_sheller_provider | 1323 |  |  | false |

## Fetch Families

| Path | Count | Total ms | Max ms | Statuses |
| --- | --- | --- | --- | --- |
| /api/bna/service-providers | 1 | 2425 | 2425 | 200 |
| /api/bna/workspace-settings/rabbi_sheller_provider/branding | 1 | 1693 | 1693 | 403 |
| /api/bna/auth/me | 1 | 890 | 890 | 200 |
| /api/bna/workspace-directory | 1 | 0 | 0 |  |

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
| Resource count | 13 |
| Transfer size | 1889215 |
| Encoded body size | 1885315 |

| Script | Transfer | Encoded | Duration ms |
| --- | --- | --- | --- |
| /js/platform-ui/platform-ui-fixtures.js | 18400 | 18100 | 8 |
| /js/platform-ui/platform-ui.js | 46137 | 45837 | 8 |
| /js/app-select.js | 19763 | 19463 | 9 |
| /js/operations-shell.js | 1183687 | 1183387 | 12 |

## Console And Failures

- Console errors: 1
- Failed requests: 0
