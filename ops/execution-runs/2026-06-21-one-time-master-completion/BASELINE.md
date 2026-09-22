# Baseline

## Git

- Expected prompt branch: `codex/agent-control-center-20260619`
- Actual starting branch: `integration/20260619-platform-finish`
- Actual starting HEAD: `4cb03da4f21c94933a06a729fcf757bd2259652b`
- PR #5 head before this run: `cae87855f1e140668741cb2eeba90dc9dd68abf9`
- Current worktree: dirty before this run, with prior local One Time hardening
  changes and evidence present. These changes are preserved and reconciled.

## Preflight Commands

- `git status --short --branch`: dirty, on `integration/20260619-platform-finish`.
- `git rev-parse HEAD`: `4cb03da4f21c94933a06a729fcf757bd2259652b`.
- `git rev-parse origin/codex/agent-control-center-20260619`:
  `cae87855f1e140668741cb2eeba90dc9dd68abf9`.
- `npm run bna:run:status`: prior hardening run valid, all 19 done.
- `npm run bna:run:validate`: prior hardening run valid.
- `node scripts/audit-secrets.mjs`: passed, 0 tracked secret-risk files.
- `git diff --check`: passed with LF/CRLF warnings only.

## Live Baseline

- Railway doctor passed for `skillful-motivation / production`.
- Active deployment before this run: `f9921a2d-d614-44df-88c0-392d810ddebd`.
- Live app smoke passed:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`.

