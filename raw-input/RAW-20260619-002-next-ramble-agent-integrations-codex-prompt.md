# Codex Follow-Up Prompt — Harden BNA Ramble Ingestion, Agent Loop, One Time Workspace, and Vimeo/Zoom/Resend Integrations

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Queue position:** Run after the current recovery/completion Codex task reaches a committed checkpoint.
**Date:** 2026-06-18
**Primary workspace:** `One Time Mishnah Class` / Rabbi Elie Scheller
**Goal:** Make the next ramble or meeting reliably enter the correct workspace, become clean scoped tasks/decisions/calendar/content records, receive the correct automated and Agent Mode verification, and remain resumable until fully closed.

---

# 0. Execute; do not create another plan-only artifact

IMPLEMENT THIS FOLLOW-UP PROGRAM.

Do not merely:

- write another architecture document;
- create a backlog;
- create broad placeholder tasks;
- build a second ingestion pipeline;
- build a second task manager;
- build a second helper;
- create a disconnected agent system;
- mark the work complete because files, prompts, or task cards exist.

The finished system must be proven by safe end-to-end tests using test data.

If this Codex session cannot finish everything:

- commit all safe completed work;
- push the branch;
- update the active execution run;
- update `NEXT-SESSION.md`;
- identify the exact next requirement and command;
- return `PARTIAL — RESUME THE ACTIVE RUN`;
- do not restart in the next session.

---

# 1. Resume current work before modifying anything

The current recovery/completion run is still being implemented.

At startup:

1. Read:
   - `BNA-START-HERE.md`
   - `docs/BNA-RAMBLE-TO-DONE.md`
   - `ops/execution-runs/latest.json`
   - the active run's `SOURCE.md`
   - `REQUIREMENTS.md`
   - `requirements.json`
   - `BASELINE.md`
   - `STATUS.md`
   - `EVIDENCE.md`
   - `TEST-RESULTS.md`
   - `DEPLOYMENT.md`
   - `NEXT-SESSION.md`
   - `AGENTS.md`
   - `MEMORY.md`
   - `SYSTEM-STATE.md`
   - `TASKS.md`
   - relevant recent `tasks-pending/*.md`
   - recent `ops/agent-task-ledger.jsonl`
   - recent `ops/agent-changelog.md`

2. Inspect:
   - current `master`;
   - current working branch;
   - open branches/PRs;
   - current uncommitted changes;
   - current database migrations;
   - current canonical Operations runtime;
   - current Telegram bridge;
   - current Drive ingestion;
   - current task parser;
   - current agent-control implementation;
   - current One Time workspace implementation;
   - current integration code for email, video, meetings, webhooks, and calendars.

3. Do not overwrite or duplicate work from the current recovery task.

4. If the recovery task still has unblocked P0/P1 requirements:
   - preserve its progress;
   - continue from its checkpoint where this prompt overlaps;
   - do not create competing routes, tables, or UI;
   - begin this follow-up only after overlapping foundational work is stable.

5. Build one baseline report:

```text
ops/audits/2026-06-18-ramble-agent-integrations-baseline.md
```

For each requested area, classify:

```text
already_verified
partial
missing
conflicting
blocked_external
```

Include actual evidence, not task labels.

---

# 2. Import this request into the durable execution protocol

Do not create a parallel protocol.

Extend the active execution run with stable requirements.

Reuse any existing IDs created by the current recovery or Agent Control Center work. Suggested parent/child IDs:

```text
REQ-20260618-112  Agent Control Center and closed-loop verification
REQ-20260618-113  Ramble and meeting ingestion hardening
REQ-20260618-114  One Time workspace scoping, users, modules, and community
REQ-20260618-115  Vimeo integration
REQ-20260618-116  Zoom integration
REQ-20260618-117  Resend and email-domain integration
REQ-20260618-118  Integration readiness, credential Decisions, and health checks
REQ-20260618-119  End-to-end ingestion, scoping, agent, and integration verification
```

Add granular subrequirements and measurable acceptance criteria.

Do not close a requirement without:

- implementation evidence;
- focused tests;
- relevant UI/API evidence;
- live evidence where live behavior is required.

---

# 3. Ingest the newest meeting and recent rambles first

A new Rabbi Elie Scheller / One Time meeting has just entered the Google Drive ingestion pipeline.

Do not ask the operator for the filename unless no plausible recent source exists.

