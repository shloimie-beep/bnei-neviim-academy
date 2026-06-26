# RAW-20260626-002 - Agent Mode Task/Decision Drop-Off Clarification

Captured: 2026-06-26

Source channel: codex_chat

Linked parent run: ops/execution-runs/2026-06-26-agent-review-dropoff-repair

Linked issue: https://github.com/shloimie-beep/bnei-neviim-academy/issues/24

Raw operator clarification:

> Add this clarification to the current drop-off / Agent Review workflow.
>
> The target workflow is not only a general Agent Review Hub. It is also this:
>
> Every visible Task or Decision that requires Shloimie/operator action should be convertible into a hybrid Agent Mode task.
>
> For each Task/Decision that needs owner action, external account review, setup, UI audit, or human browser verification, the expanded task card must include:
>
> 1. Agent Mode prompt
>    - Copy prompt button
>    - Prompt key
>    - Requirement/task/decision ID
>    - Role/workspace/context
>    - Exact starting URL
>    - Exact return/drop-off URL
>    - Idempotency key
>    - Allowed actions
>    - Prohibited actions
>    - Expected result
>    - Save instructions
>
> 2. Agent status
>    - not_started
>    - prompt_copied
>    - agent_running_or_pending
>    - result_saved
>    - blocked
>    - failed
>    - repair_created
>    - rerun_required
>    - completed
>
> 3. Drop-off
>    - Large report box
>    - PASS / FAIL / BLOCKED selector
>    - Last completed route
>    - Last completed role/context
>    - Blocker field
>    - Suggested correction field
>    - Save button
>    - Visible AGR result ID
>    - View saved result link
>
> 4. Automatic behavior
>    - Clicking Copy prompt records `prompt_copied_at`.
>    - If no result is saved after a timeout, status becomes `agent_result_overdue`.
>    - Saving PASS links the result to the task/decision and marks it review-complete where allowed.
>    - Saving FAIL or BLOCKED creates or links a repair requirement.
>    - Saving FAIL or BLOCKED regenerates a rerun prompt for the same task.
>    - The result must be visible from the original task card.
>    - The result must also be readable by future GitHub-connected ChatGPT/Codex sessions.
>
> 5. Owner clarity
>    - The task card should say whether:
>      - Codex can do it alone;
>      - Agent Mode can help Shloimie do it;
>      - Shloimie must personally decide something;
>      - an external account owner is required;
>      - a dangerous/live action is blocked.
>    - Do not mix internal handoff/evidence rows into the owner’s visible Tasks.
>
> This should extend the existing Issue #7 / ramble-to-execution system, not create a second queue, task manager, memory layer, or agent loop.
>
> Update the current implementation so every new Decision/operator task can carry this Agent Mode prompt/drop-off workflow, not only the general Agent Review Hub.
>
> Acceptance:
> - A sample Decision card shows an Agent Mode prompt and drop-off flow.
> - A sample owner task shows an Agent Mode prompt and drop-off flow.
> - Copying the prompt changes the status to prompt_copied.
> - Saving a PASS result attaches AGR evidence to the task.
> - Saving a BLOCKED result creates a repair/rerun prompt.
> - The owner can see the result without checking GitHub.
> - A future ChatGPT session can read the saved result through GitHub/repo evidence or Operations readback.
> - Tests cover idempotency, timeout, blocked rerun, saved result, and no duplicate task creation.

Parse status: registered

Created requirement IDs:

- REQ-20260626-008
