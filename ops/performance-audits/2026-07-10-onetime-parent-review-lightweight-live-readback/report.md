# OneTime Live Lag Audit

Generated: 2026-07-09T21:42:36.291Z
Base URL: https://join.onetimeonetime.com
External write performed: false
Production data mutation performed: false

## Summary

- Routes sampled: 9
- Viewports sampled: 2
- Total samples: 18
- Samples needing attention: 0

## Blocker Counts

- None

## Worst Network Idle

| Route | Viewport | Network idle | Goto | Blockers |
|---|---:|---:|---:|---|
| provider-review | desktop-1440 | 2010ms | 1400ms | none |
| one-time | desktop-1440 | 2003ms | 1503ms | none |
| one-time-classroom-review | desktop-1440 | 1873ms | 842ms | none |
| one-time-classroom-review | mobile-390 | 1847ms | 851ms | none |
| student-review | mobile-390 | 1782ms | 1023ms | none |

## Worst Paint

| Route | Viewport | First contentful paint | Blockers |
|---|---:|---:|---|
| provider-review | desktop-1440 | 1216ms | none |
| student-review | mobile-390 | 968ms | none |
| student-review | desktop-1440 | 908ms | none |
| provider-review | mobile-390 | 856ms | none |
| one-time | mobile-390 | 840ms | none |

## Worst Main Thread Work

| Route | Viewport | Long task total | Long task max | Blockers |
|---|---:|---:|---:|---|
| one-time | desktop-1440 | 0ms | 0ms | none |
| one-time-mishnayos | desktop-1440 | 0ms | 0ms | none |
| rabbi-member | desktop-1440 | 0ms | 0ms | none |
| member-library | desktop-1440 | 0ms | 0ms | none |
| one-time-classroom | desktop-1440 | 0ms | 0ms | none |

## Per-Route Results

| Route | Viewport | Status | DCL | FCP | Load | Network idle | Requests | API slow | Failed | Console errors | DOM nodes | Long tasks |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| one-time | desktop-1440 | acceptable | 1501ms | 820ms | 1501ms | 2003ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | desktop-1440 | acceptable | 928ms | 564ms | 945ms | 1446ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | desktop-1440 | acceptable | 1108ms | 752ms | 1120ms | 1636ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | desktop-1440 | acceptable | 722ms | 460ms | 722ms | 1224ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | desktop-1440 | acceptable | 866ms | 792ms | 866ms | 1358ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | desktop-1440 | acceptable | 840ms | 820ms | 840ms | 1873ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | desktop-1440 | acceptable | 1399ms | 1216ms | 1399ms | 2010ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | desktop-1440 | acceptable | 942ms | 908ms | 942ms | 1694ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | desktop-1440 | acceptable | 829ms | 488ms | 830ms | 1325ms | 4 | 0 | 0 | 0 | 147 | 0ms |
| one-time | mobile-390 | acceptable | 1245ms | 840ms | 1246ms | 1750ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | mobile-390 | acceptable | 915ms | 524ms | 915ms | 1411ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | mobile-390 | acceptable | 982ms | 628ms | 985ms | 1477ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | mobile-390 | acceptable | 715ms | 460ms | 716ms | 1219ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | mobile-390 | acceptable | 815ms | 772ms | 815ms | 1309ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | mobile-390 | acceptable | 850ms | 804ms | 850ms | 1847ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | mobile-390 | acceptable | 907ms | 856ms | 907ms | 1592ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | mobile-390 | acceptable | 1021ms | 968ms | 1021ms | 1782ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | mobile-390 | acceptable | 819ms | 492ms | 820ms | 1325ms | 4 | 0 | 0 | 0 | 147 | 0ms |

## Interpretation

- `slow_network_idle` usually points to late resources, slow API calls, or widgets continuing work after the page appears.
- `main_thread_long_tasks` points to JavaScript work that can make taps/typing feel laggy.
- `heavy_dom` points to too much rendered markup and is often paired with layout jank.
- This audit did not submit forms, send messages, create accounts, charge payments, mutate provider records, or log into private Operations.

## Guardrails

- No forms were submitted.
- No login, payment, checkout, access grant, email, WhatsApp, Telegram, DNS, Drive, Vimeo, Zoom, provider, credential, or production-data mutation was performed.
- Private Operations routes were intentionally excluded from this live lag audit.
- Screenshots, if requested, are limited to public/review surfaces.
