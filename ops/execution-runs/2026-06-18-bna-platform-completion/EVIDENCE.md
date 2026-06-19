# Evidence

2026-06-19 approved release closeout evidence:

- Deployed commit:
  `22fcff0d9665cb9638e4835a20cd8a962d79a4a8`.
- Railway deployment results:
  `43e590dd-934d-4ba1-98aa-02845b15b6bf` crashed before the runtime helper fix;
  `f9921a2d-d614-44df-88c0-392d810ddebd` reached `SUCCESS` after commit
  `22fcff0d`.
- Railway doctor:
  `powershell -ExecutionPolicy Bypass -File scripts/railway-doctor.ps1` passed
  after deployment `f9921a2d-d614-44df-88c0-392d810ddebd`.
- Provider env propagation evidence:
  `ops/qa-runs/2026-06-19T07-51-23-963Z-provider-env-railway-propagation.md`.
- Final provider env audit:
  `ops/qa-runs/2026-06-19T08-05-01-508Z-provider-env-railway-audit.md`.
- Provider diagnostic evidence:
  `ops/qa-runs/2026-06-19T07-52-10-040Z-provider-credential-diagnostics.md`.
- Passing live smoke evidence:
  `ops/live-smokes/2026-06-19T08-04-18-423Z-approved-release-live-smoke.md`,
  `ops/live-smokes/2026-06-19T08-04-19-521Z-live-app-smoke.md`,
  `ops/live-smokes/2026-06-19T08-04-43-085Z-public-route-privacy-smoke.md`,
  and
  `ops/live-smokes/2026-06-19T08-04-19-023Z-parent-pwa-tablet-filter-setup-live-smoke.md`.
- Pre-fix crash evidence retained:
  `ops/live-smokes/2026-06-19T07-58-45-073Z-approved-release-live-smoke.md`,
  `ops/live-smokes/2026-06-19T07-58-45-441Z-live-app-smoke.md`,
  `ops/live-smokes/2026-06-19T07-59-00-225Z-public-route-privacy-smoke.md`,
  and
  `ops/live-smokes/2026-06-19T07-58-44-949Z-parent-pwa-tablet-filter-setup-live-smoke.md`.
- Active-run validation after requirement closeout:
  `npm run bna:run:validate` passed with `blocked: 1`,
  `needs_operator_decision: 1`, and `done: 29`.
- Safety checks for this documentation closeout:
  `git diff --check` and `node scripts/audit-secrets.mjs`.

Protocol/tooling evidence will be recorded here after verification.

Current baseline evidence:

- PR #2 inspected with `gh pr view 2 --repo shloimie-beep/bnei-neviim-academy`.
- Local branch/status inspected with `git status --short --branch`.
- Local audit harness commit inspected with `git show --stat --oneline HEAD`.

No authenticated UI crawl, deployment, watch loop, agent fleet loop, or
production-data mutation was run for this protocol setup.

2026-06-19 One Time ramble/agent/integrations evidence:

- Raw source:
  `raw-input/RAW-20260619-002-next-ramble-agent-integrations-codex-prompt.md`.
- Baseline:
  `ops/audits/2026-06-18-ramble-agent-integrations-baseline.md`.
- Handoff/register:
  `tasks-pending/2026-06-19-ramble-agent-integrations-followup.md`.
- Parser/preview helper:
  `src/lib/bna/one-time-drive-brief.js`.
- API route and seed ownership repair:
  `server.js`.
- Operations UI:
  `public/operations.html`.
- Provider docs:
  `docs/integrations/VIMEO.md`,
  `docs/integrations/ZOOM.md`,
  `docs/integrations/RESEND.md`,
  `docs/integrations/OPERATOR-CREDENTIAL-HANDOFF.md`, and
  `docs/integrations/one-time-secure-integration-handoff.md`.
- Dry-run ingestion evidence:
  `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/SOURCE.md`,
  `PARSE.json`, `ROUTING.md`, `CREATED-OR-UPDATED.json`,
  `DUPLICATES.json`, `UNRESOLVED.md`, and `VERIFICATION.md`.
- Registries:
  `ops/action-registry.json` and `ops/route-registry.json`.
- Focused tests:
  `tests/one-time-drive-brief-ingestion.test.js` plus updated
  `tests/one-time-external-user-portal.test.js`.

Protocol/tooling verification evidence:

- `node --check scripts/bna-execution-run.mjs` passed.
- `node --test tests/bna-execution-run.test.js` passed 7/7.
- `npm test` passed 778/778.
- `npm run bna:run:validate` passed with 11 blocked requirements and
  `NEXT-SESSION.md` present.

2026-06-19 Agent Control Center local evidence:

- Raw source: `raw-input/RAW-20260619-001-agent-control-center-codex-queue-prompt.md`.
- Parsed register/handoff:
  `tasks-pending/2026-06-19-agent-control-center-closed-loop-verification.md`.
- Backend helper/schema/state:
  `src/lib/bna/agent-control.js`.
- API routes and bootstrap migration hook:
  `server.js`.
- Operations UI:
  `public/operations.html`.
- Visible-action registry:
  `ops/action-registry.json`.
- Focused tests:
  `tests/agent-control-center.test.js`.

2026-06-19 verification evidence:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/agent-control.js`.
- PASS Operations inline script syntax check via extracted script/new Function.
- PASS `node --test tests/agent-control-center.test.js` 5/5.
- PASS JSON validation for `ops/action-registry.json`, active
  `requirements.json`, and all `ops/agent-task-ledger.jsonl` rows.
- PASS `npm run bna:run:validate`; active run has work remaining and validates.

2026-06-19 One Time follow-up verification evidence:

- PASS `node --check server.js`.
- PASS `node --check src/lib/bna/one-time-drive-brief.js`.
- PASS Operations inline script syntax check by compiling inline scripts with
  `new Function`.
- PASS JSON validation for `ops/action-registry.json`,
  `ops/route-registry.json`, active `requirements.json`, and dry-run
  `PARSE.json`.
- PASS `node --test tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-external-user-portal.test.js
  tests/one-time-meeting-drops.test.js
  tests/int05-integrations-closeout.test.js` 49/49.
- PASS `npm run bna:run:validate`; active run remains partial and valid.

2026-06-19 canonical intake hardening continuation evidence:

- Parser/schema/helpers:
  `src/lib/bna/intake-parser.js`, `src/lib/bna/intake-schema.js`,
  `src/lib/bna/ramble-protocol.js`, `src/lib/bna/goal-memory.js`, and
  `src/lib/bna/goal-registry.js`.
- One Time scope regression:
  `tests/one-time-intake-scope-hardening.test.js`.
- Focused parser lanes:
  `tests/intake-parser-class-recording.test.js`,
  `tests/intake-parser-communications.test.js`,
  `tests/intake-parser-goals.test.js`, and
  `tests/intake-parser-student-questions.test.js`.
- PASS `node --check src/lib/bna/intake-parser.js`.
- PASS `node --check src/lib/bna/intake-schema.js`.
- PASS `node --check src/lib/bna/ramble-protocol.js`.
- PASS `node --check src/lib/bna/goal-registry.js`.
- PASS `node --check src/lib/bna/goal-memory.js`.
- PASS focused parser/routing suite 37/37:
  `node --test tests/one-time-intake-scope-hardening.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/intake-parser-class-recording.test.js
  tests/intake-parser-communications.test.js
  tests/intake-parser-goals.test.js
  tests/intake-parser-student-questions.test.js
  tests/intake-parser.test.js tests/telegram-ramble-routing-regression.test.js`.
- PASS `git diff --cached --check`.
- PASS staged secret-word scan; only harmless evidence/stable-ID literals
  matched.

2026-06-19 ambiguity and One Time RBAC continuation evidence:

- Parser ambiguity behavior:
  `src/lib/bna/intake-parser.js` and
  `tests/intake-parser-workspace-ambiguity.test.js`.
- Helper/route isolation:
  `src/lib/bna/helper/permissions.js`, `server.js`, and
  `tests/one-time-rbac-negative-isolation.test.js`.
- PASS focused parser baseline 26/26:
  `node --test tests/one-time-intake-scope-hardening.test.js
  tests/intake-parser.test.js tests/telegram-ramble-routing-regression.test.js`.
- PASS ambiguity/parser/RBAC/helper suite 21/21:
  `node --test tests/one-time-rbac-negative-isolation.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/intake-parser-workspace-ambiguity.test.js
  tests/one-time-intake-scope-hardening.test.js tests/bna-helper-tools.test.js`.
- The negative RBAC test proves:
  cross-project helper action denial, cross-workspace helper action denial,
  scoped denial for `save_provider_api_key`, `rotate_provider_api_key`, and
  `prepare_vimeo_upload`, continued access to safe setup-task tools, and
  `assertWorkspaceAccess(req, 'rabbi_sheller_provider')` coverage for key
  One Time admin routes.

2026-06-19 local raw/API readback continuation evidence:

- API/scope implementation:
  `server.js`.
- VM API readback smoke:
  `tests/one-time-intake-api-readback.test.js`.
- PASS `node --check server.js`.
- PASS `node --check tests/one-time-intake-api-readback.test.js`.
- PASS focused One Time intake/API/RBAC suite 14/14:
  `node --test tests/one-time-intake-api-readback.test.js
  tests/one-time-rbac-negative-isolation.test.js
  tests/intake-parser-workspace-ambiguity.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-intake-scope-hardening.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  `REQ-20260619-203` and `REQ-20260619-204` locally done.
