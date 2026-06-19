# Next Session

Start here:

1. Read `BNA-START-HERE.md`.
2. Read `docs/BNA-RAMBLE-TO-DONE.md`.
3. Run `npm run bna:run:status`.
4. Confirm current branch and HEAD with `git status --short --branch`.

Current 2026-06-19 checkpoint:

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
- `REQ-20260619-206` continues the Agent Control Center DB/API/browser/manual
  Agent Mode smoke work from `REQ-20260618-112` through `REQ-20260618-123`.
- `REQ-20260619-207` is genuinely blocked for live provider setup until
  operator supplies or performs external account-owner actions through the
  secure keyholder/environment workflow.

Exact next requirement:

`REQ-20260619-206` Agent Control Center DB/API/browser and manual Agent Mode
smoke.

Exact next command:

```powershell
node --test tests\agent-control-center.test.js
npm run bna:run:validate
```

Then continue `REQ-20260618-121`: add a safe local DB/API smoke for one demo
task creating an Agent Run, attaching evidence, submitting a blocked or fail
result, and proving task/decision side effects without touching production
data. After the API smoke, add focused browser smoke evidence for Super Admin
Agent Control Center list and Agent Run portal only; do not start a broad
baseline UI crawl.

Open requirements:

- `REQ-20260618-101` audit harness and audit package
- `REQ-20260618-102` PWA public-vs-Operations separation
- `REQ-20260618-103` workspace model and RBAC
- `REQ-20260618-104` Operations shell and navigation
- `REQ-20260618-105` design system
- `REQ-20260618-106` task manager, intake, and calendar
- `REQ-20260618-107` module scoping
- `REQ-20260618-108` students, Goal Board, and Hebrew
- `REQ-20260618-109` unified OpenAI helper
- `REQ-20260618-110` public copy and portal headers
- `REQ-20260618-111` test data and acceptance tests
- `REQ-20260618-112` Agent Control Center parent
- `REQ-20260618-113` through `REQ-20260618-118` need local DB/API/browser
  verification before closure
- `REQ-20260618-120` needs negative RBAC/API tests
- `REQ-20260618-121` Playwright verification policy remains in progress
- `REQ-20260618-122` notification/audit-history hooks remain in progress
- `REQ-20260618-123` safe demo data, E2E, and manual Agent Mode smoke remain
  not started

Current blocker for `REQ-20260618-101` through `REQ-20260618-111`:

`Waiting for user to upload agent-review-package.zip or audit output path`

Agent Control Center next exact command:

```powershell
node --test tests\agent-control-center.test.js; npm run bna:run:validate
```

After that, continue with `REQ-20260618-121`: add a safe local DB/API smoke
for one demo task creating an Agent Run, attaching evidence, submitting a
blocked or fail result, and proving the task/decision side effects without
touching production data.

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
