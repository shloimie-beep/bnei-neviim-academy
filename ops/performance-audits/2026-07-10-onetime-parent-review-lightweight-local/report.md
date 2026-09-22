# OneTime Live Lag Audit

Generated: 2026-07-09T21:36:04.362Z
Base URL: http://127.0.0.1:19111
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
| one-time-classroom-review | desktop-1440 | 1078ms | 26ms | none |
| one-time-classroom-review | mobile-390 | 950ms | 11ms | none |
| member-library | desktop-1440 | 630ms | 137ms | none |
| member-library | mobile-390 | 598ms | 109ms | none |
| student-review | mobile-390 | 578ms | 39ms | none |

## Worst Paint

| Route | Viewport | First contentful paint | Blockers |
|---|---:|---:|---|
| one-time | desktop-1440 | 92ms | none |
| one-time-mishnayos | desktop-1440 | 88ms | none |
| student-review | desktop-1440 | 76ms | none |
| provider-review | desktop-1440 | 56ms | none |
| one-time | mobile-390 | 56ms | none |

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
| one-time | desktop-1440 | acceptable | 72ms | 92ms | 74ms | 533ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | desktop-1440 | acceptable | 67ms | 88ms | 67ms | 560ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | desktop-1440 | acceptable | 46ms | 52ms | 48ms | 535ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | desktop-1440 | acceptable | 136ms | 36ms | 136ms | 630ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | desktop-1440 | acceptable | 32ms | 48ms | 32ms | 522ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | desktop-1440 | acceptable | 25ms | 40ms | 25ms | 1078ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | desktop-1440 | acceptable | 43ms | 56ms | 47ms | 556ms | 7 | 0 | 0 | 0 | 923 | 0ms |
| student-review | desktop-1440 | acceptable | 33ms | 76ms | 34ms | 561ms | 9 | 0 | 0 | 0 | 190 | 0ms |
| parent-review | desktop-1440 | acceptable | 25ms | 32ms | 25ms | 531ms | 4 | 0 | 0 | 0 | 147 | 0ms |
| one-time | mobile-390 | acceptable | 56ms | 56ms | 56ms | 551ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | mobile-390 | acceptable | 56ms | 56ms | 57ms | 550ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | mobile-390 | acceptable | 39ms | 48ms | 42ms | 529ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | mobile-390 | acceptable | 108ms | 36ms | 108ms | 598ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | mobile-390 | acceptable | 32ms | 40ms | 32ms | 515ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | mobile-390 | acceptable | 10ms | 48ms | 11ms | 950ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | mobile-390 | acceptable | 38ms | 32ms | 40ms | 544ms | 7 | 0 | 0 | 0 | 923 | 0ms |
| student-review | mobile-390 | acceptable | 37ms | 44ms | 38ms | 578ms | 9 | 0 | 0 | 0 | 190 | 0ms |
| parent-review | mobile-390 | acceptable | 20ms | 28ms | 20ms | 533ms | 4 | 0 | 0 | 0 | 147 | 0ms |

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
