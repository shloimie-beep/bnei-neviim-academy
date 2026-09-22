# Module Scoping Local Smoke - 2026-06-18

Result: passed

Checked local Operations on http://127.0.0.1:8093 with throwaway local Operations credentials.

## Assertions
- BNA Community renders BNA workspace copy, not Mishnayos/One Time copy.
- BNA Community WS11 API requests include `project_key=bna`.
- BNA Content hides the One Time Library tab and does not load One Time-only APIs.
- BNA Live Classes shows workspace-only copy, no Member Portal button, and requests `project_key=bna`.
- Rabbi/One Time workspace still shows One Time Community and Live Classes member portal.
- No body/document horizontal overflow at checked mobile and desktop viewports.

## Screenshots
- bna-community-mobile: ops/playwright-smokes/2026-06-18-module-scoping-local/bna-community-mobile.png
- bna-content-desktop: ops/playwright-smokes/2026-06-18-module-scoping-local/bna-content-desktop.png
- bna-live-classes-mobile: ops/playwright-smokes/2026-06-18-module-scoping-local/bna-live-classes-mobile.png
- onetime-community-desktop: ops/playwright-smokes/2026-06-18-module-scoping-local/onetime-community-desktop.png
- onetime-live-classes-desktop: ops/playwright-smokes/2026-06-18-module-scoping-local/onetime-live-classes-desktop.png
