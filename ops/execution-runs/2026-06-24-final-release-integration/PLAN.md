# Plan

1. `REQ-20260624-020`: inspect and sync `origin/master` into the release branch
   if needed.
2. `REQ-20260624-021`: integrate lane branches with checkpoint commits.
3. `REQ-20260624-022` through `REQ-20260624-025`: reconcile PR/local history,
   wire shared routes/auth, review migrations, and run the exact release gate.
4. `REQ-20260624-026` through `REQ-20260624-031`: merge, deploy/live-smoke,
   record external readiness, keep unsafe class backfill blocked unless new
   safe evidence appears, update canonical records, then clean safe worktrees.
