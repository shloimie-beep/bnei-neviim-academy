# 06 — Security, Privacy, And Runtime Reliability

## Immediate P0 changes

Before broadening capability:

1. Academy and Rabbi workers fail startup unless token, expected bot identity, channel profile, signed service credential, database/schema, and at least one verified private binding/allowlist are valid.
2. Remove human Basic-auth and caller-supplied role/workspace from the bridge path.
3. Disable direct Telegram Codex CLI, shell, deploy, Railway, migration, Zoom send/update, and connector side-effect commands.
4. Disable/return 410 for the unsigned legacy `/api/bna/telegram` webhook, or replace it with separate secret-token-validated per-profile webhook endpoints using the same identity policy.
5. Redact structured logs. Never log bot tokens, Basic auth, raw chat/user IDs, message bodies, student question text, prompts/responses, credentials, or private connector payloads.
6. Add fresh runtime heartbeat/readiness for both worker profiles.

## Inbound delivery

Telegram polling uses database state, not local correctness files.

1. Poller acquires a channel-instance lease.
2. Read the durable next-update cursor.
3. Call `getUpdates`.
4. In one transaction, insert each update as a unique source envelope and advance the cursor only after durable insertion.
5. Workers claim queued envelopes with `FOR UPDATE SKIP LOCKED` and processing leases.
6. Allocate conversation message sequence under a conversation row lock.
7. Resolve identity/scope, plan, execute, and enqueue the reply in an outbox before marking the envelope succeeded.
8. Memory extraction runs asynchronously after the reply transaction.

Local offset/mode/planning JSON may exist as diagnostics during migration but cannot determine correctness. Remove the global `busy` rejection; serialize a conversation while processing different conversations concurrently.

## Idempotency

For domain actions:

```text
idempotency_key = HMAC(
  identity_key,
  conversation_key,
  source_message_key,
  capability_id,
  canonicalized immutable-scope inputs,
  capability_registry_version
)
```

A unique run constraint ensures one business effect. If the process crashes after business commit but before acknowledgement, retry reads the existing result instead of repeating the action.

Telegram outbound delivery is at-least-once because Telegram does not offer a general client idempotency key. A duplicate notification after an unknown network outcome may occur; a duplicate domain write/send/publish must not.

## Approval security

- Generate a random opaque challenge; store only its hash.
- Bind it to actor/approver identity, channel instance, private chat, conversation, plan/call, capability, exact input/scope/preview/destination hashes, and expiry.
- Telegram callback `from.id`, chat, and bot instance must match.
- Approve via atomic pending -> approved, then executor marks it used atomically.
- Changed args/scope/recipient, expired/reused token, wrong user/chat/bot, generic free-text yes, or callback race fails.
- Financial/access/destructive/deployment capability requires authenticated web step-up and normally remains absent from Telegram manifests.

## External egress

Before model or connector egress:

- apply scope and visibility filters;
- redact secrets, identifiers, emails, phones, internal URLs, and unnecessary private content;
- classify data and enforce connector-allowed data classes;
- record a redacted egress audit without raw content;
- time out and circuit-break connector calls;
- preserve public-web citations but treat content as untrusted.

Never put a private student/contact/question/message into a public web-search query.

## Encryption and identifiers

- HMAC external Telegram user/chat identifiers for lookup with a secret key outside the database.
- Field-encrypt the outbound chat ID and any short-retention raw payload using an authenticated encryption scheme and key ID from the secret manager.
- Support key rotation; ciphertext re-encryption and HMAC dual-read transitions are operational processes, not repo secrets.
- Store redacted payloads/audits only where raw content is unnecessary.

## Outbox and retry

Claim outbox rows with `FOR UPDATE SKIP LOCKED`. Recommended attempts: immediate, 5 seconds, 30 seconds, 2 minutes, 10 minutes, and 1 hour, while honoring Telegram `retry_after`. On final failure create a redacted dead letter and visible operational alert.

Persist provider message ID/result as soon as the API responds. Replay is explicit, audited, and idempotent.

## Worker leadership and shutdown

- Separate runtime keys: `telegram-shloimie-bridge` and `telegram-rabbi-onetime-bridge`.
- Heartbeat every 30–45 seconds; readiness considers stale at no more than 180 seconds.
- Readiness includes expected bot identity, active poll lease, last successful poll, DB reachability, queue depth/oldest age, outbox health, last successful turn, and deployed commit/version.
- Duplicate `getUpdates` conflict means loss of leadership: report and exit rather than compete.
- On SIGTERM stop polling, release leadership, and drain or safely re-lease the current job for at most 25 seconds.

## Observability

Every turn carries trace, span, envelope, conversation, plan, run, and outbox keys. Record redacted structured events for:

- envelope received/claimed/retried/completed/denied/dead-lettered;
- identity resolved/denied;
- scope selected/denied;
- plan validated/rejected;
- capability query/action outcome;
- preview/approval/cancel/use;
- memory proposal/activation/correction/forget;
- outbox delivery/retry/failure;
- worker lease/heartbeat/version.

No metric label contains user text, raw identifiers, or private record content.

## Chaos cases

Automated tests simulate crashes:

- after envelope insert but before cursor advance;
- after cursor advance but before processing;
- after domain commit but before run acknowledgement;
- after Telegram returns success but before outbox acknowledgement;
- during memory consolidation;
- during approval transition.

Expected result: inbound request retained, domain mutation exactly once, terminal result/outbox eventually reached, memory transaction atomic, approval usable once. Only a harmless duplicate outbound notification is tolerated after an unknown delivery outcome.

## Database/RLS caution

Mandatory first defense is a single scoped repository/service layer that refuses unscoped calls. Optional row-level security is a later separately gated migration with a least-privileged application role and `SET LOCAL` scope. Do not enable forced RLS while the current owner connection is still used; that may break production or create false confidence.
