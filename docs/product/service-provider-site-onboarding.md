# Service Provider Site Onboarding

Use this checklist before adding or promoting a service-provider site.

1. Create a brand config under `config/brands/`.
2. Create a site config under `config/service-provider-sites/`.
3. Add approved committed assets under `public/images/<provider>/`.
4. Add route-registry coverage for every public and review route.
5. Add action-registry coverage for every visible CTA, form, login link, preview link, and disabled/coming-soon control.
6. Add tests for brand config, route scope, asset paths, no-send/no-charge guardrails, and privacy strings.
7. Run route/action/security/watchdog checks.
8. Deploy and live smoke only after the shared app branch is committed and pushed.

For OneTimeOneTime, this onboarding is currently review-only and must not provision a separate Railway service or DNS record.
