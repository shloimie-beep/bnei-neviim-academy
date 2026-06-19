# Status

Current status: recovery run remains partial; One Time intake/API readback,
owner/admin scoped access, and the One Time Operations UI/browser-smoke gap
are locally closed. Agent Control Center smoke work and older platform items
remain open.

2026-06-19 One Time ramble/agent/integrations follow-up batch:

- Raw follow-up prompt preserved as
  `raw-input/RAW-20260619-002-next-ramble-agent-integrations-codex-prompt.md`.
- Newest Drive source discovered through the connector:
  `2026-06-18-rabbi-elie-scheller.md`, Drive ID
  `1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI`.
- Added no-write One Time Drive brief parser/preview helper, authenticated API
  preview route, Operations Meeting Drops preview button/panel, action/route
  registry entries, provider docs, operator credential handoff, and dry-run
  ingestion evidence.
- Corrected One Time local seed model so Rabbi Elie Scheller is project owner
  and Shloimie is project admin/manager; legacy `ONE_TIME_OPS_USERNAME` remains
  manager compatibility.
- Corrected active-run requirements so non-screenshot work no longer waits on
  the UI audit package. Only screenshot-specific visual findings depend on the
  uploaded audit evidence.
- Focused tests passed; no deployment, no production DB mutation, and no
  external integration write was performed.

2026-06-19 canonical intake hardening continuation:

- Preserved and staged the canonical intake parser hardening already present in
  the recovery worktree: schema defaults, ramble protocol helpers, goal-memory
  links, stable IDs, class-recording/student-question/research/content/
  communications/integration lanes, and focused parser tests.
- Added One Time scope inheritance across future parser lanes so a Drive,
  Telegram, transcript, or ramble item that clearly references Rabbi Elie,
  Scheller/Sheller, One Time, Mishnah/Mishna/Mishnayos, or Worldwide Mishnayos
  gets `workspace_key: rabbi_sheller_provider` and
  `project_key: one_time_mishnah_class` even when later split fragments do not
  repeat the workspace name.
- Added regression coverage proving generic BNA source-sheet intake does not
  inherit One Time scope.
- Added ambiguous workspace routing behavior: when an intake explicitly says
  the workspace/project is unclear, the parser creates one routing Decision and
  one review item, blocks automatic task fan-out, and avoids silently assigning
  the item to One Time just because a One Time alias appears in the question.
- Added negative scoped-helper/route evidence for One Time: project-scoped One
  Time users are denied cross-project and cross-workspace helper actions,
  secret-bearing helper tools are admin-only for scoped users, safe setup-task
  tools remain available, and key One Time admin routes assert
  `rabbi_sheller_provider` workspace access.
- No deployment, production DB mutation, external integration write, or broad
  UI crawl was performed.

2026-06-19 local raw/API readback continuation:

- Allowed scoped One Time owner/admin users to reach the canonical intake parse
  API endpoints that match their Operations `intake` view.
- Injected scoped workspace/project into canonical parse runs so a scoped One
  Time login parses into `rabbi_sheller_provider` /
  `one_time_mishnah_class`, while an attempted `bna` override returns 403
  before any raw intake row is written.
- Reused `oneTimeOwnerAssignments()` inside `ensureDefaultProjects()` so the
  server seed and parser/preview helper share the same Rabbi Owner / Shloimie
  Admin source of truth.
- Added `tests/one-time-intake-api-readback.test.js`, which VM-loads the real
  `server.js` routes with fake Express and in-memory Postgres, then proves
  raw intake, parse run, parse item, review, idempotent parse-run upsert,
  scoped owner/admin auth, and workspace override denial behavior.
- Focused tests passed 14/14; no deployment, production DB mutation, external
  integration write, Drive write, Telegram send, or broad UI crawl was
  performed.

2026-06-19 One Time Operations UI/browser smoke continuation:

- Added `tests/one-time-operations-ui-smoke.test.js`, a local Playwright
  smoke with a tiny fake Operations server and fake One Time-scoped data.
- Exposed `Agents` and `Contacts/Members` consistently for One Time
  owner/admin allowed views, provider navigation, seed metadata, and the action
  registry.
- Replaced the scoped Agents empty/denied screen with a read-only One Time
  Agent Status surface showing queue heartbeat, scoped machine-work tasks,
  blockers, and task links without Super Admin claim/submit/seal controls.
- Browser smoke proves One Time owner scope, disabled cross-workspace switcher
  entries, visible provider modules, no school-only Students/Accounting
  modules, working no-write Drive Brief preview, scoped Agents status, and
  mobile no-overflow behavior.
