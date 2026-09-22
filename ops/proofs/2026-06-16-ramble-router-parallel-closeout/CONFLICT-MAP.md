# MASTER-07 Conflict Map

Cycle ID: `2026-06-16-ramble-router-parallel-chatgpt-to-codex`

| Workstream | Wants to edit | Conflict level | Must run before | Must run after | Notes |
|---|---|---:|---|---|---|
| `UI-01` | `public/*.html`, `public/css/*.css`, screenshots, public helper placement | High | None | `OPS-02`, `HELPER-03` DOM changes | Keep final UI pass after feature-specific Operations/helper DOM settles. |
| `OPS-02` | `server.js`, `public/operations.html`, task/calendar/communications routes, `TASKS.md` | High | `HELPER-03` UI placement, `UI-01` polish | Backend/schema owners | Owns Communications/Funnel, task taxonomy, calendar visibility, and queue cleanup proof. |
| `HELPER-03` | `server.js`, `public/operations.html`, `src/lib/bna/helper/**`, action registry | High | `UI-01` final helper polish | `OPS-02` route ownership where needed | Local WS05 implementation exists; final deploy/live smoke needs a safe release decision. |
| `RABBI-04` | One Time/Rabbi docs, product decisions, scoped auth, class/calendar surfaces | Medium | `UI-01` final public polish | Backend/schema owners if changing shared tables | Core One Time foundations have prior proof; product/pricing/account/7pm decisions remain gated. |
| `INT-05` | integration docs/modules, readiness UI, keyholder diagnostics, Telegram bridge | Medium | `UI-01` final public polish | Backend route owners if adding endpoints | Readiness/dry-run only until credentials, DNS, and approval gates exist. |
| `COMMUNITY-06` | `server.js`, `public/student.html`, `public/parent.html`, WS11 helpers/tests | Medium | `UI-01` final portal polish | None for current deployed foundation | Completed/deployed via WS11 live proof; future public leaderboard/shoutout policy remains gated. |
| `MASTER-07` | `ops/proofs/**`, `TASKS.md`, memory, ledger, changelog, handoffs | High | Final status reporting | All workstream implementation passes | Coordination only; do not reimplement feature work. |

## Highest Conflict Files

- `server.js`
- `public/operations.html`
- `scripts/telegram-kimi-bridge.mjs`
- `scripts/agent-fleet-supervisor.mjs`
- `package.json` / `package-lock.json`
- `railway-migration-*.sql`
- `public/student.html`
- `public/parent.html`
- `public/index.html`
- `TASKS.md`
- `SYSTEM-STATE.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`

## Current Routing Decision

`INT-05` is the actual repo ID for the integration workstream started in this cycle. `INTEGRATIONS-05` is treated as an alias only.

`COMMUNITY-06` is the actual repo ID for the learning/community workstream started in this cycle. `LEARNING-06` is treated as an alias only.
