# ChatGPT Meta Prompt - Create One Time Agent Mode Audit Packets

Give this prompt to a GitHub-connected ChatGPT session.

```text
You are preparing repo-visible Agent Mode audit prompts for Codex and Shloimie.

Repository:
https://github.com/shloimie-beep/bnei-neviim-academy

First read these repo files if available:

- BNA-START-HERE.md
- AGENTS.md
- MEMORY.md
- memory-topics/one-time-rabbi-sheller.md
- ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md
- ops/chatgpt-ramble-dropoff/README.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/README.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/01-control-tower-current-state-agent-mode.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/02-public-funnel-agent-mode.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/03-rabbi-operations-backend-agent-mode.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/04-portals-classroom-agent-mode.md
- ops/prompt-packets/2026-07-06-onetime-full-ui-agent-audit/05-cross-system-consistency-agent-mode.md

Goal:
Create a repo-visible dropoff packet that contains the One Time Agent Mode
audit prompt series and tells Codex exactly how to pick up the audit reports.
This is prompt-generation and audit setup only. Do not edit production app or
source files.

Use this packet folder:

ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911/

Create these files:

- packet.json
- RAW.md
- CODEX_PROMPT.md
- MANIFEST.json
- status.json
- PROMPTS.md

Set status.json status to:

ready_for_codex_audit

In PROMPTS.md, include the five runnable Agent Mode prompts from:

1. 01-control-tower-current-state-agent-mode.md
2. 02-public-funnel-agent-mode.md
3. 03-rabbi-operations-backend-agent-mode.md
4. 04-portals-classroom-agent-mode.md
5. 05-cross-system-consistency-agent-mode.md

If repo-file creation or PR creation fails, use GitHub comment fallback:

- Post one GitHub issue or PR comment in this repository.
- Include the marker BNA_CHATGPT_DROPOFF_PACKET.
- Include complete fenced blocks for packet.json, RAW.md, CODEX_PROMPT.md,
  MANIFEST.json, status.json, and PROMPTS.md.

If you cannot write repo files, open a PR, or post a GitHub comment, reply:

CANNOT_WRITE_GITHUB

and give the exact permission error.

Hard limits:

- Do not edit app/source/runtime files.
- Do not run deploys.
- Do not perform WhatsApp, email, Telegram, payment, access, DNS, Drive,
  provider-account, credential, or production-data actions.
- Do not include passwords, cookies, API keys, private contact exports, raw
  WhatsApp bodies, raw transcript bodies, payment data, or unredacted private
  screenshots.
- Use exact live links. Canonical One Time production is
  https://join.onetimeonetime.com/. BNA /one-time is preview/fallback only.

After creating the repo-file PR or GitHub comment, reply with only:

DROP_OFF_CREATED: <GitHub PR URL or GitHub comment URL>
```
