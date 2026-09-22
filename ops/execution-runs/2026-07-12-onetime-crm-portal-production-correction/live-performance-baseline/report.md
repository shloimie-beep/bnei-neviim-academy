# One Time Live Lag Audit

Generated: 2026-07-12T15:03:07.735Z
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
| one-time | desktop-1440 | 2832ms | 1528ms | none |
| one-time-mishnayos | mobile-390 | 2714ms | 1540ms | none |
| one-time-classroom | desktop-1440 | 2521ms | 1200ms | none |
| one-time | mobile-390 | 2499ms | 1196ms | none |
| one-time-mishnayos | desktop-1440 | 2489ms | 1664ms | none |

## Worst Paint

| Route | Viewport | First contentful paint | Blockers |
|---|---:|---:|---|
| one-time-classroom | desktop-1440 | 1064ms | none |
| one-time-classroom | mobile-390 | 1000ms | none |
| one-time-classroom-review | desktop-1440 | 996ms | none |
| one-time | desktop-1440 | 960ms | none |
| provider-review | desktop-1440 | 956ms | none |

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
| one-time | desktop-1440 | acceptable | 1525ms | 960ms | 1991ms | 2832ms | 21 | 0 | 0 | 0 | 358 | 0ms |
| one-time-mishnayos | desktop-1440 | acceptable | 1663ms | 552ms | 1983ms | 2489ms | 20 | 0 | 0 | 0 | 358 | 0ms |
| rabbi-member | desktop-1440 | acceptable | 896ms | 544ms | 898ms | 2009ms | 7 | 0 | 0 | 0 | 155 | 0ms |
| member-library | desktop-1440 | acceptable | 828ms | 484ms | 828ms | 1863ms | 6 | 0 | 0 | 0 | 86 | 0ms |
| one-time-classroom | desktop-1440 | acceptable | 1198ms | 1064ms | 1198ms | 2521ms | 6 | 0 | 0 | 0 | 140 | 0ms |
| one-time-classroom-review | desktop-1440 | acceptable | 1096ms | 996ms | 1096ms | 2097ms | 7 | 0 | 0 | 0 | 171 | 0ms |
| provider-review | desktop-1440 | acceptable | 1034ms | 956ms | 1035ms | 2156ms | 8 | 0 | 0 | 0 | 911 | 0ms |
| student-review | desktop-1440 | acceptable | 863ms | 852ms | 864ms | 1603ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | desktop-1440 | acceptable | 955ms | 568ms | 956ms | 2017ms | 5 | 0 | 0 | 0 | 148 | 0ms |
| one-time | mobile-390 | acceptable | 1195ms | 772ms | 1907ms | 2499ms | 21 | 0 | 0 | 0 | 358 | 0ms |
| one-time-mishnayos | mobile-390 | acceptable | 1539ms | 712ms | 2106ms | 2714ms | 20 | 0 | 0 | 0 | 358 | 0ms |
| rabbi-member | mobile-390 | acceptable | 946ms | 576ms | 948ms | 1943ms | 7 | 0 | 0 | 0 | 155 | 0ms |
| member-library | mobile-390 | acceptable | 881ms | 568ms | 881ms | 1905ms | 6 | 0 | 0 | 0 | 86 | 0ms |
| one-time-classroom | mobile-390 | acceptable | 1001ms | 1000ms | 1001ms | 2106ms | 6 | 0 | 0 | 0 | 140 | 0ms |
| one-time-classroom-review | mobile-390 | acceptable | 808ms | 772ms | 808ms | 1838ms | 7 | 0 | 0 | 0 | 171 | 0ms |
| provider-review | mobile-390 | acceptable | 923ms | 872ms | 923ms | 1971ms | 8 | 0 | 0 | 0 | 911 | 0ms |
| student-review | mobile-390 | acceptable | 817ms | 788ms | 817ms | 1568ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | mobile-390 | acceptable | 854ms | 460ms | 855ms | 1869ms | 5 | 0 | 0 | 0 | 148 | 0ms |

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
