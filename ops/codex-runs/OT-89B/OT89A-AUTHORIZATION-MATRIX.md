# OT89 Authorization Matrix

## Governing invariants

1. A technical or complaint ticket is a subscriber-only capability. The caller must have an authenticated One Time session, the session account must match the requested account, and the account must have an active `one_time` entitlement at the instant the submission transaction is committed.
2. Anonymous users, expired subscribers, inactive subscribers, and authenticated users without the One Time entitlement receive no public ticket form or public ticket API. They receive the existing public WhatsApp lead path only.
3. BNA is the authoritative ticket database and workflow control plane. One Time owns only the subscriber-facing receipt, delivery outbox, attachment source objects, and a cached status projection.
4. Telegram is an authenticated alert and decision transport. It does not own ticket state, and a Telegram callback is not successful until BNA records the authorized decision idempotently.
5. Every user-supplied field and attachment is untrusted. Authorization never converts user text into an executable command, SQL fragment, shell argument, Codex prompt, or Telegram callback payload.

## Decision table

Legend: **Allow** means the operation is permitted after the stated server-side checks. **Deny** means the route or action must fail closed. **Conditional** means an additional service or operator policy gate is required.

| Principal | See subscriber support entry | Submit ticket | Upload attachment | Read ticket status | Read another account's ticket | Ingest signed event | Read BNA ticket | Mutate BNA state | Use Telegram decision | Run diagnostics | Change code or deploy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Anonymous public user | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Authenticated user without One Time entitlement | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Authenticated user with expired or inactive entitlement | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| Authenticated active One Time subscriber | Allow | Allow | Allow within the frozen attachment policy | Allow for the same account through the local One Time projection | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| One Time support producer service principal | Deny as a human UI | Conditional: may emit only a previously committed authorized submission | Conditional: may serve only a private blob referenced by that submission | Allow through the signed BNA status endpoint | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| BNA support consumer service principal | Deny | Deny | Conditional: may retrieve a referenced private blob through reverse HMAC authentication | Allow through internal BNA storage | Deny across tenant/account boundaries | Allow only after transport, signature, replay, schema, and entitlement-assertion checks | Allow within BNA service scope | Conditional: only through the BNA state machine and audit transaction | Deny as a Telegram user | Conditional: may invoke the allowlisted read-only sandbox for an eligible `BUG_CANDIDATE` | Deny |
| BNA automated triage worker | Deny | Deny | Deny direct object access except through typed attachment metadata | Allow sanitized ticket fields needed for triage | Deny | Deny | Conditional: sanitized typed view only | Conditional: may write classification, confidence, reason, severity proposal, SLA, and `BUG_CANDIDATE`; no resolution or destructive transition | Deny | Conditional: only the allowlist in `TRIAGE-POLICY.md` | Deny |
| Isolated read-only diagnostic sandbox | Deny | Deny | Deny | Deny | Deny | Deny | Conditional: receives typed identifiers and bounded diagnostic parameters, never raw user text | Deny | Deny | Allow only the named read-only diagnostic operations | Deny |
| Shloimie through the existing authenticated BNA operator UI | Deny | Deny | Conditional: private safe download | Allow | Conditional: only where the existing BNA operator policy permits | Deny | Allow | Allow through existing approval and state-transition policy | Not applicable | Conditional: may authorize the read-only lane | Conditional: only through the pre-existing approval/deployment policy; OT89 creates no bypass |
| Shloimie's exact Telegram identity from existing protected BNA configuration | Deny | Deny | Deny | Conditional: receives a redacted alert and safe protected deep link | Deny | Deny | Conditional: redacted alert only | Conditional: two or three offered actions, each recorded by BNA using the existing decision protocol | Allow | Conditional: may authorize the read-only lane when offered | Deny unless an existing separately documented approval workflow handles it outside OT89 |
| Any other Telegram user, chat, forwarded message, or stale callback | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny and audit | Deny and audit | Deny | Deny |

## Enforcement requirements

### One Time web and API boundary

- The support navigation item, form route, server action, attachment upload, receipt route, and status route must all repeat the same server-side account and entitlement checks. Client-side hiding alone is invalid.
- An anonymous or unauthorized request to a subscriber support route returns the framework's normal not-found response or an authenticated-account redirect that does not reveal a usable ticket endpoint. It must never render a disabled or imitation form.
- Subscriber support routes use `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`. They are excluded from sitemap generation, public navigation, static export, and search indexing.
- The public experience links only to the existing WhatsApp lead assistant already configured by One Time. OT89 must not create a public ticket proxy.
- Receipt and status lookups are keyed by both the opaque receipt identifier and the authenticated account identifier. A receipt identifier alone never authorizes access.

### Service-to-service boundary

- The One Time to BNA HMAC key and the BNA to One Time HMAC key are separate directional secrets with distinct key IDs.
- Key material is loaded from the existing runtime secret mechanism. It is never committed, printed, included in test snapshots, attached to a ticket, or sent to Telegram.
- BNA verifies the raw request before parsing user JSON. It enforces timestamp skew, nonce uniqueness, constant-time HMAC comparison, exact schema validation, event ID equality, account equality, and active-entitlement assertions.
- Nonce acceptance, event idempotency, source-ticket idempotency, ticket creation, initial history, and alert-outbox creation are transactionally consistent.
- A duplicate event returns the original opaque BNA ticket reference and creates no additional ticket, history row, attachment transfer, triage job, or initial alert.

### Telegram boundary

- The authorized Telegram identity is read from the existing protected BNA/Academy-bot configuration that already identifies Shloimie. OT89 must not add a hard-coded numeric user ID or a second authorization registry.
- Every callback verifies bot signature or platform authenticity, expected bot/chat context, configured operator identity, decision-token expiry, allowed ticket state, allowed action, and idempotency key.
- Callback data contains only an opaque decision token and action code. It contains no raw ticket text, database primary key, account ID, attachment locator, email address, phone number, or secret.
- A successful Telegram action writes the BNA decision and history first; the bot then edits or acknowledges the message. A bot transport failure does not erase the BNA decision.

### Approval boundary

The following always remain behind the existing BNA approval policy unless a separate already-documented low-risk auto-fix lane is discovered and cited in the run record:

- source-code changes;
- dependency or protocol changes;
- database mutations outside approved migrations and normal ticket workflow writes;
- production configuration changes;
- deployments, rollbacks, or feature-flag changes;
- destructive diagnostics;
- contacting a subscriber outside the chosen existing reply channel;
- exposing a ticket or attachment outside the authenticated account/operator boundary.
