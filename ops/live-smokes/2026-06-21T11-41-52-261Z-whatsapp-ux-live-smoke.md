# WhatsApp UX Live Smoke - 2026-06-21T11:41:52.261Z

App: https://bneineviimacademy.org
Result: failed

## Steps
- PASS public health endpoint (729ms)
- PASS Operations WhatsApp workspace markers are deployed (1997ms)
- PASS workspace-scoped WAPI phonebook report hides raw payloads (803ms)
- PASS WhatsApp message readback stays no-send and hides raw provider payloads (250ms)
- PASS WAPI diagnostics are read-only (368ms)
- FAIL Operations WhatsApp runtime UX renders at desktop and mobile widths (33933ms) - page.waitForSelector: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('[data-wapi-three-pane-workspace]') to be visible[22m


## Summary
- operations_markers_checked: 11
- phonebook_scope: workspace
- raw_payload_hidden: true
- wapi_sync_configured: true
- external_send_performed: false
- runtime_widths_checked: none
