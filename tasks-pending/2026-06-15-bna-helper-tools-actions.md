# WS05 BNA Helper Tool-Using Admin Assistant

Status: local implementation complete; deployment blocked by dirty multi-workstream tree.

## What Changed Locally

- Added `src/lib/bna/helper/` modules for:
  - redaction and stable message hashes
  - result link/result card builders
  - scoped helper permissions
  - helper plan/audit persistence
  - deterministic plus optional AI planner
  - server-side tool registry and execution handlers
- Added additive DB schema in `server.js`:
  - `bna_helper_plans`
  - `bna_helper_tool_audit_log`
- Added protected helper endpoints:
  - `GET /api/bna/helper/tools`
  - `POST /api/bna/helper/plan`
  - `POST /api/bna/helper/execute`
  - `GET /api/bna/helper/audit` for all-scope admins only
- Added a global Operations `BNA Helper` drawer in `public/operations.html`
  with plan cards, confirmation buttons, result cards/links, mobile-safe
  placement, and z-index separation from the public helper launcher.
- Added `tests/bna-helper-tools.test.js`.

## Implemented Tool Coverage

Real/local tools:

- `create_task`
- `update_task`
- `add_task_comment`
- `mark_task_done`
- `create_pending_blocker`
- `request_missing_input`
- `create_decision`
- `add_decision_comment`
- `convert_decision_to_task`
- `send_decision_to_codex`
- `create_codex_work_item`
- `audit_queue_status`
- `show_task_report`
- `create_student`
- `create_content_item`
- `draft_social_post`
- `draft_email`
- `send_email` only when Gmail is configured, otherwise setup-blocker fallback

Fallback/setup-blocker tools:

- `schedule_social_post_via_buffer`
- `create_contact`
- `create_parent`
- `create_course`
- `create_worksheet`
- `create_provider_profile`
- `create_setup_flow`
- `create_automation`

## Verification Performed

- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/bna-helper-tools.test.js`
- PASS focused helper/universal-assistant/Operations inline-script tests 25/25
- PASS full `npm test` 611/611
- PASS local headless Playwright drawer smoke:
  - Operations login succeeded locally
  - `button.bna-helper-launcher` opened `.bna-helper-panel.open`
  - prompt textarea was visible
  - no browser console errors
- PASS in-app Browser drawer smoke:
  - local Operations loaded
  - helper launcher visible
  - helper panel opened
  - prompt textarea had a visible viewport rectangle
- PASS live app smoke:
  `ops/live-smokes/2026-06-15T14-57-17-617Z-live-app-smoke.md`
- FAIL `npm run openai:smoke`:
  - Provider used temporary Kimi-primary mode.
  - All AI data assertions passed.
  - Script exited fail because live `/api/bna/support-tickets` returned
    `500: could not determine data type of parameter $43`.
  - Report:
    `ops/openai-smokes/2026-06-15T14-48-04-575Z-openai-sidekick-smoke.md`

## Guardrails

- Raw tool args stay server-side in the stored plan; the UI renders only
  labels, status, risk, and result links.
- Audit and plan records store redacted args/results.
- Scoped One Time users are limited to task/decision/Codex/report tools for
  `one_time_mishnah_class`.
- Private tools such as student creation, email send, content/social creation,
  and all-scope audit require admin/all scope.
- Buffer scheduling never claims scheduled success until a real Buffer
  scheduling adapter exists.
- No real Buffer schedule/publish, Gmail send, email campaign, WhatsApp/WAPI,
  Google/Drive, billing/access, external CRM/GHL, or connector write was
  performed during verification.

## Remaining Work

1. Create a clean deploy path for WS05.
   The current worktree contains many unrelated local workstreams. Do not
   deploy this whole tree as-is unless Shloimie explicitly approves shipping
   all current local changes together.
2. Apply/deploy the additive helper schema and app bundle.
3. Run Railway doctor after deployment.
4. Run live app smoke after deployment.
5. Run live helper endpoint/API smoke after deployment:
   - `GET /api/bna/helper/tools`
   - plan/create a safe task or Codex work item
   - confirmation-required action returns `needs_confirmation`
   - Buffer scheduling request creates blocker/fallback instead of success
   - scoped One Time login cannot access private BNA/student/payment tools
6. Fix or separately track the live `/api/bna/support-tickets` parameter type
   error that caused `npm run openai:smoke` to fail.

## Needed From Shloimie

- Approval for a safe deploy window or a clean isolated branch/worktree that
  contains WS05 only.
- Confirmation whether to fix the live `/api/bna/support-tickets` smoke
  blocker as part of the same release or as its own task.
