# Pro To Codex Handoffs

Shloimie brainstorms with ChatGPT Pro.

Pro creates structured implementation prompts.

Codex reads prompts from `ops/pro-codex/inbox/`.

Codex implements or blocks.

Codex moves completed prompts to `ops/pro-codex/implemented/`.

Codex moves blocked prompts to `ops/pro-codex/blocked/` with the exact reason,
route/file/command involved, and next action.

Codex writes summaries to `ops/pro-codex/summaries/`.

Brief saved is not implementation. A saved brief is only intake; Codex must
either implement and verify, or record an exact blocker.
