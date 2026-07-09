# ChatGPT Window 05: Verifier Synthesis And Closeout

You are a repo-connected ChatGPT sidekick for BNA. Your job is to create one
repo-visible packet for Codex. Do not solve the whole parent ramble. Complete
only this prompt's scope and record the next packet or blocker.

## Required Read Order

1. `BNA-START-HERE.md`
2. `AGENTS.md`
3. `docs/BNA-RAMBLE-TO-DONE.md`
4. `ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md`
5. `ops/chatgpt-ramble-dropoff/CHATGPT-DIRECTIVE.md`
6. `ops/chatgpt-ramble-dropoff/README.md`
7. `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.md` when present

## Lane

- Parent raw ID: `RAW-20260709-003`
- Prompt batch: `20260709-chatgpt-multi-window-and-kimi-fallback`
- Prompt ID: `20260709-chatgpt-multi-window-and-kimi-fallback-05-verifier-synthesis-closeout`
- Packet ID to create: `20260709-chatgpt-multi-window-and-kimi-fallback-05-verifier-synthesis-closeout`
- Packet role: `verifier_synthesis_closeout`
- Owner: `ChatGPT-window-05`
- Workspace: `bna_platform`
- Project: `general`
- Lane key: `bna-platform-general-verifier-synthesis-closeout`

## Scope

Verify child packet consistency, dedupe overlapping claims, identify missing proof, and produce the final Codex handoff order. Do not claim parent completion unless every child lane has terminal evidence.

## Out Of Scope

- Do not solve the whole parent ramble.
- Do not edit unrelated product/code lanes.
- Do not claim Codex verification, deployment, live smoke, payment, send,
  access grant, DNS/account, credential, provider account, Drive, WhatsApp/WAPI,
  Telegram-recipient, or production-data mutations.
- Do not duplicate work if the control tower already shows this lane active,
  blocked, or terminal.

## Required Output

Create a repo-visible packet folder:

`ops/chatgpt-ramble-dropoff/incoming/20260709-chatgpt-multi-window-and-kimi-fallback-05-verifier-synthesis-closeout/`

The folder must include:

- `packet.json`
- `RAW.md`
- `CODEX_PROMPT.md`
- `MANIFEST.json`
- `status.json`
- `PATCHES.md` when code/diff help is useful
- optional `attachments/`

Set `status.json.status` to `ready_for_codex_audit` or
`ready_for_codex_pickup` only when the packet is complete.

Expected output from this lane:

A repo-visible current_state_audit or prompt_packet with final audit table, blockers, proof gaps, and exact next Codex pickup commands.

## Parent Source

Read the full parent raw source from `raw-input/RAW-20260709-003-chatgpt-multi-window-and-kimi-fallback.md`.

Parent source excerpt:
```text
# RAW-20260709-003 - ChatGPT multi-window packets and Kimi fallback

## Metadata

- Source: `codex_chat`
- Captured at: `2026-07-09T09:22:00+03:00`
- Workspace/project: `bna_platform`
- Privacy: `internal_operations_no_secrets_no_private_rows`
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-07-09-chatgpt-multi-window-and-kimi-fallback.md`

## Raw intake

The operator asked why he has to remember the ChatGPT/Codex packet prompts at
all. He wants the repo programming/protocol to make ChatGPT and Codex know the
right flow automatically: check the control tower, avoid duplicates, split
broad rambles, and create/drop packets correctly without relying on the
operator to repeat magic wording.

The operator suggested that when ChatGPT needs to make five packets, it may be
better for ChatGPT to first make five different prompts, then the operator can
drop those prompts into five different ChatGPT windows. Each window would make
one packet because one ChatGPT chat has a practical content limit.

The operator asked about Kimi. He wants Kimi set to the highest level, which he
thought might be 2.7, and wants Kimi to be a fallback. If Codex runs out of
credits, the system should not sit stale; it should start using Kimi
automatically if there is a safe way to do that.

The operator also repeated the coordination constraint: another agent is
working, and he saw that the other agent could not push everything because this
session was writing in overlapping locations. He asked Codex to take that into
consideration and apply the necessary precautions.
```
