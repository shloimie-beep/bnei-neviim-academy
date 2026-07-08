# Agent Mode Prompt - Rabbi Telegram Helper Ticket Smoke

Generated: 2026-07-08T21:10:52.389Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260708-084
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-telegram-helper-ticket-smoke&requirement_id=REQ-20260708-084&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-telegram-helper-ticket-smoke&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-telegram-helper-ticket-smoke%3Aall-contexts&autosave=1
Prompt key: rabbi-telegram-helper-ticket-smoke
Idempotency key: 2026-06-26-agent-review-dropoff-repair:rabbi-telegram-helper-ticket-smoke:all-contexts
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
  "prompt_key": "rabbi-telegram-helper-ticket-smoke",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-telegram-helper-ticket-smoke&requirement_id=REQ-20260708-084&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-telegram-helper-ticket-smoke&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-telegram-helper-ticket-smoke%3Aall-contexts&autosave=1",
  "requirement_id": "REQ-20260708-084",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:rabbi-telegram-helper-ticket-smoke:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- BNA Operations: role super_admin, workspace bna_platform, project bna_school_platform, route /operations?view=tasks, helper Operations helper.
- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?admin_provider=one-time&section=mailbox, helper provider/Rabbi workspace helper.
- One Time Parent: role parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /parent.html?review=one-time, helper One Time parent review portal.
- One Time Student: role student, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /student.html?review=one-time, helper One Time student review portal.

## Work To Perform

Focus: Rabbi Telegram readiness, all OneTime contact/message scope, super-admin support ticket ding routing, Rabbi helper scope, scoped Drive/web sidekick behavior, progress dings, and autonomous drop-off behavior without live sends.

## Exact Navigation

1. Open /operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke first. Confirm this prompt key is visible, click Start Audit / I started this agent mode, and open the drop-off page in a second tab before auditing.
2. Open /operations. If login is required, use browser takeover so the owner types credentials directly. Do not ask for, store, screenshot, or repeat credentials.
3. Confirm you are in BNA Operations / Super Admin. Use the workspace switcher to select One Time / Rabbi / One Time Mishnah Class. If the visible switcher is missing or confusing, record the failed path and then open /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets.
4. Open Admin > Tickets or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=admin&section=tickets. Confirm tickets are visible to Super Admin and the review owner is Shloimie/super-admin, not Rabbi as first responder.
5. Create no real ticket unless the page explicitly exposes a safe review/test mode. If a safe test button exists, create a synthetic support ticket titled Agent Mode Rabbi ticket smoke using an @example.invalid identity, then verify it appears in Tickets and records a super-admin Telegram notification/readiness state. If no safe test mode exists, do not submit; inspect the UI and report BLOCKED with the missing safe-smoke action.
6. Open Communications > Email or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=email. Confirm Rabbi/OneTime email is visibly separated from Shloimie/BNA email and no unrelated BNA inbox is shown as the active Rabbi inbox.
7. Open Communications > WhatsApp or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=whatsapp. Confirm WAPI/Rabbi communications are scoped to OneTime and outbound sends remain blocked unless explicitly approved. Do not send a WhatsApp message.
8. Open CRM Contacts or /operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=communications&section=crm_contacts, then /provider.html?admin_provider=one-time&section=crm if available. Confirm the Rabbi sidekick sees only OneTime contacts and redacted contact summaries, not BNA/global contact exports.
9. Find any Telegram/runtime/readiness panel or helper answer that describes Rabbi Telegram. Confirm it reports the Rabbi profile, OneTime scope, token/config presence, missing/present TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER, and no live send unless the chat ID is configured. If the chat ID is missing, mark live Rabbi Telegram delivery BLOCKED, not FAIL.
10. Open /provider.html?admin_provider=one-time&section=mailbox or click Open Rabbi Provider Portal. Confirm Rabbi provider view shows communications/actions that Rabbi can actually use, and does not show random Super Admin configured/not-configured diagnostics without an action.
11. Open the provider helper if visible. Ask: What messages need my attention? Show my OneTime contacts. How do I see student questions? Which support tickets need staff review? What is the Telegram bot status? Where should I upload tonight's class recording or source sheet? Can you research a Mishnah class marketing question? The helper should answer in OneTime/Rabbi scope only, separate staff-owned support tickets from Rabbi communications, use scoped Drive/web context as preview/read-only context, and should not claim it sent Telegram, email, WhatsApp, moved Drive files, uploaded media, changed permissions, or mutated external providers.
12. If a safe Telegram bot simulator, no-send runtime smoke, or readiness readback exists, run it. If the only way to test is a live Telegram send or external Telegram login, do not run it; save BLOCKED with the exact missing safe smoke path and the chat-ID/runtime blocker.
13. Open /parent.html?review=one-time and /student.html?review=one-time. Find the support/help flow. Do not submit a live support ticket unless a safe review/test mode is explicit. Verify the route makes clear that support tickets go to staff/super-admin review, while Rabbi class communications stay Rabbi-scoped.
14. Verify brief Codex/agent progress updates are represented by a no-secret Telegram progress path: concise Done, Verified, Blocked, Next, Packet, and Task fields. Do not send a progress update from Agent Mode unless the hub explicitly exposes a safe no-send test.
15. Open /operations/agent-review/dropoff with this prompt key if the tab is not already open. Save PASS, FAIL, or BLOCKED with exact routes, click path, screenshots/DOM notes if available, Telegram/readiness state, and smallest Codex-ready repair suggestions.
16. If any route, login, helper, ticket flow, Telegram readiness check, or drop-off save fails, do not stop in chat. Save BLOCKED through the drop-off. If UI drop-off fails, POST to /api/bna/agent-review/results. Only end with OPERATIONS_DROPOFF_SAVED: AGR-... or OPERATIONS_DROPOFF_FAILED: ... with the full redacted payload.

