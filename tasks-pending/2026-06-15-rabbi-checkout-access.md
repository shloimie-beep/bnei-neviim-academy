# Rabbi Checkout, Access, And Preview Launch Handoff

Updated: 2026-06-15 11:35 Asia/Jerusalem

## Status

Completed, deployed, and live-smoked.

## Implemented

- Added the Rabbi / One Time checkout and access schema in
  `railway-migration-2026-06-15-rabbi-checkout-access.sql`.
- Added first-party helper modules for Rabbi products, payments, access tokens,
  email templates, and landing-page preview state.
- Added `stripe` as a runtime dependency for optional Stripe Checkout Sessions.
- Added scoped admin APIs under `/api/bna/rabbi/*` for config, tiers, provider
  readiness, checkouts, members, grants, library items, live sessions,
  communications, and preview site controls.
- Added public APIs under `/api/rabbi/*` for tiers, checkout, member login,
  member session, member library, and member live-session readback.
- Added webhook endpoints for `/api/webhooks/stripe/rabbi` and
  `/api/webhooks/green-invoice/rabbi`.
- Added preview pages `/rabbi`, `/rabbi-preview`, `/one-time-mishnayos`,
  `/rabbi-member`, and `/rabbi/member`; `/` remains the BNA public homepage.
- Added the Operations `Launch / Checkout` panel for the provider workspace.
- Extended `bna_email_log` with Rabbi project/member/checkout/grant/template
  metadata and dry-run communication logging.

## Guardrails

- Default mode is preview.
- Public replacement requires both the approval phrase
  `APPROVE_RABBI_PUBLIC_REPLACEMENT_PREVIEW` and
  `RABBI_ALLOW_PUBLIC_REPLACEMENT=true`.
- Stripe and GreenInvoice missing configuration returns blockers such as
  `stripe_not_configured`, not a server crash.
- Stripe Checkout Session creation requires the actual
  `RABBI_STRIPE_SECRET_KEY` env value, not just dashboard readiness metadata.
- Secrets stay in env, Railway, or the BNA keyholder. No secret values were
  written to repo files.
- No Google Classroom/Calendar/Drive writes, Zoom API scheduling, Vimeo API
  upload, Buffer/social publish, WhatsApp/email real send, external CRM write,
  or public homepage replacement was performed.

## Verification

- PASS `node --check server.js`
- PASS `node --check public/js/rabbi-launch.js`
- PASS `node --check public/js/rabbi-member.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS Operations inline script parse
- PASS `node --test tests/rabbi-checkout-access.test.js` 4/4
- PASS `npm test` 499/499
- PASS local public smoke: `/` not Rabbi preview, `/rabbi` preview banner,
  `/rabbi-member`, two public tiers, Stripe checkout blocker 409
  `stripe_not_configured`
- PASS local dry-run member/access smoke: created smoke member, granted
  `live_library`, preview-login token worked, member had `library` and `live`
  scopes, grant was revoked, scopes were empty, three dry-run communications
  were logged
- PASS Railway deployment
  `a45334a9-e94f-48fc-a2d8-d5dbc167b381`
- PASS Railway doctor SUCCESS
- PASS live app smoke
  `ops/live-smokes/2026-06-15T08-26-30-999Z-live-app-smoke.md`
- PASS focused live Rabbi smoke: `/` still BNA homepage, `/rabbi` preview
  banner, `/rabbi-member`, two public tiers, Stripe checkout blocker 409
  `stripe_not_configured`, dry-run member grant/login/revoke/communication log
- PASS browser visual smoke on live `/rabbi` and `/rabbi-member` at desktop and
  mobile: rendered pages, two tier cards, no horizontal overflow, zero console
  errors

## Smoke Records

- Local smoke member `codex-rabbi-smoke-1781511796995@example.invalid`,
  member id 12, grant id 1: grant revoked and member disabled.
- Live smoke member `codex-rabbi-live-smoke-1781512155563@example.invalid`,
  member id 13, grant id 2: grant revoked and member disabled.

## Remaining Decisions

- Real product prices/currency and provider of record still need owner approval.
- Live Stripe/GreenInvoice settings, payment links/price ids, webhook secrets,
  and any real non-dry-run checkout path remain blocked until configured and
  approved.
- Real Gmail/email send proof still needs an approved test recipient.
- Public homepage replacement is not active and remains blocked behind the
  explicit approval phrase plus env flag.
