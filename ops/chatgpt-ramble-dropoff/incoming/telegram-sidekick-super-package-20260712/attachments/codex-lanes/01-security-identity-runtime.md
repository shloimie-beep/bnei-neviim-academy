# Lane 01 — Security, Identity, And Fail-Closed Runtime

**Packet role:** implementation
**Owner:** Codex
**Depends on:** Lane 00 intake/current-state refresh
**Workspace/project:** platform plus One Time profile policy
**High-collision files:** `server.js`, `scripts/telegram-kimi-bridge.mjs`, `scripts/railway-start.mjs`

## Mission

Create the security foundation before broadening Telegram power.

## Implement

- Add/validate channel instances, verified identity bindings, one-time private-chat link flow, and signed worker nonces.
- Derive role/memberships/scope server-side. Remove request/body priority for `actor_role`, workspace, project, approval, and execution flags.
- Add explicit role inheritance; remove “any admin matches any admin.”
- Require nonempty Academy and Rabbi bootstrap allowlists plus verified bindings; validate expected Telegram `getMe` identity.
- Use separate private service identity per worker instead of human Basic auth.
- Redact logs and errors.
- Disable direct raw Codex CLI/shell/deploy/Railway/migration/Zoom send/update/connector-side-effect commands.
- Disable or return 410 for unsigned legacy `/api/bna/telegram`; callbacks must use Telegram's real callback data field if any compatibility route remains.
- Add `telegram-shloimie-bridge` and `telegram-rabbi-onetime-bridge` heartbeat/readiness.

## Do not

- Do not enable broad new tools yet.
- Do not deploy, bind real users, send Telegram messages, or read secrets.
- Do not use names/emails to infer identity.

## Acceptance

- Verified Shloimie private identity resolves `super_admin/all`; verified Rabbi resolves exact One Time provider scope.
- Unknown/revoked/group/wrong-bot/wrong-chat denied before planner or query.
- Body/prompt role and scope injection has no effect.
- Rabbi BNA-targeted request is denied before data access.
- Both workers fail startup when required identity/allowlist/config is missing.
- Logs contain no raw chat/user IDs, message text, credentials, or prompts.
- Raw deploy/Codex/Zoom commands cannot execute.

## Tests

Add identity, profile, role inheritance, signed request replay, callback identity, fail-closed startup, webhook, redaction, and heartbeat tests. Run affected existing Telegram/scope/action/security tests.

## Handback

Record files, migration/preflight status, exact disabled legacy paths, tests, blockers, and next Lane 02 ownership. Do not mark the overall sidekick Done.
