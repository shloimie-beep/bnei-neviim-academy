# RAW-20260703-005 - ChatGPT To Codex Dropoff Workflow

## Raw intake

Operator said:

> There's just one more thing that I want to add, you know. I want Codex to be able, you know, I thought what was happening is, is that Codex was leaving comments on the repo and you were using those comments as his, like, output and implementing them. So that would be, like, the best way if Codex can actually write to you. Because, not Codex, I mean, if ChatGPT was able to write to you, and you were able to implement these packets, and you were able to prompt him, and he was able to write a ton of code, understood by natural language, and you would be able to implement that code. So it doesn't have to be just Codex credits. I think that would be the best bet. So where does he, can we set that up? Like, is that the best way to do this, that he's dropping in these comments and you're acting upon these comments as a task? That's really the workflow that I've been trying to establish, where I don't have to paste what ChatGPT does.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260703-005 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-03-chatgpt-to-codex-dropoff-workflow.md |

## Parsed intent

- Create a durable way for ChatGPT to hand large natural-language/code packets to Codex without the operator pasting everything back into Codex chat.
- Prefer a repo-visible or GitHub-visible handoff that Codex can audit and implement.
- Keep Codex as the implementation verifier, not a blind executor of generated code.
