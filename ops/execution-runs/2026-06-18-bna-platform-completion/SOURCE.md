# Source

Run ID: `2026-06-18-bna-platform-completion`

Recovery branch: `codex/2026-06-18-bna-platform-completion`
Current HEAD at source repair: `9ab3f06`
Base branch: local `master` at `484563b`.

PR context inspected:

- PR #2: https://github.com/shloimie-beep/bnei-neviim-academy/pull/2, commit `b8baede8c043dcf70799fe6ef2b0b76efa421a73`, incorporated here as `31fada4`.
- PR #3: https://github.com/shloimie-beep/bnei-neviim-academy/pull/3, commit `e4c062f370409978325b291129b8380764aa3716`, incorporated here as `9ab3f06`.

Audit-package status:

- Audit harness exists from PR #2 and was not rebuilt.
- No `.runtime/auth/operations-storage-state.json` exists in this clean recovery worktree.
- No `ops/ui-audits/` run folder or `agent-review-package.zip` exists in this clean recovery worktree.
- Only audit-package-specific and post-fix visual comparison requirements remain blocked on missing audit output. Backend, routing, PWA, helper, parser, schema, tests, public copy, and known UI requirements are not globally blocked by the audit package.

Transcription noise exclusions and product decisions are preserved in the complete authoritative source below.

---

# Complete Authoritative June 18 Source

# BNA One-Shot Codex Completion Prompt v3

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Target base branch:** `master`
**Purpose:** Resume current Codex work, finish the incomplete June 18 BNA remediation program, install a durable ramble-to-completion protocol in the repository, avoid unnecessary agent/test loops, and prove every requirement with evidence.

---

# 0. Execute, do not merely plan

IMPLEMENT THE WORK. DO NOT MERELY ANALYZE IT, CREATE TICKETS, WRITE A PLAN, BUILD ONLY AN AUDIT TOOL, OR MOVE DIFFICULT ITEMS INTO A BACKLOG.

This is one queued instruction covering the whole completion program.

“Completed” means the requirement ledger is closed with code, tests, commits, deployment/live evidence where required, and an independent verification-ready evidence package.

Completing one phase does not complete this prompt.

If the environment or context limit interrupts the run, commit all safe finished work and create an exact resumable handoff. Do not represent the overall run as complete.

---

# 1. First action: discover and resume current work

The user has already queued a Codex task to build the Operations Playwright UI-audit harness.

Before creating anything:

1. Inspect:
   - current working tree;
   - current branch and HEAD;
   - all local/remote Codex branches;
   - open pull requests;
   - recent commits;
   - untracked files;
   - current Codex task artifacts;
   - `ops/ui-audits/`;
   - `tools/ops-ui-audit*`;
   - package scripts containing `ops:audit`;
   - audit documentation and tests.

2. Resume and reuse the current audit-harness implementation if it exists.

3. Do not build a second competing harness.

4. If the harness task is complete:
   - validate it;
   - preserve its branch/commits;
   - merge/rebase as appropriate;
   - use its output in this run.

5. If the harness is partial:
   - finish only its missing acceptance criteria;
   - do not restart it from scratch.

6. If no harness work is accessible:
   - implement the smallest complete version required by the earlier audit-harness prompt;
   - record that the prior work was unavailable.

7. A harness being built is not evidence that an authenticated audit ran.
8. An audit report is not evidence that its findings were fixed.

As of prompt creation, the connected repository view did not yet show the new harness on `master`. Recheck actual state now; do not rely on that old observation.

---

# 2. Credit- and time-efficiency rules

These rules are mandatory.

## 2.1 Delta-first

- Read the durable source-of-truth files once.
- Create one baseline inventory.
- Identify the last verified commit/run.
- Inspect changes since that point.
- Reuse existing audits, route maps, screenshots, fixtures, tests, migrations, and helper code.
- Do not repeatedly rescan unchanged areas.

## 2.2 No loops

Do not:

- start any watch-mode agent fleet;
- run autonomous background loops;
- repeatedly poll deployment or task state;
- run multiple agents that modify the same files;
- regenerate the same plan after each phase;
- run a full UI crawl after every small change;
- run the entire test suite after every edit;
- repeatedly try unavailable credentials;
- repeatedly deploy to discover local errors;
- rewrite giant files when targeted edits are safer.

## 2.3 Test budget

Use:

- focused tests after each requirement group;
- one phase gate;
- one final complete local suite;
- one final deployment/live smoke.

A complete UI crawl should normally run no more than twice:

1. baseline, only if there is no recent usable baseline;
2. post-fix acceptance crawl.

Use targeted browser checks for specific failures between those runs.

## 2.4 Existing work

For anything apparently complete:

- inspect implementation and prior evidence;
- confirm relevant files have not changed;
- run the smallest targeted verification;
- record it as existing closed work;
- do not rebuild it.

## 2.5 Credentials and manual login

Check once.

If manual login, Railway credentials, Google credentials, or another external dependency is unavailable:

- mark only the affected requirement blocked;
- complete all credential-free work;
- write one exact command/manual action;
- continue the rest of the program;
- do not loop.

---

# 3. Install the durable repository protocol

Create/update these repository files:

```text
BNA-START-HERE.md
docs/BNA-RAMBLE-TO-DONE.md
templates/BNA-FRESH-CHAT-STARTER.md
templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md
templates/BNA-CODEX-VERIFICATION-PROMPT.md
ops/execution-runs/README.md
ops/execution-runs/requirements.schema.json
ops/execution-runs/latest.json
scripts/bna-execution-run.mjs
```

Add package scripts:

```json
{
  "bna:run:init": "node scripts/bna-execution-run.mjs init",
  "bna:run:status": "node scripts/bna-execution-run.mjs status",
  "bna:run:validate": "node scripts/bna-execution-run.mjs validate",
  "bna:run:resume": "node scripts/bna-execution-run.mjs resume"
}
```

## 3.1 `BNA-START-HERE.md`

Keep this file short and durable.

It must tell any new GitHub-connected ChatGPT/Codex session to:

1. read `docs/BNA-RAMBLE-TO-DONE.md`;
2. read `ops/execution-runs/latest.json`;
3. resume the active run rather than restart;
4. inspect current Git state;
5. use delta-first verification;
6. never trust task/changelog labels without evidence;
7. never claim completion while required IDs remain open.

Include this exact fresh-chat instruction:

```text
Read `BNA-START-HERE.md`, inspect the active execution run and current GitHub state, then process my ramble according to the repository protocol. Do not restart completed work and do not trust task labels without implementation evidence.
```

## 3.2 `docs/BNA-RAMBLE-TO-DONE.md`

Write the exact protocol provided in Appendix B of this prompt.

## 3.3 Templates

Create concise reusable templates derived from the protocol:

- fresh ChatGPT bootstrap;
- Codex implementation prompt;
- independent verification prompt.

## 3.4 Deterministic validator

`scripts/bna-execution-run.mjs` must not invoke an LLM or run a watcher.

It must support init/status/validate/resume and validate:

- duplicate/missing requirement IDs;
- invalid statuses;
- closed requirements with missing acceptance criteria;
- closed requirements with missing evidence;
- live-required items lacking deployment/live evidence;
- stale/missing `latest.json`;
- missing `NEXT-SESSION.md` while work remains.

Add unit tests for the validator.

---

# 4. Update existing memory and control files

Make focused, non-destructive updates.

## `AGENTS.md`

Add a concise mandatory rule near the top:

- read `BNA-START-HERE.md` for rambles and major builds;
- use the active execution run;
- resume, do not restart;
- obey delta-first/no-loop policy;
- prove completion with requirement evidence;
- write `NEXT-SESSION.md` when interrupted.

Do not duplicate the full protocol inside `AGENTS.md`.

## `MEMORY.md`

Store durable facts:

- one unified OpenAI helper shell;
- helper context/memory is scoped by user, role, workspace, and student/family/provider context;
- three workspace types: school, service provider, family;
- super admin is a role/context, not a workspace type;
- evidence-based requirement closure;
- delta-first execution and no unnecessary loops.

## `TASKS.md`

