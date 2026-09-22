# Status

Current status: One Time master recovery local execution is terminal through
`REQ-20260619-314`. Local verification is green; commit/push/PR/deploy/Railway
doctor/live smoke and the remaining provider-owner setup remain explicitly
operator-gated.

2026-06-19 One Time master recovery Batch 14 checkpoint:

- `REQ-20260619-314` final verification, commit, push, deploy, and live smoke
  loop is terminal as `needs_operator_decision`.
- Final local repair/verification work kept provider API key helper tools
  admin-only for scoped helpers, aligned the default Operations allowedViews
  fallback with the Agents module, and updated stale tests to the current
  Agents toolbar/auth contract.
- Full local verification passed: `npm test` 901/901, focused RBAC/final-
  surface suites, syntax checks, active-run validation, JSON/ledger parse,
  tracked secret audit, and watchdog audit.
- `npm run smoke:local -- --skip-tests --no-env-file` was attempted and
  stopped before server start because `DATABASE_URL`, `OPS_USERNAME`, and
  `OPS_PASSWORD` were intentionally unavailable with env-file loading
  disabled.
- Watchdog gap was repaired by adding
  `tasks-pending/2026-06-19-website-ramble-correction-audit.md`; final
  watchdog report `ops/watchdog-audits/2026-06-19T12-00-watchdog-audit.md`
  passed with severity `ok` and finding_count `0`.
- No commit, push, PR update, deploy, Railway doctor, production smoke,
  authenticated live role smoke, screenshots, production DB mutation,
  domain/DNS action, billing, Zoom/Vimeo/Buffer/Sefaria action, source corpus
  mutation, portal publication, or external send was performed.
- Remaining next action is operator approval of the exact release scope:
  stage/commit/push/PR, Railway deploy/doctor, live smoke identities/routes,
  screenshot capture, and live BNA-vs-One-Time data-isolation proof.

2026-06-19 One Time master recovery Batch 13 checkpoint:

- `REQ-20260619-313` One Time deployment, domain, and Option B readiness is
  terminal as `needs_operator_decision`.
- Local implementation added `ops/one-time-mishnah/option-b-deployment-
  readiness.json`, `ops/one-time-mishnah/one-time-option-b-deployment-
  readiness.md`, and `tests/one-time-deployment-readiness.test.js`.
- The readiness packet covers Option B architecture, deployment profile,
  identity map, database installation identity guard, schema-vs-seed
  separation, Railway runbook, cost worksheet, asset ownership register,
  domain/DNS checklist, rollback plan, backup plan, staging smoke plan, and
  production launch plan.
- Focused deployment readiness verification passed 6/6.
- No deploy, live smoke, Railway resource creation, database create/attach,
  Railway variable write, DNS/domain change, production DB mutation, external
  send, billing, GHL, or external connector write was performed.
- Exact next requirement is `REQ-20260619-314` final verification, commit,
  push, deploy, and live smoke loop.

2026-06-19 One Time master recovery Batch 12 checkpoint:

- `REQ-20260619-312` Sefaria and scoped study assistant readiness is terminal
  as `needs_operator_decision`.
- Local implementation added `src/lib/bna/study-assistant-readiness.js`, an
  approved source-version metadata contract, content hashing without body
  return, scoped retrieval previews, restricted/raw/cross-student blockers,
  additive source-version and study-assistant audit schema, a protected
  readiness route, route registry coverage, and a no-write Operations
  readiness panel.
- The existing One Time classroom bot remains disabled pending explicit
  operator approval; no answer generation or unrestricted AI chat was enabled.
- Focused verification passed: syntax checks, study assistant 6/6,
  parent/public-helper/transcript privacy 34/34, classroom/community 14/14,
  and Operations scoping/UI 7/7.
- No deploy, live smoke, production DB mutation, Sefaria/API ingestion,
  arbitrary translation merge, source corpus mutation, assistant answer
  generation, portal publication, raw transcript retrieval, cross-student
  retrieval enablement, billing, DNS/Railway propagation, GHL, or external
  connector write was performed.
- Exact next requirement is `REQ-20260619-313` One Time deployment, domain, and
  Option B readiness.

