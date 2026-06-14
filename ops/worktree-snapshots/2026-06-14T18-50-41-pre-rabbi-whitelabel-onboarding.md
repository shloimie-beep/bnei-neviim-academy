# Worktree Snapshot: Rabbi White-Label Onboarding Preflight

Timestamp: 2026-06-14T18:50:41+03:00

## Current Branch

`cleanup/onboarding-helper-crm-workspace-rabbi`

## Remote URLs

- `origin` fetch: `https://github.com/shloimie-beep/bnei-neviim-academy.git`
- `origin` push: `https://github.com/shloimie-beep/bnei-neviim-academy.git`

## Snapshot Archives

- Tracked diff patch: `.runtime/pre-rabbi-whitelabel-onboarding-20260614-185041.patch`
- Status inventory: `.runtime/pre-rabbi-whitelabel-onboarding-status-20260614-185041.txt`

## Git Summary

- Porcelain status entries: 78
- Modified tracked files: 35
- Untracked files: 139
- Deleted files: 0
- Renamed/moved files: none reported by `git diff --name-status`

## Recent HEAD

`d98373e` - Safety snapshot before Rabbi task UI and workspace cleanup

Other branch labels currently pointing at HEAD include:

- `safety/pre-rabbi-task-ui-cleanup-20260614-155524`
- `safety/pre-goalmode-google-onboarding-crm-20260614-175347`
- `safety/pre-goalmode-google-onboarding-crm-20260614-173354`
- `cleanup/rabbi-workspace-task-ui-helper-20260614-155524`

## Modified Tracked Files

Source and app behavior:

- `server.js`
- `public/operations.html`
- `public/operations-login.html`
- `public/parent.html`
- `public/student.html`
- `public/js/bna-bot-widget.js`
- `public/css/bna-app-shell.css`
- `public/css/bna-site-nav.css`
- `src/lib/actions/actions/operations.js`
- `src/lib/actions/registry.js`
- `src/lib/bna/telegram-action-router.js`
- `package.json`

Tests:

- `tests/action-registry-telegram-ui-bot.test.js`
- `tests/app-wide-brand-shell.test.js`
- `tests/bna-brand-shell.test.js`
- `tests/operations-pwa-login.test.js`
- `tests/operations-saas-crm-redesign.test.js`
- `tests/operations-task-comments-and-dictation.test.js`
- `tests/parent-student-portal-contract.test.js`
- `tests/universal-assistant-contract.test.js`
- `tests/workspace-person-household-provider-contract.test.js`

Docs, memory, and operating state:

- `AGENTS.md`
- `MEMORY.md`
- `SYSTEM-STATE.md`
- `TASKS.md`
- `memory/2026-06-14.md`
- `ops/agent-changelog.md`
- `ops/agent-task-ledger.jsonl`
- `tasks-pending/2026-06-13-registration-toolbar-permission-live-deploy.md`
- `tasks-pending/2026-06-14-operations-parent-student-links-live-deploy.md`
- `tasks-pending/2026-06-14-workspace-person-household-provider-architecture.md`

Action registry state:

- `ops/action-registry/actions.json`
- `ops/action-registry/page-action-map.json`
- `ops/action-registry/ui-button-map.md`

Repo hygiene:

- `.gitignore`

## Untracked File Groups

- `ops/`: 123 files, mostly audit docs, goal-mode reports, Google integration docs, Playwright smoke reports, QA reports, and Rabbi/One Time reports.
- `tests/`: 5 focused contract tests for Google settings, keyholder diagnostics, One Time preview, Rabbi audit docs, and WAPI phonebook grouping.
- `scripts/`: 3 utility scripts for keyholder diagnostics/opening and WAPI phonebook reporting.
- `public/`: 3 preview/image assets for One Time.
- `src/`: 2 WAPI/Telegram CRM helper modules.
- `tasks-pending/`: 2 new handoff briefs.
- `docs/`: 1 local keyholder doc.

## Large / Generated / Runtime Files That Should Be Reviewed Before Commit

- Playwright screenshot folders under `ops/playwright-smokes/`.
- QA JSON/Markdown output under `ops/qa-runs/`.
- Local smoke/live smoke reports under `ops/live-smokes/` are not currently untracked in this snapshot but should stay grouped separately when present.
- Existing root runtime logs such as `tmp-*.log` are present in the workspace and should not be swept into a feature commit.
- `.runtime/` contains patch/status safety archives and is operational evidence, not product source.

## Files That Look Like Source Changes

- `server.js`
- `public/operations.html`
- `public/operations-login.html`
- `public/parent.html`
- `public/student.html`
- `public/js/bna-bot-widget.js`
- `public/css/bna-app-shell.css`
- `public/css/bna-site-nav.css`
- `src/lib/actions/actions/operations.js`
- `src/lib/actions/registry.js`
- `src/lib/bna/telegram-action-router.js`
- `src/lib/bna/telegram-note-to-crm.js`
- `src/lib/bna/wapi-phonebook-report.js`
- `scripts/keyholder-diagnostics.mjs`
- `scripts/open-bna-keyholder.ps1`
- `scripts/wapi-phonebook-report.mjs`

## Files That Look Like Reports / Logs / Test Output

- `ops/audits/*`
- `ops/bna-helper/*`
- `ops/communications/*`
- `ops/goal-mode/*`
- `ops/goalmode/*`
- `ops/google-integrations/*`
- `ops/one-time-mishnah/*`
- `ops/playwright-smokes/*`
- `ops/qa-runs/*`
- `ops/rabbi-scheller/*`

## Recommended Commit Grouping

Do not make one giant commit from the current tree. Recommended groups:

1. Public/portal privacy and registration toolbar deploy closure.
2. Rabbi/One Time preview page, assets, audit docs, and related tests.
3. Google Workspace readiness panel and preview-only actions.
4. Keyholder workflow scripts, docs, diagnostics, and tests.
5. WAPI phonebook grouping report, Telegram note-to-CRM helper, UI/API, and tests.
6. Operations task UI/action registry/workspace-helper cleanup.
7. Memory, task ledger, changelog, system state, and handoff docs.
8. Generated Playwright/QA reports, committed only when they are intentionally useful as evidence.

## Decision

The worktree is too broad to batch-commit safely without another classification pass, so this preflight used the safe messy-worktree path: preserve the tracked diff and status inventory, then continue from the existing cleanup branch without deleting or reverting any user or prior-agent work.
