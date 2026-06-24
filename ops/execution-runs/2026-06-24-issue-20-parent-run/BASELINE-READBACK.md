# Issue #20 Baseline Readback

Generated: 2026-06-24T22:55:00+03:00

## Git

- Working branch: `codex/issue-20-parent-run-20260624`
- Working HEAD: `63db04468b1d7695292e922ff6757d1f42aef033`
- Branch base: `codex/issue-18-class-intake-readonly-20260624`
- `origin/codex/issue-18-class-intake-readonly-20260624`:
  `63db04468b1d7695292e922ff6757d1f42aef033`
- `origin/master`: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`

## GitHub

- Issue #18 terminal verdict is posted:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/18#issuecomment-4792923047`
- Issue #18 PR #21 is open and draft:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/21`
- PR #21 head:
  `63db04468b1d7695292e922ff6757d1f42aef033`
- Issue #20 remains open:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/20`

## Execution Run

- Active run pointer:
  `ops/execution-runs/2026-06-24-issue-20-parent-run`
- Issue #18 run is inactive and terminal in this branch.
- Issue #20 parent run is the only active execution run in this branch.

## Live App

Direct health readback:

```powershell
Invoke-WebRequest -Uri 'https://bneineviimacademy.org/api/health'
```

Result:

```json
{"status":"ok","database":"connected","social_post_provider":"buffer"}
```

HTTP status: `200`

## Railway

Command:

```powershell
npm run railway:doctor
```

Result: failed before app/service health because the local Railway CLI context
is currently linked to project `one-time-production`, environment `production`,
with no selected service, and the expected service `skillful-motivation` was not
found.

This is a baseline deployment-tooling blocker for final deploy/live closeout.
It does not prove the live BNA app is down; direct `/api/health` returned 200.
Do not mark any app-visible Issue #20 requirement Done until Railway targeting
is repaired or a current approved deploy/live-smoke path is documented.
