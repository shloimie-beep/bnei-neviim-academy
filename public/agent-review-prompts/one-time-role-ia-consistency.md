# Agent Mode Prompt - One Time Role IA Consistency

Generated: 2026-07-09T10:50:12.121Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260707-115
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=one-time-role-ia-consistency
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-role-ia-consistency&requirement_id=REQ-20260707-115&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-role-ia-consistency&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-role-ia-consistency%3Aall-contexts&autosave=1
Prompt key: one-time-role-ia-consistency
Idempotency key: 2026-06-26-agent-review-dropoff-repair:one-time-role-ia-consistency:all-contexts
Reusable protocol/template: docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md

## Required Workflow State

First open this public prompt URL: https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md. Then try the Agent Review Hub. Confirm this prompt key. When the protected Agent Review Hub is available, Click Start Audit / I started this agent mode if not already started, open the drop-off page, and keep it available. If the protected Agent Review Hub is blank, 401, or sign-in blocked, record hub_unavailable_401 in evidence and continue the audit from this public prompt and its public artifact URLs. Do not stop before testing reachable public/review routes just because the hub requires an Operations session. If any context, route, login, helper, link, viewport, action, artifact, or save path fails, immediately save a BLOCKED result when a save path is available with exact route attempted, what failed, partial findings, and smallest repair suggestion. Do not end in chat until the Agent Review Hub or readback API shows the AGR result for this prompt key and idempotency key, unless every save path is also auth-blocked or failed. Final answer must start with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ...

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
  "prompt_key": "one-time-role-ia-consistency",
  "context_key": null,
  "public_prompt_url": "https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md",
  "public_artifacts": [],
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-role-ia-consistency",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-role-ia-consistency&requirement_id=REQ-20260707-115&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-role-ia-consistency&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-role-ia-consistency%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260707-115",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-role-ia-consistency:all-contexts"
}
```

## Start

Open this public prompt first: https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md
Then try the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

If the Agent Review Hub opens, use it for Start Audit, context cards, drop-off, and readback. If it is blank, 401, or sign-in blocked, continue from this public prompt, include hub_unavailable_401 in the result payload, and use direct URLs from the prompt/artifacts where available.

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Public Prompt And Artifacts

Public prompt URL: https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md
- No separate public artifacts are required for this prompt.

## Review Contexts

- BNA Operations: role super_admin, workspace bna_platform, project bna_school_platform, route /operations?view=tasks, helper Operations helper.
- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.
- One Time Parent: role parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /parent.html?review=one-time, helper One Time parent review portal.
- One Time Student: role student, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /student.html?review=one-time, helper One Time student review portal.
- One Time Member: role member_parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /rabbi-member.html?review=one-time, helper One Time member helper.
- One Time Classroom: role classroom_member, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS, helper One Time classroom helper.
- Wrong Role/Error States: role negative_authorization_probe, workspace mixed, project mixed, route /operations/agent-review?negative=1, helper all helpers, negative cases.

## Work To Perform

Focus: consistent side panel, category, top subcategory, filter, drawer, role-label, and mobile IA placement across Super Admin, Rabbi/provider, parent, student, member, and classroom views.

## Exact Navigation

1. Start at /operations/agent-review and open each listed review context from the hub when available.
2. From /operations, navigate visibly through the workspace switcher into rabbi_sheller_provider / one_time_mishnah_class before using route fallbacks.
3. Also open these direct review routes after visible navigation has been attempted: /operations?view=tasks, /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class, /provider.html?admin_provider=one-time&section=mailbox, /provider.html?review=one-time, /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.
4. Compare against live One Time host routes where accessible: https://join.onetimeonetime.com/, https://join.onetimeonetime.com/parent/login, https://join.onetimeonetime.com/student/login, and https://join.onetimeonetime.com/provider.html?review=one-time.
5. For each route, capture the IA map at 1440px and 390px: side navigation categories, selected category state, top subcategories/tabs, filters/search controls, primary action buttons, role/workspace label, drawer/helper placement, and mobile menu behavior.
6. Compare each role against the Operations shell pattern. The position can adapt to role scope, but the placement model must feel the same across workspaces.
7. Flag any One Time screen that splits categories in a weird way, moves filters to a new position, duplicates controls, hides the role being viewed, or shows Super Admin setup/debug cards to Rabbi, parent, student, or member roles.
8. In the provider/Rabbi route, verify whether random configuration cards are actionable for Rabbi. If they are not actionable by Rabbi, report them as role-contaminating admin noise.
9. In parent/student/member/classroom routes, verify that the view never exposes unrelated BNA records, Operations task data, provider setup internals, raw tokens, or other families/students.

## Required Audit Output

- Produce a comparison table with one row per route and columns for side categories, top subcategories, filters, role label, drawer/helper, mobile behavior, and irrelevant/admin noise.
- Rank inconsistencies by severity using P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.
- Recommend a single shared IA rule for category/subcategory/filter placement that Codex can apply across provider, parent, student, member, classroom, and Operations views.
- Do not propose color-only fixes. Prioritize structure, spacing, hierarchy, role clarity, and mobile behavior.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-role-ia-consistency&requirement_id=REQ-20260707-115&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-role-ia-consistency&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-role-ia-consistency%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260707-115",
  "prompt_key": "one-time-role-ia-consistency",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-role-ia-consistency",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-role-ia-consistency&requirement_id=REQ-20260707-115&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-role-ia-consistency&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-role-ia-consistency%3Aall-contexts&autosave=1",
  "public_prompt_url": "https://join.onetimeonetime.com/agent-review-prompts/one-time-role-ia-consistency.md",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-role-ia-consistency:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
