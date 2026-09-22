# RAW-20260706-901 - Deploy Gate Scoped Credential Deferral

Source channel: codex_chat
Captured at: 2026-07-06
Parse status: registered

## Raw Operator Input

> I thought you fixed that issue, that you're able to still push stuff and deploy stuff even though we're missing those keys. And what does Vimeo or Stripe or Telegram have to do anything? Why can't I deploy stuff if I'm missing those keys? I already told you that before.

## Parsed Items

- `REQ-20260706-901`: Release gate must not block a scoped app/UI deploy only because unrelated provider credentials or readback checks are missing.
- `TASK-20260706-901`: Patch the production closeout gate and regression tests so approved scoped deploys can defer unrelated Vimeo, Stripe, Rabbi Telegram, and external readback readiness while still blocking real sends, charges, DNS/access changes, credential changes, provider writes, production mutations, live verification, and integration-specific closeout.

## Routing

- Workspace: `bna_platform`
- Project: `release_workflow`
- Affected files: `scripts/bna-production-closeout-gate.mjs`, `tests/bna-production-closeout-gate.test.js`, release memory/ledger records
