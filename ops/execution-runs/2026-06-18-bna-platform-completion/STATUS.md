# Status

Current status: recovery run remains partial; Agent Control Center local batch
implemented and focused-test verified.

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
- No deployment, production DB mutation, external integration write, or broad
  UI crawl was performed.

Still open after this batch:

- `REQ-20260619-203` remains open for the remaining ambiguity behavior:
  low-confidence unclear scope should create one routing Decision/review item,
  not multiple visible tasks. Live raw queue/API readback also remains open.
- DB/API smoke, negative scoped-identity tests, browser smoke, full One Time
  button audit, safe demo agent run, and manual Agent Mode smoke.
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

Still open:

- No deployment or production mutation was performed.
- Local DB/API smoke, browser smoke screenshots, negative scoped-identity
  tests, Playwright/demo data, notification hooks, and manual Agent Mode smoke
  remain open.
- Audit-dependent `REQ-20260618-101` through `REQ-20260618-111` remain blocked
  on the external audit package only.
