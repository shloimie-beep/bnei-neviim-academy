# OT-89B — Implement the BNA Subscriber Support Consumer

You are the implementation owner for **OT-89B**. Execute this packet in the BNA repository. This prompt is intentionally designed to make useful progress without waiting for OT-89A product code, a live provider, a production database, or the dirty BNA checkout.

## 1. Outcome

Build the BNA side of the One Time subscriber-support bridge:

1. accept the exact signed asynchronous One Time v1 support event;
2. create/find one authoritative BNA support ticket idempotently;
3. store immutable event/history/state/triage/SLA/audit data;
4. expose a protected lightweight BNA operator ticket view;
5. enqueue a redacted alert to the existing Academy Telegram bot and reuse BNA's existing decision protocol;
6. expose the exact signed status seam used by One Time's asynchronous reconciler;
7. keep all real transports disabled by default and prove behavior with synthetic/mocked adapters.

This task does **not** implement the One Time producer. It does not need OT-89A application code. PR #36 already publishes the immutable v1 contract needed by this consumer.

## 2. Non-negotiable product rules

- Only an authenticated active One Time subscriber may originate an event. BNA independently validates the signed authorization assertion; it does not trust a schema-valid body by itself.
- Anonymous users and non-subscribers have no ticket page/API. They use One Time's public WhatsApp lead assistant; BNA exposes no public proxy.
- BNA is the ticket/state/history/ownership/SLA/alert-outbox system of record.
- One Time owns its local receipt/outbox/private source attachment and cached status projection.
- One Time never waits for or loads the BNA Operations UI on its request path.
- Telegram is an alert/action transport, never the ticket database.
- Raw user text and attachment names are untrusted inert data. Never interpolate them into shell, CLI, Codex, SQL, URL, regex-command, callback, or filesystem-path inputs.
- A bug classification is only a `BUG_CANDIDATE`. It cannot authorize a code change, deployment, protocol change, destructive action, provider contact, refund, or customer-wide message.

## 3. Repository isolation — do this, do not stop

The local checkout `C:\Users\User\BNA v2.0` is dirty and forbidden for task writes. Do not edit, reset, clean, checkout, stash, stage, commit, or otherwise mutate it.

1. Capture its read-only path, HEAD, `git status --short`, index checksum, and tracked-file diff checksum so the final report can prove it remained untouched. Do not print secrets or file contents.
2. Inspect existing OT-89B task-owned worktrees/branches first. If `codex/ot89b-bna-support-consumer` already exists and its task state is coherent, resume it instead of duplicating work.
3. Otherwise fetch `https://github.com/shloimie-beep/bnei-neviim-academy.git` and create a clean isolated clone/worktree at `C:\Users\User\BNA-ot89b-support-consumer` on branch `codex/ot89b-bna-support-consumer`.
4. The packet observed `origin/master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`. Fetch again and base on current `origin/master` if it is that commit or a normal fast-forward successor. Only choose another remote commit if a repository-visible record explicitly marks it as the accepted BNA control-plane base. Do not base on unfinished separation PRs #134/#135, the local dirty safety branch, or an inferred newer branch.
5. Record the exact origin, default branch, base SHA, branch, worktree, and initial status.

If the preferred directory is occupied, use a timestamped task-owned sibling. Never delete or overwrite an existing directory. If remote fetch is temporarily unavailable but a clean verified remote-tracking object exists locally, create the isolated worktree from that object and record the limitation. Lack of provider credentials is not a reason to stop implementation.

## 4. Persist before feature edits

Create these files immediately under `ops/codex-runs/OT-89B/` in the clean task worktree:

- `ORIGINAL-PROMPT.md` — exact prompt text;
- `PACKET-MANIFEST.json` — packet file hashes and source pins;
- `INPUTS.json` — resolved repositories, branches, SHAs, contract pin, feature modes;
- `STATE.json` — `task_id`, phase, status, completed acceptance IDs, blockers, branch, base, head, dirty state, next action, timestamp;
- `LOG.jsonl` — append-only sanitized phase/action/result records;
- `PLAN.md` — discovered architecture and bounded implementation plan;
- `DECISIONS.md` — explicit adapter/table/route choices and reasons;
- `RESUME.md` — always-current instructions usable from a brand-new Codex window;
- `TEST-RESULTS.md`, `MIGRATION-MANIFEST.md`, `EXTERNAL-MUTATIONS.md`, `DEPLOYMENT-CANARY.md`, and `FINAL-REPORT.md`.

