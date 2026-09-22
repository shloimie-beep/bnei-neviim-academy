# Decision Lifecycle Reprocessing - WS02 Handoff

## Status

Local implementation is complete and verified. Live completion is blocked until
the operator provides database/API access or approves a deployment from the
current multi-workstream dirty workspace.

## Implemented

- Added decision-specific task fields and the idempotent
  `bna_decision_reprocess_queue` table in `server.js`.
- Added non-destructive migration SQL in
  `railway-migration-2026-06-15-decision-lifecycle.sql`.
- Decision comments now save the comment first, ignore system/agent loopback
  comments, and reprocess only meaningful human/operator comments.
- Reprocessing dedupes to one active queue row per decision.
- Added `/api/bna/tasks/:id/decision-action` for refresh, add task, send to
  Codex, my task, done, hide, wait external, block, and reopen.
- `Send to Codex` creates or reuses a linked child Codex task instead of
  converting the parent decision into executable machine work.
- Operations decision cards now show explicit decision sections, missing-detail
  warnings, stale/reprocess state, linked tasks, timestamps, and valid action
  buttons.
- Added `scripts/audit-decision-lifecycle.mjs` for dry-run/apply
  classification of existing decisions.

## Verification

- PASS `node --check server.js`
- PASS `node --check scripts/audit-decision-lifecycle.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS Operations inline script parse for `public/operations.html`
- PASS `node --test tests/decision-lifecycle-reprocessing.test.js`
- PASS focused decision/task/comment/intake/agent/action regression set
- PASS focused Google/one-time/Telegram/Whapi regression set
- PASS `node --test tests/one-time-member-library.test.js`
- PASS `node --test --test-concurrency=1 --test-reporter=dot`
- PASS in-app Browser static render via temporary `127.0.0.1` static server:
  Operations shell rendered, no console errors, and the new `/decision-action`
  route text is present in the loaded page.
- PASS `git diff --check` with line-ending warnings only
- NOTE default parallel `node --test --test-reporter=dot` is flaky in the
  already-dirty repo: failing static contract files pass when rerun alone and
  the full suite passes serially.
- BLOCKED `node scripts/audit-decision-lifecycle.mjs` could only write a
  dry-run blocker report because no `DATABASE_URL`, `POSTGRES_URL`, or
  `PG_CONNECTION_STRING` was available.

## Remaining Live Steps

1. Apply the non-destructive migration/startup schema to Railway.
2. Run `scripts/audit-decision-lifecycle.mjs --apply --confirm APPLY_DECISION_CLASSIFICATION`
   with live database access, or run an equivalent live classification pass.
3. Confirm the named decisions are classified:
   - Decide Analytics
   - Pricing
   - Account ownership
   - Software ownership / revenue
   - Parent/student login model
4. Deploy the approved app bundle.
5. Run Railway doctor and live app smoke.
6. Verify in Operations that refreshing/adding comments/actioning a decision
   does not duplicate queue rows, hide/delete real tasks, or create Codex loops.

## Guardrails

- No destructive migration endpoint was used.
- No decision task was deleted or hidden by local scripts.
- No external CRM/GHL runtime, WhatsApp send, email send, Buffer/social action,
  Google write, checkout/billing action, or live connector write was performed.