- The VM smoke proves the existing `/api/bna/intake/parse` route, without
  starting the server, writes and reads back local in-memory rows for
  `bna_raw_intake`, `bna_intake_parse_runs`, `bna_intake_parse_items`, and
  `bna_parse_review_queue`; replays upsert the same parse run/items while
  preserving a separate raw provenance row.
- The same smoke proves scoped Rabbi Owner and Shloimie Admin credentials reach
  the intake API, scoped parse metadata carries
  `rabbi_sheller_provider` / `one_time_mishnah_class`, and an attempted `bna`
  workspace/project override returns 403 before any raw intake or parse-run row
  is written.

2026-06-19 One Time Operations UI/browser smoke evidence:

- UI/auth implementation:
  `server.js` and `public/operations.html`.
- Action registry:
  `ops/action-registry.json`.
- Browser smoke:
  `tests/one-time-operations-ui-smoke.test.js`.
- Smoke report:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`
  and `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json`.
- Screenshots:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png`
  and
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png`.
- PASS `node --check server.js`.
- PASS `node --check tests/one-time-operations-ui-smoke.test.js`.
- PASS `node --test tests/one-time-operations-ui-smoke.test.js`.
- PASS focused One Time UI/RBAC/regression suite 55/55:
  `node --test tests/one-time-operations-ui-smoke.test.js
  tests/operations-module-scoping.test.js
  tests/one-time-external-user-portal.test.js
  tests/one-time-rbac-negative-isolation.test.js
  tests/one-time-drive-brief-ingestion.test.js
  tests/one-time-intake-api-readback.test.js tests/one-time-meeting-drops.test.js`.
- The browser smoke proves the scoped One Time owner view exposes provider
  modules and the read-only Agent Status UI, hides school-only
  Students/Accounting, clicks the no-write Drive Brief preview, and passes
  mobile overflow checks with fake local data only.

2026-06-19 Agent Control DB/API readback evidence:

- API/lifecycle implementation:
  `src/lib/bna/agent-control.js` and `server.js`.
- Operations UI/control surface:
  `public/operations.html`.
- VM API readback smoke:
  `tests/agent-control-api-readback.test.js`.
- PASS `node --check server.js`.
- PASS `node --check tests/agent-control-api-readback.test.js`.
- PASS focused Agent Control suite 7/7:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js`.
- PASS `npm run bna:run:validate`; active run remains valid and partial.
- The VM smoke proves the existing Agent Control routes, without starting the
  server or touching production data, create a safe demo Agent Run, claim it,
  post progress, attach evidence, submit a blocked result, seal it, update the
  parent task, add task comment/activity, and create exactly one linked
  operator Decision.
- The same smoke proves scoped non-Super Admin One Time identities receive 403
  for Agent Control lifecycle/list routes before any run/event row is written.

2026-06-19 Agent Control browser smoke evidence:

- Browser smoke:
  `tests/agent-control-browser-smoke.test.js`.
