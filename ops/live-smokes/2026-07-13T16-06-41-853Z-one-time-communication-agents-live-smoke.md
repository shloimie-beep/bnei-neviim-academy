# One Time Communication Agents Live Smoke - 2026-07-13T16:06:41.853Z

Base URL: https://join.onetimeonetime.com
Route: /api/bna/communication-agents?project_key=one_time_mishnah_class
Expected SHA: dab8c6d8ce23e0a2cda4d619d302ed32c6bac415
Result: passed

## Checks
- PASS deploy-info reports expected One Time SHA (674ms)
- PASS operations login uses One Time Railway auth fallback (2167ms)
- PASS communication agents API returns scoped read-only readiness (252ms)

## Guardrails
- Authenticated read-only smoke; no model call, WhatsApp send, checkout, access grant, task creation, or external write is performed.
- Report records counts, channel/provider names, no-send flags, deployment SHA, and redacted status only.
- No cookies, credentials, provider secrets, contact bodies, class links, or private messages are written to evidence.
