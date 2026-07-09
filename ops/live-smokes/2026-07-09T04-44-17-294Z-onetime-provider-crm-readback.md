# OneTime Provider CRM Live Readback

- Generated: 2026-07-09T04:44:17Z
- Base URL: https://join.onetimeonetime.com
- Deployment: 190cd07c-e191-4347-bb2f-6c336cd824f9
- Result: PASS

```json
[
  {
    "path": "/provider.html",
    "status": 200,
    "checks": {
      "hasCrmWorkbench": true,
      "hasSanitizer": true,
      "hasCrmCss": true,
      "hasCompactHelperCss": false,
      "hasRabbiHelper": false,
      "hasOneTimeScope": true
    }
  },
  {
    "path": "/css/one-time-shared-review.css",
    "status": 200,
    "checks": {
      "hasCrmWorkbench": true,
      "hasSanitizer": false,
      "hasCrmCss": true,
      "hasCompactHelperCss": false,
      "hasRabbiHelper": false,
      "hasOneTimeScope": false
    }
  },
  {
    "path": "/js/bna-bot-widget.js",
    "status": 200,
    "checks": {
      "hasCrmWorkbench": false,
      "hasSanitizer": false,
      "hasCrmCss": false,
      "hasCompactHelperCss": true,
      "hasRabbiHelper": true,
      "hasOneTimeScope": false
    }
  },
  {
    "path": "/api/one-time/instance-config",
    "status": 200,
    "checks": {
      "hasCrmWorkbench": false,
      "hasSanitizer": false,
      "hasCrmCss": false,
      "hasCompactHelperCss": false,
      "hasRabbiHelper": false,
      "hasOneTimeScope": true
    }
  }
]
```
