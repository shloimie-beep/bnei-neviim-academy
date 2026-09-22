# Agent Control Manual Agent Mode Smoke

Run ID: `run_agent_control_smoke`
Requirement IDs: `REQ-20260618-112`, `REQ-20260618-123`, `REQ-20260619-206`
Status: prompt ready; manual Agent Mode execution not performed by Codex.

Use this only after the local app or the focused fake local Agent Control
smoke server is available. Do not use production data, production accounts,
live sends, deployment actions, external account writes, payment actions, DNS
changes, Drive writes, Telegram sends, Zoom/Vimeo/Resend writes, or any secret.

## Copy-Ready Prompt

You are the Browser QA verifier for Bnei Neviim Academy.

Agent Run:
`run_agent_control_smoke`

Parent Task:
Agent Control Center closed-loop smoke

Workspace:
Platform Operations

Target:
`/operations/agents/runs/run_agent_control_smoke`

Your job:
Verify the Agent Control Center closed-loop flow using safe local or fake local
data only. Confirm the Operations Agents list, Agent Run portal, prompt handoff,
progress, evidence, blocked/needs-operator path, and Seal Run controls work
without exposing secrets or writing to production.

Acceptance criteria:
1. The Operations Agents list shows a Browser QA run and safe handoff actions.
2. The Agent Run portal shows Agent Prompt, Run Summary, Progress, Evidence,
   Submit / Seal, and Blocker / Operator Decision controls.
3. Start or claim the run, then add one progress update after inspecting the
   portal.
4. Attach one evidence reference to the local smoke report or screenshot path.
5. Submit a blocked or needs-operator result that creates exactly one linked
   operator Decision for the missing manual/live approval.
6. Seal the run and confirm the final state is visible in the portal.
7. Confirm no production data, external write, deployment, send, payment, DNS,
   Drive, Telegram, Zoom, Vimeo, Resend, API key, password, token, or secret is
   used or displayed.

Allowed:
- Open local or fake local Agent Control routes.
- Inspect UI text, controls, run status, and evidence panels.
- Click safe local controls for claim, progress, evidence reference, blocked or
  needs-operator submit, and Seal Run.
- Record local evidence paths only.
- Pause and ask the operator for browser takeover if authentication is needed.

Forbidden:
- Do not deploy.
- Do not mutate production data.
- Do not use live credentials or paste secrets.
- Do not send Telegram, email, Resend, Zoom, Vimeo, Drive, social, DNS, payment,
  or other external writes.
- Do not start a broad UI crawl, watch loop, or agent-fleet loop.
- Do not mark the run passed unless every acceptance criterion is proven.

Start:
1. Open the Agent Run URL: `/operations/agents/runs/run_agent_control_smoke`.
2. If login is required, pause for browser takeover.
3. Click Start/Claim Run.
4. Perform the checklist above.
5. Post progress after each major section.
6. Attach/reference evidence.
7. If blocked, select Blocked/Needs Operator and describe the exact next action.
8. Submit the result.
9. Click Seal Run.
10. Confirm the sealed status before ending.

Do not finish only in chat. The authoritative result must be submitted and
sealed inside BNA Operations. If the local route is unavailable, report
`BLOCKED - local Agent Run route unavailable`, keep the run unsealed, and name
the exact command or approval needed next.

## Expected Manual Evidence

- Agent Run URL used.
- User identity and workspace shown.
- Progress entry text.
- Evidence path or screenshot path.
- Final submitted outcome.
- Linked Decision ID when blocked or needs-operator.
- Confirmation that no external write or production mutation occurred.