- Evidence written to
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/`.
- Focused tests passed 55/55; no deployment, production DB mutation, external
  integration write, Drive write, Telegram send, or broad UI crawl was
  performed.

2026-06-19 Agent Control DB/API readback continuation:

- Added `tests/agent-control-api-readback.test.js`, a VM route smoke that
  loads the real `server.js` handlers with fake Express and in-memory
  Postgres.
- Proved a safe demo task can create an Agent Run, generate a credential-free
  prompt, claim the run, post progress, attach evidence, submit a blocked
  result, seal the run, update the parent task, add a task comment/activity,
  and create exactly one linked operator Decision.
- Proved scoped non-Super Admin One Time identities cannot create or list
  Agent Control runs and no run/event rows are written before rejection.
- Focused Agent Control tests passed 7/7; `npm run bna:run:validate` passed.
- No deployment, production DB mutation, external account write, Drive write,
  Telegram send, broad UI crawl, watch loop, or agent-fleet loop was
  performed.

2026-06-19 Agent Control browser-smoke continuation:

- Added `tests/agent-control-browser-smoke.test.js`, a narrow local
  Playwright smoke for only `/operations?workspace=platform&view=agents` and
  `/operations/agents/runs/run_agent_control_smoke`.
- Proved the Super Admin Agent Control list renders the prepared run, prompt
  actions, ChatGPT handoff action, Codex Queue link, and Prepare from active
  tasks panel with fake local data.
- Proved the Agent Run portal renders the generated prompt, Run Summary,
  Progress, Evidence, Submit / Seal, and Blocker / Operator Decision controls
  without secret-shaped prompt text.
- Captured screenshots at 1440x900, 768x1024, 390x844, and 360x800 with no
  horizontal overflow and no console/page errors.
- Focused Agent Control tests passed 8/8; no broad baseline crawl,
  production DB mutation, deployment, external account write, or Agent Mode
  browser takeover was performed.

2026-06-19 Agent Control notification/audit-history continuation:

- Added private in-app Agent Run notification hooks for ready,
  blocked/operator-needed, sealed pass, sealed fail, and cancelled outcomes.
- Routed Agent Run alerts to the Operations Agents lane, while preserving the
  existing private-alert no-send copy.
- Extended the VM-backed API readback smoke to prove ready and blocked alerts
  are created with `delivery_state: in_app_only`, `no_send: true`,
  `external_write_performed: false`, and no progress-update alert spam.
- `REQ-20260618-122` is now locally implemented and moved to
  `needs_verification` pending release/live approval; the parent Agent Control
  requirements remain open for manual Agent Mode/browser-judgment smoke.
- Focused Agent Control tests passed 8/8; no deployment, production DB
  mutation, external send, broad crawl, watch loop, or agent-fleet loop was
  performed.

2026-06-19 public/parent/Operations PWA separation continuation:

- Moved `REQ-20260618-102` to local `needs_verification`.
- Preserved separate public, parent, and Operations PWA identities:
  public `/manifest.json`, parent `/parent-manifest.json`, and Operations
  `/operations-manifest.json`.
- Tightened parent and Operations manifest scopes to `/parent` and
  `/operations`, added distinct SVG icons, and committed the public
  `public/sw.js` service worker so it is no longer only a local ignored file.
- The public service worker caches only anonymous public shell assets and
  bypasses private app prefixes including Operations, Operations login, parent,
  student, provider, member/library, and One Time classroom routes.
- Added `tests/pwa-separation-contract.test.js`, which proves manifest
  identities, private-prefix bypass, no private manifest precache, correct
  manifest links, and Operations service-worker unregister behavior.
- Focused PWA contract test passed 3/3; adjacent local PWA tests also passed
  17/17 but were not used as formal run evidence because those broader test
  files remain part of the pre-existing dirty worktree.
- No deployment, production data mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 module-scoping local closeout:

- Moved `REQ-20260618-107` to local `done`.
- Added focused module-scoping contract coverage proving selected workspace
  filters are used for Community, Content, Live Classes, communications,
  integrations, automations, admin data, social/email drafts, and DNS tasks.
- Reused the One Time RBAC negative isolation test to prove scoped One Time
  identities can create safe setup tasks only inside their own
  project/workspace and cannot use secret-bearing helper tools.
- Confirmed the evidence does not rely on the pre-existing dirty
  `public/operations.html` worktree entry; the required scoping hooks are
  present in `HEAD`.
- Focused tests passed 9/9; no deployment, production DB mutation, external
  write, broad crawl, watch loop, or agent-fleet loop was performed.

2026-06-19 workspace/RBAC local closeout:

- Moved `REQ-20260618-103` to local `done`.
- Verified the canonical workspace model uses school/service_provider/family
  types with compatibility aliases instead of reviving legacy household/provider
  type drift.
- Verified the workspace directory switcher is membership-scoped, with only
  admin pseudo-workspaces available to all-scope identities.
- Verified scoped route guards for student accountability and bulk content-job
  IDs run before work starts.
- Added provider, parent/family, and student helper negative isolation tests,
  complementing the existing One Time cross-project/workspace RBAC coverage.
- Focused tests passed 15/15; no deployment, production DB mutation, external
  write, broad crawl, watch loop, or agent-fleet loop was performed.

2026-06-19 Operations shell/navigation local closeout:

- Moved `REQ-20260618-104` to local `done`.
- Verified the Operations shell exposes workspace switching, nested sidebar
  subnav, mobile drawer/header, module toolbar, status chips, route-addressable
  task/student detail pages, and a single visible helper entry.
- Updated the shell contracts to recognize the consolidated Agent Control
  `Agents` module as first-class Operations navigation instead of treating it
  as drift.
- Focused Operations shell test passed 3/3; no deployment, production DB mutation, external
  write, broad crawl, watch loop, or agent-fleet loop was performed.

2026-06-19 shared design-system local closeout:

- Moved `REQ-20260618-105` to local `done`.
- Preserved the focused shared-shell polish already present in the recovery
  worktree: Operations local toolbar/card surfaces, Agent Status and task
  activity readability, settings dashboard/action panels, integration cards,
  stable metric text, and compact mobile strip behavior.
- Verified the shared BNA shell contract across public, Operations, parent,
  student, provider, Operations login, and custom select surfaces, including
  removal of stale `Family App / Home Accountability` copy from the current
  Operations shell.
- Focused brand-shell test passed 4/4; no deployment, production DB mutation,
  external write, broad crawl, watch loop, or agent-fleet loop was performed.

2026-06-19 task manager/intake/calendar local closeout:

- Moved `REQ-20260618-106` to local `done`.
- Verified the current task manager separates Decisions, Tasks, Codex Queue,
  Blocked/Pending, Calendar, and Done / Activity so machine/Codex work does
  not become a human Pending card.
- Verified comments stay shared dialogue unless explicitly requeued, system
  comments do not requeue themselves, resolved Decisions move to Done or
  linked executable work, and Decision lifecycle actions preserve audit trail.
- Verified canonical intake behavior for unclear workspace routing: one
  routing Decision/review is created and task fan-out is blocked, while scoped
  One Time intake API readback remains idempotent and rejects BNA workspace
  overrides before writes.
- Verified the internal task calendar exposes selected-date actions and keeps
  external Google Calendar behavior dry-run/gated.
- Focused task/intake/calendar suite passed 29/29; no deployment, production
  DB mutation, external write, broad crawl, watch loop, or agent-fleet loop was
  performed.

2026-06-19 students/Goal Board/Hebrew local closeout:

- Moved `REQ-20260618-108` to local `done`.
- Preserved the student/parent portal work already present in the recovery
  worktree: scoped parent-managed student logins, child-specific login copy,
  Hebrew translations for student login and device/access states, safe
  portal-topbar navigation, RTL-friendly wrapping for long links/cards, and
  localized weekday/device labels.
- Verified Operations student detail and server routes use selected workspace
  and selected student filters; student event and Goal Board matching prefer
  linked student IDs over name aliases; Torah/group goal routes do not leak BNA
  goal data into provider workspaces.
- Verified Goal Board buckets, review gates, parent-visible/student-hidden
  metadata, device-linked accountability behavior, and Telegram Goal Board API
  field preservation.
- Focused student/portal suite passed 60/60; no deployment, production DB
  mutation, external write, broad crawl, watch loop, or agent-fleet loop was
  performed.

2026-06-19 unified helper/OpenAI local closeout:

- Moved `REQ-20260618-109` to local `done`.
- Preserved and committed the unified helper runtime already present in the
  recovery worktree: scoped helper resolution, helper safety/profile/knowledge
  modules, confirmation policy inference, side-effect levels, redaction, tool
  registry expansion, natural-language planner routes, deep-link actions,
  support-ticket/intake/automation/provider-classroom draft tools, and helper
  action-log compatibility writes.
- Verified hosted chat/content generation uses the provider-neutral
  OpenAI/Kimi fallback path and keyholder secret-loader names without exposing
  provider failures to users.
- Verified Operations helper context, profile, knowledge, tool permissions,
  confirmation gates, audit logs, mobile assistant keyboard behavior,
  provider integration secret redaction, and public helper retrieval.
- Focused helper/provider/assistant suite passed 48/48; no deployment,
  production DB mutation, external send/write, broad crawl, watch loop, or
  agent-fleet loop was performed.

2026-06-19 public copy/portal CTA local closeout:

- Moved `REQ-20260618-110` to local `done`.
- Preserved the public copy and portal-entry fixes already present in the
  recovery worktree: current BNA homepage language, updated public navigation,
  One Time landing CTAs, parent/provider/rabbi/service-provider entry headers,
  signup path copy, and public helper wording.
- Updated stale Operations shell expectations in focused tests so the
  first-class Agents module is treated as intended navigation, not drift.
- Updated public route privacy coverage for the consolidated Operations route
  declaration that also serves Agent Run portals behind `requireAdmin`.
- Focused public/CTA/privacy suite passed 46/46; no deployment, production DB
  mutation, external write, broad crawl, watch loop, or agent-fleet loop was
  performed.

Still open after this batch:

- `REQ-20260619-203` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260619-204` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260619-205` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260618-102` has local PWA separation proof; live/deploy verification
  remains withheld until explicit release approval.
