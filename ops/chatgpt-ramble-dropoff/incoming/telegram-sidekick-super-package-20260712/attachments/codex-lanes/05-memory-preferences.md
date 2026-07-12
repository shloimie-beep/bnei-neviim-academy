# Lane 05 — Durable Scoped Memory And Preferences

**Packet role:** implementation
**Owner:** Codex
**Depends on:** Lane 03; may parallel Lane 04 only without shared-file collision

## Mission

Replace local daily-file recall and last-turn summaries with durable, correct, user-controllable memory shared only across authorized surfaces.

## Implement

- Canonical memory items/events, encrypted/redacted values, namespace access, version/cache invalidation, lifecycle and retention worker.
- Retrieval after immutable scope resolution; identity/private, conversation, authorized workspace/project/provider, platform policy, and public-session predicates.
- Explicit `memory.list`, `remember`, `confirm`, `correct`, `forget`, conversation/all forgetting capabilities.
- Async extractor and versioned rolling summary with provenance/object refs.
- Agent delegation memory intersection and proposal-only agent writes.
- Legacy DB summaries become candidates after identity/scope reconciliation; no automatic Markdown import.

## Policy

- Memory never grants authority or overrides policy.
- Explicit personal preferences may activate; inferred remain candidate.
- Workspace memory needs authorized preview/confirmation.
- Secrets, credentials, private raw payloads, mutable domain state, web-page instructions, and policy overrides are rejected.
- Correction supersedes; forget removes/crypto-shreds value and retains redacted event only.

## Tests

Cross-surface same identity, restart/deploy persistence, Rabbi/BNA/public isolation, same-name non-merge, candidate/confirmation, correction/conflict, forget/expiry, secret rejection, policy override rejection, stale domain fact not used, summary provenance and ordering, agent delegation limits.

## Handback

Return namespace matrix, retention values, migration/import status, memory acceptance evidence, and privacy/security blockers.