2026-06-19 One Time master recovery Batch 11 checkpoint:

- `REQ-20260619-311` community and moderation workflow is terminal as
  `needs_operator_decision`.
- Local implementation added a community moderation helper, private question
  review draft, private-to-public anonymization preview, additive audit/history
  schema fields, moderation event table, protected readiness route, route
  registry row, and a no-write Operations readiness panel.
- Existing member responses remain hidden/review-only with
  `visible_to_classroom: false`, screening flags, and no unrestricted
  student-to-student messaging.
- Focused verification passed: syntax checks, community workflow 8/8,
  classroom/community neighbor 18/18, Operations scoping/UI 7/7, and
  WS11/parent/badge 16/16.
- No deploy, live smoke, production DB mutation, public/member community
  publication, external notification, deletion purge, unrestricted student
  messaging enablement, billing, DNS/Railway propagation, GHL, or external
  connector write was performed.
- Exact next requirement is `REQ-20260619-312` Sefaria and scoped study
  assistant readiness.

2026-06-19 One Time master recovery Batch 10 checkpoint:

- `REQ-20260619-310` server-side gamification and badge auditing is terminal
  as `needs_operator_decision`.
- Local implementation added automatic/Rabbi-awarded badge catalogs,
  configurable thresholds, stable idempotency keys, source evidence,
  parent-safe explanations, reversal drafts, badge audit schema, a protected
  readiness route, and a no-write Operations badge audit panel.
- Public One Time classroom no longer renders a ranked public points
  leaderboard; it renders Approved Participation from `participation_summary`
  and keeps the member-safe `leaderboard` payload empty.
- Focused verification passed: syntax checks, gamification/badge 13/13,
  WS11/parent/forum 15/15, classroom policy 11/11, and Operations scoping/UI
  7/7.
- No deploy, live smoke, production DB mutation, live badge award,
  Rabbi-awarded badge write, badge reversal, parent/student notification,
  automatic access grant, prize/coupon/credit, public individual leaderboard,
  billing, DNS/Railway propagation, GHL, or external connector write was
  performed.
- Exact next requirement is `REQ-20260619-311` community and moderation
  workflow.

2026-06-19 One Time master recovery Batch 9 checkpoint:

- `REQ-20260619-309` transcript privacy and knowledge scoping is terminal as
  `needs_operator_decision`.
- Local implementation added `src/lib/bna/transcript-privacy.js`, a protected
  no-write readiness route, route-registry coverage, and a Transcript Privacy /
  Knowledge Scope panel in Operations.
- The local contract covers transcript version metadata, timestamped segment
  and speaker confidence metadata, privacy classes, student matching/review
  states, audience-scoped retrieval previews, public-helper raw transcript
  guardrails, and live-release blockers.
- Focused verification passed: syntax checks, transcript privacy 6/6, public
  helper/privacy 19/19, classroom/portal/content 37/37, Operations scoping/UI
  7/7, and Zoom/Vimeo regression 11/11.
- No deploy, live smoke, production DB mutation, raw transcript import,
  transcript publication, vector/public-helper corpus mutation, cross-student
  retrieval enablement, portal publish, send, billing, DNS/Railway propagation,
  GHL, or external connector write was performed.
- Exact next requirement is `REQ-20260619-310` server-side gamification and
  badge auditing.

2026-06-19 credential-and-meeting-intake closeout:

- Secured the temporary Resend handoff file
  `C:\Users\User\Downloads\resend one time env.txt` into the local keyholder
  archive at
  `C:\Users\User\BNA-Keyholder\archived-source\2026-06-19-resend-one-time\resend-one-time-env-425f2ccf2704f615.source.txt`.
- The source was a single bare secret value, not `NAME=value` env lines. It was
  installed only into the BNA keyholder and ignored `.secrets` runtime flow,
  then deleted from Downloads after hash/fingerprint verification.
- Resend read-only provider diagnostics passed: credentials are present and
  the domain list can be read, but `RESEND_FROM` / `RESEND_FROM_EMAIL` and
  `RESEND_DOMAIN` are still missing.
- Railway Resend propagation was dry-run only and skipped because the Resend
  group is incomplete. No Railway variable was changed, no automatic
  deployment occurred, and no email/DNS/provider write was performed.
