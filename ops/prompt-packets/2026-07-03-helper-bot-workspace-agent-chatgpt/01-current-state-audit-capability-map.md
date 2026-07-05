# ChatGPT Window 1 - Current-State Audit And Capability Map

You are ChatGPT preparing one slice of a repo-ready implementation package for
Codex. Work only on this slice. Do not solve the whole helper bot.

Parent: `RAW-20260703-003` and prompt packet
`ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/`.

## Your Slice

Audit and map the current helper system into an implementation-ready capability
inventory.

## Context To Account For

- `tasks-pending/2026-06-16-on-page-scoped-helper-tool-parity.md`
- `tasks-pending/2026-06-16-helper-03-scoped-bna-helper.md`
- `src/lib/bna/helper/`
- `server.js`
- `public/operations.html`
- `public/js/bna-bot-widget.js`
- `ops/helper-tool-parity-map.md`
- `ops/helper-tool-parity-map.json`
- `ops/action-registry.json`
- `ops/route-registry.json`
- `memory-topics/workspace-model.md`
- `memory-topics/workspace-scope-isolation.md`

## Build Output Required

Create a complete capability map for the helper:

- existing helper APIs;
- existing helper UI entry points;
- existing helper registry/tool/planner files;
- missing helper tools;
- existing action registry entries that should become helper tools;
- route registry entries that need deep-link/filter support;
- current privacy/scope guardrails;
- test files to extend.

Create a proposed machine-readable capability schema:

```json
{
  "tool_id": "accounting.parents_with_balance",
  "label": "Parents With Outstanding Balance",
  "surface": "operations",
  "workspace_scopes": ["bna_school", "rabbi_sheller_provider"],
  "roles_allowed": ["super_admin", "workspace_owner"],
  "side_effect": "read",
  "confirmation_policy": "none",
  "parameters": {},
  "result_renderer": "metric_table_links",
  "deep_link": "/operations?view=accounting&filter=parents_owing",
  "tests": []
}
```

## Handoff Package

Return files for:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-01-audit-map/`

Use exact `packet_id`: `helper-bot-workspace-agent-01-audit-map`. The folder
name, `packet.json`, `status.json`, and `MANIFEST.json` must all use this same
ID.

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

`CODEX_PROMPT.md` should tell Codex exactly how to inspect and convert your
capability map into code.

## Guardrails

No code that grants broad access. Server must recompute scope. No GHL runtime.
No external writes.
