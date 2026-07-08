# OneTime Email Brand Scope Guardrails - 2026-07-08

Raw input: `raw-input/RAW-20260708-007-onetime-email-brand-scope-guardrails.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-032 | Local verified, pending deploy/live smoke | OneTime parent invite links use `https://join.onetimeonetime.com` and do not derive from Academy/request host. | `server.js`, `tests/one-time-parent-trial-invite.test.js`; `node --test tests/one-time-parent-trial-invite.test.js` passed. |
| REQ-20260708-033 | Local verified, pending deploy/live smoke | OneTime parent invite emails use the scoped OneTime Resend sender identity when configured. | `server.js`, `scripts/watchdog-workspace-scope-guardrails.mjs`; `npm run watchdog:workspace-scope` passed. |
| REQ-20260708-034 | Local verified, pending deploy/live smoke | Parent invite copy is clean OneTime copy with no Academy/backend language and supports a validated live-shiur Zoom link. | `src/lib/bna/rabbi-emails.js`, `tests/one-time-parent-trial-invite.test.js`; focused tests passed. |
| REQ-20260708-035 | Local verified, pending push | Shared-repo workspace-scope guardrail exists and is wired into watchdog closeout. | `scripts/watchdog-workspace-scope-guardrails.mjs`, `package.json`, `tests/workspace-scope-guardrails.test.js`; `npm run watchdog:all` passed. |
| DEC-20260708-007 | Blocked | Live resend to the operator test Gmail requires verified exact Zoom join link and sender readiness. | Do not send live email until exact Zoom join link, OneTime sender readiness, and explicit send approval are verified. |

## Done Criteria

- Focused tests pass.
- `npm run watchdog:workspace-scope` passes.
- No live email send occurs unless exact Zoom link and OneTime sender readiness
  are verified.
- Ledger and changelog are updated after verification.

## Local Verification - 2026-07-08

- PASS `node --check server.js`
- PASS `node --test tests/workspace-scope-guardrails.test.js tests/one-time-parent-trial-invite.test.js tests/one-time-shared-review-branding.test.js tests/one-time-classroom-calendar-community-bot.test.js tests/watchdog-action-registry.test.js` (21/21)
- PASS `npm run watchdog:workspace-scope`
- PASS `npm run watchdog:all`
- PASS `npm run app:smoke:one-time-shared-review` against production baseline after harness update
- FULL SUITE pulse: `node --test --test-reporter=tap` returned 1610/1618 passing with 8 pre-existing failures outside this scope.

## Codex Closeout Note - 2026-07-08

- PASS `node --check server.js`
- PASS `node --test tests/one-time-parent-trial-invite.test.js tests/workspace-scope-guardrails.test.js tests/assistant-portal-communications-contract.test.js` (14/14)
- PASS `npm run watchdog:workspace-scope -- --json` with `findings: []`
- PASS `npm run watchdog:protocol-drift`
- PASS `node --test tests/resend-client.test.js tests/one-time-parent-trial-invite.test.js tests/workspace-scope-guardrails.test.js` (15/15)
- BLOCKED live resend: local `.env*`/`.secrets` scan found `NO_ZOOM_ALIAS_FOUND`, so Codex did not send a new parent invite email.
