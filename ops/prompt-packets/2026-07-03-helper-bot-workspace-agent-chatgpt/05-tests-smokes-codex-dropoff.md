# ChatGPT Window 5 - Tests, Smokes, And Codex Dropoff Package

You are ChatGPT preparing one slice of a repo-ready implementation package for
Codex. Work only on this slice, but make sure the other ChatGPT outputs can be
combined safely.

Parent: `RAW-20260703-003`.

## Your Slice

Define the verification system, test matrix, and dropoff package format for the
workspace-scoped helper bot.

## Required Test Matrix

Prepare exact test plans and code-ready test descriptions for:

- helper actor/scope resolver;
- parent scope cannot see unrelated families/students;
- student scope cannot see admin/private/cross-student data;
- Rabbi / One Time scope cannot see BNA/family/provider data;
- public scope is anonymous-safe;
- "parents who owe me money" query returns scoped metrics and links;
- filter-setting changes route/query state without leaking records;
- deep links open the right Operations view;
- no-send draft actions stay previews;
- confirmation gates block sends/payments/access/external writes;
- helper audit logs redact private values;
- action registry and route registry coverage;
- mobile helper panel behavior;
- browser smoke for Operations helper result flow.

## Required Commands

Include expected verification commands:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --test tests/bna-helper-tools.test.js tests/helper-scope-profile-knowledge.test.js
node --test <new-helper-tests>
npm run watchdog:actions
npm run watchdog:security
npm run watchdog:audit
npm test
```

If UI changes are included:

```bash
npm run pqc:validate <packet>
npm run watchdog:protocol-drift
```

## Required Dropoff Package Contract

Each ChatGPT package must include:

```text
ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-<packet-id>/
  packet.json
  RAW.md
  CODEX_PROMPT.md
  MANIFEST.json
  status.json
  PATCHES.md
  attachments/
```

`packet.json`:

```json
{
  "packet_id": "helper-bot-workspace-agent-05-tests-dropoff",
  "parent_raw_id": "RAW-20260703-003",
  "packet_role": "tests_and_dropoff",
  "status": "ready_for_codex_audit",
  "scope": [],
  "out_of_scope": [],
  "files_expected": [],
  "tests_expected": [],
  "guardrails": []
}
```

`status.json`:

```json
{
  "packet_id": "helper-bot-workspace-agent-05-tests-dropoff",
  "status": "ready_for_codex_audit",
  "created_by": "ChatGPT",
  "external_writes_performed": false,
  "secrets_included": false,
  "requires_codex_audit_before_apply": true
}
```

## Handoff Package

Return files for:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-05-tests-dropoff/`

Use exact `packet_id`: `helper-bot-workspace-agent-05-tests-dropoff`. The
folder name, `packet.json`, `status.json`, and `MANIFEST.json` must all use
this same ID.

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

Do not claim implementation is done. ChatGPT prepares code and tests; Codex
must inspect, adapt to the actual repo, run verification, and record proof.
