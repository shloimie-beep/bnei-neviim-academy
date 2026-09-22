# BNA Universal Agentic Goal Memory + Watchdog Hardening Prompt
Date: 2026-06-17
Repository: `shloimie-beep/bnei-neviim-academy`

Use this in Codex **Goal Mode**. This is not a feature request. This is a system hardening task that must make every future ramble, upload, recording, helper message, Drive intake item, class transcript, and Codex prompt flow into one durable agentic memory / goal / watchdog system.

---

## Mission

Shloimie communicates naturally through rambles. A ramble may include product goals, UI corrections, tasks, decisions, class content, student questions, parent notes, service-provider ideas, billing notes, uploaded-class context, integration setup, and complaints about work that was previously missed.

The system must not ask Shloimie to become structured. The system must structure the input.

The end state:

```text
Any natural-language input anywhere
→ raw intake event
→ structured parse
→ goals / requirements / tasks / decisions / questions / memory / class notes / student info / research / content / communications / accounting / contacts
→ scoped storage
→ active implementation queue
→ watchdog checks
→ verified completion
→ drift monitoring
→ automatic repair tasks when standing goals are violated
```

This must apply across:

```text
Telegram
Drive upload folders
class recordings
raw media intake
website BNA helper
Operations BNA helper
Codex chat / manual prompts
email / WhatsApp / WAPI intake
contact imports
content uploads
calendar/classroom input
service-provider classrooms
parent/student/provider portal activity
```

This is the full-agent-memory layer for the whole repo.

---

## Critical non-negotiables

1. Do not start more UI/product feature work until this hardening layer is installed.
2. Do not silently drop any raw input.
3. Do not turn every ramble into only a task. A ramble may become goals, guardrails, class records, student records, research, communications, contacts, accounting, content, or tasks.
4. Do not mark anything done without item-by-item evidence.
5. Do not commit secrets, API keys, private parent/student data, private contact exports, or private message bodies into public repo files.
6. Use safe placeholders/sample fixtures for tests.
7. If a live credential, Railway deploy, GitHub branch rule, or external connector is unavailable, create the implementation and mark only that live step as blocked.
8. Keep Kimi fallback-only where OpenAI is primary.
9. Preserve the BNA source-of-truth hierarchy.
10. If existing code conflicts with this prompt, this prompt is the target behavior.

---

## Phase 0 — Git state and current reality

Before editing:

```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Then inspect:

```text
AGENTS.md
MEMORY.md
SYSTEM-STATE.md
TASKS.md
package.json
server.js
scripts/telegram-kimi-bridge.mjs
scripts/agent-fleet-supervisor.mjs
public/operations.html
tools/screenshot-check.js
tasks-pending/
ops/
memory/
content-memory/
```

If the previous Ramble Protocol / Raw Input Queue work exists only locally, preserve it and extend it. If it is missing from `master`, install it now.

Do not overwrite recent local work. Merge carefully.

---

## Phase 1 — Install permanent source-of-truth files

Create or update these files:

```text
QUALITY-GOALS.md
GOAL-MODE.md
AGENTIC-MEMORY.md
memory-topics/README.md
memory-topics/ui-quality-goals.md
memory-topics/ramble-protocol.md
memory-topics/workspace-model.md
memory-topics/content-research-parser.md
memory-topics/communications-intake.md
memory-topics/service-provider-classrooms.md
memory-topics/rabbi-scheller-onetime.md
raw-input/README.md
ops/action-registry.json
ops/route-registry.json
ops/goal-ledger.jsonl
ops/watchdog-audits/README.md
ops/goal-audits/README.md
```

### `QUALITY-GOALS.md`

This is the permanent standing-goals contract.

It must include at least these standing goals:

```text
GOAL-CORE-001 — Million-dollar app polish
GOAL-CORE-002 — Every visible button/action works or is intentionally disabled/coming soon
GOAL-CORE-003 — Every link/route works and goes to the correct place
GOAL-CORE-004 — Mobile layout is clean, usable, and no horizontal overflow
GOAL-CORE-005 — Headers, footers, sidebars, and top bars are consistent
GOAL-CORE-006 — No private parent/student/provider data leaks to public or wrong workspace
GOAL-CORE-007 — Raw intake is never lost
GOAL-CORE-008 — Natural language input is parsed into all relevant lanes, not only tasks
GOAL-CORE-009 — Workspace scoping is preserved across content, communications, tasks, roles, prompts, and portals
GOAL-CORE-010 — BNA Helper is a real action surface, not decoration
GOAL-CORE-011 — Uploaded classes produce class notes, student questions, research, tasks, and student/accountability records when present
GOAL-CORE-012 — Research topics and sources remain findable
GOAL-CORE-013 — Communications produce alerts when important
GOAL-CORE-014 — Service-provider/classroom/community configuration remains coherent
GOAL-CORE-015 — Evidence before done
```

Each goal must include:

```text
ID
Title
Plain-English goal
Why it matters
Scope
Affected surfaces
Invariants
Watchdog checks
Evidence required
Failure behavior
Repair-task template
```

Example invariant:

```text
A visible button must have one of:
- working handler
- working route
- disabled state with reason
- coming-soon state with reason
- registered helper action
```

Example failure behavior:

```text
If violated, create a watchdog-sourced task/requirement with route, selector, screenshot path, expected behavior, and repair instructions.
```

### `GOAL-MODE.md`

This file defines how agents must work.

Include:

```text
1. Read relevant goals before coding.
2. Identify which goals the task could affect.
3. Update registries when adding UI/actions/routes.
4. Run required watchdog checks.
5. Do not mark done if a standing goal regressed.
6. If a task is too large, still preserve every item as IDs and work through them in batches.
7. If blocked, create a precise blocked item instead of dropping the work.
```

### `AGENTIC-MEMORY.md`

Define the memory architecture:

```text
Raw input
Parsed facts/items
Goal candidates
Accepted goals
Workspace/project/student/provider-scoped memory
Tasks/requirements
Watchdog evidence
Changelog/ledger
```

Explain that `MEMORY.md` remains curated; `memory-topics/*` holds topic-specific memory; raw intake and registers preserve full provenance.

---

## Phase 2 — Strengthen `AGENTS.md`

Replace the lightweight ramble rules with a full system-wide protocol.

Add these sections:

```md
## Universal Natural Language Intake Protocol

## Agentic Goal Memory

## Raw Input Queue

## Goal Promotion Rules

## Goal Maintenance / Watchdog Rules

## Action Registry Requirement

## Route Registry Requirement

## Privacy and Workspace-Scope Invariants

## Definition of Done

## Stale Document Warning
```

### Required language for `AGENTS.md`

Use this substance:

```text
The operator's natural input may be long, multi-topic, repeated, emotional, or unordered. This is normal. Do not ask the operator to restructure. Preserve it first, then structure it.

Every natural-language input from Telegram, Drive, recordings, website helper, Operations helper, Codex chat, email, WhatsApp/WAPI, contact imports, or manual admin upload must create or link to a raw input record.

A raw input can create multiple outputs:
- standing goals
- goal candidates
- requirements
- tasks
- decisions
- open questions
- durable memory
- class notes
- student questions
- student observations
- research topics
- content items
- communication alerts
- contact records
- accounting records
- integration setup items
- service-provider/classroom configuration
```

Stable IDs:

```text
RAW-YYYYMMDD-###
GOAL-YYYYMMDD-###
REQ-YYYYMMDD-###
TASK-YYYYMMDD-###
DEC-YYYYMMDD-###
Q-YYYYMMDD-###
MEM-YYYYMMDD-###
CLASS-YYYYMMDD-###
STUQ-YYYYMMDD-###
STUNOTE-YYYYMMDD-###
RESEARCH-YYYYMMDD-###
COMM-YYYYMMDD-###
CONTACT-YYYYMMDD-###
ACCT-YYYYMMDD-###
WATCH-YYYYMMDD-###
```

Definition of done:

```text
An item is done only if:
1. It has an ID.
2. The relevant files/routes/components/workflows were inspected.
3. The implementation matches the expected result.
4. Relevant standing goals still pass.
5. Watchdog checks were run or blockers are documented.
6. Evidence is written to the register/ledger/changelog.
7. The final response lists status by ID.
```

---

## Phase 3 — Database migrations for durable goal memory

Create migration(s), following existing Railway/Postgres style:

```text
railway-migration-2026-06-17-agentic-goal-memory.sql
```

Add tables if not already present:

### `bna_raw_intake`

Canonical raw event table.

Fields:

```sql
id uuid primary key default gen_random_uuid(),
stable_id text unique not null,
source_channel text not null,
source_message_id text,
source_user text,
workspace_id text,
workspace_type text,
project_key text,
raw_text text,
transcript_text text,
media_url text,
file_id text,
file_name text,
intake_type text default 'general',
parse_status text not null default 'raw',
parsed_payload jsonb default '{}'::jsonb,
created_goal_ids text[] default '{}',
created_requirement_ids text[] default '{}',
created_task_ids text[] default '{}',
created_decision_ids text[] default '{}',
created_question_ids text[] default '{}',
created_memory_ids text[] default '{}',
created_class_ids text[] default '{}',
created_student_question_ids text[] default '{}',
created_research_ids text[] default '{}',
created_communication_ids text[] default '{}',
requirement_register_path text,
metadata jsonb default '{}'::jsonb,
error text,
created_at timestamptz default now(),
updated_at timestamptz default now(),
parsed_at timestamptz,
archived_at timestamptz
```

### `bna_goal_memory`

Stores durable goals and candidate goals.

Fields:

```sql
id uuid primary key default gen_random_uuid(),
stable_id text unique not null,
title text not null,
goal_text text not null,
goal_type text not null default 'product',
scope_type text not null default 'global',
scope_id text,
status text not null default 'candidate',
priority text not null default 'normal',
source_raw_id text,
source_quote text,
accepted_by text,
accepted_at timestamptz,
superseded_by text,
invariants jsonb default '[]'::jsonb,
watchdog_checks jsonb default '[]'::jsonb,
evidence_required jsonb default '[]'::jsonb,
metadata jsonb default '{}'::jsonb,
created_at timestamptz default now(),
updated_at timestamptz default now()
```

Allowed statuses:

```text
candidate
accepted
active
needs_decision
superseded
rejected
archived
```

### `bna_goal_links`

Links goals to files/routes/components/workspaces/tasks/content/class records.

```sql
id uuid primary key default gen_random_uuid(),
goal_id text not null,
linked_type text not null,
linked_id text not null,
relationship text not null,
metadata jsonb default '{}'::jsonb,
created_at timestamptz default now()
```

### `bna_goal_check_results`

Stores watchdog results.

```sql
id uuid primary key default gen_random_uuid(),
stable_id text unique not null,
goal_id text,
check_name text not null,
target_type text,
target_id text,
status text not null,
severity text not null default 'normal',
summary text,
evidence_path text,
screenshot_path text,
created_task_id text,
metadata jsonb default '{}'::jsonb,
created_at timestamptz default now()
```

### `bna_agent_events`

General telemetry / audit event trail.

```sql
id uuid primary key default gen_random_uuid(),
stable_id text unique not null,
event_type text not null,
source text not null,
raw_id text,
goal_id text,
requirement_id text,
task_id text,
workspace_id text,
summary text,
payload jsonb default '{}'::jsonb,
created_at timestamptz default now()
```

If `gen_random_uuid()` is not available in this project, use the existing UUID convention.

Add indexes for stable IDs, status, workspace, source, created_at, goal links, and check status.

---

## Phase 4 — Shared parser schema and parser hardening

Create or update:

```text
src/lib/bna/intake-schema.js
src/lib/bna/intake-parser.js
src/lib/bna/goal-memory.js
src/lib/bna/goal-registry.js
src/lib/bna/ramble-protocol.js
```

Use CommonJS or ESM consistently with the live runtime.

### Parser output schema

The parser must return this shape:

```js
{
  raw_id: "RAW-YYYYMMDD-###",
  source_channel: "telegram|drive|class_recording|website_helper|operations_helper|codex_chat|email|whatsapp|wapi|manual|other",
  parse_status: "parsed|needs_review|failed",
  confidence: 0.0,
  summary: "",
  goals: [],
  requirements: [],
  tasks: [],
  decisions: [],
  open_questions: [],
  memory_candidates: [],
  class_notes: [],
  student_questions: [],
  student_observations: [],
  research_items: [],
  content_items: [],
  communications: [],
  contacts: [],
  accounting_items: [],
  integration_items: [],
  service_provider_items: [],
  workspace_routing: [],
  alerts: [],
  errors: []
}
```

Every item in every array must include:

```js
{
  stable_id: "",
  title: "",
  source_quote: "",
  summary: "",
  scope_type: "global|workspace|project|student|provider|family|route|component|integration|content|communication",
  scope_id: null,
  target_lane: "",
  confidence: 0.0,
  needs_review: false,
  done_definition: "",
  verification: "",
  related_goal_ids: [],
  related_raw_id: ""
}
```

### Parser rules

1. A single sentence can create multiple item types.
2. Do not collapse class content into tasks.
3. Do not collapse student questions into content only.
4. Do not expose private student or parent details publicly.
5. Parent/student notes are non-clinical coaching/support observations, not diagnosis.
6. Service-provider ideas may become provider goals, classroom config, billing tasks, or public-site requirements.
7. Complaints such as “I asked for this already” should create regression/failed-follow-through items.
8. If ambiguous, preserve and mark `needs_review`, do not discard.
9. If a goal affects future behavior, create a goal candidate.
10. If a goal is accepted or repeated, promote it to `active`.

---

## Phase 5 — Goal promotion workflow

Implement functions:

```js
captureRawInput(input)
parseRawInput(rawRecord)
promoteGoalCandidate(candidate)
linkGoalToArtifact(goalId, artifact)
retrieveRelevantGoals(context)
assertGoalCoverage(taskOrRequirement)
recordGoalCheckResult(result)
createWatchdogRepairTask(finding)
```

### Goal candidate rules

Create a goal candidate when Shloimie says things like:

```text
My goal is...
I want this to always...
This should never happen...
Every time...
Anytime we...
The app should...
The system needs to...
All buttons should...
Everything should...
```

Promote candidate goals automatically only if:

```text
- repeated in multiple inputs, or
- explicitly phrased as a durable rule/goal, or
- already consistent with QUALITY-GOALS.md, or
- safety/security/privacy related
```

Otherwise mark `needs_decision`.

### Relevant goal retrieval

Before implementing any task, retrieve goals by:

```text
workspace
project
route
component
input source
item type
student/provider/family scope
content/research/classroom scope
keywords
linked prior tasks
```

Then list “Affected standing goals” in the implementation plan.

---

## Phase 6 — Action Registry

Create or update:

```text
ops/action-registry.json
scripts/watchdog-action-audit.mjs
```

Every visible UI action must be registered:

```json
{
  "action_id": "ACTION-...",
  "label": "Save Settings",
  "surface": "operations",
  "route": "/operations?view=settings",
  "selector_hint": "button text or data-action",
  "expected_behavior": "Saves settings or shows coming-soon/disabled reason",
  "permission": "workspace_admin|super_admin|parent|student|provider",
  "status": "active|disabled|coming_soon|deprecated",
  "test": {
    "type": "click|route|api|helper_command",
    "expected_result": ""
  },
  "related_goal_ids": ["GOAL-CORE-002"]
}
```

Audit must fail or create repair tasks for:

```text
visible enabled buttons without registry entry
registry actions not visible anymore
buttons with no click handler/link/form action
buttons that throw JS errors
buttons hidden or unusable on mobile
duplicate helper bubbles
disabled buttons without reason
coming-soon buttons without label/reason
```

---

## Phase 7 — Route Registry and security route audit

Create or update:

```text
ops/route-registry.json
scripts/watchdog-link-audit.mjs
scripts/watchdog-security-routes.mjs
```

Each route must declare:

```json
{
  "route": "/parent",
  "surface": "parent_portal",
  "access": "private",
  "required_role": "parent",
  "workspace_scope_required": true,
  "public_allowed": false,
  "expected_logged_out_behavior": "redirect_to_login",
  "expected_logged_in_behavior": "own_parent_dashboard_only",
  "privacy_risk": "high",
  "related_goal_ids": ["GOAL-CORE-006"]
}
```

Audit must test:

```text
public routes load
private routes redirect when logged out
parent routes do not leak another parent
student routes do not leak another student
provider routes do not leak another provider/workspace
super admin routes require super admin
portal links from public site go to login/marketing entry, not private data
old/stale routes redirect safely
```

---

## Phase 8 — UI and visual watchdogs

Create or update:

```text
scripts/watchdog-ui-smoke.mjs
scripts/watchdog-visual-baseline.mjs
tools/screenshot-check.js
ops/visual-baselines/
ops/watchdog-audits/
```

Watchdog must cover at least:

```text
/
 /parent/login
 /parent
 /operations
 /operations?view=dashboard&section=overview&workspace=platform
 /operations?view=tasks&section=activity&workspace=platform
 /operations?view=settings&section=calendar_classroom&workspace=bna
 /operations?view=settings&section=provider_index_core&workspace=bna
 /operations?view=communications&section=overview&workspace=platform
 /operations?view=communications&section=email&workspace=platform
```

Viewports:

```text
390x844 mobile
768x1024 tablet
1440x900 desktop
```

Checks:

```text
page loads
no horizontal overflow
no duplicate BNA Helper
visible nav/header
clickable nav links
major buttons usable
no obvious light/illegible text using basic contrast heuristic
top bars not overly tall
no giant unexplained cards on compact pages
mobile filters/tabs do not overflow
console errors captured
screenshots saved
```

Do not overfit fragile screenshot thresholds initially. Start with structural checks, screenshots, and obvious regressions.

---

## Phase 9 — Raw-intake drift watchdog

Create:

```text
scripts/watchdog-raw-intake-drift.mjs
```

It must detect:

```text
raw intake older than threshold and still raw/unparsed
parse failures without review tasks
uploaded class recordings with no class notes
uploaded class recordings with no research/student-question extraction when transcript contains questions
Telegram voice/video without raw record
Drive files in raw media intake without raw record
communications with important inbound signals but no alert/follow-up
content jobs with wrong workspace
tasks/requirements without linked raw source
goal candidates not reviewed/promoted/rejected
```

It must write:

```text
ops/watchdog-audits/YYYY-MM-DD-raw-intake-drift.md
```

And create watchdog repair tasks or requirements when safe.

---

## Phase 10 — Content/class/research parser watchdog

Create:

```text
scripts/watchdog-content-routing.mjs
```

It must audit:

```text
Content jobs
Transcript exports
Class notes
Student questions
Research items
Student/accountability notes
Parent coaching notes
Workspace/project routing
BNA vs OneTime/Rabbi content separation
```

Findings should include:

```text
unrouted class transcript
student question not visible in student portal
research item missing source/class link
content in wrong workspace
private student/accountability content exposed in public content
tasks hidden in content instead of Tasks
class topic hidden in Tasks instead of Content/Research
```

---

## Phase 11 — Communications parser/watchdog

Create:

```text
scripts/watchdog-communications-alerts.mjs
```

Audit:

```text
inbound parent/accountability emails
WhatsApp/WAPI inbound messages
outbound portal reset/access emails
link clicks/open events if tracked
form submissions
payment exceptions
provider messages
student messages
```

High-priority events should create alerts/follow-up:

```text
parent sends detailed child information
inbound message has urgency/frustration/problem
portal link clicked but parent not onboarded
payment issue
failed email
new service-provider interest
new parent form
```

Do not commit private message bodies in audit files. Store redacted summaries.

---

## Phase 12 — GitHub Actions quality gate

Create:

```text
.github/workflows/bna-quality-gate.yml
```

Jobs:

```text
syntax
tests
watchdog-ui
watchdog-links
watchdog-actions
watchdog-security-routes
watchdog-raw-intake-drift
watchdog-content-routing
```

Basic job commands:

```bash
npm install
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run watchdog:audit
npm run watchdog:ui
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
```

If full UI smoke requires live app/env, provide a local-server mode:

```bash
npm start &
node scripts/wait-for-local-server.mjs http://localhost:8080/api/health
npm run watchdog:ui -- --base-url=http://localhost:8080
```

If external credentials are unavailable in CI, checks must run in safe “no secrets” mode and verify that missing integrations show proper disabled/coming-soon states.

Add instructions in:

```text
docs/github-branch-protection.md
```

Recommend requiring these checks before merging to `master`:

```text
syntax
tests
watchdog-audit
watchdog-links
watchdog-actions
watchdog-security-routes
```

If you cannot configure branch protection from Codex, document exact manual steps.

---

## Phase 13 — Package scripts

Update `package.json`:

```json
{
  "watchdog:audit": "node scripts/watchdog-goal-audit.mjs",
  "watchdog:ui": "node scripts/watchdog-ui-smoke.mjs",
  "watchdog:links": "node scripts/watchdog-link-audit.mjs",
  "watchdog:actions": "node scripts/watchdog-action-audit.mjs",
  "watchdog:security": "node scripts/watchdog-security-routes.mjs",
  "watchdog:raw": "node scripts/watchdog-raw-intake-drift.mjs",
  "watchdog:content": "node scripts/watchdog-content-routing.mjs",
  "watchdog:communications": "node scripts/watchdog-communications-alerts.mjs",
  "watchdog:visual": "node scripts/watchdog-visual-baseline.mjs",
  "watchdog:all": "npm run watchdog:audit && npm run watchdog:links && npm run watchdog:actions && npm run watchdog:security && npm run watchdog:raw && npm run watchdog:content && npm run watchdog:communications"
}
```

Do not break existing scripts.

---

## Phase 14 — Agent fleet integration

Update:

```text
scripts/agent-fleet-supervisor.mjs
AGENTS.md
SYSTEM-STATE.md
TASKS.md
```

Agent-fleet verifier must include relevant watchdogs before marking work done.

Minimum verifier commands:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run watchdog:audit
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
```

For UI changes, add:

```bash
npm run watchdog:ui
npm run watchdog:visual
```

If watchdog fails, the fleet must:

```text
not mark task done
write failure report
create repair task if applicable
notify Telegram/Operations
leave item in review/failed/needs_decision instead of done
```

---

## Phase 15 — Helper integration

Update helper behavior so BNA Helper / workspace helper is a first-class natural-language intake/action surface.

Helper input must:

```text
create raw intake
parse structured output
retrieve relevant active goals
execute registered actions when safe
create tickets/requirements when unsupported
confirm raw ID, created item counts, and next action
```

Helper actions must link to action registry.

Helper must never be just decorative.

Helper must not duplicate on the page.

---

## Phase 16 — Drive/class recording integration

Drive uploads and class recordings must use the same raw intake protocol.

For every Drive/raw media/class recording:

```text
create RAW record
transcribe if needed
parse into:
- class notes
- class topics
- student questions
- student observations
- research items
- content ideas
- tasks
- parent/student/accountability notes
- service-provider/classroom notes
- goals/guardrails
route by workspace/project
link back to raw file and transcript
surface alerts/follow-ups
```

Add tests/fixtures using safe sample text.

---

## Phase 17 — Parser tests/evals

Create tests:

```text
tests/intake-parser-goals.test.js
tests/intake-parser-class-recording.test.js
tests/intake-parser-student-questions.test.js
tests/intake-parser-communications.test.js
tests/watchdog-action-registry.test.js
tests/watchdog-route-security.test.js
```

Use safe fixtures.

Test cases:

1. Ramble with UI goal + task + decision.
2. Class recording with source learned + boy question + teacher task.
3. Parent message with child support concern + follow-up.
4. Service-provider classroom idea + pricing note.
5. Complaint that previous work was missed -> regression task.
6. Button added without action registry -> watchdog failure.
7. Public parent route logged out -> redirect expected.
8. Content with wrong workspace -> watchdog finding.

---

## Phase 18 — Observability and audit trail

Every major event must append to `ops/goal-ledger.jsonl` and/or `bna_agent_events`.

Events:

```text
raw_created
raw_parsed
goal_candidate_created
goal_promoted
requirement_created
task_created
watchdog_check_started
watchdog_check_passed
watchdog_check_failed
repair_task_created
deployment_verified
item_done_verified
```

Do not put secrets/private content in logs. Redact.

---

## Phase 19 — Automatic repair loop

When a watchdog finds a violation:

```text
Create WATCH-YYYYMMDD-### finding
Create REQ/TASK if actionable
Attach:
- route/component
- goal violated
- screenshot/evidence path
- reproduction steps
- expected behavior
- severity
- suggested fix
```

Severity:

```text
critical — private data leak, auth failure, broken production route
high — button/link/action broken, mobile unusable, parser losing raw input
normal — visual polish/layout issue
low — copy/help text issue
```

Critical/high issues should appear in Operations “Needs Attention.”

---

## Phase 20 — Backfill and migration audit

Create audit reports:

```text
ops/goal-audits/2026-06-17-goal-memory-install-audit.md
ops/watchdog-audits/2026-06-17-watchdog-install-audit.md
ops/raw-intake-audits/2026-06-17-raw-intake-backfill-plan.md
```

Backfill plan should identify:

```text
existing daily memory rambles
existing tasks-pending
existing content transcripts
existing content jobs
existing Drive intake records if accessible
existing communications records
existing operations tasks
```

For each source:

```text
source path/table
what it contains
whether it needs raw records
whether it needs goal candidates
whether it needs parse/reparse
safe next action
```

Do not mass-rewrite private data into repo. Use summaries.

---

## Phase 21 — Verification commands

Run:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
node --check scripts/watchdog-goal-audit.mjs
node --check scripts/watchdog-link-audit.mjs
node --check scripts/watchdog-action-audit.mjs
node --check scripts/watchdog-security-routes.mjs
node --check scripts/watchdog-raw-intake-drift.mjs
node --check scripts/watchdog-content-routing.mjs
node --check scripts/watchdog-communications-alerts.mjs
npm test
npm run watchdog:audit
npm run watchdog:links
npm run watchdog:actions
npm run watchdog:security
npm run watchdog:raw
npm run watchdog:content
npm run watchdog:communications
```

If UI smoke is feasible:

```bash
npm run watchdog:ui
npm run watchdog:visual
```

If live env is available:

```bash
npm run openai:smoke
npm run railway:doctor
```

If not, document blockers exactly.

---

## Phase 22 — Commit and report

Commit all changes.

Final Codex response must include:

```text
## Summary

## Git status
- branch
- commit
- clean worktree yes/no

## Source-of-truth files installed

## Database migrations

## New parser/goal-memory modules

## New watchdog scripts

## Package scripts

## GitHub Actions quality gate

## Agent fleet integration

## Helper/Telegram/Drive/class-intake integration status

## Backfill/audit reports

## Verification results

## Requirement/goal status table
ID | Status | Evidence | Files changed | Verification | Remaining issue

## Blockers
Only list actual blockers, not skipped work.

## Next live-smoke checklist
```

Do not say “ready” unless:

```text
- AGENTS.md has the universal protocol
- QUALITY-GOALS.md exists
- GOAL-MODE.md exists
- raw intake queue exists or migration is ready
- parser schema exists
- action/route registries exist
- watchdog scripts exist
- package scripts exist
- tests pass or blockers documented
- agent fleet is wired to run watchdogs
```

---

## Final outcome expected

After this task, Shloimie can ramble anywhere, including Telegram, Drive/class recordings, website helper, Operations helper, or Codex chat.

The system will:

```text
capture raw
parse across all lanes
create/promote goals
maintain those goals across future work
detect broken UI/actions/routes/privacy/parser drift
create repair tasks automatically
prevent “done” without evidence
```

That is the whole point of this hardening task.
