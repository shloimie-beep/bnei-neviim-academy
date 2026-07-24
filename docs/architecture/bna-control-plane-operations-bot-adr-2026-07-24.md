# ADR: BNA Control-Plane Operations Bot

- Status: accepted for implementation of the read-only slice only
- Date: 2026-07-24
- Task: `BNA-CONTROL-PLANE-OPERATIONS-BOT-01`
- Base lineage: `codex/platform-agent-actions-telegram-preview`
- Supersedes: any proposal for a broad personal Telegram control plane that
  inherits the academy bridge token, identity, permissions, or business logic
- Related policy:
  `docs/architecture/telegram-control-plane.md`,
  `docs/integrations/telegram-bridge.md`, and `AGENTS.md`

## Decision

Build one separate, default-off BNA process for an operator-owned Telegram bot.
The accepted slice is a redacted notifier and read-only status viewer. It does
not extend `scripts/telegram-kimi-bridge.mjs`, reuse the academy or Rabbi bot,
or join the universal assistant action-execution path.

The live mutation allowlist is exactly:

```json
[]
```

The accepted read-only actions are:

1. `/status` — read a pre-redacted BNA status envelope.
2. `/help` and `/start` — show the fixed read-only contract.
3. `cpob:read_status:v1` — refresh the same status envelope.
4. Status-change notification — send only the same redacted envelope to an
   explicitly allowlisted, private operator chat.

All other commands, callback data, natural-language requests, and payload
shapes are denied. A denied mutation request may return one non-executable
bounded capability category for separate architecture and acceptance review.
The bot never creates, stores, approves, or executes that capability.

## Why This Replaces A Broad Bot Proposal

The existing academy Telegram bridge already owns ordinary chat, media intake,
task routing, hosted-model replies, and Codex handoff. Broadening that monolith
would couple a privileged control surface to customer and provider workflows.
This decision instead uses a distinct identity, configuration namespace,
process, local lease, audit file, status contract, and kill switch.

The bot has no One Time runtime dependency. It does not import One Time modules,
read One Time configuration, call a One Time endpoint, access a One Time
database, or receive One Time sessions/cookies. A BNA status outage therefore
degrades this bot to a generic `unavailable` response and cannot affect the One
Time application or its workers.

## Identity, Ownership, Allowlist, And Lease

The bot must use only the dedicated configuration namespace:

- `BNA_CONTROL_PLANE_OPERATIONS_BOT_PROVIDER`
- `TELEGRAM_BOT_TOKEN_BNA_CONTROL_PLANE`
- `TELEGRAM_BOT_ID_BNA_CONTROL_PLANE`
- `TELEGRAM_CHAT_IDS_BNA_CONTROL_PLANE`
- `BNA_CONTROL_PLANE_OPERATIONS_BOT_OWNER_ID`

There is no fallback to academy, Shloimie, Ahuva, Rabbi, or generic Telegram
token/chat variables. Readiness fails closed if the dedicated token equals a
known existing bot token. Telegram `getMe` must match the configured numeric bot
ID before polling or delivery begins.

Only private chats whose numeric IDs appear in the dedicated allowlist are
accepted. Chat IDs are never returned by readiness, logs, status messages, or
audit records. Actor references are one-way SHA-256 fingerprints.

One process owns
`.runtime/bna-control-plane-operations-bot.lease.json`. The lease contains only
an owner fingerprint and expiry. A process that cannot acquire or renew the
lease does not poll or send. The deployment topology must keep this worker at
one replica because the lease intentionally does not write to a product
database.

## Provider-Off, Kill, And Emergency Revoke

Provider mode defaults to `off`. Missing identity, ownership, allowlist, status
source, pinned HTTPS link base, or status-source contract keeps the provider
off. Provider mode becomes eligible only when explicitly set to `telegram` and
all readiness checks pass.

Either of these variables immediately keeps delivery off:

- `BNA_CONTROL_PLANE_OPERATIONS_BOT_KILL_SWITCH=true`
- `BNA_CONTROL_PLANE_OPERATIONS_BOT_REVOKED=true`

Emergency revoke is: set either switch, stop the isolated worker, revoke the
dedicated token in Telegram, and remove the dedicated allowlist. This does not
require restarting or changing One Time.

## Data Classification

Allowed output is deliberately smaller than ordinary Operations data.

| Class         | Allowed                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| Overall state | `healthy`, `degraded`, `blocked`, `unavailable`, `unknown`                             |
| Case state    | Overall states plus `open`, `running`, `failed`, `needs_review`                        |
| Counts        | Non-negative integer totals for `open`, `blocked`, `running`, `failed`, `needs_review` |
| References    | Uppercase opaque refs matching the versioned contract; no names or source text         |
| Time          | One ISO-8601 `updated_at` value                                                        |
| Links         | Bot-constructed HTTPS links on the configured BNA origin                               |
| Readiness     | Configuration booleans and blocker codes only                                          |

Forbidden input or output includes:

- names, email addresses, phone numbers, addresses, contact identifiers, and
  customer or student records;
- raw messages, notes, transcripts, prompts, file bodies, logs, and exception
  bodies;
- secrets, tokens, authorization headers, passwords, cookies, session IDs, and
  provider credentials;
- One Time sessions, cookies, database rows, imports, customer content, and
  provider identifiers;
- arbitrary URLs or links supplied by the status response.

The status endpoint and the operator link base must use HTTPS and the same
pinned origin. The bot ignores all source URLs and constructs links itself.

## Status Source Contract

