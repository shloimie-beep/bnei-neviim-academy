# Goal-Mode Current Dirty Worktree Commit Groups

Captured: 2026-06-15T03:38:00+03:00
Branch: `cleanup/onboarding-helper-crm-workspace-rabbi`

This is a classification snapshot only. Nothing was staged, reverted, deleted,
or moved for this pass.

## Current State

- `git status --short` entries: 86
- tracked modified files: 44
- untracked files from `git ls-files --others --exclude-standard`: 98
- tracked diff size: 44 files, 16,826 insertions, 2,193 deletions
- original pre-goal snapshot remains:
  `ops/worktree-snapshots/2026-06-14T18-50-41-pre-rabbi-whitelabel-onboarding.md`
- original pre-goal patch/status archives remain:
  `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch`
  and `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`

## Commit Group Recommendation

Do not broad-stage this tree. Use curated `git add -- <files>` groups only.
The safest release/commit order is below.

### Group 1 - Goal Bookkeeping And Durable Memory

Purpose: keep the operator-facing history, durable state, and handoffs aligned.

Files:

- `MEMORY.md`
- `SYSTEM-STATE.md`
- `TASKS.md`
- `memory/2026-06-14.md`
- `memory/2026-06-15.md`
- `ops/agent-changelog.md`
- `ops/agent-task-ledger.jsonl`
- `tasks-pending/2026-06-14-google-onboarding-helper-crm-workspace-followup.md`
- `tasks-pending/2026-06-14-rabbi-sheller-whitelabel-onboarding-google-content.md`
- `tasks-pending/2026-06-14-rabbi-task-ui-helper-workspace-handoff.md`
- `tasks-pending/2026-06-14-one-time-content-library-build.md`
- `tasks-pending/2026-06-14-service-provider-open-join-followup.md`
- this report

Notes:

- Commit this separately from runtime code if the goal is a readable audit
  history.
- `ops/live-smokes/` is ignored by Git; referenced live-smoke reports may exist
  locally without appearing in `git status`.

### Group 2 - Action Registry, Telegram Routing, And Helper Actions

Purpose: bundle typed action definitions, action handlers, route mapping, and
generated registry artifacts.

Files:

- `src/lib/actions/registry.js`
- `src/lib/actions/actions/operations.js`
- `src/lib/bna/telegram-action-router.js`
- `ops/action-registry/actions.json`
- `ops/action-registry/page-action-map.json`
- `ops/action-registry/ui-button-map.md`
- `ops/bna-helper/bna-helper-tool-audit.md`
- `package.json` only for action/tool commands such as
  `task:rabbi-flow-audit`

Covered slices:

- retitle/task/decision workspace helpers
- Rabbi shiur/source-sheet helpers
- referral and private question moderation helpers
- Google Business, Classroom, and launch-calendar preview helpers
- One Time publish-package preview
- notification-center action hooks

Recommended verification before commit:

- `node --check src/lib/actions/registry.js`
- `node --check src/lib/actions/actions/operations.js`
- `node --check src/lib/bna/telegram-action-router.js`
- focused action/Telegram tests

### Group 3 - Server Runtime And Database/APIs

Purpose: ship backend runtime changes together so schema, route, and helper
expectations stay synchronized.

Files:

- `server.js`
- `scripts/setup-one-time-partnership-drive.mjs`
- `src/lib/bna/ai-context.js`
- `ops/one-time-mishnah-class/drive-social-ingestion-map.json`
- `ops/one-time-mishnah-class/drive-social-ingestion-map.md`
- `ops/communications/wapi-crm-audit-and-plan.md`
- `ops/google-integrations/google-natural-language-action-map.md`
- `ops/google-integrations/google-now-vs-later-scope-plan.md`

Covered slices:

- Google Workspace readiness/status/audit APIs
- provider Google Business link capture
- WAPI phonebook/conversation workspace support
- support ticket processed notification drafts
- One Time app access readiness
- One Time question moderation persistence/readback
- private in-app notification schema/APIs
- first-party no-GHL CRM/contact/provider paths

Recommended verification before commit:

- `node --check server.js`
- `node --check scripts/setup-one-time-partnership-drive.mjs`
- focused backend/API tests for the grouped slices

