# Agent Mode Prompt - Rabbi Scheller Provider Admin

Generated: 2026-06-25T16:00:57.232Z
Source issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24
Raw/source ID: RAW-20260625-024
Parent goal: PARENT-20260625-024
Primary requirement: REQ-20260625-027

## Start

Open the Agent Review Hub: https://bneineviimacademy.org/operations/agent-review

Use takeover mode if an Operations login is required. Do not ask for or store passwords, cookies, API keys, refresh tokens, screenshots with private data, or reusable access secrets. External services such as Google, Railway, Stripe, Vimeo, DNS, Buffer, WhatsApp, and email remain separate logins and are out of scope unless the hub says otherwise.

## Review Contexts

- Rabbi Provider Admin: role workspace_owner, workspace rabbi_sheller_provider, project one_time_mishnah_class, route /provider.html?review=one-time, helper provider/Rabbi workspace helper.

## Work To Perform

Focus: One Time provider admin scope, provider helper links, payment/access previews, classroom setup, and no cross-workspace leakage.

1. Open each listed review context from the hub.
2. Confirm the visible "Reviewing as" banner, role, workspace/project, expiry, and Exit control.
3. Converse naturally with the scoped helper using paraphrases, typos, follow-ups, and corrections.
4. Follow every internal link returned by the helper and verify route, section/tab, role, workspace, project, expected landmark, authorization result, and safe fallback.
5. Test safe preview actions only. Do not send, publish, charge, deploy, change DNS, rotate credentials, move Drive files, retry production workers, or mutate student data.
6. For any claimed write, verify the typed action/audit/result record. If no record exists, mark the claim failed.
7. Include the newest Drive recording trace status from the hub; do not claim the recording processed beyond the trace evidence.
8. Submit the structured result through the hub control or typed result API.

## Result Shape

Submit to: https://bneineviimacademy.org/api/bna/agent-review/results

```json
{
  "raw_id": "RAW-20260625-024",
  "parent_goal_id": "PARENT-20260625-024",
  "requirement_id": "REQ-20260625-027",
  "prompt_key": "rabbi-provider-admin",
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
  "suggested_correction": "exact repair or none",
  "idempotency_key": "rabbi-provider-admin:<agent-run-id-or-timestamp>"
}
```

End with PASS, FAIL, or BLOCKED and the exact remaining issue.
