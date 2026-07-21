# Codex Prompt - PKT-20260721-001

Implement the platform taxonomy correction and Agent Action drop-off on branch `codex/platform-bna-workspace-agent-actions` in the isolated BNA worktree.

Use the canonical workspace keys:

- `platform_control` / `platform_operations` / `platform_super_admin` for Super Admin.
- `bna_school` / `bna_school` for BNA School.
- `one_time` / `one_time_mishnayos` for the One Time external product connector.

Required implementation:

- Add a compatibility resolver and non-destructive migration plan for legacy aliases.
- Add normal operator routes `/operations/school`, `/operations/workspaces/one-time`, and `/operations/agent-actions`; keep `/operations` as the Super Admin control layer.
- Add a workspace switcher with Super Admin, BNA, and One Time.
- Port safe BNA school workspace semantics from PR #134 without merging the PR.
- Reuse safe Agent Review session/CSRF/idempotency/result-readback/emergency-save patterns for generalized Agent Action jobs.
- Preserve all existing Agent Review routes and behavior.
- Implement safe HighLevel queue importer behavior, but treat the missing One Time JSON export as a scoped blocker rather than fabricating jobs.
- Encode ticket-routing distinctions for live class questions, HighLevel business conversations, and Super Admin technical tickets.
- Update route/action registries and focused tests.
- Start an isolated preview and do not deploy BNA production.

Validation:

- `node --check` on changed JS.
- Focused taxonomy, route, school workspace, and Agent Action idempotency/readback tests.
- `npm run secrets:audit`.
- `git diff --check`.

Final response must begin with the exact required status block from the raw prompt.