## 3.1 Discover recent sources

Inspect, in descending modified/created time:

- configured Drive raw-media intake;
- configured Drive transcribed/processed folders;
- live content jobs;
- exported transcript files;
- recent Telegram media/captures;
- recent meeting notes;
- recent One Time/Rabbi tasks and Decisions.

Search aliases:

```text
Rabbi Elie Scheller
Rabbi Scheller
Rabbi Sheller
One Time
One Time Mishnah Class
Mishnah
Mishna
Worldwide Mishnayos
```

Identify:

- newest meeting;
- related earlier meetings;
- duplicate exports of the same source;
- source recording URL/ID;
- transcript/content-job ID;
- source timestamp;
- ingestion status;
- workspace resolution.

## 3.2 Preserve source provenance

Every ingested source must retain:

- source provider;
- source file ID;
- source URL;
- source filename;
- recording date when known;
- upload date;
- transcript ID/version;
- content job ID;
- cryptographic or stable source fingerprint;
- speaker/participant hints;
- workspace;
- parser version;
- ingestion run ID.

Never rely only on title text for deduplication.

## 3.3 Parse the newest meeting

Parse into distinct destinations:

### Decisions

Human choices, authorization, ownership, permissions, pricing, launch choices, account access, and ambiguous routing.

### Tasks

Concrete actions with:

- title;
- owner;
- due date;
- dependency;
- urgency;
- next action;
- workspace;
- related integration;
- source provenance.

### Calendar

Meetings, checkpoints, due dates, setup sessions, rehearsals, launch milestones, and follow-ups.

### Content/Research

Only actual teaching material, Torah topics, class ideas, references, questions, source sheets, and publishable content.

### Community

Community planning, membership, group structure, announcements, or program organization—only when it genuinely belongs there.

### Integration records

Vimeo, Zoom, Resend, DNS, Stripe, YouTube, Meta, and other account/API requirements.

### Notes/history

Useful context that is neither actionable nor reusable teaching content.

Do not route private coordination meetings into reusable Content merely because a transcript exists.

## 3.4 Idempotency

Rerunning ingestion must not create duplicate:

- tasks;
- Decisions;
- calendar events;
- content items;
- integration records;
- agent runs.

Use deterministic keys derived from source fingerprint + extracted item type + normalized content.

Keep an ingestion report:

```text
ops/ingestion-runs/YYYY-MM-DD-<source-id>/
  SOURCE.md
  PARSE.json
  ROUTING.md
  CREATED-OR-UPDATED.json
  DUPLICATES.json
  UNRESOLVED.md
  VERIFICATION.md
```

---

# 4. Harden the ramble-to-record parser

Every future voice ramble, Telegram message, Drive recording, uploaded transcript, or meeting note must go through one canonical routing pipeline.

## 4.1 Canonical intake record

Create or reuse one intake/source record containing:

- raw source;
- source channel;
- actor;
- participants;
- received time;
- workspace candidate;
- related entity candidates;
- source fingerprint;
- parser status;
- confidence;
- provenance;
- processing attempts;
- final routing result.

Do not immediately dump every raw message into the visible task list.

## 4.2 Workspace resolution

Resolve workspace using:

1. explicit workspace/project identifier;
2. selected Telegram/chat workspace;
3. participant/member match;
4. known aliases;
5. recent conversation context;
6. source-folder mapping;
7. safe default only when confidence is high.

Specific rule:

- Rabbi Elie / Scheller / Sheller / One Time / Mishnah/Mishna program work routes to `One Time Mishnah Class`.
- It must not appear in BNA school, family, or unrelated service-provider workspaces.
- Ambiguous scope becomes one Decision, not a silent global/BNA default.

Store:

- resolved workspace;
- confidence;
- reasoning summary;
- alternatives considered;
- operator correction history.

## 4.3 Entity resolution

Resolve:

- people;
- workspace;
- students;
- providers;
- integrations;
- meetings;
- projects/programs;
- content sources.

Do not create duplicates from spelling, language, or transcription variants.

## 4.4 Confidence routing

Use clear thresholds:

### High confidence

Auto-route and record provenance.

### Medium confidence

Create the record in a reviewable draft state and create one concise Decision only when the ambiguity changes the outcome.

### Low confidence

Preserve raw intake and create one routing Decision. Do not create multiple visible tasks.

## 4.5 Visible titles

Visible titles must be:

- concise;
- actionable;
- normal human language;
- free of raw ramble phrasing;
- free of transcript garbage;
- free of agent/debug terminology.

Raw wording stays in provenance.

## 4.6 Parser output schema

Return structured output such as:

```json
{
  "workspace": {},
  "participants": [],
  "decisions": [],
  "tasks": [],
  "calendar_events": [],
  "content_items": [],
  "community_items": [],
  "integration_items": [],
  "notes": [],
  "unresolved": [],
  "deduplication_keys": []
}
```

Validate the schema before writes.

## 4.7 Retry and failure handling

- no infinite parser retries;
- preserve failed parse evidence;
- retry only transient failures;
- after the configured retry limit, create one Decision or technical blocker;
- do not expose retry noise in the normal task manager.

---

# 5. Closed agent loop

Implement or complete the Agent Control Center using the existing task system and active execution protocol.

Do not create another disconnected agent queue.

## 5.1 Required loop

```text
Ramble/source
→ structured requirements
→ implementation task/work package
→ Codex implementation
→ automated tests
→ verification plan
→ Playwright verification when deterministic UI checks apply
→ Agent Mode/Browser QA prompt when human browser judgment applies
→ agent progress reported to BNA
→ evidence submitted
→ agent run sealed
→ pass closes the verification gate
→ fail returns exact findings to Codex
→ blocker creates one Decision
→ durable resume state
```

## 5.2 Verification plan per work package

Store:

- implementation owner;
- verifier type;
- required automated checks;
- required browser checks;
- operator action;
- evidence required;
- completion gate.

Modes:

```text
automated
browser_agent
operator
mixed
```

Default user-visible work to `mixed`.

## 5.3 Agent Mode handoff

For browser/UI/external-account work:

- generate one task-specific Agent Mode prompt;
- display it on the task/Decision card;
- provide one Copy Prompt button;
- provide one Open ChatGPT button;
- include the exact Agent Run URL;
- require browser takeover for login;
- never include credentials in the prompt;
- batch related read-only checks where safe to reduce Agent Mode usage.

## 5.4 Agent Run page

Agent Mode must be able to:

- authenticate;
- claim the run;
- read exact scope;
- read acceptance criteria;
- post progress;
- add evidence;
- mark each criterion;
- submit pass/fail/blocked/needs-operator;
- seal the run.

The authoritative result must be stored in BNA, not only in the external chat.

## 5.5 Seal behavior

### Pass

Close only when implementation + automated gates + required browser/operator gates pass.

### Fail

- append exact findings to the same parent task;
- return it to Codex;
- create the next verification run after fixes;
- retain evidence/history.

### Blocked/needs operator

- create one Decision;
- show exact account/action;
- include a copy-ready prompt where useful;
- resume the same run after resolution.

Prevent infinite fix/verify loops through retry limits and operator escalation.

## 5.6 Agent output storage

Structured run state belongs in the application database/task system.

Optional report files may be mirrored to Drive, but Drive is not the source of truth for agent status.

---

# 6. One Time workspace scoping

Audit and complete the `One Time Mishnah Class` workspace.

## 6.1 Membership and roles

Target:

- Rabbi Elie Scheller: `owner`
- Shloimie Dratler: `admin`
- Codex/system: machine worker with scoped service permissions, not owner
- Browser QA/Agent Mode: limited verifier role, assigned per run
- other users: explicit workspace membership only

Enforce roles server-side.

Shloimie may also be super admin globally, but within One Time the workspace membership must be explicit.

## 6.2 Data isolation

Scope by workspace:

- tasks;
- task comments;
- Decisions;
- calendar;
- meetings;
- intake;
- content/research;
- community;
- members;
- integrations;
- automations;
- agent runs;
- helper memory/context;
- audit events;
- files/source mappings.

Add negative tests:

- BNA user cannot access One Time data without membership;
- One Time member cannot enumerate BNA/family data;
- Agent verifier cannot access another run/workspace;
- workspace change clears stale selections and helper context.

## 6.3 Modules

Audit and complete these modules where useful:

```text
Overview
Meeting Agenda
Decisions
Tasks
Calendar
Content / Research
Community
Members
Agents
Automations
Integrations
Settings
```

Owner/Admin should be able to configure optional module visibility.

Do not display empty or irrelevant modules by default.

## 6.4 Buttons and actions

Audit every One Time button:

- it must have a clear label;
- it must perform a real permitted action;
- it must be status-aware;
- it must be hidden/disabled when unauthorized;
- it must not expose developer/debug wording;
- it must not duplicate another action;
- destructive actions require confirmation;
- mobile controls must not overlap or wrap randomly.

Produce:

```text
ops/ui-audits/one-time-workspace-controls.md
```

Map:

- screen;
- button/control;
- role;
- action;
- API;
- current result;
- defect;
- fix;
- test.

## 6.5 Community

Create/reuse a One Time-specific community.

It must not default to BNA community data.

Support, as the current product requires:

- members;
- roles;
- modules/sections;
- program announcements;
- class groups;
- content/resources;
- moderation/admin controls;
- module visibility.

Use clear scoped permissions.

---

# 7. Vimeo integration

The operator has or will soon provide Vimeo account/app information.

Do not request or store secrets in chat, task notes, GitHub, logs, or screenshots.

## 7.1 Current-state audit

Inspect current Vimeo references, credentials, media code, and workflows.

Determine desired BNA/One Time use cases:

- account/library visibility;
- video metadata;
- upload;
- folders/showcases;
- privacy;
- embeds/playback;
- thumbnails;
- review/approval;
- webhooks/events where useful.

Do not implement unnecessary write capabilities.

## 7.2 Official current requirements

Before coding, verify the current Vimeo official developer documentation for:

- supported authentication model;
- app registration;
- required scopes;
- account/plan limitations;
- upload method;
- webhook/event support;
- rate limits.

Record links and date checked in:

```text
docs/integrations/VIMEO.md
```

Do not rely on stale remembered API behavior.

## 7.3 Secure configuration

Create/update `.env.example` placeholders only, such as names verified against the implementation:

```text
VIMEO_CLIENT_ID=
VIMEO_CLIENT_SECRET=
VIMEO_ACCESS_TOKEN=
VIMEO_ACCOUNT_ID=
VIMEO_WEBHOOK_SECRET=
```

Actual values must be supplied through local secret storage and Railway/environment secret management.

Never log values.

## 7.4 Adapter

Create one reusable Vimeo adapter with:

- configuration validation;
- health/readiness check;
- account identity check;
- least-privilege scopes;
- safe read operations;
- explicit confirmation for uploads or privacy changes;
- normalized errors;
- rate-limit handling;
- audit events;
- test doubles.

## 7.5 Integration UI

In One Time Integrations:

Show:

```text
Not configured
Needs owner action
Configured
Connected
Error
```

Show:

- connected account identity;
- permissions/scopes summary;
- last successful check;
- next action;
- owner-only Decision;
- Test Connection button that performs a safe read-only check.

Do not show secret values.

---

# 8. Zoom integration

The operator has or will soon provide Zoom account/app information.

## 8.1 Current-state audit

Determine required use cases:

- account/user identity;
- meeting schedule;
- participants/hosts;
- recording metadata;
- cloud recording ingestion;
- webinar/class use if applicable;
- webhooks;
- calendar linkage;
- live class records.

Do not create live meetings or alter account settings without confirmation.

## 8.2 Official current requirements

Verify the current official Zoom developer documentation for:

- supported app type for account-level server integrations;
- OAuth/account authorization;
- required scopes;
- webhook/event subscriptions;
- secret/signature verification;
- recording access;
- account-owner/admin requirements;
- rate limits.

Record links and date checked:

```text
docs/integrations/ZOOM.md
```

## 8.3 Secure configuration

Create/update verified placeholders, for example:

```text
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET=
```

Use actual names appropriate to the verified implementation.

No secrets in GitHub, chat, task comments, or screenshots.

## 8.4 Adapter

Create one Zoom adapter with:

- configuration validation;
- token acquisition/refresh as officially required;
- account identity check;
- safe meeting/recording reads;
- normalized pagination;
- webhook signature verification;
- event idempotency;
- rate-limit handling;
- audit events;
- test doubles.

## 8.5 Meeting/Drive ingestion

Where authorized:

- link Zoom meeting/recording IDs to BNA meeting records;
- prevent duplicate ingestion from Drive and Zoom;
- preserve original source;
- route One Time meetings to One Time;
- do not auto-publish recordings;
- require approval for external distribution.

---

# 9. Resend integration

Inspect current email implementation before creating anything.

The repo may already use Resend in one or more surfaces. Reuse and consolidate it.

## 9.1 Official current requirements

