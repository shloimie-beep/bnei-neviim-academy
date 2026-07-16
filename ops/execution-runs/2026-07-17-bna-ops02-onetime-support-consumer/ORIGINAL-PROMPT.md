# BNA-OPS-02 Original Prompt

Source path supplied by operator:

`C:\Users\User\BNA v2.0\raw-input\RAW-20260717-001-one-time-overnight-finish-line-batch\BNA-OPS-02-SUPPORT-CONSUMER\CODEX-PROMPT.md`

This prompt was read in full as immutable source input before implementation. The file was not present in the clean remote-base worktree because the source packet lived in the dirty main checkout; implementation did not copy dirty code files from that checkout.

## Prompt

# BNA-OPS-02 - One Time subscriber-support consumer and operator Telegram alert

Implement BNA-side integration to receive signed subscriber support tickets from the standalone One Time app, store and route them into the existing BNA ticket / agent-decision protocol, and notify the operator through the existing BNA Telegram bot.

Trust boundary:

- Accept HTTPS POST only on a dedicated versioned endpoint.
- Verify raw-body signature under a shared contract.
- Enforce timestamp window, event id / idempotency, account/product allowlist, schema version, size and content-type limits, and replay protection.
- Validate signed entitlement proof/reference and allowed account/product; fail closed.
- Store minimum ticket/triage information only.
- Never store secrets, class links, full household/student records, or attachments.
- Acknowledge only after durable inbox persistence.
- Process asynchronously with leases, retries, dead-letter, and dedupe.

Routing:

- Map One Time categories into the existing BNA ticket / agent-task protocol without Academy learner record mixing.
- Clear reproducible bug reports become structured engineering triage candidates with `awaiting_agent_review`.
- Do not automatically run CLI/code/edit/deploy/close from a ticket.
- Ambiguous/product/policy/data-correction/billing-dispute/new-feature requests become `decision_needed` with concise operator options through the existing decision-card mechanism.
- Access/security/privacy tickets elevate severity and restrict display; do not include secrets in Telegram.
- Preserve reverse status events to One Time through a signed outbox port: received, triaged, needs info, decision needed, in progress, resolved, rejected.
- Real reverse delivery may remain provider-off.

Telegram:

- Use the existing BNA operator bot/runtime and protected mapping, not the Rabbi / One Time bot token.
- Send a concise redacted alert with category, severity, public ref, and safe Operations deep link/controls.
- Telegram failure must not lose the ticket; queue, retry, dead-letter, and show notification state.
- Telegram commands cannot bypass BNA audit/capability rules.

Verification:

- Wrong signature.
- Altered body.
- Stale/replayed/duplicate event.
- Wrong product/account.
- Fake entitlement.
- Oversized/malformed payload.
- Two workers.
- Retry/dead-letter.
- Redaction.
- Bug vs decision routing.
- Telegram sink failure.
- Reverse-status idempotency.
- Zero Academy data crossover.
- Synthetic fixtures only.

Constraints:

- Reuse existing BNA support-ticket, agent-decision, and Telegram governance.
- Do not build a second ticket system.
- Do not attempt broader Academy/super-admin separation.
- No production runtime mutation, real Telegram send, provider action, send, charge, DNS, deployment, credentials, or automatic code execution from ticket.
