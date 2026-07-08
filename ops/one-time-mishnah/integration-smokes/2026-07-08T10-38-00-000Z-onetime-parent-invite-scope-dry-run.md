# OneTime Parent Invite Scope Dry Run - 2026-07-08T10:38:00.000Z

App: `https://bneineviimacademy.org`

Deployment: `9b4ae9c8-8c38-4888-a8c9-f19b918eec3b`

Commit: `3e4c6cae98eee543f6e60907e20c478051583ea7`

Route: `POST /api/bna/one-time/parent-trial-invite`

Result: passed

## Checks

- PASS dry run returned HTTP `200`.
- PASS `no_send` was `true`.
- PASS `external_write_performed` was `false`.
- PASS `local_write_performed` was `false`.
- PASS preview base URL was `https://join.onetimeonetime.com`.
- PASS preview parent portal URL was `https://join.onetimeonetime.com/parent`.
- PASS preview member library URL was `https://join.onetimeonetime.com/member-library`.
- PASS preview classroom URL was `https://join.onetimeonetime.com/one-time-classroom`.
- PASS live-shiur link support was included when a dummy HTTPS Zoom URL was supplied.

## Guardrails

- No live email sent.
- No local database write performed.
- No external provider write performed.
- No real recipient email address used.
- Dummy HTTPS Zoom URL used only to verify validation/preview behavior.

## Remaining Blocker

Live parent invite resend remains blocked until the exact current Zoom join URL
for tonight's shiur is provided or discoverable through a trusted configured
alias.
