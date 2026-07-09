# Agent Mode Prompt - Student Portal

Generated: 2026-07-09T14:26:22.079Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260626-004
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=student-portal
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=student-portal&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dstudent-portal&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Astudent-portal%3Aall-contexts&autosave=1
Prompt key: student-portal
Idempotency key: 2026-06-26-agent-review-dropoff-repair:student-portal:all-contexts
Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md

## Required Workflow State

First open this public prompt URL: https://join.onetimeonetime.com/agent-review-prompts/student-portal.md. Then try the Agent Review Hub. Confirm this prompt key. When the protected Agent Review Hub is available, Click Start Audit / I started this agent mode if not already started, open the drop-off page, and keep it available. If the protected Agent Review Hub is blank, 401, or sign-in blocked, record hub_unavailable_401 in evidence and continue the audit from this public prompt and its public artifact URLs. Do not stop before testing reachable public/review routes just because the hub requires an Operations session. If any context, route, login, helper, link, viewport, action, artifact, or save path fails, immediately save a BLOCKED result when a save path is available with exact route attempted, what failed, partial findings, and smallest repair suggestion. Do not end in chat until the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key, unless every save path is also auth-blocked or failed. Final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ...

- Do not treat a partial audit as pass.
- Do not say a JSON handoff is prepared.
- Do not ask the owner to manually upload the payload.
- Do not ask the operator whether to submit/seal a blocked or failed result.
- If blocked midway, save BLOCKED immediately.
- If browser can still reach drop-off, use drop-off before any chat final.
- If normal form fails, use exact drop-off URL.
- If exact drop-off URL fails, use Emergency paste JSON and save.
- If UI save fails, POST to /api/bna/agent-review/results.
- Only if every save path fails may you return OPERATIONS_DROPOFF_FAILED with complete redacted JSON payload.

## Copy Metadata

```json
{
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "prompt_key": "student-portal",
  "context_key": null,
  "public_prompt_url": "https://join.onetimeonetime.com/agent-review-prompts/student-portal.md",
  "public_artifacts": [],
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=student-portal",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=student-portal&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dstudent-portal&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Astudent-portal%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260626-004",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:student-portal:all-contexts"
}
```

## Start

Open this public prompt first: https://join.onetimeonetime.com/agent-review-prompts/student-portal.md
Then try the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

If the Agent Review Hub opens, use it for Start Audit, context cards, drop-off, and readback. If it is blank, 401, or sign-in blocked, continue from this public prompt, include hub_unavailable_401 in the result payload, and use direct URLs from the prompt/artifacts where available.

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Public Prompt And Artifacts

Public prompt URL: https://join.onetimeonetime.com/agent-review-prompts/student-portal.md
- No separate public artifacts are required for this prompt.

## Review Contexts

- Student QA: role student, workspace bna, project bna_school_platform, route /student?review=agent, helper student helper.

## Work To Perform

Focus: student-safe dashboard, no adult/private notes, helper boundaries, assignments, progress, and denied cross-student access.

1. Open each listed review context from the hub when available. If hub auth blocks the run, open the listed routes directly and record hub_unavailable_401 instead of stopping at a blank protected page.
2. Confirm the visible "Reviewing as" banner, role, workspace/project, expiry, and Exit control.
3. Converse naturally with the scoped helper using paraphrases, typos, follow-ups, and corrections.
4. Follow every internal link returned by the helper and verify route, section/tab, role, workspace, project, expected landmark, authorization result, and safe fallback.
5. Test safe preview actions only. Do not send, publish, charge, deploy, change DNS, rotate credentials, move Drive files, retry production workers, or mutate student data.
6. For any claimed write, verify the typed action/audit/result record. If no record exists, mark the claim failed.
7. Include the newest Drive recording trace status from the hub; do not claim the recording processed beyond the trace evidence.
8. You must submit the structured result yourself before your final answer. Normal save path: use the Agent Review Hub/drop-off page. If that form fails, use the exact drop-off URL below. If that still fails, use the Emergency paste JSON and save control on the drop-off page. If the browser cannot submit any page, POST the same JSON to the API fallback.
9. A successful final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... and include the saved readback URL. Do not finish with downloadable artifacts, owner-upload instructions, claims that a JSON handoff is prepared, file handoff language, or manual-upload wording.
10. If every save path fails, the final answer must start with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and include the complete redacted JSON payload so Codex can recover it. This is the only allowed manual payload handoff.
11. The window is safe to close only after the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key.
12. If a scoped context redirects to public/sign-in content and cannot open after owner takeover login, stop that context, save BLOCKED through the self-save path, and do not audit the public helper as the scoped helper.

## Result Shape

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=student-portal&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dstudent-portal&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Astudent-portal%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260626-004",
  "prompt_key": "student-portal",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=student-portal",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=student-portal&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dstudent-portal&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Astudent-portal%3Aall-contexts&autosave=1",
  "public_prompt_url": "https://join.onetimeonetime.com/agent-review-prompts/student-portal.md",
  "public_artifacts": [],
  "hub_auth_state": "available|hub_unavailable_401|sign_in_required|unknown",
  "status": "pass|fail|blocked",
  "role_workspace": "role/workspace tested",
  "conversation_summary": "brief summary, no private transcript body",
  "routes_visited": [
    "canonical route keys and paths"
  ],
  "helper_responses": [
    "short redacted summaries only"
  ],
  "link_action_outcomes": [
    "PASS/FAIL per link/action"
  ],
  "evidence": [
    "screenshot path or DOM/readback evidence, redacted"
  ],
  "blocked_route_or_step": "required when blocked",
  "attempted_action": "required when blocked",
  "observed_failure": "required when blocked",
  "partial_routes_visited": [
    "routes visited before blocker"
  ],
  "partial_helper_responses": [
    "helper responses before blocker"
  ],
  "evidence_notes": "redacted notes for readback",
  "severity": "none|low|medium|high|critical",
  "blocker": "required when status is blocked",
  "suggested_correction": "exact repair or none",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:student-portal:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