- Create one umbrella task for this completion run.
- Link to requirement IDs and the active execution-run directory.
- Reconcile or remove duplicate/superseded tasks.
- Do not copy the entire requirement ledger into `TASKS.md`.
- Do not mark old items done without evidence.

## `SYSTEM-STATE.md`

- Update to actual current architecture and deployment.
- Identify the canonical Operations runtime.
- Reconcile contradictory historical PWA/helper/workspace statements.
- Distinguish implemented, partial, and planned behavior.
- Record the protocol and active run.

## `tasks-pending/`

- Reuse relevant briefs.
- Archive or mark superseded briefs only after their requirements are imported.
- Do not create a new pending brief merely to postpone implementation.

## Ledgers

Append concise structured entries to:

- `ops/agent-task-ledger.jsonl`;
- `ops/agent-changelog.md`.

A ledger/changelog line is not completion evidence by itself.

---

# 5. Create the completion execution run

Create:

```text
ops/execution-runs/2026-06-18-bna-platform-completion/
  SOURCE.md
  REQUIREMENTS.md
  requirements.json
  BASELINE.md
  PLAN.md
  STATUS.md
  EVIDENCE.md
  TEST-RESULTS.md
  DEPLOYMENT.md
  NEXT-SESSION.md
  run.json
```

Update:

```text
ops/execution-runs/latest.json
```

## 5.1 Import sources

`SOURCE.md` must identify:

- the June 18 mobile/desktop Operations and public-site transcript;
- the prior BNA super prompt contained in Appendix A;
- the current Operations UI-audit harness/report when available;
- current repository tasks/briefs;
- current Git state.

## 5.2 Baseline

Before editing product code, classify every requirement ID:

```text
closed_existing
partial
missing
conflicting
blocked
```

Base this on code/tests/deployment evidence, not names or task status.

## 5.3 Requirement IDs

Create at least the following IDs. Add sub-IDs where the Appendix A requirements require more granularity. Do not omit any Appendix A clause.

### Protocol and audit

- `BNA-PROC-001` Install root start-here and durable protocol.
- `BNA-PROC-002` Add deterministic execution-run tooling/schema/tests.
- `BNA-PROC-003` Reconcile AGENTS, MEMORY, TASKS, SYSTEM-STATE, briefs, and ledgers.
- `BNA-PROC-004` Add independent completion-verification workflow.
- `BNA-AUDIT-001` Resume/finish the Operations UI-audit harness without duplication.
- `BNA-AUDIT-002` Produce a privacy-safe authenticated audit package when login is available.
- `BNA-AUDIT-003` Produce a post-fix audit comparison.

### PWA and public/Operations separation

- `BNA-PWA-001` Separate public and Operations manifests/app identities.
- `BNA-PWA-002` Isolate service workers, caches, scopes, and cache headers.
- `BNA-PWA-003` Enforce public-browser and installed-Operations routing invariants.
- `BNA-PWA-004` Remove public loader/checkmark flash and header-to-hero gap.

### Workspace and authorization foundation

- `BNA-WS-001` Enforce exactly school/service-provider/family workspace types; super admin is a role/context.
- `BNA-WS-002` Scope every applicable entity by `workspace_id`.
- `BNA-WS-003` Enforce server-side authorization/RLS and negative cross-tenant tests.
- `BNA-WS-004` Implement clear super-admin selector and ordinary-user behavior.
- `BNA-WS-005` Clear stale module/filter/student/helper context on workspace changes.

### Operations shell and design system

- `BNA-OPS-001` Remove redundant top-level clutter and create an ordered horizontal module toolbar.
- `BNA-OPS-002` Simplify workspace/sidebar navigation and remove redundant directory/filter cards.
- `BNA-OPS-003` Prevent unexpected page collapse/minimize and persist valid context.
- `BNA-OPS-004` Use consistent headers, logo behavior, portal identity, and language controls.
- `BNA-DESIGN-001` Implement one shared high-contrast card/spacing/type/button system.
- `BNA-DESIGN-002` Make mobile controls intentional, scrollable, aligned, and touch-safe.
- `BNA-DESIGN-003` Make desktop grids balanced with no dead or uneven layout.
- `BNA-A11Y-001` Meet accessibility labeling, contrast, focus, semantic, and modal requirements.

### Tasks, intake, calendar, and live state

- `BNA-TASK-001` Implement one canonical task state model.
- `BNA-TASK-002` Separate owner, status, urgency, due date, blocker, and provenance.
- `BNA-TASK-003` Merge Intake Review/Review Queue into auto-routing and Decisions.
- `BNA-TASK-004` Build and connect the internal calendar.
- `BNA-TASK-005` Remove stale/internal diagnostic concepts from the main task UI.
- `BNA-TASK-006` Derive counts from live scoped data and explain blocked items.
- `BNA-TASK-007` Make parsing idempotent and route records to correct workspaces/modules.

### Module scoping

- `BNA-COMMUNITY-001` Scope each community to its workspace with explicit super-admin filtering.
- `BNA-CONTENT-001` Keep teaching/research content separate from meetings/tasks/accountability.
- `BNA-CONTENT-002` Provide date/source/transcript/topics/references/questions/outputs/provenance.
- `BNA-CONTENT-003` Connect each workspace to its correct Drive intake/routing.
- `BNA-CLASS-001` Scope live classes by workspace and hide empty irrelevant classes.
- `BNA-AUTO-001` Scope automations and show clear operational status.
- `BNA-INTEGRATION-001` Simplify integrations/social accounts to clear states/actions.
- `BNA-USER-001` Scope users/roles/invitations and prove server-side isolation.
- `BNA-ACCOUNTING-001` Preserve correct workspace payment/accounting scoping and safe actions.

### Students, Goal Board, Hebrew

- `BNA-STUDENT-001` Enforce workspace-and-student detail/analysis isolation.
- `BNA-GOAL-001` Reorganize Goal Board controls and remove unclear implementation labels.
- `BNA-GOAL-002` Separate current goals, check-ins/progress, approvals/decisions, and history.
- `BNA-I18N-001` Complete Hebrew localization and RTL behavior.
- `BNA-STUDENT-002` Safely merge duplicate Menachem records with audit trail and prevention.

### Unified helper

- `BNA-HELPER-001` Use one visible OpenAI-powered assistant shell.
- `BNA-HELPER-002` Scope context/memory by user, role, workspace, module, and student/family/provider.
- `BNA-HELPER-003` Add permissioned backend action registry.
- `BNA-HELPER-004` Add confirmation tiers and action audit trail.
- `BNA-HELPER-005` Remove duplicate helper identities and ordinary-user Codex/dev language.
- `BNA-HELPER-006` Prevent pre-authentication and cross-context memory leakage.

### Public positioning and portals

- `BNA-PUBLIC-001` Remove Operations login from public primary navigation.
- `BNA-PUBLIC-002` Use “Advertise your program for free” provider positioning.
- `BNA-PUBLIC-003` Use direct parent signup/self-governance messaging and six-month offer.
- `BNA-PUBLIC-004` Use consistent approved headers across public and portal login pages.
- `BNA-PUBLIC-005` Ensure all public/blog/FAQ/signup/portal routes and CTAs work.

### Test data and proof

- `BNA-TEST-001` Add isolated repeatable seed and cleanup data.
- `BNA-TEST-002` Add route, interaction, responsive, helper, workspace, and student Playwright tests.
- `BNA-TEST-003` Add backend/API/RBAC negative tests.
- `BNA-TEST-004` Add PWA identity/cache regression tests.
- `BNA-TEST-005` Run final local and live acceptance gates.

---

# 6. Implementation contract

For every ID:

1. inspect current code and prior evidence;
2. record the baseline verdict;
3. preserve verified unchanged work;
4. implement the missing delta;
5. add requirement-specific tests;
6. run focused tests;
7. commit coherent work;
8. update evidence;
9. deploy when required and possible;
10. live-verify;
11. mark `closed` only when every acceptance criterion is proven.

Do not close an ID based on:

- a task existing;
- a file existing;
- an agent report;
- a screenshot alone;
- a changelog line;
- a generic smoke test;
- partial CSS changes;
- a route loading while authorization or behavior remains unfinished.

Do not silently defer difficult items into the backlog.

---

# 7. Implementation order

Use dependency order:

## Phase A — Resume/audit/protocol

- resume current harness work;
- install protocol and run tooling;
- create ledger;
- establish canonical Operations runtime;
- establish baseline;
- add failing P0/P1 regression tests.

## Phase B — PWA and route guardrails

- separate identities/manifests/service workers;
- fix public/Operations routing;
- remove loader flash and spacing defect;
- fix public route integrity.

## Phase C — Workspace/RBAC foundation

- schema/migrations/backfill;
- server-side scope helpers;
- RLS/authorization;
- selector/context behavior;
- negative tests.

## Phase D — Operations shell/design

- shell/navigation;
- shared design tokens/components;
- responsive behavior;
- headers;
- accessibility.

## Phase E — Tasks/intake/calendar

- canonical model;
- migration/compatibility;
- decisions;
- idempotent parsing;
- internal calendar;
- live counts.

## Phase F — Module scoping

- students;
- content/research;
- community;
- live classes;
- automations;
- integrations;
- users/roles;
- accounting.

## Phase G — Goal Board/Hebrew/helper

- Goal Board;
- student isolation;
- duplicate merge;
- Hebrew/RTL;
- unified helper/action registry/audit.

## Phase H — Public copy/seed/full verification/deploy

- public positioning and CTAs;
- seed/cleanup;
- full test suite;
- final UI audit;
- one deployment;
- live smoke;
- evidence closure;
- independent-verifier handoff.

---

# 8. Commits and branch discipline

Use the existing in-progress branch when appropriate.

Otherwise use:

```text
codex/2026-06-18-bna-platform-completion
```

Make small coherent commits.

Do not mix unrelated formatting.

Suggested sequence:

1. `chore: install BNA execution protocol and validator`
2. `test: establish BNA platform remediation baseline`
3. `fix: separate public and operations PWA identities`
4. `feat: enforce workspace and student scope`
5. `refactor: simplify operations shell and design system`
6. `feat: canonicalize tasks decisions intake and calendar`
7. `fix: scope content community automations users and classes`
8. `feat: complete goal board Hebrew and unified helper`
9. `fix: update public routes positioning and portal headers`
10. `test: add full responsive RBAC and PWA acceptance coverage`
11. `docs: close execution ledger and deployment evidence`

---

# 9. Verification and deployment budget

Run targeted tests throughout.

