# Goal-Mode Progress Report

Date: 2026-06-14

Source brief:
`C:\Users\User\Downloads\BNA_Codex_GoalMode_Onboarding_Helper_CRM_Workspace_Security_Rabbi_2026-06-14.md`

## Result

Partially done. This pass handled, deployed, and live-smoked the highest-risk
privacy item from the brief, then completed the local keyholder security
workflow and the exact Rabbi audit/billing deliverables named in the brief. The
broader onboarding/helper/CRM/workspace/Rabbi bundle still has follow-up work.

## Critical Privacy Fix

- Public student-data leak prevention: deployed and live-smoked.
- `/parent/login?onboard=accountability` now stays in the public
  login/onboarding shell even when a parent session cookie exists.
- `/student/login` no longer auto-opens a private student board from a saved
  `bnaStudentAccessCode`; it clears stale saved codes when no current code is
  present.
- Non-student surfaces clear stale `bnaStudentAccessCode` values so prior
  student browser state cannot follow the visitor around public/parent pages.
- Student portal payloads now redact parent email/phone/name fields for
  student-audience responses while preserving full parent-audience payloads.

## Brand/UI Cleanup

- Not expanded in this pass beyond preserving the already-implemented local
  Rabbi task UI/One Time cleanup work from the dirty tree.

## Workspace/Task/Decision Cleanup

- Existing local goal work was preserved by stashing the dirty state, switching
  to `cleanup/onboarding-helper-crm-workspace-rabbi`, and reapplying it.
- A CRLF-sensitive Operations auth contract test was made line-ending tolerant.
- The Operations parent-to-student link fix is now live in Railway deployment
  `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9`: Contacts > Parents resolves linked
  students from signup id or parent email/student name, shows `Student linked`,
  renders Linked Records/match source, and opens the matching student profile.
- PII-safe live smoke:
  `ops/playwright-smokes/2026-06-14-operations-parent-student-links-live/report.md`.

## BNA Helper

- The shared helper no longer reads student access codes from `localStorage`.
- The helper remains suppressed on the public parent accountability onboarding
  route.

## Keyholder

- Created the local outside-repo keyholder folder:
  `C:\Users\User\BNA-Keyholder`.
- Created the Windows desktop shortcut: `BNA Keyholder`.
- Added `scripts/open-bna-keyholder.ps1` to open/initialize the folder with
  empty secret files, `README.txt`, and `keyholder-log.jsonl`.
- Added `scripts/keyholder-diagnostics.mjs` to report only metadata and
  SHA-256 fingerprint prefixes for keyholder files and matching local
  `.secrets` files.
- Added package commands:
  - `npm run keyholder:open`
  - `npm run keyholder:diagnose`
- Added `docs/local-keyholder.md` and regression coverage in
  `tests/keyholder-diagnostics.test.js`.

## Rabbi App / Billing Audit

- Verified current GitHub refs:
  - `shloimie-beep/one-time-app` main:
    `a3463bc6756ac34d8f304451fa0e5190309b8ae1`
  - `shloimie-beep/one-time-one-time` main:
    `050fe2468a3f5601e74e738c219cbe5c1bdf398e`
- Created the exact requested app audit path:
  `ops/rabbi-scheller/2026-06-14-one-time-app-audit.md`
- Created the exact requested Green Invoice billing advice path:
  `ops/rabbi-scheller/green-invoice-billing-options.md`
- Added `tests/rabbi-scheller-audit-docs.test.js` so those report paths and
  required sections stay present.
- The docs preserve the existing safety calls: no live Rabbi site replacement,
  no live checkout, no invented credentials, no printed setup secret, and no
  BNA school private-data merge.

## Google Workspace Readiness

- Deployed Operations Settings > Google Workspace for Drive, Calendar,
  Classroom, and Google Business Profile readiness.
- Added BNA Operations API alias `/api/bna/integrations/google/status`.
- The panel separates no-OAuth/manual/public-link mode, test-user OAuth, and
  later public production verification. It does not claim live Google sync
  unless a connected account and required scope are present.
- Railway deployment:
  `e38167f2-5e6d-4447-b9d4-e195375c4315`
- Live browser smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`

## Tests Run

- PASS `node --check server.js`
- PASS `node --check public/js/bna-bot-widget.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS focused privacy/assistant/workspace tests:
  `node --test tests/parent-student-portal-contract.test.js tests/workspace-person-household-provider-contract.test.js tests/universal-assistant-contract.test.js`
