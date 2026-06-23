# HELPER-03 Scoped BNA Helper Handoff

Status: local implementation verified; blocked on safe deploy/live reconciliation.

Cycle: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

Source: ramble-router attachment
`C:\Users\User\.codex\attachments\c806a662-acf2-4444-a674-2f94af57cc9c\pasted-text.txt`.

## Request Summary

Build one practical BNA Helper entry point that uses real server-side tools,
understands page/workspace/role context, audits redacted tool calls, requires
confirmation for sensitive or external actions, and refuses cross-workspace
access instead of leaking data or faking integrations.

## Initial Repo Audit

- Existing local WS05 helper work is present under `src/lib/bna/helper/` with
  a tool registry, redaction, scoped permissions, deterministic/AI planner, and
  audit-plan persistence.
- Existing protected helper routes are `/api/bna/helper/tools`,
  `/api/bna/helper/plan`, `/api/bna/helper/execute`, and
  `/api/bna/helper/audit`.
- `public/operations.html` already has one Operations `BNA Helper` drawer and
  no obvious second `Command Bot Actions` or duplicate Operations helper
  launcher in the inspected repo source.
- Public/student/parent surfaces use the separate public assistant widget
  (`public/js/bna-bot-widget.js`), which appears to be a scoped public/portal
  helper surface rather than a duplicate Operations control.
- HELPER-03 gap: the current helper does not yet expose the newer
  `/context`, `/message`, `/confirm`, or `/runs/:id` API contract, does not
  return integration readiness through the helper context endpoint, and the
  Operations drawer still calls the older plan/execute flow.
- Live/deployed UI was not yet reconciled in this pass. If a live screenshot
  shows duplicate helper buttons not visible in repo, keep that as a separate
  deploy/source mismatch before deleting UI.

## Planned Local Slice

1. Add HELPER-03 server helpers for context, integration readiness,
   state/result shaping, and confirmation token hashes on top of the existing
   registry.
2. Add `GET /api/bna/helper/context`, `POST /api/bna/helper/message`,
   `POST /api/bna/helper/confirm`, and `GET /api/bna/helper/runs/:id` while
   preserving the older WS05 routes.
3. Update Operations helper context payload and drawer calls to use
   message/confirm, with the older execute route retained for compatibility.
4. Add focused tests for route exposure, context shape, integration readiness,
   permission denial, confirmation gates, missing integration behavior, and
   redaction.
5. Run syntax, focused helper tests, broader tests when practical, and local
   desktop/mobile browser smoke if the app can start with the available local
   environment.

## Guardrails

- Do not enable live external sends, publishes, billing, account grants, Google
  writes, Zoom/Vimeo writes, member publishing, or destructive actions.
- Do not add new GHL runtime or helper behavior. Historical GHL references stay
  inactive per `AGENTS.md`.
- Client-provided role/workspace/selected record context is advisory only; the
  server must recompute identity and scope.

## Completed In This Pass

- Added `GET /api/bna/helper/context`, `POST /api/bna/helper/message`,
  `POST /api/bna/helper/confirm`, and `GET /api/bna/helper/runs/:id` on top of
  the existing helper tool registry and legacy WS05 routes.
- Added helper context/integration helpers under
  `src/lib/bna/helper/context.js` and
  `src/lib/bna/helper/integrations.js`.
- Extended helper audit logging with `client_request_id`,
  `confirmation_token_hash`, `idempotency_key`, and
  `page_context_redacted`, plus matching SQL migrations/indexes in `server.js`
  and redacted readback in `src/lib/bna/helper/audit-log.js`.
- Updated the Operations helper drawer in `public/operations.html` to use the
  newer context/message/confirm/run API contract while retaining legacy
  plan/execute compatibility.
- Added `data-helper-record-type` and `data-helper-record-id` attributes to
  task, student, and content records, and wired Escape to close the helper.
- Expanded `tests/bna-helper-tools.test.js` for HELPER-03 routes, context
  sanitization, integration readiness, confirmation-token gating, and updated
  Operations helper client methods.

## Verification

- `node --check server.js` - pass
- `node --check scripts/telegram-kimi-bridge.mjs` - pass
- `node --check scripts/agent-fleet-supervisor.mjs` - pass
- `node --test tests/bna-helper-tools.test.js` - pass (8/8)
- `node --test tests/operations-filter-dropdown.test.js tests/bna-helper-tools.test.js` - pass (15/15)
- `npm test` - pass (646/646)
- Local browser proof:
  - in-app Browser: verified one visible helper entry on Operations Tasks,
    helper open/close, read-only queue result card/link, and confirmation-gated
    email preview.
  - local Playwright screenshots saved under
    `ops/proofs/helper-03-2026-06-16/`.

## Proof Artifacts

- `ops/proofs/helper-03-2026-06-16/desktop-tasks-helper-queue.png`
- `ops/proofs/helper-03-2026-06-16/desktop-tasks-helper-confirmation.png`
- `ops/proofs/helper-03-2026-06-16/desktop-students.png`
- `ops/proofs/helper-03-2026-06-16/desktop-content.png`
- `ops/proofs/helper-03-2026-06-16/mobile-390-helper-open.png`

## Remaining Blocker

- Local HELPER-03 implementation is complete, but AGENTS.md requires
  app-visible/server-visible work to deploy and pass live doctor/smoke checks
  before the task is closed. This worktree still contains many unrelated local
  changes, so the remaining blocker is an approved safe deploy/live-reconcile
  window or isolated release path before verifying the live helper surface.