Update `STATE.json`, `LOG.jsonl`, and `RESUME.md` at every phase boundary and before/after any lengthy test. If interrupted, another window must be able to resume using only committed files plus the branch.

## 5. Fetch and pin the frozen contract

Read `SOURCE-PINS.json`. Fetch this exact file from GitHub:

`webcraft-media/onetimev2` at commit `0fe1b4668170f608d8763fb52d11b30f0150feb2`:
`ops/codex-runs/OT-89A/SUPPORT-EVENT-CONTRACT.json`.

Verify SHA-256 exactly:

`cfcd0ac55cbf9e59d7fefc7779af1aa5112fb410ee510882cb843492a556e512`.

Copy it byte-for-byte to `ops/codex-runs/OT-89B/SUPPORT-EVENT-CONTRACT.json` and add a contract drift/hash test. Fetch the matching authorization/triage/acceptance documents from the same commit when available. The contract is v1.0.0 and immutable. Reject unknown versions/events. Do not silently change v1; any semantic change is v2 plus a new endpoint.

If GitHub contract retrieval is temporarily unavailable, persist that blocker, implement repository discovery plus contract-independent adapters/storage/triage/operator seams, and retry retrieval later in the same run. Do not abandon the entire task at preflight.

## 6. Discover and reuse BNA architecture

Before choosing files, inspect the clean BNA checkout for:

- server/router/raw-body handling and internal integration authentication;
- database adapter, migration/checksum conventions, transaction helpers, PostgreSQL test harness;
- existing support/ticket tables, state machine, history/audit, queues/owners, SLA/holiday calendar;
- existing Academy/Rabbi Telegram profiles, exact protected operator identity configuration, inbox/outbox/lease/deduplication, callback token and decision protocol;
- existing lightweight operator routes and the broad Operations-shell boundary;
- metrics/logging/redaction helpers, secret-loading conventions, feature flags, CI/test scripts.

Use `rg`/`rg --files`. Reuse compatible existing primitives rather than creating a parallel auth, decision, Telegram, or ticket framework. Do not refactor unrelated BNA code. Document exact reused paths and any intentional additive seam in `DISCOVERY.md` and `DECISIONS.md`.

The read-only packet audit found these expected reuse points on `master`; verify rather than blindly assuming them:

- canonical tables `bna_support_tickets` and `bna_support_ticket_comments`;
- `src/lib/bna/helper/tool-registry.js` for canonical ticket creation and `notifySuperAdminSupportTicket`;
- `src/platform/assistant/problem-resolution.js` for source envelopes/deduplication and ticket-first technical classification;
- `docs/architecture/bot-context-and-ticket-routing.md` for the ticket-versus-decision boundary;
- `src/lib/bna/telegram-notifications.js` and `scripts/telegram-kimi-bridge.mjs` for Academy/Rabbi bot separation, protected decisions, and soft notification failure;
- `ops/action-registry.json` and `ops/route-registry.json` for the existing approval and member-ticket contracts;
- tests including `tests/rabbi-telegram-ticket-approval.test.js`, `tests/rabbi-telegram-notifications.test.js`, `tests/operations-notification-center.test.js`, `tests/bna-helper-tools.test.js`, and `tests/one-time-external-user-portal.test.js`.

Preserve the established policy: imported One Time tickets begin in `awaiting_super_admin_approval`, suppress automatic task creation, require super-admin approval, and never auto-create a Codex job. Technical items can become a candidate for the separately authorized bug lane only after the BNA decision gate.

Prefer additive new modules such as `src/lib/bna/support/one-time-support-consumer.js`, focused migrations, tests, and run evidence. PR #134 owns collision-heavy hotspots including `server.js`, `package.json`, `ops/action-registry.json`, `ops/route-registry.json`, and generated quality files. Avoid those where possible. If a server/registry hook is unavoidable, make it the smallest integrator-ready change, document the collision, and do not merge PR #134/#135 into this lane.

