# BNA Production Cleanup: First-Party Community, No Active GHL

Created: 2026-06-14T00:33:00+03:00
Source prompt: `C:\Users\User\Downloads\BNA_Codex_Master_Cleanup_Community_No_GHL_Prompt_2026-06-13.md`
Audit: `ops/audits/2026-06-14T00-33-00-bna-production-cleanup-audit.md`
Branch: `cleanup/bna-production-community-no-ghl`

## Master Task

Finish the BNA production cleanup so active app behavior is first-party BNA Operations plus Buffer social publishing, with GoHighLevel/LeadConnector/GHL archived and disabled.

## Current State

- Safety branch and snapshot were created before edits:
  - Branch: `safety/pre-cleanup-20260613-2343`
  - Commit: `70c2388`
- Legacy GHL scripts/library files were moved to `docs/archive/legacy-ghl/`.
- Active runtime no longer uses GHL/LeadConnector helper code, env vars, MCP, diagnostics, signup sync, payment sync, or Telegram social routes.
- Buffer helper code now backs social account/blog/post operations.
- PWA manifests are split:
  - public site: `/manifest.json`, start `/?source=public-pwa`
  - parent portal: `/parent-manifest.json`, start `/parent?source=parent-pwa`
  - Operations: `/operations-manifest.json`
- First-party compatibility fields use `legacy_crm_*` names where historical IDs may still exist.
- Source-of-truth docs now mark GHL/LeadConnector as deprecated and archive-only.

## Verification

- PASS `npm test` (306/306).
- PASS active-code provider scan: no active GHL/GoHighLevel/LeadConnector/`ghl_` matches in `server.js`, `public`, `scripts`, `src`, `tests`, `package.json`, `.env.example`, or `.mcp.json`.
- PASS `npm run railway:doctor` for `skillful-motivation / production`.
- PASS `npm run app:smoke`.
  - Report: `ops/live-smokes/2026-06-13T21-31-46-205Z-live-app-smoke.md`
- PASS `node scripts/repair-bna-contact-roles.mjs --json --limit=25`.
  - Fixed script DB source precedence so the Railway database secret wins over stale `.env.local`.
  - Dry-run reached the live database.
- FAIL `npm run openai:smoke`.
  - Report: `ops/openai-smokes/2026-06-13T21-30-41-035Z-openai-sidekick-smoke.md`
  - Failure reason: OpenAI API returned `401 invalid_api_key`.

## Release Blocker

Do not mark this app-visible cleanup complete yet.

The branch has not been deployed because the OpenAI smoke is failing with `401 invalid_api_key`. Local and Railway metadata show the same configured OpenAI key is used, so the key itself appears invalid or revoked. After the key is fixed outside chat, rerun the OpenAI smoke, deploy, rerun Railway doctor and live app smoke against the new deployment, then report the result back through Telegram.

## Next Actions

1. Fix the OpenAI API key outside chat.
2. Rerun `npm run openai:smoke`.
3. Rerun the contact repair dry-run if contact data changed.
4. Deploy the cleanup branch.
5. Rerun `npm run railway:doctor`.
6. Rerun `npm run app:smoke`.
7. Send the Telegram completion/blocker summary.
8. Move the BNA production cleanup task out of Now only after live verification passes.
