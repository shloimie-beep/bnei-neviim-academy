# BNA Cache Policy Header Readback

Generated: 2026-07-09T21:27:41.262Z
Base URL: https://bneineviimacademy.org
Deployment: b9cd16e1-ac80-4310-9c42-c87541a0343c
Commit: f791a5db
External write performed: false
Production data mutation performed: false

| Path | Status | Cache-Control | Content-Type | Server | Railway edge |
|---|---:|---|---|---|---|
| /js/bna-bot-widget.js | 200 | public, max-age=300, must-revalidate | application/javascript; charset=UTF-8 | railway-edge |  |
| /css/one-time-shared-review.css | 200 | public, max-age=300, must-revalidate | text/css; charset=UTF-8 | railway-edge |  |
| /images/one-time/brand/onetimelogo.webp | 200 | public, max-age=86400, stale-while-revalidate=604800 | image/webp | railway-edge |  |
| / | 200 | no-store | text/html; charset=UTF-8 | railway-edge |  |
| /sw.js | 200 | no-store | application/javascript; charset=UTF-8 | railway-edge |  |
| /manifest.json | 200 | no-store | application/json; charset=UTF-8 | railway-edge |  |
| /js/operations-shell.js | 200 | private, no-cache, max-age=0, must-revalidate | application/javascript; charset=UTF-8 | railway-edge |  |
| /js/operations-deferred-renderers.js | 200 | private, no-cache, max-age=0, must-revalidate | application/javascript; charset=UTF-8 | railway-edge |  |
| /api/health | 200 |  | application/json; charset=utf-8 | railway-edge |  |

## Interpretation

- BNA production is serving the same public static cache policy as OneTime.
- HTML, service worker, manifests, and Operations shell assets remain no-store/no-cache.
- /api/health returned OK with database connected.
- Read-only HEAD/GET requests only; no forms, sends, payments, credentials, or production data mutations.
