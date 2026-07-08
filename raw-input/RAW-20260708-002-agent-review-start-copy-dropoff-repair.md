# RAW-20260708-002 - Agent Review Start, Copy, And Drop-off Repair

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-002 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-agent-review-start-copy-dropoff-repair.md |
| Created at | 2026-07-08T00:00:00+03:00 |
| Privacy classification | internal_agent_review_protocol_and_ui_audit |
| Source issue | https://github.com/shloimie-beep/bnei-neviim-academy/issues/24 |

## Raw Intake

Shloimie provided a ChatGPT-prepared follow-up packet titled:

> Agent Review Protocol Analysis and Codex Follow-Up Prompt

The operator described a failed Agent Mode run for prompt key
`one-time-brand-helper-toolbar-audit`: the agent opened the Agent Review Hub,
the owner logged in, the agent opened the drop-off tab and several One Time
review contexts, collected partial findings, but failed to return to the
drop-off tab and save an AGR result. The agent answered directly in chat.

The raw source stated:

> The protocol failure happened because the prompt treated drop-off as a final
> instruction, not as a tracked workflow state.

Required sequence from the raw source:

> Started
>
> Audit in progress
>
> Blocked/fail/pass result saved
>
> Readback confirmed
>
> Only then final response

Operator follow-up:

> implement implement this and there are still a lot of problems man so we
> need a lot of agent mode prompts but we need to do one at a time till this
> starts to work so I don't have to be on top of it

Scope clarification from the same message:

> I want you to just work on this agent drop off for now

## Goal Packet Extract

The message included a `BNA_GOAL_MODE_EXECUTION_PACKET` with title:

> Fix Agent Review start/copy/drop-off protocol and record partial One Time
> audit findings

Existing metadata from the packet:

- raw_id: `RAW-20260626-001`
- parent_goal_id: `PARENT-20260626-001`
- agent_review_run_id: `2026-06-26-agent-review-dropoff-repair`
- requirement_id: `REQ-20260707-136`
- prompt_key: `one-time-brand-helper-toolbar-audit`
- original idempotency key:
  `2026-06-26-agent-review-dropoff-repair:one-time-brand-helper-toolbar-audit:all-contexts`
- drop-off URL:
  `/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-brand-helper-toolbar-audit&requirement_id=REQ-20260707-136&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-brand-helper-toolbar-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-brand-helper-toolbar-audit%3Aall-contexts&autosave=1`

Primary objective from the packet:

> Make it impossible for an Agent Mode prompt run to complete in chat without
> either:
> A. saving an AGR result through the Agent Review drop-off and confirming
> readback, or
> B. reporting OPERATIONS_DROPOFF_FAILED with exact UI/API error and the
> redacted payload after every save path fails.

Non-negotiable prompt language from the packet:

> First open the Agent Review Hub. Confirm this prompt key. Click Start Audit /
> I started this agent mode if not already started. Open the drop-off page and
> keep it available. Then run the audit. If any context, route, login, helper,
> link, viewport, action, or save path fails, immediately save a BLOCKED result
> through the drop-off page with exact route attempted, what failed, partial
> findings, and smallest repair suggestion. Do not end in chat until the Agent
> Review Hub or readback API shows the AGR result for this prompt key and
> idempotency key. Final answer must start with OPERATIONS_DROPOFF_SAVED:
> AGR-... or OPERATIONS_DROPOFF_FAILED: ...

## Failed Partial Audit Findings To Preserve

Status from source: `FAIL / PARTIAL`.

Blocker:

- Agent failed to save AGR drop-off after partial audit.

Routes visited:

- `/operations/agent-review?prompt=one-time-brand-helper-toolbar-audit`
- `/one-time`
- `/operations?view=tasks`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email`
- `/provider.html?review=one-time`
- `/provider.html?admin_provider=one-time&section=mailbox`
- `/parent.html?review=one-time`
- `/student.html?review=one-time`
- `/rabbi-member.html?review=one-time`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`

Partial findings:

- One Time public branding was black/yellow and English-only; no Hebrew toggle
  was seen.
- Public helper leaked `BNA context`, `Shloimie`, and `BNA voice` wording on
  the One Time public route.
- Public helper sometimes stayed in Thinking state for too long.
- Workspace switcher click path to One Time was unclear; direct URL fallback
  worked.
- Communications > Email eventually showed `Rabbi / One Time Inbox`, but direct
  route hydration should be retested.
- Provider review left navigation was cramped/overlapping.
- Provider mailbox helper label said `BNA Helper`, which is brand bleed on One
  Time provider surface.
- Parent helper was privacy-safe but used BNA/Shloimie wording and did not
  ground library/worksheet answers in visible page context.
- Student route correctly excluded BNA goals and parent billing; worksheet
  answer was generic.
- Member and classroom routes used black/yellow but had dense top navigation
  likely needing mobile collapse.
- Full required viewport matrix was not completed.
- AGR drop-off was not saved, making the audit noncompliant.

## Implementation Boundary

This raw input authorizes the Agent Review start/copy/drop-off/readback repair
and durable recording of the failed partial audit. It does not authorize broad
One Time UI cleanup in this batch; those findings should become scoped future
Agent Mode prompts/backlog after drop-off is reliable.
