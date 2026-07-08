# Agent Mode Prompt - Helper Natural-Language Action Audit

Generated: 2026-07-08T20:40:42.518Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260626-005
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=helper-natural-language-action-audit
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=helper-natural-language-action-audit&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dhelper-natural-language-action-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Ahelper-natural-language-action-audit%3Aall-contexts&autosave=1
Prompt key: helper-natural-language-action-audit
Idempotency key: 2026-06-26-agent-review-dropoff-repair:helper-natural-language-action-audit:all-contexts
Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md

## Required Workflow State

First open the Agent Review Hub. Confirm this prompt key. Click Start Audit / I started this agent mode if not already started. Open the drop-off page and keep it available. Then run the audit. If any context, route, login, helper, link, viewport, action, or save path fails, immediately save a BLOCKED result through the drop-off page with exact route attempted, what failed, partial findings, and smallest repair suggestion. Do not end in chat until the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key. Final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ...

- Do not treat a partial audit as pass.
- Do not say a JSON handoff is prepared.
- Do not ask the owner to manually upload the payload.
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
  "prompt_key": "helper-natural-language-action-audit",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=helper-natural-language-action-audit",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=helper-natural-language-action-audit&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dhelper-natural-language-action-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Ahelper-natural-language-action-audit%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260626-005",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:helper-natural-language-action-audit:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- Public Visitor: role anonymous_public, workspace public, project bna_public, route /, helper public website helper.
- One Time Public Landing: role anonymous_public, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time, helper One Time public landing helper.
- BNA Operations: role super_admin, workspace bna_platform, project bna_school_platform, route /operations?view=tasks, helper Operations helper.
- Owner Task / Decision: role operator_with_agent_mode_assist, workspace bna_platform, project task_decision_queue, route /operations?view=tasks, helper Operations task or Decision card.
- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.
- Provider Staff: role provider_staff, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider-participant.html?review=one-time, helper provider participant helper.
- Parent QA: role parent, workspace bna, project bna_school_platform, route /parent?review=agent, helper parent helper.
- Student QA: role student, workspace bna, project bna_school_platform, route /student?review=agent, helper student helper.
- One Time Member: role member_parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /rabbi-member.html?review=one-time, helper One Time member helper.
- One Time Parent: role parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /parent.html?review=one-time, helper One Time parent review portal.
- One Time Student: role student, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /student.html?review=one-time, helper One Time student review portal.
- One Time Classroom: role classroom_member, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS, helper One Time classroom helper.
- Wrong Role/Error States: role negative_authorization_probe, workspace mixed, project mixed, route /operations/agent-review?negative=1, helper all helpers, negative cases.

## Work To Perform

Focus: natural-language helper actions, link grounding, typed audits, unsupported actions, and readback proof.

1. Open each listed review context from the hub.
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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=helper-natural-language-action-audit&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dhelper-natural-language-action-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Ahelper-natural-language-action-audit%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260626-005",
  "prompt_key": "helper-natural-language-action-audit",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=helper-natural-language-action-audit",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=helper-natural-language-action-audit&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dhelper-natural-language-action-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Ahelper-natural-language-action-audit%3Aall-contexts&autosave=1",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:helper-natural-language-action-audit:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
