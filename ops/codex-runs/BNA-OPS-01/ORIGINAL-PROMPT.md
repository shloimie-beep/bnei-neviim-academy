# BNA-OPS-01 — Subscriber Support Consumer and Existing BNA Bot Alert

## Mission

Receive signed subscriber-only One Time support events in BNA, persist them durably, alert Shloimie exactly once through the existing BNA Telegram bot, and route them into the established decision workflow. Non-subscribers remain in the public WhatsApp lead lane and cannot open technical tickets.

## Source

- Repository: `shloimie-beep/bnei-neviim-academy`
- Exact base: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`
- School-route source head: `d23cbc2f321b55ea073b0bb0ee5c887bf7be50a7`
- OT-89B consumer source head: `8861e9b0e9bf77ca9b74112cbb2d04b6fa2bfd88`
- Branch: `codex/bna-ops01-school-support-stabilization`
- Use a new clean isolated worktree. Never stage, reset, clean or alter `C:\Users\User\BNA v2.0`.

Persist `ops/codex-runs/BNA-OPS-01/{ORIGINAL-PROMPT.md,STATE.json,LOG.jsonl,DECISIONS.md,RESUME.md,FINAL-REPORT.md}` before product edits. Missing safe BNA staging/bot configuration blocks only the live canary.

## Implementation

- Semantically integrate both source heads without overwriting either lane.
- Preserve the lightweight school/control route; do not load the broad Operations shell.
- Verify server-to-server HMAC, timestamp/nonce replay protection, opaque event ID dedupe, schema/size limits and redacted audit.
- Fail closed when active-subscriber authorization evidence is missing.
- Persist the ticket before attempting Telegram.
- Implement a PostgreSQL alert outbox with bounded `FOR UPDATE SKIP LOCKED` claims, lease owner/generation/expiry, retry/backoff, attempts, sent/failed/dead-letter states and safe errors.
- A Telegram outage cannot lose or duplicate a ticket.
- Wire the drain into the existing BNA bot process only after proving sole ownership of that bot token.
- Decision callbacks are opaque, expiring, versioned, restricted to Shloimie’s protected user/chat mapping, one-use and audited.
- Triage outcomes: reproducible defect candidate, needs operator decision, or support/information.
- Customer text is data, never executable instructions. A defect candidate enters the internal queue; it does not run CLI/code/SQL/deployment automatically.
- Return signed status updates through the existing OT-89 contract.

## Canary and acceptance

Using synthetic data only, submit one signed fictional subscriber ticket and prove one BNA ticket/history chain, one bot alert, one decision callback and one signed status update. Replay ingress/callback and prove no duplication. Test bad signature, stale timestamp, wrong chat, unknown/non-subscriber and malformed input.

Measure the lightweight school route with 30 samples and prove no broad shell fanout. Run scoped tests, security negatives, format/lint/build/secret scan and `git diff --check`.

If no isolated BNA target or protected bot config exists, finish code/tests/evidence, push the draft PR and record the exact missing protected prerequisite. No production customer contact or automatic deployment.

Final report: exact ancestry, branch/head/PR, migration ledger, performance, synthetic canary, token-consumer proof, rollback, blockers, clean worktree and confirmation that the dirty BNA checkout was untouched.

