# BNA Workspace/Community/Provider/Bot No-GHL Handoff

Date: 2026-06-14

## Objective

Complete the no-GHL workspace/community/provider/bot release without losing the
dirty worktree. BNA active runtime must be first-party BNA Operations plus
explicit connectors only.

## Current Branch Reality

- Earlier safety branch/commit exists and was pushed:
  `safety/pre-next-superprompt-20260614-072250` at `30bddbd`.
- Current checkout during this handoff:
  `cleanup/workspace-task-dialogue-rabbi-scheller` at `75d2b36`.
- Desired release work should be preserved before any branch switch. Do not
  treat branch/worktree dirtiness as a reason to stop.

## Implemented In This Pass

- Added `npm run openai:diagnose` via `scripts/openai-key-diagnostics.mjs`.
- Hardened OpenAI/local secret normalization in smoke/server loading paths.
- Updated public provider signup to free-listing-only with reviewed external
  CTA flow.
- Added role-aware Action Registry entries and handlers for:
  - `create_ticket`
  - `create_decision`
  - `draft_weekly_update`
  - `select_weekly_update_hero`
  - `generate_student_worksheet`
  - `draft_parent_response`
  - `post_community_message`
  - `request_provider_contact`
  - `queue_telegram_report`
  - `route_bug_to_codex`
- Updated generated action-registry artifacts.
- Added docs:
  - `docs/architecture/no-ghl-policy.md`
  - `docs/architecture/workspace-community-provider-role-map.md`
  - `docs/architecture/community-dialogue-map.md`
  - `docs/architecture/bot-context-and-ticket-routing.md`
- Updated source-of-truth docs and current handoffs to mark GHL retired and
  first-party BNA canonical.
- Added July 1/old-link/current-rate/reconciliation/no-double-charge signup copy
  to English and Hebrew signup forms.

## Verification So Far

- PASS `node --check server.js`
- PASS `node --check src/lib/actions/actions/operations.js`
- PASS `node --check src/lib/actions/registry.js`
- PASS `node --check scripts/openai-key-diagnostics.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS focused action/provider suite:
  `node --test tests/action-registry-telegram-ui-bot.test.js tests/service-provider-directory.test.js`
- PASS focused Operations regression cluster:
  `node --test tests/one-time-external-user-portal.test.js tests/operations-saas-crm-redesign.test.js tests/operations-task-comments-and-dictation.test.js`
- PASS `npm test` 309/309
- PASS `npm run railway:doctor` for `skillful-motivation / production`, deployment
  `6b1e8b3a-c325-4fb1-ab73-80e6f0e6918d`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T05-39-22-374Z-live-app-smoke.md`
- PASS `npm run screenshot` after starting local Express with throwaway local
  `OPS_USERNAME`/`OPS_PASSWORD`; mobile/tablet/desktop horizontal scroll all
  reported `false`.
- No-GHL runtime scan is clean outside intentional guard tests.
- Every file under `docs/archive/legacy-ghl/` now includes the required retired
  archive warning banner.
- Old handoff files still contain historical retired-provider wording; current
  source-of-truth policy and this handoff mark those entries superseded, and
  they must not be revived as active implementation guidance.

## OpenAI Gate

- `npm run openai:diagnose` is implemented and now fails cleanly after writing
  `ops/qa-runs/2026-06-14T05-38-48-982Z-openai-diagnostics.md`.
- Selected source: `.secrets/openai-api-key.txt`.
- `.secrets/openai-api-key.txt` and Railway `OPENAI_API_KEY` share fingerprint
  `02079c0b5ca1`; `.env.local` has a different fingerprint and is not the
  selected source.
- Normalization detected and strips a BOM/newline from the local secrets file.
- `/v1/models` returned `401 invalid_api_key`, request id
  `b56d1e96-62f7-4e87-a339-14e54409c8fb`.
- `npm run openai:smoke` also failed with OpenAI `401 invalid_api_key`; report:
  `ops/openai-smokes/2026-06-14T05-39-06-579Z-openai-sidekick-smoke.md`.

This is no longer a blind file-saving problem. The saved key is being loaded by
local diagnostics and the same fingerprint exists in Railway, but OpenAI rejects
it. A valid/re-enabled key for the correct project/org is required, or the
operator must explicitly approve deployment with this known blocker.

## Status Update - 2026-06-14T10:35:00+03:00

Operator approved temporary Kimi-primary hosted AI mode while the OpenAI key
path/account issue remains unresolved.

Implemented:

- `BNA_AI_PRIMARY_PROVIDER=kimi` support in `server.js` content AI provider
  selection.
- `BNA_AI_PRIMARY_PROVIDER=kimi` support in Telegram hosted API provider
  ordering.
- Historical `npm run openai:smoke` now smokes the selected hosted AI provider;
  when Kimi is selected, it uses Kimi-compatible temperature and records Kimi as
  the provider in the report.
- Local `.env.local` and Railway production variable
  `BNA_AI_PRIMARY_PROVIDER=kimi` are set; Railway was updated with
  `--skip-deploys`, so this does not by itself redeploy or restart production.
- QA report:
  `ops/qa-runs/2026-06-14T10-35-00-kimi-primary-provider-mode.md`.

Verification:

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/smoke-openai-sidekick.mjs`
- PASS `node --test tests/ai-provider-selection.test.js`
- PASS `npm test` 315/315
- PASS Railway variable readback for `BNA_AI_PRIMARY_PROVIDER=kimi`
- Kimi selected-provider smoke assertions passed in
  `ops/openai-smokes/2026-06-14T07-31-27-913Z-openai-sidekick-smoke.md`.

## Final Status - 2026-06-14

The live task-category constraint blocker was fixed in the workspace task system
release. The selected hosted-AI smoke now passes with Kimi:

- PASS `npm run openai:smoke` with `BNA_AI_PRIMARY_PROVIDER=kimi`:
  `ops/openai-smokes/2026-06-14T07-54-18-768Z-openai-sidekick-smoke.md`
- PASS Railway deployment `954411df-9a0a-4892-820e-28ebbdb9c85c`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T07-56-50-529Z-live-app-smoke.md`
- PASS live task/support-related API readback through the app smoke and focused
  task API readback.

Remaining note:

- The OpenAI key itself is still rejected by OpenAI with `401 invalid_api_key`.
  Kimi is the approved temporary hosted-AI provider, not a replacement for
  Codex as the task/development owner.
- Continue replacing old historical GHL wording if those files are revived, but
  do not restore any retired runtime.
