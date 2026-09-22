# Google Integrations Module Live Smoke

- Route: `https://bneineviimacademy.org/operations?view=integrations&section=google&workspace=platform`
- Result: PASS
- Deployment: `1a60aabe-b1a7-4adc-a788-de4e71abd0bd`
- Auth: Operations login API using local env values (values not printed)
- Verified canonical `Operations > Integrations > Google` route marker.
- Verified Google Drive, Calendar, Classroom, Business Profile cards.
- Verified Google Live Adapter Approval Packet and Google Action Audit are visible.
- Verified desktop Google card rows stay within their cards after responsive wrapping.
- Screenshots: `desktop.png`, `mobile.png`
- Guardrail: no Google API read/write, connector write, send, or external write was executed; this was page render/readback only.
