# Master Execution Selected Work

Date: 2026-06-11
Scope: execute the downloaded master Codex prompt without deploying.

## Preflight Files Read

- `C:\Users\User\Downloads\bna_master_codex_execution_prompt.md`
- `AGENTS.md`
- `MEMORY.md`
- `TASKS.md`
- `memory/2026-06-11.md`
- `tasks-pending/2026-06-11-action-registry-telegram-ui-bot.md`
- `tasks-pending/2026-06-11-production-ui-qa-fix-loop.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- `ops/qa-runs/2026-06-11-parent-student-calendar-polish.md`
- `ops/qa-runs/2026-06-11-operations-restructure-implementation.md`
- `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/implementation-selected.md`
- `ops/ux-audit-runs/2026-06-11-click-map/manifest.json`
- `ops/ux-audit-runs/2026-06-11-click-map/issues.csv`
- `ops/ux-audit-runs/2026-06-11-click-map/actions.csv`
- `ops/ux-audit-runs/2026-06-11-click-map/routes.csv`
- `ops/ux-audit-runs/2026-06-11-click-map/flows.csv`
- `ops/ux-audit-runs/2026-06-11-click-map/top-findings.md`
- `ops/ux-audit-runs/2026-06-11-click-map/implementation-backlog.md`
- `ops/ux-audit-runs/2026-06-11-click-map/navigation-map.md`
- `ops/ux-audit-runs/2026-06-11-click-map/role-workspace-matrix.md`
- `ops/ux-audit-runs/2026-06-11-click-map/context-clarity-failures.md`
- `ops/ux-audit-runs/2026-06-11-click-map/button-action-audit.md`
- `ops/ux-audit-runs/2026-06-11-click-map/mobile-audit.md`

## Drive Screenshot Folder

The requested Drive folder was checked:

- `https://drive.google.com/drive/folders/1J5SdQZKtfJcdd9UX37m4aWZxSBk9OXm0`

It redirected to Google login in this environment, so the live Drive folder could not be read directly. This run uses the local mirrored structured audit artifacts under `ops/ux-audit-runs/2026-06-11-click-map/` and the prior parent/student screenshot QA artifacts under `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/`.

## P0 Issues Selected

- No open P0 items were present in the local structured backlog.
- Re-verify Phase 1 parent/student/provider/calendar P0 acceptance locally:
  - parent/student routes load
  - mobile calendar is readable
  - language state is consistent
  - parent/student helper entry points remain visible and scoped
  - provider participant page remains separate from BNA school accountability
  - no obvious admin/private data exposure in portal contracts

## P1 Issues Selected

- Re-verify the previously fixed parent/student assistant visibility and mobile tap/spacing issues from the prior Phase 1 report.
- Implement Phase 2 Operations Action Registry so Telegram, in-app bot, and UI buttons can call typed backend actions without turning ordinary operations into Codex tasks.
- Wire the Telegram routing layer to prefer typed operations before Codex/development routing.
- Add action metadata, permission checks, dry-run/approval behavior, audit logging, UI button/page mapping artifacts, and tests.

## Deferred Issues

- Broad admin SaaS polish and every Operations settings placeholder are deferred from this run unless directly needed by the action registry or parent/student/provider release acceptance.
- Full provider-admin workspace visual rewrite is deferred; provider participant separation remains in scope.
- Deployment is deferred because the workspace contains many unrelated dirty changes. A clean branch or commit split is required before shipping.

## Executed Phases

1. Phase 1 re-verification: confirm parent/student/provider/calendar release state from the prior polish pass and patch only if a P0/P1 regression is found.
2. Phase 2 implementation: build and test the Operations Action Registry, Telegram action routing, dry-run/approval guards, audit log, and UI mapping artifacts.
3. Phase 3 limited audit: document broad admin issues that remain deferred; avoid admin-wide rewrite.
4. Phase 4 QA/readiness: run required tests/smokes where safe, generate reports, and block deployment if unrelated dirty changes remain.
