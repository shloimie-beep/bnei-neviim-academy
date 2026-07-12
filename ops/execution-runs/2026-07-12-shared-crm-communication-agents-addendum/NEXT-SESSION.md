# Next Session

Next unblocked batch: `2-shared-crm`
Open requirement: `REQ-20260712-302`

Latest deployed SHA: `de48d8aef8b4764b5144a89edef9e269c102c25f`

Current proof:

- `de48d8aef8b4764b5144a89edef9e269c102c25f` is pushed to `origin/master`.
- BNA production `https://bneineviimacademy.org/api/deploy-info` returns that SHA.
- One Time production `https://join.onetimeonetime.com/api/deploy-info` returns that SHA.
- One Time signup Family/School behavior has live no-write browser proof and API dry-run proof.
- `REQ-20260712-305` passed live transaction-rollback identity-isolation proof and is terminal Done.
- `REQ-20260712-302` has a deployed partial shared CRM service/module slice: canonical contact service wrapper, shared browser CRM modules, Operations shared CRM markers, customer-facing empty states/actions, action registry coverage, and One Time Operations CRM workbench live smoke with 12 scoped cards and read-only timeline.
- The first deployed shared-CRM slice exposed a live row-loader adapter bug; hotfix `bf0ec619b5ed10b2c057d5cf4f1553362d6614f4` fixed it by passing `pool` into `operationsCrmContactRows`.
- CRM URL-state slice is also deployed: `crm_contact`, `crm_search`, `crm_type`, `crm_status`, `crm_source`, `crm_tag`, `crm_sort`, and `crm_scroll` are wired locally and deployed through `f818822bb3969dca5d27f7c5a70d4dbf0baa8744`.
- Local update/no-auto-task slice is deployed: selected contact workspace exposes a local first-party update form and the server creates CRM follow-up tasks only when `create_follow_up_task` is explicitly true. Deployed through `224bc077919c624f115c264d35e35092ed4144da`.
- Explicit Create task action is deployed through `ded53274e31f91abff7944c094bdcdfaa9c55c5e`; the action creates a task only after an explicit click with `create_follow_up_task=true`.
- CRM workspace tabs are deployed through `1c4880418954d984c08683ba0955a32549eb33aa`; Overview, Activity, Conversations, Tasks, and Access render customer-facing panels and the One Time CRM workbench live smoke passed with 12 scoped cards and read-only selected timeline.
- Add Contact is deployed under `REQ-20260712-303` through `de48d8aef8b4764b5144a89edef9e269c102c25f`: the form is registered as `ACTION-CRM-ADD-CONTACT`, POST `/api/bna/crm/contacts` is workspace-scoped, identities are workspace-scoped, no external send/access/import/task creation runs, and the One Time live CRM workbench smoke passed after deploy.

Continue by inspecting and repairing:

- remaining dedicated CRM workspace/actions and component parity under `REQ-20260712-302` / `REQ-20260712-303`;
- canonical CRM contact aggregate service boundaries;
- list, aggregate, timeline, conversations, and tasks DTOs;
- server-side reconciliation of contacts, parent leads, signups, students, members, access, attendance, lifecycle, communications, notes, tasks, tickets, and suppression/opt-out records;
- stable `contact_key` API/URL identity;
- tests proving browser code is not unioning independent datasets.

Do not start broad CRM UI edits until the current-state/PQC requirements for UI surfaces are recorded and validated.

Full production readiness remains blocked only by external Stripe/campaign setup fields listed in `ops/production-readiness/latest-production-unblocker.md`.
