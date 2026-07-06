# ChatGPT Agent Mode Dropoff Smoke Prompt

Use this prompt to test whether a ChatGPT Agent Mode session can hand work to
Codex without manual copy/paste.

## Prompt To Give ChatGPT Agent Mode

```text
You are testing the BNA ChatGPT-to-Codex dropoff workflow.

Repository: https://github.com/shloimie-beep/bnei-neviim-academy

Goal: prove whether this ChatGPT Agent Mode session can create a repo-visible
handoff for Codex. This is a smoke test only. Do not edit production app/source
files. Do not include secrets, passwords, cookies, API keys, private contact
exports, raw private screenshots, payment data, or private message bodies.

First try repo-file mode:

1. Create a new branch or PR that contains only this folder:

   ops/chatgpt-ramble-dropoff/incoming/chatgpt-agent-dropoff-smoke-20260706-001/

2. Inside that folder create exactly these files:

   - packet.json
   - RAW.md
   - CODEX_PROMPT.md
   - MANIFEST.json
   - status.json
   - PATCHES.md

3. Use the file contents below.

4. If repo-file creation or PR creation fails with a permission error, do not
   stop. Use GitHub comment fallback instead.

GitHub comment fallback:

Post one GitHub issue/PR comment on this PR:

https://github.com/shloimie-beep/bnei-neviim-academy/pull/90

The comment must contain the marker:

BNA_CHATGPT_DROPOFF_PACKET

and the complete file blocks below.

If you cannot write repo files, open a PR, or post a GitHub comment, finish
with:

CANNOT_WRITE_GITHUB

and explain the exact permission error. Do not provide a /mnt/data link or a
local download as the only handoff.

After you create the repo-file PR or GitHub comment, reply with only:

DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

File contents:

### File: packet.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-001",
  "schema_version": "bna.chatgpt_dropoff.v1",
  "source": "chatgpt_agent_mode",
  "packet_type": "current_state_audit",
  "status": "ready_for_codex_audit",
  "scope_summary": "Smoke test proving ChatGPT Agent Mode can create a repo-visible dropoff for Codex.",
  "workspace": "bna_platform",
  "project": "agent_ops",
  "secrets_included": false,
  "external_writes_performed": false
}
```

### File: RAW.md

```markdown
# Raw Source

This is a no-op smoke test from ChatGPT Agent Mode. It proves whether this
ChatGPT session can create a repo-visible packet or marked GitHub comment for
Codex pickup.
```

### File: CODEX_PROMPT.md

```markdown
# Codex Prompt

Audit this smoke packet only.

Expected Codex behavior:

- Verify the packet files are present.
- Verify no secrets or private data are present.
- Verify status is `ready_for_codex_audit`.
- Do not edit app/source files.
- Do not perform external sends, payments, access grants, DNS changes,
  credential changes, provider mutations, Drive writes, production data
  changes, or deploys.

If valid, record that ChatGPT Agent Mode successfully created a repo-visible
dropoff packet.
```

### File: MANIFEST.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-001",
  "schema_version": "bna.chatgpt_dropoff_manifest.v1",
  "packet_type": "current_state_audit",
  "proposed_repo_changes": [],
  "tests_expected": [
    "npm run chatgpt:dropoff:comments:scan -- --url <comment-url>",
    "npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-001"
  ]
}
```

### File: status.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-001",
  "status": "ready_for_codex_audit",
  "implementation_status": "not_started",
  "created_by": "ChatGPT Agent Mode",
  "external_writes_performed": false,
  "secrets_included": false,
  "requires_codex_audit_before_apply": true
}
```

### File: PATCHES.md

```markdown
# Patches

No code patches. This is a no-op smoke test.
```
```

## Codex Verification After ChatGPT Runs

If ChatGPT returns a GitHub comment URL:

```powershell
npm run chatgpt:dropoff:comments:scan -- --url <comment-url>
npm run chatgpt:dropoff:comments:apply -- --url <comment-url>
npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-001
```

If ChatGPT returns a PR with repo files:

```powershell
npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-001
```

Use `scan` first. Do not queue the smoke packet as a real Codex job unless the
operator explicitly asks for a live queue test.