- Smoke report:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.md`
  and `ops/playwright-smokes/2026-06-19-agent-control-browser-local/report.json`.
- Screenshots:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-list.png`,
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/desktop-run.png`,
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/tablet-run.png`,
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-390-run.png`,
  and
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/mobile-360-list.png`.
- PASS `node --check tests/agent-control-browser-smoke.test.js`.
- PASS `node --test tests/agent-control-browser-smoke.test.js` 1/1.
- PASS focused Agent Control suite 8/8:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js`.
- The smoke proves the Super Admin Agent Control list and Agent Run portal
  render prompt, progress, evidence, submit/seal, blocker, Copy Prompt, Open
  ChatGPT, and Prepare Run controls with fake local data only at 1440x900,
768x1024, 390x844, and 360x800.

2026-06-19 Agent Control notification/audit-history evidence:

- Implementation:
  `server.js` and `public/operations.html`.
- VM API readback smoke:
  `tests/agent-control-api-readback.test.js`.
- Static route/UI contract:
  `tests/agent-control-center.test.js`.
- PASS `node --check server.js`.
- PASS `node --check tests/agent-control-api-readback.test.js`.
- PASS focused Agent Control notification/API suite 7/7:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js`.
- PASS focused Agent Control suite 8/8:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js`.
- The VM smoke proves ready and blocked Agent Run notification rows are
  created through real route handlers with fake local data only.
- The same smoke proves progress updates do not create alert spam, all Agent
  Run notifications remain `delivery_state: in_app_only`, `no_send: true`,
  `external_write_performed: false`, and the blocked notification links to the
  single operator Decision created for the sealed blocked run.
- The Operations alert route now sends Agent Run notification cards to the
  Agents lane, not Support/Admin.

2026-06-19 PWA public-vs-Operations separation evidence:

- Public manifest:
  `public/manifest.json`.
- Operations manifest and icon:
  `public/operations-manifest.json` and `public/icons/operations-icon.svg`.
- Parent manifest and icon:
  `public/parent-manifest.json` and `public/icons/parent-icon.svg`.
- Public service worker:
  `public/sw.js`.
- Focused contract test:
  `tests/pwa-separation-contract.test.js`.
- PASS `node --check tests/pwa-separation-contract.test.js`.
- PASS focused PWA contract test 3/3:
  `node --test tests/pwa-separation-contract.test.js`.
- The contract proves public install starts at `/?source=public-pwa`,
  Operations install starts at `/operations?source=ops-pwa` with scope
  `/operations`, and parent install starts at `/parent?source=parent-pwa` with
  scope `/parent`.
- The service worker proof confirms the public cache shell excludes parent and
  Operations manifests and bypasses private app prefixes instead of serving
  private routes from the public cache.
- Operations and Operations login pages unregister existing public service
  workers.

2026-06-19 module-scoping local closeout evidence:

- Operations module shell/data loading:
  `public/operations.html`.
- Scoped server read/write helpers and routes:
  `server.js`.
- One Time helper RBAC guard:
  `src/lib/bna/helper/permissions.js`.
- Focused module-scoping contract:
  `tests/operations-module-scoping.test.js`.
- One Time negative isolation contract:
  `tests/one-time-rbac-negative-isolation.test.js`.
- PASS `node --check tests/operations-module-scoping.test.js`.
- PASS focused module/RBAC suite 9/9:
  `node --test tests/operations-module-scoping.test.js
  tests/one-time-rbac-negative-isolation.test.js`.
- The contract proves selected workspace filters are used for Community,
  Content, Live Classes, communications, integrations, automations, admin,
  social/email drafts, and DNS task data instead of defaulting to One Time or
  BNA scope.
- The RBAC contract proves One Time scoped users are denied cross-project and
  cross-workspace helper actions and cannot use secret-bearing helper tools.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 workspace/RBAC local closeout evidence:

- Workspace schema, seed, directory, scoped route guards:
  `server.js`.
- Operations workspace selector and labels:
  `public/operations.html`.
- Public/parent/provider portal separation:
  `public/index.html`, `public/parent.html`, `public/provider.html`, and
  `public/provider-profile.html`.
- Helper RBAC guard:
  `src/lib/bna/helper/permissions.js`.
- Workspace/person/household/provider contract:
  `tests/workspace-person-household-provider-contract.test.js`.
- Provider/parent/student negative helper isolation contract:
  `tests/workspace-rbac-negative-isolation.test.js`.
- One Time cross-project/workspace isolation contract:
  `tests/one-time-rbac-negative-isolation.test.js`.
- PASS `node --check tests/workspace-rbac-negative-isolation.test.js`.
- PASS focused workspace/RBAC suite 15/15:
  `node --test tests/workspace-rbac-negative-isolation.test.js
  tests/workspace-person-household-provider-contract.test.js
  tests/one-time-rbac-negative-isolation.test.js`.
- The suite proves canonical workspace types, membership-scoped directory
  records, guarded student/content route IDs, private-data-safe provider/public
  surfaces, and provider/parent/student/One Time negative helper isolation.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 Operations shell/navigation local closeout evidence:

- Operations shell and navigation:
  `public/operations.html`.
- Route/auth support:
  `server.js`.
- Focused Operations shell/navigation contract:
  `tests/operations-shell-navigation-contract.test.js`.
- PASS `node --check tests/operations-shell-navigation-contract.test.js`.
- PASS focused Operations shell/navigation contract 3/3:
  `node --test tests/operations-shell-navigation-contract.test.js`.
- The suite proves workspace switcher, nested sidebar subnav, mobile
  header/drawer, module toolbar, status chips, single helper entry,
  route-addressable details, and the current first-class Agents module.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 shared design-system local closeout evidence:

- Shared shell CSS:
  `public/css/bna-app-shell.css`.
- Current Operations shell contract source:
  `public/operations.html`.
- Portal shell contract sources:
  `public/parent.html`, `public/student.html`, `public/provider.html`, and
  `public/operations-login.html`.
- Custom select shell behavior:
  `public/js/app-select.js`.
- Focused shared-shell contract:
  `tests/bna-brand-shell.test.js`.
- PASS `node --check tests/bna-brand-shell.test.js`.
- PASS focused shared design-system contract 4/4:
  `node --test tests/bna-brand-shell.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 9`, `needs_verification: 9`, `blocked: 2`,
  `done: 11`.
- The contract proves the current shared BNA shell loads across live app pages,
  Operations includes BNA workspace labels without stale family-app branding,
  shell tokens cover light palette, sticky toolbar, side menus, top filters,
  mobile rules, and custom select menus, and the new CSS keeps Agent Status,
  task activity, settings panels, integration cards, metric text, and compact
  mobile strips within shared shell styling.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 task manager/intake/calendar local closeout evidence:

- Task manager and internal calendar UI:
  `public/operations.html`.
- Task, Decision, raw-intake, parse, activity, and calendar routes:
  `server.js`.
- Task comments, dictation, lanes, and selected-date calendar contract:
  `tests/operations-task-comments-and-dictation.test.js`.
- Workspace workflow correctness:
  `tests/ops-02-workflow-correctness.test.js`.
- Machine-work / Pending separation:
  `tests/workspace-task-no-stale-agent.test.js`.
- Canonical One Time intake API readback and idempotent parse rows:
  `tests/one-time-intake-api-readback.test.js`.
- Ambiguous workspace routing:
  `tests/intake-parser-workspace-ambiguity.test.js`.
- Decision lifecycle and reprocessing:
  `tests/decision-lifecycle-reprocessing.test.js`.
- PASS focused task/intake/calendar suite 29/29:
  `node --test tests/operations-task-comments-and-dictation.test.js
  tests/ops-02-workflow-correctness.test.js
  tests/workspace-task-no-stale-agent.test.js
  tests/one-time-intake-api-readback.test.js
  tests/intake-parser-workspace-ambiguity.test.js
  tests/decision-lifecycle-reprocessing.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 8`, `needs_verification: 9`, `blocked: 2`,
  `done: 12`.
- The suite proves Decision/Pending/Tasks/Codex Queue/Calendar/Done Activity
  separation, no implicit requeue from ordinary comments, Decision audit and
  executable-work routing, scoped/idempotent One Time intake readback, single
  routing Decision for unclear scope, Hebrew task-calendar date display, and
  internal calendar actions with external sync still gated.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 students/Goal Board/Hebrew local closeout evidence:

- Operations student detail and Goal Board admin:
  `public/operations.html`.
- Parent and student portal surfaces:
  `public/parent.html` and `public/student.html`.
- Student/accountability/Goal Board routes:
  `server.js`.
- Student detail scope contract:
  `tests/operations-student-detail-scope.test.js`.
- Goal Board behavior contract:
  `tests/goal-board.test.js`.
- Hebrew/RTL label audit:
  `tests/hebrew-rtl-ui-labels.test.js`.
- Student portal auth contract:
  `tests/student-portal-auth-policy.test.js`.
- Telegram Goal Board API coverage:
  `tests/telegram-goal-board-api-coverage.test.js`.
- Adjacent portal regressions:
  `tests/parent-student-polish-contract.test.js`,
  `tests/parent-student-portal-contract.test.js`,
  `tests/operations-student-navigation.test.js`, and
  `tests/portal-toolbar-overview-ux.test.js`.
- PASS focused student/portal suite 60/60:
  `node --test tests/operations-student-detail-scope.test.js
  tests/goal-board.test.js tests/hebrew-rtl-ui-labels.test.js
  tests/student-portal-auth-policy.test.js
  tests/telegram-goal-board-api-coverage.test.js
  tests/parent-student-polish-contract.test.js
  tests/parent-student-portal-contract.test.js
  tests/operations-student-navigation.test.js
  tests/portal-toolbar-overview-ux.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 7`, `needs_verification: 9`, `blocked: 2`,
  `done: 13`.
- The suite proves selected workspace/student scoping, duplicate-student
  preference for linked IDs over name aliases, group-goal/provider isolation,
  Goal Board buckets/review gates/device-accountability behavior,
  parent-managed student login scope, password audit redaction, localized
  Hebrew/RTL portal labels, and safe student overview layout.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 unified helper/OpenAI local closeout evidence:

- Helper API routes and storage:
  `server.js`.
- Operations helper drawer/context client:
  `public/operations.html`.
- Public assistant widget and setup assistant:
  `public/js/bna-bot-widget.js` and `public/assistant-setup.html`.
- Provider-neutral Telegram hosted-chat/content path:
  `scripts/telegram-kimi-bridge.mjs`.
- Provider/keyholder smoke path:
  `scripts/smoke-openai-sidekick.mjs`.
- Helper modules:
  `src/lib/bna/helper/audit-log.js`,
  `src/lib/bna/helper/context.js`,
  `src/lib/bna/helper/planner.js`,
  `src/lib/bna/helper/redaction.js`,
  `src/lib/bna/helper/tool-registry.js`,
  `src/lib/bna/helper/action-planner.js`,
  `src/lib/bna/helper/confirmation-gates.js`,
  `src/lib/bna/helper/knowledge.js`,
  `src/lib/bna/helper/profile.js`,
  `src/lib/bna/helper/safety.js`, and
  `src/lib/bna/helper/scope.js`.
- Focused helper tests:
  `tests/bna-helper-tools.test.js`,
  `tests/helper-scope-profile-knowledge.test.js`,
  `tests/universal-assistant-contract.test.js`,
  `tests/universal-assistant-mvp.test.js`,
  `tests/ai-provider-selection.test.js`,
  `tests/mobile-assistant-keyboard-layout.test.js`,
  `tests/provider-integrations-secret-storage.test.js`, and
  `tests/public-helper-retrieval.test.js`.
- PASS syntax checks:
  `node --check scripts/telegram-kimi-bridge.mjs`,
  `node --check scripts/smoke-openai-sidekick.mjs`, and
  helper module `node --check` commands.
- PASS focused helper/provider/assistant suite 48/48:
  `node --test tests/bna-helper-tools.test.js
  tests/helper-scope-profile-knowledge.test.js
  tests/universal-assistant-contract.test.js
  tests/universal-assistant-mvp.test.js tests/ai-provider-selection.test.js
  tests/mobile-assistant-keyboard-layout.test.js
  tests/provider-integrations-secret-storage.test.js
  tests/public-helper-retrieval.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 6`, `needs_verification: 9`, `blocked: 2`,
  `done: 14`.
- The suite proves provider-neutral AI fallback, scoped helper names/profile
  questionnaires/knowledge visibility, cross-scope helper denial, explicit
  confirmation gates for risky tools, safe redaction of secrets/tokens/student
  access/private record IDs, helper action/audit storage, mobile assistant
  keyboard behavior, provider integration secret-storage redaction, and
  bounded public helper retrieval.
- No deployment, production DB mutation, external send/write, broad crawl,
  watch loop, or agent-fleet loop was performed.

2026-06-19 public copy/portal CTA local closeout evidence:

- Public copy, navigation, and portal entry files:
  `public/index.html`,
  `public/js/bna-site-nav.js`,
  `public/css/bna-site-nav.css`,
  `public/one-time/index.html`,
  `public/parent-login.html`,
  `public/parents.html`,
  `public/provider.html`,
  `public/rabbi.html`, and
  `public/service-providers.html`.
- Focused public/CTA/privacy tests:
  `tests/ui-01-public-operations-shell.test.js`,
  `tests/public-helper-bot-landing-sodas.test.js`,
  `tests/signup-permissions-mobile-homepage.test.js`,
  `tests/provider-index-mvp.test.js`,
  `tests/parent-student-polish-contract.test.js`,
  `tests/one-time-focused-landing.test.js`,
  `tests/rabbi-checkout-access.test.js`,
  `tests/public-route-privacy-contract.test.js`,
  `tests/public-homepage-privacy.test.js`, and
  `tests/public-content-contamination-guard.test.js`.
- PASS focused public/CTA/privacy suite 46/46:
  `node --test tests/ui-01-public-operations-shell.test.js
  tests/public-helper-bot-landing-sodas.test.js
  tests/signup-permissions-mobile-homepage.test.js
  tests/provider-index-mvp.test.js tests/parent-student-polish-contract.test.js
  tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js
  tests/public-route-privacy-contract.test.js
  tests/public-homepage-privacy.test.js
  tests/public-content-contamination-guard.test.js`.
- The suite proves current BNA/One Time homepage and landing copy, public
  helper language, portal header/entry CTA coverage, signup route labels,
  private Operations route protection, public content privacy, and removal of
  stale family-app positioning from current user-facing surfaces.
- No deployment, production DB mutation, external send/write, broad crawl,
  watch loop, or agent-fleet loop was performed.

2026-06-19 safe test-data/acceptance coverage local closeout evidence:

- Safe seed harness:
  `scripts/seed-req022-test-data.mjs`.
- Package entry:
  `package.json` script `seed:req022`.
- Seed/cleanup contract tests:
  `tests/req022-seed-test-data.test.js`.
- Active-run acceptance coverage test:
  `tests/active-run-acceptance-coverage.test.js`.
- Generated dry-run seed artifacts:
  `ops/seed-runs/2026-06-18-req022-local/plan.json`,
  `ops/seed-runs/2026-06-18-req022-local/report.md`,
  `ops/seed-runs/2026-06-18-req022-local/seed.sql`, and
  `ops/seed-runs/2026-06-18-req022-local/cleanup.sql`.
- Generated dry-run cleanup artifacts:
  `ops/seed-runs/2026-06-18-req022-cleanup-local/plan.json`,
  `ops/seed-runs/2026-06-18-req022-cleanup-local/report.md`,
  `ops/seed-runs/2026-06-18-req022-cleanup-local/cleanup.sql`, and
  `ops/seed-runs/2026-06-18-req022-cleanup-local/seed.sql`.
- PASS syntax checks:
  `node --check scripts/seed-req022-test-data.mjs`,
  `node --check tests/req022-seed-test-data.test.js`, and
  `node --check tests/active-run-acceptance-coverage.test.js`.
- PASS focused safe-seed/acceptance/Agent Control suite 14/14:
  `node --test tests/req022-seed-test-data.test.js
  tests/active-run-acceptance-coverage.test.js
  tests/agent-control-center.test.js tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `in_progress: 4`, `needs_verification: 9`, `blocked: 2`,
  `done: 16`.