- Provider readiness states were recorded separately for Resend, Zoom, Vimeo,
  Stripe, and Green Invoice. Zoom/Vimeo app credentials remain read-only
  verified; Vimeo user access, Stripe live billing, Green Invoice credentials,
  and Resend sender/domain/DNS remain operator-gated.
- Connected Drive search confirmed the newest accessible Rabbi Elie Scheller /
  One Time meeting source is still `2026-06-18-rabbi-elie-scheller.md`, Drive
  ID `1QondCYFKL0CB6K9wkjVL7aa7enbPBmzI`, modified
  `2026-06-18T17:16:21.504Z`.
- The exact source was already parsed by
  `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/`; this batch
  created a redacted reconciliation packet instead of duplicate visible rows:
  `ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/`.
- Created future-only backlog input:
  `ops/one-time-mishnah/next-master-backlog-input.md`. It does not claim
  implementation and does not start the master backlog.
- Added `REQ-20260619-209`, `REQ-20260619-210`, and `REQ-20260619-211` as
  done for this safe local batch. `REQ-20260619-207` remains
  `needs_operator_decision` for remaining Resend sender/domain/DNS/Railway,
  Vimeo user access/manual policy, Stripe live billing, and Green Invoice
  credentials.
- Final focused validation for this checkpoint passed:
  `npm run bna:run:validate` reports `blocked: 1`,
  `needs_operator_decision: 1`, and `done: 32`.
- `node scripts/audit-secrets.mjs` passed with 0 tracked secret-risk files.
- Full `git diff --check` passed with line-ending warnings only.

2026-06-19 approved release closeout:

- Operator approval covered production env propagation, Railway deploy, focused
  live smoke, and release-gated closeout for already implemented work.
- Deployed commit:
  `22fcff0d9665cb9638e4835a20cd8a962d79a4a8`.
- Railway deployment
  `43e590dd-934d-4ba1-98aa-02845b15b6bf` initially crashed because
  `server.js` required the previously untracked
  `src/lib/bna/telegram-runtime-status.js`.
- Commit `22fcff0d` added the missing runtime helper; Railway deployment
  `f9921a2d-d614-44df-88c0-392d810ddebd` then reached `SUCCESS` for service
  `skillful-motivation` in `production`.
- Zoom Server-to-Server OAuth values and Vimeo app client credentials were
  propagated to Railway with secret values redacted and fingerprint-only
  evidence. Resend fields and Vimeo user-level upload access remain absent.
- Focused live smokes passed after the successful deployment:
  public route privacy, parent PWA setup, generic live app smoke, and approved
  release smoke covering PWA separation, provider readiness/no-write guards,
  and a safe temporary Agent Control seal cycle.
- `npm run bna:run:validate` passed after the requirement-status update with
  counts `blocked: 1`, `needs_operator_decision: 1`, `done: 29`.
- Closed release-gated rows:
  `REQ-20260618-102`, `REQ-20260618-112` through `REQ-20260618-118`,
  `REQ-20260618-120`, `REQ-20260618-122`, and `REQ-20260619-206`.
- Still open:
  `REQ-20260618-101` is blocked on the missing audit package/output path.
  `REQ-20260619-207` remains `needs_operator_decision` for Resend API/from/
  domain/DNS setup and Vimeo user-level upload/library access or an approved
  manual operating policy.

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

2026-06-19 safe test-data/acceptance coverage local closeout:

- Moved `REQ-20260618-111` to local `done`.
- Added a dry-run-first `TEST_REQ022` seed harness and package script for safe
  school, service-provider, family, workspace-role, student, assignment, task,
  Decision, calendar, content/research, community, automation, Hebrew portal,
  helper-audit, and cleanup fixtures.
- Generated seed and cleanup dry-run artifacts under
  `ops/seed-runs/2026-06-18-req022-local/` and
  `ops/seed-runs/2026-06-18-req022-cleanup-local/`.
- Added active-run acceptance coverage that proves locally done requirements
  have evidence and verification, with release/no-deploy handling for
  live-visible rows.