## Required Audit Output

- PASS/FAIL for Super Admin ticket visibility, ticket owner/routing to Shloimie, safe synthetic ticket path, Telegram ticket ding readiness, and no raw private ticket body in notification previews.
- PASS/FAIL for Rabbi Telegram readiness: Rabbi profile, Rabbi token present, TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER present/missing, OneTime ops credentials present/missing, runtime/startup status, and exact blocker.
- PASS/FAIL for REQ-20260708-101 all-contact/all-message scope: OneTime contacts, parent messages, student messages, provider/Rabbi messages, email, WhatsApp/WAPI, internal reminders, and staff-owned tickets are separated correctly.
- PASS/FAIL for Rabbi communications scope across OneTime contacts, Email, WhatsApp/WAPI, provider mailbox, provider helper, parent support, student support, student/class messages, internal reminders, and staff-owned support tickets.
- PASS/FAIL for REQ-20260708-100 scoped sidekick behavior: contacts/communications/content/task context, safe web research, scoped OneTime Drive map/context previews, no broad BNA Drive listing, and no claim of external mutation.
- PASS/FAIL for brief progress-ding format: Done, Verified, Blocked, Next, Packet, and Task; no secrets, chat IDs, raw private message bodies, setup links, access codes, or full contact exports.
- List every place where Rabbi/helper views expose BNA data, unrelated inboxes, raw diagnostics, setup internals, tokens, chat IDs, or non-actionable configured/not-configured cards.
- Recommend Codex-ready repairs for missing safe-smoke buttons, missing Telegram readiness display, missing Rabbi scoped Drive/context answer, missing super-admin ticket ding state, wrong ticket owner routing, missing progress-ding state, or drop-off failures.
- Confirm no live Telegram, email, WhatsApp, WAPI, Drive, payment, access grant, Zoom, Vimeo, web account, or credential mutation was performed by Agent Mode.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-telegram-helper-ticket-smoke&requirement_id=REQ-20260708-084&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-telegram-helper-ticket-smoke&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-telegram-helper-ticket-smoke%3Aall-contexts&autosave=1
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260708-084",
  "prompt_key": "rabbi-telegram-helper-ticket-smoke",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=rabbi-telegram-helper-ticket-smoke",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=rabbi-telegram-helper-ticket-smoke&requirement_id=REQ-20260708-084&return_url=%2Foperations%2Fagent-review%3Fprompt%3Drabbi-telegram-helper-ticket-smoke&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Arabbi-telegram-helper-ticket-smoke%3Aall-contexts&autosave=1",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:rabbi-telegram-helper-ticket-smoke:all-contexts"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
