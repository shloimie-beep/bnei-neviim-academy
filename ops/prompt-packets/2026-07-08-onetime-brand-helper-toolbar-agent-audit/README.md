# One Time Brand Helper Toolbar Agent Audit

This packet closes `REQ-20260707-136` by making the next One Time brand,
helper, toolbar, and Communications audit autonomous for Agent Mode.

The prompt is audit-only and parallel-safe. The required handoff is Operations
Agent Review drop-off with `prompt_key` `one-time-brand-helper-toolbar-audit`.
If drop-off fails, the agent must still return an `OPERATIONS_DROPOFF_FAILED`
report with the complete redacted payload.

Use `AGENT-MODE-PROMPTS.md` as the paste-ready prompt. The app-visible generated
prompt lives at:

`https://bneineviimacademy.org/agent-review-prompts/one-time-brand-helper-toolbar-audit.md`