## 7. Implement the exact v1 transport

Create a narrowly scoped ingress route for:

- method: `POST`;
- path: `/api/internal/integrations/onetime/support-events/v1`;
- HTTPS required in non-test environments;
- content type: `application/json`;
- raw body: exact UTF-8 without BOM, maximum 131072 bytes.

Required headers:

- `X-OT89-Key-Id`;
- `X-OT89-Timestamp` as whole Unix seconds;
- `X-OT89-Nonce` as unpadded base64url for 24 random bytes;
- `X-OT89-Signature` as `v1=` plus lowercase hexadecimal HMAC-SHA256;
- `X-OT89-Event-Id`, exactly equal to the signed body `event_id`.

Canonical HMAC input is exactly five LF-separated lines with no trailing LF:

1. uppercase HTTP method;
2. exact request-target path;
3. timestamp header;
4. nonce header;
5. lowercase SHA-256 of the exact raw body bytes.

Verification order is binding:

1. method/path/HTTPS;
2. raw-body size before parsing;
3. required header syntax;
4. absolute timestamp skew no more than 300 seconds;
5. raw-body SHA-256 and constant-time HMAC verification before JSON parsing;
6. exact JSON parsing/schema and header/body event-ID equality;
7. one database transaction reserves `(key_id, nonce)` for 86400 seconds, validates authorization semantics, and idempotently creates/finds the ticket.

Secrets come only from the existing protected runtime configuration. Missing keys fail closed. Support key rotation by key ID without logging key material or raw signing headers. Reproduce the contract's non-production HMAC test vector exactly.

## 8. Authorization and privacy invariants

Validate in addition to JSON Schema:

- `authorization.authenticated === true`;
- `authorization.entitlement_product === "one_time"`;
- `authorization.entitlement_status === "active"`;
- `actor.onetime_account_id === authorization.account_id`;
- `checked_at` is no more than 300 seconds before `occurred_at` and no more than 60 seconds after it;
- non-null `valid_until` is later than `checked_at` and not earlier than `occurred_at`;
- product/account/source/environment are allowlisted for the configured integration.

Normalize Unicode, line endings, controls, bidi overrides, route templates, error codes, and filenames. Replace secrets, passwords, one-time codes, cookies, session IDs, bearer tokens, JWTs, keys, connection strings, email, phone, financial identifiers, addresses, and government IDs with typed markers. Record redaction field names/counts, never values.

Security rejection logs are rate-limited and contain only a request/body digest, reason code, key ID where safe, opaque correlation ID, and timestamp. Do not store rejected raw bodies.

## 9. Idempotent authoritative storage

Reuse the existing BNA ticket/state/history/audit/decision model where compatible. Add narrowly scoped migrations only for missing bridge data. Do not edit historical migrations.

The transaction must guarantee:

- new `(event_id, fingerprint)` creates exactly one BNA ticket/reference, one initial history transition, one triage job, and one initial alert key `support:new:<bna_ticket_ref>:v1`;
- exact duplicate delivery with a fresh nonce returns HTTP 200 and the original BNA reference without duplicate side effects;
- same event ID with a different raw-body fingerprint returns 409 plus a safe security audit and leaves the original unchanged;
- source-ticket collision returns the original only when the normalized immutable payload fingerprint matches; otherwise 409;
- concurrent identical deliveries have the same one-ticket result;
- nonce replay is rejected even if the body/signature are otherwise valid.

New acceptance returns HTTP 202 with the exact frozen response fields. Non-retryable/retryable classes must match the contract. Use opaque public references, not database primary keys.

Store authoritative ticket, immutable event metadata, source correlation, sanitized evidence, state, status version, history, queue/owner, severity, SLA deadlines, triage result, private attachment metadata/copy state, alert outbox, decisions, and audit. Add indexes for event ID/fingerprint, source ticket, opaque reference, account reference, status/SLA queue, nonce expiry, alert claim, and pagination as appropriate. Queries must be bounded.

## 10. Attachment seam

