# Codex Queue Prompt — BNA Agent Control Center and Closed-Loop Verification

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Date:** 2026-06-18
**Execution order:** Queue this after the current BNA recovery/completion run.
**Goal:** Turn BNA Operations into a closed-loop agent work system where tasks generate the correct agent handoff, an agent performs or verifies the work, reports progress inside Operations, submits evidence, and seals its own run without losing the task state.

---

# 0. Priority and sequencing

This prompt must not derail or replace the current recovery run.

At the beginning:

1. Read `BNA-START-HERE.md`.
2. Read `docs/BNA-RAMBLE-TO-DONE.md`.
3. Read `ops/execution-runs/latest.json`.
4. Run:
   - `npm run bna:run:status`
   - `npm run bna:run:validate`
5. Inspect the active recovery run and its `NEXT-SESSION.md`.
6. If the old June 18 recovery work still contains unblocked required P0/P1 items:
   - continue and checkpoint that work first;
   - do not restart it;
   - do not mark it complete without evidence.
7. Begin this Agent Control Center only after the recovery run is:
   - complete locally; or
   - blocked solely on a genuine operator/external action with a precise handoff.

This feature is the next workstream, not a substitute for finishing the prior work.

---

# 1. Execute the feature

IMPLEMENT THE SYSTEM. Do not merely write a plan, brief, mockup, task list, or architecture memo.

The finished product must provide:

- one Super Admin **Agents** menu;
- task-specific agent runs;
- generated, copy-ready Agent Mode prompts;
- an authenticated agent run page;
- progress reporting;
- evidence submission;
- pass/fail/blocked/needs-decision outcomes;
- a **Seal Run** action;
- automatic feedback into Tasks, Decisions, Codex Queue, and the execution ledger;
- workspace and role isolation;
- strong audit history;
- deterministic Playwright/API verification;
- a resumable handoff if this Codex session stops.

Do not claim completion when only the database or UI exists. Prove the full loop end-to-end with safe test data.

---

# 2. Product intent in plain language

Shloimie should be able to ramble naturally.

The system should convert the ramble into work.

For each coherent work package:

1. Codex implements or updates the product.
2. The system determines what verification is required.
3. A task card offers the correct agent handoff.
4. For browser/UI/external-site verification, the preferred handoff is a single Agent Mode prompt.
5. Shloimie clicks one copy button and opens Agent Mode.
6. Shloimie performs one manual login takeover when required.
7. Agent Mode enters the BNA Agent Run page, claims the run, follows the generated checklist, and records progress.
8. Agent Mode performs safe browser verification.
9. Agent Mode submits:
   - outcome;
   - checklist results;
   - evidence;
   - remaining defects;
   - blocker or operator decision when applicable.
10. Agent Mode clicks **Seal Run**.
11. Sealing closes the agent run—not automatically the overall product task unless all required gates pass.
12. The parent task then:
   - closes when all implementation and verification gates pass;
   - returns to Codex with exact feedback when verification fails;
   - creates a Decision card when an operator action is needed;
   - remains blocked with a precise next step when an external dependency fails.
13. Every future session can resume from durable state.

The user should not have to remember which prompt to use or where the agent should report.

---

# 3. Important platform limitation

Do not pretend that BNA can silently start ChatGPT Agent Mode through an unsupported API or automatically supply passwords.

Implement the best reliable workflow available now:

- BNA generates the complete task-specific Agent Mode prompt.
- A **Copy Agent Prompt** button copies it.
- An **Open ChatGPT Agent** button opens ChatGPT in a new tab.
- The operator starts Agent Mode and pastes the copied prompt.
- The prompt tells Agent Mode the exact authenticated BNA Agent Run URL to open.
- Agent Mode pauses for browser takeover when login is required.
- The operator logs in manually once.
- Agent Mode continues and reports through the BNA Agent Run page.

Do not include passwords, refresh tokens, API keys, cookies, or secret one-time credentials in prompts.

Design the backend with a provider-neutral agent-run API so a supported automation adapter can be added later, but do not fake an integration that does not exist.

---

# 4. Reuse current repository systems

Before creating tables, routes, or UI:

Inspect and reuse the canonical implementations after the recovery work, including:

- `bna_tasks`;
- `bna_task_comments`;
- `decision_required`;
- task stages/statuses;
- project/workspace scoping;
- `scripts/agent-fleet-supervisor.mjs`;
- Operations task details/comments;
- `ops/agent-task-ledger.jsonl`;
- `ops/agent-changelog.md`;
- active execution-run protocol;
- Playwright Operations audit harness;
- Telegram completion reporting;
- current authentication/session middleware;
- current canonical `/operations` frontend;
- any newer workspace/RBAC schema added by the recovery run.

Do not build a second disconnected task system, comment system, agent ledger, or Operations application.

Where current project records have become true workspace records, use the canonical workspace model. Do not preserve outdated assumptions merely because older files call them projects.

---

# 5. Create a new execution workstream

Add this work to the durable execution protocol using stable IDs.

Suggested parent requirement:

```text
REQ-20260618-112 — Agent Control Center and closed-loop verification
```

Suggested child requirements:

```text
REQ-20260618-112A — Agent profiles and capabilities
REQ-20260618-112B — Agent run schema and state machine
REQ-20260618-112C — Agent menu and task-card handoff UI
REQ-20260618-112D — Prompt generation and versioning
REQ-20260618-112E — Agent run portal and progress reporting
REQ-20260618-112F — Evidence submission and Seal Run
REQ-20260618-112G — Decisions and Codex feedback routing
REQ-20260618-112H — Workspace/RBAC/security controls
REQ-20260618-112I — Verification policy and Playwright integration
REQ-20260618-112J — Notifications and audit history
REQ-20260618-112K — End-to-end tests and safe demo data
```

Create or update the correct execution-run files.

Do not create another parallel execution protocol.

---

# 6. Agent roles

Create a small, clear agent registry.

Initial agent types:

## 6.1 Codex Builder

Purpose:

- repository changes;
- backend/frontend implementation;
- migrations;
- tests;
- deployment preparation.

This may reuse the existing Codex fleet logic.

## 6.2 Browser QA Agent

Visible product label:

```text
Browser QA
```

Do not label it “Codex” for ordinary users.

Purpose:

- Agent Mode browser walkthroughs;
- UI acceptance;
- route/navigation checks;
- external-site checks;
- human-style usability review;
- safe form/read-only verification.

## 6.3 Playwright Verifier

Purpose:

- deterministic route checks;
- viewport screenshots;
- overflow, clipping, overlap, and console/network checks;
- repeatable regression verification.

## 6.4 Research Agent

Purpose:

- public research;
- source collection;
- provider/business research where lawful;
- no private-group scraping;
- no unauthorized data harvesting.

## 6.5 Operator

Not an AI agent.

Purpose:

- credentials;
- legal/security/product decisions;
- destructive/high-risk approval;
- external account authorization;
- final release approval.

Use agent capability metadata rather than hard-coding every flow.

Possible capability keys:

```text
repo_write
run_tests
browser_read
browser_safe_interaction
visual_review
external_research
post_agent_progress
submit_verification
request_operator_decision
production_deploy
production_write
```

Production write/deploy capabilities must not be granted to Browser QA.

---

# 7. Verification policy

Every coherent implementation work package must have a verification plan.

Do not create a separate expensive Agent Mode run for every tiny code edit.

Use one verification run per coherent task/work package or batch.

Suggested routing:

## UI/browser-visible change

Required:

- focused automated tests;
- Playwright verification;
- Browser QA Agent final review.

## Backend/API/RBAC change with user-visible effect

Required:

- unit/integration/negative authorization tests;
- targeted browser verification where the effect is visible;
- Browser QA Agent may seal the work package after reviewing evidence and the affected flow.

## Pure internal refactor with no visible behavior

Required:

- automated tests;
- a Browser QA Agent does not need to re-crawl unrelated screens;
- the final work-package run may review the task/evidence and seal the run without a broad walkthrough.

## External integration/auth change

Required:

- safe integration smoke;
- Browser QA or Operator step when a login/consent screen is involved;
- a Decision card when operator authorization is required.

## Destructive, financial, publishing, permission, or production action

Required:

- explicit operator approval;
- no automatic execution by Browser QA;
- audit record.

Each task should store:

```text
verification_mode:
  automated
  browser_agent
  operator
  mixed
```

For Shloimie’s preferred loop, default user-visible work to `mixed`.

---

# 8. Database and durable model

Inspect the current schema first.

Add idempotent migrations for the minimum clean model.

Suggested entities:

## 8.1 Agent profiles

```text
bna_agent_profiles
```

Fields should include:

- `id`;
- `agent_key`;
- `display_name`;
- `agent_type`;
- `description`;
- `capabilities` JSONB;
- `active`;
- `workspace_scope_mode`;
- `created_at`;
- `updated_at`.

## 8.2 Agent runs

```text
bna_agent_runs
```

Fields should include:

- `id`;
- public-safe `run_key`;
- `task_id`;
- `workspace_id`;
- `project_id` only if retained by the canonical model;
- `batch_id`;
- `agent_profile_id`;
- `run_type`;
- `verification_mode`;
- `status`;
- `priority`;
- `prompt_version`;
- `prompt_text`;
- `target_url`;
- `acceptance_criteria` JSONB;
- `allowed_actions` JSONB;
- `forbidden_actions` JSONB;
- `context_snapshot` JSONB;
- `claimed_by`;
- `claimed_at`;
- `started_at`;
- `last_progress_at`;
- `submitted_at`;
- `sealed_at`;
- `expires_at`;
- `result_summary`;
- `result_payload` JSONB;
- `failure_reason`;
- `blocker`;
- `operator_decision_id`;
- `created_by`;
- `created_at`;
- `updated_at`.

## 8.3 Agent run events

```text
bna_agent_run_events
```

Append-only events:

- created;
- prompt_generated;
- copied;
- opened;
- claimed;
- started;
- progress;
- evidence_added;
- submitted;
- sealed;
- verified;
- failed;
- blocked;
- decision_requested;
- resumed;
- expired;
- cancelled.

Fields:

- run ID;
- event type;
- actor type;
- actor ID/name;
- body;
- metadata;
- timestamp.

## 8.4 Agent artifacts/evidence

```text
bna_agent_run_artifacts
```

Store references, not uncontrolled blobs where avoidable:

- run ID;
- artifact type;
- title;
- path/URL;
- metadata;
- redaction status;
- created by;
- timestamp.

Artifact types:

- screenshot;
- report;
- log;
- test result;
- route;
- console error;
- network error;
- note;
- external source.

## 8.5 Prompt templates

```text
bna_agent_prompt_templates
```

Fields:

- key;
- version;
- agent type;
- purpose;
- template text;
- active;
- created/updated;
- change notes.

Every run stores the rendered prompt and version for auditability.

## 8.6 Task fields

Reuse existing task fields when possible.

Add only what is needed, such as:

- `implementation_status`;
- `verification_status`;
- `required_verification_mode`;
- `active_agent_run_id`;
- `last_verified_at`.

Do not collapse implementation status and verification status into one field.

---

# 9. State machines

## 9.1 Agent run status

Use a canonical state machine:

```text
draft
ready
claimed
running
waiting_operator
submitted
sealed_pass
sealed_fail
blocked
expired
cancelled
```

Rules:

- `ready` means prompt and criteria exist.
- `claimed` means an agent accepted the run.
- `running` means verification/action is underway.
- `waiting_operator` creates/links a Decision.
- `submitted` means the agent submitted a result but has not sealed it.
- `sealed_pass` means the agent completed its run with a passing result.
- `sealed_fail` means the agent completed its run and found defects.
- `blocked` means the agent could not proceed and recorded the precise blocker.

## 9.2 Parent task behavior

A sealed agent run does not automatically mean the parent task is done.

After `sealed_pass`:

- check all required automated gates;
- check implementation status;
- check other required verifier runs;
- close the task only when all gates pass;
- otherwise keep it in verification.

After `sealed_fail`:

- add a structured task comment;
- move the task back to ready/in-progress/Codex Queue according to the canonical task state model;
- include exact failed criteria and evidence;
- generate a new implementation follow-up without duplicating the original task.

After `waiting_operator` or `blocked`:

- create or update a Decision card;
- include exact action needed;
- include one copy-ready prompt if Agent Mode/operator browser work is required;
- link the Decision to the task and agent run.

---

# 10. Super Admin Agents menu

Add one clear **Agents** module to the Super Admin Operations shell.

Do not add it to ordinary users unless their role requires a limited agent-run view.

Suggested tabs:

```text
Ready
Running
Needs Operator
Needs Verification
Failed
Completed
All
```

Optional secondary views:

```text
Agents
Prompt Templates
Policies
Activity
```

## 10.1 Summary

Show only useful live counts:

- ready;
- running;
- waiting operator;
- failed;
- verification pending.

No fake or stale counters.

## 10.2 Agent run cards

