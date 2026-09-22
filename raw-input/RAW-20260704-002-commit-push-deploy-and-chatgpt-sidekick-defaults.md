# RAW-20260704-002 - Commit Push Deploy And ChatGPT Sidekick Defaults

Source: codex_chat
Captured: 2026-07-04
Parse status: registered
Requirement register: `tasks-pending/2026-07-04-commit-push-deploy-and-chatgpt-sidekick-defaults.md`

## Raw operator input

Shloimie asked why Codex was not committing and pushing completed work, and
said that after something is finished Codex should clean it, prepare it, push
it live, and not leave it only in the background. He also wants the agent
instructions hardened so this is treated as the obvious default: completed
scoped work should be verified, committed, pushed, and deployed/live-smoked
when app-visible or server-visible.

He also wants GitHub-connected ChatGPT to act as an agentic sidekick: ChatGPT
should read from GitHub, collect preferences and useful information about him
and the system, create structured prompts or packets, and communicate with
Codex through the configured repo-visible/comment dropoff workflow so Codex can
apply the work automatically.

Key clarification from Codex: GitHub-connected ChatGPT reads committed/pushed
GitHub state, not Codex's local dirty worktree. Therefore workflow directives
and prompts meant for ChatGPT must be committed and pushed before ChatGPT can
see them from GitHub.

## Parsed items

- REQ-20260704-201: Make commit/push and deploy/live-smoke the default
  closeout for completed scoped Codex work, with safety gates for unrelated
  dirty files, other Codex windows, secrets, external mutations, and failing
  tests.
- REQ-20260704-202: Make ChatGPT sidekick memory/preference packets a durable
  part of the no-paste ChatGPT-to-Codex workflow.
- REQ-20260704-203: Push the scoped protocol/workflow changes to GitHub so
  GitHub-connected ChatGPT can actually read them.
