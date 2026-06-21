# Agent Fleet Status Audit - 2026-06-17

Status: passed

## Latest Status

`npm run agent:fleet:status` reported:

- Supervisor: not running
- Observable Codex jobs: `0`
- Active Codex task fallback: `0`
- Ready to claim: `0`
- Baseline smoke: enabled
- Auto deploy gate: enabled

## Cross-Checks

- `npm run task:reconcile`: active machine tasks `0`; actions `0`.
- `npm run ops:audit-queue -- --json --requeue-candidates`: requeue candidates `0`.
- Railway doctor: deployment `8f7d16a8-9c0e-4298-9901-7bfc3075a1b2`, status `SUCCESS`.
- Live app smoke: passed, report `ops/live-smokes/2026-06-17T17-52-27-607Z-live-app-smoke.md`.

## Notes

The queue audit still detects local runtime files and old ledger-only rows as
stale or unknown. Those records are not live Codex jobs. They should be cleaned
as source-of-truth/reporting hygiene, not treated as work stuck in Codex queue.