Verify current official Resend documentation for:

- API keys;
- domains;
- DNS verification;
- sender identities;
- webhooks;
- signature verification;
- suppression/bounce behavior;
- rate limits.

Record:

```text
docs/integrations/RESEND.md
```

## 9.2 Secure configuration

Use verified placeholders, such as:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_DOMAIN=
RESEND_WEBHOOK_SECRET=
```

Never expose values.

## 9.3 Adapter

Create one email adapter with:

- configuration validation;
- domain/sender readiness;
- safe health check;
- send operation with explicit permissions;
- templates;
- idempotency;
- bounce/suppression handling;
- webhook verification;
- audit events;
- test doubles.

## 9.4 Domain/DNS Decisions

When DNS or account-owner action is required:

- create one Decision;
- name the domain/account;
- show required record type/name/value through a secure operator view;
- identify who must perform it;
- provide exact verification action;
- resume integration check afterward.

Do not place sensitive tokens in ordinary task cards.

## 9.5 Safe test

Do not send live test email until explicitly approved.

The automated suite must use mocks/test doubles.

A later manual smoke may send only to an operator-approved address.

---

# 10. Integration readiness center

Create/reuse one Integrations module, scoped to workspace.

Each provider card:

- provider;
- workspace;
- state;
- connected account;
- required credentials by name, never value;
- owner action;
- scopes/capabilities;
- last health check;
- last error;
- webhooks;
- related Decision;
- Test Connection;
- audit history.

State model:

```text
not_configured
waiting_owner
configured
connected
degraded
error
disabled
```

Do not use Save/Test/Reset clusters without clear meaning.

Credential changes occur through documented secure environment/secret workflows, not ordinary browser forms unless a secure secret manager is deliberately implemented.

---

# 11. Operator credential handoff

Create:

```text
docs/integrations/OPERATOR-CREDENTIAL-HANDOFF.md
```

This must tell Shloimie exactly:

- which non-secret identifiers can be entered into Decisions;
- which secrets must go into local `.secrets` or Railway environment variables;
- exact variable names;
- how to add each value without sharing it in chat;
- which service requires owner/admin action;
- how to run safe readiness checks;
- how to restart/redeploy only when needed;
- how to revoke/rotate credentials;
- what must never be copied into GitHub.

Also generate clear Decisions for missing external actions.

Do not block unrelated implementation while waiting for credentials.

---

# 12. Task manager behavior for new ingestion

The task manager must not fill with hundreds of raw/old records.

Default scoped views:

```text
Meeting Agenda
Decisions
Next 30 Days
Waiting / Blocked
Recently Completed
```

Rules:

- raw intake is not a normal visible task;
- Decisions show actual human choices only;
- Next 30 Days shows open actionable tasks only;
- Recently Completed defaults to seven days;
- old done/superseded/duplicate records are archived/searchable;
- technical agent logs remain in Activity/Agents, not normal human tasks;
- counts are scoped and actionable;
- meeting sources link to extracted tasks/Decisions/events;
- no raw transcript titles.

Apply these rules specifically to the newly ingested Rabbi meeting.

---

# 13. Calendar and meeting timeline

For the newest meeting and extracted actions:

- create/update internal One Time calendar events;
- link event ↔ task ↔ meeting ↔ source;
- use Asia/Jerusalem time zone;
- add owner/participants;
- prevent duplicates;
- show next checkpoint;
- share the same workspace event data with authorized members;
- do not claim external Google/Zoom calendar sync works until verified.

If external sync is not configured, internal calendar remains canonical and integration state shows the exact missing step.

---

# 14. Testing

## 14.1 Ingestion tests

- newest source discovery;
- alias-based One Time routing;
- ambiguous workspace Decision;
- deterministic source fingerprint;
- parser schema validation;
- idempotent rerun;
- duplicate prevention;
- content vs task vs Decision vs calendar routing;
- source provenance;
- failed parse handling.

## 14.2 Workspace/RBAC tests

- Rabbi owner;
- Shloimie admin;
- verifier limited per run;
- cross-workspace denial;
- cross-run denial;
- scoped integration records;
- scoped community;
- stale context reset.

## 14.3 Agent loop tests

- create verification plan;
- generate prompt;
- claim run;
- progress;
- evidence;
- pass seal;
- fail returns to Codex;
- blocker creates one Decision;
- retry limit;
- durable resume;
- no secret in rendered prompt.

## 14.4 Vimeo tests

Using mocks:

- missing config;
- identity health check;
- pagination;
- error normalization;
- rate limit;
- upload requires explicit permission;
- no secret logs.

## 14.5 Zoom tests

Using mocks:

- token/auth flow;
- identity;
- meetings/recordings reads;
- webhook signature;
- event idempotency;
- Drive/Zoom duplicate prevention;
- no secret logs.

## 14.6 Resend tests

Using mocks:

- missing config;
- domain/sender readiness;
- send idempotency;
- webhook signature;
- bounce/suppression state;
- permission/confirmation;
- no secret logs.

## 14.7 Playwright

At:

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Verify:

- newest meeting appears only in One Time;
- extracted Decisions/tasks/calendar are linked;
- task default views remain concise;
- Agents menu/run flow;
- Integrations cards;
- Members and roles;
- Community scope;
- module buttons;
- no overflow/overlap/clipping;
- no duplicate helper;
- clear loading/empty/error states.

## 14.8 Safe end-to-end test

Use test data:

1. ingest a synthetic One Time meeting;
2. parse it;
3. verify scoped records;
4. rerun and prove no duplicates;
5. implement/mark a test task;
6. create verification plan;
7. simulate Browser QA;
8. seal pass;
9. simulate fail and requeue;
10. simulate owner credential blocker and create Decision;
11. configure mocked Vimeo/Zoom/Resend;
12. run readiness checks;
13. clean up test data.

---

# 15. Efficiency and non-conflict rules

- Do not run watch loops.
- Do not start a second full UI baseline crawl.
- Do not repeatedly inspect unchanged files.
- Do not redo closed current-recovery requirements.
- Do not create a parallel Agent Control Center.
- Do not create a parallel integration registry.
- Do not create one task per raw sentence.
- Do not retry unavailable credentials repeatedly.
- Use focused tests during implementation.
- Run one complete final local gate.
- Do not deploy repeatedly.
- Do not deploy or mutate production data without explicit approval.

---

# 16. Verification and evidence

Run applicable checks:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
node --check scripts/bna-execution-run.mjs
npm test
npm run bna:run:validate
```

