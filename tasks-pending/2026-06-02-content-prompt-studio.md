# Content Prompt Studio Handoff

Date: 2026-06-02

## What Changed

- Added versioned content prompts for:
  - `whatsapp_update`
  - `facebook_post`
  - `weekly_newsletter`
  - `linkedin_post`
  - `youtube_description`
- Added prompt history and examples/files tables:
  - `bna_content_prompts`
  - `bna_content_prompt_versions`
  - `bna_content_prompt_examples`
- Added weekly bundle tables:
  - `bna_content_bundles`
  - `bna_content_bundle_items`
- Operations Content view now shows prompt cards for each platform output. Each card shows prompt version, updated time, example titles, current draft, generate/regenerate, copy, prompt edit, add example/file, and approve.
- Approved outputs are saved as reusable examples for the same platform prompt.
- Facebook approval creates a GHL social draft. It does not silently live-publish.
- Weekly newsletter bundles allow selecting multiple content jobs and generating one newsletter draft from the newsletter prompt.

## Important Behavior

- Raw Drive/Telegram content still becomes `bna_content_jobs`.
- The content card summary should summarize the content itself. Generic intake instructions like "Auto Drive Intake..." should not be displayed as the main summary if transcript/topics are available.
- Content UI no longer shows:
  - `Break into tasks`
  - `Custom instruction`
  - `Copy transcript start`
- Task extraction from recordings should happen through the Telegram/parser workflow, not as a visible Content page button.

## Smoke Tests Passed Locally

- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- Authenticated `GET /api/bna/content-prompts` returned 5 prompts.
- Authenticated `GET /api/bna/content-bundles` returned 200.
- Mobile Playwright smoke for `/operations?view=content` passed:
  - Content Library visible
  - Prompt version cards visible
  - Weekly Newsletter Bundle visible
  - old task/content buttons absent
  - no browser console/page errors

## Deploy Status

- Railway deployment `43a657de-074c-4fee-b6f5-591f7b608352` succeeded.
- Live smoke passed:
  - `/api/health`
  - authenticated `GET /api/bna/content-prompts` returned 5 prompts
  - authenticated `GET /api/bna/content-bundles` returned 200
  - mobile `/operations?view=content` showed Content Library, prompt versions, and Weekly Newsletter Bundle
  - old Content buttons absent
  - no browser console/page errors
- 2026-06-03 follow-up deployment `79e5731d-2534-4fb1-8673-892ca2e9aa9a` succeeded.
- Live generation now works with Kimi:
  - Railway service has `KIMI_API_KEY`, `KIMI_BASE_URL`, and `KIMI_MODEL`
  - server content generation uses Kimi first, OpenAI fallback second
  - Kimi-specific requests use `temperature: 1`
  - archived smoke test job #14/output #26 generated a real WhatsApp draft with prompt v1, provider `kimi`, model `kimi-k2.6`
- Telegram content buttons now call the same backend `generate_output` flow as the dashboard, so Telegram drafts use tracked prompt versions/examples.

## Remaining Work

- Decide whether Facebook approval should remain "create GHL draft" or become true live publish after an additional explicit confirmation gate.
- Add a richer newsletter workflow later: choose date range, preview combined source list, edit final newsletter, and send from office email only after approval.
- Add Telegram buttons for Newsletter/LinkedIn/YouTube generation if the operator wants those actions directly in Telegram, not only in the dashboard.
