# Deployment

Deployment status: deployed and live-smoked.

Local implementation and verification passed. The UI-only branch was committed, pushed, opened as draft PR #51, deployed to Railway production, and live-smoked:

- Branch: `codex/rabbi-onetime-comms-scope-release-20260629`
- Commit: `54a5124d24131c4062ecc6cd645ca91249682288`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/51`
- Railway project/environment/service: `skillful-motivation` / `production` / `skillful-motivation`
- Railway deployment: `3033033b-5275-49b5-89ac-15b76eecc232`
- Domain: `https://bneineviimacademy.org`
- Live smoke: `ops/live-smokes/2026-06-29-onetime-ui-shell-repair-live/report.md`

The first deploy attempt exposed a real live 500 from `/api/bna/communications/dns-tasks`; it was caused by the generic `/api/bna/communications/:id` route swallowing `dns-tasks`. The route is now numeric-only, the endpoint returns 200, and the final live smoke passed with 0 failed responses, request failures, console errors, or page errors.

Per the BNA Definition of Done, `REQ-20260629-202` through `REQ-20260629-210` are now Done.

Exact next action: none for this UI shell run. Keep contact import, email audience import, DNS/account setup, Stripe/payment, WAPI import, sends, external CRM/GHL, and secrets in separate approval-gated packets.

Guardrails: no email, WhatsApp, SMS, Telegram report, Stripe checkout, payment charge, DNS/service config change, external CRM write, contact import, secret commit, raw private data commit, or live screenshot commit was performed.
