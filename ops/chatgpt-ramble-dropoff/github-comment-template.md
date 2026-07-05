# GitHub Comment Template For ChatGPT Dropoff

Use this when ChatGPT can write a GitHub issue or PR comment.

If repo-file creation fails with `403 Resource not accessible by integration`,
do not stop and do not link to a local ChatGPT ZIP. Post the complete packet as
a GitHub issue or PR comment using this template. Codex has a collector that
scans marked comments, extracts the file blocks, creates the local packet
folder, and then lets the normal dropoff ingestor validate and queue it.

````markdown
<!-- BNA_CHATGPT_DROPOFF_PACKET v2 -->

## BNA ChatGPT Dropoff Packet

Packet ID: helper-bot-workspace-agent-01-audit-map
Status: ready_for_codex_audit
Target workspace/project: app_wide / helper_bot
Target folder: ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-01-audit-map/
Packet type: current_state_audit

### Scope

Describe exactly what this packet covers.

### Out Of Scope

Describe what this packet must not change.

### File: packet.json

```json
{
  "packet_id": "helper-bot-workspace-agent-01-audit-map",
  "schema_version": "bna.chatgpt_dropoff.v1",
  "source": "chatgpt",
  "packet_type": "current_state_audit",
  "status": "ready_for_codex_audit",
  "scope_summary": "One sentence summary",
  "secrets_included": false,
  "external_writes_performed": false
}
```

### File: RAW.md

```markdown
Raw source and assumptions go here.
```

### File: CODEX_PROMPT.md

```markdown
Exact instructions for Codex go here.
```

### File: MANIFEST.json

```json
{
  "packet_id": "helper-bot-workspace-agent-01-audit-map",
  "schema_version": "bna.chatgpt_dropoff_manifest.v1",
  "proposed_repo_changes": [],
  "tests_expected": []
}
```

### File: status.json

```json
{
  "packet_id": "helper-bot-workspace-agent-01-audit-map",
  "status": "ready_for_codex_audit",
  "implementation_status": "not_started",
  "created_by": "ChatGPT",
  "external_writes_performed": false,
  "secrets_included": false,
  "requires_codex_audit_before_apply": true
}
```

### File: PATCHES.md

```markdown
Generated patches or replacement file sections go here. If no code was
generated, say so.
```

### Codex Instruction

Codex should audit this packet against the current repo, apply only valid
changes, run verification, and record evidence. Do not blindly apply generated
code. Do not perform external writes, sends, payments, access changes, DNS
changes, credential changes, or production mutations without explicit operator
approval.
````

Codex can collect marked GitHub comments with:

```bash
npm run chatgpt:dropoff:comments:apply
```

Then Codex can scan/queue materialized packet folders with:

```bash
npm run chatgpt:dropoff:apply
```

Codex can also preview a trusted GitHub issue/comment with:

```bash
npm run intake:github -- --url <github-issue-or-comment-url> --dry-run
```

If a status comment is ever needed, it remains approval-gated and requires the
existing status-posting approval path.

For sidekick memory/preference packets, use the same structure and change
`packet_type` to `memory_candidate` or `preference_update`. Put proposed memory
promotions in `CODEX_PROMPT.md`; do not put secrets, raw private message
bodies, private contact exports, or credential material in GitHub comments.