The event contains only `onetime-private-blob://ota_...` locators. Implement a typed reverse-fetch adapter behind a disabled-by-default feature gate. Test with a mock One Time server and a separate reverse-direction HMAC key.

Require HTTPS, no redirects, fixed allowlisted origin/path, timeouts, stream hard cap, media sniffing, decoded-image dimension/megapixel limits, SHA-256 equality, and private `no-store`/`nosniff` semantics. Store only a private normalized BNA copy or safe metadata according to existing storage conventions. Never expose a public attachment URL.

No live attachment fetch is part of this run.

## 11. Typed triage, severity, and diagnostics

Redact/normalize before classification. Produce one deterministic typed output with exactly one class:

- `REPRODUCIBLE_BUG`;
- `ACCESS_PROVIDER_INCIDENT`;
- `FEATURE_REQUEST`;
- `COMPLAINT`;
- `AMBIGUOUS`.

Include confidence 0..1, bounded sanitized reason, SEV0..SEV3, whether an operator decision is required, and an existing queue/owner reference. Fall back to `AMBIGUOUS` on incomplete evidence or low confidence.

Create `BUG_CANDIDATE` only when confidence is at least 0.85, there are at least two concrete steps, expected and actual behavior are present, occurrence is always/intermittent, route/provider is known, and there is no stronger provider-incident match.

Only these six read-only diagnostic operation codes may exist, with typed closed parameters and hard limits:

- `READ_BUILD_METADATA`;
- `READ_HEALTH_STATUS`;
- `QUERY_STRUCTURED_LOGS_BY_CORRELATION_ID`;
- `READ_FEATURE_FLAG_STATE`;
- `READ_PROVIDER_STATUS_CACHE`;
- `RUN_EXISTING_READ_ONLY_TEST`.

No arbitrary shell, SQL, package installation, repository edit, branch/issue creation, deployment, feature mutation, DB write, secret retrieval, scan, or raw ticket text may reach the diagnostic runner. In this task the runner may be an interface plus deterministic mock/sink if no existing isolated read-only sandbox exists; do not invent unsafe execution.

Implement and test SEV0–SEV3 and BNA's existing calendar policy. Default only where no stricter existing policy exists: Sunday–Thursday 09:00–18:00 `Asia/Jerusalem`, excluding configured holidays; SLA pauses only in `waiting_customer`.

## 12. Lightweight operator route and Telegram alert

Add a protected BNA operator ticket route/API that loads only one sanitized ticket plus bounded history/decisions. It must not initialize the broad Operations shell, workspace/product dashboards, agent fleet, CRM fanout, or synchronous One Time calls. Reuse existing BNA operator authentication/authorization.

The view must show opaque reference, category, sanitized summary, classification/confidence/reason, severity/SLA, state, owner/queue, attachment status, and history. It needs loading/empty/error/unauthorized states, keyboard/focus support, mobile 360x800 and 390x844 proof, and no direct contact details.

Use the existing Academy Telegram bot profile and existing protected identity/chat configuration. Never hardcode a token, user ID, chat ID, phone, or email. Enqueue a redacted alert containing opaque BNA reference, concise summary, category, severity, SLA/owner state, and protected deep link. Exclude contact data, raw attachment locator, database ID, secret, or unbounded text.

Reuse the existing BNA decision protocol. Offer only two or three context-valid options using opaque expiring single-purpose callback tokens. Wrong user/chat, forwarded message, expired token, invalid action, duplicate callback, and stale ticket version are denied and audited. Commit ticket history before acknowledging the Telegram callback.

Telegram failure must never roll back ticket ingestion. Retry from a durable alert outbox; later success creates exactly one initial alert. Use a mock/sink for all tests. No real Telegram message in this task.

## 13. Status seam

Implement the exact signed internal status route:

`POST /api/internal/integrations/onetime/support-ticket-status/v1`.

Use the same request-verification framework and exact request DTO from the frozen contract. Return only the frozen response fields: source ticket ID, opaque BNA reference, status, public summary, monotonically increasing status version, and updated time. Status is one of `new`, `triage`, `pending_operator`, `waiting_customer`, `in_progress`, `resolved`, `closed`, `rejected`.

