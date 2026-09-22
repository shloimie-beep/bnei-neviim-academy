# Final Register Surfaces Live Smoke - 2026-06-21T17:26:37.835Z

App: https://bneineviimacademy.org
Result: failed

## Steps
- PASS public health endpoint (1641ms)
- FAIL provider public and portal routes expose directory, join, classroom, and plan markers (1568ms) - /service-providers missing markers: Become a Service Provider

## Summary
- provider_routes_checked: 0
- operations_markers_checked: 0
- helper_tools_present: none
- recording_raw_intake_id: none
- calendar_events_loaded: 0
- automations_loaded: 0

Guardrail: this smoke performs dry-run parser checks and read-only surface checks only. It does not create Google Classroom courses, send reminders, publish content, charge payments, sync external connectors, or expose raw secrets.
