# Next Session

No local closeout work remains.

Open blocked requirement: `REQ-20260630-203`.

External-only resume steps:

1. If Shloimie confirms Resend setup, verify `RESEND_FROM_EMAIL`,
   `RESEND_WEBHOOK_SECRET`, and the Resend `email.received` webhook to
   `https://bneineviimacademy.org/api/resend/inbound`.
2. If Shloimie approves signed inbound replay/readback, run the signed Resend
   inbound verification without committing raw provider bodies.
3. If Shloimie provides a safe test recipient and approves a real send, run one
   guarded `npm run email:smoke` and record the result.

Do not run real email, WhatsApp, SMS, Telegram, Buffer, campaign, DNS,
payment, account/access, external CRM/GHL, Drive write, raw transcript export,
AI/paid transcription, score/progress/grading, or class backfill writes without
explicit approval.
