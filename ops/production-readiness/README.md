# Production Readiness Snapshot

This folder holds the tracked latest production-readiness control-tower
snapshot for BNA and OneTime.

Regenerate it with:

```bash
npm run production:readiness:snapshot
```

The snapshot is read-only. It samples git state, the active execution run,
agent fleet status, ChatGPT dropoff queue status, and the latest Rabbi Agent
Review proof-readiness file. It does not claim jobs, deploy, send messages,
save Agent Review results, mutate providers, change credentials, write to
external accounts, or touch production data.

The committed `latest-*` files are sampled reports, not live telemetry. A
commit that stores a refreshed snapshot can have a newer hash than the git head
recorded inside the report. Before acting on launch-critical state, local
agents should rerun the command above, or use:

```bash
node scripts/production-readiness-snapshot.mjs --no-write --json
```

Files:

- `latest-production-readiness-snapshot.md`: operator/agent-readable control
  tower.
- `latest-production-readiness-snapshot.json`: structured state for future
  automation.
