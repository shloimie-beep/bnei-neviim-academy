# Clean Release Task And Mobile Audit

Date: 2026-06-12
Workspace: `C:\Users\User\bna-release-clean`
Local app: `http://127.0.0.1:8128`

## Why The Mobile-Collapse Work Was Not Visible

The mobile-collapse/product UI ramble was saved. The relevant handoff is:

- `tasks-pending/2026-06-11-production-ui-qa-fix-loop.md`

The release-readiness rollup also recorded that parent/student/provider mobile
QA passed locally, but deployment was **not performed** because the workspace
was too dirty to separate safely:

- `ops/qa-runs/2026-06-11-final-release-readiness.md`

So the issue was not that the ramble was completely lost. The gap was that the
clean deploy path did not yet include every follow-up fix from the later
agent-fleet runs.

## Fixes Applied In This Cleanup

- Restored the Operations task-detail `Report problem` button and in-app support
  ticket modal.
- Replaced the old browser-prompt support-ticket flow with a real modal field
  for Issue, Expected result, title, severity, area, app context, and route.
- Added a one-time task-detail viewport reset for mobile `?task=...` routes so
  the selected task detail starts in view instead of above the mobile viewport.
- Fixed the student portal loading bug caused by `Object.assign(strings.he, ...)`
  referencing an undefined `strings` object. The student portal now uses
  `Object.assign(labels.he, ...)`.
- Added focused contract tests for the support modal, task-detail reset, and the
  student localization typo.

## Task Queue Audit

Initial live/local task audit:

- Total tasks: 249
- Active tasks: 36
- Active Codex tasks: 5
- Active Codex task ids: `491`, `490`, `489`, `488`, `483`
- Open support tickets: 4
- Active tasks older than 3 days: 9, all assigned to Shloimie

The five active Codex tasks were not unresolved implementation work. Their run
reports showed completed fixes that were left in `needs_decision` because the
old OpenAI smoke gate failed with an invalid key.

Closed after current verification:

- Task `483`: Telegram direct-reply routing fix
- Task `488`: remove smoke parent from BNA Enrollment
- Task `489`: positive-intent WhatsApp lead audit/pipeline work
- Task `490`: mobile task-detail page display/reset fix
- Task `491`: clean in-app problem-report field/modal
- Support tickets `3`, `4`, `5`, `6`: closed

Post-cleanup audit:

- Total tasks: 249
- Stage counts: `done=161`, `assigned=18`, `archive=57`, `needs_decision=13`
- Active tasks: 31
- Active Codex tasks: 0
- Open support tickets: 0
- Active tasks older than 3 days: 9, all assigned to Shloimie

The remaining older active items are operator-owned tasks, not stale Codex queue
items:

- `147` Complete Google Business Profile Task
- `159` Finish the current video
- `160` Draft ChatGPT prompt and update the working folder
- `166` Bring circuit building materials to Huda
- `167` Find out about forest trip timing and safety
- `172` Call Hillel's rabbi about learning approach
- `173` Set up updated payment links for new and existing credit-card parents
- `194` Update www DNS/security setup for the BNA website
- `227` Configure student tablets for accountability access

## Mobile Browser Verification

Rendered Playwright smoke at `360x701` passed for:

- Operations task detail route with in-app Report Problem modal
- Operations mobile drawer open/close
- Parent portal menu open, Calendar selection, and collapse
- Student workspace menu open, Calendar selection, and collapse
- Provider participant menu open, Schedule selection, and collapse
- Public homepage hamburger open/close

Screenshot output:

- `ops/qa-runs/2026-06-12-clean-deploy-mobile-smoke/`

No horizontal overflow was detected in the smoke.

## Verification Commands

- PASS `node --test tests/operations-saas-crm-redesign.test.js tests/parent-student-polish-contract.test.js`
- PASS `npm test` 115/115
- PASS inline script parse for `public/operations.html`, `public/parent.html`, `public/student.html`, and `public/provider-participant.html`
- PASS `npm run mobile:smoke`
- PASS `npm run screenshot` with `BNA_APP_URL=http://127.0.0.1:8128`
- PASS `npm run app:smoke` with `BNA_APP_URL=http://127.0.0.1:8128`
  - Report: `ops/live-smokes/2026-06-12T11-40-13-103Z-live-app-smoke.md`
- PASS `npm run openai:smoke` before cleanup
  - Report: `ops/openai-smokes/2026-06-12T11-40-51-620Z-openai-sidekick-smoke.md`
- PASS `npm run openai:smoke` after closing stale Codex tasks
  - Report: `ops/openai-smokes/2026-06-12T11-43-52-779Z-openai-sidekick-smoke.md`

## Current Release Status

Local cleanup is verified.

Next required gate before marking this release externally done:

1. Run full repo tests and screenshot check.
2. Commit and push the focused release branch.
3. Deploy to Railway.
4. Run Railway doctor and live app/OpenAI smoke against production.