- The suite proves dry-run-first fixture generation, explicit apply/cleanup
  confirmation phrases, no external writes, no secrets printed, scoped
  idempotent SQL, cleanup limited to prefixed/metadata-tagged rows, generated
  school/provider/family/student/task/Decision/calendar/content/community/
  automation/helper-audit fixtures, and active-run evidence/verification
  coverage for locally done requirements.
- No deployment, production DB mutation, external send/write, broad crawl,
  watch loop, or agent-fleet loop was performed.

2026-06-19 Agent Control manual-smoke prompt evidence:

- Manual Agent Mode prompt:
  `ops/agent-control/2026-06-19-manual-agent-mode-smoke.md`.
- Prompt contract test:
  `tests/agent-control-manual-smoke-prompt.test.js`.
- Updated Agent Control handoff:
  `tasks-pending/2026-06-19-agent-control-center-closed-loop-verification.md`.
- PASS `node --check tests/agent-control-manual-smoke-prompt.test.js`.
- PASS `node --test tests/agent-control-manual-smoke-prompt.test.js` 1/1.
- PASS focused Agent Control/manual-prompt/acceptance suite 11/11:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js
  tests/agent-control-manual-smoke-prompt.test.js
  tests/active-run-acceptance-coverage.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `needs_verification: 13`, `blocked: 2`, `done: 16`.
