# Agent Mode Prompt - Public/Login/Setup Surfaces

Generated: 2026-06-26T06:29:53.296Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260626-001
Parent goal: PARENT-20260626-001
Primary requirement: REQ-20260626-005
Agent review run ID: 2026-06-26-agent-review-dropoff-repair
Return URL: https://bneineviimacademy.org/operations/agent-review?prompt=public-login-setup
Drop-off URL: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=public-login-setup&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dpublic-login-setup&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Apublic-login-setup%3Aall-contexts
Prompt key: public-login-setup
Idempotency key: 2026-06-26-agent-review-dropoff-repair:public-login-setup:all-contexts

## Copy Metadata

```json
{
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "prompt_key": "public-login-setup",
  "context_key": null,
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=public-login-setup",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=public-login-setup&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dpublic-login-setup&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Apublic-login-setup%3Aall-contexts",
  "requirement_id": "REQ-20260626-005",
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:public-login-setup:all-contexts"
}
```

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- Public Visitor: role anonymous_public, workspace public, project bna_public, route /, helper public website helper.
- Wrong Role/Error States: role negative_authorization_probe, workspace mixed, project mixed, route /operations/agent-review?negative=1, helper all helpers, negative cases.

## Work To Perform

Focus: public pages, login paths, setup links, public helper safety, and logged-out behavior.

1. Open each listed review context from the hub.
2. Confirm the visible "Reviewing as" banner, role, workspace/project, expiry, and Exit control.
3. Converse naturally with the scoped helper using paraphrases, typos, follow-ups, and corrections.
4. Follow every internal link returned by the helper and verify route, section/tab, role, workspace, project, expected landmark, authorization result, and safe fallback.
5. Test safe preview actions only. Do not send, publish, charge, deploy, change DNS, rotate credentials, move Drive files, retry production workers, or mutate student data.
6. For any claimed write, verify the typed action/audit/result record. If no record exists, mark the claim failed.
7. Include the newest Drive recording trace status from the hub; do not claim the recording processed beyond the trace evidence.
8. Submit the structured result through the drop-off URL. If Agent Mode cannot save, return the full redacted report in chat so the owner can paste it later under the same prompt key.
9. If a scoped context redirects to public/sign-in content and cannot open after owner takeover login, stop that context, save BLOCKED in the drop-off form, and do not audit the public helper as the scoped helper.

## Result Shape

Preferred drop-off: https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=public-login-setup&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dpublic-login-setup&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Apublic-login-setup%3Aall-contexts
API fallback: https://bneineviimacademy.org/api/bna/agent-review/results

```json
{
  "raw_id": "RAW-20260626-001",
  "parent_goal_id": "PARENT-20260626-001",
  "agent_review_run_id": "2026-06-26-agent-review-dropoff-repair",
  "requirement_id": "REQ-20260626-005",
  "prompt_key": "public-login-setup",
  "return_url": "https://bneineviimacademy.org/operations/agent-review?prompt=public-login-setup",
  "dropoff_url": "https://bneineviimacademy.org/operations/agent-review/dropoff?agent_review_run_id=2026-06-26-agent-review-dropoff-repair&prompt_key=public-login-setup&requirement_id=REQ-20260626-005&return_url=%2Foperations%2Fagent-review%3Fprompt%3Dpublic-login-setup&idempotency_key=2026-06-26-agent-review-dropoff-repair%3Apublic-login-setup%3Aall-contexts",
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
  "idempotency_key": "2026-06-26-agent-review-dropoff-repair:public-login-setup:all-contexts:<attempt-id>"
}
```

End with PASS, FAIL, or BLOCKED and the exact remaining issue.
