# OneTime Live Lag Audit

Generated: 2026-07-09T18:40:31.025Z
Base URL: https://join.onetimeonetime.com
External write performed: false
Production data mutation performed: false

## Summary

- Routes sampled: 9
- Viewports sampled: 2
- Total samples: 18
- Samples needing attention: 18

## Blocker Counts

- slow_dom_content_loaded: 18
- slow_first_contentful_paint: 18
- slow_initial_navigation: 5
- slow_network_idle: 2

## Worst Network Idle

| Route | Viewport | Network idle | Goto | Blockers |
|---|---:|---:|---:|---|
| member-library | mobile-390 | 7085ms | 6600ms | slow_initial_navigation, slow_network_idle, slow_dom_content_loaded, slow_first_contentful_paint |
| student-review | mobile-390 | 6740ms | 5848ms | slow_initial_navigation, slow_network_idle, slow_dom_content_loaded, slow_first_contentful_paint |
| parent-review | desktop-1440 | 5671ms | 4901ms | slow_initial_navigation, slow_dom_content_loaded, slow_first_contentful_paint |
| one-time-classroom-review | desktop-1440 | 5464ms | 3572ms | slow_dom_content_loaded, slow_first_contentful_paint |
| one-time-classroom-review | mobile-390 | 5354ms | 2841ms | slow_dom_content_loaded, slow_first_contentful_paint |

## Worst Paint

| Route | Viewport | First contentful paint | Blockers |
|---|---:|---:|---|
| student-review | mobile-390 | 5428ms | slow_initial_navigation, slow_network_idle, slow_dom_content_loaded, slow_first_contentful_paint |
| parent-review | desktop-1440 | 4560ms | slow_initial_navigation, slow_dom_content_loaded, slow_first_contentful_paint |
| provider-review | mobile-390 | 3896ms | slow_dom_content_loaded, slow_first_contentful_paint |
| rabbi-member | desktop-1440 | 3720ms | slow_initial_navigation, slow_dom_content_loaded, slow_first_contentful_paint |
| one-time-mishnayos | mobile-390 | 3616ms | slow_dom_content_loaded, slow_first_contentful_paint |

## Worst Main Thread Work

| Route | Viewport | Long task total | Long task max | Blockers |
|---|---:|---:|---:|---|
| one-time-mishnayos | mobile-390 | 63ms | 63ms | slow_dom_content_loaded, slow_first_contentful_paint |
| one-time | desktop-1440 | 0ms | 0ms | slow_dom_content_loaded, slow_first_contentful_paint |
| one-time-mishnayos | desktop-1440 | 0ms | 0ms | slow_initial_navigation, slow_dom_content_loaded, slow_first_contentful_paint |
| rabbi-member | desktop-1440 | 0ms | 0ms | slow_initial_navigation, slow_dom_content_loaded, slow_first_contentful_paint |
| member-library | desktop-1440 | 0ms | 0ms | slow_dom_content_loaded, slow_first_contentful_paint |

## Per-Route Results

| Route | Viewport | Status | DCL | FCP | Load | Network idle | Requests | API slow | Failed | Console errors | DOM nodes | Long tasks |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| one-time | desktop-1440 | needs_attention | 3752ms | 2988ms | 3753ms | 4246ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | desktop-1440 | needs_attention | 4838ms | 3000ms | 4838ms | 5349ms | 9 | 0 | 0 | 0 | 226 | 0ms |
| rabbi-member | desktop-1440 | needs_attention | 4624ms | 3720ms | 4626ms | 5128ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | desktop-1440 | needs_attention | 3064ms | 2624ms | 3064ms | 3557ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | desktop-1440 | needs_attention | 2733ms | 2576ms | 2733ms | 3233ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | desktop-1440 | needs_attention | 3570ms | 3496ms | 3570ms | 5464ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | desktop-1440 | needs_attention | 3823ms | 3216ms | 3824ms | 4311ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | desktop-1440 | needs_attention | 4012ms | 3556ms | 4013ms | 4953ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | desktop-1440 | needs_attention | 4900ms | 4560ms | 5153ms | 5671ms | 9 | 0 | 0 | 0 | 201 | 0ms |
| one-time | mobile-390 | needs_attention | 3284ms | 2536ms | 3284ms | 3793ms | 10 | 0 | 0 | 0 | 226 | 0ms |
| one-time-mishnayos | mobile-390 | needs_attention | 4498ms | 3616ms | 4499ms | 4987ms | 9 | 0 | 0 | 0 | 226 | 63ms |
| rabbi-member | mobile-390 | needs_attention | 3527ms | 3088ms | 3530ms | 4017ms | 6 | 0 | 0 | 0 | 144 | 0ms |
| member-library | mobile-390 | needs_attention | 6598ms | 2768ms | 6598ms | 7085ms | 4 | 0 | 0 | 0 | 71 | 0ms |
| one-time-classroom | mobile-390 | needs_attention | 2771ms | 2716ms | 2771ms | 3262ms | 5 | 0 | 0 | 0 | 139 | 0ms |
| one-time-classroom-review | mobile-390 | needs_attention | 2839ms | 2808ms | 2839ms | 5354ms | 7 | 0 | 0 | 0 | 166 | 0ms |
| provider-review | mobile-390 | needs_attention | 4224ms | 3896ms | 4249ms | 4729ms | 7 | 0 | 0 | 0 | 909 | 0ms |
| student-review | mobile-390 | needs_attention | 5847ms | 5428ms | 5847ms | 6740ms | 9 | 0 | 0 | 0 | 191 | 0ms |
| parent-review | mobile-390 | needs_attention | 3383ms | 3272ms | 3384ms | 4436ms | 9 | 0 | 0 | 0 | 201 | 0ms |

## Interpretation

- `slow_network_idle` usually points to late resources, slow API calls, or widgets continuing work after the page appears.
- `main_thread_long_tasks` points to JavaScript work that can make taps/typing feel laggy.
- `heavy_dom` points to too much rendered markup and is often paired with layout jank.
- Direct TTFB readback is captured in `ops/performance-audits/2026-07-09-onetime-live-lag-audit/ttfb-readback.md`.
- The strongest signal is slow and variable first-byte response timing across HTML, static assets, and small API routes, not a heavy DOM or obvious main-thread jank problem.
- First fix target: runtime/hosting responsiveness and cache/static delivery policy. Continue UI chrome polish separately after active app-visible edit lanes clear.
- This audit did not submit forms, send messages, create accounts, charge payments, mutate provider records, or log into private Operations.

## Guardrails

- No forms were submitted.
- No login, payment, checkout, access grant, email, WhatsApp, Telegram, DNS, Drive, Vimeo, Zoom, provider, credential, or production-data mutation was performed.
- Private Operations routes were intentionally excluded from this live lag audit.
- Screenshots, if requested, are limited to public/review surfaces.