- The suite proves the prompt includes the safe run key, required Agent Run
  portal checks, progress/evidence/blocked Decision/Seal Run steps, explicit
  no-deploy/no-production/no-external-write rules, local-route-unavailable
  blocker language, and no known secret-shaped values.
- No deployment, production DB mutation, external send/write, broad crawl,
  watch loop, or agent-fleet loop was performed.

Not run:

- No full baseline UI crawl.
- No audit harness rebuild.
- No watch loop or agent-fleet loop.
- No deployment.
- No production data mutation.

2026-06-19 Agent Control interactive browser proof:

- Interactive browser smoke test:
  `tests/agent-control-browser-smoke.test.js`.
- Interactive report:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md`.
- Interactive JSON report:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.json`.
- Interactive screenshot:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png`.
- PASS focused Agent Control/active-run suite 12/12:
  `node --test tests/agent-control-center.test.js
  tests/agent-control-api-readback.test.js
  tests/agent-control-browser-smoke.test.js
  tests/agent-control-manual-smoke-prompt.test.js
  tests/active-run-acceptance-coverage.test.js`.
- PASS `npm run bna:run:validate`; active run remains partial and valid with
  status counts `needs_verification: 13`, `blocked: 2`, `done: 16`.
- The interactive smoke proves the real Operations Agent Run portal controls
  can claim a safe local run, post progress, attach local evidence, submit a
  passing result, seal the run, reload detail, and read back `Sealed Pass`
  without production writes, external writes, secrets, broad crawls, watch
  loops, or agent-fleet loops.

Not run for this batch:

- No actual manual Agent Mode/browser-judgment execution.
- No production DB write/readback.
- No deployment.
- No external account, Drive, Telegram, Zoom, Vimeo, Resend, DNS, payment, or
  social write.

2026-06-19 Agent Control manual browser judgment evidence:

- Manual browser judgment report:
  `ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-report.md`.
- Manual browser JSON report:
  `ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-report.json`.
- Manual browser DOM/readback snapshot:
  `ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-dom-snapshot.txt`.
- Prompt used:
  `ops/agent-control/2026-06-19-manual-agent-mode-smoke.md`.
- The in-app browser used a fake local Operations server and proved:
  Super Admin/Platform identity, Agent Run portal readback, claim/progress/
  evidence actions, `needs_operator` submit/seal, final `Blocked` status, one
  linked Decision `DEC-MANUAL-001`, and no secret-shaped text.
- Screenshot capture timed out in the in-app browser, so the durable evidence
  is the browser DOM/readback report plus the Agent Run evidence entry for the
  manual report path.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 release-gate evidence normalization:

- Remaining live-required rows are now explicitly marked
  `needs_operator_decision`, not generic local verification work.
- The release-gated rows carry deployment evidence stating that live
  verification is intentionally withheld until explicit operator approval.
- This preserves the no-production-mutation rule while making the remaining
  open state concrete and externally actionable.
- No deployment, production DB mutation, external write, broad crawl, watch
  loop, or agent-fleet loop was performed.

2026-06-19 Zoom/Vimeo credential evidence:

- Secure local archive:
  `C:\Users\User\BNA-Keyholder\incoming\2026-06-19-zoom-vimeo-codes`.
- Temporary handoff deleted after hash comparison:
  `C:\Users\User\Downloads\codes` no longer exists.
- Local runtime secret files are under ignored `.secrets/`; no raw secret value
  was added to tracked files.
- Diagnostic script:
  `scripts/provider-credentials-diagnostics.mjs`.
- Diagnostic tests:
  `tests/provider-credentials-diagnostics.test.js`.
- Vimeo readiness metadata:
  `src/lib/integrations/video-hosting.js`.
- Keyholder file-name documentation:
  `docs/local-keyholder.md`.
- Final live redacted diagnostic report:
  `ops/qa-runs/2026-06-19T06-25-26-055Z-provider-credential-diagnostics.md`.
- Final provider status:
  Zoom `token_ready`; Vimeo `client_credentials_ready`; returned tokens were
  fingerprinted only and not stored.
- Remaining evidence gap:
  Resend credential/domain/DNS proof and Vimeo user-level upload/library access
  are still operator-gated and not locally completed.

2026-06-19 Resend credential and meeting-intake evidence:

- Resend source hash/fingerprint evidence:
  `C:\Users\User\BNA-Keyholder\archived-source\2026-06-19-resend-one-time\resend-one-time-env-425f2ccf2704f615.source.txt`
  with SHA-256
  `425f2ccf2704f6159ae713f9ba0c4ea5ecf772bd8569116d062324420747d64a`
  and fingerprint `425f2ccf2704`.
- Runtime install locations are local/ignored only:
  `C:\Users\User\BNA-Keyholder\resend-api-key.txt`,
  `C:\Users\User\BNA-Keyholder\providers\resend\one-time-api-key.txt`, and
  `.secrets/resend-api-key.txt`.
- Downloads source deleted:
  `C:\Users\User\Downloads\resend one time env.txt` no longer exists after
  archive/install verification.
- Keyholder proof:
  `ops/qa-runs/2026-06-19T08-36-20-033Z-keyholder-diagnostics.md`.
- Provider readiness proof:
  `ops/qa-runs/2026-06-19T08-36-15-870Z-provider-credential-diagnostics.md`.
  It records Zoom `auth_verified_read_only`, Vimeo
  `auth_verified_read_only` with owner action still required for user access,
  Resend `credentials_present` and `auth_verified_read_only` with missing
  sender/domain, Stripe `credentials_present` but live-write gated, and Green
  Invoice `credentials_missing`.
- Railway no-mutation proof:
  `ops/qa-runs/2026-06-19T08-36-25-755Z-provider-env-railway-propagation.md`
  shows apply mode false, attempted 0, pushed 0, and
  `resend_group_complete: false`.
- Railway audit proof:
  `ops/qa-runs/2026-06-19T08-36-27-669Z-provider-env-railway-audit.md`
  shows Railway is still missing `RESEND_API_KEY` and local runtime is still
  missing `RESEND_FROM` and `RESEND_DOMAIN`.
- Resend runtime hardening:
  `src/lib/integrations/resend-client.js` now prevents a bare
  `resend-api-key.txt` file from being reused as sender/domain/API-base config.
- Meeting reconciliation proof:
  `ops/ingestion-runs/2026-06-19-rabbi-scheller-meeting-reconciliation/RECONCILIATION.md`
  and `RECONCILIATION.json`.
- Prior parse evidence:
  `ops/ingestion-runs/2026-06-19-one-time-drive-brief-dry-run/PARSE.json`,
  `CREATED-OR-UPDATED.json`, `DUPLICATES.json`, and `VERIFICATION.md`.
- Future master-backlog input:
  `ops/one-time-mishnah/next-master-backlog-input.md`.

Guardrails:

- No secret value was printed, committed, screenshotted, or copied into tracked
  task notes.
- No email was sent.
- No DNS change was made.
- No Zoom meeting was created.
- No Vimeo upload/library mutation was performed.
- No Stripe or Green Invoice write was performed.
- No Railway variable was changed in this batch.
- No deployment, production database mutation, broad crawl, watch loop, or
  agent-fleet loop was run.

## 2026-06-19T12:05:00+03:00 - One Time Master Recovery Batch 0

- Raw packet preserved as `raw-input/RAW-20260619-005-one-time-master-recovery-backlog-ui-launch.md`.
- Register created as `tasks-pending/2026-06-19-one-time-master-recovery-register.md`.
- Master reconciliation matrix created as `ops/one-time-mishnah/master-backlog-reconciliation.md` and `ops/one-time-mishnah/master-backlog-reconciliation.json`.
- Preflight verified branch `codex/agent-control-center-20260619` at `cae87855f1e140668741cb2eeba90dc9dd68abf9`, PR #5 open/draft, Railway deployment `f9921a2d-d614-44df-88c0-392d810ddebd`, active run validation, secret audit, diff check, and production live app smoke.
- No application runtime, production data, external account, DNS, email, WhatsApp, Zoom, Vimeo, billing, or deploy write was performed in this Batch 0 artifact pass.

## 2026-06-19T12:45:00+03:00 - One Time Master Recovery Batch 1 Evidence

- Validator implementation: `scripts/bna-execution-run.mjs`.
- Focused tests: `tests/bna-execution-run.test.js`.
- Schema update: `ops/execution-runs/requirements.schema.json`.
- Protocol docs: `docs/BNA-RAMBLE-TO-DONE.md`, `BNA-START-HERE.md`,
  `ops/execution-runs/README.md`.
- Codex handoff templates:
  `templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md` and
  `templates/BNA-CODEX-VERIFICATION-PROMPT.md`.
- Active-run source metadata and matrix pointer:
  `ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json`.
- Statement matrix validated by the active run:
  `ops/one-time-mishnah/master-backlog-reconciliation.json`.
- Register status updated:
  `tasks-pending/2026-06-19-one-time-master-recovery-register.md`.

Guardrails:

- No app runtime route/UI/schema behavior was changed in this batch.
- No production data mutation, deploy, live smoke, external send, billing, DNS,
  Zoom, Vimeo, or new Railway resource action was performed.

## 2026-06-19T12:58:00+03:00 - One Time Master Recovery Batch 2 Evidence

- Read-only census script: `scripts/task-decision-census.mjs`.
- Focused tests: `tests/task-decision-census.test.js`.
- Existing task/Decision lane tests:
  `tests/ops-02-workflow-correctness.test.js`,
  `tests/workspace-task-no-stale-agent.test.js`, and
  `tests/decision-lifecycle-reprocessing.test.js`.
- Redacted live/API census report:
  `ops/task-decision-census/2026-06-19T09-29-03-110Z-task-decision-census.md`.
- Redacted machine-readable census:
  `ops/task-decision-census/2026-06-19T09-29-03-110Z-task-decision-census.json`
  and `ops/task-decision-census/latest.json`.
- Existing Operations lane/default-view source inspected:
  `public/operations.html`.

Read-only census result:

- Source: `live_api:/api/bna/tasks`.
- Tasks seen: 792.
- Lane counts: Decisions 18, Tasks 336, Codex Queue 6, Pending 153, Calendar
  19, Done / Activity 260.
- Dry-run cleanup plan: 57 duplicate groups, 64 findings, 121 reversible
  approval-gated actions.

Guardrails:

- No task or Decision cleanup apply was run.
- No production task mutation, deploy, live smoke, external send, billing, DNS,
  Zoom, Vimeo, or Railway resource action was performed.

## 2026-06-19T13:08:00+03:00 - One Time Master Recovery Batch 3 Evidence

- Canonical role contract helper:
  `src/lib/bna/one-time-role-model.js`.
- Server identity/seed/payload integration: `server.js`.
- Operations Users/Access role-label integration: `public/operations.html`.
- Architecture role map:
  `docs/architecture/workspace-community-provider-role-map.md`.
- Focused role/auth tests:
  `tests/one-time-role-auth-model.test.js`,
  `tests/one-time-rbac-negative-isolation.test.js`,
  `tests/one-time-drive-brief-ingestion.test.js`,
  `tests/one-time-intake-api-readback.test.js`, and
  `tests/workspace-person-household-provider-contract.test.js`.
- Local One Time Operations browser smoke:
  `tests/one-time-operations-ui-smoke.test.js`.
- Browser smoke artifacts:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`,
  `report.json`, `desktop.png`, and `mobile-agents.png`.

