# Deployment

Deployment status: blocked pending explicit Railway service target.

Local implementation and verification passed. The UI-only branch was committed, pushed, and opened as draft PR #51:
`https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`.

Live deployment is blocked by the Railway target guard. `npm run railway:doctor` authenticated successfully, but resolved the local target to project `one-time-production` with no explicit service name/id and aborted with:

- `Railway target requires explicit service ID or service name; no production fallback is allowed.`
- `BNA deploy target resolves to One Time project/service; aborting.`

Per the BNA Definition of Done, `REQ-20260629-202` through `REQ-20260629-210` remain blocked instead of Done until deployment and live smoke proof exist.

Exact next action: confirm the Railway production service ID/name for `bneineviimacademy.org`, or release PR #51 through the approved normal production path, then run live smoke for the Rabbi One Time Operations dashboard, communications, members, program, tasks, automations, integrations, and reporting routes.

Guardrails: no email, WhatsApp, SMS, Telegram report, Stripe checkout, payment charge, DNS/service config change, external CRM write, contact import, secret commit, or raw private data commit was performed.
