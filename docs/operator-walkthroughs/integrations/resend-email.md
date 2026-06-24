# Resend / Email Walkthrough

Purpose: email drafts, sender-domain readiness, DNS tasks, webhook events, and
gated sends.

1. Open `/integration-setup.html#resend-email`.
2. Open https://resend.com/api-keys.
3. Create a sending key or choose the existing approved account.
4. Open https://resend.com/domains.
5. Add or confirm the sender domain.
6. Copy exact DNS records from Resend; do not infer records from screenshots.
7. Use these variable names:
   - `RESEND_API_KEY`
   - `RESEND_WEBHOOK_SECRET`
   - `RESEND_DOMAIN`
   - `RESEND_FROM`
   - `RESEND_FROM_EMAIL`
   - `RESEND_FROM_NAME`
   - `RESEND_REPLY_TO`
   - `RESEND_ACCOUNT_OWNER`
   - `RESEND_SHLOIMIE_API_KEY`
   - `RESEND_RABBI_API_KEY`
8. Store secrets only in approved secret storage.
9. Run `npm run email:smoke`.
10. Expected success: connected/domain status appears without printing keys.
11. External effects: health/domain checks are read-only; sending requires
    `SEND_RESEND_EMAIL`.
12. Live acceptance requires verified domain or explicit fallback approval,
    webhook secret, draft review, exact send approval, and live smoke.
