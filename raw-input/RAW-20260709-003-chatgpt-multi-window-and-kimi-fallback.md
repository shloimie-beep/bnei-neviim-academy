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