The configured read-only endpoint returns only:

```json
{
  "state": "healthy",
  "updated_at": "2026-07-24T12:00:00.000Z",
  "counts": {
    "open": 2,
    "blocked": 1,
    "running": 0,
    "failed": 0,
    "needs_review": 1
  },
  "cases": [
    {
      "ref": "CASE-7C2A10F8",
      "state": "blocked"
    }
  ]
}
```

Unknown keys, forbidden field names, invalid counts, non-opaque references,
unapproved states, oversized case lists, non-HTTPS origins, and cross-origin
links reject the whole response. An upstream failure is rendered as a generic
unavailable state; exception details are not delivered to Telegram.

## Authentication And Confirmation

The accepted read-only slice authenticates the channel through:

1. the dedicated token;
2. verified `getMe` identity;
3. private-chat type;
4. exact chat allowlist;
5. active owner lease;
6. update offset/replay controls; and
7. per-actor rate limits.

There is no confirmation UI for mutations because no mutation is available.
Any future bounded mutation must be a new ADR amendment and implementation
packet containing:

1. one named capability and one typed input contract;
2. a fresh operator re-authentication challenge with a short expiry;
3. a preview that contains the exact target and effect;
4. a second, unique confirmation bound to that preview;
5. an idempotency key and replay window;
6. a compensating action or explicit non-reversibility statement;
7. dedicated tests, audit fields, rate limits, kill behavior, and live smoke;
8. separate operator acceptance before merge or enablement.

Acceptance of this ADR does not accept any future capability.

## Idempotency, Replay, Rate Limits, And Audit

- Telegram update offsets are persisted only in the isolated `.runtime` state
  file. An already-consumed update ID is not processed again after restart.
- Status-change notifications use a fingerprint of the normalized redacted
  envelope and are not sent twice for the same state.
- The default inbound limit is six accepted updates per private actor per
  minute. Rate-limit denials are audited without message content.
- Notification checks default to no more than once per minute and are disabled
  unless explicitly enabled.
- Audit records are JSONL under
  `.runtime/bna-control-plane-operations-bot-audit.jsonl`.
- Audit records contain event type, outcome, actor/update fingerprints,
  command family, optional bounded capability category, and fixed
  `content_stored=false`, `secrets_stored=false`, and
  `one_time_data_stored=false` assertions.
- Raw commands, callback values, messages, chat IDs, tokens, URLs, response
  bodies, and exception text are never audited.

## Explicit Prohibitions

This bot must not:

- run arbitrary Codex prompts or create Agent Work;
- run a shell, subprocess, script, test, deployment, migration, or rollback;
- merge, push, release, restart, or mutate infrastructure;
- send customer/provider communications or perform provider writes;
- accept files, voice, photos, video, forwarded messages, or transcripts;
- read or write product databases directly;
- read or write One Time data;
- import contacts, customers, transcripts, or sessions;
- use browser sessions, cookies, admin sessions, or customer credentials;
- proxy an unrestricted API, LLM, action registry, or natural-language tool
  runner.

## Threat Model

| Threat                                       | Control                                                                   | Residual / response                                    |
| -------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Reusing a privileged existing bot            | Dedicated env namespace, duplicate-token rejection, `getMe` ID pin        | Revoke dedicated token and keep provider off           |
| Unauthorized chat or group adds bot          | Private-chat requirement and exact allowlist                              | Silent deny plus fingerprinted audit                   |
| Prompt injection asks for Codex/shell/deploy | No model/tool runner; fixed command parser; mutation allowlist empty      | Deny and return one non-executable capability category |
| Forged or malicious callback                 | Exact versioned refresh callback only                                     | Answer generically, deny, and audit                    |
| Replay after restart                         | Persisted update offset and status fingerprint                            | Deny/skip already-consumed update                      |
| Status endpoint leaks PII/secrets            | Strict allowlisted schema and forbidden-key scan                          | Reject entire envelope; show unavailable               |
| Link phishing or SSRF                        | HTTPS-only same-origin status and link configuration; bot constructs link | Provider remains off on config mismatch                |
| Token/chat ID leakage                        | No config values in readiness/audit/errors; no response bodies logged     | Rotate token and allowlist                             |
| Duplicate workers                            | Owner fingerprint plus expiring local lease; one-replica topology         | Non-owner process stays off                            |
| Notification flood                           | Change fingerprint, disabled-by-default notifications, rate limits        | Kill switch or revoke                                  |
| BNA status outage                            | Generic unavailable response; caught errors                               | Bot degrades alone                                     |
| One Time contamination                       | No One Time imports, env reads, endpoint, database, or process dependency | Static/focused tests enforce boundary                  |
| Future scope creep                           | One-capability ADR amendment and separate acceptance required             | Mutation remains denied until accepted                 |

## Failure Isolation

Every network boundary returns a safe error code without a provider response
body. A status-source error cannot stop One Time or the academy bridge. A
Telegram send failure is counted only inside this worker and does not alter
product records. Lease loss stops this worker. There is no database migration,
web route, webhook, or shared consumer introduced by this decision.

## Consequences

- The bot is intentionally much less capable than the existing academy
  assistant.
- A dedicated token, bot ID, private allowlist, owner ID, status endpoint, and
  HTTPS BNA link origin are required before it can run.
- Deployment is not part of this task. The process remains provider-off until a
  separate release packet validates the dedicated runtime configuration.
- Any write, send, Codex action, deployment, provider operation, database
  mutation, or One Time access remains a separate rejected scope.
