# Goal-Mode Follow-Up Report

Date: 2026-06-14

## Status

Partially done. This pass preserved the dirty worktree, confirmed the earlier
public/student privacy fix was already deployed and live-smoked, added and
deployed a dedicated Google Workspace readiness surface in Operations, and
created the named follow-up docs for Google, helper tools, WAPI/CRM, and
Rabbi/One Time. Follow-up slices also deployed manual provider Google Business
Profile link capture, a WAPI phonebook grouping dry-run report, the Telegram
note-to-CRM matcher, the WAPI manual correction apply UI, and parent
announcement persistence/readback. The broader onboarding, automation, task
cleanup, live Google adapter, full phonebook conversation workspace, and Rabbi
follow-up work remains open.

## Dirty Worktree

- Current branch: `cleanup/onboarding-helper-crm-workspace-rabbi`
- Safety branch: `safety/pre-goalmode-google-onboarding-crm-20260614-173354`
- Dirty patch: `.runtime/pre-goalmode-dirty-worktree-20260614-173354.patch`
- Dirty status: `.runtime/pre-goalmode-git-status-20260614-173354.txt`

## Security / Privacy

- The latest handoff says the public parent/student leak fix was deployed and
  live-smoked on Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390`.
- This pass did not undo those protections.
- Tests still need to be rerun after the Google UI/docs additions.

## Google Now-Vs-Later

- Added Operations Settings > Google Workspace.
- The panel separates:
  - No-OAuth/manual/public-link mode.
  - Test-user OAuth.
  - Later production verification.
- Cards cover Google Drive, Google Calendar, Google Classroom, and Google
  Business Profile.
- Calendar and Classroom cards use registered dry-run actions.
- Drive cards use registered preview-only actions for file search/list, Doc
  preview, folder preview, and move preview.
- `/api/bna/integrations/google/status` now mirrors the existing Google status
  payload for the Operations API client and includes real OAuth rows from
  `bna_google_connections` when test-user accounts are connected.
- Google connection disconnect is confirmation-gated and deployed at:
  - `/api/google/connections/:connectionId/disconnect`
  - `/api/bna/integrations/google/connections/:connectionId/disconnect`
- Provider Google Business/Profile links and Place IDs now have an
  approval-gated manual capture action:
  `capture_provider_google_business_link`. It stores manual provider metadata
  only and does not call the live GBP API.
- Scope and action docs:
  - `ops/google-integrations/google-now-vs-later-scope-plan.md`
  - `ops/google-integrations/oauth-test-user-plan.md`
  - `ops/google-integrations/google-natural-language-action-map.md`

## Onboarding Bots

- Existing tests show provider onboarding and parent/accountability onboarding
  routes/pages are present.
- Service provider onboarding remains free-listing first.
- Rabbi Mishnah preview exists at `/preview/one-time-mishnah` and
  `/one-time-preview`.
- Next work: turn Rabbi Mishnah lead capture into a dedicated chat-style intake
  and ticket/follow-up path.

## BNA Helper

- Created `ops/bna-helper/bna-helper-tool-audit.md`.
- Current action registry covers core tasks, tickets, decisions, email drafts,
  weekly updates, calendar, provider requests, and student/parent helpers.
- Provider Google Business/Profile link capture is now covered by
  `capture_provider_google_business_link` with Telegram and web-assistant
  routing.
- Missing high-value actions are listed for the next pass.

## Communications / WAPI / CRM

- Created `ops/communications/wapi-crm-audit-and-plan.md`.
- The plan keeps CRM first-party, no-GHL, no-send by default.
- Nati Freeze/Fries is explicitly friend/general contact unless real message
  evidence says otherwise.
- Added and deployed a WAPI phonebook grouping dry-run report:
  `npm run wapi:phonebook-report`, `/api/bna/wapi/phonebook-report`, and
  Operations Communications > WhatsApp > Phonebook grouping.
- The report is read-only/no-send, includes confidence/review flags, aggregate
  manual correction candidates, and keeps Nati Freeze/Fries friend/non-lead by
  default.
- Added and deployed the Telegram note-to-CRM matcher:
  `src/lib/bna/telegram-note-to-crm.js`,
  `POST /api/bna/contact-communications/match-note`, and Telegram `/crm_note`,
  `/whatsapp_note`, `/wa_note`, plus natural-language notes like "that WhatsApp
  with X was about Y".
- The matcher reads local WAPI/WhatsApp communications, scores name/phone/text
  clues, creates a local Telegram/internal CRM note only on a confident match
  or explicit communication id, and never sends WhatsApp messages.
- Added and deployed WAPI manual correction apply/readback:
  `POST /api/bna/wapi/phonebook-corrections`, local
  `bna_wapi_phonebook_corrections` persistence, correction overlay in the
  report, and Operations Apply recommended/Friend non-lead/School interest
  buttons.
- WAPI correction writes require `APPLY_WAPI_CORRECTION`, stay local-only, and
  never send WhatsApp messages or write to an external CRM.
- Added and deployed parent announcement approved-draft persistence/readback:
  `GET/POST /api/bna/parent-announcements`, Operations Communications >
  Announcements readback, and `APPROVE_PARENT_ANNOUNCEMENT` for local selection
  without email, WhatsApp, or social sends.

## Workspaces / UI

- Google settings are now a dedicated compact section instead of only scattered
  Calendar/Classroom connector rows.
- Broader workspace search/switcher and role-badge cleanup remains in the
  existing task queue.

## Tasks / Decisions / Calendar

- Earlier handoff already added typed decision buttons and selected-day
  calendar controls.
- Natural-language task retitle and workspace repair scripts remain open.

## Rabbi App / Backend

- Created `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md` from
  the existing repo audits.
- No live Rabbi site was changed.
- Existing conclusion: `one-time-one-time` is the main backend source;
  `one-time-app` is a mobile companion/reference.

## Tests

- Added `tests/google-workspace-settings-contract.test.js`.
- PASS `node --check server.js`
- PASS focused Google/workspace/Operations tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/google-assignment-system.test.js tests/workspace-person-household-provider-contract.test.js tests/operations-saas-crm-redesign.test.js`
- PASS `npm test` 349/349
- PASS provider Google Business action syntax checks and focused action/
  assistant/Google tests, 44/44.
