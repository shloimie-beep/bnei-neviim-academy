# 00 Control Tower - One Time landing visual revision

Parent raw ID: `RAW-20260712-004`
Packet ID: `PKT-20260712-104`
Branch/worktree: `codex/onetime-landing-visual-20260712` at `C:\Users\User\BNA-onetime-landing-visual-20260712`

## Scope

Focused visual/copy revision for One Time public landing and direct signup
location capture. This packet does not solve unrelated active CRM/outbox work.

## Coordination

| Lane | Owner | Status | Notes |
|---|---|---|---|
| landing visual/copy | Codex | in progress | Implement in this clean branch only. |
| signup city/timezone | Codex | in progress | Only requested signup behavior change; preserve API/reminder guardrails. |
| merge/deploy | Shloimie | blocked | Prompt requires screenshot approval before merge/deploy. |

## Safety

- Started from clean `origin/master` worktree.
- Did not use stale branch/commit `1c74c5f0`.
- No deploy, merge, external send, charge, access grant, DNS/account mutation, WAPI/Telegram dispatch, or production-data mutation.
- Missing reference screenshot path recorded as `DEC-20260712-102`.

## Next

Finish local implementation, run tests/watchdogs, capture screenshots, and hand
back a requirement matrix plus screenshot links for approval.

