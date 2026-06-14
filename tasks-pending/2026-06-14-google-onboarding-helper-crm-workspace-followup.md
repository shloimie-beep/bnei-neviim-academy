# Google / Onboarding / Helper / CRM / Workspace Follow-Up

Date: 2026-06-14

## Current Branch

`cleanup/onboarding-helper-crm-workspace-rabbi`

## Safety Snapshot

- `safety/pre-goalmode-google-onboarding-crm-20260614-173354`
- `.runtime/pre-goalmode-dirty-worktree-20260614-173354.patch`
- `.runtime/pre-goalmode-git-status-20260614-173354.txt`

## Completed In This Pass

- Added BNA Operations API alias:
  `/api/bna/integrations/google/status`.
- Added Operations Settings > Google Workspace.
- Added cards for:
  - Google Drive
  - Google Calendar
  - Google Classroom
  - Google Business Profile
- Cards distinguish no-OAuth/manual, test-user OAuth, and later verification.
- Calendar/Classroom cards use registered dry-run actions:
  - `sync_google_calendar`
  - `sync_google_classroom`
- Drive cards use registered preview-only dry-run actions:
  - `google_drive_find_file_preview`
  - `google_drive_create_doc_preview`
  - `google_drive_create_folder_preview`
  - `google_drive_move_file_preview`
- Google readiness status now merges real OAuth rows from
  `bna_google_connections` into the Operations readiness payload.
- Added confirmation-gated Google connection disconnect/revoke endpoints:
  - `/api/google/connections/:connectionId/disconnect`
  - `/api/bna/integrations/google/connections/:connectionId/disconnect`
- Added approval-gated provider Google Business/Profile link capture:
  `capture_provider_google_business_link`.
- The action stores manual Google profile URLs/Place IDs for provider review
  without calling the live Google Business Profile API.
- Telegram and the web assistant can route natural-language provider Google
  Business/Profile/Maps/Place ID requests into the typed action.
- Added WAPI/Whapi phonebook grouping dry-run report:
  - shared logic: `src/lib/bna/wapi-phonebook-report.js`
  - CLI: `npm run wapi:phonebook-report`
  - API: `/api/bna/wapi/phonebook-report`
  - UI: Operations Communications > WhatsApp > Phonebook grouping.
- The report is read-only/no-send, returns confidence/review flags, includes
  aggregate manual correction candidates, and keeps Nati Freeze/Fries as
  friend/non-lead unless message evidence shows school interest.
- Added Telegram note-to-CRM matcher:
  - shared parser/scorer: `src/lib/bna/telegram-note-to-crm.js`
  - API: `POST /api/bna/contact-communications/match-note`
  - Telegram commands: `/crm_note`, `/whatsapp_note`, `/wa_note`
  - natural-language notes such as "that WhatsApp with X was about Y".
- The matcher reads local WAPI/WhatsApp communications, scores name/phone/text
  clues, and creates a local Telegram/internal CRM note only when the match is
  confident or a communication id is explicit. It never sends WhatsApp
  messages and exposes a dry-run/no-match smoke path.
- Added WAPI/Whapi manual contact correction apply UI:
  - local correction table: `bna_wapi_phonebook_corrections`
  - API: `POST /api/bna/wapi/phonebook-corrections`
  - report overlay/readback for applied corrections
  - Operations Communications > WhatsApp correction buttons for Apply
    recommended, Friend/non-lead, and School interest.
- Correction applies now request a dry-run local CRM write preview first. Final
  apply requires `APPLY_WAPI_CORRECTION` and can update first-party
  `bna_contacts` tags/status plus linked `bna_parent_leads` tags/status/lead
  type. Student, signup, and provider record mutation is skipped. Dry-run calls
  write nothing and return no-send/no-external-write flags.
- Added parent announcement approved-draft persistence/readback:
  - API: `GET /api/bna/parent-announcements`
  - API: `POST /api/bna/parent-announcements`
  - UI: Operations Communications > Announcements
  - durable table: existing `bna_weekly_updates`.
- Parent announcement approval requires `APPROVE_PARENT_ANNOUNCEMENT`, selects
  the parent-visible weekly update locally, and never sends email, WhatsApp, or
  social posts.
- Added task-title cleanup dry-run:
  - script: `scripts/task-title-cleanup-dry-run.mjs`
  - command: `npm run task:title-cleanup`
  - focused test: `tests/task-title-cleanup-dry-run.test.js`.
- The cleanup script is dry-run by default, skips closed tasks unless
  `--include-closed` is supplied, excludes full raw operator wording from
  reports, routes unsafe generated titles to manual review, and requires
  `--apply --confirm APPLY_TASK_TITLE_CLEANUP` before any live task patch.
