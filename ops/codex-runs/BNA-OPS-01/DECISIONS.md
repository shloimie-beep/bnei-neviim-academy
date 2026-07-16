# BNA-OPS-01 Decisions

## DEC-BNA-OPS-01-001 - Isolated Clone Instead Of Dirty Checkout

Decision: Use `C:/Users/User/.codex-worktrees/bna-ops-01-local-20260716T192700Z` as the implementation workspace.

Reason: The prompt explicitly forbids staging, resetting, cleaning, or altering `C:/Users/User/BNA v2.0`, and the control tower shows that checkout is dirty with unrelated work.

Consequence: All product edits, commits, and pushes for this lane must happen from the isolated clone and branch `codex/bna-ops01-school-support-stabilization`.

## DEC-BNA-OPS-01-002 - Live Canary Is Blocked Until Protected Runtime Proof

Decision: Implement local code and synthetic tests, but do not perform a live Telegram canary unless safe BNA staging and sole ownership of the BNA bot token are proven.

Reason: The prompt says missing safe BNA staging/bot configuration blocks only the live canary. BNA safety rules also prohibit unapproved external sends and production mutations.

Consequence: Local/synthetic ingress, outbox, callback, replay, and security tests can run. Live bot sends, production subscriber writes, deployment, and real customer contact remain blocked.

## DEC-BNA-OPS-01-003 - Customer Text Is Data

Decision: Subscriber support event text must be stored and displayed as user data only. It must not trigger CLI, SQL, deployment, Codex job execution, or other automation by itself.

Reason: The prompt requires customer text to be data, never executable instructions.

Consequence: Defect candidates can enter an internal decision/work queue, but no automatic code, database, deploy, or external-provider action may run from the ticket body.