Each card should show:

- task title;
- task ID;
- workspace;
- module;
- agent type;
- verification mode;
- current status;
- acceptance progress;
- last update;
- blocker;
- target URL;
- evidence count;
- created time;
- expiration where relevant.

Actions by status:

### Ready

- Copy Agent Prompt
- Open ChatGPT Agent
- Open Agent Run
- Cancel

### Running

- View Progress
- Open Run
- Add Operator Note
- Pause/Cancel only with confirmation

### Needs Operator

- Open Decision
- Copy Required Prompt
- Mark Operator Step Complete
- Resume Run

### Submitted

- Review Submission
- Seal Pass
- Seal Fail
- Request More Evidence

Browser QA should normally seal its own run. Super Admin may override only with an audit event and reason.

### Completed/Failed

- View Evidence
- Reopen as New Run
- View Parent Task

## 10.3 Mobile behavior

- horizontally scrollable status tabs;
- compact cards;
- no body overflow;
- primary action visible;
- no tiny buttons;
- no random multi-row control wrapping;
- helper does not cover actions.

---

# 11. Task-card agent section

On task details, add one **Agent Verification** section.

Show:

- implementation status;
- verification status;
- required verification mode;
- latest run;
- acceptance criteria;
- automated test status;
- agent result;
- evidence;
- blocker/decision.

Actions:

- Prepare Agent Run
- Regenerate Prompt
- Copy Agent Prompt
- Open ChatGPT Agent
- Open Agent Run
- View Evidence
- Request Operator Decision
- Rerun Failed Verification

Do not display every action at once. Use status-aware actions.

A user should not need to understand internal tools or provider names.

---

# 12. Decision cards

When an agent or implementation task requires Shloimie:

Create one clean Decision card containing:

- what is blocked;
- why the agent cannot continue;
- exact action required;
- account/site involved;
- safety note;
- expected result;
- one primary button;
- one copy-ready Agent Mode prompt when appropriate;
- link to parent task and run;
- resume behavior.

Examples:

- Sign into Google and approve OAuth.
- Choose which community/workspace owns a record.
- Confirm a destructive merge.
- Approve production deployment.
- Resolve an ambiguous student match.

Do not create Decisions for work agents can safely perform themselves.

Do not create duplicate Decisions for the same blocker/run.

---

# 13. Agent launch and prompt generation

Create one deterministic prompt generator.

The prompt should be assembled from:

- agent profile;
- run ID;
- task ID;
- current workspace/module;
- target URL;
- exact acceptance criteria;
- allowed and forbidden actions;
- known context;
- evidence already available;
- reporting instructions;
- completion URL;
- expiry/safety rules.

Do not include entire raw transcripts unless required.

Do not include secrets.

## 13.1 Required generated Browser QA prompt structure

Each generated Agent Mode prompt must contain:

```text
You are the Browser QA verifier for Bnei Neviim Academy.

Agent Run:
[RUN ID]

Parent Task:
[TASK ID and title]

Workspace:
[WORKSPACE]

Target:
[TARGET URL]

Your job:
[SHORT PURPOSE]

Acceptance criteria:
[NUMBERED LIST]

Allowed:
- read-only navigation
- safe tabs/filters/search
- browser back/forward
- screenshots/evidence
- progress updates to the Agent Run page

Forbidden:
- sending messages
- publishing
- approving/rejecting real records
- deleting/archiving
- charging/payments
- inviting users
- production changes
- credential disclosure
- any action not explicitly allowed

Start:
1. Open the Agent Run URL:
   [AGENT RUN URL]
2. If login is required, pause for browser takeover.
3. Click Start/Claim Run.
4. Perform the checklist.
5. Post progress after each major section.
6. Attach/reference evidence.
7. If blocked, select Blocked/Needs Operator and describe the exact next action.
8. Submit the result.
9. Click Seal Run.
10. Confirm the sealed status before ending.

Do not finish only in chat. The authoritative result must be submitted and sealed inside BNA Operations.
```

The prompt may include module-specific instructions.

## 13.2 Copy behavior

- one click copies the full prompt;
- show a brief “Copied” state;
- no hidden extra instructions;
- prompt version is displayed;
- regenerated prompts create a new version/event.

## 13.3 Open ChatGPT Agent

Open ChatGPT in a new tab.

Do not assume the prompt was pasted or Agent Mode was activated.