- PASS latest `npm test` 350/350.
- PASS WAPI phonebook syntax checks, Operations inline parse, focused WAPI/CRM
  tests 17/17, and latest `npm test` 353/353.
- PASS Telegram note-to-CRM syntax checks, focused Telegram/WAPI tests 15/15,
  and final `npm test` 357/357.
- PASS WAPI correction syntax checks, Operations inline parse, focused WAPI/CRM
  correction tests 21/21, and final `npm test` 358/358.
- PASS parent announcement syntax checks, Operations inline parse, focused
  community/Operations/portal tests 38/38, and final `npm test` 360/360.
- PASS task-title cleanup syntax check, focused task/watchdog/reconciler tests
  28/28, live dry-run report, and final `npm test` 367/367.

## Deploy

- PASS pre-deploy `npm run railway:doctor`.
- PASS pre-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-50-47-870Z-live-app-smoke.md`.
- Railway deployment `e38167f2-5e6d-4447-b9d4-e195375c4315` reached SUCCESS.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS local browser smoke on the temporary server:
  - desktop/default viewport: `/operations?view=settings&section=google_workspace`
    rendered 4 Google cards, dry-run/test/OAuth states, and no console errors.
  - mobile 390x844: 4 Google cards rendered, no horizontal overflow, and no
    console errors.
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`.
- Railway deployment `d2ee16bc-cacd-4025-a77d-f1d358d1230c` reached SUCCESS
  for the disconnect/readiness follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS non-mutating live disconnect route probe with a fake id returned 404
  without touching any real token.
- PASS live browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`.
- Railway deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` reached SUCCESS
  for the Drive preview action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`.
- PASS live Drive preview action smoke:
  `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`.
- Railway deployment `03c2c30c-7639-494c-8e05-20863386c054` reached SUCCESS
  for the provider Google Business capture action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`.
- PASS live action catalog/API dry-run smoke:
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
- Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` reached SUCCESS
  for the WAPI phonebook grouping report follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`.
- PASS local and live WAPI phonebook UI/API smokes:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`
  and `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
- Railway deployment `73a812e2-572e-4231-a971-20aef4f52450` reached SUCCESS
  for the Telegram note-to-CRM matcher follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`.
- PASS local and live Telegram note-to-CRM endpoint dry-run smokes:
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`
  and
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.
- Railway deployment `578fc257-386a-49ef-8103-789ca42d7adc` reached SUCCESS
  for the WAPI manual correction follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-13-56-298Z-live-app-smoke.md`.
- PASS local and live WAPI correction endpoint/UI smokes:
  `ops/live-smokes/2026-06-14T16-08-29-510Z-wapi-phonebook-correction-local-smoke.md`,
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-local/report.md`,
  `ops/live-smokes/2026-06-14T16-14-54-502Z-wapi-phonebook-correction-live-smoke.md`,
  and
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-live/report.md`.
- Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e` reached SUCCESS
  for the parent announcement persistence/readback follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`.
- PASS local and live parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`,
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`,
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`,
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
- Task-title cleanup dry-run did not require deployment because it adds local
  CLI/report tooling only. Live dry-run report:
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  scanned 304 tasks, skipped 224 closed tasks, found 0 automatic patch
  candidates, and routed 1 active raw-looking title to manual review.

## Remaining Blockers

- Google OAuth credentials/test users must be confirmed before live test-user
  Google actions can be smoked.
- Drive scope policy still needs approval before turning preview-only Drive
  actions into live Drive reads/writes.
- Live provider GBP API/feed sync still requires provider opt-in,
  `business.manage`, OAuth/test-user setup, and approval.
- Rabbi live URL and admin/member credentials are still needed for live backend
  audit.
- WAPI full phonebook-first conversation workspace still needs a dedicated
  three-pane UI and timeline readback.
- The helper typed action `retitle_task_naturally` is still missing even though
  local CLI dry-run coverage now exists.

## Next Action

Continue with the next remaining scoped item: Rabbi Mishnah lead capture, the
One Time content-library skeleton, missing helper typed actions, or the full
phonebook conversation workspace.
