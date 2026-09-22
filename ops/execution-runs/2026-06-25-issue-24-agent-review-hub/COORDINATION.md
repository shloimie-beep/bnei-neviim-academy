# Issue #24 Coordination

Only this parent run owns `ops/execution-runs/latest.json`.

Child lanes may use isolated worktrees or branches, but they must write status
into `LANE-MANIFEST.json` or lane evidence under this run. They must not
rewrite shared ledgers, changelog, task register, canonical memory, or the
active-run pointer without parent integration.

## Lanes

- `drive-trace`: `REQ-20260625-025`
- `review-hub-auth`: `REQ-20260625-026`
- `helper-action-audit`: `REQ-20260625-027`
- `agent-mode-pack`: `REQ-20260625-028`
- `navigation-ia`: `REQ-20260625-029`
- `integration-release`: `REQ-20260625-030`

## Collision Rules

- No two lanes may edit the same owned implementation file without declaring
  integration ownership.
- No lane may mark the parent goal complete.
- No lane may deploy independently.
- No lane may apply class backfill or mutate production class/student data.
