# Assistant Tool-Parity Playwright Smoke

Date: 2026-06-14T11:25:41.462Z
URL: http://127.0.0.1:8099

Result: PASS

Assertions:
- Assistant opens as one chat panel.
- Panel has exactly two internal buttons: close and send.
- No Super Agent/cards/prompt chips/history/mode controls are rendered.
- Chat submit is interactive through a mocked response, so no real chat record is created.
- Widget sends `mode: safe`; adaptive tool routing is server-side.
- Operations route was checked after a local test ops login.
- No horizontal overflow at 390, 768, or 1024 px.

Checked surfaces:
- phone-390 /parent.html: one chat interface, safe-mode payload, mocked response, no overflow
- phone-390 /student.html: one chat interface, safe-mode payload, mocked response, no overflow
- phone-390 /provider.html: one chat interface, safe-mode payload, mocked response, no overflow
- phone-390 /operations: one chat interface, safe-mode payload, mocked response, no overflow
- phone-390 /signup-he.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-768 /parent.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-768 /student.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-768 /provider.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-768 /operations: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-768 /signup-he.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-1024 /parent.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-1024 /student.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-1024 /provider.html: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-1024 /operations: one chat interface, safe-mode payload, mocked response, no overflow
- tablet-1024 /signup-he.html: one chat interface, safe-mode payload, mocked response, no overflow

Screenshots:
- phone-390 /parent.html: phone-390-parent-html.png
- phone-390 /student.html: phone-390-student-html.png
- phone-390 /provider.html: phone-390-provider-html.png
- phone-390 /operations: phone-390-operations.png
- phone-390 /signup-he.html: phone-390-signup-he-html.png
- tablet-768 /parent.html: tablet-768-parent-html.png
- tablet-768 /student.html: tablet-768-student-html.png
- tablet-768 /provider.html: tablet-768-provider-html.png
- tablet-768 /operations: tablet-768-operations.png
- tablet-768 /signup-he.html: tablet-768-signup-he-html.png
- tablet-1024 /parent.html: tablet-1024-parent-html.png
- tablet-1024 /student.html: tablet-1024-student-html.png
- tablet-1024 /provider.html: tablet-1024-provider-html.png
- tablet-1024 /operations: tablet-1024-operations.png
- tablet-1024 /signup-he.html: tablet-1024-signup-he-html.png
