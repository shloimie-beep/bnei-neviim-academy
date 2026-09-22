# Issue #20 Parent Coordination

Generated: 2026-06-24T22:55:00+03:00

## Parent Run Rule

Only the parent run may update:

- `ops/execution-runs/latest.json`
- `TASKS.md`
- `MEMORY.md`
- `ops/agent-task-ledger.jsonl`
- `ops/agent-changelog.md`
- canonical route/action registries unless the lane declares registry ownership
- final deployment/live-smoke evidence

Child lanes may write lane-local evidence under:

- `ops/execution-runs/2026-06-24-issue-20-parent-run/lanes/<lane-id>/`
- `ops/issue-20/<lane-id>/`
- lane-specific tests/screenshots/audits declared in `LANE-MANIFEST.json`

## Permission Tiers

- Tier 0 - read/audit/test/report: automatic.
- Tier 1 - local code edits, tests, isolated branch/worktree, draft PR:
  automatic after lane ownership is declared.
- Tier 2 - merge/deploy/live smoke: allowed only when release gates pass and the
  parent run authorizes release closeout.
- Tier 3 - sends, charges, refunds, DNS, public publishing, account permission
  changes, production data mutation, and class backfill: blocked unless a
  specific owner Decision explicitly approves the exact action.

Default `AGENT_FLEET_AUTO_DEPLOY` remains off.

## Lane Rules

- A lane must claim requirement IDs, file ownership, branch/worktree, evidence
  directory, and integration owner before implementation.
- A lane must not edit another lane's declared owned files without updating the
  manifest and assigning an integration owner.
- A lane must not mark the parent run complete.
- A lane must not open duplicate visible Tasks or Decisions.
- A lane must report one of: `queued`, `claimed`, `running`, `blocked`,
  `ready_for_integration`, `integrated`, or `failed`.
- A lane heartbeat must include timestamp, branch, commit if any, verification,
  blockers, and next action.
- App-visible work remains open until deploy/live-smoke proof exists or a
  precise blocker is recorded.

## Current Baseline Blockers

- Railway CLI targeting is mismatched: local status reports project
  `one-time-production` and `npm run railway:doctor` cannot find service
  `skillful-motivation`.
- Direct live app health is OK: `https://bneineviimacademy.org/api/health`
  returned HTTP 200 with database connected.

The Railway targeting mismatch blocks final deploy/live closeout until repaired
or superseded by an approved current deployment path. It does not block Tier 0
or Tier 1 implementation lanes.
