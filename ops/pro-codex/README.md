# Pro to Codex Handoff Workflow

Shloimie brainstorms with ChatGPT Pro, and Pro turns the conversation into a structured implementation prompt.

Codex reads implementation prompts from `ops/pro-codex/inbox/`, then either implements the work or records an exact blocker. A saved brief is not implementation.

Completed prompts get a matching note in `ops/pro-codex/implemented/`. Blocked prompts get a matching file in `ops/pro-codex/blocked/` with the exact blocker, the route/file/command involved, and the next action. Codex writes concise completion summaries in `ops/pro-codex/summaries/`.

Do not store secrets, raw credentials, unredacted credential screenshots, or API keys in these files.
