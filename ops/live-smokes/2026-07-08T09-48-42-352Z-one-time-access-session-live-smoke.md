# One Time Access Session UX Live Smoke
Status: passed
Deployment: 67a09a61-ad98-4f70-99a3-a5b2b6ecc562
Commit: 00d2da52
Base URL: https://bneineviimacademy.org
Routes: /member-library?code=SMOKE-ACCESS-UX and /one-time-classroom?code=SMOKE-ACCESS-UX
Screenshots: ops/live-smokes/2026-07-08T09-48-42-352Z-one-time-access-session-live-smoke-member-1440.png, ops/live-smokes/2026-07-08T09-48-42-352Z-one-time-access-session-live-smoke-classroom-1440.png, ops/live-smokes/2026-07-08T09-48-42-352Z-one-time-access-session-live-smoke-member-390.png, ops/live-smokes/2026-07-08T09-48-42-352Z-one-time-access-session-live-smoke-classroom-390.png
## Checks
- PASS member-html-status-ok status=200
- PASS member-html-marker-Current One Time access
- PASS member-html-marker-Use fallback access code
- PASS member-html-marker-Fallback access code
- PASS member-html-marker-setAccessPanelState
- PASS member-html-marker-currentAccessCode()
- PASS member-html-marker-Secure access required
- PASS classroom-html-status-ok status=200
- PASS classroom-html-marker-Current One Time access
- PASS classroom-html-marker-Use fallback access code
- PASS classroom-html-marker-Fallback access code
- PASS classroom-html-marker-setAccessPanelState
- PASS classroom-html-marker-document.body.classList.add('one-time-review-active', 'one-time-classroom-review-shell')
- PASS classroom-old-test-only-copy-absent
- PASS member-no-horizontal-overflow-1440 overflow=0
- PASS member-classroom-cta-carries-code-1440 href=/one-time-classroom?code=SMOKE-ACCESS-UX
- PASS classroom-no-horizontal-overflow-1440 overflow=0
- PASS classroom-normal-route-not-review-shell-1440
- PASS classroom-connected-access-panel-1440
- PASS classroom-fallback-closed-after-secure-access-1440
- PASS classroom-zero-eager-iframes-1440
- PASS classroom-fallback-open-without-current-access-1440
- PASS console-errors-1440
- PASS member-no-horizontal-overflow-390 overflow=0
- PASS member-classroom-cta-carries-code-390 href=/one-time-classroom?code=SMOKE-ACCESS-UX
- PASS classroom-no-horizontal-overflow-390 overflow=0
- PASS classroom-normal-route-not-review-shell-390
- PASS classroom-connected-access-panel-390
- PASS classroom-fallback-closed-after-secure-access-390
- PASS classroom-zero-eager-iframes-390
- PASS classroom-fallback-open-without-current-access-390
- PASS console-errors-390
## Guardrails
- Production smoke used live HTML/static assets and mocked only member-safe API payloads in the browser. No production database mutation, external send, upload, publish, payment, access grant, DNS, OAuth, or secret request was performed.