# RAW-20260701-004 - Run Rabbi / One Time Visual Audit + Resend Send-Enabled Smoke

Source channel: `codex_chat`
Captured at: 2026-07-01
Attachment: `C:\Users\User\.codex\attachments\4d24169c-4f81-45f0-8bcf-9559a63d7754\pasted-text.txt`
Requirement register: `tasks-pending/2026-07-01-run-rabbi-onetime-visual-audit-resend-smoke.md`

## Raw Operator Intent

Shloimie supplied a `BNA_GOAL_MODE_EXECUTION_PACKET` titled:

> Run Rabbi / One Time Visual Audit + Execute Resend Send-Enabled Smoke Readback

The packet directs Codex to stop leaving generated prompt packets as shelfware
and actually run the runnable packets generated in PR #59/#60:

1. `ops/prompt-packets/2026-07-01-rabbi-onetime-ui-cleanup/01-current-state-visual-audit.md`
2. `ops/prompt-packets/2026-07-01-provider-config-readback/09-resend-send-enabled-smoke.md`

It also directs Codex to resolve or precisely record the Railway target/deploy
blocker.

## Operator Authorization And Limits

- Runnable packets should be run, not merely generated.
- Resend setup should move forward now.
- Resend DNS/domain appears verified from operator screenshot evidence: DKIM verified, sending records verified, receiving MX verified, domain verified.
- Safe Resend smoke is authorized for official Resend test recipients and/or Shloimie-owned safe test recipient configured in env or CLI flag.
- No bulk campaign is authorized.
- Stripe waits for a separate sandbox packet.
- Do not implement Rabbi UI fixes yet.
- Do not add GHL.
- Do not expose secrets.
- Do not hard-delete or mutate production CRM/contact data.
- Do not change DNS unless separately authorized.

## Parsed Work

This raw input creates the execution register:

- `REQ-20260701-401` source coverage and preflight.
- `REQ-20260701-402` runnable packet operating rule.
- `REQ-20260701-403` Railway target/deploy blocker readback.
- `REQ-20260701-404` Rabbi / One Time current-state visual audit.
- `REQ-20260701-405` Resend readiness and inbound route verification.
- `REQ-20260701-406` Resend dry-run and guarded send smoke, if ready.
- `REQ-20260701-407` trace, reports, ledger, changelog, memory, and next-session closeout.
- `REQ-20260701-408` validation, commit, push, PR, and merge/deploy status.
