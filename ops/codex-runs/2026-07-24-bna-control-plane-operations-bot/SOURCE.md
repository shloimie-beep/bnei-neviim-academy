# BNA Control-Plane Operations Bot Source

- Task: `BNA-CONTROL-PLANE-OPERATIONS-BOT-01`
- Requirement: `REQ-20260724-001`
- Repository: `shloimie-beep/bnei-neviim-academy`
- Governed base branch: `codex/platform-agent-actions-telegram-preview`
- Governed base SHA: `dff66b24fd966a08cdd6a16e80f954d2f988673a`
- Implementation branch: `codex/bna-control-plane-operations-bot`
- One Time conductor checkpoint:
  `bc14fa0be3f6420b048e7ba2cc1667bfbcd413a0`
- Read-only source packet:
  `ops/goals/OT-LAUNCH-01/handoffs/bna-control-plane-operations-bot--assigned-task.md`

The source packet was read from the separate One Time checkout. This task made
no write to that checkout or to the OT-LAUNCH-01 Board.

## Accepted Scope

- Replacement ADR and threat model.
- Separate, default-off operator Telegram identity and process.
- Private chat allowlist and bot-ID pin.
- Expiring local process lease.
- Redacted read-only status and help commands.
- Redacted status-change notifier.
- Opaque refs, counts, timestamps, and pinned same-origin HTTPS links.
- Denied-command and denied-callback audit without raw content.
- Provider-off behavior and failure isolation.

## Explicit Exclusions

- Arbitrary Codex, Agent Work, shell, deploy, migration, release, or rollback.
- Provider or customer writes and sends.
- One Time sessions, cookies, runtime imports, data imports, or database access.
- Customer transcripts, messages, files, or PII.
- Direct product database reads or writes.
- Any live bot configuration, provider canary, deployment, or One Time Board
  update.
