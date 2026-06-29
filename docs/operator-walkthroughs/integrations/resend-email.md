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
   - `RESEND_PROFILE`
   - `RESEND_API_KEY`
   - `RESEND_WEBHOOK_SECRET`
   - `RESEND_DOMAIN`
   - `RESEND_FROM`
   - `RESEND_FROM_EMAIL`
   - `RESEND_FROM_NAME`
   - `RESEND_REPLY_TO`
   - `RESEND_ACCOUNT_OWNER`
   - `RESEND_SHLOIMIE_API_KEY`
   - `RESEND_RABBI_ACCOUNT_OWNER`
   - `RESEND_RABBI_PROVIDER_ACCOUNT`
   - `RESEND_RABBI_API_KEY`
   - `RESEND_RABBI_DOMAIN`
   - `RESEND_RABBI_FROM`
   - `RESEND_RABBI_FROM_EMAIL`
   - `RESEND_RABBI_FROM_NAME`
   - `RESEND_RABBI_REPLY_TO`
8. Store secrets only in approved secret storage.
9. For OneTimeOneTime, the intended non-secret identity is
   `onetimeonetime.com`, `info@onetimeonetime.com`, display name
   `OneTimeOneTime Mishnah`, and reply-to `info@onetimeonetime.com`.
10. Configure the Resend `email.received` webhook to
    `https://bneineviimacademy.org/api/resend/inbound` after the app deploy is
    live.
11. Run `npm run email:smoke`.
12. Expected success: connected/domain status appears without printing keys.
13. External effects: health/domain checks are read-only; sending requires
    `SEND_RESEND_EMAIL`.
14. Live acceptance requires verified domain or explicit fallback approval,
    webhook secret, draft review, exact send approval, no-Zoho/no-DNS mutation
    unless separately approved, and live smoke. Inbound acceptance also
    requires a signed webhook replay or approved inbound test that creates a
    scoped Operations CRM communication row without any outbound send.