- Focused safe-seed/acceptance/Agent Control suite passed 14/14; no deployment,
  production DB mutation, external write, broad crawl, watch loop, or
  agent-fleet loop was performed.

2026-06-19 Agent Control manual-smoke prompt closeout:

- Moved `REQ-20260618-112`, `REQ-20260618-122`,
  `REQ-20260618-123`, and `REQ-20260619-206` to
  `needs_verification`.
- Added the copy-ready manual Agent Mode smoke prompt at
  `ops/agent-control/2026-06-19-manual-agent-mode-smoke.md`.
- Added `tests/agent-control-manual-smoke-prompt.test.js` to prove the prompt
  includes the safe run key, acceptance criteria, progress/evidence/Decision/
  Seal Run steps, no-deploy/no-production guardrails, and no secret-shaped
  values.
- Focused Agent Control/manual-prompt/acceptance suite passed 11/11.
- `npm run bna:run:validate` passed with status counts
  `needs_verification: 13`, `blocked: 2`, `done: 16`.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed. Actual manual Agent Mode/browser-
  judgment execution and release/live approval remain open verification gates.

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
  smoke, private notification/no-spam coverage, safe seed coverage, and a
  copy-ready manual prompt now; it still needs actual manual Agent Mode/browser
  judgment and release/live approval before final closeout.
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
- Only `REQ-20260618-101` and screenshot-specific visual findings remain
  blocked on the external audit package. Credential-free non-screenshot work
  continues without waiting on that package.

2026-06-19 Agent Control interactive browser proof:

- Added an interactive Super Admin browser smoke to
  `tests/agent-control-browser-smoke.test.js`.
- The smoke uses the existing fake local Agent Run fixture only. It opens the
  real Operations Agent Run portal, clicks `Claim Run`, posts progress,
  attaches local evidence, submits a passing result, seals the run, reloads the
  detail page, and verifies persisted `Sealed Pass` readback.