- `REQ-20260618-103` has local workspace/RBAC proof; live/deploy verification
  remains withheld until explicit release approval.
- `REQ-20260618-104` has local Operations shell/navigation proof; live/deploy
  verification remains withheld until explicit release approval.
- `REQ-20260618-107` has local module-scoping proof; live/deploy verification
  remains withheld until explicit release approval.
- `REQ-20260618-110` has local public copy/portal/CTA proof; live/deploy
  verification remains withheld until explicit release approval.
- `REQ-20260619-206` has local DB/API route smoke, focused Super Admin browser
  smoke, and private notification/no-spam coverage now; it still needs manual
  Agent Mode/browser-judgment smoke before local closeout.
- Live Vimeo/Zoom/Resend/DNS/Stripe setup remains blocked on external
  owner/credential actions and explicit operator approval.

Audit-dependent screenshot remediation remains blocked pending audit output:

`Waiting for user to upload agent-review-package.zip or audit output path`

Do not mark screenshot-specific visual findings complete in this run until
audit output is available, implementation is performed, verification passes,
and live evidence exists where required. Credential-free non-screenshot work
continues without waiting on that package.

Protocol/tooling items completed in this run:

- start-here file and ramble-to-done protocol doc
- fresh-chat, implementation, and verification templates
- execution-run folder structure and schema
- deterministic `scripts/bna-execution-run.mjs` validator/resume CLI
- package scripts for init/status/validate/resume
- targeted validator tests
- initial blocked June 18 platform-completion run

