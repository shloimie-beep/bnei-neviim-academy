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
- For broad source packets, register source metadata and map every captured
  source statement to a requirement or explicit exclusion before closeout.
- Blocked and needs-operator-decision rows must include blocker owner and next
  action.
- Record implementation evidence in the active execution run.
- Update ops/agent-task-ledger.jsonl and ops/agent-changelog.md.
- Run targeted tests, then the required broader verification.
- Do not mark app-visible/server-visible work done without deploy/live evidence
  unless it remains explicitly blocked.
- Withheld deployment text, missing evidence paths, stale git/PR refs, multiple
  active runs, and stale NEXT-SESSION notes are validation failures.

Finish by committing only this scoped work and reporting branch, commit SHA,
files changed, tests, requirement statuses, blockers, and the next prompt.
```
