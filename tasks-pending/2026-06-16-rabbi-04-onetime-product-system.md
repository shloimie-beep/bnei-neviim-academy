# RABBI-04 - OneTime Mishnayos Product System

**Status:** Deployed in accumulated release; product decisions gated
**Cycle:** `2026-06-16-ramble-router-parallel-chatgpt-to-codex`
**Source:** uploaded Rabbi Scheller / OneTime Mishnayos Product System goal spec
**Owner:** Codex

## Intent

Build a first-party, decision-ready OneTime Mishnayos product system for Rabbi
Scheller's class without turning candidate pricing or funnel ideas into live
checkout, account grants, sends, or external writes.

## Current Repo Findings

- The active Operations UI is still `public/operations.html` backed by
  `server.js`.
- The repo already has OneTime/Rabbi foundations: scoped Operations login,
  `one_time_mishnah_class`, draft checkout/access tables, member library,
  classroom/community/calendar work, `/rabbi`, `/rabbi-member`, and
  `/one-time-preview`.
- The existing checkout tier keys are `library_only` and `live_library`; new
  product-planning tier keys must preserve compatibility rather than replacing
  those records.
- `public/one-time-preview.html` has lead intake for Mishnah onboarding, but
  RABBI-04 needs product-scoped interest leads and regional funnel pages.
- Existing Sefaria usage is a BNA accountability helper. RABBI-04 should add a
  fixture/stub source-prep path and must not assume live external integration.
- The June 15 meeting notes in repo memory contain OneTime context, but no
  full transcript/source artifact was found. Do not fabricate
  meeting-specific claims.

## Build Scope

- Add a OneTime product-system module with tier candidates, region/audience
  metadata, visibility/artifact statuses, lead validation, calendar view
  helpers, and fixture-based source-prep helpers.
- Add database tables/seeds for product programs, funnels, product decisions,
  product leads, schedules, calendar events, and source-prep jobs.
- Add admin/scoped APIs for product system, calendar, leads, and source-prep
  jobs.
- Add draft/noindex `/one-time`, `/one-time/us`, `/one-time/uk`,
  `/one-time/israel`, `/one-time/interest`, and `/one-time/member-login`
  static routes.
- Add Operations workspace visibility for candidate pricing decisions, regional
  funnels, leads, calendar/artifact statuses, and source-prep drafts.

## Guardrails

- No final public pricing.
- No checkout buttons.
- No payment provider product/price creation.
- No member access grants.
- No email, WhatsApp, SMS, Telegram, Buffer, Google, Drive, Zoom, or external
  CRM writes.
- No secrets in chat, tracked files, screenshots, task titles, or logs.
- Keep BNA homepage/signup, parent PWA, Operations PWA, and private BNA areas
  separate from OneTime public pages and scoped provider access.

## Implementation Completed

- Added `src/lib/bna/one-time-product-system.js` for tier candidates, regions,
  audiences, visibility/artifact statuses, lead validation, calendar view
  helpers, and fixture-only source-prep helpers.
- Updated `src/lib/bna/rabbi-products.js` so the existing Rabbi tier helpers
  preserve `library_only` / `live_library` compatibility while accepting the
  new draft planning tiers.
- Added `railway-migration-2026-06-16-one-time-product-system.sql` and updated
  `railway-migration-2026-06-15-rabbi-checkout-access.sql` so draft OneTime
  program, funnel, decision, lead, schedule, calendar, and source-prep tables
  can be bootstrapped without final pricing or live checkout.
- Updated `server.js` with scoped/admin OneTime product-system APIs, public
  interest capture, public/admin calendar readback, source-prep job creation,
  and static `/one-time` regional routes.
- Added the draft/noindex public funnel at `public/one-time/index.html`.
  The page is interest-only, labels pricing as pending, and has no checkout,
  account grant, billing provider, or external send path.
- Updated `public/operations.html` with OneTime product decisions, candidate
  pricing, regional funnel, first-party lead, schedule/calendar, and
  source-prep panels.
- Updated `tests/one-time-product-system.test.js` and refreshed the assistant
  contract so Operations keeps the internal BNA Helper while public/signup
  pages keep the public assistant widget.

## Verification Completed

- `node --check server.js` passed.
- `node --check scripts/telegram-kimi-bridge.mjs` passed.
- Inline script parse passed for `public/operations.html` and
  `public/one-time/index.html`.
- Focused tests passed: `node --test tests\one-time-product-system.test.js
  tests\rabbi-checkout-access.test.js tests\universal-assistant-contract.test.js
  tests\ui-01-public-operations-shell.test.js` = 25/25.
- Full `npm test` passed: 646/646.
- Local Playwright screenshot proof captured desktop/mobile OneTime public,
  UK regional, public calendar, Operations decisions, and Operations calendar
  views. Report: `screenshots/rabbi-04/report.md`.
- Browser plugin was attempted for local visual verification, but localhost
  navigation was unavailable in the in-app browser session. Local Playwright
  screenshots were used for the actual proof and captured zero console/page
  errors.

## Guardrails Verified

- No final public pricing was set.
- No checkout buttons or payment provider product/price creation were added.
- No member access grants were added.
- No email, WhatsApp, SMS, Telegram, Buffer, Google, Drive, Zoom, or external
  CRM writes were performed.
- Public OneTime pages are draft/noindex and separate from the BNA homepage,
  parent PWA, public manifest, and private Operations app.
- Source prep is fixture/stub only and does not call Sefaria or any external
  source provider.

## Live Follow-Up

- Accumulated Railway deployment
  `47da54d6-fda7-495a-84ab-90b51ebdefe1` reached `SUCCESS` after this local
  implementation.
- Railway doctor and the live smoke suite passed. Product launch remains
  decision-gated because pricing, billing, legal/refund copy, launch copy, and
  member access are not approved.
- If launch-specific proof is needed, run a narrow live public `/one-time` and
  authenticated scoped-Operations readback smoke after the final product
  decisions are made.

## Open Decisions

- Final tier names, prices, discounting, refunds, legal copy, and launch copy.
- Billing provider readiness and explicit approval before checkout appears.
- Whether the 7pm Israel class should be published publicly or remain
  member/admin-only during launch.
- Transcript/source ingest for the June 15 Rabbi Scheller / OneTime meeting.
