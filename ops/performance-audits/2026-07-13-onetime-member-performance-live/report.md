# One Time Member Portal Performance Live Smoke

Generated: 2026-07-13T19:41:43.271Z
Requirement: REQ-20260713-934
Packet: PKT-20260713-934A
Base URL: https://join.onetimeonetime.com
Expected/deployed SHA: 20307e2638988b6fe5d10b8a649d87ed8a8522cb

## Result

- PASS `/rabbi-member` returns exact deployed SHA and `target_app=one-time` headers.
- PASS first useful member portal content renders at 1440, 1024, 768, 430, and 390 widths.
- PASS the member assistant is deferred from first render and still opens on Helper click.
- PASS no external writes, production mutations, private data leaks, unexpected bad responses, failed requests, or horizontal overflow were observed.
- Note: an immediately post-deploy cold Playwright sample measured 3604ms wall DCL at 1440 before this warm exact-SHA retry; curl follow-up showed mostly 0.45-0.50s TTFB and 0.54-0.60s total with two slower connect/TLS samples.

## Timing

| Viewport | Wall DCL | Nav DCL | Screenshot |
|---|---:|---:|---|
| 1440-desktop | 998ms | 994ms | ops/performance-audits/2026-07-13-onetime-member-performance-live/screenshots/member-portal-live-1440-desktop.png |
| 1024-desktop-tablet | 756ms | 754ms | ops/performance-audits/2026-07-13-onetime-member-performance-live/screenshots/member-portal-live-1024-desktop-tablet.png |
| 768-tablet | 712ms | 710ms | ops/performance-audits/2026-07-13-onetime-member-performance-live/screenshots/member-portal-live-768-tablet.png |
| 430-mobile | 827ms | 825ms | ops/performance-audits/2026-07-13-onetime-member-performance-live/screenshots/member-portal-live-430-mobile.png |
| 390-mobile | 719ms | 717ms | ops/performance-audits/2026-07-13-onetime-member-performance-live/screenshots/member-portal-live-390-mobile.png |
