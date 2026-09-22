# CODEX GOAL — Repair Agent Review Drop-Off, Scoped Context Access, and Helper Basic Failures

Repository: `shloimie-beep/bnei-neviim-academy`

Run in Goal Mode from current verified `master`.

## Purpose

The Agent Review Hub exists, but the first real Agent Mode attempts did not follow the intended workflow. Agents responded inside the ChatGPT chat instead of reliably saving into the BNA Agent Review result section. Some agents also failed to access the Agent Review Hub and ended up auditing the public helper from a login page.

Before more Agent Mode audits, repair the hub and prompt flow so an Agent Mode session has one clear place to return and save its report.

## Evidence from failed Agent Mode attempts

Treat these as source evidence. Preserve the raw text in canonical intake.

### Observed failure A — student audit ran as public helper

The Agent attempted to start at:

`https://bneineviimacademy.org/operations?view=agent_review`

It was redirected to `operations-login.html`. Without credentials, it stayed in the public/sign-in context and audited the public helper instead of a scoped Student QA context.

Observed issues:

- Agent Review Hub was inaccessible without login.
- Agent did not stop with a clean `BLOCKED — login required` result.
- Agent continued auditing the public helper as if it were the student helper.
- It could not verify student routes, schedule, worksheets, progress, questions, support, or audit events.

### Observed failure B — helper claimed success without proof

The helper answered a support request by claiming something like:

`I sent this to the office as ticket #25.`

But there was:

- no returned link;
- no audit record shown;
- no ticket readback;
- no evidence that a typed action executed.

This must fail. A helper must not claim a write happened without an action/audit/result record.

### Observed failure C — public helper did not guide to secure routes

For private requests such as:

- next class;
- current worksheet;
- student progress;
- private question to rabbi;

the helper generally refused access, which is correct, but often did not return the correct login or portal route. It also sometimes asked for contact information in public chat.

Public helper behavior should be:

- do not expose private data;
- do not ask for sensitive/personal information in a public chat unless a clear, safe contact form flow is being used;
- provide the correct login or support route;
- if an action cannot be performed, say so and offer a safe next step.

### Observed failure D — result drop-off was not reliable

The prompt told Agent Mode to submit to:

`/api/bna/agent-review/results`

But Agent Mode returned reports in the ChatGPT conversation. This means the hub needs a practical UI-based drop-off flow, not just an API instruction.

## Required work

## 1. Register this as canonical source

- Create a new raw input record for this repair request.
- Create or update one parent execution run.
- Link it to Issue #24, but do not reopen already closed Issue #24 unless repo protocol requires it.
- If a new issue/requirement is required, create it explicitly and link to this source.
- Do not create duplicate tasks for the same repair.

## 2. Repair the Agent Review Hub workflow

Build or repair a clear UI path:

### Agent Review Dashboard

The hub must show:

- all prompt cards;
- context cards;
- a clear status for each prompt:
  - not started;
  - copied;
  - result pending;
  - result saved;
  - failed;
  - blocked;
  - repair created;
  - rerun required;
- last saved `AGR-*` result ID;
- direct link to the saved result;
- direct link to the repair requirement when applicable.

### Prompt card behavior

Each prompt card must provide:

- Copy prompt;
- Open context;
- Open drop-off form;
- Mark blocked;
- View saved result;
- Rerun after repair.

The copied prompt must include a unique:

- `agent_review_run_id`;
- `prompt_key`;
- `return_url`;
- `dropoff_url`;
- `requirement_id`;
- `idempotency_key`.

### Drop-off form

Create a human/Agent-friendly form page:

`/operations/agent-review/dropoff?...`

or equivalent.

It must:

- require owner/review session authentication;
- show prompt key, role, workspace, and requirement;
- provide a large textarea for the Agent’s final report;
- allow JSON paste or plain-text paste;
- include PASS / FAIL / BLOCKED selection;
- include severity;
- include "I could not complete because..." field;
- include current route and last completed route fields;
- include a Save button;
- return a visible `AGR-*` result ID;
- show a direct link to the saved result;
- create or link a repair item for FAIL/BLOCKED;
- generate a rerun prompt when FAIL/BLOCKED;
- never require the owner to manually copy the report out of ChatGPT and into GitHub.

### Fallback

If Agent Mode cannot save the report, the prompt must tell it to return the full report in chat. The UI must allow the owner to paste that whole report later and save it as the same `prompt_key`.

## 3. Fix review-context access

If an Agent starts at the hub and is not logged in:

- redirect to Operations login with a correct `returnTo`;
- after login, return to the exact hub/prompt/drop-off page;
- do not leave the Agent stuck on a generic sign-in page;
- provide a clear message: "Use takeover mode to log in once, then return here."

If a scoped context cannot open:

- stop and save/return `BLOCKED`;
- do not silently audit the public helper as if it were the target role.

## 4. Fix helper basic behavior

Repair the helper so that:

- it never claims a ticket/task/write/action was created unless a typed action result and audit ID exist;
- if unauthenticated and asked for private data, it links to the correct login route or safe support route;
- it does not solicit personal contact info in public chat except through an approved contact/support form with privacy copy;
- it returns internal links only through the canonical route/action resolver;
- it includes a reason and safe fallback when it cannot help;
- it distinguishes:
  - answered;
  - link provided;
  - action previewed;
  - action executed;
  - approval required;
  - blocked;
  - unsupported.

Fix the specific support-ticket false-success pattern.

## 5. Add tests

Add or update tests for:

- unauthenticated hub redirect with returnTo;
- prompt card copy includes run/dropoff metadata;
- drop-off form saves plain text report;
- drop-off form saves JSON report;
- FAIL/BLOCKED creates or links repair item;
- rerun prompt generation;
- public helper private-data request returns login/support link;
- public helper does not claim a ticket without audit proof;
- student/provider prompt cannot be completed from public context;
- result ID idempotency;
- secrets audit;
- no transcript/private student data in result output.

## 6. Live verification

App-visible work requires:

- merge;
- deploy;
- live smoke;
- manual or automated live check of:
  - Agent Review Hub;
  - copy prompt;
  - open context;
  - drop-off form;
  - save result;
  - saved result readback;
  - FAIL/BLOCKED repair generation;
  - public helper false-success repair.

## Final response format

Return:

1. Executive verdict
2. Current master/deployed truth
3. Raw/requirement IDs
4. Prior Agent Mode failure evidence ingested
5. Agent Review Hub changes
6. Drop-off form result
7. Prompt card result
8. Review-context login/return result
9. Helper false-success repair
10. Public helper private-data behavior
11. Tests run
12. PR/merge/deploy/live state
13. Exact owner links
14. Remaining blockers
15. Recommended next action

End with exactly one:

- `LIVE VERIFIED — AGENT REVIEW DROPOFF READY`
- `PARTIAL — exact remaining failures listed`
- `BLOCKED — exact owner action listed`
