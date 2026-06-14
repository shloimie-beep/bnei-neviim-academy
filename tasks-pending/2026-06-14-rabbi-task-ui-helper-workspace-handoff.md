# Rabbi Task UI / Helper / One Time Preview Handoff

Date: 2026-06-14

Branch: `cleanup/rabbi-workspace-task-ui-helper-20260614-155524`

Safety snapshot:

- Safety branch: `safety/pre-rabbi-task-ui-cleanup-20260614-155524`
- Safety commit: `d98373e Safety snapshot before Rabbi task UI and workspace cleanup`

## Objective

Finish the local BNA Operations task UI/helper cleanup and One Time audit/preview pass, then deploy and live-smoke only after local verification is green.

## Implemented Locally

- Operations shared shell palette now uses BNA blue/gold/soft-blue/parchment
  instead of generic black/gray dashboard tokens.
- Operations topbar/mobile header now uses the BNA icon asset instead of a
  dark text dot.
- Added a workspace context strip showing current workspace, current role,
  viewing scope, and active task filters.
- Replaced `Workspace Bucket` language with `Workspace Status`.
- Task filters now show clearer Workspace, Assignee, Type, Status, and Date
  controls, including Upcoming and No date.
- Decision cards now route option selection through the typed
  `/actions/choose-decision` endpoint.
- Added a typed `/api/bna/tasks/:id/actions/needs-more-info` endpoint and UI
  button so decisions can remain open without choosing a fake option.
- Added selected-day calendar controls:
  - `Add task to this date`
  - `Move selected task to this date`
- Added a preview-only One Time Mishnah funnel:
  - `/preview/one-time-mishnah`
  - `/one-time-preview`
  - Static page: `public/one-time-preview.html`
  - Assets copied into `public/images/one-time-logo-black.png` and
    `public/images/one-time-existing-site-preview.jpg`
- Added audit docs:
  - `ops/audits/2026-06-14-one-time-repo-inventory.md`
  - `ops/audits/2026-06-14-rabbi-scheller-app-backend-advice.md`
  - `ops/audits/2026-06-14-one-time-billing-referral-plan.md`
  - `ops/audits/2026-06-14-bna-helper-action-matrix.md`
- Fixed the Operations login/auth hot path found during local smoke:
  - `operations-login.html` now redirects only when `/api/bna/auth/me` returns
    an authenticated JSON body, not merely HTTP 200.
  - `buildBnaIdentityPayload` no longer runs personal workspace seeding on
    every auth read, so `/api/bna/auth/me` does not block first render.
  - Added regression coverage for both behaviors.

## One Time Repo Findings

- `shloimie-beep/one-time-app` is an Expo/mobile companion prototype with demo
  backend content and no real billing/email/moderation.
- `shloimie-beep/one-time-one-time` is the existing web/backend source with
  Stripe, Resend, Vimeo, media library, analytics, comments/questions, hotline,
  admin, and customer portal surfaces.
- No active GHL/GoHighLevel/LeadConnector runtime was found in the exported One
  Time code.
- `one-time-one-time` needs security hardening before reuse: debug/setup routes,
  a hard-coded setup secret literal, broad CORS, query-token phone exports,
  committed media caches, and missing child/forum moderation states.

## Local Verification

Completed before this handoff was finalized:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused task/brand/Operations tests:
  `node --test tests/operations-saas-crm-redesign.test.js tests/operations-pwa-login.test.js tests/app-wide-brand-shell.test.js tests/bna-brand-shell.test.js tests/operations-task-comments-and-dictation.test.js tests/one-time-preview-page.test.js`
- PASS `npm test` 341/341
- PASS authenticated local Playwright/browser smoke:
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-authenticated/report.md`
  - `/operations?view=tasks`
  - `/operations?view=tasks&section=decisions`
  - `/operations?view=tasks&section=schedule`
  - `/operations?view=service_providers`
  - `/parent`
  - `/student.html`
  - `/signup`
  - `/signup-he`
  - `/preview/one-time-mishnah`
  - widths: 390, 430, 768, 1440

## Deployment Gate

Completed for the BNA app deployment:

- PASS Railway deployment `f8c16762-9a73-4a77-8a9b-c5cbe2a00ec8` reached
  SUCCESS.
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T13-56-08-327Z-live-app-smoke.md`
- PASS live Operations tasks/decisions/schedule/providers smoke and live
  parent/student/signup/preview smoke:
  `ops/playwright-smokes/2026-06-14-task-ui-brand-cleanup-live/report.md`

