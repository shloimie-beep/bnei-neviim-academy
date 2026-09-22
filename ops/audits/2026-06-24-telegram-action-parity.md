# Telegram / Website Assistant Action Parity

Requirement: `REQ-20260623-026`

Current parity source:

- `ops/action-registry/actions.json`
- `ops/action-registry/universal-action-parity.md`
- `ops/action-registry/universal-action-parity.json`
- `ops/action-registry/one-time-action-coverage.md`

Latest generated parity result from the clean PR worktree:

- Visible controls inventoried: 22
- Visible controls classified: 22
- Total registry rows: 138
- Detailed action rows: 80
- Missing contracts: 0
- Missing handlers: 0
- Missing tests: 0
- Risky actions without approval: 0
- One Time controls inventoried: 40
- Watchdog: `npm run watchdog:actions` passed with 0 findings.

The live Assistant Control Center registry readback returned 79 runtime
`listActions()` actions. The detailed registry has 80 rows because it also
tracks persisted parity/detail rows that do not expand the runtime action list.
