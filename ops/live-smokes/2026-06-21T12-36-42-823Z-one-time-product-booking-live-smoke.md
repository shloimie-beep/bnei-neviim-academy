# One Time Product Booking Live Smoke - 2026-06-21T12:36:42.823Z

App: https://bneineviimacademy.org
Result: failed

## Steps
- PASS operations login (1520ms)
- PASS product-system api and internal records (4673ms)
- FAIL operations schedule ui 1440px (62017ms) - page.waitForSelector: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#oneTimeAppointmentType') to be visible[22m
[2m    62 × locator resolved to hidden <select tabindex="-1" aria-hidden="true" class="app-select-native" id="oneTimeAppointmentType" data-app-select-enhanced="true">…</select>[22m


## Summary
- product_offers_readable: true
- availability_readable: true
- portal_foundations_readable: true
- internal_class_event_created: true
- internal_appointment_intent_created: true
- external_write_performed: false
- zoom_meeting_created: false
- runtime_widths_checked: 

Only internal One Time class-event and appointment-intent records were created. No payment, invoice, email, WhatsApp, Zoom meeting, access grant, participant invite, upload, or external calendar write was performed.
