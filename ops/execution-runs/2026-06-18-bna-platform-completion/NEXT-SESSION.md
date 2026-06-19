# Next Session

Start here:

1. Read `BNA-START-HERE.md`.
2. Read `docs/BNA-RAMBLE-TO-DONE.md`.
3. Run `npm run bna:run:status`.
4. Confirm current branch and HEAD with `git status --short --branch`.

Current 2026-06-19 checkpoint:

- `REQ-20260618-102` has local PWA separation proof now and is a
  `needs_operator_decision` release gate: public, parent, and Operations
  manifests have distinct identities/start URLs/scopes; the public service
  worker is tracked and bypasses private app prefixes; live/deploy
  verification remains withheld until explicit release approval.
- `REQ-20260619-201`, `REQ-20260619-202`, and `REQ-20260619-208` are locally
  done for this no-write batch.
- `REQ-20260619-203` is locally done: One Time scope inheritance,
  unclear-scope single routing Decision/review behavior, and local raw
  queue/API readback through `/api/bna/intake/parse` are implemented and
  tested.
- `REQ-20260619-204` is locally done: helper/route isolation, owner/admin
  auth, canonical seed assignment reuse, scoped-access readback, and BNA
  workspace override denial are implemented and tested.
- `REQ-20260619-205` is locally done: One Time module/button audit,
  role-based browser smoke, read-only scoped Agents status, and no-write Drive
  Brief preview were implemented and tested locally.
- `REQ-20260619-206` has local DB/API route smoke coverage now: a safe demo
  Agent Run can be created, claimed, progressed, given evidence, submitted
  blocked, sealed, and linked to one operator Decision through real route
  handlers with fake local data.
- `REQ-20260619-206` also has focused Super Admin browser smoke coverage now:
  `/operations?workspace=platform&view=agents` and
  `/operations/agents/runs/run_agent_control_smoke` render correctly at
  1440x900, 768x1024, 390x844, and 360x800 with fake local data, screenshots,
  no overflow, and no console/page errors.
