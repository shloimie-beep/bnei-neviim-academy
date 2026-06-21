# One Time Vimeo Member Library Live Smoke - 2026-06-21T13:21:36.456Z

App: https://bneineviimacademy.org
Result: failed

## Steps
- PASS operations login (636ms)
- PASS manual Vimeo API workflow (3148ms)
- FAIL operations content library ui 1440px (32628ms) - page.waitForSelector: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-one-time-recording-vimeo-readiness]') to be visible[22m


## Summary
- vimeo_selected: true
- manual_vimeo_ready: true
- automated_upload_enabled: false
- temporary_class_created: true
- temporary_item_published: true
- temporary_item_rolled_back: true
- member_library_smoke_rolled_back: true
- operations_widths_checked: none
- member_library_widths_checked: none

No Vimeo upload, provider publish/unpublish/delete, email, WhatsApp, payment, Zoom meeting, participant invite, real member access grant, or external portal write was performed.
