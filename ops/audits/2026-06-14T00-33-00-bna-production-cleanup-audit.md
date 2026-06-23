# BNA Production Cleanup Audit

Created: 2026-06-14T00:33:00+03:00
Source prompt: `C:\Users\User\Downloads\BNA_Codex_Master_Cleanup_Community_No_GHL_Prompt_2026-06-13.md`
Branch: `cleanup/bna-production-community-no-ghl`
Safety snapshot: `70c2388` on `safety/pre-cleanup-20260613-2343`

## Scope

- Remove active GoHighLevel/LeadConnector/GHL runtime paths from the BNA app.
- Archive legacy provider code under `docs/archive/legacy-ghl/`.
- Keep active social publishing on Buffer and active contact/community/provider work first-party inside BNA Operations.
- Split public, parent, and Operations PWA manifests so public installs do not open private Operations.
- Preserve compatibility for old database rows without making the legacy provider active.
- Verify locally, check live app health, and keep release open until external blockers are resolved.

## Implementation Audit

- Active runtime no longer imports or calls GHL helper code.
- `.mcp.json` no longer exposes a GoHighLevel/LeadConnector MCP server.
- `.env.example` no longer documents GHL tokens or social flags; Buffer is the documented social provider.
- Legacy GHL scripts and library files were moved to `docs/archive/legacy-ghl/`.
- New `scripts/buffer-ops.mjs` owns Buffer account/blog listing and social draft/create helpers.
- Telegram social commands now use Buffer helpers and first-party BNA blog destinations.
- Server signup/payment/content paths no longer sync to the legacy provider.
- Legacy contact ID columns were replaced in active code with `legacy_crm_*` compatibility names.
- Database bootstrap adds/backfills compatibility columns from old column names where present, then uses first-party task/source/category names.
- Public PWA manifest starts at `/?source=public-pwa`.
- Parent portal has its own `public/parent-manifest.json` and starts at `/parent?source=parent-pwa`.
- Operations keeps its own private manifest and app install path.
- The public homepage no longer redirects standalone PWA launches into Operations.

## Active Provider Scan

Command:

`rg -n "\bGHL\b|GoHighLevel|HighLevel|LeadConnector|services\.leadconnectorhq|GHL_|\bghl\b|ghl_|go high level|legacy-legacy CRM|legacy CRM-pit" server.js public scripts src tests package.json .env.example .mcp.json`

Result: PASS, no active-code matches.

Notes:
- Deprecated historical mentions remain in source-of-truth docs by design.
- Archived legacy code remains under `docs/archive/legacy-ghl/` only.

## Verification

- PASS `npm test` (306/306).
- PASS active provider-term scan.
- PASS `npm run railway:doctor`.
  - Project: `skillful-motivation`
  - Environment: `production`
  - Latest deployment checked: `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d`
  - Status: `SUCCESS`
- PASS `npm run app:smoke`.
  - Report: `ops/live-smokes/2026-06-13T21-31-46-205Z-live-app-smoke.md`
  - Included public health, Operations session/auth, protected API reads, signup dry-run validation, Buffer diagnostics, and Drive image lane.
- FAIL `npm run openai:smoke`.
  - Report: `ops/openai-smokes/2026-06-13T21-30-41-035Z-openai-sidekick-smoke.md`
  - Local context checks passed.
  - OpenAI API call failed with `401 invalid_api_key`.
- PASS `node scripts/repair-bna-contact-roles.mjs --json --limit=25`.
  - The earlier Supabase DNS failure was caused by `.env.local` overriding the Railway DB secret with stale host `db.amipeuneopdbzuhlnimt.supabase.co`.
  - `scripts/repair-bna-contact-roles.mjs` now prefers runtime `DATABASE_URL`, then `.secrets/railway-database-url.txt`, then `.env.local`.
  - Railway database host `yamanote.proxy.rlwy.net` resolves locally.
  - Dry-run reached the live database and reported no legacy CRM collisions or phone-only WAPI contacts; it still found internal student-role cleanup candidates and unresolved WhatsApp communications for later review.

## Environment Investigation

- Local `.secrets/openai-api-key.txt` exists and is the value used by `npm run openai:smoke`.
- The shell did not provide a separate `OPENAI_API_KEY` override.
- Railway production `OPENAI_API_KEY` exists and matches the local secret by value comparison, without printing the key.
- Conclusion: the OpenAI failure is not a parse/trim/override issue; the configured key itself is invalid or revoked and must be replaced outside chat.
- `.env.local` exists and contains a stale Supabase `DATABASE_URL`; contact repair now bypasses it when the Railway DB secret exists.

## Release Status

Not deployed from this cleanup branch.

Reason:
- The OpenAI smoke still fails with `401 invalid_api_key`.
- App-visible work must not be marked complete until the corrected key is in place, the branch is deployed, Railway doctor passes after deployment, live smoke passes against the new deployment, and Telegram receives a concise completion/blocker report.

## Follow-Up

1. Replace or repair the OpenAI API key outside chat.
2. Rerun `npm run openai:smoke`.
3. Run `node scripts/repair-bna-contact-roles.mjs --json --limit=25` again before deploy if contact data changed.
4. Deploy the cleanup branch only after the OpenAI smoke passes.
5. Rerun `npm run railway:doctor` and `npm run app:smoke`.
6. Report the release result back through Telegram and then mark the task done/archive as appropriate.
