# Next Session

Start here:

1. Read `BNA-START-HERE.md`.
2. Read `docs/BNA-RAMBLE-TO-DONE.md`.
3. Run `npm run bna:run:status`.
4. Confirm current branch and HEAD with `git status --short --branch`.

Current 2026-06-19 checkpoint:

- `REQ-20260618-102` has local PWA separation proof now: public, parent, and
  Operations manifests have distinct identities/start URLs/scopes; the public
  service worker is tracked and bypasses private app prefixes; live/deploy
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
- Manual Agent Mode/browser-judgment smoke remains open.
- `REQ-20260619-207` is genuinely blocked for live provider setup until
  operator supplies or performs external account-owner actions through the
  secure keyholder/environment workflow.

Exact next requirement:

`REQ-20260618-108` students, Goal Board, Hebrew, and RTL continuation, while
preserving the already closed `REQ-20260618-103` workspace/RBAC,
`REQ-20260618-104` Operations shell/navigation, `REQ-20260618-105` design
system, `REQ-20260618-106` task/intake/calendar, and
`REQ-20260618-107` module-scoping proof.

Exact next command:

```powershell
node --test tests\operations-student-detail-scope.test.js tests\goal-board.test.js tests\hebrew-rtl-ui-labels.test.js tests\student-portal-auth-policy.test.js tests\telegram-goal-board-api-coverage.test.js
npm run bna:run:validate
```

Then continue `REQ-20260618-108`: inspect student isolation, duplicate-student
cleanup, Goal Board visibility/review gates, parent/student portal Hebrew/RTL
labels, and Operations student detail scoping; add only missing focused proof
or small fixes, and avoid broad UI crawls or production data writes.

Open requirements:

- `REQ-20260618-101` audit harness and audit package
- `REQ-20260618-102` PWA public-vs-Operations separation is locally
  implemented and needs release/live verification
- `REQ-20260618-108` students, Goal Board, and Hebrew
- `REQ-20260618-109` unified OpenAI helper
- `REQ-20260618-110` public copy and portal headers
- `REQ-20260618-111` test data and acceptance tests
- `REQ-20260618-112` Agent Control Center parent
- `REQ-20260618-113` through `REQ-20260618-118` have local API/browser proof
  but still need manual Agent Mode/browser-judgment closeout before closure
- `REQ-20260618-120` has local negative API smoke; browser/live proof remains
  withheld until release approval
- `REQ-20260618-121` Playwright/browser verification policy has focused local
  proof; manual Agent Mode closeout remains open
- `REQ-20260618-122` notification/audit-history hooks are locally implemented
  and need release/live verification when deployment is approved
- `REQ-20260618-123` is in progress: safe local API/browser demo fixtures
  exist, while manual Agent Mode smoke remains open

Current audit blocker:

`REQ-20260618-101` and screenshot-specific visual findings are waiting for the
user to upload `agent-review-package.zip` or provide the audit output path.
Credential-free implementation must continue without waiting for that package.

Deferred Agent Control manual-smoke check:

```powershell
node --test tests\agent-control-center.test.js tests\agent-control-api-readback.test.js tests\agent-control-browser-smoke.test.js; npm run bna:run:validate
```

Use this only when returning to `REQ-20260618-123` / `REQ-20260619-206`:
perform the manual Agent Mode/browser-judgment smoke using the generated Agent
Run prompt, record pass/fail/blocked evidence in this run, then reassess which
Agent Control requirements can move from `needs_verification` to locally done
while still withholding deployment until explicit approval.

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
- release/deploy approval is explicit if live closeout is required.

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