Implemented local contract:

- Rabbi Elie Scheller maps to canonical `workspace_owner` for
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Shloimie retains platform-super-admin metadata and maps to scoped One Time
  `workspace_manager` compatibility for the project login.
- Existing route roles remain `project_owner` and `project_manager`.
- One Time user filtering excludes unrelated BNA/family records.
- Role-change audit evidence is no-write preview only.
- Permanent removal remains Platform Super Admin only; real invite,
  deactivate, remove, and role-change persistence is not enabled.

Guardrails:

- No deployment or live smoke was run for this app-visible batch.
- No production DB mutation or external-access persistence write was performed.
- No email, WhatsApp, billing, DNS, Zoom, Vimeo, Railway variable/resource, or
  external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 4 Evidence

- UI/design delta audit generator:
  `scripts/one-time-ui-design-delta-audit.mjs`.
- Focused audit tests:
  `tests/one-time-ui-design-delta-audit.test.js`.
- Generated current audit report:
  `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.md`.
- Generated current machine-readable audit:
  `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.json`.
- Prior UI closeout proof reused as historical evidence:
  `ops/ui-audits/2026-06-16-ui-closeout.md` and `ops/ui-audits/2026-06-16/`.
- Current One Time Operations smoke proof reused:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`
  and `report.json`.
- Inspected UI/design-system surfaces:
  `public/operations.html`, `public/css/bna-app-shell.css`,
  `public/parent.html`, `public/student.html`, `public/provider.html`,
  `public/one-time`, and `public/one-time-classroom.html`.

Audit result:

- Status: `needs_operator_decision`.
- External write performed: no.
- Production mutation performed: no.
- Full authenticated crawl performed: no.
- Broad crawl performed: no.
- Blocker: authenticated Operations audit storage state is missing at
  `.runtime/auth/operations-storage-state.json`.
- Warning: admin/debug-adjacent raw JSON presentations remain in advanced
  panels and should be reviewed in a future UI polish pass.

Guardrails:

- No deployment or live smoke was run for this app-visible batch.
- No production DB mutation, external write, broad crawl, authenticated crawl,
  external send, billing, DNS, Zoom, Vimeo, Railway variable/resource, or
  external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 5 Evidence

- Operations communications UI:
  `public/operations.html`.
- Resend email draft/reply-to and approval-gated send server path:
  `server.js`.
- Resend client payload support:
  `src/lib/integrations/resend-client.js`.
- Existing approval phrase source:
  `src/lib/integrations/external-actions.js`.
- New focused contract tests:
  `tests/one-time-communications-workspace.test.js`.
- Existing communications tests:
  `tests/communications-screening-import-ui.test.js`,
  `tests/communications-integrations-contract.test.js`,
  `tests/assistant-portal-communications-contract.test.js`,
  `tests/intake-parser-communications.test.js`, and
  `tests/resend-client.test.js`.
- Local Operations browser smoke:
  `tests/one-time-operations-ui-smoke.test.js`.
- Prior communications browser proof:
  `ops/playwright-smokes/2026-06-17-communications-screening-local/report.md`.

Implemented local contract:

- WhatsApp/WAPI remains first-party and no-send by default.
- WhatsApp operator workspace exposes list, selected conversation, and details
  panes, plus mobile list/conversation/details jumps and back-to-list
  navigation.
- WhatsApp local actions are correction/note actions only; sending still
  requires the explicit `SEND_WHATSAPP` endpoint confirmation.
- Email workspace exposes sender, domain, recipient, workspace/project, and
  confirmation readiness gates.
- Email draft editor supports from identity, reply-to, recipients, subject,
  template, related record, workspace/project, approval status, and body
  preview.
- Email send controls stay locked unless the draft is reviewed/ready, Resend
  readiness passes, recipients are present, and `SEND_RESEND_EMAIL` is supplied.

Guardrails:

- No deployment or live smoke was run for this app-visible batch.
- No production DB mutation, email send, WhatsApp send, DNS/Railway
  propagation, WAPI outbound use, Buffer publish/schedule, billing, Zoom,
  Vimeo, GHL, external-account write, or external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 6 Evidence

- Product readiness helper:
  `src/lib/bna/one-time-product-system.js`.
- Product-system API payload:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Focused product readiness contract tests:
  `tests/one-time-product-system.test.js`.
- Existing adjacent verification:
  `tests/rabbi-checkout-access.test.js`,
  `tests/one-time-classroom-calendar-community-bot.test.js`,
  `tests/one-time-external-user-portal.test.js`,
  `tests/parent-student-portal-contract.test.js`,
  `tests/one-time-operations-ui-smoke.test.js`,
  `tests/operations-ws01-layout-readability.test.js`,
  `tests/operations-filter-dropdown.test.js`, and
  `tests/bna-brand-shell.test.js`.

Implemented local contract:

- Product readiness includes sections for product model, schedule/cohorts,
  consultation booking, parent portal, student portal, provider portal, and
  billing/access readiness.
- The contract explicitly tracks $67 membership review, premium fixed-duration
  Masechta intensive review, upfront/weekly payment options, entitlements,
  grace/failed-payment/cancellation/refund/access-expiration policy, Rabbi
  recurring availability, blackout/date windows, cohort dates, session
  generation, consultation appointment types, reminders, parent confirmation,
  parent/student/provider portal expectations, provider of record, refund
  policy, and release/live-smoke gates.
- `/api/bna/one-time/product-system` now returns `product_readiness` with
  observed provider/schedule/calendar/tier counts and all external gates set
  false.
- Operations renders the readiness panel in the existing Rabbi / One Time
  launch and tiers surfaces with no-write copy and blocker tags.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, checkout, card charge, invoice, payment link,
  subscription, access automation, Zoom/calendar write, portal publish, email,
  WhatsApp, Telegram, billing provider write, DNS/Railway propagation, GHL, or
  external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 7 Evidence

- Zoom automation helper:
  `src/lib/integrations/zoom.js`.
- Protected preview-only API routes:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Integration documentation:
  `docs/integrations/ZOOM.md` and `docs/integrations/zoom-setup.md`.
- Route registry coverage:
  `ops/route-registry.json`.
- Focused Zoom automation contract tests:
  `tests/one-time-zoom-attendance-automation.test.js`.

Implemented local contract:

- Session automation preview returns `REQ-20260619-307`, preview-only state,
  external-write gates all set false, meeting payload preview, staged/skipped
  registrant previews, join redirect guardrails, webhook attendance mapping,
  and attendance correction draft metadata.
- Webhook attendance preview maps participant join/leave style events into
  local attendance statuses while requiring signature verification and keeping
  live webhook acceptance disabled.
- Attendance correction drafts sanitize unsupported statuses and require
  operator review without mutating attendance rows.
- Operations renders a One Time Live Classes `Zoom Attendance Automation` panel
  with explicit no-write copy and local summary counts.
- Docs and route registry state that the new endpoints are preview-only and
  private.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, Zoom meeting creation, Zoom registrant write, live
  webhook acceptance, join redirect exposure, attendance mutation, external
  send, portal publish, billing, DNS/Railway propagation, Vimeo, GHL, or
  external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 8 Evidence

- Recording/Vimeo pipeline helper:
  `src/lib/integrations/video-hosting.js`.
- Protected preview-only API routes:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Integration documentation:
  `docs/integrations/VIMEO.md`.
- Route registry coverage:
  `ops/route-registry.json`.
- Focused recording/Vimeo pipeline tests:
  `tests/one-time-recording-vimeo-pipeline.test.js`.

Implemented local contract:

- Recording pipeline preview returns `REQ-20260619-308`, preview-only state,
  all provider/member/publish/delete/send gates set false, recording file
  ranking, preferred layout selection, audio-only fallback, transcript/summary
  readiness, retry/dead-letter/idempotency metadata, review flow, publication
  preview, retention preview, entitlement handoff, and watch-progress handoff.
- Publication preview supports manual Vimeo ID review and API upload preview
  states while keeping publish, unpublish, delete, member visibility, and
  provider writes disabled.
- Retention preview keeps source deletion disabled until retention, backup,
  playback smoke, and operator approval are recorded.
- Operations renders the Recording / Vimeo Pipeline panel in One Time Library
  with explicit no-write copy.
- Docs and route registry state that the new endpoints are preview-only and
  private.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, provider webhook acceptance, recording fetch,
  Vimeo upload, publish, unpublish, delete, member visibility, watch-progress
  write, notification send, portal publish, billing, DNS/Railway propagation,
  GHL, or external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 9 Evidence

- Transcript privacy helper:
  `src/lib/bna/transcript-privacy.js`.
- Protected readiness-only API route:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Route registry coverage:
  `ops/route-registry.json`.
- Existing public-helper retrieval guardrails inspected:
  `src/lib/bna/public-helper-retrieval.js`.
- Focused transcript privacy contract tests:
  `tests/one-time-transcript-privacy.test.js`.

Implemented local contract:

- Transcript privacy helper returns `REQ-20260619-309`, preview-only state,
  all production/external mutation gates set false, transcript version
  metadata, timestamped segment and speaker confidence metadata, student match
  method/confidence metadata, review states, and privacy classes.
- Audience-scoped retrieval previews block raw/unreviewed retrieval, public
  raw transcript dumps, cross-student student-private retrieval, parent scope
  mismatches, staff-private leakage, and excluded segments.
- Protected admin route returns readiness metadata with
  `raw_transcript_text_returned: false`; member-safe classroom payloads already
  blank transcript text and notes.
- Operations renders a Transcript Privacy / Knowledge Scope panel in One Time
  Library with explicit no-raw, no-staff-private, no-student-private,
  no-cross-student, and no-public-helper-raw-dump copy.
- Route registry declares the readiness route as private/no-write and public
  helper retrieval remains bounded to reviewed safe transcript snippets.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, raw transcript import, transcript publication,
  vector/public-helper corpus mutation, cross-student retrieval enablement,
  portal publish, external send, billing, DNS/Railway propagation, GHL, or
  external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 10 Evidence

- Gamification/badge helper:
  `src/lib/bna/gamification.js`.
- Badge schema, seed, audit event, and readiness API:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Public classroom participation display:
  `public/one-time-classroom.html`.
- Route registry coverage:
  `ops/route-registry.json`.
- Focused gamification/badge tests:
  `tests/gamification-events.test.js` and
  `tests/one-time-gamification-badge-audit.test.js`.

Implemented local contract:

- Badge helper defines the required automatic badges: First Class, On Time,
  Five On-Time Classes, Full Shiur, Three-Week Consistency, First Review,
  Chazarah Streak, Perek Completed, Masechta Completed, Watched the Missed
  Class, and Comeback.
- Badge helper defines Rabbi-awarded badges: Thoughtful Question, Clear
  Explanation, Strong Source Work, Excellent Preparation, Helped the Class, and
  Exceptional Improvement.
- Readiness logic models configurable thresholds, stable award/reversal
  idempotency keys, source event evidence, class/session evidence,
  parent-safe explanations, manual reversal reason requirements, and no-write
  gates.
- Server seed uses the shared badge catalog and the existing automatic-award
  path records a badge audit event when it writes through an approved existing
  admin/server path.
- New readiness endpoint returns policy metadata only; it does not award,
  reverse, notify, grant access, or publish anything.
- Operations renders a Gamification / Badge Audit panel with explicit no-write
  copy.
- Public One Time classroom now renders Approved Participation from
  `participation_summary`; the old ranked points leaderboard payload is kept
  empty for member-safe output.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, live badge award, Rabbi-awarded badge write,
  badge reversal, parent/student notification, automatic access grant,
  prize/coupon/credit, public individual leaderboard, billing,
  DNS/Railway propagation, GHL, or external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 11 Evidence

- Community/moderation helper:
  `src/lib/bna/community-moderation.js`.
- Community moderation schema, audit events, and readiness API:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Public classroom private-response surface inspected:
  `public/one-time-classroom.html`.
- Route registry coverage:
  `ops/route-registry.json`.
- Focused community/moderation tests:
  `tests/one-time-community-moderation-workflow.test.js`.

Implemented local contract:

- Helper returns `REQ-20260619-311`, preview-only state, all production/
  external mutation gates false, private question moderation drafts without raw
  body return, report flags, temporary hold recommendations, and no student-to-
  student messaging.
- Private-to-public promotion preview stores original/edited/anonymized version
  metadata and returns only anonymized public text with private identifiers
  redacted.
- Server schema now declares explicit community moderation audit fields for
  original, edited, published, and anonymized bodies; visibility decisions;
  private-to-public state; edit/delete history; report flags; temporary holds;
  and `bna_community_moderation_events`.
- Existing member response route remains private-first: responses are hidden,
  screened, marked review-only, and return `visible_to_classroom: false`.
- Protected admin route returns readiness metadata with
  `raw_private_message_text_returned: false` and
  `unrestricted_student_messaging_enabled: false`.
- Operations renders a Community / Moderation Workflow no-write readiness panel
  in the One Time Library workspace.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, public/member community publication, external
  notification, deletion purge, unrestricted student messaging enablement,
  billing, DNS/Railway propagation, GHL, or external connector write was
  performed.

## 2026-06-19 - One Time Master Recovery Batch 12 Evidence

- Study-assistant readiness helper:
  `src/lib/bna/study-assistant-readiness.js`.
- Source-version schema, study assistant audit events, and readiness API:
  `server.js`.
- Operations readiness UI:
  `public/operations.html`.
- Route registry coverage:
  `ops/route-registry.json`.
- Focused study-assistant tests:
  `tests/one-time-study-assistant-readiness.test.js`.

Implemented local contract:

- Helper returns `REQ-20260619-312`, preview-only state, all production/
  external mutation gates false, approved source-version metadata, source
  content hashes, and `content_returned: false`.
- Source-version model includes canonical reference, title/index, version
  title, language, license, attribution, source URL/reference, retrieved
  timestamp, content hash, Rabbi approval status, quote permission, summary
  permission, and index permission.
- Scoped retrieval preview supports provider-wide, cohort, student-private,
  and restricted scopes while blocking restricted sources, raw/unreviewed
  sources, moderation/staff-only metadata, and cross-student retrieval.
- Server schema now declares `bna_one_time_source_versions` and
  `bna_one_time_study_assistant_audit_events`, with source text return and
  answer generation flags disabled by default.
- Protected admin route returns readiness metadata with
  `study_assistant_feature_flag_enabled: false`,
  `unrestricted_ai_chat_enabled: false`, and `raw_source_text_returned: false`.
- Operations renders a Sefaria / Study Assistant Readiness no-write panel in
  the One Time Library workspace.
- Existing `/api/one-time-classroom/bot` remains disabled pending explicit
  operator approval.

Guardrails:

- No deployment or live smoke was run for this app-visible/server-visible
  batch.
- No production DB mutation, Sefaria/API ingestion, arbitrary translation
  merge, source corpus mutation, assistant answer generation, portal
  publication, raw transcript retrieval, cross-student retrieval enablement,
  billing, DNS/Railway propagation, GHL, or external connector write was
  performed.

## 2026-06-19 - One Time Master Recovery Batch 13 Evidence

- Machine-readable Option B deployment readiness profile:
  `ops/one-time-mishnah/option-b-deployment-readiness.json`.
- Human deployment/domain readiness runbook:
  `ops/one-time-mishnah/one-time-option-b-deployment-readiness.md`.
- Current-state deployment audit:
  `docs/audits/one-time-one-time/2026-06-18-current-state-and-deployment-audit.md`.
- Railway/local runtime inventory:
  `railway.json`, `package.json`, `scripts/railway-start.mjs`, and
  `scripts/smoke-live-app.mjs`.
- Focused deployment readiness tests:
  `tests/one-time-deployment-readiness.test.js`.

Implemented local contract:

- Readiness profile returns `REQ-20260619-313`, `needs_operator_decision`,
  local-readiness-only state, and all deploy/live/external mutation flags
  false.
- Target architecture is explicit: shared BNA/My Academy codebase, separate
  One Time deployment, separate One Time production variables, separate One
  Time domain, separate One Time production database when approved, separate
  staging/production environments, and no reliance on BNA production
  credentials.
- Runbook includes deployment profile, identity map, database installation
  identity guard, schema-vs-client-seed separation, Railway runbook, cost
  worksheet, asset ownership register, domain/DNS checklist, backup plan,
  rollback plan, staging smoke plan, and production launch plan.
- Test coverage verifies the existing Railway builder/start/smoke inventory
  without running deploys or live smokes.

Guardrails:

- No deployment or live smoke was run for this deployment/domain batch.
- No Railway project/service creation, database creation/attach, Railway
  variable write, DNS/domain change, production data mutation, external send,
  billing, GHL, or external connector write was performed.

## 2026-06-19 - One Time Master Recovery Batch 14 Evidence

- Final verification requirement:
  `ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json`.
- Provider helper permission repair:
  `src/lib/bna/helper/permissions.js`.
- Agents default allowedViews fallback repair:
  `server.js`.
- Current-contract test alignment:
  `tests/google-workspace-settings-contract.test.js` and
  `tests/operations-saas-crm-redesign.test.js`.
- Final RBAC/final-surface proof:
  `tests/final-register-surfaces-closeout.test.js`,
  `tests/one-time-rbac-negative-isolation.test.js`, and
  `tests/workspace-rbac-negative-isolation.test.js`.
- Website ramble correction continuation restored:
  `tasks-pending/2026-06-19-website-ramble-correction-audit.md`.
- Watchdog closeout proof:
  `ops/watchdog-audits/2026-06-19T12-00-watchdog-audit.md`.

Implemented local contract:

- Provider API key helper tools remain in the helper permission contract for
  admin-visible setup/rotation, but project/provider scoped helpers are denied
  those secret-bearing tools.
- The Operations auth fallback includes the current first-class Agents module.
- Stale tests now match the current Agents toolbar/auth contract instead of
  the pre-Agents shell.
- The daily website-correction source-of-truth chain includes the 2026-06-19
  continuation marker required by watchdog audit.

Guardrails:

- No commit, push, PR update, deployment, Railway doctor, production smoke,
  authenticated live role smoke, screenshot capture, production DB mutation,
  domain/DNS action, external send, billing, Zoom/Vimeo/Buffer/Sefaria action,
  source corpus mutation, portal publication, or live data-isolation readback
  was performed.
- Local smoke with env-file loading disabled stopped before server start
  because `DATABASE_URL`, `OPS_USERNAME`, and `OPS_PASSWORD` were not present.
