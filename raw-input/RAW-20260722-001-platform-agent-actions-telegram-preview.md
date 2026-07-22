# RAW-20260722-001 — BNA Agent Actions Telegram preview

- Source channel: `codex_chat`
- Captured: `2026-07-22`
- Workspace: `platform_control`
- Project: `platform_agent_actions_telegram_preview`
- Privacy: internal product/deployment instructions; no secrets or customer data
- Parse status: `registered`
- Requirement register: `tasks-pending/2026-07-22-platform-agent-actions-telegram-preview.md`

## Raw source

> CODEX WINDOW D — DEPLOY THE BNA AGENT ACTION HUB AND PREPARE THE RABBI TELEGRAM FOUNDATION
>
> Repository: shloimie-beep/bnei-neviim-academy. Fetch the actual current descendants of PR #139 (`codex/platform-bna-workspace-agent-actions`) and PR #140 (`codex/one-time-communications-architecture-v1`). Create `codex/platform-agent-actions-telegram-preview` from current master, open a draft PR against master, and do not mechanically merge stale branches.
>
> Produce one deployable BNA preview that separates Super Admin from BNA School, shows the One Time connector, runs the Agent Action Hub, accepts/saves/reads back result JSON, imports the current One Time Agent Mode jobs, and prepares the Rabbi Telegram-to-GHL foundation without making One Time depend on the preview.
>
> Required Agent Action routes: `/operations/agent-actions`, `/operations/agent-actions/:jobId`, `/operations/agent-actions/:jobId/dropoff`, `/api/platform/agent-actions`, and `/api/platform/agent-actions/:jobId/results`. Verify claim, in progress, partial save, completed save, readback, idempotency, and supersede. Import the current One Time HighLevel queue from PR #103 or its current descendant, pin the source SHA, import no secrets, and provide a preview URL.
>
> Add an optional sanitized result-only GitHub branch/PR fallback in `shloimie-beep/onetimev2`; the BNA Hub stays preferred and lack of the Hub must never block GHL completion.
>
> Implement the provider-neutral `one_time_rabbi_torah_console` foundation. GHL Conversations and the One Time Torah Questions pipeline remain source of truth. Telegram may list/open assigned Torah questions, accept Rabbi text/voice, preview, save draft, send only a confirmed answer through GHL, return to Shloimie, close, and draft a Torah newsletter or warm enrollment email. It must not show general support, answer Torah independently, create a second customer transcript, or bulk-send without exact segment/count/confirmation. Use fake/provider-off mode without protected bot credentials; with credentials run only one operator-owned private canary. No customer send.
>
> Run focused workspace tests, Agent Action save/readback tests, queue import test, Telegram fake-adapter tests, one preview browser smoke, secrets audit, and `git diff --check`. Do not run the full historical BNA suite. Customer messages sent must remain 0 and production must not change.

## Parsed requirements

`REQ-20260722-001` through `REQ-20260722-009` are tracked in the linked requirement register.

## Follow-up source — OT-LAUNCH-01

Continue PR #141 without creating a new branch, PR, preview, bot, GHL location, or customer transcript. Make Agent Action persistence durable in preview Postgres and fail closed when unavailable; reconcile the current One Time GHL registry/goal source; prove PR #139/#140 semantic supersession; implement a single-consumer private Telegram-to-GHL synthetic draft bridge; show sanitized operator Preview state; and run focused durable/provider/browser/security checks with zero customer sends and no production change.

The authoritative queue update is One Time PR #107 at `1fb2d39285b5cf644f2a5bc04d27e1b7385db173`, with its sole sanitized final-organization result artifact. The isolated preview was verified to have no linked Postgres/`DATABASE_URL`; do not retry declined provisioning, do not weaken durability, and leave exactly one operator action to attach a disposable Postgres service to the named preview environment.
