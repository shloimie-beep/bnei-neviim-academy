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
