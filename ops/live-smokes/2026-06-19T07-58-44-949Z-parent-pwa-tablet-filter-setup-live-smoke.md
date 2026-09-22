# Parent PWA Tablet Filter Setup Live Smoke - 2026-06-19T07:58:44.949Z

App: https://bneineviimacademy.org
Result: failed

## Checks
- FAIL live parent manifest is parent-scoped (15368ms) - manifest returned 502
- FAIL live parent page exposes install and setup contracts (15525ms) - parent.html returned 502
- FAIL live setup API remains parent-session gated (30553ms) - anonymous setup read expected 401, got 502
- FAIL mocked parent setup UI works at 390px (28202ms) - page.waitForSelector: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('[data-parent-section-panel="setup"]:not(.portal-section-hidden)') to be visible[22m
- FAIL mocked parent setup UI works at 820px (25435ms) - page.waitForSelector: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('[data-parent-section-panel="setup"]:not(.portal-section-hidden)') to be visible[22m

- FAIL mocked parent setup UI works at 1024px (25701ms) - page.waitForSelector: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for locator('[data-parent-section-panel="setup"]:not(.portal-section-hidden)') to be visible[22m
