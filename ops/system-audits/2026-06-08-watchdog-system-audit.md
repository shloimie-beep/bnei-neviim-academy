# Watchdog System Audit - 2026-06-08

Generated: 2026-06-08T21:24:19+03:00

## Summary

Audited the BNA watchdog system after repeated critical warnings appeared in
`ops/system-audits/*-watchdog.*`.

Current status is OK:

- Latest watchdog report: `ops/system-audits/2026-06-08T18-23-18-640Z-watchdog.md`
- Latest severity: OK
- Active tasks: 12
- Machine tasks: 0
- Machine in progress: 0
- Raw-looking visible titles: 0
- Misrouted watchdog cleanup tasks: 0
- Done without verification trail: 0
- Railway doctor: SUCCESS
- Academy Telegram bridge identity: OK

## Warning History Reviewed

Reviewed 81 watchdog reports from 2026-06-08.

- OK reports: 19
- WARN reports: 43
- CRITICAL reports: 19

Finding types seen:

- `telegram_wrong_profile`: 19 reports
- `machine_task_conflict`: 2 reports
- `done_without_verification_trail`: 61 reports
- `railway_doctor_warning`: 8 reports
- `raw_ramble_titles`: 3 reports

The repeated critical warnings were not current at the end of the audit. They
were historical reports caused mainly by the Telegram bridge identity check not
surviving normal log churn. That was fixed in the prior watchdog task by writing
non-secret bot/profile identity into the bridge runtime lock and teaching the
watchdog to trust that stable identity.

## Refinements Made

- Added watchdog incident lifecycle tracking to `scripts/agent-fleet-supervisor.mjs`.
- The watchdog now writes a concise `ops/agent-changelog.md` entry when a
  distinct non-OK incident opens or changes.
- The watchdog now writes a matching `ops/agent-task-ledger.jsonl` record for
  incident open/change/resolve events.
- The watchdog now writes a resolution changelog/ledger record when a previous
  non-OK incident returns to OK.
- Cleared stale alert signatures after recovery so a warning that clears and
  then returns can alert again.
- Allowed one-off `npm run watchdog:once -- --dry-run --no-telegram` audits to
  run while the background watchdog is already running. The long-running
  watchdog still keeps its normal runtime lock.

## Live Proof

After restarting the patched watchdog, it detected a fresh transient
`railway_doctor_warning` while deployment `e9be82ef-7162-4cd9-8499-d2d451de6167`
was BUILDING.

The watchdog wrote:

- Incident opened: `ops/system-audits/2026-06-08T18-19-57-630Z-watchdog.md`
- Incident resolved: `ops/system-audits/2026-06-08T18-21-05-167Z-watchdog.md`

The corresponding entries were appended to:

- `ops/agent-changelog.md`
- `ops/agent-task-ledger.jsonl`

The final audit returned OK:

- `ops/system-audits/2026-06-08T18-23-18-640Z-watchdog.md`

## Verification

- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --check server.js`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --test tests/watchdog-soft-repair.test.js`
- PASS `npm test` 55/55
- PASS `npm run watchdog:once -- --dry-run --no-telegram`
- PASS `npm run watchdog:once -- --no-telegram`
- PASS `npm run watchdog:restart`
- PASS `npm run watchdog:status`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke -- --require-drive`

Latest live smoke:

- `ops/live-smokes/2026-06-08T18-23-34-535Z-live-app-smoke.md`

## Result

The watchdog is running and healthy. Current warning state is clear. Future
critical/warn incidents now have a visible changelog/ledger lifecycle from
detected to resolved.
