# Sanitized One Time Conductor Handoff

Task: `BNA-CONTROL-PLANE-OPERATIONS-BOT-01`

## Result

The BNA repository now has a replacement ADR/threat model and an isolated
control-plane Operations bot implementation. The accepted mutation allowlist is
empty. The implementation is a default-off redacted notifier/read-only status
bot only.

## Accepted Behaviors

- Dedicated Telegram token namespace and pinned numeric bot identity.
- Dedicated private-chat allowlist and expiring owner lease.
- `/status`, `/help`, `/start`, and one versioned read-only refresh callback.
- Strict status envelope containing only state, counts, opaque refs,
  timestamps, and bot-built same-origin HTTPS links.
- Optional change-only notifications to allowlisted private chats.
- Denied-action audit containing fingerprints/categories, never raw commands,
  chat IDs, secrets, messages, transcripts, or One Time data.
- Provider-off behavior when any ownership, identity, allowlist, HTTPS source,
  origin, kill, revoke, or lease check fails.
- Generic unavailable response when BNA status cannot be read.

## Still Forbidden

- Arbitrary Codex, Agent Work, shell, deploy, release, rollback, migration, or
  infrastructure control.
- Product/provider/customer writes or sends.
- Product database access from the bot.
- One Time sessions, cookies, imports, endpoints, databases, customer
  transcripts, or provider data.
- Any mutation without a separate ADR amendment for exactly one bounded
  capability, fresh re-authentication, preview, second confirmation,
  idempotency, audit, rollback/non-reversibility, tests, and explicit
  acceptance.

## Release State

- Branch: `codex/bna-control-plane-operations-bot`
- Deployment: not performed and not authorized by this packet.
- Provider: remains off until a separate release packet installs and verifies
  the dedicated bot/runtime configuration.
- One Time Board: not edited.
- One Time checkout: not edited.

## Evidence

- ADR:
  `docs/architecture/bna-control-plane-operations-bot-adr-2026-07-24.md`
- Focused tests:
  `tests/control-plane-operations-bot.test.js`
- Test record:
  `ops/codex-runs/2026-07-24-bna-control-plane-operations-bot/TEST-RESULTS.md`
