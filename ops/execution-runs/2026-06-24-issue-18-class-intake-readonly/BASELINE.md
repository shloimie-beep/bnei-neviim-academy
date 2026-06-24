# Baseline

## Verified Local Baseline

- Dedicated branch/worktree:
  `codex/issue-18-class-intake-readonly-20260624`
- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-24\issue-18-class-intake-readonly`
- Base: `origin/master`
- Base SHA: `50087ae5d8e120830ae8e1f8dcaab71f61389d7c`
- The shared dirty Vimeo checkout at `C:\Users\User\BNA v2.0` was preserved
  untouched.

## Clean-Slate Predecessor

The predecessor active run was
`ops/execution-runs/2026-06-24-clean-slate-acceptance/`. It has been parked
with this run as successor so the single-active-run invariant is preserved.

## Issue #18 Baseline

- GitHub issue #18 is open.
- Existing evidence from the final-release/clean-slate closeout says
  `safe_to_apply=false`, zero approved candidate jobs, and no row-level write
  plan.
- This run starts from that blocked state and may only produce read-only
  evidence and a dry-run plan.
