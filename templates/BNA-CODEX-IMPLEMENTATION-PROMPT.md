# BNA Codex Implementation Prompt

```text
You are working in shloimie-beep/bnei-neviim-academy.

Read BNA-START-HERE.md, AGENTS.md, and docs/BNA-RAMBLE-TO-DONE.md.
Inspect ops/execution-runs/latest.json and the active run folder.
Run npm run bna:run:status before editing.

Implement only the next unblocked requirement IDs:
[LIST REQUIREMENT IDS]

Rules:
- Compare current state before editing.
- Do not duplicate existing harnesses, routes, tests, or registers.
- Do not start watch loops, agent fleet loops, full UI crawls, deploys, or
  production-data mutations.
- If a requirement depends on agent-review-package.zip or audit output and that
  package/path is absent, keep it blocked with the exact blocker in the run.
- Record implementation evidence in the active execution run.
- Update ops/agent-task-ledger.jsonl and ops/agent-changelog.md.
- Run targeted tests, then the required broader verification.
- Do not mark app-visible/server-visible work done without deploy/live evidence
  unless it remains explicitly blocked.

Finish by committing only this scoped work and reporting branch, commit SHA,
files changed, tests, requirement statuses, blockers, and the next prompt.
```