Do not call One Time synchronously. An optional BNA-to-One-Time outcome adapter must be durable, asynchronous, disabled by default, and mock-tested. One Time will reconcile and cache the projection later.

## 14. Feature modes and safe failure

Integrate with existing config conventions. At minimum support independently testable default-off modes for:

- ingress acceptance;
- real Telegram delivery;
- real attachment fetch;
- read-only diagnostic execution;
- outbound status notification.

Absent/invalid configuration fails closed without crashing unrelated BNA routes. Synthetic contract tests may explicitly enable ingress with test-only secrets and mock clocks/adapters. Never create or print real secrets.

## 15. Verification

Add focused automated evidence for every applicable row in `ACCEPTANCE-CHECKLIST.md`, including:

- contract hash/schema and exact HMAC vector;
- valid new event, exact duplicate, event/source collision, concurrent duplicate;
- forged signature, wrong key/source/account/product, stale/future time, replay, header mismatch, malformed/unknown/oversized body;
- expired/inactive/mismatched entitlement assertion;
- secret/PII redaction and inert shell/SQL/prompt/path/callback-like text;
- attachment mock: authorization, no redirect, size/MIME/dimensions/hash/private storage;
- triage classes, confidence fallback, bug gate, diagnostic allowlist;
- severity/SLA/business calendar;
- wrong Telegram identity/action, duplicate/stale decision, alert failure/retry;
- BNA restart/idempotent reconciliation and status DTO/version;
- narrow operator authorization, accessibility, responsive/mobile, bounded request/query and performance proof;
- migration application/checksum on disposable PostgreSQL when available;
- repository tests, secret/PII scans, formatting/lint/typecheck/build as applicable, and `git diff --check`.

If safe disposable PostgreSQL or browser infrastructure is unavailable, complete the implementation and all other tests, add CI-ready tests/harnesses, record the exact unexecuted proof as a blocker, and continue. Do not substitute production infrastructure and do not falsely claim proof.

## 16. Git, PR, checkpoint, and interruption behavior

Keep scope to OT-89B. No BNA cleanup, school extraction, brand control plane, broad shell refactor, unrelated Telegram rewrite, dependency modernization, One Time repository edit, deployment, provider action, or production mutation.

Commit intentional changes on `codex/ot89b-bna-support-consumer`, push without force, and open a draft PR against the resolved base. A draft PR may be a safe implementation checkpoint if one remaining proof is unavailable, but the report must distinguish implemented/tested from pending.

Do not stop at a missing optional prerequisite. Work around it with a typed adapter, mock/sink, feature-off mode, or CI-ready test. Stop only when continuing would require destructive action, production data, live external mutation, a secret to be exposed, or an irreconcilable contract/security decision.

Before any stop or interruption:

1. update `STATE.json`, `LOG.jsonl`, `RESUME.md`, test/migration/external-mutation/deployment files;
2. ensure task-owned changes are formatted and intentional;
3. commit a resumable checkpoint;
4. push/open or update the draft PR when authenticated permission exists;
5. report exact worktree, branch, base, HEAD, clean/dirty state, completed acceptance IDs, tests, blockers, next command, PR, and external mutations.

Never use `git reset --hard`, force push, delete another worktree, discard unrelated changes, or mutate the dirty BNA checkout.

## 17. Definition of done

Done means the BNA consumer is implemented and testable against the pinned frozen contract with real transports off, the protected narrow operator experience and Telegram mock decision flow work, migrations and security/idempotency tests are present, persistent state/final evidence is complete, the branch is clean and published as a draft PR, and all live/provider/deployment limitations are stated truthfully.

The final response must lead with one of:

- `OT-89B IMPLEMENTED AND PUBLISHED`;
- `OT-89B CHECKPOINTED — EXACT BLOCKERS REMAIN`;
- `OT-89B BLOCKED BEFORE SAFE IMPLEMENTATION`.

Then give exact repository/worktree, base/head, branch/PR, changed-file groups, contract hash, migrations/checksums, test results, provider/deployment modes, dirty-checkout integrity proof, external mutations, and next exact action.