Run the complete final gate once:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
node --check scripts/bna-execution-run.mjs
npm test
npm run bna:run:validate
npm run screenshot
npm run lighthouse
npm run openai:smoke
npm run railway:doctor
```

Run the repository's Operations audit command once post-fix if authentication is available.

Do not run `agent:fleet --watch`.

Deploy once at the end after local success, unless an isolated P0 hotfix must be deployed earlier.

Record:

- deployment ID;
- commit SHA;
- URL;
- health check;
- targeted live checks;
- rollback.

If deployment credentials are unavailable, do not retry repeatedly. Close local work and leave the deployment/live IDs blocked with one exact next command.

---

# 10. Final evidence and response

`EVIDENCE.md` must cross-reference every ID with:

- status;
- commit;
- files;
- tests;
- screenshot/API/database evidence;
- deployment/live evidence.

`NEXT-SESSION.md` must exist even when complete and state either:

```text
No remaining required IDs.
```

or list exact remaining/blocked IDs and commands.

Final response must include:

1. branch and HEAD;
2. commits;
3. canonical runtime chosen;
4. protocol files installed;
5. IDs closed;
6. IDs blocked/remaining;
7. tests and results;
8. audit package paths;
9. migrations/backfills;
10. deployment/live evidence;
11. rollback;
12. explicit verdict:
   - COMPLETE
   - PARTIAL — REQUIRED IDS REMAIN
   - BLOCKED — EXTERNAL ACTION REQUIRED

Never return COMPLETE while any non-blocked required ID remains open.

---

# Appendix A — Authoritative June 18 product requirements

The following prior prompt is authoritative. Import all of its clauses into the requirement ledger. The IDs above are the minimum crosswalk and may be subdivided. Do not omit requirements because they are lengthy.

# Codex Super Prompt — BNA Mobile-First Operations, Workspace Isolation, and Public-Site Guardrails

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Default branch:** `master`
**Baseline inspected:** commit `05d8288a960c94cdeb7e19bb8a762f96ecece08f`
**Date of this instruction:** 2026-06-18

## Operating instruction

Implement the work. Do not merely analyze it or create tickets.

Choose the practical implementation order and continue through the full queue without asking for ordering confirmation. Ask only when there is a genuine blocker involving missing credentials, an irreversible/destructive migration, security, legal exposure, or new paid services. Otherwise inspect the repository, live data, existing conventions, and recent memory to resolve ambiguity.

The voice transcript behind this brief contains speech-to-text contamination. The requirements below are the authoritative distillation. Do not create tasks from the unrelated phrases listed under **Transcription noise to ignore**.

---

# 1. Mission

Turn the BNA application into a coherent, mobile-first, multi-workspace system with:

1. strict workspace and student data isolation;
2. a simple, usable Operations shell;
3. a comprehensible internal task manager and calendar;
4. correctly scoped Community, Content, Automations, Users, Live Classes, and Accountability modules;
5. one consistent, action-capable helper;
6. separate and regression-proof public-site versus Operations-PWA behavior;
7. consistent responsive styling, Hebrew behavior, headers, and navigation;
8. durable tests that prevent these defects from returning.

This is not a cosmetic-only pass. Fix the routing, state, authorization, data scoping, parsing, and persistence that cause the visible problems.

---

# 2. Mandatory repository preflight

Before changing code:

1. Read, in this order:
   - `AGENTS.md`
   - `MEMORY.md`
   - `SYSTEM-STATE.md`
   - `TASKS.md`
   - the newest files in `tasks-pending/`
   - the recent tail of `ops/agent-task-ledger.jsonl`
   - the recent tail of `ops/agent-changelog.md`
   - the latest `memory/YYYY-MM-DD.md` files

2. Inspect `git status`, the latest commits, deployed-route assumptions, current database migrations, and Railway configuration.

3. Create a working branch such as:
   - `codex/2026-06-18-mobile-workspace-audit`

4. Add the raw request and a concise distillation to:
   - `memory/2026-06-18.md`

5. Create an implementation brief:
   - `tasks-pending/2026-06-18-mobile-operations-workspace-audit.md`

6. Determine the **canonical Operations surface** before editing:
   - The inspected repository contains a large static `public/operations.html`.
   - It also contains `src/app/operations/...`, including a separate task app.
   - The live transcript describes a newer multi-workspace/super-admin surface than the June 5 repository snapshot.
   - Trace the actual `/operations` route, server routing, deployed assets, API calls, and recent branches/commits.
   - Do not spend time polishing a dead or shadow UI.
   - Consolidate toward one canonical Operations implementation. Redirect or remove obsolete duplicate surfaces only after proving they are unused.

7. Produce a short inventory in the implementation brief:
   - canonical route and source files;
   - legacy routes;
   - manifest/service-worker ownership;
   - workspace tables and authorization model;
   - modules and API endpoints;
   - current parser/intake flow;
   - current helper implementation;
   - current test coverage;
   - repo-versus-production drift.

8. Preserve existing production data. Use idempotent migrations, explicit backfills, indexes, and rollback notes. Never silently treat missing `workspace_id` as global access.

---

# 3. Non-negotiable architectural rules

## 3.1 Workspace model

There are exactly three workspace types:

- `school`
- `service_provider`
- `family`

`super_admin` is a role and global viewing context, **not** a fourth workspace type.

Every workspace-owned record must be scoped by `workspace_id` at the database, API, and UI layers. This includes, as applicable:

- tasks and task comments;
- decisions and intake-review records;
- calendar events;
- communities and members;
- content jobs, transcripts, research, outputs, sources, and Drive intake;
- students, families, goals, accountability, analysis, meetings, and messages;
- live classes;
- automations;
- integrations and social accounts;
- users, roles, invitations, and permissions;
- helper memory, conversations, actions, and audit events.

Use server-side authorization. Hiding another workspace in the UI is not sufficient.

## 3.2 Role behavior

### Normal workspace user

- Sees only the workspace or workspaces to which the user belongs.
- Once inside a workspace, sees only that workspace’s modules and data.
- Does not see a global workspace directory, global filters, or unrelated tenant data.
- Does not see a redundant side-panel item naming the workspace already open.
- Cannot change a request parameter to access another workspace or student.

### Super admin

- Can select a workspace type, then a specific workspace.
- Can intentionally choose a global/all-workspaces context only on modules designed for aggregation.
- Sees a clear workspace selector, not a mixture of random workspace cards and module buttons.
- When a specific workspace is selected, all modules default to that workspace only.
- Cross-workspace views must visibly identify that they are global and must never occur accidentally.

## 3.3 Student isolation

When viewing one student:

- analysis, accountability, goals, meetings, parent communications, content, and helper context must be filtered by both `workspace_id` and `student_id`;
- another student’s analysis must never appear;
- server endpoints must reject cross-student access;
- tests must include negative cross-student and cross-workspace cases.

## 3.4 Canonical state, not duplicated labels

Do not represent the same concept with several labels such as:

- Pending and Waiting;
- Blocked and Stale;
- Needs Attention and Decision;
- Queue and Agent Work;
- Intake Review and Review Queue.

Define one canonical state machine and map old values through a migration/compatibility layer.

Recommended canonical model:

- `decision_required`
- `ready`
- `in_progress`
- `blocked`
- `done`
- `archived`

Keep these as separate dimensions:

- owner/assignee;
- urgency;
- due date;
- workspace;
- project;
- source/provenance.

---

# 4. Priority 0 — Operations PWA and public-site separation

The installed Android Operations icon has switched to the public website more than once. Fix the root cause and add guardrails so it cannot regress.

## 4.1 Separate app identities

Do not use one shared manifest/app identity for both the public website and Operations.

Implement distinct identities, for example:

- Operations manifest:
  - distinct URL such as `/operations-manifest.json`;
  - stable `id` tied to Operations;
  - `start_url` that opens `/operations?source=pwa`;
  - Operations name and short name;
  - Operations icon set;
  - appropriate display mode and colors.

- Public website:
  - a separate public manifest with a different `id`, icons, and start URL, **or**
  - no install manifest if a public PWA is not currently required.

Ensure public pages link only to the public manifest, while Operations/login pages link only to the Operations manifest.

## 4.2 Service-worker and cache isolation

- Give public and Operations caches distinct names and scopes.
- Do not let the public shell cache or serve Operations routes.
- Do not let Operations navigation rewrite ordinary public browser visits.
- Do not use a broad redirect from `/` based only on stale installation state.
- Preserve an explicit public-site bypass for testing if one is still needed, but do not rely on it as the main architecture.
- Serve manifests, service workers, and critical HTML with cache headers that allow fixes to propagate.
- Version service-worker caches and remove obsolete caches on activation.

## 4.3 Routing invariants

These must always hold:

- Opening the installed Operations app opens Operations.
- Opening the public website in Chrome/Safari opens the public website.
- Clicking a public-site link never unexpectedly opens Operations.
- Old Operations shortcuts migrate to the canonical Operations route.
- Operations authentication redirects back to the intended Operations route.
- The public homepage never flashes an Operations loader.

## 4.4 Loader and public hero

- Remove the initial checkmark/incorrect loading artifact from the public website.
- The public page should render a neutral skeleton or no blocking loader.
- Remove the gap between the top toolbar/header and the hero image.
- Verify this in English and Hebrew at mobile and desktop widths.

## 4.5 PWA regression tests

Add automated assertions for:

- manifest IDs, names, start URLs, icons, and scopes;
- which manifest each page links;
- service-worker scopes/cache names;
- standalone Operations launch;
- ordinary public-browser launch;
- legacy shortcut redirect;
- no Operations markup/loader on the public homepage;
- no public-homepage takeover when launching Operations.

---

# 5. Priority 0 — Workspace navigation and shell

## 5.1 Remove top-level clutter

In the super-admin Operations shell, remove the redundant top buttons such as:

- Super Admin
- Platform
- Dashboard
- Alerts

Do not display a collection of unrelated rectangular buttons and counters.

Use one compact, horizontally scrollable module toolbar on mobile. On desktop, use the available width evenly. The order should reflect actual operational priority.

Recommended high-level order:

1. Decisions
2. Tasks
3. Calendar
4. Students / Accountability
5. Content / Research
6. Community
7. Accounting
8. Automations
9. Users
10. Integrations

Only show modules the role can access.

## 5.2 Workspace selector

For super admin:

- first choose workspace type;
- then choose the specific workspace;
- then show that workspace’s modules.

Remove from the normal side panel:

- “5 workspaces loaded” cards;
- search-workspaces UI unless a large list genuinely requires it;
- workspace-type filter buttons mixed into the module navigation;
- duplicate current-workspace cards;
- Family Directory;
- Management / Workspace Directory entries that belong inside an administrative workspace screen.

For ordinary users, the selector should be minimal or absent when there is only one allowed workspace.

## 5.3 Stable shell behavior

- The page must not minimize/collapse itself after it is already open.
- Persist the chosen workspace and module per user where appropriate.
- On switching workspaces, load the first permitted module if the previous module is unavailable.
- Do not auto-open Watchdog or a diagnostics screen as the primary module.
- Maintain a stable header and toolbar on every portal.
- No horizontal body overflow; intentional toolbars may scroll within their own container.

---

# 6. Priority 1 — Design system and responsive behavior

## 6.1 One card system

Replace inconsistent dark-gray cards and faded text with one shared semantic card system.

- Use a light-gold/parchment card surface aligned with the BNA brand.
- Use high-contrast dark text.
- Use semantic CSS tokens/components rather than one-off inline colors.
- Meet WCAG AA contrast for normal text.
- Keep status color as an accent, not the entire card background.
- Apply the same card tokens across Operations, student/accountability, goal board, content, community, and relevant portals.

## 6.2 Mobile controls

On mobile:

- module tabs, filters, and action groups should be horizontal scroll strips with snap/clear active state where useful;
- do not wrap five buttons into three uneven rows;
- avoid random full-width rectangles;
- keep labels short and understandable;
- preserve 44px minimum touch targets;
- keep critical counts attached to their labels;
- avoid dense explanatory paragraphs above the actual work.

On desktop:

- use grid space evenly;
- rectangular controls are acceptable when they form an aligned system;
- avoid large dead areas and uneven card rows.

## 6.3 Consistent headers

All login and portal pages must share:

- the correct BNA logo;
- consistent header height and spacing;
- consistent navigation placement;
- correct mobile behavior;
- correct Operations versus public manifest/icon association.

For language switching, do not use an unclear `HE` abbreviation. Use a recognizable Hebrew label such as `עברית` or a Hebrew glyph, while retaining `EN` for English.

---

# 7. Priority 1 — Task manager and internal calendar

The current task system is too noisy and exposes internal implementation language.

## 7.1 User-facing task views

Use a compact horizontal task toolbar:

- Decisions
- Tasks
- Codex Queue
- Blocked
- Done / Activity

Within **Tasks**, filter by owner rather than inventing a status for each person:

- Me / Shloimie
- Rabbi Elie Scheller
- other workspace members

Keep urgency and dates as compact secondary filters.

Remove visible concepts such as:

- Needs Attention
- Queue Health
- Track Agent Work
- Handoff Files
- Do Not Restart
- Running
- stale/proof-gap counters
- duplicate Pending/Waiting labels
- internal retry/worker diagnostics

Diagnostics may exist in an admin-only technical screen, not in the main task manager.

## 7.2 Task data requirements

Each visible task should have:

- concise title;
- useful detail;
- workspace;
- owner;
- canonical status;
- urgency;
- due date;
- source/provenance;
- related student/content/meeting when applicable;
- blocker and next action when blocked;
- created/updated/completed timestamps.

Never show raw ramble wording as the primary title.

## 7.3 Intake review

Remove Intake Review and Review Queue as standalone side-panel modules.

- High-confidence intake should auto-file into the correct workspace and module.
- Low-confidence intake should become a Decision with:
  - the original source;
  - likely destinations;
  - a short explanation;
  - one-tap routing choices.
- Once resolved, it leaves Decisions and continues through the destination workflow.
- Add deduplication/idempotency so repeated parser runs do not create duplicate tasks or content.

## 7.4 Calendar

Build an internal calendar from task due dates, meetings, check-ins, classes, and relevant workspace events.

For now:

- hide/remove Google Calendar UI and sync prompts;
- do not show a broken or partial Google integration;
- keep the internal event model compatible with future sync;
- allow task-to-calendar and calendar-to-task navigation;
- scope all events by workspace and permissions.

## 7.5 Live data

Remove fake, stale, or unexplained counts.

- Every count must be derived from live scoped data.
- A blocked/stale item must link to the actual record and explain why it is blocked.
- If old records cannot be confidently mapped, migrate them to a clearly labeled archive/review batch rather than displaying them as current work.

---

# 8. Priority 1 — Module-specific scoping

## 8.1 Community

- Each workspace has its own community.
- In a BNA workspace, show the BNA community.
- In a family workspace, show that family’s community/context.
- In Rabbi Elie Scheller’s workspace, show only that workspace’s community.
- Super admin gets a workspace/community selector and may view all communities only through an explicit global filter.
- Do not default every workspace to the Mishnah/One Time community.

## 8.2 Content and research

Content is for actual teaching/class material, not every recording or meeting.

Content may include:

- classes and shiurim;
- teaching topics;
- Torah sources;
- questions discussed;
- research;
- approved material for repurposing.

Content must not include as reusable content:

- private meetings;
- operator tasks;
- Rabbi coordination meetings;
- student goals or accountability notes;
- unrelated technical discussions;
- workspace-external material.

Those inputs may still be parsed, but their outputs must route to Tasks, Students, Decisions, Accounting, or another correct module.

Every content item must clearly show:

- workspace/project;
- title;
- date uploaded and date recorded when known;
- source recording/file;
- source link;
- transcript status;
- parsed topics;
- sources/references;
- questions;
- outputs and approval state;
- provenance back to the original ramble/recording.

Opening a source should use an in-app detail/drawer or safe new tab. Do not unexpectedly navigate the operator away from the current screen.

Connect each workspace to its own configured Drive intake folder. Do not show Rabbi/One Time material in BNA Content or personal family material in a school workspace.

## 8.3 Live classes

- A workspace sees only its own live classes.
- BNA should show no live classes when none are currently offered.
- Rabbi Elie Scheller/One Time classes belong only to that workspace.
- Super admin may filter across workspaces explicitly.

## 8.4 Automations

- In a specific workspace, show only that workspace’s automations.
- Super admin may filter across workspaces.
- The One Time membership/library package must not appear in BNA.
- Each automation should show a clear status, owner, last run, next run, and failure reason.
- Remove decorative or nonfunctional controls.

## 8.5 Communications and integrations

Simplify the settings surface.

- Remove unexplained Save / Test / Reset button clusters.
- Do not show an empty Settings section.
- Social accounts and integrations should display:
  - Connected / Not connected / Error;
  - account identity;
  - last successful check;
  - one clear action when action is needed.
- For working integrations such as the WhatsApp provider, show a concise “Integrated” state.
- Do not expose developer configuration to ordinary workspace users.

## 8.6 Users and roles

- In a workspace, list only that workspace’s users and roles.
- Super admin can filter by workspace.
- Enforce permissions server-side.
- Include tests proving one workspace admin cannot enumerate another workspace’s users.

---

# 9. Priority 1 — Students, accountability, and Goal Board

## 9.1 Student detail

- Selecting a student scopes the entire detail page to that student.
- Analysis must never show another student.
- Avoid stale selection state when switching workspaces or students.
- Deep links must validate both workspace and student access.

## 9.2 Goal Board and accountability controls

The Goal Board and Student Accountability areas have too many unclear buttons and faded labels.

- Organize controls into horizontal toolbars.
- Replace unclear labels such as “approved recovery override,” “weight,” or similar implementation terms with plain product language.
- Hide controls that have no current user purpose.
- Use the shared light-gold card system and high-contrast text.
- Separate:
  - current goals;
  - progress/check-ins;
  - decisions/approvals;
  - history/activity.
- Keep school-tracked items read-only where required.
- Preserve explicit parent/admin approval for consequential actions.

## 9.3 Hebrew

When the student portal is switched to Hebrew:

- goals, labels, statuses, empty states, dates, and buttons must appear in Hebrew;
- layout must be RTL;
- user-generated text remains as entered unless a stored translation exists;
- no mixed English UI fragments should remain.

The bottom-left identity/control should use the student or parent name and a clear label such as Goal Bot / Goal Settings / Accountability, localized appropriately.

## 9.4 Duplicate student cleanup

There is only one Menachem in the relevant school/family context. Merge the duplicate English/Hebrew records safely.

- Pick a canonical student ID.
- Reassign linked goals, meetings, accountability events, analysis, access codes, and parent relationships.
- Preserve an audit trail.
- Add a uniqueness constraint or deduplication rule that prevents the same student from being recreated merely because the display language differs.

---

# 10. Priority 1 — One scoped helper, capable of action

Use one consistent helper in the bottom-right across supported portals.

## 10.1 Product behavior

The helper should feel concise, professional, and useful.

- Do not expose separate “BNA Helper,” “public helper,” or “Codex” personalities without a clear product reason.
- Do not make the user choose among dozens of tools.
- Do not merely open a ticket when the requested action can be completed safely through an existing API.
- The helper should call the correct application actions, then report what changed.
- For destructive, financial, publishing, permission, or irreversible actions, require explicit confirmation.

## 10.2 Memory and scope

Helper context must be isolated by:

- user;
- role;
- current workspace;
- current student/family where applicable.

Examples:

- parent helper: family/accountability context for that parent and child;
- student helper: that student’s allowed goals and check-ins;
- service provider helper: that provider workspace;
- super admin helper: current selected workspace unless the user explicitly requests global scope.

The public helper must not remember Shloimie merely because he used another authenticated bot. No cross-user or cross-workspace memory leakage.

## 10.3 Capability

A user should not need to “talk to Codex.” The product helper may use Codex or another agent internally, but the UI should expose one coherent assistant.

Add an action audit trail containing:

- requester;
- workspace;
- action;
- target;
- before/after summary;
- result;
- timestamp.

---

# 11. Public website navigation and copy

## 11.1 Navigation

Remove Operations login from the public website’s main navigation.

Keep the public navigation focused on prospects and families. Ensure mobile and desktop menus remain aligned and uncluttered.

## 11.2 Service-provider CTA

Replace “Become a Service Provider” with wording centered on the immediate value:

**Advertise your program for free**

The linked page should explain what providers can list and what is free.

## 11.3 Parent app CTA

Do not say “request parent app access.”

Use a direct signup CTA, such as:

**Sign up and start using the app**

Explain, in plain language, that the app:

- turns natural-language conversations into goals and assignments;
- helps parents and students filter what matters;
- supports self-governance;
- helps families set meaningful natural consequences;
- tracks progress without reducing the child to compliance or surveillance.

Current launch offer:

**Six months free** for current early users.

Do not say one year. Make the terms clear and consistent anywhere the offer appears.

## 11.4 Portal headers

All public, parent, student, provider, and Operations login pages must use the same approved logo/header pattern while retaining their correct app identity and permissions.

---

# 12. Test data and end-to-end validation

Create a safe, repeatable test-data path.

Seed enough data to exercise:

- at least two school workspaces;
- one service-provider workspace;
- two family workspaces;
- a super-admin account;
- workspace admins and ordinary users;
- multiple students with overlapping common names;
- tasks in every canonical state;
- decisions from low-confidence intake;
- calendar events;
- content and research with sources;
- community members;
- automations and integration statuses;
- live classes in only one relevant workspace;
- Hebrew student goals;
- helper conversations/actions.

Rules:

- Prefix visible seed records with `TEST` or use an isolated test environment.
- Provide a cleanup command.
- Never mix test data into production-visible records without an explicit test flag.
- Validate the whole path: intake -> parsing -> decision/auto-route -> scoped module -> helper/action -> audit trail.

---

# 13. Likely code targets

Verify before editing; this list is directional:

- `public/manifest.json`
- new distinct Operations/public manifests as needed
- service-worker generation/config and cache headers
- `public/index.html`
- `public/operations.html`
- `public/operations-login.html`
- public parent/student/provider login and portal pages
- `server.js`
- `src/app/operations/**`
- `src/lib/bna/task-pipeline.ts`
- `src/lib/bna/telegram-bot.ts`
- `src/app/api/bna/**`
- `scripts/telegram-kimi-bridge.mjs`
- content parsing and Drive configuration scripts
- Supabase migrations and RLS policies
- Playwright/screenshot tests
- `AGENTS.md`, `MEMORY.md`, `TASKS.md`, `SYSTEM-STATE.md`
- `memory/2026-06-18.md`
- `tasks-pending/2026-06-18-mobile-operations-workspace-audit.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`

Do not edit all of these mechanically. Trace the canonical runtime and change only the surfaces actually used.

---

# 14. Implementation sequence

Use small, verifiable commits.

## Phase A — Audit and canonicalization

- map live routes, source files, APIs, manifests, and service workers;
- identify repo/deployment drift;
- choose the canonical Operations implementation;
- write the implementation brief and migration plan;
- add failing regression tests for the PWA collision and workspace leakage.

## Phase B — PWA/public guardrails

- split manifests/app identities/icons/service workers;
- fix start routes and caching;
- remove public loader/checkmark artifact;
- remove header-to-hero gap;
- remove Operations from public nav;
- add launch and cache regression tests.

## Phase C — Workspace/RBAC foundation

- add or normalize workspace schema;
- backfill existing records;
- implement server-side scope middleware/helpers;
- add RLS where applicable;
- add negative authorization tests;
- build the super-admin workspace selector and ordinary-user behavior.

## Phase D — Shell and design system

- build the shared header, horizontal module toolbar, card tokens, and mobile layout;
- remove redundant counters/buttons/sidebar items;
- prevent collapse/minimize regressions;
- make desktop grids even.

## Phase E — Tasks, intake, and calendar

- implement canonical task state/owner model;
- merge Intake Review into auto-routing/Decisions;
- simplify task UI;
- build internal calendar;
- migrate/archive stale task states;
- ensure live scoped counts.

## Phase F — Module scoping

- Students/analysis
- Community
- Content/Research
- Live Classes
- Automations
- Communications/Integrations
- Users/Roles

Add cross-workspace tests for every module.

## Phase G — Goal Board, localization, and helper

- organize Goal Board/accountability controls;
- complete Hebrew/RTL UI;
- merge duplicate Menachem records;
- unify helper UI and memory scoping;
- wire safe action execution and audit logs.

## Phase H — Public copy, seed data, full smoke, deploy

- update provider and parent CTA copy;
- add six-month offer consistently;
- create seed/cleanup scripts;
- run mobile/desktop and role-based E2E tests;
- deploy through the existing Railway process only after local tests pass;
- run live smoke;
- report completion in the repo changelog/ledger and the configured operator channel.

---

# 15. Required automated acceptance tests

## Viewports

At minimum:

- mobile: 390 × 844
- mobile narrow: 360 × 800
- tablet: 768 × 1024
- desktop: 1440 × 900

## Public and PWA

- public homepage has no Operations loader/checkmark;
- no gap between header and hero;
- public nav has no Operations link;
- public and Operations manifests have different IDs and correct icons/start URLs;
- standalone Operations opens Operations;
- browser homepage opens homepage;
- old shortcuts reach the canonical route;
- no stale service worker serves the wrong app shell.

## Workspace isolation

For each module, prove:

- workspace A cannot retrieve workspace B data by UI or direct API;
- student A cannot retrieve student B analysis;
- ordinary users cannot enumerate workspaces/users globally;
- super admin can switch intentionally;
- selecting one workspace updates every module and helper context;
- switching workspaces clears stale student/content selections.

## Responsive UI

- no body-level horizontal overflow;
- intentional tab/filter strips scroll;
- no overlapping buttons;
- no clipped text;
- cards use the shared light-gold surface and readable text;
- headers and language switchers are consistent;
- toolbar order is stable.

## Tasks and calendar

- low-confidence intake becomes a Decision;
- high-confidence intake auto-files once;
- rerunning parser is idempotent;
- owner, status, urgency, and date remain distinct;
- blocked item shows blocker/next action;
- task appears in internal calendar;
- no duplicate Pending/Waiting/Needs Attention concepts.

## Content

- private meeting routes to Tasks/Students, not reusable Content;
- BNA content does not appear in Rabbi/One Time workspace and vice versa;
- item shows upload date, source, transcript, topics, references, and provenance;
- opening source does not destroy navigation state.

## Helper

- parent/student/provider/super-admin contexts remain isolated;
- helper performs an allowed test action through the API;
- action produces an audit record;
- high-risk action requires confirmation;
- public helper has no authenticated operator memory.

## Hebrew

- switching student portal to Hebrew localizes labels/goals/statuses and sets RTL;
- no duplicate student is created by language switching;
- duplicate Menachem migration preserves linked records.

---

# 16. Verification commands

Use the commands that exist in the checked-out repository. At minimum, where applicable:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run screenshot
npm run lighthouse
npm run openai:smoke
npm run railway:doctor
```

Add targeted Playwright tests for the acceptance criteria above.

If `npm run openai:smoke` or integration tests require unavailable credentials, run all credential-free tests, document exactly which credential is missing, and do not claim the unavailable integration passed.

Before deployment:

- back up or snapshot affected production data;
- run migration dry checks;
- verify no seed data will leak into production;
- verify `git diff` contains no secrets;
- run Railway doctor;
- deploy;
- run live health, auth, PWA, workspace, mobile, and API isolation smoke tests.

---

# 17. Commit and reporting requirements

Use small commits, for example:

1. `test: capture PWA identity and workspace-isolation regressions`
2. `fix: separate public and operations app identities`
3. `feat: enforce workspace scope across APIs`
4. `refactor: simplify operations shell and task states`
5. `feat: add internal calendar and intake decision routing`
6. `fix: scope students content communities and automations`
7. `feat: unify scoped helper and Hebrew portal behavior`
8. `test: add mobile desktop and cross-tenant end-to-end coverage`
9. `docs: update BNA memory state tasks and agent changelog`

At completion, report:

- canonical route and architecture chosen;
- files changed;
- migrations and backfills;
- records merged/archived;
- tests run with pass/fail counts;
- screenshots/viewports checked;
- Railway deployment ID and live URL checks;
- remaining genuine blockers;
- rollback instructions.

Append structured task updates to `ops/agent-task-ledger.jsonl` and completed verified work to `ops/agent-changelog.md`. Update `SYSTEM-STATE.md`, `TASKS.md`, and durable requirements in `MEMORY.md`.

---

# 18. Transcription noise to ignore

Do not treat these as BNA product requirements or create tasks from them:

- questions about the Olympic Museum;
- International Paralympic Committee member selection;
- Olympic partner-program selection;
- Olympic rings or Olympic fire;
- Kassbohrer Italia quote/status statements;
- Poste Italiane customer reviews;
- other unrelated assistant/search-result sentences inserted into the recording.

Normalize likely speech-to-text names:

- “Kodaks” means **Codex**.
- “Rabbi Sheller/Shellet” means **Rabbi Elie Scheller**.
- “Jatler/Dratl” means **Dratler**.
- “Monakum/Minocum” likely means **Menachem**; verify against existing student records before migration.
- “Mishna/Mishnah/mission community” likely refers to the existing **One Time Mishnah Class** workspace/project; verify identifiers rather than renaming blindly.

---

# 19. Definition of done

This work is done only when:

- the installed Operations app consistently opens Operations;
- the public site consistently opens the public site;
- public and Operations app identities cannot overwrite one another;
- the public loader/checkmark artifact and header/hero gap are gone;
- workspace and student data are isolated server-side;
- the super-admin selector is clear and ordinary users see only their workspace;
- the Operations shell is stable, uncluttered, and responsive;
- cards and text are consistent and readable;
- Tasks, Decisions, Blocked, Codex Queue, Done, and Calendar are understandable;
- Intake Review is absorbed into auto-routing and Decisions;
- Community, Content, Live Classes, Automations, Users, and helper context are correctly scoped;
- Content contains teaching/research material rather than private tasks and meetings;
- Hebrew portal behavior is complete and the duplicate student is safely merged;
- the helper is unified, scoped, action-capable, and audited;
- public navigation/copy is updated, including the six-month offer;
- test fixtures exercise the complete system;
- mobile, desktop, cross-workspace, and PWA regression suites pass;
- changes are committed, deployed, live-smoked, and documented.


# Appendix B — Exact durable protocol file

Write the following content to `docs/BNA-RAMBLE-TO-DONE.md`:

# BNA Start-to-Finish Ramble Protocol v3

**Repository:** `shloimie-beep/bnei-neviim-academy`
**Purpose:** Make a new GitHub-connected ChatGPT or Codex session capable of receiving a ramble, determining the actual repository state, completing the requested work, resuming safely when interrupted, and proving completion without wasting effort on repeated audits or loops.
**Version:** 3.0
**Created:** 2026-06-18

---

# 1. Fundamental rule

A prompt, plan, task, audit, screenshot, changelog line, or partial implementation is not completion.

The required lifecycle is:

1. requirement captured;
2. current implementation inspected;
3. requirement classified as existing, partial, missing, conflicting, or blocked;
4. implementation completed;
5. targeted tests passed;
6. full phase verification passed;
7. commit created;
8. deployment completed when live behavior is requested;
9. live behavior verified;
10. evidence recorded;
11. requirement closed.

No agent may claim that a run is complete while a non-blocked required item remains unverified.

---

# 2. Fresh-chat bootstrap

A new GitHub-connected ChatGPT conversation must be started with:

```text
Read `BNA-START-HERE.md` in the BNA repository, inspect the current run and current GitHub state, then process the ramble I provide according to the repository protocol. Do not restart completed work and do not trust task labels without implementation evidence.
```

The repository must contain:

```text
BNA-START-HERE.md
docs/BNA-RAMBLE-TO-DONE.md
templates/BNA-FRESH-CHAT-STARTER.md
templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md
templates/BNA-CODEX-VERIFICATION-PROMPT.md
ops/execution-runs/README.md
ops/execution-runs/latest.json
ops/execution-runs/requirements.schema.json
```

`BNA-START-HERE.md` is intentionally short. It points the new session to the durable protocol, active execution run, repository memory, and resume instructions.

A new chat does not automatically know prior conversation state. The protocol works because its durable state is committed to GitHub and the user gives the one-line bootstrap instruction above.

---

# 3. Sources of truth

Before processing a new ramble, inspect:

1. `BNA-START-HERE.md`
2. `docs/BNA-RAMBLE-TO-DONE.md`
3. `ops/execution-runs/latest.json`
4. the active run's `requirements.json`, `STATUS.md`, and `NEXT-SESSION.md`
5. `AGENTS.md`
6. `MEMORY.md`
7. `SYSTEM-STATE.md`
8. `TASKS.md`
9. newest relevant `tasks-pending/*.md`
10. recent `ops/agent-task-ledger.jsonl`
11. recent `ops/agent-changelog.md`
12. current `master`, branches, pull requests, working tree, and recent commits
13. relevant implementation and test files

Do not reread the entire repository repeatedly during one run. Produce one baseline inventory and use deltas afterward.

---

# 4. Credit- and time-efficiency policy

## 4.1 Delta-first inspection

At the beginning of a run:

- identify current branch and HEAD;
- identify the last verified run/commit;
- inspect only changes since that point;
- reuse existing route maps, audit reports, screenshots, test fixtures, and execution ledgers;
- do not rebuild tools that already exist and pass their own tests.

## 4.2 No unnecessary loops

Do not:

- run autonomous watch loops;
- start `agent:fleet --watch`;
- repeatedly poll the same status;
- run multiple agents against the same files;
- recreate the same plan after each phase;
- repeat a full UI crawl after every CSS change;
- rerun the complete test suite after every small edit;
- redeploy repeatedly to discover basic local failures;
- rewrite large files from scratch when a focused change is sufficient.

## 4.3 Test schedule

Use:

- focused tests after each requirement group;
- one phase-level test gate;
- one complete final local verification;
- one post-deployment live smoke when deployment is required.

A full Playwright/UI crawl should normally run at most:

1. once for baseline evidence, if no recent usable baseline exists;
2. once after implementation for final comparison.

Run additional targeted browser checks only for failed or ambiguous states.

## 4.4 Existing verified work

When an item appears complete:

1. inspect the implementation;
2. inspect its prior tests/evidence;
3. confirm the relevant code has not changed since that evidence;
4. run only the smallest targeted check needed;
5. mark it `closed_existing` in notes while retaining the canonical JSON status `closed`.

Do not consume credits rebuilding or re-auditing unchanged verified work.

## 4.5 External blockers

Check a missing credential, browser login, or external API once.

If unavailable:

- record the exact blocker;
- complete every credential-free step;
- provide one exact command/manual action;
- continue with unrelated requirements;
- do not loop on the unavailable dependency.

---

# 5. Ramble intake

For each new ramble, recording, transcript, screenshot set, or audit:

## 5.1 Preserve the source

Create or update:

```text
memory/YYYY-MM-DD.md
```

Record:

- source description;
- raw transcript or link;
- authoritative distilled requirements;
- normalized names and terms;
- transcription noise to ignore;
- durable product decisions;
- genuine unresolved decisions.

## 5.2 Classify each statement

Classify as:

- requirement;
- acceptance criterion;
- preference;
- context;
- transcription noise;
- genuine blocker/question.

Do not convert unrelated speech-to-text insertions into work.

## 5.3 Permanent requirement IDs

Every requirement receives a stable ID:

```text
BNA-PWA-001
BNA-OPS-002
BNA-WS-003
BNA-GOAL-004
BNA-HELPER-005
```

IDs survive across chats, branches, commits, tests, deployment, and verification.

Never silently merge unrelated requirements. Add sub-IDs when needed.

---

# 6. Current-state comparison before implementation

For every requirement, determine:

- `closed_existing`
- `partial`
- `missing`
- `conflicting`
- `blocked`

The decision must be based on actual code, tests, data migrations, deployment, and live evidence—not task labels.

The agent must produce a short baseline matrix before editing:

```text
ID | Current verdict | Evidence | Required delta
```

Long explanations belong below the matrix.

---

# 7. Execution-run files

Every substantial run must use:

```text
ops/execution-runs/YYYY-MM-DD-<slug>/
  SOURCE.md
  REQUIREMENTS.md
  requirements.json
  BASELINE.md
  PLAN.md
  STATUS.md
  EVIDENCE.md
  TEST-RESULTS.md
  DEPLOYMENT.md
  NEXT-SESSION.md
  run.json
```

Update:

```text
ops/execution-runs/latest.json
```

with:

- active run path;
- repository;
- branch;
- base branch;
- baseline commit;
- current HEAD;
- run status;
- remaining IDs;
- blocked IDs;
- last updated time.

---

# 8. Requirement JSON

Minimum shape:

```json
[
  {
    "id": "BNA-OPS-001",
    "priority": "P1",
    "area": "operations-shell",
    "source": "voice transcript 02:03-02:40",
    "requirement": "Use one clear horizontal module toolbar on mobile.",
    "acceptance_criteria": [
      "At 390px the toolbar scrolls horizontally.",
      "Controls do not wrap into uneven rows.",
      "The active module is clear.",
      "There is no body-level horizontal overflow."
    ],
    "current_verdict": "partial",
    "status": "in_progress",
    "implementation_commits": [],
    "files_changed": [],
    "tests": [],
    "evidence": [],
    "relevant_file_fingerprints": {},
    "blocker": null
  }
]
```

Allowed canonical statuses:

```text
not_started
in_progress
blocked
implemented
verified_local
verified_live
closed
```

Never use “mostly done,” “handled,” or “addressed.”

---

# 9. Codex implementation contract

Every implementation prompt must contain:

```text
IMPLEMENT THE WORK. DO NOT MERELY ANALYZE IT, CREATE TICKETS, WRITE A PLAN, OR MOVE DIFFICULT ITEMS INTO A BACKLOG.

Resume any existing working tree, branch, audit harness, execution ledger, or unfinished run before creating replacements.

Choose the practical dependency order. Do not ask for ordering confirmation unless a genuine product, security, legal, destructive-data, or paid-service decision is required.

Completing one phase does not complete the prompt.

For each requirement ID:
1. inspect current implementation and prior evidence;
2. skip unnecessary rebuilding of closed unchanged work;
3. implement the required delta;
4. add or update requirement-specific tests;
5. run focused verification;
6. commit the change;
7. deploy when required and credentials are available;
8. run targeted live verification;
9. record evidence;
10. close the requirement only when every acceptance criterion is proven.

Never claim full completion while a required non-blocked ID remains below `closed`.

If the environment or context limit interrupts the run:
- commit safe completed work;
- update all run files;
- write exact resume instructions in `NEXT-SESSION.md`;
- list remaining IDs;
- return a PARTIAL verdict;
- do not describe the overall prompt as completed.
```

---

# 10. Dependency-based implementation order

Use this default order:

1. discover and resume existing work;
2. build baseline and requirement ledger;
3. add failing regression tests;
4. canonicalize routes/runtime;
5. data model, migrations, authorization, and RLS;
6. APIs and backend behavior;
7. frontend structure and design system;
8. responsive/mobile behavior;
9. accessibility and localization;
10. integrations and helper action permissions;
11. end-to-end tests;
12. final local verification;
13. deployment;
14. live verification;
15. independent completion verification.

Do not start with cosmetic work when backend scoping or route architecture is unresolved.

---

# 11. Repository files that must stay current

## `AGENTS.md`

Keep concise. It must say:

- read `BNA-START-HERE.md` first for rambles and major builds;
- use the active execution run;
- do not claim completion without evidence;
- resume rather than restart;
- obey the credit-efficiency policy;
- record partial handoffs.

## `MEMORY.md`

Store durable rules only:

- one unified scoped OpenAI helper;
- three workspace types;
- super admin is a role/context;
- requirement-led execution;
- evidence-based completion;
- delta-first, no unnecessary loops.

## `TASKS.md`

Show the high-level queue and link to active requirement IDs. Do not duplicate the entire execution ledger.

## `SYSTEM-STATE.md`

Record the actual current architecture, deployment, canonical routes, migrations, and verified behavior. Remove or label superseded contradictory entries.

## `tasks-pending/*.md`

Use only for concrete briefs that are not already represented by an active execution run. Do not create a new brief merely to postpone implementation.

## Agent ledger/changelog

Append concise structured events, but never use the changelog as proof by itself.

---

# 12. Executable protocol support

The repository should provide:

```text
scripts/bna-execution-run.mjs
```

and package scripts similar to:

```json
{
  "bna:run:init": "node scripts/bna-execution-run.mjs init",
  "bna:run:status": "node scripts/bna-execution-run.mjs status",
  "bna:run:validate": "node scripts/bna-execution-run.mjs validate",
  "bna:run:resume": "node scripts/bna-execution-run.mjs resume"
}
```

The validator must fail when:

- required IDs are missing;
- an item is `closed` without acceptance criteria;
- closed items have no evidence;
- a live-required item lacks deployment/live evidence;
- `latest.json` points to a missing run;
- `NEXT-SESSION.md` is absent while work remains;
- duplicate requirement IDs exist.

The script must not call an LLM or run loops. It is deterministic repository tooling.

---

# 13. Evidence standards

Every closed ID needs appropriate evidence:

- commit SHA;
- relevant files;
- migration;
- test names and results;
- screenshot or visual comparison;
- API/database verification;
- deployment ID and deployed commit;
- live URL/check;
- rollback notes where applicable.

`EVIDENCE.md` must include:

```text
ID | Status | Commit | Tests | Evidence | Deployment/live
```

Keep long explanations outside tables.

---

# 14. Verification gates

Use repository-appropriate commands, including when applicable:

```bash
node --check server.js
node --check scripts/telegram-kimi-bridge.mjs
node --check scripts/agent-fleet-supervisor.mjs
npm test
npm run screenshot
npm run lighthouse
npm run openai:smoke
npm run railway:doctor
npm run bna:run:validate
```

## UI work

Require:

- 360×800;
- 390×844;
- 768×1024;
- 1440×900;
- no body overflow;
- route/tab/back-forward integrity;
- readable contrast;
- labelled controls;
- helper count/context tests;
- mobile and desktop screenshots;
- console/network checks.

## Workspace/student work

Require negative tests:

- workspace A cannot access workspace B;
- student A cannot access student B;
- ordinary users cannot enumerate globally;
- workspace changes clear stale filters, student selection, and helper context.

UI hiding is not authorization evidence.

## Live work

When the requested outcome affects production, local tests alone are insufficient.

Record:

- Railway deployment ID;
- deployed commit SHA;
- health check;
- targeted live checks;
- rollback procedure.

---

# 15. Audit versus implementation

Keep these separate:

1. **Harness creation** creates audit tooling.
2. **Audit execution** produces evidence and findings.
3. **Implementation** fixes requirement IDs.
4. **Post-fix audit** compares before and after.
5. **Independent verifier** decides whether work can close.

A completed audit harness does not mean an authenticated audit ran.

A completed audit does not mean defects were fixed.

---

# 16. Independent verifier

After Codex reports completion, run a separate verification instruction:

```text
VERIFY THE IMPLEMENTATION; DO NOT TRUST THE COMPLETION SUMMARY.

Read the original source, requirements.json, BASELINE.md, STATUS.md, EVIDENCE.md, TEST-RESULTS.md, DEPLOYMENT.md, NEXT-SESSION.md, and actual commits/diff.

For every requirement ID, independently determine whether every acceptance criterion is proven.

Inspect or rerun the smallest necessary tests, then the final gate where required.

Return:
1. branch and HEAD;
2. commits inspected;
3. tests inspected/rerun;
4. deployment/live evidence;
5. requirement-by-requirement verdict;
6. unresolved IDs;
7. regressions;
8. final verdict:

- PASS
- PASS WITH ONLY P2/P3 FOLLOW-UPS
- FAIL — REQUIRED WORK REMAINS

Do not return PASS if a P0/P1 item is partial, unverified, or failed.
```

---

# 17. Resume protocol

When interrupted, `NEXT-SESSION.md` must contain:

```text
Repository:
Branch:
Current HEAD:
Base branch:
Run directory:
Completed IDs:
Remaining IDs:
Blocked IDs:
Uncommitted changes:
Migrations:
Deployments:
Tests passed:
Tests failed:
Exact next commands:
Exact next requirement:
Risks:
Do-not-repeat notes:
```

A fresh Codex session must be told:

```text
Read `BNA-START-HERE.md`, then resume the active run from `ops/execution-runs/latest.json`. Do not restart, replace the ledger, or redo closed unchanged requirements. Continue until every non-blocked requirement is closed.
```

---

# 18. Anti-failure rules

Never accept:

- a plan as implementation;
- task creation as completion;
- a changelog line as proof;
- one generic smoke test as proof of all requirements;
- cosmetic polish while backend scoping remains unfinished;
- hard work moved into `TASKS.md` while claiming completion;
- local-only success for a live request;
- “done” without deployment/live proof where required;
- repeated audits of unchanged verified areas;
- a fresh session restarting instead of resuming;
- an agent stopping after the first phase.

---

# 19. Standard ChatGPT output for a new ramble

A GitHub-connected ChatGPT should return:

## A. Current-state verdict

Existing, partial, missing, conflicting, blocked.

## B. Distilled requirement ledger

Stable IDs and acceptance criteria.

## C. Copy Block 1 — Codex implementation prompt

Self-contained and directly pasteable.

## D. Copy Block 2 — independent verification prompt

Self-contained and directly pasteable.

## E. Files/protocol updates

Only durable workflow changes.

---

# 20. Definition of protocol success

The protocol succeeds when Shloimie can:

1. open a new GitHub-connected chat;
2. give one bootstrap sentence and one ramble;
3. receive one complete Codex execution prompt;
4. avoid rebuilding verified work;
5. resume without re-explaining;
6. get evidence per requirement;
7. know precisely what remains;
8. independently verify completion;
9. avoid wasting credits on loops and repeated full audits.