### Group 4 - Operations UI And Public/Portal Surfaces

Purpose: keep the large dashboard/frontend changes separate from backend-only
work, but do not split the Operations dashboard pieces away from the APIs they
depend on during release.

Files:

- `public/operations.html`
- `public/operations-login.html`
- `public/js/bna-bot-widget.js`
- `public/one-time-preview.html`
- `public/parent.html`
- `public/provider.html`
- `public/providers-join.html`
- `public/service-providers.html`

Covered slices:

- Google Workspace readiness, previews, action audit, and approval packets
- One Time Library, package preview, app access readiness, and question queue
- Automation Library / Prompt Browser
- private in-app notification center
- mobile login/input stability
- helper mobile bottom sheet and public helper source-boundary guard
- provider onboarding/join setup and portal cleanup

Recommended verification before commit:

- Operations inline script parse
- focused UI contract tests for changed surfaces
- local browser smoke for any app-visible group being released

### Group 5 - Focused Tests

Purpose: keep the contract tests close to the runtime features, but review them
as their own group if a release needs a smaller risk review.

Tracked modified tests:

- `tests/action-registry-telegram-ui-bot.test.js`
- `tests/google-workspace-settings-contract.test.js`
- `tests/one-time-external-user-portal.test.js`
- `tests/one-time-meeting-drops.test.js`
- `tests/operations-pwa-login.test.js`
- `tests/operations-task-comments-and-dictation.test.js`
- `tests/parent-student-portal-contract.test.js`
- `tests/service-provider-directory.test.js`
- `tests/universal-assistant-contract.test.js`
- `tests/wapi-phonebook-report.test.js`

Untracked new tests:

- `tests/one-time-content-library-workspace.test.js`
- `tests/one-time-onboarding-intake.test.js`
- `tests/operations-automation-library.test.js`
- `tests/operations-notification-center.test.js`
- `tests/rabbi-task-flow-audit.test.js`

Recommended verification before commit:

- focused tests for the matching runtime group
- full `npm test` before any deploy/release commit

### Group 6 - Read-Only Reports, Local Smokes, And Screenshots

Purpose: keep generated QA evidence out of runtime commits unless the report is
intentionally part of the handoff.

Untracked evidence artifacts:

- `ops/local-smokes/`
- `ops/playwright-smokes/2026-06-14-*`
- `ops/playwright-smokes/2026-06-15-*`
- `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`

Recommendation:

- Commit selected Markdown/JSON reports only when they are referenced from a
  handoff/changelog.
- Avoid committing large screenshots unless the visual artifact is the
  deliverable.
- Remove local server PID files from any curated commit:
  `ops/local-smokes/classroom-topic-material-preview/server.pid`
  and `ops/local-smokes/google-business-preview-actions/server.pid`.

### Group 7 - Local Rabbi Task-Flow Audit Tool

Purpose: keep the read-only audit CLI isolated because it has no app-visible
deployment requirement.

Files:

- `scripts/rabbi-task-flow-audit.mjs`
- `tests/rabbi-task-flow-audit.test.js`
- `package.json`
- selected report:
  `ops/system-audits/2026-06-14T23-18-05-374Z-rabbi-task-flow-audit.md`

Guardrail:

- The audit tool has no apply mode and must stay read-only.

Recommended verification before commit:

- `node --check scripts/rabbi-task-flow-audit.mjs`
- `node --test tests/rabbi-task-flow-audit.test.js`

## Release Notes

- The latest deployed app-visible slice was the private Operations in-app
  notification center, deployed as Railway deployment
  `a3c49708-8c22-462a-bb88-60b43abd94c2`.
- Live Google/Classroom/Drive/Google Business adapters remain blocked until
  OAuth/test-user/provider approval and `APPROVE_GOOGLE_LIVE_ADAPTER_TEST`.
- Full One Time member-library/media publishing remains blocked until
  destination, visibility/audience, hosting, connector, smoke item, rollback,
  and `APPROVE_ONE_TIME_MEMBER_LIBRARY_PUBLISHING` decisions are explicit.
- No new staging, commit, deploy, external send, Google write, Drive/video-host
  write, Buffer/social post, checkout/access grant, member-visible publish, or
  external CRM write was performed by this classification pass.
