# RAW-20260803-001 — BNA-CTRL-001 control-plane recovery

- Source channel: `codex_chat`
- Source artifact: `pasted-text.txt` attached to the Codex task
- Captured: `2026-08-03T17:08:00+03:00`
- Privacy classification: `internal_operations_no_secrets`
- Workspace/project: `bna_school` / `bna_control_plane`
- Parse status: `registered`
- Requirement register: `tasks-pending/2026-08-03-bna-control-plane-recovery.md`

## Raw operator request

PROMPT A — BNA-CTRL-001: restore Shloimie's bot and make the control queue useful now

You are BNA-CTRL-001, the sole recovery owner for Shloimie's private BNA academy/super-admin Telegram bot and the BNA Control Plane work-queue surface.

Your job is to turn the existing implementation into one usable, verified operating loop now:

BNA/One Time summary event or operator message -> canonical work item -> correct workspace/assignee/source -> BNA Operations queue -> concise Telegram update -> deep link -> human action -> status update

Do not rebuild the platform. Reuse the current bot, task APIs, Operations UI, agent fleet, ledgers, and Railway service.

Authority: perform read-only runtime/provider/Railway diagnostics; repair the existing BNA bot/worker code and configuration wiring without exposing or rotating secrets unnecessarily; use the configured task, decision, ticket, and agent infrastructure; restart or redeploy the dedicated BNA academy Telegram worker after exact service/environment/token ownership is proven; send one bounded live canary to Shloimie's verified private chat; deploy the BNA worker and BNA Operations changes through the existing release path after focused checks, rollback capture, and a successful canary; and enable bounded, deduplicated operational notifications after the canary.

The authority excludes bulk messaging, customer messaging, payments, account grants, DNS changes, destructive production data changes, private-body dumps, and use of the Rabbi One Time token as the BNA token.

### Phase 0 — current truth and collision preflight

Resolve the exact default branch/head, active worktrees, dirty files, branches, PRs, deploy source, Railway project/environment/service, worker command, and production runtime version. Read current source-of-truth files and classify dated reports as historical until current runtime readback confirms them. Identify polling versus webhook safely without printing the token or raw chat ID. Resolve whether the intended control surface is the academy bridge, PR #142 Operations bot, or the send-only progress path plus shared web UI; choose the smallest intended architecture and do not create a new bot merely because old evidence is confusing. Prove the BNA bot identity and Shloimie chat mapping with masked metadata; do not guess from filenames. Prove there is no other live consumer for the token and stop a stale duplicate only after exact process/service/token-fingerprint proof. Verify the TELEGRAM_SIDEKICK_RUNTIME_KEYS import/export contract. Check the existing agent fleet and do not create another. Inspect PR #141 and #142 against current master and reconcile only minimal accepted parts on a fresh branch. Publish a compact lease before edits. If token or chat mapping is absent, complete all code/UI/test/handoff work and return one exact operator action without requesting or printing the secret.

### Phase 1 — restore the existing BNA academy bot

Prefer the fastest safe existing runtime. Restore send-only progress dings first if already configured because that does not take getUpdates ownership. Use the isolated PR #142 Operations bot for interactive super-admin commands only if its distinct token namespace and allowlist are already intended and can be reconciled cleanly; keep it default-off until canary. Preserve the canonical Railway academy-telegram-worker for academy conversation and do not fold the Operations bot into that bridge. Never run a local helper and hosted worker against the same token. Preserve the supported polling/webhook model and avoid a transport rewrite. Repair only observed failures. The worker must start idempotently with one lease, expose fresh redacted heartbeat/readiness, survive restart without duplicate captures/dings, bound retries/message size, persist update/idempotency state durably, use hosted Assistant mode for ordinary conversation and Codex/task routing only for concrete work, and never claim an action succeeded unless the API succeeded.

### Phase 2 — immediate Telegram operating loop