- `REQ-20260619-206` also has interactive Super Admin browser proof now: the
  real Operations Agent Run portal was exercised with fake local data through
  `Claim Run`, `Post Progress`, `Attach Evidence`, `Submit Result`, `Seal Run`,
  page reload, and persisted `Sealed Pass` readback. Evidence:
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-report.md`
  and
  `ops/playwright-smokes/2026-06-19-agent-control-browser-local/interactive-run.png`.
- `REQ-20260618-122` has local notification/audit-history coverage now:
  Agent Run ready/blocked alerts are private in-app rows only, progress updates
  do not create notification spam, and the blocked alert links to the single
  operator Decision.
- `REQ-20260618-105` is locally done: the shared BNA shell/design-system
  contract now covers Operations and portal shell labels, light palette tokens,
  sticky toolbar, side menus, top filters, custom select menus, Agent Status
  and task activity panels, settings dashboards, integration cards, metric
  wrapping, compact mobile strips, and removal of stale family-app copy.
- `REQ-20260618-106` is locally done: task lanes separate Decisions, Tasks,
  Codex Queue, Blocked/Pending, Calendar, and Done / Activity; comments do not
  implicitly requeue agent work; Decision lifecycle actions preserve audit;
  unclear workspace intake creates one routing Decision without task fan-out;
  scoped One Time intake readback is idempotent and blocks BNA overrides; and
  the internal task calendar remains canonical while external sync is gated.
- `REQ-20260618-108` is locally done: Operations student detail uses selected
  workspace/student scope, Goal Board matching prefers linked student IDs over
  aliases, group goals do not leak into provider workspaces, Goal Board review
  and device-accountability gates are child-safe, parent-managed student
  username/password login is scoped and audited, and parent/student Hebrew/RTL
  labels plus long-link/card wrapping are covered by focused tests.
- `REQ-20260618-109` is locally done: helper scope/profile/knowledge modules,
  tool registry side-effect levels, confirmation gates, scoped permissions,
  natural-language planner actions, audit/action logs, redaction, provider
  integration secret handling, mobile assistant layout, and provider-neutral
  OpenAI/Kimi hosted-chat fallback are implemented and locally tested without
  live sends or secret exposure.
- `REQ-20260618-110` is locally done: public homepage/nav copy, One Time
  landing CTAs, parent/provider/rabbi/service-provider portal headers, signup
  route labels, public helper copy, Operations route privacy expectations, and
  public content contamination guards are implemented and locally tested
  without deployment.
- `REQ-20260618-111` is locally done: the dry-run-first safe seed harness,
  generated TEST_REQ022 seed/cleanup artifacts, package script, and active-run
  acceptance coverage tests are implemented and locally verified without any
  production write.
- `REQ-20260618-112` through `REQ-20260618-118`, `REQ-20260618-120`,
  `REQ-20260618-122`, and `REQ-20260619-206` are
  `needs_operator_decision` release gates: local Agent Control implementation,
  API/browser smoke, interactive browser click-through, manual browser
  judgment, notification/no-spam proof, safe test data, RBAC proof, and prompt
  evidence are implemented, but deployment/live proof is withheld until
  explicit release approval.
- `REQ-20260618-121` and `REQ-20260618-123` are locally done after the
  in-app browser manual Agent Mode smoke. Evidence:
  `ops/playwright-smokes/2026-06-19-agent-control-manual-browser/manual-browser-report.md`.
- Manual Agent Mode/browser-judgment execution is locally complete. The
  remaining Agent Control gates are live-required release/deploy verification
  and external approval, not another local manual smoke.
- Latest validation after release-gate normalization:
  `needs_operator_decision: 11`, `blocked: 2`, `done: 18`.
- `REQ-20260619-207` is genuinely blocked for live provider setup until
  operator supplies or performs external account-owner actions through the
  secure keyholder/environment workflow.

Exact next requirement:

No credential-free implementation row is currently `in_progress`. The exact
next gate is release approval for deploy/live smoke of the live-required rows,
or external input for the two blockers: audit output for `REQ-20260618-101`
and owner/credential actions for `REQ-20260619-207`. The local manual Agent
Mode/browser-judgment smoke is complete. The latest focused Agent Control/
active-run suite passed 12/12 and `npm run bna:run:validate` passed with
status counts `needs_operator_decision: 11`, `blocked: 2`, `done: 18`.

Exact next command:

```powershell
node --test tests\agent-control-center.test.js tests\agent-control-api-readback.test.js tests\agent-control-browser-smoke.test.js tests\agent-control-manual-smoke-prompt.test.js tests\active-run-acceptance-coverage.test.js
npm run bna:run:validate
```

Then stop unless explicit release approval, audit output, or credential/owner
input is available. Do not touch production data, live sends, deploys, broad UI
crawls, watch loops, or agent-fleet loops without the required approval/input.

Open requirements:

- `REQ-20260618-101` is blocked on the external audit package/output.
- `REQ-20260618-102` is locally implemented and waiting for explicit release
  approval before deploy/live smoke.
- `REQ-20260618-112` through `REQ-20260618-118` are locally implemented and
  waiting for explicit release approval before deploy/live smoke.
- `REQ-20260618-120` has local negative API smoke and is waiting for explicit
  release approval before deploy/live smoke.
- `REQ-20260618-122` has local notification/audit-history proof and is waiting
  for explicit release approval before deploy/live smoke.
- `REQ-20260619-206` has local closed-loop proof and is waiting for explicit
  release approval before deploy/live smoke.
- `REQ-20260619-207` is blocked on external owner/credential actions for
  Vimeo, Zoom, and Resend.

Current audit blocker:

`REQ-20260618-101` and screenshot-specific visual findings are waiting for the
user to upload `agent-review-package.zip` or provide the audit output path.
Credential-free implementation must continue without waiting for that package.

Deferred release-gate check:

```powershell
node --test tests\agent-control-center.test.js tests\agent-control-api-readback.test.js tests\agent-control-browser-smoke.test.js tests\agent-control-manual-smoke-prompt.test.js tests\active-run-acceptance-coverage.test.js
npm run bna:run:validate
```

Use this only after explicit release approval or when checking the local
evidence before requesting release approval. Do not repeat the manual Agent
Mode/browser-judgment smoke unless the Agent Control implementation changes.

Do not run yet:

- another full `npm run ops:audit` crawl;
- watch loops;
- agent fleet loops;
- deploys;
- production data mutations.

Do not mark Agent Control Center complete until:

- the local DB migration/API smoke passes;
- negative scoped-identity tests pass;
- browser smoke evidence exists for the Agents list and Agent Run page;
- private in-app notification/no-spam proof exists;
- safe demo data/E2E/manual Agent Mode prompt is recorded;
- `npm run bna:run:validate` passes;
- release/deploy approval is explicit and deploy/live smoke evidence exists for
  live-required rows.

Prompt after the audit ZIP/output exists:

```text
The audit output is ready at: [PASTE ZIP PATH OR OUTPUT FOLDER]

Resume the BNA execution run in
ops/execution-runs/2026-06-18-bna-platform-completion.
Read BNA-START-HERE.md and docs/BNA-RAMBLE-TO-DONE.md.
Run npm run bna:run:status and npm run bna:run:validate.

Use the existing audit output as evidence. Do not rebuild the audit harness and
do not start another full UI crawl unless the audit package is unreadable.
Parse the audit findings into the existing REQ-20260618-101 through
REQ-20260618-111 requirements, then implement the next safe batch with
current-state comparison, tests, evidence updates, ledger/changelog updates,
and NEXT-SESSION.md handoff. Do not deploy or mutate production data unless I
explicitly approve that in this session.
```
