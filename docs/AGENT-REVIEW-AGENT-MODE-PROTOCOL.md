# Agent Review Agent Mode Protocol

This is the reusable protocol for BNA Agent Mode review prompts. It exists so
new Agent Review prompts duplicate the same reliable workflow instead of
treating drop-off as a final reminder.

## Source Of Truth

- Protocol doc: `docs/AGENT-REVIEW-AGENT-MODE-PROTOCOL.md`
- Prompt generator: `src/lib/bna/agent-review-hub.js`
- Generator function: `renderAgentModePrompt`
- Hub copy preamble: `public/agent-review.html`
- Drop-off page: `public/agent-review-dropoff.html`
- Generated prompt pack: `public/agent-review-prompts/*.md`
- Prompt generation command: `npm run agent-review:prompts`
- Regression test: `tests/agent-review-hub.test.js`

Do not hand-write one-off Agent Mode prompts that bypass this generator when an
Agent Review prompt can be represented by `AGENT_MODE_PROMPTS`.

## Required Workflow

Every Agent Mode review prompt must require this sequence:

1. Open the Agent Review Hub.
2. Confirm the prompt key.
3. Click `Start Audit` / `I started this agent mode`.
4. Click `Copy Agent Prompt`.
5. Open the review context.
6. Keep or open the exact drop-off URL.
7. Run the audit.
8. Save `PASS`, `FAIL`, or `BLOCKED` through Agent Review drop-off.
9. Verify the AGR readback.
10. Only then answer in chat.

The final answer must start with one of:

- `OPERATIONS_DROPOFF_SAVED: AGR-... <readback URL>`
- `OPERATIONS_DROPOFF_FAILED: <exact UI/API error>`

`OPERATIONS_DROPOFF_FAILED` is allowed only after the normal drop-off form,
exact drop-off URL, emergency paste save, and API fallback have all failed.

## Required Prompt Clauses

Every generated Agent Mode prompt must include:

- `Click Start Audit / I started this agent mode`
- `Do not treat a partial audit as pass`
- `If blocked midway, save BLOCKED immediately`
- exact `dropoff_url`
- `autosave=1`
- `Emergency paste JSON and save`
- `POST to /api/bna/agent-review/results`
- `readback API shows the AGR result`
- `OPERATIONS_DROPOFF_SAVED: AGR-...`
- `OPERATIONS_DROPOFF_FAILED:`
- no owner/manual-upload handoff wording

Forbidden prompt language includes:

- `download this report`
- `upload it yourself`
- `I compiled the JSON`
- `here is the file`
- `manual upload required`

## BLOCKED Save Contract

A partial `BLOCKED` save is valid and preferred over a chat-only summary when
the agent cannot complete every route or viewport. The drop-off report must
support these fields:

- `blocked_route_or_step`
- `attempted_action`
- `observed_failure`
- `partial_routes_visited`
- `partial_helper_responses`
- `suggested_correction`
- `evidence_notes`
- `idempotency_key`

The prompt must tell Agent Mode to save `BLOCKED` before ending in chat if any
route, login, helper, browser, viewport, action, or save step blocks progress.

## Reuse Checklist

When adding a new Agent Review prompt:

1. Add the prompt definition to `AGENT_MODE_PROMPTS`.
2. Include exact routes and review contexts.
3. Run `npm run agent-review:prompts`.
4. Run `node --test tests/agent-review-hub.test.js`.
5. Confirm the generated prompt contains the required clauses above.
6. Do not mark the prompt ready if it asks the owner to manually upload a
   payload or treats a partial audit as a pass.
