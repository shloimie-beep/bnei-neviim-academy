# Next Session

Current run: `2026-06-23-service-provider-studio`

Current branch/worktree:

- Branch: `codex/service-provider-studio-20260623`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio`
- Base: `origin/master` at `d37a53e608bb2c2760471c35618340cc4e9e8f18`

Open requirements:

- `REQ-20260623-003` through `REQ-20260623-014`: locally implemented and
  verified; terminal Done waits on clean default integration plus deploy/live
  evidence.
- `REQ-20260623-015`: in progress; clean default integration and merge remain.

Exact next command:

```powershell
git fetch origin --prune
```

Then create a clean integration worktree from latest `origin/master`, merge the
verified feature branch `codex/service-provider-studio-20260623`, rerun the
required gates in that integration worktree, and push/merge to the actual
default branch only if the integration tree is clean.

Do not edit `C:\Users\User\BNA v2.0`. Do not deploy, send, charge, provision
Railway resources, mutate DNS, upload to Vimeo, or run live external writes.