Preserve natural conversation and implement through existing tools: /status with worker/app/queue/last-deploy summary; show my tasks; show decisions; show blocked; what did Codex do?; natural-language task/ticket/decision capture into one selected workspace; and deep links to the exact Operations card/detail drawer. Notify only on useful transitions: decision required; task blocked or newly assigned to Shloimie; provider/deploy/canary failed; deploy/canary completed and verified; ticket requiring Shloimie's response; or agent completion/result visibility or one concrete blocker. Deduplicate, batch noise, and use quiet-hour/rate-limit conventions. Do not send still-working spam.

### Phase 3 — one canonical shared work queue

Inspect the current BNA Operations task UI and make the smallest coherent repair. Human-facing sections are Decisions, Pending, Tasks, and Done. Required fields/filters are workspace/product, assignee, type, status, due date, Source (Bot, Ticket, Manual, Agent, or Integration), waiting on, priority, and last verified/deployed state. My Tasks is actor-aware and default per authenticated identity. Bots/Agents uses existing bna_agent_jobs enrichment and no new status table. Do not create a separate bot queue when canonical work items exist. Bot-created items use the same clean detail drawer as manual work. Decisions expose options, needs-more-info, owner, context, and audit trail. Local code alone is not Done where live proof is required. Historical One Time rows are labeled historical and never shown as current standalone One Time truth. Shloimie's default view prioritizes his tasks, decisions, bot alerts, tickets, and blockers, with an explicit all-control-plane filter. Project users see scoped task/ticket/bot/agent progress; deploy, claim, agent-run, credential, and provider controls remain super-admin-only. Do not place private BNA School details in One Time summaries.

### Phase 4 — asynchronous One Time summary contract

Keep One Time independent: no database queries, cookie reuse, server-code imports, or BNA availability dependency. Reuse a valid signed-event envelope if one exists; otherwise create a narrow versioned sanitized summary-event contract for work_item.created, work_item.updated, decision.required, ticket.opened, integration.blocked, deploy.started/failed/succeeded, canary.failed/succeeded, and agent.result_recorded. The minimum envelope includes schema version, event ID/idempotency key, source product/workspace, source object type/ID/version, occurred-at, sanitized title/status/assignee/priority, deep link, classification, and signature/key ID/replay window. BNA stores only a summary projection, not One Time private rows. If no producer exists, make no One Time edits and return an exact OT-LIVE-001 handoff with paths, contract, tests, and flag.

### Phase 5 — canary, deploy, and use-now handoff

Canary sequence: prove exact bot/chat/one consumer with redacted readiness; start/restart the Railway worker and wait for a fresh heartbeat; send exactly one message to Shloimie's verified private chat saying “BNA control bot is online. Use /status or ask ‘show my tasks’.”; run /status and verify one response; create one clearly synthetic control-plane task through Telegram; verify one task with Source Bot, correct workspace/assignee/audit; open the Operations deep link, move it Done, and verify at most one completion ding; archive/clean up through the normal recoverable path; replay and prove no duplicate task/message. Then deploy only exact worker/UI changes through the BNA release path. Run focused tests, BNA doctor, live smoke, authenticated desktop/mobile task/decision smoke, secret scan, and diff checks; do not run huge unrelated historical matrices.

Acceptance: the academy bot responds from one canonical Railway worker; /status, task/decision/blocker queries, and one task capture work; Operations shows the same item with Source/workspace/assignee; Decisions/Pending/Tasks/Done are usable on desktop/mobile; agent/deploy updates are concise, verified, deduplicated, deep-linked; no token/chat ID/private body leaks; Rabbi One Time bot/token/workspace is not consumed; and One Time/BNA School remain independent.

Create a compact current repo-conventional handoff containing task ID, exact base/final SHA and branch, changed paths, redacted worker/Railway identity, one-consumer proof, tests/canary counts, deploy/live-smoke result, task/decision UI screenshots, external-effect counts, blockers, and exact One Time signed-event handoff if needed. Final response must begin with BNA-CTRL-001 — ONLINE, PARTIAL, or BLOCKED. Do not stop at audit when safe repair, canary, and deployment are available.