- Added focused contract test:
  `tests/google-workspace-settings-contract.test.js`.
- Created required docs:
  - `ops/google-integrations/google-now-vs-later-scope-plan.md`
  - `ops/google-integrations/oauth-test-user-plan.md`
  - `ops/google-integrations/google-natural-language-action-map.md`
  - `ops/bna-helper/bna-helper-tool-audit.md`
  - `ops/communications/wapi-crm-audit-and-plan.md`
  - `ops/one-time-mishnah/rabbi-app-access-and-backend-audit.md`
  - `ops/goalmode/2026-06-14-google-onboarding-crm-workspace-ui-report.md`

## Verification Completed

- PASS `node --check server.js`
- PASS focused tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/google-assignment-system.test.js tests/workspace-person-household-provider-contract.test.js tests/operations-saas-crm-redesign.test.js`
- PASS `npm test` 349/349
- PASS local browser smoke on temporary local server:
  - desktop/default viewport rendered 4 Google cards and no console errors.
  - mobile 390x844 rendered 4 cards, no horizontal overflow, and no console
    errors.
- PASS pre-deploy `npm run railway:doctor`.
- PASS pre-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-50-47-870Z-live-app-smoke.md`.
- PASS Railway deployment `e38167f2-5e6d-4447-b9d4-e195375c4315` reached
  SUCCESS.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS live Operations Google Workspace browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`.
- PASS Railway deployment `d2ee16bc-cacd-4025-a77d-f1d358d1230c` reached
  SUCCESS for the disconnect/readiness follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-02-18-301Z-live-app-smoke.md`.
- PASS direct live API read of `/api/bna/integrations/google/status`.
- PASS non-mutating live disconnect route probe with a fake id returned 404
  without touching any real token.
- PASS live Operations Google Workspace disconnect/readiness browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-disconnect-live/report.md`.
- PASS Railway deployment `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` reached
  SUCCESS for the Drive preview action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-07-51-724Z-live-app-smoke.md`.
- PASS live Google Drive preview browser smoke:
  `ops/playwright-smokes/2026-06-14-google-drive-preview-live/report.md`.
- PASS provider Google Business action syntax checks:
  `server.js`, `src/lib/bna/telegram-action-router.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/lib/actions/registry.js`.
- PASS focused provider/action/assistant/Google tests:
  `node --test tests/action-registry-telegram-ui-bot.test.js tests/universal-assistant-contract.test.js tests/google-workspace-settings-contract.test.js tests/service-provider-directory.test.js`
  44/44.
- PASS `npm test` 350/350.
- PASS Railway deployment `03c2c30c-7639-494c-8e05-20863386c054` reached
  SUCCESS for the provider Google Business capture action follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-16-29-530Z-live-app-smoke.md`.
- PASS live action catalog/API dry-run smoke:
  `ops/live-smokes/2026-06-14T15-19-19-000Z-provider-google-business-action-smoke.md`.
- PASS WAPI phonebook syntax checks:
  `server.js`, `src/lib/bna/wapi-phonebook-report.js`, and
  `scripts/wapi-phonebook-report.mjs`.
- PASS Operations inline script parse.
- PASS focused WAPI/CRM tests:
  `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/operations-saas-crm-redesign.test.js`
  17/17.
- PASS `npm test` 353/353.
- PASS local WAPI phonebook browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-local/report.md`.
- PASS Railway deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` reached
  SUCCESS for the WAPI phonebook report follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-40-45-848Z-live-app-smoke.md`.
- PASS live WAPI phonebook API/UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-live/report.md`.
- PASS Telegram note-to-CRM syntax checks:
  `server.js`, `scripts/telegram-kimi-bridge.mjs`, and
  `src/lib/bna/telegram-note-to-crm.js`.
- PASS focused Telegram/WAPI tests:
  `node --test tests/telegram-note-to-crm.test.js tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/telegram-agent-routing.test.js`
  15/15.
- PASS final `npm test` 357/357.
- PASS local Telegram note-to-CRM endpoint smoke:
  `ops/live-smokes/2026-06-14T15-54-29-499Z-telegram-note-to-crm-local-smoke.md`.
- PASS Railway deployment `73a812e2-572e-4231-a971-20aef4f52450` reached
  SUCCESS for the Telegram note-to-CRM matcher follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T15-56-27-842Z-live-app-smoke.md`.
