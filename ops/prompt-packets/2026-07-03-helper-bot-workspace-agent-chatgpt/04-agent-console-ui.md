# ChatGPT Window 4 - Replit/Lovable-Style Agent Console UI

You are ChatGPT preparing one slice of a repo-ready implementation package for
Codex. Work only on this slice. Do not solve the whole helper bot.

Parent: `RAW-20260703-003`.

## Your Slice

Design and code-prep the helper UI as a serious action console, not a generic
chat bubble.

## Product Target

The helper should feel closer to Replit/Lovable agent panels:

- one prompt box;
- visible understanding of current workspace/page;
- step-by-step execution timeline;
- tool-call cards;
- result cards/tables;
- filter chips and route links;
- confirmation panels for risky actions;
- suggested next actions;
- error/blocker cards;
- mobile-safe layout.

## Required UI States

Define markup/state contracts for:

1. closed launcher;
2. open idle state;
3. prompt submitted;
4. understanding/scope check;
5. multi-step plan preview;
6. querying data;
7. setting filters;
8. result table/cards with links;
9. suggested actions;
10. confirmation required;
11. action completed;
12. blocked external action;
13. permission denied;
14. no data found;
15. ambiguous entity selection;
16. error with retry.

## Required Components

Prepare code-ready component/DOM guidance for `public/operations.html` and
shared portal helper surfaces:

- helper shell;
- agent timeline;
- tool-call card;
- result metric strip;
- result table/list;
- deep-link button;
- filter chips;
- confirmation card;
- blocker card;
- next-action buttons;
- audit/run details disclosure.

## UI Guardrails

- Do not show admin diagnostics in normal Rabbi/provider/member/parent/student
  views unless role-gated.
- Do not expose private data in screenshots or public routes.
- Student mode must be child-safe.
- Existing design should stay utilitarian and dense, not a marketing hero.

## Handoff Package

Return files for:

`ops/chatgpt-ramble-dropoff/incoming/helper-bot-workspace-agent-04-agent-console-ui/`

Use exact `packet_id`: `helper-bot-workspace-agent-04-agent-console-ui`. The
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

`PATCHES.md` must include exact DOM/CSS/JS integration guidance and screenshot
acceptance criteria.
