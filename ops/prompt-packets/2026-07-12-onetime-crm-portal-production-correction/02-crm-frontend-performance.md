# PKT-20260712-106 - CRM Frontend Performance

Scope: implement only REQ-20260712-106 for One Time CRM list/detail loading performance.

Do not solve the whole parent ramble. Complete only this packet scope and record the next packet or blocker.

Acceptance criteria:

- Contact selection does not call the application-wide render function.
- Initial CRM API calls after auth are no more than 3.
- Initial rows rendered are no more than 50.
- Stale requests are aborted and search is debounced.
- Legacy CRM review table is not constructed while closed.

Allowed implementation files:

- public/operations.html
- public/js/operations-shell.js
- scripts/smoke-onetime-operations-crm-workbench-local.mjs
- Execution-run and evidence records for this requirement

Forbidden:

- External sends/writes, payments, access grants, DNS, GHL/LeadConnector runtime, provider-account mutation, production data mutation.
- Broad CRM/inbox redesign; keep that for REQ-20260712-107.
