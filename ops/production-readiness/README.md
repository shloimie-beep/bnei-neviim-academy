# Production Readiness Snapshot

This folder holds the tracked latest production-readiness control-tower
snapshot for BNA and OneTime.

Regenerate it with:

```bash
npm run production:readiness:snapshot
```

Run the blocking release/readiness gate with:

```bash
npm run production:readiness:gate
```

Generate the operator-facing unblocker packet with:

```bash
npm run production:unblocker
```

The snapshot is read-only. It samples git state, the active execution run,
agent fleet status, ChatGPT dropoff queue status, and the latest Rabbi Agent
Review proof-readiness file. It also carries forward the agent-fleet
auto-deploy production-readiness preflight proof from
`ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`, so future agents
can see whether fleet auto-deploy is blocked by
`production_readiness_gate_blocked`. It does not claim jobs, deploy, send
messages, save Agent Review results, mutate providers, change credentials,
write to external accounts, or touch production data.

The committed `latest-*` files are sampled reports, not live telemetry. A
commit that stores a refreshed snapshot can have a newer hash than the git head
recorded inside the report. Before acting on launch-critical state, local
agents should rerun the command above, or use:

```bash
node scripts/production-readiness-snapshot.mjs --no-write --json
```

`production:readiness:gate` is expected to exit nonzero until production is
actually ready. A nonzero gate with exact blockers is the correct state while
external setup values, terminal Agent Mode proof, active collision lanes, dirty
worktree state, or queued ChatGPT packets remain.

`npm run bna:release-gate` also enforces this gate for deploy, live-verify, and
final-closeout modes. Plain dry-run release checks remain useful for status
readback, but no production closeout path should be considered clear while
`production_readiness_gate.ok` is false.

Files:

- `latest-production-readiness-snapshot.md`: operator/agent-readable control
  tower.
- `latest-production-readiness-snapshot.json`: structured state for future
  automation.
- `latest-production-unblocker.md`: concise operator-facing list of the exact
  external setup fields and Agent Mode proof saves still blocking production.
- `latest-production-unblocker.json`: structured unblocker state for future
  automation or UI display.
