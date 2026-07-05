# Commit Push Deploy And ChatGPT Sidekick Defaults - 2026-07-04

## Raw intake

Source: `RAW-20260704-002`

Operator wants Codex closeout to default to verified commit/push and
deploy/live-smoke when app-visible or server-visible. Operator also wants
GitHub-connected ChatGPT to act as a durable sidekick that reads GitHub,
captures preferences/memory candidates, creates structured packets/comments,
and hands them to Codex without paste-heavy manual glue.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260704-002 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-04-commit-push-deploy-and-chatgpt-sidekick-defaults.md |

## Requirements

| ID | Requirement | Workspace/project | Owner | Priority | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|
| REQ-20260704-201 | Make publish-after-done explicit: Codex should clean, verify, stage only scoped work, commit, push, and deploy/live-smoke app/server-visible work when release gates allow. | app_wide / agent_ops | Codex | P1 | `AGENTS.md`, `BNA-START-HERE.md`, and `MEMORY.md` state the default and the safety blockers. | `AGENTS.md`, `BNA-START-HERE.md`, `MEMORY.md` | no | Done locally; pending push |
| REQ-20260704-202 | Make ChatGPT sidekick memory/preference packets explicit and collectable. | app_wide / agent_ops | Codex | P1 | Dropoff directive, README, and template explain `memory_candidate` / `preference_update`; ingestor preserves packet type in Codex task payload; tests cover memory packet pickup. | `ops/chatgpt-ramble-dropoff/**`, `scripts/chatgpt-dropoff-ingestor.mjs`, `tests/chatgpt-dropoff-ingestor.test.js` | no | Done locally; pending push |
| REQ-20260704-203 | Push the scoped protocol/workflow package to GitHub for ChatGPT visibility. | app_wide / agent_ops | Codex | P1 | Relevant verification passes; only scoped workflow files are staged; a scoped commit is pushed to GitHub. | scoped changed files only | no | Pending push |

## Safety boundaries

- Do not stage unrelated app/UI files from the other Codex window.
- Do not deploy this protocol-only package unless running server/client code
  changes require it.
- Do not push secrets, raw private contact exports, raw private message bodies,
  credential material, payment/access/DNS/send mutations, or unverified
  production changes.
- If push/deploy is blocked, record the exact blocker and next action rather
  than claiming Done.

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260704-201 | Done locally; pending push | Protocol docs updated locally with publish-after-done default and GitHub visibility rule. | `rg` readback; `git diff --check` scoped files | Needs commit/push. |
| REQ-20260704-202 | Done locally; pending push | Dropoff directive, README, comment template, ingestor, and test now support memory/preference packet types. | `node --check scripts/chatgpt-dropoff-ingestor.mjs`; `node --test tests/chatgpt-dropoff-ingestor.test.js tests/chatgpt-dropoff-comment-collector.test.js tests/agent-fleet-hardening.test.js` 14/14 | Needs commit/push. |
| REQ-20260704-203 | Pending push | Scoped workflow files identified; unrelated UI/app dirty files are excluded. | `git status --short`; scoped staging pending | Needs push. |
