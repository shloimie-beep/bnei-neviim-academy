# Google Integrations Module Local Smoke

- Route: `/operations?view=integrations&section=google&workspace=platform`
- Result: PASS
- Auth: Operations login API using local env values (values not printed)
- Verified canonical `Operations > Integrations > Google` route marker.
- Verified Google Drive, Calendar, Classroom, Business Profile cards.
- Verified Google Live Adapter Approval Packet and Google Action Audit are visible.
- Verified desktop Google card rows stay within their cards after responsive wrapping.
- Screenshots: `desktop.png`, `mobile.png`
- Guardrail: no Google API read/write, connector write, send, or external write was executed; this was page render/readback only.
