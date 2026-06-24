# Next Session

Resume from:
`C:\Users\User\Documents\Codex\2026-06-24\issue-20-parent-run`

Active run:
`ops/execution-runs/2026-06-24-issue-20-parent-run`

Current branch:
`codex/issue-20-parent-run-20260624`

Open requirement:

- `REQ-20260624-043` - Bot/helper link correctness and agent-mode QA.

Next safe step:

```powershell
npm run bna:run:next
```

Then recheck Git/GitHub/Railway/live baseline only if the branch or live
target has changed. Otherwise begin Batch C using the parent coordination
rules in `COORDINATION.md` and `LANE-MANIFEST.json`.

Batch B is now locally complete. If `npm run bna:run:next` selects
`REQ-20260624-043`, begin the canonical helper/bot destination resolver,
intent matrix, and role-scoped browser QA. Use the local agent browser harness
from `docs/agent-browser-harness.md` for role smokes where a persistent
profile is useful, but do not store screenshots or private authenticated page
content from those profiles in the repo.

Do not run Tier 3 actions without explicit approval:

- production data mutation;
- class backfill apply;
- Drive write/move/upload;
- external sends or social posts;
- charges/refunds/access grants;
- DNS/account permission/credential changes.
