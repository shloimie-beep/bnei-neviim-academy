# Agent Mode Prompt - One Time Student Login And Parent Reset Journey

Generated: 2026-07-07T15:06:26.071Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260707-114
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=one-time-student-login-reset-journey
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-student-login-reset-journey&requirement_id=REQ-20260707-114&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-student-login-reset-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-student-login-reset-journey%3Aall-contexts
Prompt key: one-time-student-login-reset-journey
Idempotency key: 2026-06-26-agent-review-dropoff-repair:one-time-student-login-reset-journey:all-contexts

## Copy Metadata

```json
{
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "prompt_key": "one-time-student-login-reset-journey",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-student-login-reset-journey",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-student-login-reset-journey&requirement_id=REQ-20260707-114&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-student-login-reset-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-student-login-reset-journey%3Aall-contexts",
  "requirement_id": "REQ-20260707-114",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-student-login-reset-journey:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- One Time Parent: role parent, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /parent.html?review=one-time, helper One Time parent review portal.
- One Time Student: role student, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /student.html?review=one-time, helper One Time student review portal.

## Work To Perform

Focus: student login experience, parent-managed student username/password reset expectations, access-code fallback, student-safe class/library state, and no parent billing/private-note leakage.

## Exact Navigation

1. Open /student.html?review=one-time directly. Confirm this is a no-password TEST student route, not a real student account.
2. Audit the first viewport at 1440px, then repeat the same route at 1024px, 768px, 430px, and 390px.
3. Inspect the topbar/header spacing, sidebar or hamburger behavior, side categories, top subcategories, filters, button alignment, and text wrapping.
4. Confirm the student sees only student-safe class, library, worksheet/resource, attendance, progress, question/support, and achievement/reward information.
5. Confirm the student does not see parent billing, adult/private notes, Super Admin controls, provider-admin setup, raw debug data, or unrelated BNA school accountability records.
6. Click the visible Parent link from the student route and confirm it opens /parent.html?review=one-time or an equivalent TEST parent route.
7. In the parent route, look for whether the parent can understand how student login setup/reset should work. If review mode hides the real reset form, say whether a visible preview card is needed.
8. Open /student/login and audit the real logged-out student login shell at 1440px and 390px: username/password fields, access-code fallback, error/help copy, and mobile spacing.
9. Open /parent/login and audit whether the parent setup/reset model is clearly different from student login.

## Required Audit Output

- State whether parent and student login roles are visually and conceptually distinct.
- PASS/FAIL for student-safe data, parent-managed reset expectation, access-code fallback, class link, library/resources, question/support, and mobile spacing.
- List every place where the student view feels cramped, uneven, overstuffed, or contaminated by parent/admin/provider information.
- Recommend the minimum secure product change needed before a real parent can reset a real student login.

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

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-student-login-reset-journey&requirement_id=REQ-20260707-114&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-student-login-reset-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-student-login-reset-journey%3Aall-contexts
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results
Emergency fallback: open the drop-off page and use "Emergency paste JSON and save" only after the normal save path and exact drop-off URL fail.

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260707-114",
  "prompt_key": "one-time-student-login-reset-journey",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=one-time-student-login-reset-journey",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=one-time-student-login-reset-journey&requirement_id=REQ-20260707-114&return_url=%2Foperations%2Fagent-review%3Fprompt%3Done-time-student-login-reset-journey&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Aone-time-student-login-reset-journey%3Aall-contexts",
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
  "severity": "none|low|medium|high|critical",
  "blocker": "required when status is blocked",
  "suggested_correction": "exact repair or none",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:one-time-student-login-reset-journey:all-contexts:<attempt-id>"
}
```

End with OPERATIONS_DROPOFF_SAVED: AGR-... and the readback URL after a successful save. End with OPERATIONS_DROPOFF_FAILED: <exact UI/API error> and the redacted JSON payload only if all save paths failed.
