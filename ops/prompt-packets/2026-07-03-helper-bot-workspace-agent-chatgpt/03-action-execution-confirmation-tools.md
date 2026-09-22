# ChatGPT Window 3 - Action Execution, Confirmation Gates, And Tool Runtime

You are ChatGPT preparing one slice of a repo-ready implementation package for
Codex. Work only on this slice. Do not solve the whole helper bot.

Parent: `RAW-20260703-003`.

## Your Slice

Design and code-prep the helper's action execution system: draft, preview,
confirm, execute, audit, and block risky actions.

## Tool Classes To Map

Create concrete tool contracts for:

- create task;
- add internal note;
- create follow-up;
- draft email reminder;
- draft WhatsApp reminder;
- draft parent/accounting reminder from filtered results;
- prepare payment/access review;
- update local member status where allowed;
- open record or route;
- export preview;
- ask for missing information.

## Confirmation Policy

Map every tool into one of:

- `read_only`: no confirmation;
- `filter_or_navigation`: no confirmation, but audited;
- `draft_preview`: no external send/write;
- `confirmed_local_write`: confirmation required;
- `confirmed_external_write`: blocked unless an explicit external packet exists;
- `forbidden`: never allowed in helper.

Forbidden or externally blocked examples:

- real email/WhatsApp/SMS/Telegram send;
- charge/refund/payment;
- DNS/account/credential changes;
- access grants;
- Drive/Vimeo/Zoom writes;
- production data mutation outside approved local tools;
- GHL/LeadConnector runtime.

## Required Runtime Contract

Design the helper run lifecycle:

```json
{
  "run_id": "HELP-RUN-...",
  "actor": {},
  "plan": [],
  "tool_calls": [],
  "confirmation_required": false,
  "confirmation_token": null,
  "result": {},
  "audit_id": "HELP-AUDIT-...",
  "status": "done"
}
```

## Code-Prep Requirements

Produce patch-ready guidance for:

- helper tool registry metadata;
- planner/router changes;
- confirmation token hashing;
- idempotency keys;
- audit-log records;
- server endpoints;
- UI states for confirmation and blocked actions;
- tests for confirmation and denial.

## Handoff Package

Return files for:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-03-action-confirmation-tools/`

Use exact `packet_id`: `helper-bot-workspace-agent-03-action-confirmation-tools`.
The folder name, `packet.json`, `status.json`, and `MANIFEST.json` must all
use this same ID.

If GitHub repo-file creation fails with `403 Resource not accessible by
integration`, post one GitHub issue/PR comment marked
`BNA_CHATGPT_DROPOFF_PACKET` with complete fenced `### File: ...` blocks for
every required file. Do not return only a local ZIP/download link.

Required:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md`

## Guardrails

No action should rely on model text as proof of approval. Browser text cannot
approve sends, charges, access grants, DNS, credentials, or external writes.