- Evidence generated under
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/`:
  `interactive-report.md`, `interactive-report.json`, and
  `interactive-run.png`.
- Focused Agent Control/active-run suite passed 12/12.
- `npm run bna:run:validate` passed with status counts
  `needs_verification: 13`, `blocked: 2`, `done: 16`.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

Still open after interactive proof:

- Manual Agent Mode/browser-judgment smoke remains open.
- Release/live verification remains withheld until explicit operator approval.
- `REQ-20260618-101` remains blocked on the external audit package/output.

2026-06-19 Agent Control manual browser judgment proof:

- Completed the manual Agent Mode/browser-judgment smoke with the in-app
  browser against a fake local Operations server.
- The browser opened the Super Admin Platform Agent Run portal, claimed the
  run, posted progress, attached evidence, submitted/sealed a
  `needs_operator` result, reloaded the portal, and read back `STATUS Blocked`.
- The local route created exactly one linked Decision:
  `DEC-MANUAL-001`.
- Evidence generated under
  `ops/playwright-smokes/2026-06-19-agent-control-manual-browser/`:
  `manual-browser-report.md`, `manual-browser-report.json`, and
  `manual-browser-dom-snapshot.txt`.
- Moved `REQ-20260618-121` and `REQ-20260618-123` to `done` because their
  local verification/manual Agent Mode proof gates are now satisfied.
- Kept live-required Agent Control rows in `needs_verification` because
  deployment/live proof is still withheld until explicit operator approval.
- Focused Agent Control/active-run suite passed 12/12 after the status change.
- `npm run bna:run:validate` passed with status counts
  `needs_verification: 11`, `blocked: 2`, `done: 18`.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

Still open after manual browser proof:

- Live-required rows need explicit release approval before deploy/live smoke:
  `REQ-20260618-102`, `REQ-20260618-112` through `REQ-20260618-118`,
  `REQ-20260618-120`, `REQ-20260618-122`, and `REQ-20260619-206`.
- `REQ-20260618-101` remains blocked on the external audit package/output.
- `REQ-20260619-207` remains blocked on external owner/credential actions.

2026-06-19 release-gate normalization:

- Converted the remaining live-required local-complete rows from generic
  `needs_verification` to `needs_operator_decision`.
- The affected rows are `REQ-20260618-102`, `REQ-20260618-112` through
  `REQ-20260618-118`, `REQ-20260618-120`, `REQ-20260618-122`, and
  `REQ-20260619-206`.
- Each row now names the same external blocker: explicit operator release
  approval is required before deployment, production data mutation, live smoke,
  or live closeout.
- No credential-free implementation row remains `in_progress` or
  `needs_verification`.
- `npm run bna:run:validate` passed with status counts `blocked: 2`,
  `needs_operator_decision: 11`, `done: 18`.
- The only remaining open work is external: release approval, audit
  package/output, and Vimeo/Zoom/Resend owner/credential actions.

2026-06-19 Zoom/Vimeo credential secure install:

- Secured the temporary `C:\Users\User\Downloads\codes` handoff into the local
  keyholder archive at
  `C:\Users\User\BNA-Keyholder\incoming\2026-06-19-zoom-vimeo-codes`.
- Installed normalized Zoom Server-to-Server OAuth fields and Vimeo app
  credentials into the local keyholder plus ignored `.secrets/` runtime files.
- Corrected the Zoom client ID from the screenshot after a read-only variant
  test proved the text handoff value was not the working client ID.
- Deleted `C:\Users\User\Downloads\codes` after verifying all original source
  file hashes existed in the secure keyholder archive.
- Added redacted provider credential diagnostics and tests. Final live
  diagnostics show Zoom `token_ready` with 39 scopes and Vimeo
  `client_credentials_ready` with one public scope. Returned access tokens were
  fingerprinted only and not stored.
- `npm run bna:run:validate` passed with status counts `blocked: 1`,
  `needs_operator_decision: 12`, `done: 18`.
- Moved `REQ-20260619-207` from generic `blocked` to
  `needs_operator_decision`: Zoom and Vimeo app auth are locally proven, while
  Resend, Vimeo user-level upload/library access, production env propagation,
  live writes, deployment, and live smoke still require explicit operator
  approval or owner action.
- No meeting creation, video upload, email send, deployment, production DB
  mutation, or production env mutation was performed.

## 2026-06-19T12:05:00+03:00 - One Time Master Recovery Batch 0

- Raw packet preserved as `raw-input/RAW-20260619-005-one-time-master-recovery-backlog-ui-launch.md`.
- Register created as `tasks-pending/2026-06-19-one-time-master-recovery-register.md`.
- Master reconciliation matrix created as `ops/one-time-mishnah/master-backlog-reconciliation.md` and `ops/one-time-mishnah/master-backlog-reconciliation.json`.
- Preflight verified branch `codex/agent-control-center-20260619` at `cae87855f1e140668741cb2eeba90dc9dd68abf9`, PR #5 open/draft, Railway deployment `f9921a2d-d614-44df-88c0-392d810ddebd`, active run validation, secret audit, diff check, and production live app smoke.
- No application runtime, production data, external account, DNS, email, WhatsApp, Zoom, Vimeo, billing, or deploy write was performed in this Batch 0 artifact pass.

## 2026-06-19T12:45:00+03:00 - One Time Master Recovery Batch 1

- `REQ-20260619-301` is done locally.
- Hardened `scripts/bna-execution-run.mjs` so validation now checks registered
  source metadata, statement matrix mapping, positive live deployment evidence,
  repo evidence path existence, blocker owner/next action, git refs, duplicate
  active runs, and stale `NEXT-SESSION.md` handoffs.
- Extended validator tests in `tests/bna-execution-run.test.js` to cover the
  new pass/fail cases.
- Updated `ops/execution-runs/requirements.schema.json`,
  `docs/BNA-RAMBLE-TO-DONE.md`, `BNA-START-HERE.md`, the Codex
  implementation/verification templates, and `ops/execution-runs/README.md`.
- Added active-run source metadata for `RAW-20260619-005`, pointed the run at
  `ops/one-time-mishnah/master-backlog-reconciliation.json`, and added explicit
  owner/next-action fields for open blocker rows.
- No app runtime change, production data mutation, deploy, live smoke, external
  send, billing, DNS, Zoom, Vimeo, or new Railway resource action was performed.
- Next exact requirement: `REQ-20260619-302` read-only task and Decision census.

## 2026-06-19T12:58:00+03:00 - One Time Master Recovery Batch 2

- `REQ-20260619-302` is terminal as `needs_operator_decision`.
- Added `scripts/task-decision-census.mjs` and
  `tests/task-decision-census.test.js`.
- Ran a read-only live/API task census against `/api/bna/tasks`; 792 tasks were
  read and no production write was performed.
- Redacted report:
  `ops/task-decision-census/2026-06-19T09-29-03-110Z-task-decision-census.md`.
- Census summary: Decisions 18, Tasks 336, Codex Queue 6, Pending 153,
  Calendar 19, Done / Activity 260.
- Dry-run cleanup plan: 57 duplicate groups, 64 findings, 121 reversible
  approval-gated cleanup actions.
- Private household/family/student/parent/person scope keys were fingerprinted
  in the generated evidence.
- Production cleanup apply is blocked on operator approval for the exact action
  family to apply.
- Next exact requirement: `REQ-20260619-303` One Time workspace users, roles,
  and authorization model.

## 2026-06-19T13:08:00+03:00 - One Time Master Recovery Batch 3

- `REQ-20260619-303` is terminal as `needs_operator_decision`.
- Added canonical One Time role contract helper
  `src/lib/bna/one-time-role-model.js` with compatibility mappings for Rabbi
  Elie Scheller as `workspace_owner`, Shloimie as scoped
  `workspace_manager`, and Shloimie's platform-super-admin metadata.
- Decorated Operations identities in `server.js` with canonical role labels
  while preserving existing `project_owner` / `project_manager` route roles.
- Added canonical membership metadata to the One Time seed and exposed
  canonical role fields in auth/membership payloads.
- Updated `public/operations.html` so existing Users/Access and workspace badge
  UI prefer canonical role labels when present.
- Updated `docs/architecture/workspace-community-provider-role-map.md` with the
  canonical role table and no-write persistence gate.
- Added negative/contract coverage for cross-workspace user reads, owner
  protection, permanent removal gating, parent-child scope, student enrollment
  scope, and no-write role-change audit preview.
- Focused local verification passed, including the local Playwright One Time
  Operations UI smoke.
- No deployment, production DB mutation, invite/remove/deactivate persistence,
  external send, billing, DNS, Zoom, Vimeo, or Railway resource action was
  performed. Release/live smoke and any real external-access persistence remain
  blocked on explicit operator approval.
- Next exact requirement: `REQ-20260619-304` Operations UI and shared design
  system remediation.

## 2026-06-19 - One Time Master Recovery Batch 4

- `REQ-20260619-304` is terminal as `needs_operator_decision`.
- Added a credential-free current-state UI/design-system delta audit:
  `scripts/one-time-ui-design-delta-audit.mjs`.
- Added focused audit tests:
  `tests/one-time-ui-design-delta-audit.test.js`.
- Generated current no-write audit evidence:
  `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.md` and
  `audit.json`.
- Required surfaces passed source/evidence coverage: Operations overview,
  Tasks/Decisions, Contacts, Communications, WhatsApp, Email, Community,
  Content, Live Classes, Schedule, Integrations, Settings, Agents, One Time
  public pages, Parent portal, Student portal, Provider portal, Member library,
  and Classroom.
- Current local UI/design contracts passed for top toolbar, module toolbar,
  mobile toolbar scrolling, tappable/wrapping actions, fixed filter dropdowns,
  cards/lists/loading/empty/error states, page overflow guard, and shared portal
  mobile shells.
- Remaining warning: admin/debug-adjacent raw JSON presentations remain in
  advanced panels and should be polished or explicitly accepted later.
- Blocking decision: the full authenticated Operations audit package is blocked
  until local storage state is created with `npm run ops:audit:auth` and the
  operator approves the authenticated `npm run ops:audit` / release live-smoke
  path.
- No deployment, production DB mutation, external write, broad crawl,
  authenticated crawl, external send, billing, DNS, Zoom, Vimeo, or Railway
  resource action was performed.
- Next exact requirement: `REQ-20260619-305` first-party communications
  workspace for WhatsApp and email.

## 2026-06-19 - One Time Master Recovery Batch 5

- `REQ-20260619-305` is terminal as `needs_operator_decision`.
- Updated `public/operations.html` so the WhatsApp/WAPI phonebook workspace has
  explicit three-pane desktop semantics, mobile list/conversation/details jump
  controls, back-to-list navigation, sticky local action area, workspace/linked
  record details, and no-send local correction actions.
- Updated Communications > Email with a first-party operator workspace covering
  sender/domain/recipient/confirmation readiness gates, local draft editor
  fields for from identity, reply-to, recipients, subject, template,
  workspace/project, related record, and body preview, plus locked send controls.
- Updated `server.js` and `src/lib/integrations/resend-client.js` so local
  Resend email drafts preserve reply-to metadata and approved sends can pass
  `reply_to` through the existing `SEND_RESEND_EMAIL` approval-gated path.
- Added `tests/one-time-communications-workspace.test.js` to pin the One Time
  WhatsApp/email operator UX and no-send/approval contracts.
- Focused local communications tests passed 26/26 and local Operations
  smoke/layout tests passed 16/16.
- No deployment, live smoke, production DB mutation, email send, WhatsApp send,
  DNS/Railway propagation, WAPI outbound use, billing, Zoom, Vimeo, Buffer,
  GHL, or external-account write was performed.
- Blocking decision: operator must approve release/live smoke for app-visible
  changes and separately approve exact Resend sender/domain/DNS/Railway or
  WAPI/WhatsApp/email send tests before any external send/write.
- Next exact requirement: `REQ-20260619-306` One Time product, schedule,
  booking, portal, and billing readiness.

## 2026-06-19 - One Time Master Recovery Batch 6

- `REQ-20260619-306` is terminal as `needs_operator_decision`.
- Added a safe local One Time product readiness contract in
  `src/lib/bna/one-time-product-system.js` covering product model, schedule
  and cohorts, consultation booking, parent portal, student portal, provider
  portal, and billing/access gates.
- The admin product-system API now returns `product_readiness` from
  `/api/bna/one-time/product-system` using already-loaded tier, provider,
  schedule, and calendar state.
- Operations now renders a `Product Readiness` panel inside the existing Rabbi
  / One Time launch and tiers surfaces, including explicit no-checkout,
  no-invoice, no-payment-link, no-Zoom, no-send, and no-portal-publish gates.
- Focused product verification passed 7/7, adjacent checkout/classroom/portal
  verification passed 68/68, and local Operations smoke/layout verification
  passed 16/16.
- No deployment, live smoke, production DB mutation, checkout, charge, invoice,
  payment link, subscription, access automation, Zoom/calendar write, portal
  publish, email/WhatsApp/Telegram send, billing provider write, or external
  account write was performed.
- Blocking decision: operator must approve release/live smoke for app-visible
  changes and separately approve the billing provider of record, refund/
  cancellation/failed-payment policy, real schedule/booking rules, Zoom/
  calendar writes, portal publishing, and any external sends before live
  execution.
- Next exact requirement: `REQ-20260619-307` Zoom attendance and session
  automation.

## 2026-06-19 - One Time Master Recovery Batch 7

- `REQ-20260619-307` is terminal as `needs_operator_decision`.
- Added safe local Zoom automation helpers in `src/lib/integrations/zoom.js`
  for session automation preview, registrant staging preview, join redirect
  guardrails, webhook attendance preview, and attendance correction drafts.
- Added protected no-write admin API routes for session automation preview,
  webhook attendance preview, and attendance correction preview. The existing
  live meeting creation route remains blocked.
- Operations now renders a `Zoom Attendance Automation` readiness panel in the
  One Time Live Classes view with explicit no-meeting, no-registrant,
  no-webhook-write, no-redirect, no-send, no-portal-publish, and no-attendance-
  mutation copy.
- Focused Zoom automation verification passed 6/6, integration/live-class
  verification passed 18/18, Operations scoping/UI verification passed 7/7,
  adjacent checkout/classroom/portal verification passed 68/68, and product/
  Drive verification passed 11/11.
- No deployment, live smoke, production DB mutation, Zoom meeting creation,
  Zoom registrant write, live webhook acceptance, join redirect exposure,
  attendance mutation, external send, portal publish, billing, DNS/Railway,
  Vimeo, GHL, or external-account write was performed.
- Blocking decision: operator must approve release/live smoke for the
  app-visible/API Zoom automation changes and separately approve
  `DEC-20260619-304` before any real Zoom meeting creation, registrant write,
  live webhook acceptance, join redirect exposure, attendance mutation,
  external send, or portal publish.
- Next exact requirement: `REQ-20260619-308` recording, transcript, summary,
  and Vimeo publication pipeline.

## 2026-06-19 - One Time Master Recovery Batch 8

- `REQ-20260619-308` is terminal as `needs_operator_decision`.
- Added safe local recording/Vimeo helpers in
  `src/lib/integrations/video-hosting.js` for recording pipeline preview,
  publication readiness preview, and retention/deletion preview.
- Added protected no-write admin API routes for recording pipeline,
  publication, and retention previews. The existing video upload route remains
  blocked.
- Operations now renders a `Recording / Vimeo Pipeline` readiness panel inside
  the One Time Library workspace with explicit no-provider-webhook,
  no-recording-fetch, no-upload, no-publish, no-unpublish, no-delete,
  no-member-visibility, no-watch-progress-write, no-notification-send, and
  no-portal-publish copy.
- Focused recording/Vimeo verification passed 5/5, integration/live-class/
  provider-secret verification passed 23/23, Operations content/UI
  verification passed 11/11, and adjacent product/Drive/classroom verification
  passed 17/17.
- No deployment, live smoke, production DB mutation, provider webhook
  acceptance, recording fetch, Vimeo upload, publish, unpublish, delete,
  member visibility, watch-progress write, notification send, portal publish,
  billing, DNS/Railway, GHL, or external-account write was performed.
- Blocking decision: operator must approve release/live smoke for the
  app-visible/API recording/Vimeo changes and separately approve Vimeo
  user-level upload/library access or a manual Vimeo ID policy before any real
  provider webhook, recording fetch, upload, publish, unpublish, delete,
  member visibility, watch-progress write, notification send, or portal publish.
- Next exact requirement: `REQ-20260619-309` transcript privacy and knowledge
  scoping.

## 2026-06-19 - One Time Master Recovery Batch 12

- `REQ-20260619-312` is terminal as `needs_operator_decision`.
- Added safe local Sefaria/study-assistant readiness helper in
  `src/lib/bna/study-assistant-readiness.js` for approved source-version
  metadata, SHA-256 content hashes, no-body-return previews, scoped retrieval
  decisions, restricted/raw/cross-student blocks, and disabled launch gates.
- Added additive local schema for One Time source versions and study assistant
  audit events. The schema records metadata, permissions, scope, approval,
  citation/licensing state, and `source_text_returned: false`; it does not add
  assistant answer generation or source body publication.
- Added protected no-write admin API route
  `/api/bna/one-time/study-assistant-readiness`; the existing One Time
  classroom bot remains disabled pending explicit operator approval.
- Operations now renders a `Sefaria / Study Assistant Readiness` panel inside
  the One Time Library workspace with explicit no-unrestricted-AI-chat,
  no-Sefaria/API-ingestion, no-translation-merge, no-corpus-mutation,
  no-raw-transcript-retrieval, no-cross-student-retrieval, no-portal-publish,
  and no-answer-generation copy.
- Focused study-assistant verification passed 6/6, parent/public-helper/
  transcript privacy verification passed 34/34, classroom/community
  verification passed 14/14, and Operations scoping/UI verification passed 7/7.
- No deployment, live smoke, production DB mutation, Sefaria/API ingestion,
  arbitrary translation merge, source corpus mutation, assistant answer
  generation, portal publication, raw transcript retrieval, cross-student
  retrieval enablement, billing, DNS/Railway, GHL, or external-account write
  was performed.
- Blocking decision: operator must approve release/live smoke and separately
  approve source licensing, citation verification, Rabbi approval policy,
  scoped retrieval readback, transcript privacy proof, Sefaria/API ingestion
  policy, and assistant launch scope before enabling any live study assistant
  behavior.
- Next exact requirement: `REQ-20260619-313` One Time deployment, domain, and
  Option B readiness.
