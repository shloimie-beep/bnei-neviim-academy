# Next Session

Continue `RAW-20260702-005` / `REQ-20260702-905`.

Current next action:

1. Commit and push `codex/one-time-clean-integration-20260702`.
2. Open a clean PR against `master`.
3. Keep the next visible operator task as `TASK-20260702-001`: create or
   identify the separate One Time Railway target.
4. Do not run the post-setup deploy/live-smoke packet until the setup checker
   reports the separate One Time Railway target, separate database, and
   `join.onetimeonetime.com` readiness.

PR #62 remains broad and conflict-dirty. Do not force-merge it. Continue clean
ports from current `origin/master` only.
