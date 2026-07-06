# ChatGPT Agent Mode Dropoff Smoke Prompt

Use this prompt to test whether a ChatGPT Agent Mode session can hand work to
Codex without manual copy/paste or the agent fleet running.

## Prompt To Give ChatGPT Agent Mode

```text
You are testing the BNA ChatGPT-to-Codex dropoff workflow.

Repository: https://github.com/shloimie-beep/bnei-neviim-academy

Smoke-test goal: prove whether this ChatGPT Agent Mode session can create a
repo-visible handoff packet for Codex. This is a no-op dropoff test only.

Hard limits:
- Do not edit production app/source files.
- Do not run deploys.
- Do not perform external sends, payment/account changes, DNS changes,
  credential changes, provider mutations, Drive writes, or production data
  changes.
- Do not include secrets, passwords, cookies, API keys, private contact
  exports, raw private screenshots, payment data, raw transcript bodies, phone
  exports, or private message bodies.
- Do not use a /mnt/data file or local download as the only handoff.

First try repo-file mode:

1. Create a new branch or PR that contains only this folder:

   ops/chatgpt-ramble-dropoff/incoming/chatgpt-agent-dropoff-smoke-20260706-906/

2. Inside that folder create exactly these files:

   - packet.json
   - RAW.md
   - CODEX_PROMPT.md
   - MANIFEST.json
   - status.json
   - PATCHES.md

3. Use the file contents below exactly.

4. If repo-file creation or PR creation fails with a permission error, use
   GitHub comment fallback instead.

GitHub comment fallback:

Post one GitHub issue or PR comment in this repository. Prefer PR #90 if it is
available:

https://github.com/shloimie-beep/bnei-neviim-academy/pull/90

The comment must contain the marker:

BNA_CHATGPT_DROPOFF_PACKET

and the complete file blocks below.

If you cannot write repo files, open a PR, or post a GitHub comment, finish
with:

CANNOT_WRITE_GITHUB

and explain the exact permission error.

After you create the repo-file PR or GitHub comment, reply with only:

DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>

File contents:

### File: packet.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-906",
  "schema_version": "bna.chatgpt_dropoff.v1",
  "source": "chatgpt_agent_mode",
  "packet_type": "prompt_packet",
  "status": "ready_for_codex_audit",
  "scope_summary": "No-op smoke test proving ChatGPT Agent Mode can create a repo-visible dropoff for Codex.",
  "workspace": "bna_platform",
  "project": "agent_ops",
  "sentinel": "BNA_DROPOFF_SMOKE_20260706_906",
  "secrets_included": false,
  "external_writes_performed": false
}
```

### File: RAW.md

```markdown
# Raw Source

This is a no-op smoke test from ChatGPT Agent Mode.

Sentinel: BNA_DROPOFF_SMOKE_20260706_906

Purpose: prove whether this ChatGPT session can create a repo-visible packet or
marked GitHub comment for Codex pickup before the BNA agent fleet is turned on.
```

### File: CODEX_PROMPT.md

```markdown
# Codex Prompt

Audit this smoke packet only.

Expected Codex behavior:

- Verify the packet files are present.
- Verify the sentinel is present: `BNA_DROPOFF_SMOKE_20260706_906`.
- Verify no secrets or private data are present.
- Verify `status.json` is `ready_for_codex_audit`.
- Do not edit app/source files.
- Do not queue this as real implementation work unless Shloimie explicitly asks
  for a live queue test.
- Do not perform external sends, payments, access grants, DNS changes,
  credential changes, provider mutations, Drive writes, production data
  changes, or deploys.

If valid, record that ChatGPT Agent Mode successfully created a repo-visible
dropoff packet.
```

### File: MANIFEST.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-906",
  "schema_version": "bna.chatgpt_dropoff_manifest.v1",
  "packet_type": "prompt_packet",
  "sentinel": "BNA_DROPOFF_SMOKE_20260706_906",
  "proposed_repo_changes": [],
  "tests_expected": [
    "npm run chatgpt:dropoff:comments:scan -- --url <comment-url>",
    "npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-906"
  ]
}
```

### File: status.json

```json
{
  "packet_id": "chatgpt-agent-dropoff-smoke-20260706-906",
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
npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-906
```

If ChatGPT returns a PR with repo files:

```powershell
npm run chatgpt:dropoff:scan -- --packet chatgpt-agent-dropoff-smoke-20260706-906
```

Use `scan` first. Do not queue the smoke packet as a real Codex job unless the
operator explicitly asks for a live queue test.
