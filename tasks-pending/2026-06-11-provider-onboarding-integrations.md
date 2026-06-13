# Provider Onboarding and Integrations Foundation

Captured: 2026-06-11

## Source

Local prompt file:
`C:\Users\User\Downloads\bna_provider_onboarding_codex_super_prompt.md`

## Current Implementation State

- Express/Railway `server.js` remains the live runtime.
- Existing provider work already included provider accounts, scoped `/provider`
  portal login, provider commercial model/entitlements, public `/providers/join`,
  parent-facing approved-provider directory inside the parent portal, Operations
  provider admin APIs, and Rabbi Sheller as the first revenue-share provider.
- This pass extends that foundation with public provider profile fields,
  Google Business/Profile URL and Place ID storage, provider onboarding intake
  records, a heuristic parser for natural-language provider setup text, a public
  approved-provider index page, parent-to-provider portal messages, provider
  replies, and safer route aliases.

## Local Changes In This Pass

- Added provider public profile columns:
  display name, category, descriptions, city/neighborhood/address/service area,
  WhatsApp, website, Google Business/Profile URL, Google Place ID, profile image,
  message permission, and advertise permission.
- Added tables:
  - `bna_provider_onboarding_sessions`
  - `bna_provider_intake_records`
  - `bna_provider_messages`
- Added public API:
  - `GET /api/service-providers`
  - `POST /api/provider-onboarding/intake`
- Added admin read APIs:
  - `GET /api/bna/provider-onboarding-intakes`
  - `GET /api/bna/provider-messages`
- Added portal message APIs:
  - `POST /api/parent-portal/provider-messages`
  - `POST /api/provider-portal/messages/:id/reply`
- Added public routes:
  - `/service-providers`
  - `/providers`
  - `/become-service-provider`
  - `/parent/login`
  - `/student/login`
  - `/provider/login`
  - `/provider-dashboard`
- Added `public/service-providers.html` as a sanitized public provider index.
- Extended `public/providers-join.html` with Google/Profile fields and optional
  plain-language setup notes.
- Extended `public/provider.html` with profile Google/contact fields and a real
  Communications inbox/reply flow.
- Extended `public/parent.html` so provider CTAs create scoped provider messages
  and provider message history is visible in Communications.
- Added Parent Login, Student Login, and Become a Service Provider links to the
  homepage and signup pages.
- Removed real-looking sample operation credentials from `.env.example` and
  removed prefilled credentials from `public/test-login.html`.
- Re-ran a non-revealing tracked-file secret pattern scan. A first broad
  OpenAI-key pattern only matched the `sk-` inside historical `task-*` artifact
  paths, so those false-positive path references were restored. A stricter
  key-shaped scan now returns no tracked-file OpenAI key matches.

## Still Blocked / Next Decisions

- Wappy is still unconfirmed. Do not build a live WhatsApp adapter until the
  exact vendor URL, auth model, API docs, and account/session model are supplied.
- Resend has not been added yet; Gmail remains the current live sender.
- Google Business Profile OAuth/managed-location access is not wired. Current
  implementation is the manual/public fallback: URL and Place ID storage.
- Google Places fetching/caching is not wired because a Maps/Places API key and
  display/attribution requirements need confirmation.
- Ads CSV import, Green Invoice provider accounting, and OpenAI usage tracking
  remain future phases.
- App-visible changes need deploy plus Railway doctor/live smoke before this can
  be marked complete.

## Local Verification Passed

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `node --check scripts/agent-fleet-supervisor.mjs`
- `npm test` passed with 272/272 tests.
- `GET /api/service-providers` returned the approved Rabbi Scheller provider
  record and services locally.
- Browser smoke passed locally on `127.0.0.1:8097` for:
  - `/service-providers`
  - `/become-service-provider`
  - `/`
  - `/signup-he.html`
  - `/parent/login`
  - `/student/login`
  - `/provider/login`
- Visible browser checks confirmed the public provider listing rendered, the
  join page includes Google Profile, Google Place ID, and `raw_intake` fields,
  Hebrew signup nav no longer shows literal Unicode escape text, and no console
  errors were seen on the checked surfaces.
- `ops/agent-task-ledger.jsonl` parses as JSONL after the safety scan/update.

## Remaining Deployment Gate

- Deploy to Railway only after confirming the dirty worktree scope is safe.
- Run `npm run railway:doctor`.
- Run `npm run app:smoke`.
- Run live browser smoke for public/provider/parent surfaces.
- Then mark the task complete and append `ops/agent-changelog.md`.
