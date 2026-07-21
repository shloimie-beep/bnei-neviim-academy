# Platform / BNA / Agent Action Validation

Date: 2026-07-21
Branch: `codex/platform-bna-workspace-agent-actions`
Production changed: no

## Commands

- PASS `node --check` on changed JavaScript files:
  `server.js`, `src/lib/actions/types.js`, `src/lib/bna/workspace-taxonomy.js`,
  `src/lib/bna/agent-action-hub.js`, new public JS files, and focused tests.
- PASS `node --test tests/workspace-taxonomy.test.js tests/agent-action-hub.test.js tests/platform-workspace-routes.test.js`
  with 16 passing tests.
- PASS `npm run secrets:audit`.

## Preview

Local isolated preview:

- `http://127.0.0.1:8095/operations`
- `http://127.0.0.1:8095/operations/school`
- `http://127.0.0.1:8095/operations/workspaces/one-time`
- `http://127.0.0.1:8095/operations/agent-actions`

Preview mode:

- `PLATFORM_PREVIEW_NO_DB=1`
- Localhost-only auth bypass for new preview routes.
- No production deploy and no external writes.

Screenshots:

- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/super-admin.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/bna-school.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/one-time-connector.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/agent-actions.png`

## HighLevel Import

- `GHL_JOBS_IMPORTED=0`
- Blocker: requested One Time export `integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json` was not present on PR #93 SHA `977e4453c34684cd06359f663d0e8f50dc3645f5` or scanned HighLevel descendant branches.
