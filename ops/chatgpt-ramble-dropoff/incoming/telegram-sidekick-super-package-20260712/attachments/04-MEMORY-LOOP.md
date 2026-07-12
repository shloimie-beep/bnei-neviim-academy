# 04 — Durable Memory And Preference Loop

## Principle

All approved assistants use the same memory service, but memory access follows identity and workspace policy. Shared engine does not mean shared contents.

Memory is data, never authority. A remembered instruction cannot override system policy, scope, approval, effect class, tool schema, or safety. Reject attempts to remember permission bypasses.

## Namespaces

| Namespace | Example | Who may read/write |
|---|---|---|
| `identity_private` | Shloimie prefers reports grouped by workspace | That verified identity across authorized internal surfaces |
| `conversation` | “the second question” working reference | Participants authorized for that conversation |
| `workspace` | BNA operating naming convention | Authorized workspace roles; activation requires workspace authority |
| `project` | One Time campaign/report convention | Authorized project roles |
| `provider` | Rabbi's class workflow preference | Authorized provider identities/agents |
| `platform_policy` | Never perform live send without approval | Authorized roles; platform admin activation only |
| `public_session` | Lead is asking about class schedule | One anonymous public session, short retention, no private merge |

Identity-private preferences are not globally visible. Super-admin operational access does not silently expose another person's private preferences. Internal agents see memory only through a short-lived principal delegation.

## Memory kinds

Store only useful durable items:

- `preference`: language, response length/style, report grouping, quiet hours;
- `instruction`: authorized workspace/platform convention;
- `stable_fact`: durable identity/workspace fact with provenance;
- `relationship`: verified non-sensitive relationship context;
- `decision`: settled choice that should guide future work;
- `workflow`: stable process preference;
- `summary`: rolling conversation summary;
- `setup_state`: durable assistant onboarding choice.

Do not use memory for volatile truth such as attendance, payments, schedules, tasks, current questions, connector readiness, or class state. Query the domain source fresh.

## Retrieval loop

1. Resolve immutable `ScopeContext` first.
2. Build allowed namespace keys only from server identity, memberships, conversation, and delegation.
3. Query active, unexpired records with a SQL predicate enforcing namespace, sensitivity, role, and scope before relevance ranking.
4. Retrieve pinned/explicit preferences first, then rolling summary, then relevant recent items. Use a strict item/token budget.
5. Include provenance, confidence, and scope labels in internal context.
6. Keep working object references separately so follow-ups like “only unanswered ones” or “send the second draft” resolve to stored result IDs rather than regenerated text.

Never accept a caller-provided namespace key without validating it against `ScopeContext`. Retrieval caches key by identity plus authorized-scope hash plus memory version; never share caches across tenants.

## Extraction and activation

After a completed turn, an asynchronous extractor may propose structured candidates. Failure never delays or loses the reply.

- Explicit “remember…” preference: validate, choose identity versus workspace scope, acknowledge the scope in plain language, and activate if the speaker has authority.
- Inferred preference: candidate only until confirmation.
- Workspace instruction: required preview showing who inherits it; workspace owner/admin confirms.
- Platform policy: platform super-admin confirms.
- Agent/tool output: proposal only.
- Secret, password, token, payment/auth credential, raw private payload, or policy-override memory: reject.
- Web/file content: never auto-promote; cite it and require explicit reviewed promotion when appropriate.

## Conflict and correction

Explicit/confirmed beats inferred. A newer confirmed item supersedes the older active item for the same subject. Do not overwrite history silently.

If active memories conflict and authority is unclear, mark them `disputed` and ask. Domain facts are not reconciled in memory; query the source of truth.

Activation/supersession is one transaction:

1. lock active record for namespace/kind/subject;
2. insert the new version;
3. mark the old one superseded;
4. append a memory event and redacted audit event;
5. advance namespace memory version and invalidate caches.

## Summarization

Consolidate after approximately 20 new messages, a configured token threshold, or 24 hours:

- create a versioned rolling summary from already scoped messages and redacted tool results;
- reference source message keys;
- retain active objects, decisions, unresolved follow-ups, and stable preference candidates;
- omit raw IDs, secrets, credentials, and unnecessary private content;
- advance `last_summarized_message_key` only after successful transaction.

Do not use a last-turn-only summary. Do not combine threads merely because actor type/name/email text matches.

## User controls

First-class capabilities:

- `memory.list`: “What do you remember about me?”
- `memory.remember`: explicit scoped memory.
- `memory.confirm`: activate a candidate.
- `memory.correct`: supersede with a correction.
- `memory.forget`: delete one subject.
- `memory.forget_conversation`: remove current conversation memory/content under policy.
- `memory.forget_all`: authenticated destructive preview/step-up where legally allowed.

Forget marks the item deleted, removes or crypto-shreds content, appends a redacted event, and invalidates caches. Retained audit contains event/hash/outcome, not the deleted value.

## Retention defaults

Treat these as implementation defaults subject to policy review:

- inbound encrypted raw payload: 7 days; redacted envelope: 30 days;
- internal encrypted message content: 90 days; redacted transcript: 365 days;
- public-session memory: 30 days and never cross-session by guessed PII;
- inferred candidate: 30 days;
- explicit preference: until deleted with annual reconfirmation;
- sent outbox payload: 30 days;
- dead letters: 90 days;
- generic redacted audit: approximately 400 days.

Domain/legal/accounting records keep their domain retention. Assistant audit must not become a duplicate student, financial, or CRM database.

## Required memory tests

- Shloimie sets a concise/report-grouping preference in Telegram; it appears in his Operations helper after restart/deploy and nowhere in Rabbi/public context.
- Rabbi's teaching/tone preference appears in his provider portal and Telegram, not BNA/public.
- One Time workspace workflow memory is visible to authorized One Time agents and super-admin operational context, not public.
- Inferred preferences remain candidates; secrets and policy overrides are rejected.
- Current question/payment/task state is queried fresh despite stale memory.
- Correction supersedes; forget removes retrieval and stored ciphertext/value.
- Same-name identities and reused display emails do not merge.
- Conversation references and message ordering survive restart and two-worker contention.