Run all new targeted tests and Playwright acceptance tests.

Update:

- active `requirements.json`;
- `STATUS.md`;
- `EVIDENCE.md`;
- `TEST-RESULTS.md`;
- `NEXT-SESSION.md`;
- agent ledger;
- changelog;
- system state;
- durable memory where rules changed.

---

# 17. Deployment gate

Finish local implementation and mocked/safe verification first.

Before production deployment, report:

- exact branch/HEAD;
- commits;
- migrations;
- required environment variable names;
- operator credential actions;
- tests;
- rollback plan;
- affected live routes;
- whether a DB backup is required.

Request one explicit approval.

After approval:

- deploy once;
- apply idempotent migrations;
- add secrets through the approved environment workflow;
- run safe readiness checks;
- restart only required services;
- run targeted live smoke;
- record deployment ID and evidence.

Do not paste secrets into the final report.

---

# 18. Required first checkpoint

Before broad implementation becomes lengthy, report:

1. newest meeting/source discovered;
2. One Time routing result;
3. records created/updated/avoided as duplicates;
4. unresolved Decisions;
5. current agent-loop status;
6. current One Time membership/module status;
7. current Vimeo/Zoom/Resend code status;
8. exact secure credential inputs still needed;
9. next implementation batch.

Then continue unless blocked.

---

# 19. Final response

Report:

1. recovery-run relationship;
2. branch and HEAD;
3. commits;
4. newest meeting ingestion result;
5. meetings/rambles processed;
6. task/Decision/calendar/content/community records;
7. duplicate prevention evidence;
8. One Time members/roles;
9. modules/buttons/community audit;
10. agent-loop implementation status;
11. Vimeo status;
12. Zoom status;
13. Resend status;
14. required operator credential actions;
15. tests and results;
16. Playwright evidence;
17. migrations;
18. remaining requirement IDs;
19. blockers;
20. deployment readiness;
21. exact next operator action;
22. verdict:
   - COMPLETE LOCALLY — CREDENTIALS/RELEASE APPROVAL REQUIRED
   - PARTIAL — RESUME THE ACTIVE RUN
   - BLOCKED — EXTERNAL ACTION REQUIRED

Do not return COMPLETE while any non-blocked required requirement remains open.
