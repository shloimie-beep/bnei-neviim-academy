# Next Session

Start here:

1. Read `BNA-START-HERE.md`.
2. Read `docs/BNA-RAMBLE-TO-DONE.md`.
3. Run `npm run bna:run:status`.
4. Confirm whether `agent-review-package.zip` or an audit output path exists.

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

Current blocker for all open audit-dependent remediation:

`Waiting for user to upload agent-review-package.zip or audit output path`

Do not run yet:

- another full `npm run ops:audit` crawl;
- watch loops;
- agent fleet loops;
- deploys;
- production data mutations.

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
