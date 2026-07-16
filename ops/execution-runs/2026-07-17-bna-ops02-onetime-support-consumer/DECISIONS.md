# Decisions

- **Branch/base:** Created clean external worktree `C:\Users\User\.overnight-20260717-worktrees\BNA-OPS-02` from `origin/master` at `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`.
- **Endpoint:** Added `POST /api/bna/integrations/one-time/support-tickets/v1` before JSON middleware so HMAC uses the unmodified raw body.
- **Signature:** HMAC-SHA256 over `timestamp.eventId.rawBody`, supplied through `x-bna-onetime-*` headers.
- **Allowlist:** Default fail-closed account/product scope is `rabbi_sheller_provider / one_time_mishnah_class`; env allowlists can narrow/extend intentionally.
- **Entitlement:** Requires `one_time_subscription_entitlement_v1`, active/current status, matching account/product, non-expired `valid_until`, and signed proof reference.
- **Ticket system:** Reuses `bna_support_tickets`, `bna_support_ticket_comments`, `assistant_delivery_outbox`, and the existing approval endpoint. No parallel ticket system was added.
- **No automatic Codex:** Intake sets approval-gated source context and blocks automatic task/job creation. A Codex task/job can only be created by explicit platform-super-admin `Approve for Codex`.
- **Telegram:** Queues a redacted alert to `telegram:platform_support_shloimie` with BNA operator mapping. The consumer does not call `sendTelegramMessage` and does not use the Rabbi / One Time bot token.
- **Reverse status:** Creates provider-off signed reverse-status outbox rows for received and triaged/decision-needed states. Real reverse delivery remains off.
- **Generated registry artifacts:** Refreshed action-registry coverage/parity artifacts because new registry rows changed their content hashes.
- **Control tower churn:** Removed generated `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.*` changes from the clean worktree before commit because they were startup readback churn, not lane evidence.