Record `opened`, not `claimed`, until the Agent Run page is actually claimed.

---

# 14. Agent Run portal

Create a focused Agent Run screen that Agent Mode can use safely.

Route may be:

```text
/operations/agents/runs/:runKey
```

Use canonical routing after inspection.

Screen content:

- run status;
- task title;
- workspace/module;
- purpose;
- target URL;
- acceptance checklist;
- allowed/forbidden actions;
- progress timeline;
- evidence controls;
- result form;
- blocker/decision form;
- Submit Result;
- Seal Run.

## 14.1 Progress

Agent Mode should be able to post:

- section started;
- section completed;
- issue found;
- evidence added;
- blocker found;
- waiting operator;
- resumed.

Use structured controls plus an optional note.

Autosave draft progress.

## 14.2 Result form

Required fields:

- outcome:
  - pass;
  - fail;
  - blocked;
  - needs_operator;
- concise summary;
- criterion-by-criterion result;
- routes/screens tested;
- viewports tested;
- evidence;
- console/network problems;
- remaining issues;
- recommended next action.

## 14.3 Seal Run

Seal requires:

- every criterion marked;
- summary;
- at least one evidence reference for UI verification unless explicitly exempt;
- no unresolved draft blocker;
- confirmation.

After sealing:

- run becomes immutable except for an audited super-admin reopen action;
- append task comment;
- update task verification state;
- create Codex feedback or Decision as required;
- append ledger/changelog/run event;
- send concise Telegram/operator notification where configured.

---

# 15. Authentication and security

## 15.1 Preferred current workflow

Agent Mode uses manual browser takeover to authenticate.

One login should allow it to complete multiple runs in the same Agent Mode browser session where cookies persist.

## 15.2 Roles

Implement a limited role such as:

```text
agent_verifier
```

It may:

- see runs explicitly assigned/allowed;
- read the minimum task/workspace context needed;
- post progress;
- submit evidence;
- seal its run.

It may not:

- browse unrelated workspaces;
- access payment data unless explicitly required and authorized;
- edit arbitrary tasks;
- modify students/content/users;
- trigger production actions;
- see secrets.

Super Admin retains full oversight.

## 15.3 Run access

A run URL alone must not grant access.

Require authenticated authorization.

If short-lived signed run tokens are added later:

- scope to one run;
- read/write only run progress/result;
- short expiration;
- revocable;
- never grant product-wide access;
- never place reusable credentials in prompts.

## 15.4 Workspace isolation

Every query and API route must validate:

- authenticated actor;
- role;
- run assignment;
- workspace;
- task;
- allowed action.

Add negative tests for cross-workspace and cross-run access.

## 15.5 Request safety

Browser QA submissions may mutate only:

- its own run state;
- run events;
- run artifacts;
- related task comments/verification status through server-controlled transitions.

Do not let a Browser QA prompt directly call arbitrary product mutation APIs.

---

# 16. APIs

Adapt names to the canonical server style.

Required capabilities:

```text
GET    /api/bna/agent-profiles
GET    /api/bna/agent-runs
POST   /api/bna/tasks/:taskId/agent-runs
GET    /api/bna/agent-runs/:runKey
POST   /api/bna/agent-runs/:runKey/claim
POST   /api/bna/agent-runs/:runKey/progress
POST   /api/bna/agent-runs/:runKey/artifacts
POST   /api/bna/agent-runs/:runKey/submit
POST   /api/bna/agent-runs/:runKey/seal
POST   /api/bna/agent-runs/:runKey/block
POST   /api/bna/agent-runs/:runKey/resume
POST   /api/bna/agent-runs/:runKey/reopen
POST   /api/bna/tasks/:taskId/verification-plan
```

Use server-side state transition validation.

Make creation idempotent where the same task/verification plan is submitted twice.

Use pagination and workspace filters.

Do not return secret context snapshots to unauthorized clients.

---

# 17. Integration with existing Codex fleet

Extend the existing fleet instead of duplicating it.

After Codex completes a task:

1. Codex/supervisor records implementation result and tests.
2. The verifier policy decides whether an agent run is required.
3. If required:
   - task moves to `needs_verification`;
   - an agent run becomes `ready`;
   - task card shows Copy Prompt/Open Agent.
4. Do not mark the task done merely because baseline tests pass when browser verification is required.
5. When Browser QA seals pass:
   - check automated gates;
   - then close.
