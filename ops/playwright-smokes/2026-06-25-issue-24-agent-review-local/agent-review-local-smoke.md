# Issue #24 Agent Review Hub Local Browser Smoke

Generated: 2026-06-25T19:00:00+03:00

Scope: local browser/API verification for `REQ-20260625-026`,
`REQ-20260625-028`, and the relevant local gate in `REQ-20260625-030`.

Base URL: `http://127.0.0.1:18824`

## Environment

- Local server health: `200`, database `connected`.
- Owner login: passed through the Operations login UI.
- Owner scope after login: Super Admin / All Operations.
- Secrets were loaded only into the local server process from the existing
  external BNA env/secrets files. No secret values were printed or copied into
  this worktree.

## Hub Checks

- Protected hub URL: `/operations/agent-review`.
- Logged-out access redirected to Operations login.
- Logged-in hub rendered 9 review contexts.
- Prompt pack rendered 11 mobile-copyable prompt links.
- Newest recording status rendered in the hub summary:
  `PARTIAL / content_job:83`.
- Hub result form and prompt links were visible.

## Bugs Found And Fixed

1. Hub/session page `api()` helpers spread `options` after merged headers.
   Result: calls with CSRF headers dropped `Content-Type: application/json`,
   so Express did not parse `context_key`.
   Fix: spread `options` before merged headers in both pages.

2. JS fetch-based exchange did not leave a usable review-session cookie in the
   browser flow.
   Fix: `/agent-review/session?exchange=...` now consumes the exchange token
   server-side, sets the HttpOnly cookie, and redirects to the clean
   `/agent-review/session` URL before the page loads.

## Session Checks

- Fresh scoped Operations review session created for context
  `operations_super_admin`.
- Exchange URL redirected to clean `/agent-review/session`.
- Clean URL contained no `exchange=` token.
- Session reload preserved the cookie-backed context.
- Visible banner: `Reviewing as BNA Operations / bna_platform`.
- Visible scope: role `super_admin`, workspace `bna_platform`, project
  `bna_school_platform`.
- Session metadata showed `All-access URL: no`.
- Scoped target route included an `agent_review_session` reference.
- Exit control was present.

## Result Drop-Off

- Submitted a redacted review result through the session UI.
- Persisted result reference: `AGR-b9a823fc37acd01b`.
- API readback passed:
  - `session_ref_present=true`
  - `context_key=operations_super_admin`
  - `target_role=super_admin`
  - `workspace_key=bna_platform`
  - `requirement_id=REQ-20260625-027`
  - `prompt_key=operations-super-admin`
  - `status=pass`

## Verification Commands

- PASS `node --test tests/agent-review-hub.test.js` (6/6)
- PASS `node --check server.js`
- PASS local browser smoke described above.

## Guardrails

- Issue #18 remains `NOT SAFE TO APPLY`.
- No class backfill, Drive write/move, paid retranscription, production worker
  retry, send, charge, DNS change, credential/account change, Buffer publish,
  or public publishing was performed.
- The only production-backed write in this smoke was the requested typed Agent
  Review result record.
