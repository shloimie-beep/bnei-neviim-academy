# OneTime Email Brand Scope Guardrails - 2026-07-08

Raw input: `raw-input/RAW-20260708-007-onetime-email-brand-scope-guardrails.md`

## Requirements

| ID | Status | Requirement | Evidence |
| --- | --- | --- | --- |
| REQ-20260708-032 | Done, deployed/dry-run verified | OneTime parent invite links use `https://join.onetimeonetime.com` and do not derive from Academy/request host. | `server.js`, `tests/one-time-parent-trial-invite.test.js`; live dry-run preview returned OneTime parent/member/classroom links only. |
| REQ-20260708-033 | Done, deployed/live send verified | OneTime parent invite emails use the scoped OneTime Resend sender identity when configured. | `server.js`, `scripts/watchdog-workspace-scope-guardrails.mjs`; `npm run watchdog:workspace-scope` passed; live send readback provider was `resend`. |
| REQ-20260708-034 | Done, deployed/dry-run verified | Parent invite copy is clean OneTime copy with no Academy/backend language and supports a validated live-shiur Zoom link. | `src/lib/bna/rabbi-emails.js`, `tests/one-time-parent-trial-invite.test.js`; live dry-run accepted a dummy HTTPS Zoom URL for preview validation. |
| REQ-20260708-035 | Done, pushed | Shared-repo workspace-scope guardrail exists and is wired into watchdog closeout. | `scripts/watchdog-workspace-scope-guardrails.mjs`, `package.json`, `tests/workspace-scope-guardrails.test.js`; `npm run watchdog:all` passed. |
| DEC-20260708-007 | Resolved | Live resend to the operator test Gmail requires verified exact Zoom join link and sender readiness. | Exact Zoom link was supplied in chat, sender readiness passed, and one approved parent invite was sent/read back. |
| REQ-20260708-036 | Local verified, pending push/deploy/live smoke | OneTime parent password setup links must land on a OneTime-only setup page, not the generic Academy parent portal/reset surface. | `server.js` routes `/one-time-parent`; `public/one-time-parent.html`; `tests/one-time-parent-trial-invite.test.js`; `scripts/watchdog-workspace-scope-guardrails.mjs`. |
| REQ-20260708-037 | Local verified, pending push/deploy/live send | OneTime parent trial invite setup tokens must be fresh and long-lived enough for a trial invite walkthrough. | `server.js` adds `ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS` capped at seven days and passes it to the trial invite reset token. |
| REQ-20260708-038 | Pending deploy/live smoke | Resend the single approved OneTime parent invite after the setup route and expiry fix are deployed and verified. | Pending production smoke and safe communications readback. |

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
- PASS Railway deployment `9b4ae9c8-8c38-4888-a8c9-f19b918eec3b` reached `SUCCESS` for commit `01e0708621adba58df28f1af30c2b4cc7e9be846`, which includes app commit `3e4c6cae98eee543f6e60907e20c478051583ea7`.
- PASS live dry-run smoke:
  `ops/watchdog-audits/2026-07-08-onetime-parent-invite-scope-dry-run.md`.
- PASS live app smoke:
  `ops/live-smokes/2026-07-08T10-34-18-402Z-live-app-smoke.md`.
- PASS Agent Review live smoke:
  `ops/live-smokes/2026-07-08T10-34-17-527Z-one-time-agent-mode-acceptance-live-smoke.md`.
- PASS shared One Time review live smoke:
  `ops/live-smokes/2026-07-08T10-34-17-754Z-one-time-shared-review-live-smoke.md`.
- PASS live resend/readback:
  `ops/watchdog-audits/2026-07-08-onetime-parent-invite-live-send-readback.md`.

## Follow-up Correction - 2026-07-08

- Source: `raw-input/RAW-20260708-008-onetime-parent-setup-link-expiry.md`.
- Finding: the first live invite used the OneTime domain, but the password setup
  path still opened `/parent`, which is the Academy parent portal surface.
- Finding: the first setup link used the generic one-hour password reset TTL,
  which is too short for a parent trial walkthrough.
- Local fix: `/one-time-parent` route and OneTime-only password setup page
  added; OneTime trial setup token TTL extended through
  `ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS`; invite preview and send path
  now advertise `/one-time-parent`.
- Local verification:
  - PASS `node --check server.js`
  - PASS `node --test tests/one-time-parent-trial-invite.test.js tests/workspace-scope-guardrails.test.js` (6/6)
  - PASS `node scripts/watchdog-workspace-scope-guardrails.mjs --json`
  - PASS route/action registry JSON parse
  - PASS `git diff --check`
