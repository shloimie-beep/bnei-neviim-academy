# Next Session

Next unblocked batch: `1-identity-isolation`
Open requirement: `REQ-20260712-306`

Latest deployed SHA: `7fee7ca15874e1964da8d59671322130fe9ed2e0`

Current proof:

- `7fee7ca15874e1964da8d59671322130fe9ed2e0` is pushed to `origin/master`.
- BNA production `https://bneineviimacademy.org/api/deploy-info` returns that SHA.
- One Time production `https://join.onetimeonetime.com/api/deploy-info` returns that SHA.
- One Time signup Family/School behavior has live no-write browser proof and API dry-run proof.
- `REQ-20260712-305` passed live transaction-rollback identity-isolation proof and is terminal Done.

Continue by inspecting and repairing:

- canonical CRM contact aggregate service boundaries;
- list, aggregate, timeline, conversations, and tasks DTOs;
- server-side reconciliation of contacts, parent leads, signups, students, members, access, attendance, lifecycle, communications, notes, tasks, tickets, and suppression/opt-out records;
- stable `contact_key` API/URL identity;
- tests proving browser code is not unioning independent datasets.

Do not start broad CRM UI edits until the current-state/PQC requirements for UI surfaces are recorded and validated.

Full production readiness remains blocked only by external Stripe/campaign setup fields listed in `ops/production-readiness/latest-production-unblocker.md`.
