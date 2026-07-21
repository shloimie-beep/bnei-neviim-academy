# Platform / BNA / Agent Action Validation

Date: 2026-07-21
Branch: `codex/platform-bna-workspace-agent-actions`
Production changed: no

## Commands

- PASS `node --check` on changed JavaScript files:
  `server.js`, `src/lib/actions/types.js`, `src/lib/bna/workspace-taxonomy.js`,
  `src/lib/bna/agent-action-hub.js`, new public JS files, and focused tests.
- PASS `node --test tests/workspace-taxonomy.test.js tests/agent-action-hub.test.js tests/platform-workspace-routes.test.js`
  with 17 passing tests.
- PASS `npm run secrets:audit`.
- PASS `git diff --check`.

## Preview

Local isolated preview:

- `http://127.0.0.1:8095/operations`
- `http://127.0.0.1:8095/operations/school`
- `http://127.0.0.1:8095/operations/workspaces/one-time`
- `http://127.0.0.1:8095/operations/agent-actions`
- `http://127.0.0.1:8095/operations/agent-actions/GHL-UI-01`

Preview mode:

- `PLATFORM_PREVIEW_NO_DB=1`
- Localhost-only auth bypass for new preview routes.
- No production deploy and no external writes.

Screenshots:

- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/super-admin.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/bna-school.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/one-time-connector.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/agent-actions.png`
- `ops/codex-runs/2026-07-21-platform-bna-workspace-agent-actions/agent-action-ghl-ui-01.png`

## HighLevel Import

- `GHL_JOBS_IMPORTED=14`
- Source repository: `shloimie-beep/onetimev2`
- Source ref: `codex/highlevel-api-finalize-agent-queue`
- Source SHA: `1000e8f46210a85f720f83fce2678b24a44fa94d`
- Source path: `integrations/highlevel/agent-mode/GHL-AGENT-MODE-EXPORT.json`
- Source blob SHA: `8982b719dff696fff291fa868130b5900127f324`
- Registry/schema version: `1.0.0`
- First dry-run imported job: `GHL-UI-01`, title `custom-value folders and unresolved value review`, status `ready`.
- Prompt preservation verified from `exact_copy_paste_prompt`.
- Agent Action completed-save/readback smoke passed for `GHL-UI-01`; result ref `AAR-607810b4cfd038db`.
