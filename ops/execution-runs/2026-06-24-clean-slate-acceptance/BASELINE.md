# Baseline

Baseline verified at 2026-06-24T20:41:31+03:00.

## Release Truth

- Current acceptance branch at start:
  `codex/clean-slate-acceptance-20260624`
- Local HEAD at start:
  `116fea3339a922b045857f7ece8cc9a64e7cda64`
- `origin/master` at start:
  `116fea3339a922b045857f7ece8cc9a64e7cda64`
- PR #16:
  merged, merge commit `c14507ab121daa221689ba285c203605bf2d64bf`
- Current Railway production deployment:
  `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7`
- Current Railway deployed SHA:
  `116fea3339a922b045857f7ece8cc9a64e7cda64`
- Live health readback:
  HTTP 200, `status=ok`, database connected, social provider `buffer`
- Previous active pointer:
  `ops/execution-runs/latest.json` pointed to the terminal final release run.

## Queue And Blocker Baseline

- `REQ-20260624-028` remains blocked/read-only and linked to GitHub issue #18.
- No class backfill apply was run.
- Live task queue reconciler reported active machine tasks: 0.
- Fresh read-only production task/Decision census reported Decisions 19,
  Pending 14, Calendar 17, Codex Queue 17, Done / Activity 308, Tasks 625.
- Queue audit reported blocked 48 and broader cleanup remains owner-gated.

## Preservation Baseline

- Shared Vimeo checkout:
  `C:\Users\User\BNA v2.0`, branch
  `codex/closeout-vimeo-media-20260624`, head `6f57d910`, dirty/untracked and
  not an ancestor of `origin/master`. Preserved untouched after removing only
  two acceptance files accidentally created by this run.
- `service-provider-studio-integration`:
  branch `codex/preserve-rabbi-closeout-20260624`, head `487a660b`, clean and
  ancestor-contained in `origin/master`; preserved as historical evidence.
