# Worktree And Branch Preservation Manifest

Generated: 2026-06-24T20:41:31+03:00

No worktrees or branches were pruned in this clean-slate acceptance run. The
only cleanup performed was removal of two acceptance files accidentally created
by this run in the shared `C:\Users\User\BNA v2.0` checkout. The shared Vimeo
checkout itself was not reset, cleaned, pruned, force-deleted, or reused.

## Preservation Rules Applied

- Unique local work requiring preservation: preserve.
- Dirty/untracked and unknown: preserve.
- Clean ancestor-contained historical evidence: preserve unless a later
  explicit cleanup run approves deletion.
- Generated detached deployment/checkpoint worktrees: reproducible or
  historical, but preserved in this goal.
- No branch or worktree was deleted merely because it is old.

## High-Priority Worktrees

| Worktree | Branch/head | State | Classification | Action |
|---|---|---|---|---|
| `C:/Users/User/BNA v2.0` | `codex/closeout-vimeo-media-20260624` / `6f57d910` | dirty/untracked, not ancestor of `origin/master` | unique local work requiring preservation | Preserved untouched except removal of two accidental acceptance files created by this run |
| `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration` | `codex/preserve-rabbi-closeout-20260624` / `487a660b` | clean, ancestor-contained | already integrated / historical evidence | Preserved |
| `C:/Users/User/Documents/Codex/2026-06-24/clean-slate-integration` | `codex/clean-slate-acceptance-20260624` / starts at `116fea33` | active acceptance worktree | current work | Preserve until PR/merge closeout |

## Local Branches With Unmerged Or Local-Only History

These branches are not deleted in this goal:

| Branch | Head | Classification |
|---|---|---|
| `codex/closeout-vimeo-media-20260624` | `6f57d910` | unique local Vimeo closeout history, preserve |
| `codex/operations-ui-audit-harness-clean` | `b8baede8` | local-only ahead of master, preserve |
| `codex/ramble-to-done-protocol` | `e4c062f3` | local-only ahead of master, preserve |
| `codex/2026-06-18-bna-platform-completion` | `4fd14782` | large local workstream, preserve |
| `release/operations-parent-student-action-registry-2026-06-11` | `09f419e7` | dirty release branch, preserve |
| `parallel/20260619-core` | `f539ec80` | local parallel branch, preserve |
| `parallel/20260619-ingestion` | `3f0c7b30` | local parallel branch, preserve |
| `parallel/20260619-onetime` | `b2fd5039` | local parallel branch, preserve |
| `parallel/20260619-ui` | `c978b63` | local parallel branch, preserve |
| `integration/20260619-platform-finish` | `25609511` | local integration branch, preserve |
| `checkpoint/20260619-platform-completion` | `ba3d314b` | local checkpoint, preserve |

## Dirty Or Untracked Worktrees To Preserve

| Worktree | Classification |
|---|---|
| `C:/Users/User/BNA v2.0` | unique local Vimeo checkout, preserve |
| `C:/Users/User/bna-release-clean` | dirty release branch, preserve until explicit cleanup |
| `C:/Users/User/AppData/Local/Temp/bna-parser-fix-worktree-20260622111219` | dirty temp/parser history, preserve |
| `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff` | dirty active historical One Time worktree, preserve |
| `C:/Users/User/Documents/Codex/2026-06-22/goal-c-users-user-downloads-codex/work/bna-active` | dirty full-audit worktree, preserve |
| `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-a8190b04` | dirty shared-review evidence, preserve |
| `C:/Users/User/Documents/Codex/2026-06-23/goal-c-users-user-downloads-bna/work/bna-reconciliation` | dirty reconciliation worktree, preserve |
| `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane` | dirty One Time control-plane worktree, preserve |
| `C:/Users/User/Documents/Codex/2026-06-24/integration-navigation-owner-review` | dirty owner-review worktree, preserve |

## Clean Ancestor-Contained Or Generated Historical Worktrees

The following were inventoried and preserved as historical evidence or
reproducible detached deployment/checkpoint worktrees:

- `C:/Users/User/AppData/Local/Temp/bna-release-deploy-22fcff0d`
- `C:/Users/User/AppData/Local/Temp/bna-release-deploy-48343f1f`
- `C:/Users/User/BNA-stripe-checkpoint`
- `C:/Users/User/BNA-vimeo-push-20260624`
- `C:/Users/User/BNA-worktrees/20260619-core`
- `C:/Users/User/BNA-worktrees/20260619-ingestion`
- `C:/Users/User/BNA-worktrees/20260619-onetime`
- `C:/Users/User/BNA-worktrees/20260619-ui`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-14-b89c17c0`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-39b5db0e`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-15-68e62775`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-16-be7e46ae`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-17-7efc8ce3`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-19-34c74f22`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-98b293d`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-9h-b71b14c5`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-9i-f741fa91`
- `C:/Users/User/Documents/Codex/2026-06-21/deploy-9j-6c45c4a4`
- `C:/Users/User/Documents/Codex/2026-06-21/one-time-master-pr-ff-deploy-*`
- `C:/Users/User/Documents/Codex/2026-06-21/one-time-req313-clean-a8190b04`
- `C:/Users/User/Documents/Codex/2026-06-22/one-time-shared-review-deploy-*`
- `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio`
- `C:/Users/User/Documents/Codex/2026-06-23/service-provider-studio-integration`
- `C:/Users/User/Documents/Codex/2026-06-24/rabbi-scheller-parity`

## Cleanup Result

- Cleaned worktrees/branches: none.
- Removed command debris: one zero-byte file named `{console.error(e)` in the
  acceptance worktree, plus two acceptance files accidentally created by this
  run in the shared Vimeo checkout.
- Preserved worktrees/branches: all inventoried worktrees and branches above.
