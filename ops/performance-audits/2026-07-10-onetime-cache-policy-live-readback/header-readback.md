# OneTime Cache Policy Header Readback

Generated: 2026-07-09T21:21:52.186Z
Base URL: https://join.onetimeonetime.com
Deployment: 50533728-970f-4936-bc14-bbe439992f6e
Commit: 4908c905
External write performed: false
Production data mutation performed: false

| Path | Status | Cache-Control | Content-Type | Server | Railway edge |
|---|---:|---|---|---|---|
| /js/bna-bot-widget.js | 200 | public, max-age=300, must-revalidate | application/javascript; charset=UTF-8 | railway-hikari | ams1 |
| /css/one-time-shared-review.css | 200 | public, max-age=300, must-revalidate | text/css; charset=UTF-8 | railway-hikari | ams1 |
| /images/one-time/brand/onetimelogo.webp | 200 | public, max-age=86400, stale-while-revalidate=604800 | image/webp | railway-hikari | ams1 |
| /one-time/ | 200 | no-store | text/html; charset=UTF-8 | railway-hikari | ams1 |
| /sw.js | 200 | no-store | application/javascript; charset=UTF-8 | railway-hikari | ams1 |
| /manifest.json | 200 | no-store | application/json; charset=UTF-8 | railway-hikari | ams1 |
| /js/operations-shell.js | 200 | private, no-cache, max-age=0, must-revalidate | application/javascript; charset=UTF-8 | railway-hikari | ams1 |
| /js/operations-deferred-renderers.js | 200 | private, no-cache, max-age=0, must-revalidate | application/javascript; charset=UTF-8 | railway-hikari | ams1 |

## Interpretation

- Public JS/CSS assets use the intended short public cache.
- Public media uses the intended longer media cache.
- HTML, service worker, manifests, and Operations shell assets remain no-store/no-cache.
- Read-only HEAD requests only; no forms, sends, payments, credentials, or production data mutations.