- PASS `node --test tests/operations-saas-crm-redesign.test.js`
- PASS `npm test` 341/341
- PASS local browser smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-fix/report.md`
- PASS pre-deploy Railway doctor and live app smoke on the previous bundle:
  `ops/live-smokes/2026-06-14T14-24-01-886Z-live-app-smoke.md`
- PASS post-deploy Railway doctor for deployment
  `59b07235-039a-4d0c-9676-8ecea6736390`
- PASS post-deploy live app smoke:
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`
- PASS live public/parent/student privacy smoke:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`
- PASS `node --check scripts/keyholder-diagnostics.mjs`
- PASS focused keyholder diagnostics tests:
  `node --test tests/keyholder-diagnostics.test.js`
- PASS `npm run keyholder:diagnose`:
  `ops/qa-runs/2026-06-14T14-41-27-809Z-keyholder-diagnostics.md`
- PASS focused Rabbi audit doc tests:
  `node --test tests/rabbi-scheller-audit-docs.test.js`
- PASS `npm test` 347/347 after adding the keyholder and Rabbi doc regression
  tests
- PASS final `npm test` 348/348 after Google deployment/source-of-truth updates
- PASS focused Google/workspace/Operations tests:
  `node --test tests/google-workspace-settings-contract.test.js tests/google-assignment-system.test.js tests/workspace-person-household-provider-contract.test.js tests/operations-saas-crm-redesign.test.js`
- PASS pre-deploy Railway doctor and app smoke:
  `ops/live-smokes/2026-06-14T14-50-47-870Z-live-app-smoke.md`
- PASS post-deploy Railway doctor for deployment
  `e38167f2-5e6d-4447-b9d4-e195375c4315`
- PASS post-deploy live app smoke:
  `ops/live-smokes/2026-06-14T14-52-26-757Z-live-app-smoke.md`
- PASS live Google Workspace settings smoke:
  `ops/playwright-smokes/2026-06-14-google-workspace-settings-live/report.md`
- PASS focused Operations parent/student link tests:
  `node --test tests/operations-people-filter.test.js tests/operations-saas-crm-redesign.test.js tests/parent-student-portal-contract.test.js --test-reporter=spec`
  (35/35)
- PASS final `npm test` 350/350 after source-of-truth updates
- PASS current Railway doctor for deployment
  `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9`
- PASS current live app smoke:
  `ops/live-smokes/2026-06-14T15-08-19-575Z-live-app-smoke.md`
- PASS live Operations parent-to-student link smoke:
  `ops/playwright-smokes/2026-06-14-operations-parent-student-links-live/report.md`
- PASS focused registration/nav tests:
  `node --test tests/signup-permissions-mobile-homepage.test.js tests/app-wide-brand-shell.test.js --test-reporter=spec`
  (9/9)
- PASS `npm test` 353/353 after the registration nav overflow fix
- PASS current Railway doctor for deployment
  `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225`
- PASS current live app smoke:
  `ops/live-smokes/2026-06-14T15-41-19-444Z-live-app-smoke.md`
- PASS live registration toolbar/parent-permission smoke:
  `ops/playwright-smokes/2026-06-14-registration-toolbar-permission-live/report.md`

## Deploy

- Deployed to Railway production.
- Deployment: `59b07235-039a-4d0c-9676-8ecea6736390`
- Railway doctor passed after deploy.
- Live app smoke passed:
  `ops/live-smokes/2026-06-14T14-25-57-627Z-live-app-smoke.md`
- Live browser privacy smoke passed:
  `ops/playwright-smokes/2026-06-14-public-portal-privacy-live/report.md`
- Google Workspace readiness panel deployed in Railway deployment
  `e38167f2-5e6d-4447-b9d4-e195375c4315` and live-smoked.
- Operations parent-to-student link fix is live in Railway deployment
  `c4a3bc0f-a2d4-4e1a-b975-50ddd1eaf3e9` and live-smoked with no PII written to
  the report.
- Registration toolbar/parent-permission notice fix is live in Railway
  deployment `bda4f5e4-7cdf-4f2c-b4a2-0d0daaeca225` and live-smoked:
  shared public-site nav on signup/document/thank-you pages, hidden parent
  responsibility acknowledgment with no checkbox, visible notice, black
  Parent 1/Parent 2 heading/label/name input text, and no horizontal overflow
  at the smoked desktop/mobile widths.

## Remaining Blockers

- Continue the broader goal-mode brief: helper action coverage, CRM/contact
  timeline, automations/prompts/drips, provider login, and deeper Rabbi/One
  Time implementation follow-through.

## Next Clear Action

Continue the broader goal-mode brief from the next highest-risk scoped item:
helper action coverage, CRM/contact timeline, automations/prompts/drips,
provider login, or deeper Rabbi/One Time implementation follow-through.
