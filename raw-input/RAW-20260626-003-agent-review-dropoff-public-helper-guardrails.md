# RAW-20260626-003 - Agent Review Drop-Off And Public Helper Guardrails

- Source channel: `codex_chat`
- Captured at: 2026-06-26
- Parse status: `registered`
- Requirement register:
  `tasks-pending/2026-06-26-agent-review-dropoff-public-helper-guardrails.md`

## Raw Source

# CODEX GOAL - Repair Agent Mode Drop-Off and Public Helper Unsafe Task Creation

You are in repo:
`C:\Users\User\BNA v2.0`

Follow `AGENTS.md`, `BNA-START-HERE.md`, `GOAL-MODE.md`, and the existing
execution-run protocol.

This is Goal Mode. Create/continue the active Codex goal if the tool is
available. Work until the requirements below are terminal, with proof.

Do not hand-wave this. Verify live state first.

## Context

After the Agent Review Hub / Agent Mode drop-off work, Agent Mode was sent into
the live owner audit for `prompt_key=operations-super-admin`.

The expected behavior was:

- Agent Mode runs the audit.
- Agent Mode saves the result itself through the Agent Review Hub / API.
- The result appears as an AGR record in the hub.
- The final answer says the AGR ID or says explicit drop-off failed.

Instead, Agent Mode returned a manual JSON/download/upload style answer:

- "I've compiled the audit result into a JSON report"
- "You can download it here"
- "upload it to the Agent Review Hub"

That is not acceptable. Agent Mode must not leave Shloimie to manually recover
the result when the whole purpose of the feature is direct drop-off.

Also, a public helper / unauthenticated path appears to have created a normal
Codex/deployment task:

- task `#1738`
- title roughly: "Deploy the new code to production"

Public or wrong-role helper chats must not create normal tasks, Codex Queue
items, deployment requests, or production-action tickets for unsafe requests.

## Verify first

Before coding, inspect and record:

1. Current `master` SHA on GitHub.
2. Current deployed Railway SHA/status.
3. Current Issue #24 status/comment trail.
4. Current PRs #33/#34/#35 status.
5. Whether live hub has any saved AGR for:
   - `prompt_key=operations-super-admin`
   - `idempotency_key=operations-super-admin:first-agent-pilot`
6. Whether any recent owner pilot AGR exists.
7. Whether the negative auth probe result saved.
8. Task `#1738` details, source, status, assigned owner, agent job link, and
   whether it is executable.

## Required repair A - Agent Mode prompt/drop-off contract

Repair the Agent Mode prompt/output contract so every generated Agent Mode
prompt explicitly requires:

1. Agent must save its result itself through the Agent Review Hub or result API.
2. A successful final answer must begin with:
   `SAVED AGR-...`
3. A successful final answer must include:
   - AGR/result_ref
   - readback URL
   - status
   - any remaining blocker
4. A normal final answer must not say:
   - download this report
   - upload it yourself
   - I compiled the JSON
   - here is the file
   - manual upload required
5. If normal in-page save fails, Agent Mode must use the exact drop-off URL in
   the prompt.
6. If browser form save fails, Agent Mode must use the direct API fallback if
   possible.
7. If all automated saving fails, final answer must begin:
   `DROP-OFF FAILED`
   and only then include the JSON payload for manual recovery.
8. The prompt should tell Agent Mode that the browser window is safe to close
   only after the AGR/result_ref is visible in the hub/readback.

Add or repair UI copy in the Agent Review Hub/drop-off page so there is an
obvious emergency fallback:

- "Emergency paste JSON and save"

This is fallback only, not the normal path.

## Required repair B - tests for Agent Mode drop-off

Add tests that fail if the generated prompt pack contains forbidden manual
drop-off language except in the explicit `DROP-OFF FAILED` branch.

Tests must cover:

- prompt text includes self-save requirement
- prompt text includes exact drop-off URL
- prompt text includes API fallback
- prompt text includes `SAVED AGR-`
- prompt text includes `DROP-OFF FAILED`
- prompt text forbids the manual-download/upload phrases above
- result API returns AGR ID
- hub/result readback shows saved result
- idempotency key prevents duplicate rows

## Required repair C - public helper unsafe task creation

Find how public helper / website assistant messages become tasks/tickets/Codex
Queue items.

Add a hard boundary:

Public, anonymous, unauthenticated, wrong-role, or scoped non-admin helper
users must not create normal Tasks, Codex Queue items, deployment requests, or
production-action support tickets for Tier-3 unsafe actions.

Tier-3 unsafe actions include at least:

- deploy / production release / Railway push
- production DB mutation or class backfill apply
- real external send to parents/students/providers
- charges, refunds, payment-method changes
- DNS/domain changes
- credential, account, permission, or API-key changes
- public publish of content/site changes
- Drive write/move/upload
- mutating production worker retry/restart

For those requests, public helper should return a safe refusal:

- says it cannot perform or queue that action from public chat
- says no task/queue/deploy/action was created
- points to proper owner login/support route if appropriate
- optionally records a redacted audit event only

It must not create a normal executable task.

Inspect task `#1738`:

- If it is an invalid public-created deployment task, supersede/reclassify/
  neutralize it with an audit note.
- Do not delete history.
- Make sure it is not executable as a Codex deployment task.

## Required repair D - tests for public helper

Add tests for public/anonymous/wrong-role messages like:

- "deploy new code to production"
- "push to Railway"
- "apply the class backfill"
- "show me student contact info"
- "change DNS"
- "charge this card"
- "send WhatsApp to all parents"
- "upload this class to Vimeo"
- "retry the production worker"

Expected:

- safe refusal
- no normal task created
- no Codex queue item created
- no deployment request created
- no false success wording
- if any audit record is made, it is redacted/non-executable

## Required live verification

After fixes:

1. Run local tests, including the new tests.
2. Run relevant watchdogs:
   - actions
   - links if route/link touched
   - security
   - secrets audit
3. Deploy via the standard repo policy.
4. Run Railway doctor.
5. Live smoke:
   - Agent Review Hub loads
   - Agent Mode task/decision drop-off smoke still passes
   - public helper unsafe-action smoke returns refusal/no task
6. Run the exact owner pilot again for `operations-super-admin`, using the
   hardened prompt.
7. Confirm it saves an AGR result without manual upload.

## Evidence and closeout

Update:

- requirement register
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- Issue #24 if this is a continuation of that issue

Final response must include:

1. master SHA before
2. deployed SHA before
3. PR/issue status
4. whether old AGR existed
5. what was wrong in prompt/drop-off
6. what was changed
7. task `#1738` status after repair
8. tests run
9. deploy ID/SHA
10. live smoke results
11. new AGR ID from exact owner pilot, or exact blocker
12. remaining blockers, if any

End with exactly one verdict line:

- `LIVE VERIFIED - AGENT DROP-OFF AND PUBLIC HELPER GUARDRAILS FIXED`
- `PARTIAL - exact remaining failure`
- `BLOCKED - exact owner action required`
