# Stripe Walkthrough

Purpose: sandbox checkout proof, future live billing, product/price IDs,
webhooks, and no-real-charge validation.

1. Open `/integration-setup.html#stripe`.
2. Open https://dashboard.stripe.com/apikeys.
3. Stay in sandbox/test mode first.
4. Copy only variable names into repo notes:
   - `RABBI_STRIPE_MODE`
   - `RABBI_STRIPE_SECRET_KEY`
   - `RABBI_STRIPE_WEBHOOK_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_MODE`
   - `STRIPE_ACCOUNT_OWNER`
   - `STRIPE_PROVIDER_ACCOUNT`
5. Store key values only in the approved secret store.
6. Create or record non-secret product and price IDs for the selected offer.
7. Open https://dashboard.stripe.com/webhooks for webhook endpoint setup.
8. Store the webhook signing secret as `RABBI_STRIPE_WEBHOOK_SECRET`.
9. Run `npm run one-time:smoke:resend-vimeo-stripe`.
10. Expected success: test-mode readiness or preview evidence with
    `external_write_performed=false`.
11. No-real-charge guarantee: setup-center validation must not use live keys,
    create live checkout sessions, charge cards, refund, subscribe, or invoice.
12. Policy decisions still needed before live:
    - account owner;
    - product and price;
    - trial length;
    - cancellation;
    - refund;
    - tax;
    - grace period;
    - revenue ownership.
13. Live-mode acceptance requires explicit owner approval, live webhook setup,
    rollback plan, and a live smoke that proves the intended commit.
