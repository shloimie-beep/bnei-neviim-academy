# 08 — Acceptance And Release Gates

## Gate A — Schema and manifest

- Apply migration to a temporary real Postgres database.
- Execute all runtime/control-center queries; fake DB stubs do not count.
- 100% strict JSON-schema validation.
- 100% unique capability/alias/UI/route mappings or intentional exclusions.
- 100% enabled handlers import and execute in contract tests.
- 100% mutation idempotency/audit metadata.
- 100% profile invariant tests.

## Gate B — Natural language

- At least two English and two Hebrew positive cases plus two near-neighbor negatives per business capability.
- Overall golden routing >=95%.
- Exact query/read-no-write/scope/high-risk cases = 100%.
- Zero high-risk false-positive execution plans.
- Unknown/ambiguous input clarifies; never falls back to task/intake/write.

Required examples include:

- `Give me the questions from the last two weeks.`
- `תן לי את כל השאלות מהשבועיים האחרונים`
- `Search the web for the latest Telegram Bot API changes and cite sources.`
- `תחפש באינטרנט את השינויים האחרונים ב-Telegram Bot API ותביא מקורות`
- `Find the latest One Time source sheet in Drive.`
- `תמצא בדרייב את דף המקורות האחרון של One Time`
- `What is on Rabbi's calendar next week?`
- `מה יש ביומן של הרב בשבוע הבא?`
- `Draft an email to the class parents.` followed by `Send it.`; second turn must preview/approve, not send.
- `Remember that I prefer reports grouped by workspace.` and Hebrew equivalent.
- `Forget that preference.` and Hebrew equivalent.
- `Open the One Time member library.` and Hebrew equivalent.

## Gate C — Scope and privacy

- Verified Shloimie -> server-derived super-admin/all; outputs labeled/grouped.
- Verified Rabbi -> exact One Time scope.
- Unknown/revoked/group/wrong-bot/wrong-chat -> denied before planner/query.
- Rabbi BNA requests and BNA-targeted tool args -> denied with zero row/count/name leakage.
- Public prompt injection -> no private manifest/tool/memory exposure.
- Request/body/model role/workspace overrides ignored/rejected.
- Structured logs/audit contain no token, Basic auth, raw chat/user ID, raw body, student question, model prompt/response, or connector credential.

## Gate D — Read and action integrity

- Every read asserts zero domain writes.
- Completion claims require handler result and audit ID.
- Unknown capability/extra args fail strict validation.
- Duplicate Telegram update produces one domain effect.
- Crash after commit reuses existing action result.
- Draft-only capability cannot access send API.
- Connector unavailable returns a blocker, not fabricated output/fallback/ticket.

## Gate E — Approvals

Tests must fail for:

- changed args/scope/recipient;
- expired or reused nonce;
- wrong Telegram user/chat/bot;
- generic “yes” not bound to preview;
- callback race/replay;
- Rabbi scope elevation;
- unapproved direct/legacy command.

The exact approver succeeds once. No effect exists before approval.

## Gate F — Memory

- Explicit preference crosses authorized surfaces for the same verified identity and survives process/deploy restart.
- Rabbi/public cannot retrieve Shloimie memory; BNA/public cannot retrieve Rabbi private memory.
- Shared workspace memory requires authority and correct inheritance preview.
- Inferred memory remains candidate.
- Secret/policy-override/web-instruction memory rejected.
- Current domain facts queried fresh.
- Correct/forget/expiry changes retrieval and shreds/removes stored value.

## Gate G — Queue and chaos

- Envelope inserted once per provider update.
- Two workers cannot claim the same envelope/run/outbox.
- Cursor never advances past an unpersisted update.
- Per-conversation ordering and cross-conversation concurrency proven.
- Telegram `retry_after` honored; dead letter after max attempts.
- Leader lease prevents competing pollers.
- SIGTERM drains/re-leases safely.
- Both heartbeat keys fresh; stale worker fails readiness.
- No correctness dependence on `.runtime` or Markdown.

## Gate H — Shadow and cutover

Shadow mode sends redacted turn copies to the new planner with execution/delivery disabled. Compare selected capability, scope, date range, args, effect class, approval requirement, and intended response.

Minimum cutover threshold:

- 100% on exact/high-risk/scope/no-write cases;
- >=95% overall golden routing;
- no unsafe scope/action delta in the telemetry window;
- no meaningful latency/error regression beyond the agreed budget;
- rollback feature flag tested.

## Gate I — Production proof

Production-visible Done requires:

- source committed and pushed;
- intended services deploy the same commit/version;
- database migration applied per target with recorded preflight and rollback path;
- worker `getMe`, profile, identity binding, poll lease, heartbeat, queue, and outbox readiness pass;
- separately approved live read-only smoke for both bots;
- approved restart-memory smoke;
- Rabbi cross-scope negative live proof;
- any live external-effect smoke uses an owner-controlled test record and separate exact approval;
- legacy paths remain rollback-only for the defined window, then are removed in a separate verified change.

## Suggested command groups

Codex must adapt commands to current scripts rather than copy blindly:

```text
node --check <changed files>
node --test tests/assistant-*.test.js tests/telegram-*.test.js
npm test
npm run watchdog:actions
npm run watchdog:security
npm run watchdog:protocol-drift
npm run chatgpt:dropoff:tower
```

No live send, deploy, or production migration command is authorized by this packet.
