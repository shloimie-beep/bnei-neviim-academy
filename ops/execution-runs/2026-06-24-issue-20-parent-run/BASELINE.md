# Baseline

Initial local baseline at registration:

- Working branch: `codex/issue-20-parent-run-20260624`
- Branch base: `codex/issue-18-class-intake-readonly-20260624`
- Base commit: `63db04468b1d7695292e922ff6757d1f42aef033`
- Issue #18 run is terminal and inactive in this branch.
- Issue #20 parent run is the only active execution run in this branch.
- Dependencies installed with `npm install --no-audit --no-fund`.

Required recheck for `REQ-20260624-040`:

- Current `origin/master` and issue #18 PR/branch state: recorded in
  `BASELINE-READBACK.md`.
- Current live app health: recorded in `BASELINE-READBACK.md`.
- Current Railway CLI/deploy tooling state: recorded in `BASELINE-READBACK.md`;
  local targeting mismatch blocks final deploy/live closeout.
- Current `ops/execution-runs/latest.json`: points to this Issue #20 parent
  run.
- Parent coordination rules: recorded in `COORDINATION.md` and
  `LANE-MANIFEST.json`.

Still required before implementation lane closeout:

- Inspect route/action registries and relevant live app/schema surfaces within
  each lane.
- Existing fleet/watchdog/GitHub-intake scripts must be inspected before their
  specific implementation lanes are marked Done.