Do not deploy Rabbi Scheller's live production site or activate payment links.
The One Time page in BNA is preview-only until Shloimie approves launch.

## Remaining Work

- Add fully typed helper actions for natural retitle, add decision option,
  schedule/move task, Rabbi shiur idea, Rabbi source-sheet task, referral
  ledger, and moderated student question flow.
- Add an admin review script/report for cleaning Rabbi task flow without
  silently moving records.
- Confirm Green Invoice vs Stripe billing provider and refund/cancellation
  policy.
- Build forum/question moderation schema and Rabbi review queue before any
  student-facing comments/questions go public.

## 2026-06-14 17:20 Addendum - Public/Portal Privacy Fix

New local work on branch `cleanup/onboarding-helper-crm-workspace-rabbi`:

- Preserved the prior dirty tree with a named stash, switched to the
  goal-mode branch, and reapplied the work.
- Fixed `/parent/login?onboard=accountability` so it shows the public
  onboarding/login shell instead of auto-rendering the private parent portal
  from an existing session.
- Fixed stale student browser state:
  - `/student/login` clears saved `bnaStudentAccessCode` when no current code
    is present.
  - non-student pages clear saved student codes.
  - the universal helper no longer reads saved student access codes from
    `localStorage`.
- Student-audience portal payloads no longer spread the full student DB row;
  parent contact fields are redacted from the student response.
- Local report:
  `ops/goal-mode/2026-06-14-onboarding-helper-crm-workspace-report.md`.
- Local smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`.

Verification:

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused privacy/assistant/workspace tests
- PASS `npm test` 341/341
- PASS local browser privacy smoke

Deployment gate:

- PASS Railway deployment `59b07235-039a-4d0c-9676-8ecea6736390` reached
  SUCCESS.
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`:
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`
- PASS live public/parent/student privacy smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`

The public/portal privacy item from the goal-mode brief is closed. The broader
brief remains open for helper action coverage, CRM/contact timeline,
automations/prompts/drips, provider login, and deeper Rabbi/One Time
follow-through.

## 2026-06-14 17:41 Addendum - Local BNA Keyholder

Completed the keyholder security slice from the goal-mode brief:

- Created local folder `C:\Users\User\BNA-Keyholder` outside the repo.
- Created the desktop shortcut `BNA Keyholder`.
- Added `scripts/open-bna-keyholder.ps1` to initialize/open the folder with
  expected key files, `README.txt`, and `keyholder-log.jsonl`.
- Added `scripts/keyholder-diagnostics.mjs` to report keyholder file metadata,
  normalized lengths, SHA-256 fingerprint prefixes, newline/quote/BOM status,
  last modified time, and `.secrets` fingerprint matches without printing
  secret values.
- Added package commands `keyholder:open` and `keyholder:diagnose`.
- Added `docs/local-keyholder.md`.
- Added `tests/keyholder-diagnostics.test.js`.

Verification:

- PASS `node --check scripts/keyholder-diagnostics.mjs`
- PASS `node --test tests/keyholder-diagnostics.test.js`
- PASS `npm run keyholder:diagnose`:
  `ops/qa-runs/2026-06-14T14-41-27-809Z-keyholder-diagnostics.md`
- PASS `npm test` 345/345

The broader brief remains open for helper action coverage, CRM/contact
timeline, automations/prompts/drips, provider login, and deeper Rabbi/One Time
follow-through.

## 2026-06-14 17:46 Addendum - Official Rabbi Audit Deliverables

Completed the exact Rabbi/One Time report paths named by the goal-mode brief:

- Added `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md`.
- Added `ops/rabbi-scheller/green-invoice-billing-options.md`.
- Added `tests/rabbi-scheller-audit-docs.test.js`.
- Rechecked GitHub refs:
  - `one-time-app` main:
    `a3463bc6756ac34d8f304451fa0e5190309b8ae1`
  - `one-time-one-time` main:
    `050fe2468a3f5601e74e738c219cbe5c1bdf398e`

Verification:

- PASS `node --test tests/rabbi-scheller-audit-docs.test.js`
- PASS `npm test` 347/347

The docs are still audit/advice only. Do not replace Rabbi Scheller's live site,
activate checkout, invent credentials, or merge One Time member/media/payment
records into BNA school private records without approval.
