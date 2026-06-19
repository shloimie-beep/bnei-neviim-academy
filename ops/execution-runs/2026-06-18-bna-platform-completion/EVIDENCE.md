# Evidence

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

Not run:

- No full baseline UI crawl.
- No audit harness rebuild.
- No watch loop or agent-fleet loop.
- No deployment.
- No production data mutation.
