# OneTime Scope Bleed Local Smoke - 2026-07-09

Scope: local OneTime single-tenant runtime with `APP_MODE=single_tenant`,
`APP_INSTANCE=onetime`, and `BRAND_KEY=onetime`.

## Routes checked

- `/parent/login` redirects to `/one-time-parent`.
- `/student/login` redirects to `/student.html?one_time_login=1`.
- `/provider.html?review=one-time&section=crm` serves the OneTime provider
  shell before static BNA provider markup.

## Result

Desktop and mobile Playwright smoke passed. The checked screens showed
OneTime/Rabbi Scheller scope, no visible BNA Academy text, no Hebrew toggle
bleed, no student access-code fallback on the real OneTime student login, no
horizontal overflow on mobile, and the OneTime student helper launcher.

Machine-readable result: `smoke-results.json`.

Screenshots:

- `parent-login.png`
- `student-login.png`
- `provider-review-crm.png`
- `parent-login-mobile.png`
- `student-login-mobile.png`
- `provider-review-crm-mobile.png`

## Not claimed

This smoke does not finish the full Rabbi provider CRM IA polish, logged-in
student portal/classroom visual audit, password-reset TTL policy, WAPI setup,
contact tagging, deploy, or live production smoke.
