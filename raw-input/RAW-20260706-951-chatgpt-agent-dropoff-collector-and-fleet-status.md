# RAW-20260706-951 - ChatGPT Agent Dropoff Collector And Fleet Status

## Metadata

- Source channel: codex_chat
- Created at: 2026-07-06T17:32:00+03:00
- Parse status: registered
- Workspace/project: bna_platform / agent_ops
- Related packet: `onetime-agent-prompt-series-20260706-911`
- Related live task/job: task `#1945`, agent job `#397`

## Raw operator request

> Hey, so when you're done with that, dude, this one, this one didn't work. This one didn't work over here. So everyone else is getting written in the right place, but this fellow didn't work. And when you're done also just check if the agent fleet is actually working on these things.

Attachment inspected:

- `C:\Users\User\.codex\attachments\f1c99922-b6d1-4a36-9a20-2dd0f53258f1\pasted-text.txt`

## Findings

- The attached Rabbi Operations / backend Agent Mode audit prompt did not create a repo-visible packet.
- The Agent Mode session ended with `CANNOT_WRITE_GITHUB` because no GitHub connectors were enabled for that ChatGPT session.
- A near-valid marked GitHub dropoff comment for the One Time prompt series existed at issue comment `4893592311`, but the collector rejected it because the comment omitted an outer `Status:` line even though `status.json` declared `ready_for_codex_audit`.
- The same comment included `PROMPTS.md`, which the collector did not preserve before this repair.
- After the collector fix, the packet was materialized under `ops/chatgpt-ramble-dropoff/incoming/onetime-agent-prompt-series-20260706-911/`.
- After the ingestor force-retry fix and credential-scoped live apply, the packet queued successfully as live task `#1945` / agent job `#397`.
- Agent fleet status check shows the queue sees the job, but the supervisor is not running. The fleet is therefore ready to claim one job but is not actively working it.

## Guardrails

- No password, cookie, API key, private contact export, raw WhatsApp body, or private screenshot was committed.
- Local credentials were loaded only into the process environment for the live queue/status commands and were not printed.
- No external send, payment/access/DNS/provider-account mutation, Drive write, deploy, or app-source implementation work was performed.
