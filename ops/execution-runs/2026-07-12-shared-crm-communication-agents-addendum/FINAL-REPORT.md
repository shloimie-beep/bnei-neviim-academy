# Final Report - Current One Time Release Proof

Generated: 2026-07-13T19:31:00+03:00

## Current Live SHA

- One Time live SHA: `49f3edda2da37e3afd9bdf3056ab5f6fc91e981c`
- One Time Railway deployment: `fe180cfc-322c-46cc-acde-4e1314e42291`
- Runtime gate deploy proof SHA: `80b75432672d282855b350a2f7c5adc160e63623`
- Runtime gate Railway deployment: `74f45880-7a11-4b06-9632-d858843cb4fb`
- Live readback: `https://join.onetimeonetime.com/api/deploy-info`

## Completed Proof

- One Time signup/form fixes are already deployed and live-smoked in this run.
- Dedicated One Time app shell, route modules, performance instrumentation, regression gates, mobile CRM IA, Communication Agents UI, and Operations Communication Agents console are implemented and deployed.
- WAPI provider setup is ready with One Time scoped credentials, instance metadata, phone metadata, webhook secret, and class link.
- Public WhatsApp auto-reply remains fail-closed until `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` is explicitly approved.
- Rabbi Telegram dry-run readiness is ready via ignored runtime config; no Telegram send was performed.
- Resend preflight is ready, but owner-test sends are blocked by missing secure owner-test aliases.

## Verification

- `npm run bna:run:validate` passed.
- `npm run secrets:audit` passed.
- One Time exact-SHA separate-instance route matrix passed for `49f3edda2da37e3afd9bdf3056ab5f6fc91e981c`.
- Runtime deploy exact-SHA smokes passed:
  - `ops/live-smokes/2026-07-13T16-18-12-320Z-onetime-provider-route-module-live-smoke.md`
  - `ops/live-smokes/2026-07-13T16-18-59-085Z-rabbi-onetime-landing-smoke.md`
- No-send activation contract suites passed:
  - communication-agent/runtime/inbound/outbox/Resend/model suite: `39/39`
  - WAPI/Rabbi/provider-bot policy suite: `30/30`

## Performance Evidence

- Architecture baseline: `ops/performance-audits/2026-07-13-onetime-architecture-performance-baseline/report.md`
  - 160 samples, 0 skipped, 32 attention samples.
  - Public landing cold desktop FCP/LCP p95 `940ms`; mobile 390 throttled p95 `1588ms`.
  - Baseline identified shared Operations shell and missing DB/pool timing as the root engineering risks.
- Regression gates: `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md`
  - Status `PASSED`.
  - RUM, Server-Timing, trace/deploy headers, response-size timing, and route-transition instrumentation are present.
  - Current budget checks passed for RUM bytes, provider HTML, Operations shell/bootstrap, CRM route module, mailbox route module, and communications route module.

## CRM / Mobile Evidence

- Mobile CRM IA current-state audit: `ops/ui-audits/2026-07-13-onetime-mobile-crm-ia-current-state/report.md`
- Responsive screenshots are recorded for `1440`, `1024`, `768`, `430`, and `390` under:
  `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/`
- Current proof records list/detail/back behavior, max initial cards, no horizontal overflow, workspace-scope guard, and no failed requests/console/page errors.

## Redacted Integration Evidence

- WAPI readiness: `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.md`
- Owner-test readiness: `ops/watchdog-audits/2026-07-13T16-18-40-701Z-onetime-owner-test-readiness.md`
- Rabbi Telegram readiness: `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md`
- No raw destination, chat ID, token, class link, or private message body is recorded in tracked proof.

## Blockers

- `REQ-20260713-906` is blocked: secure `ONE_TIME_OWNER_TEST_EMAIL` and `ONE_TIME_OWNER_TEST_WHATSAPP` or approved aliases are not configured, so owner-only email/WhatsApp sends were not attempted.
- `REQ-20260712-313` is blocked: unrestricted public WhatsApp auto-reply still lacks explicit `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` approval.
- `REQ-20260713-910` is blocked because its live integration verifier depends on the owner-test alias gate.
- `REQ-20260712-314` cannot be marked Done until the blocked live-send/readback and final verifier sections are unblocked.

## Guardrails

- No owner-test email send, WhatsApp/WAPI provider send, Telegram send, public auto-reply activation, CRM production write, payment/access mutation, raw destination/chat/token logging, or destructive production mutation was performed by this final-report proof.
