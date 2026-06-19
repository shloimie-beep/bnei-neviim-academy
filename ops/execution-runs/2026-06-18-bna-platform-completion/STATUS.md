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

Still open after this batch:

- `REQ-20260619-203` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260619-204` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260619-205` is locally done. Production deployment/live smoke remains
  withheld until explicit release approval.
- `REQ-20260619-206` has local DB/API route smoke coverage now; it still needs
  focused Super Admin browser smoke and manual Agent Mode/browser-judgment
  smoke before local closeout.
- Live Vimeo/Zoom/Resend/DNS/Stripe setup remains blocked on external
  owner/credential actions and explicit operator approval.

Imported remediation requirements are blocked pending audit output:

`Waiting for user to upload agent-review-package.zip or audit output path`

Do not mark the big UI remediation complete in this run until audit output is
available, implementation is performed, verification passes, and live evidence
exists where required.

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

Still open:

- No deployment or production mutation was performed.
- Browser smoke screenshots, notification hooks, and manual Agent Mode smoke
  remain open.
- Audit-dependent `REQ-20260618-101` through `REQ-20260618-111` remain blocked
  on the external audit package only.