- PASS live Telegram note-to-CRM endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T15-57-04-987Z-telegram-note-to-crm-live-smoke.md`.
- PASS WAPI phonebook correction syntax checks:
  `server.js` and `src/lib/bna/wapi-phonebook-report.js`.
- PASS Operations inline script parse.
- PASS focused WAPI/CRM correction tests:
  `node --test tests/wapi-phonebook-report.test.js tests/whapi-log-sync-contract.test.js tests/contact-role-repair.test.js tests/telegram-note-to-crm.test.js tests/operations-saas-crm-redesign.test.js`
  21/21.
- PASS final `npm test` 358/358.
- PASS local WAPI correction endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-08-29-510Z-wapi-phonebook-correction-local-smoke.md`.
- PASS local WAPI correction UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-local/report.md`.
- PASS Railway deployment `578fc257-386a-49ef-8103-789ca42d7adc` reached
  SUCCESS for the WAPI manual correction follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-13-56-298Z-live-app-smoke.md`.
- PASS live WAPI correction endpoint dry-run smoke:
  `ops/live-smokes/2026-06-14T16-14-54-502Z-wapi-phonebook-correction-live-smoke.md`.
- PASS live WAPI correction UI smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-corrections-live/report.md`.
- PASS WAPI correction local CRM tag apply refinement syntax and focused tests:
  `node --check server.js`,
  `node --check src/lib/bna/wapi-phonebook-report.js`,
  focused WAPI tests 5/5, adjacent WAPI/communications/action tests 33/33.
- PASS final combined `npm test` 360/360 after source-of-truth updates.
- PASS Railway deployment `4c152697-dbd0-4dd7-8834-83b483999459` reached
  SUCCESS for the WAPI local CRM tag apply refinement.
- PASS live WAPI correction endpoint dry-run/confirmation-gate smoke:
  `ops/live-smokes/2026-06-14T16-24-46-381Z-wapi-phonebook-correction-live-smoke.md`.
- PASS live WAPI correction browser smoke:
  `ops/playwright-smokes/2026-06-14-wapi-phonebook-correction-live/report.md`.
- PASS parent announcement syntax and Operations inline parse.
- PASS focused parent announcement/community/Operations/portal tests:
  `node --test tests/community-weekly-updates-contract.test.js tests/operations-saas-crm-redesign.test.js tests/parent-student-portal-contract.test.js`
  38/38.
- PASS final `npm test` 360/360.
- PASS local parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-26-08-240Z-parent-announcement-local-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-local/report.md`.
- PASS Railway deployment `e0f3b52d-b16c-4812-8221-3c4d1fbbc05e` reached
  SUCCESS for the parent announcement follow-up.
- PASS post-deploy `npm run railway:doctor`.
- PASS post-deploy `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T16-27-29-418Z-live-app-smoke.md`.
- PASS live parent announcement endpoint/UI dry-run smokes:
  `ops/live-smokes/2026-06-14T16-28-27-990Z-parent-announcement-live-smoke.md`
  and
  `ops/playwright-smokes/2026-06-14-parent-announcements-live/report.md`.
- PASS task-title cleanup syntax check:
  `node --check scripts/task-title-cleanup-dry-run.mjs`.
- PASS focused task-title cleanup/watchdog/reconciler tests:
  `node --test tests/task-title-cleanup-dry-run.test.js tests/watchdog-soft-repair.test.js tests/task-queue-reconciler.test.js`
  28/28.
- PASS final `npm test` 367/367.
- PASS live task-title cleanup dry-run:
  `ops/system-audits/2026-06-14T16-37-35-442Z-task-title-cleanup-dry-run.md`
  scanned 304 tasks, skipped 224 closed tasks, found 0 automatic patch
  candidates, and routed 1 active raw-looking title to manual review.

## Verification To Run Next

No additional verification is needed for the Google Workspace readiness panel,
Drive preview actions, manual provider Google Business link capture action, or
WAPI phonebook grouping dry-run report, Telegram note-to-CRM matcher, WAPI
manual correction apply UI, parent announcement persistence/readback, or
task-title cleanup dry-run.
Continue with the remaining implementation work below.

## Open Implementation Work

- Add live Drive adapters after the scope policy is approved: search/list,
  create folder, create Doc, and move file are preview-only right now.
- Add Rabbi Mishnah class lead-capture intake route/flow.
- Add missing helper typed actions from the helper audit.

## Deployment Gate

The Google Workspace readiness panel, Drive preview actions, manual provider
Google Business link capture action, WAPI phonebook grouping dry-run report,
Telegram note-to-CRM matcher, WAPI manual correction apply UI, and parent
announcement persistence/readback have cleared the deployment gate. The
task-title cleanup dry-run needed no deployment because it is local CLI/report
tooling only. The broader goal-mode brief is still open for the remaining
onboarding, Google live adapter, full phonebook conversation workspace, helper
typed-action, and Rabbi follow-up work.
