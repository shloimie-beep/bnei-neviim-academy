# RAW-20260708-005 - Agent Mode Template Protocol Lock

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-005 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-agent-review-start-copy-dropoff-repair.md |
| Created at | 2026-07-08T09:26:44+03:00 |
| Privacy classification | internal_agent_review_protocol |

## Raw Intake

Shloimie added:

> Also make sure that you lock this in until they can actual template and
> prompt that we're using for agent mode that way each time it will just work
> that's also very important that we lock this into a protocol that is that can
> be duplicated

## Parsed Requirement

- `REQ-20260708-015`: Lock the Agent Mode Start Audit -> Copy -> Drop-off ->
  Readback behavior into a reusable protocol/template and regression test so
  future Agent Review prompts duplicate the same workflow instead of relying on
  one-off prompt text.

## Routing

This belongs to the active Agent Review drop-off repair goal. It is a durable
protocol/template hardening requirement, not a separate One Time UI cleanup
task.
