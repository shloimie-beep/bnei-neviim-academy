# OneTime Live Lag Audit

Generated: 2026-07-09T21:21:32.237Z
Base URL: https://join.onetimeonetime.com
External write performed: false
Production data mutation performed: false

## Summary

- Routes sampled: 9
- Viewports sampled: 2
- Total samples: 18
- Samples needing attention: 1

## Blocker Counts

- slow_dom_content_loaded: 1

## Worst Network Idle

| Route | Viewport | Network idle | Goto | Blockers |
|---|---:|---:|---:|---|
| parent-review | desktop-1440 | 3701ms | 2882ms | slow_dom_content_loaded |
| one-time | desktop-1440 | 1950ms | 1482ms | none |
| one-time-classroom-review | desktop-1440 | 1898ms | 814ms | none |
| provider-review | desktop-1440 | 1770ms | 1122ms | none |
| one-time-classroom-review | mobile-390 | 1769ms | 775ms | none |

## Worst Paint

| Route | Viewport | First contentful paint | Blockers |
|---|---:|---:|---|
| parent-review | desktop-1440 | 2476ms | slow_dom_content_loaded |
| provider-review | desktop-1440 | 1032ms | none |
| provider-review | mobile-390 | 980ms | none |
| one-time | desktop-1440 | 900ms | none |
| one-time | mobile-390 | 808ms | none |

## Worst Main Thread Work

| Route | Viewport | Long task total | Long task max | Blockers |
|---|---:|---:|---:|---|
| one-time | desktop-1440 | 76ms | 76ms | none |
| one-time-mishnayos | desktop-1440 | 0ms | 0ms | none |
| rabbi-member | desktop-1440 | 0ms | 0ms | none |
| member-library | desktop-1440 | 0ms | 0ms | none |
| one-time-classroom | desktop-1440 | 0ms | 0ms | none |

## Per-Route Results

| Route | Viewport | Status | DCL | FCP | Load | Network idle | Requests | API slow | Failed | Console errors | DOM nodes | Long tasks |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| one-time | desktop-1440 | acceptable | 1480ms | 900ms | 1480ms | 1950ms | 10 | 0 | 0 | 0 | 226 | 76ms |
| one-time-mishnayos | desktop-1440 | acceptable | 1098ms | 500ms | 1098ms | 1607ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | desktop-1440 | acceptable | 837ms | 492ms | 839ms | 1330ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | desktop-1440 | acceptable | 813ms | 548ms | 813ms | 1314ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | desktop-1440 | acceptable | 820ms | 796ms | 888ms | 1399ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | desktop-1440 | acceptable | 812ms | 732ms | 812ms | 1898ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | desktop-1440 | acceptable | 1120ms | 1032ms | 1120ms | 1770ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | desktop-1440 | acceptable | 803ms | 792ms | 803ms | 1544ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | desktop-1440 | needs_attention | 2880ms | 2476ms | 3195ms | 3701ms | 9 | 0 | 0 | 0 | 201 | 0ms |
| one-time | mobile-390 | acceptable | 1264ms | 808ms | 1264ms | 1758ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | mobile-390 | acceptable | 904ms | 500ms | 921ms | 1425ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | mobile-390 | acceptable | 878ms | 504ms | 879ms | 1372ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | mobile-390 | acceptable | 758ms | 496ms | 758ms | 1256ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | mobile-390 | acceptable | 812ms | 772ms | 812ms | 1318ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | mobile-390 | acceptable | 775ms | 700ms | 775ms | 1769ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | mobile-390 | acceptable | 1062ms | 980ms | 1062ms | 1711ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | mobile-390 | acceptable | 799ms | 760ms | 799ms | 1543ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | mobile-390 | acceptable | 910ms | 732ms | 910ms | 1708ms | 9 | 0 | 0 | 0 | 201 | 0ms |

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