2026-06-19 Agent Control Center batch:

- Raw prompt copied to `raw-input/RAW-20260619-001-agent-control-center-codex-queue-prompt.md`.
- Handoff/register created at
  `tasks-pending/2026-06-19-agent-control-center-closed-loop-verification.md`.
- Added `src/lib/bna/agent-control.js` with profiles, prompt template, run
  schema SQL, transitions, prompt rendering, and seal validation.
- Added Agent Control Center routes in `server.js` for profiles, runs,
  task verification plans, claim/progress/artifacts/submit/seal/block/resume,
  reopen, and cancel.
- Added Operations Agents module, Agent Run portal, and task-detail Agent
  Verification panel in `public/operations.html`.
- Added compact action-registry rows for the new visible actions.
- Added `tests/agent-control-center.test.js`; targeted test passes 5/5.
- Added `tests/agent-control-api-readback.test.js`; focused Agent Control
  suite now passes 7/7 and covers DB/API lifecycle plus negative scoped
  identity denial.
- Added `tests/agent-control-browser-smoke.test.js`; focused Agent Control
  suite now passes 8/8 and covers the Super Admin Agent Control list plus
  Agent Run portal across desktop, tablet, and mobile viewports.

Still open:

- No deployment or production mutation was performed.
- Manual Agent Mode smoke remains open. Agent Run notification/no-spam hooks
  now have local API proof.
- Audit-dependent `REQ-20260618-101` through `REQ-20260618-111` remain blocked
  on the external audit package only.
