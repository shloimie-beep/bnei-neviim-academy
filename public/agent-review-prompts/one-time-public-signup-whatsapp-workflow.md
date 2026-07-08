# Agent Mode Prompt - One Time Public Signup And WhatsApp Workflow

Generated: 2026-07-08T19:09:16.471Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260708-071
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-public-signup-whatsapp-workflow&requirement_id=REQ-20260708-071&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-public-signup-whatsapp-workflow&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-public-signup-whatsapp-workflow%3Aall-contexts&autosave=1
Prompt key: one-time-public-signup-whatsapp-workflow
Idempotency key: 2026-06-26-agent-review-dropoff-repair:one-time-public-signup-whatsapp-workflow:all-contexts
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
  "prompt_key": "one-time-public-signup-whatsapp-workflow",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-public-signup-whatsapp-workflow&requirement_id=REQ-20260708-071&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-public-signup-whatsapp-workflow&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-public-signup-whatsapp-workflow%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260708-071",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-public-signup-whatsapp-workflow:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- One Time Public Landing: role anonymous_public, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /one-time, helper One Time public landing helper.
- BNA Operations: role super_admin, workspace bna_platform, project bna_school_platform, route /operations?view=tasks, helper Operations helper.
- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.

## Work To Perform

Focus: public OneTime email-only signup strip, black/yellow landing header, Rabbi Scheller helper/WhatsApp readiness, first-party CRM capture, and Agent Review copied prompt/drop-off state.

## Exact Navigation

1. Open /operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow first. Confirm this prompt key is visible. Click Start Audit if it is not already started, then click Copy Agent Prompt. Confirm the card moves from Ready To Copy into Running / Drop-off Needed or shows prompt copied / awaiting drop-off. Keep the drop-off page open in a second tab before auditing.
2. Open the public OneTime host https://join.onetimeonetime.com/ and the fallback path https://join.onetimeonetime.com/one-time. Confirm the page is OneTimeOneTime Mishnah / Rabbi Scheller scoped and does not show BNA Academy, Hebrew/English toggle, BNA cream/navy/teal, provider-preview copy, test labels, or raw Operations data.
3. At 1440px, inspect the first viewport. The top toolbar should be black, bounded by a yellow outline/border, and should not have a separate yellow announcement bar above it. The logo should sit on a white tile and render as dark/black artwork.
4. At the bottom of the hero, before the next section, find the yellow Sign Up Now signup strip. It should have one visible email input only, one visible Sign Up Now button, concise parent-facing copy, and no visible Parent name, Phone / WhatsApp, Region, Notes, checkbox, checkout, access code, classroom code, or recovery-code field.
5. Click each visible Sign Up Now CTA from the header and hero. Confirm each lands on the same #start-free yellow email strip without layout jump, overlap, or horizontal overflow.
6. Submit testing rule: do not use a real parent email and do not trigger any external send. If you are on a local/dev route or the hub explicitly indicates a safe smoke route, submit a synthetic email such as agent-mode+timestamp@example.invalid and record the response flags. If you are on live production and cannot confirm synthetic first-party lead testing is allowed, do not submit; instead verify DOM, payload fields, and endpoint target. In all cases, report whether the form posts only to /api/one-time/interest and never to checkout, email, WhatsApp, Stripe, Zoom, Vimeo, Drive, or GHL.
7. Open the Rabbi Scheller Assistant bubble on the public page. Ask: "How do I sign up?", "What is the class schedule?", and "Can I message Rabbi Scheller on WhatsApp?" Verify the helper stays scoped to one_time_mishnah_class, names Rabbi Scheller Assistant or Rabbi Scheller digital assistant, and does not claim a WhatsApp was sent unless live WAPI send gates are configured and explicitly approved.
8. Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, repeat, or screenshot credentials. Navigate visibly to One Time / Rabbi / One Time Mishnah Class using the workspace switcher before using route fallbacks.
9. In Operations, open Communications > WhatsApp or fallback to /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI readiness, inbound CRM logging, outbound send blocking, missing-credential state, class-link configuration state, and WhatsApp contact history are scoped to OneTime. Do not send a WhatsApp message.
10. In Operations, open Communications > Email or fallback to /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Confirm the Rabbi / One Time inbox distinction is clear and the screen does not loop into a broken display.
11. Repeat the public landing checks at 1024px, 768px, 430px, and 390px. For each viewport, inspect header density, nav overflow, yellow signup strip placement, email input/button alignment, helper bubble placement, and first useful content. Record whether text or buttons overlap.
12. Return to the drop-off tab and save PASS, FAIL, or BLOCKED. If anything fails mid-audit, save BLOCKED immediately with exact route, viewport, clicked element, observed failure, partial findings, and smallest Codex-ready repair suggestion. Do not end in chat unless every drop-off and API save path fails.

## Required Audit Output

- PASS/FAIL for the public header: black toolbar, yellow outline, logo dark on white, no top yellow announcement, no BNA Academy/brand bleed.
- PASS/FAIL for the signup strip: yellow bar at hero bottom before next section, one visible email input only, Sign Up Now CTA, no visible phone/name/region/notes/checkbox/recovery/classroom-code fields, and no checkout/access grant.
- Report form behavior: endpoint, payload fields observed, whether a synthetic submit was performed, response flags if submitted, and confirmation that no external send/charge/access/WhatsApp occurred.
- PASS/FAIL for Rabbi Scheller Assistant public helper scope, WhatsApp answer safety, and no BNA helper language.
- PASS/FAIL for Operations Communications > WhatsApp readiness and Communications > Email inbox distinction. Include exact click path or fallback route used.
- Viewport matrix for 1440px, 1024px, 768px, 430px, and 390px covering spacing, button alignment, topbar density, hero/signup strip placement, helper placement, and horizontal overflow.
- Agent Review workflow proof: prompt key, copied/start AGR result ref, idempotency key, whether the card moved to Running / Drop-off Needed, and final AGR readback result.
- Rank fixes by P0-SCOPE, P1-IA, P1-DEADEND, P2-TOOLBAR, P2-RESPONSIVE, P2-RELEVANCE, P2-TYPOGRAPHY, or P3-POLISH.
- End only with OPERATIONS_DROPOFF_SAVED after saved AGR readback, or OPERATIONS_DROPOFF_FAILED with the full redacted payload if every save path fails.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-public-signup-whatsapp-workflow&requirement_id=REQ-20260708-071&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-public-signup-whatsapp-workflow&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-public-signup-whatsapp-workflow%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260708-071",
  "prompt_key": "one-time-public-signup-whatsapp-workflow",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-public-signup-whatsapp-workflow",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-public-signup-whatsapp-workflow&requirement_id=REQ-20260708-071&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-public-signup-whatsapp-workflow&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-public-signup-whatsapp-workflow%3Aall-contexts&autosave=1",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-public-signup-whatsapp-workflow:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
