# Agent Mode Prompt - Rabbi Scheller Provider Admin

Generated: 2026-07-08T16:01:29.116Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260626-004
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-provider-admin
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-provider-admin&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-provider-admin&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-provider-admin%3Aall-contexts&autosave=1
Prompt key: rabbi-provider-admin
Idempotency key: 2026-06-26-agent-review-dropoff-repair:rabbi-provider-admin:all-contexts
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
  "prompt_key": "rabbi-provider-admin",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-provider-admin",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-provider-admin&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-provider-admin&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-provider-admin%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260626-004",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:rabbi-provider-admin:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.

## Work To Perform

Focus: One Time provider admin scope, provider helper links, payment/access previews, classroom setup, and no cross-workspace leakage.

## Exact Navigation

1. Open /operations/agent-review?prompt=rabbi-provider-admin first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and open the drop-off page in a second tab before auditing.
2. Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.
3. Confirm you are in BNA Operations / Super Admin, then find the workspace switcher in the side panel or top shell.
4. Select the One Time / Rabbi workspace. Expected labels may include One Time, Rabbi / One Time, One Time Mishnah Class, rabbi_sheller_provider, or one_time_mishnah_class.
5. If the workspace switcher is missing, confusing, or broken, record the failed click path, then use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview as the fallback.
6. Open Communications > Email. If visible, click Rabbi / One Time or View Rabbi / One Time Inbox and confirm the panel says Now Viewing: Rabbi / One Time Inbox or shows info@onetimeonetime.com. If the click path is not findable, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email as the fallback and record the failed visible path.
7. Open Communications > WhatsApp. Confirm the WAPI readiness, inbound CRM logging, outbound send blocking, WhatsApp contact history, and missing-credential state are scoped to OneTime. If the click path is not findable, use /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp as the fallback and record the failed visible path. Do not send a WhatsApp message.
8. Click Open Rabbi Provider Portal. Confirm the resulting page is /provider.html?admin_provider=one-time&section=mailbox or an equivalent One Time provider route.
9. In the provider/Rabbi route, inspect mailbox, contacts/CRM, class media, Communications > Email, Communications > WhatsApp, support, and dashboard areas. Rabbi view must be OneTime-branded, scoped to rabbi_sheller_provider / one_time_mishnah_class, and free of BNA Academy branding.
10. Record every card that says configured/not configured, diagnostics, setup internals, or raw status. If Rabbi cannot click it and perform a role-appropriate action, mark it as Super Admin noise that must move out of Rabbi view.
11. Click Student View, Parent/Member View, Classroom, and Library links if visible. Record whether each link opens the correct One Time route and whether the role boundary is clear.
12. Open the real live One Time user entry routes after the visible click paths have been attempted: https://join.onetimeonetime.com/provider.html?admin_provider=one-time&section=mailbox, https://join.onetimeonetime.com/parent/login, https://join.onetimeonetime.com/student/login, and https://join.onetimeonetime.com/one-time-parent. Confirm these surfaces are OneTime-only, English-only where applicable, and do not flash BNA Academy reset/login branding, Hebrew/English toggle, classroom-code fallback, recovery-code fallback, or test labels.
13. Open /provider.html?review=one-time, /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS only after the real login/provider routes and visible click paths have been attempted.
14. Repeat reachable provider and role routes at 1440px, 1024px, 768px, 430px, and 390px. Check toolbar density, button alignment, side-panel behavior, top subcategory/filter placement, helper placement, and text wrapping.
15. If any login, route, click path, helper, viewport, or drop-off step fails, immediately save BLOCKED through the Operations drop-off with exact step, expected result, observed result, partial findings, and smallest Codex-ready repair.

## Required Audit Output

- PASS/FAIL for Super Admin to Rabbi provider navigation, Communications > Email inbox distinction, Communications > WhatsApp/WAPI readiness, provider mailbox/CRM visibility, real parent login, real student login, OneTime parent password setup, Student View, Parent/Member View, Classroom, Library, and return-to-Super-Admin path.
- List every Rabbi/provider screen that shows BNA Academy branding, Hebrew/English toggle, BNA colors/copy, unrelated BNA records, raw diagnostics, setup internals, or non-actionable configured/not-configured cards.
- Produce a route matrix with desktop 1440 and mobile 390/430 notes for spacing, toolbar density, filter placement, side-panel behavior, button consistency, role label, helper placement, and first useful content.
- Recommend the smallest implementation packets for Rabbi CRM/mailbox cleanup, non-actionable card removal, view-as navigation repair, and responsive toolbar/filter alignment.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-provider-admin&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-provider-admin&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-provider-admin%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260626-004",
  "prompt_key": "rabbi-provider-admin",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-provider-admin",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-provider-admin&requirement_id=REQ-20260626-004&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-provider-admin&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-provider-admin%3Aall-contexts&autosave=1",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:rabbi-provider-admin:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
