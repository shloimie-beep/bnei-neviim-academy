# Collision Hotspots

## High-Risk Files

- `server.js`: live Express app and many unrelated BNA, Operations, One Time, provider, Telegram, and API routes. This run touched only the focused School shell route, route allowlist, and BNA-scoped summary API.
- `public/operations.html`, `public/operations-bootstrap.html`, `public/js/operations-shell.js`: existing Operations shell and generated/deferred runtime. This run intentionally avoided editing these files to preserve Control Plane and provider behavior.
- `ops/route-registry.json` and `ops/action-registry.json`: source registries used by watchdogs. Rows were added only for actual new School route/API/actions.
- `package.json`: shared command surface. Only two School performance scripts were added.

## Medium-Risk Files

- `public/parent.html` and `public/student.html`: priority compatibility journeys. They were not edited; regression coverage remains a verification concern for the final browser harness.
- `ops/chatgpt-ramble-dropoff/CONTROL-TOWER.json` and `.md`: refreshed by required startup command. They are unrelated to School implementation and should remain unstaged unless the operator intentionally wants the refresh committed.

## New Low-Risk Files

- `public/school-admin.html`
- `public/css/school-admin.css`
- `public/js/school-admin.js`
- `scripts/check-school-admin-performance-budget.mjs`
- `scripts/audit-school-admin-performance.mjs`
- `tests/school-admin-speed-surface.test.js`

## Coordination Result

No open remote PR or branch was modified. No production data, migrations, provider accounts, DNS, email, payment, or deployment target was mutated. The clean external worktree isolates the implementation from the user's dirty checkout.