6. When Browser QA seals fail:
   - create exact Codex feedback;
   - return task to Codex queue;
   - retain the same parent task;
   - create a new verification run after the fix.
7. Limit retries and avoid infinite loops.
8. After repeated failure:
   - create a Decision;
   - stop automatic retry.

Do not launch autonomous watchers as part of deployment unless the operator explicitly enables them.

---

# 18. Integration with natural-language rambles

The ramble parser must output:

- work package;
- requirement IDs;
- task(s);
- verification plan;
- operator decisions;
- agent runs only when appropriate.

For each new broad prompt:

1. Preserve the raw source.
2. Distill requirements.
3. Compare current state.
4. Build implementation work packages.
5. Attach verification requirements.
6. Generate Agent Mode handoff after implementation.
7. Close only after evidence.

The task manager becomes the operating control plane.

The user should not need to return to the original chat to know what remains.

---

# 19. Batching and concurrency

Support a batch of related agent runs.

Examples:

- Audit all student screens.
- Verify all task-manager tabs.
- Check all workspace selectors.
- Verify public/portal headers.

A single Agent Mode prompt may cover multiple related run items when:

- same workspace;
- same permissions;
- read-only;
- coherent acceptance checklist.

The agent must submit a result per task/run or a batch result with explicit per-item verdicts.

Concurrency rules:

- no two builders edit the same work package concurrently;
- run/task locks prevent duplicate claim;
- parallel Browser QA runs are allowed only for independent read-only areas;
- configurable maximum concurrency;
- duplicate claim returns a clear message;
- stale claims expire safely.

This reduces Agent Mode usage while preserving evidence.

---

# 20. Notifications

Use concise notifications.

Notify Shloimie when:

- a run is ready and needs manual Agent Mode launch;
- a run needs login/operator action;
- a run fails;
- a run passes and task closes;
- repeated failures require a Decision.

Notification should contain:

- task title;
- workspace;
- status;
- one action/link;
- no raw technical logs;
- no secrets.

Do not spam progress notifications for every minor step.

---

# 21. Audit and provenance

Every important action records:

- actor;
- role;
- workspace;
- task;
- run;
- prompt version;
- event;
- before/after state;
- timestamp;
- evidence;
- source channel.

Append durable execution evidence where relevant.

Do not overwrite prior run results.

A reopened run creates a new audited transition.

---

# 22. UI quality

Use the current shared design system after the recovery run.

Requirements:

- same header/navigation language as Operations;
- compact mobile layout;
- high contrast;
- clear statuses;
- one primary action;
- horizontally scrollable tabs on mobile;
- no body overflow;
- accessible labels;
- keyboard support;
- loading/empty/error states;
- no duplicate helper launcher;
- no internal debug wording in ordinary task cards.

The Agents menu must not become another cluttered diagnostics dashboard.

---

# 23. Safe demonstration data

Add a deterministic seed/cleanup path for development/test environments.

Seed:

- one workspace;
- one implementation task;
- one Browser QA run ready;
- one running;
- one waiting operator;
- one sealed pass;
- one sealed fail;
- task comments/events/evidence.

Do not seed production-visible records without a test flag.

---

# 24. Tests

## 24.1 Unit tests

Test:

- prompt rendering;
- prompt versioning;
- capability policy;
- allowed/forbidden actions;
- state transition validation;
- verification-plan routing;
- idempotent run creation;
- sealing requirements;
- retry limits;
- Decision deduplication.

## 24.2 API/integration tests

Test:

- create run from task;
- list/filter by workspace/status;
- claim;
- progress;
- artifact;
- submit;
- seal pass;
- seal fail;
- block;
- resume;
- reopen;
- unauthorized denial;
- cross-workspace denial;
- cross-run denial;
- immutable sealed run;
- task transition feedback;
- Decision creation;
- Codex requeue.

## 24.3 Playwright tests

At:

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Test:

- Agents menu loads;
- tabs work;
- no body overflow;
- run cards fit;
- Copy Agent Prompt works;
- prompt contains run URL and criteria;
- Open Agent action is clear;
- run page claim/progress/submit/seal flow;
- blocker creates Needs Operator;
- failed run returns task to verification/fix state;
- pass closes only after gates;
- mobile controls do not overlap;
- helper does not cover actions;
- Decision card has one clear action;
- workspace access is scoped.

## 24.4 End-to-end acceptance test

Use safe test data:

1. Create a test task.
2. Mark implementation complete.
3. Generate mixed verification plan.
4. Run automated checks.
5. Create Browser QA run.
6. Claim run as test agent.
7. Post progress.
8. Submit pass evidence.
9. Seal run.
10. Verify task closes.
11. Repeat with fail and confirm Codex requeue.
12. Repeat with blocker and confirm Decision.
13. Clean up test data.

Do not require a real ChatGPT Agent Mode invocation for automated CI; simulate the authenticated Browser QA client through the same APIs/UI.

Then perform one manual Agent Mode smoke before declaring the feature live-ready.

---

# 25. Required generated operator prompt

At the end of implementation, create a downloadable/copy-ready operator prompt for the first real Agent Mode smoke.

It should identify:

- test agent run URL;
- safe target;
- login takeover instruction;
- checklist;
- progress reporting;
- submission;
- Seal Run.

Store the canonical template in the repository.

---

# 26. Implementation phases

## Phase A — Baseline and recovery handoff

- confirm prior recovery status;
- add requirement IDs;
- inspect current schema/routes/UI;
- add failing tests.

## Phase B — Data model and APIs

- migrations;
- state machine;
- auth/RBAC;
- events/artifacts;
- prompt templates;
- verification policy.

## Phase C — Agents menu and task integration

- Agents module;
- task-card section;
- Decision cards;
- status actions;
- mobile behavior.

## Phase D — Prompt generator and launch flow

- prompt rendering;
- copy button;
- open ChatGPT;
- prompt versioning;
- exact Agent Run URL.

## Phase E — Agent Run portal

- claim;
- progress;
- evidence;
- submit;
- block;
- Seal Run;
- immutable history.

## Phase F — Codex/Playwright/Decision routing

- post-implementation verifier creation;
- pass/fail/blocked routing;
- retry limits;
- notifications.

## Phase G — Tests and evidence

- unit;
- API;
- RBAC;
- Playwright;
- safe E2E;
- manual Agent Mode smoke instructions.

## Phase H — Deployment preparation

- migrations;
- rollback;
- env changes;
- local verification;
- one explicit operator release approval.

Do not deploy until Shloimie explicitly approves.

---

# 27. Verification commands

Use repository-appropriate commands.

At minimum:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
node --check scripts/bna-execution-run.mjs
npm test
npm run bna:run:validate
```

Run new targeted agent-control tests.

Run the Playwright suite.

Do not start `agent:fleet --watch`.

Do not run another broad baseline audit unnecessarily.

---

# 28. Definition of done

This work is locally complete only when:

- old recovery work is not abandoned or restarted;
- one Agents module exists;
- task cards create agent runs;
- prompts are generated/versioned/copied correctly;
- Agent Mode receives an exact run URL and instructions;
- Agent Run portal supports claim/progress/evidence/submit/seal;
- fail routes back to Codex;
- blocker creates a clean Decision;
- pass closes only after all gates;
- run history is immutable/audited;
- authentication and workspace scope are enforced;
- cross-workspace tests pass;
- mobile/desktop Playwright tests pass;
- one safe end-to-end simulated agent loop passes;
- manual Agent Mode smoke prompt exists;
- execution ledger/evidence/handoff are current;
- no secrets were placed in prompts;
- no unsupported automatic ChatGPT Agent Mode integration was claimed;
- no production deployment occurred without approval.

---

# 29. Session interruption

If this session ends before completion:

- commit all safe completed work;
- push the branch;
- update the active execution run;
- write exact `NEXT-SESSION.md`;
- identify the next child requirement and command;
- record tests already run;
- record work that must not be repeated;
- return:

```text
PARTIAL — RESUME THE ACTIVE RUN
```

The next session must resume rather than redesign.

---

# 30. Final response

Report:

1. recovery-run status;
2. branch and HEAD;
3. commits;
4. migrations;
5. agent-control requirement statuses;
6. files/routes added or changed;
7. tests and results;
8. safe E2E result;
9. manual Agent Mode smoke prompt/path;
10. remaining blockers;
11. deployment/rollback plan;
12. exact operator next action;
13. verdict:
   - COMPLETE LOCALLY — RELEASE APPROVAL REQUIRED
   - PARTIAL — RESUME THE ACTIVE RUN
   - BLOCKED — EXTERNAL ACTION REQUIRED

Do not return COMPLETE based only on UI mockups, schema, or prompt generation. Prove the closed loop.
