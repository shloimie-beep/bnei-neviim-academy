# RAW-20260712-005 - Telegram Sidekick Super Package

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260712-005 |
| Source channel | codex_chat |
| Source file/message | `C:\Users\User\Downloads\Telegram-Sidekick-Super-Package-20260712.zip` and Codex chat instruction |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-12-telegram-sidekick-super-package-lane-01.md` |
| Dropoff packet | `ops/chatgpt-ramble-dropoff/incoming/telegram-sidekick-super-package-20260712/` |
| Dropoff task | `#2266` |
| Packet status | `codex_queued` at pickup, then Lane 01 started locally |

## Operator wording

```text
C:\Users\User\Downloads\Telegram-Sidekick-Super-Package-20260712.zip
```

```text
Unpack this ZIP at the root of the bnei-neviim-academy repository.

Confirm that this folder exists:

ops/chatgpt-ramble-dropoff/incoming/telegram-sidekick-super-package-20260712/

Read CODEX_PROMPT.md inside that packet.

Then run the repository drop-off validation/control tower and queue the packet for implementation. Start with Lane 01 only. Do not deploy, send messages, apply production migrations, or perform external actions without my explicit approval.
```

## Packet source summary

The packet is a ChatGPT implementation bundle for Telegram Super Sidekick V2.
Its master prompt requires Codex to audit the current repo, create or link raw
intake and a dated requirement register, validate the package, then implement
only the first dependency lane before broader assistant capability work.

Lane 01 scope is security, identity, and fail-closed runtime behavior:

- server-derived Telegram identity and immutable scope;
- nonempty allowlists and verified identity bindings;
- no request/body/model role or workspace priority;
- legacy unsigned webhook and direct high-risk command bypass closure;
- redacted logs and heartbeat/readiness;
- focused negative tests before model/domain access.

## Explicit operator guardrails

- No deploy.
- No Telegram/live message send.
- No production migration apply.
- No external account or connector action.
- No secrets readback or printing.
- Start with Lane 01 only.

## Initial validation evidence

- `npm run chatgpt:dropoff:scan` reported the packet as `ready_dry_run` with no findings.
- `npm run chatgpt:dropoff:apply` queued the packet as task `#2266`.
- `npm run chatgpt:dropoff:tower` refreshed the control tower and showed packet status `codex_queued`.
- Current branch at pickup: `master`, HEAD `d68e3f9a`.
- Dirty worktree existed before this packet and remains a collision warning for unrelated lanes.
