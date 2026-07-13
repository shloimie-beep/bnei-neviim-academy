# Rabbi One Time Landing Smoke - 2026-07-13T20:50:11.768Z

App: https://join.onetimeonetime.com
Expected SHA: 11e5ba0d4da6ae8897294be81a567bb519943ab2
Result: passed

## Checks
- PASS Deploy info is readable and matches expected SHA when provided (11e5ba0d4da6ae8897294be81a567bb519943ab2)
- PASS /rabbi has focused One Time branding, direct signup CTA, WhatsApp launcher, and no Academy chrome
- PASS One Time campaign API exposes Rosh Hashanah promo and no-trial billing guardrails
- PASS /favicon.ico returns the One Time black/white icon fallback
- PASS One Time public WhatsApp readiness is configured, scoped, and no-send
- PASS /one-time/signup has lightweight Family/School signup fields
- PASS One Time instance config is scoped to Rabbi Scheller provider

No checkout POST, payment link creation, member creation, access grant, email, WhatsApp, social post, upload, charge, DNS write, or external connector write was performed.
