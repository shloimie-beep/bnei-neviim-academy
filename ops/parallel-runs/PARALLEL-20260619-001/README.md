# PARALLEL-20260619-001

Coordinator setup for the parallel BNA platform finish run.

This folder is a coordination layer only. It does not implement product
features and does not grant workers permission to mutate production, deploy,
push, edit shared entrypoints, or touch external accounts.

## Checkpoint

- Branch: `checkpoint/20260619-platform-completion`
- Commit: `b2fd5039990ee1cb370a49d4475a7763fb8548b7`
- Tag: `checkpoint-parallel-20260619-001`
- Prior run: `ops/execution-runs/2026-06-18-bna-platform-completion/`
- Linked run: `ops/execution-runs/2026-06-19-parallel-platform-finish/`

## Workers

| Worker | Branch | Worktree | Scope |
| --- | --- | --- | --- |
| W1 | `parallel/20260619-core` | `C:\Users\User\BNA-worktrees\20260619-core` | Core platform backend and data |
| W2 | `parallel/20260619-ui` | `C:\Users\User\BNA-worktrees\20260619-ui` | SaaS UI and product experience |
| W3 | `parallel/20260619-ingestion` | `C:\Users\User\BNA-worktrees\20260619-ingestion` | Ramble queue, parser, agent loop, content prompt |
| W4 | `parallel/20260619-onetime` | `C:\Users\User\BNA-worktrees\20260619-onetime` | One Time partner instance and integrations |

Runtime status lives outside Git at
`C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\`.

## Rules

- Workers 1-4 own only the paths listed in `FILE-OWNERSHIP.md`.
- Workers 1-4 must not edit the shared-file deny list.
- Shared entrypoint needs go in
  `ops/parallel-runs/PARALLEL-20260619-001/workers/<worker>/INTEGRATION.md`.
- Prompt 05 owns final shared-file integration.
- External gates in `DECISIONS-AND-EXTERNAL-GATES.md` require operator approval.
