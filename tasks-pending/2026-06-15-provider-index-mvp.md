# Provider Index MVP Handoff

Status: deployed and live-smoked on 2026-06-15.

## Shipped

- Added `railway-migration-2026-06-15-provider-index-mvp.sql` for provider
  categories, category maps, images, offerings, leads, upgrade events, and MVP
  columns on `bna_service_providers`.
- Added `src/lib/bna/provider-index.js` for category seeds, signup
  normalization, public sanitization, completeness, and filter helpers.
- Public provider signup now creates pending free listings that require BNA
  admin approval before public listing.
- Public provider APIs now expose category seeds, approved-only provider lists,
  provider profiles, question leads, and upgrade-interest capture.
- Public pages now include `/provider-signup`, `/service-providers`,
  `/providers/category/:slug`, and `/providers/:slug` support with free-listing
  copy, SEO metadata, and no Google Business live-feed dependency.
- Operations now has a provider index admin panel for review queue, approve,
  hide, feature, category creation, and lead status updates.
- Telegram bridge can capture provider signup/onboarding details into pending
  provider review without auto-publishing.
- Provider upgrade interest uses `PROVIDER_UPGRADE_URL` when configured and a
  safe placeholder when absent. Free signup/listing never requires checkout.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused provider/workspace tests 25/25
- PASS full `npm test` 505/505
- PASS local browser smoke:
  - `http://127.0.0.1:8080/service-providers`
  - `http://127.0.0.1:8080/provider-signup?onboard=provider`
  - `http://127.0.0.1:8080/providers/category/tutoring`
  - `http://127.0.0.1:8080/providers/rabbi-elie-scheller`
- PASS Railway deployment `a138bf70-0b24-4a80-82b8-a40f326ed5b7`
- PASS post-deploy Railway doctor SUCCESS
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T09-09-33-330Z-live-app-smoke.md`
- PASS focused live provider smoke:
  `ops/live-smokes/2026-06-15T09-10-50-473Z-provider-index-live-smoke.json`

## Guardrails

- Public listing is approved-only.
- Pending and hidden providers are excluded from public APIs/pages.
- Public provider serializer hides email, phone, WhatsApp, and contact name
  unless `publish_contact` is true.
- No Google Business live feed or dependency was added.
- No Google Classroom, Calendar, or Drive write was added.
- No Stripe provider checkout path was added; provider upsell is an interest
  URL only.
- No WhatsApp send, Buffer/social action, external CRM write, billing action, or
  member-library/Rabbi live-site action was performed.

## Remaining

- Configure `PROVIDER_UPGRADE_URL` when BNA chooses the upgrade-interest
  destination.
- Add richer provider seed/content data, categories, images, and offerings as
  real providers are approved.
- Decide whether to persist computed legacy slugs for older approved providers
  beyond the current runtime fallback.
