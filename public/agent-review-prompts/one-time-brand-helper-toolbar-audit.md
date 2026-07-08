# Agent Mode Prompt - One Time Brand Helper Toolbar Audit

Generated: 2026-07-08T21:10:52.389Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260707-136
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=one-time-brand-helper-toolbar-audit
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-brand-helper-toolbar-audit&requirement_id=REQ-20260707-136&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-brand-helper-toolbar-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-brand-helper-toolbar-audit%3Aall-contexts&autosave=1
Prompt key: one-time-brand-helper-toolbar-audit
Idempotency key: 2026-06-26-agent-review-dropoff-repair:one-time-brand-helper-toolbar-audit:all-contexts
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
  "prompt_key": "one-time-brand-helper-toolbar-audit",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-brand-helper-toolbar-audit",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-brand-helper-toolbar-audit&requirement_id=REQ-20260707-136&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-brand-helper-toolbar-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-brand-helper-toolbar-audit%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260707-136",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-brand-helper-toolbar-audit:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- One Time Public Landing: role anonymous_public, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time, helper One Time public landing helper.
- BNA Operations: role super_admin, workspace bna_platform, project bna_school_platform, route /operations?view=tasks, helper Operations helper.
- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.
- One Time Parent: role parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /parent.html?review=one-time, helper One Time parent review portal.
- One Time Student: role student, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /student.html?review=one-time, helper One Time student review portal.
- One Time Member: role member_parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /rabbi-member.html?review=one-time, helper One Time member helper.
- One Time Classroom: role classroom_member, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS, helper One Time classroom helper.

## Work To Perform

Focus: One Time black/yellow brand isolation, English-only public scope, helper presence and role scoping, toolbar density, filter placement, equal buttons, mobile fit, and autonomous Operations drop-off reporting.

## Exact Navigation

1. Open /operations/agent-review?prompt=one-time-brand-helper-toolbar-audit first. Confirm this prompt key is visible in the Agent Review Hub and keep the drop-off page available in another tab.
2. Open /one-time. Confirm the page is OneTimeOneTime / One Time Mishnah Class, black/yellow scoped, English-only, and does not flash BNA cream/navy/teal, BNA Academy copy, or a Hebrew/English toggle.
3. At /one-time, audit 1440px, 1024px, 768px, 430px, and 390px. Check first-viewport density, top section wasted space, button equal heights, text wrapping, helper launcher placement, and horizontal overflow.
4. Open the One Time Helper on /one-time. Ask three public-safe questions: class schedule, parent trial link, and library access. Verify answers stay in one_time_mishnah_class scope and do not mention BNA school accountability unless explicitly framed as unrelated.
5. Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, or repeat credentials.
6. From Operations, use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the click path is not findable, record the failed click path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview.
7. In the One Time Operations workspace, inspect the side panel, active workspace label, top subcategories, filters/search, primary action buttons, helper/drawer position, and any cards that say configured/not configured. If Rabbi cannot act on a card, mark it as role-contaminating admin noise.
8. In Operations, open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Record whether the screen loops, switches to a broken display, or fails to show a clean Rabbi / One Time inbox distinction.
9. In Operations, open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Record whether WAPI readiness, WhatsApp contact history, and send controls are scoped to OneTime and clearly blocked when credentials are missing.
10. Open /provider.html?review=one-time and /provider.html?admin_provider=one-time&section=mailbox if available. Confirm Rabbi/provider sees clear action buttons such as send message/email previews only where safe, and no random Super Admin diagnostics.
11. Open /parent.html?review=one-time, /student.html?review=one-time, /rabbi-member.html?review=one-time, and /one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS.
12. For every role route, audit 1440px, 1024px, 768px, 430px, and 390px. Compare category/subcategory/filter placement, toolbar density, button height, helper scope, role label, and mobile menu behavior against the Operations pattern.
13. Open https://join.onetimeonetime.com/parent/login and https://join.onetimeonetime.com/student/login. Confirm login/reset surfaces are OneTime-only and do not flash BNA Academy branding or Hebrew/English toggle.
14. If any route, click path, login, helper, or drop-off step fails, do not stop in frustration. Save a BLOCKED or FAIL report through Operations drop-off with the exact route attempted, what failed, screenshots/DOM notes if available, and the smallest Codex-ready repair suggestion.

## Required Audit Output

- Produce a route matrix for /one-time, live One Time login/reset surfaces, One Time Operations, Communications > Email, Communications > WhatsApp, provider/Rabbi, parent, student, member, and classroom.
- For each route include 1440px, 1024px, 768px, 430px, and 390px verdicts for spacing, topbar density, button alignment, filter placement, helper placement, role label, and overflow.
- Flag brand bleed specifically: BNA colors/copy, Hebrew/English toggle, BNA Academy language, or non-One-Time helper language on One Time surfaces.
- Flag role bleed specifically: Super Admin diagnostics in Rabbi/parent/student/member views, parent billing in student views, raw setup data in user views, or unrelated BNA records anywhere in One Time.
- Report Communications loops or bad-display switches with exact click path and route/query string.
- Report WhatsApp/WAPI readiness: whether inbound CRM logging, outbound send blocking, auto-reply readiness, and missing credentials are understandable without enabling a live send.
- Rank fixes by P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.
- End only with OPERATIONS_DROPOFF_SAVED after a saved AGR readback, or OPERATIONS_DROPOFF_FAILED with the full redacted payload if every save path fails.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-brand-helper-toolbar-audit&requirement_id=REQ-20260707-136&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-brand-helper-toolbar-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-brand-helper-toolbar-audit%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260707-136",
  "prompt_key": "one-time-brand-helper-toolbar-audit",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-brand-helper-toolbar-audit",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-brand-helper-toolbar-audit&requirement_id=REQ-20260707-136&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-brand-helper-toolbar-audit&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-brand-helper-toolbar-audit%3Aall-contexts&autosave=1",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-brand-helper-toolbar-audit:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
