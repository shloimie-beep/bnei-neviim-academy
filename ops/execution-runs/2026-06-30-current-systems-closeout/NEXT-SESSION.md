# Next Session

`RAW-20260701-004` executed the previously generated runnable packets:

- Rabbi / One Time visual audit:
  `ops/ui-audits/2026-07-01-rabbi-onetime-current-state/report.md`.
- Resend smoke/readback:
  `ops/provider-config-readbacks/2026-07-01-resend-smoke-readback.md`.
- Railway target readback:
  `ops/deploy-readbacks/2026-07-01-railway-target-readback.md`.

Open blocked requirement from this run: `REQ-20260630-203`.

Updated Resend status:

1. `onetimeonetime.com` is listed by the connected Resend account as
   `verified`.
2. A guarded one-off test send from
   `OneTimeOneTime Mishnah <info@onetimeonetime.com>` to an official redacted
   Resend test recipient succeeded and read back as `delivered`.
3. App/live health still checks the BNA domain and reports send blocked.
4. `RESEND_WEBHOOK_SECRET` is not configured, so `/api/resend/inbound` refuses
   unsigned/signed-missing webhook probes safely.

Exact next setup actions:

1. Persist One Time sender config in Railway/keyholder:
   `RESEND_RABBI_DOMAIN=onetimeonetime.com`,
   `RESEND_RABBI_FROM_EMAIL=info@onetimeonetime.com`,
   `RESEND_RABBI_FROM_NAME=OneTimeOneTime Mishnah`,
   `RESEND_RABBI_REPLY_TO=info@onetimeonetime.com`.
2. Install `RESEND_WEBHOOK_SECRET` for
   `https://bneineviimacademy.org/api/resend/inbound`.
3. Persist Railway deploy target values or pass them at deploy time:
   `BNA_RAILWAY_PROJECT_NAME=skillful-motivation`,
   `BNA_RAILWAY_SERVICE_NAME=skillful-motivation`,
   `BNA_RAILWAY_ENVIRONMENT_NAME=production`,
   `BNA_RAILWAY_CUSTOM_DOMAIN=bneineviimacademy.org`.
4. Review visual audit screenshots with Shloimie, then generate
   `02-brand-kit-and-design-reference-alignment` and
   `03-ia-nav-filter-cleanup` implementation packets.

Do not run bulk real email, WhatsApp, SMS, Telegram, Buffer campaign, DNS,
payment, account/access, external CRM/GHL, Drive write, raw transcript export,
AI/paid transcription, score/progress/grading, or class backfill writes without
explicit approval.
