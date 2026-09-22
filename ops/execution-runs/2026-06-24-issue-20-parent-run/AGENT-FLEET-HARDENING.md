# Agent Fleet Hardening

Requirement: `REQ-20260624-045`

## Summary

The existing BNA agent fleet was hardened in place. No second fleet, intake
protocol, task manager, memory system, or active-run pointer was created.

Implemented:

- explicit permission tiers 0-3 with Tier 3 blocked by default;
- supervisor prompt/status redaction and permission-gate reporting;
- Windows start, stop, restart, status, and open-log controls for the fleet and
  watchdog;
- bounded hidden startup retries under the current Windows login context;
- local startup metadata and local-only runtime logs;
- parent-run coordination checks for active-pointer drift, duplicate
  requirements/tasks, missing lanes, branch drift, and premature parent
  completion;
- synthetic no-write proof covering GitHub intake, claim/worktree preview,
  typed result action dry-run, Operations activity links, GitHub status preview,
  and parent closeout guardrails.

## Files

- `src/lib/bna/agent-fleet-hardening.js`
- `scripts/agent-fleet-supervisor.mjs`
- `scripts/start-agent-fleet.ps1`
- `scripts/start-watchdog.ps1`
- `scripts/agent-fleet-readiness.mjs`
- `tests/agent-fleet-hardening.test.js`
- `package.json`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.md`
- `ops/agent-fleet-hardening/latest-agent-fleet-readiness.json`

## Acceptance

| Criterion | Status | Evidence |
|---|---|---|
| Existing fleet audited and hardened; no second fleet created | Pass | Supervisor and launcher changes reuse `scripts/agent-fleet-supervisor.mjs`; readiness guardrail records "No second agent fleet created." |
| Permission tiers 0-3 explicit, Tier 3 blocked on Decision/approval | Pass | `AGENT_FLEET_PERMISSION_TIERS`; focused tests; readiness permission checks classify deploy as Tier 2 and sends/class backfill as Tier 3 blocked. |
| Windows startup uses login context, bounded retries, redacted logs, and shortcuts | Pass | `scripts/start-agent-fleet.ps1`; `scripts/start-watchdog.ps1`; status checks read back `DESKTOP-E984MCC\User`; test checks launcher controls. |
| Parent-run coordination prevents pointer drift, duplicates, stale branches, overwritten evidence, and premature parent completion | Pass | `buildParentCoordinationAudit`; latest readiness report has `ok=true` and 0 findings. |
| Synthetic background proof covers intake, claim, worktree, result API, Operations activity, GitHub status, and parent closeout without production mutation | Pass | `npm run watchdog:agent-fleet -- --json`; synthetic ID `51db2f8fb2ce22e1`; `external_write_performed=false`. |

## Verification

- `node --check src\lib\bna\agent-fleet-hardening.js`
- `node --check scripts\agent-fleet-readiness.mjs`
- `node --check scripts\agent-fleet-supervisor.mjs`
- `node --check tests\agent-fleet-hardening.test.js`
- PowerShell parse check for `scripts\start-agent-fleet.ps1` and
  `scripts\start-watchdog.ps1`
- `node --test tests\agent-fleet-hardening.test.js` 6/6
- `node --test tests\agent-fleet-hardening.test.js tests\watchdog-soft-repair.test.js tests\workspace-task-no-stale-agent.test.js` 25/25
- `node --test tests\agent-control-api-readback.test.js tests\operations-activity-queue-health-ui.test.js` 5/5
- `npm run watchdog:agent-fleet -- --json`
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\start-agent-fleet.ps1 -Status`
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\start-watchdog.ps1 -Status`
- package and lane-manifest JSON parse check
- post-closeout `npm run bna:run:validate`,
  `npm run bna:run:source-coverage`, `npm run bna:run:stale-evidence`,
  JSON/JSONL parse, `npm run secrets:audit`, `git diff --check`, and
  `npm run bna:run:next` selected `REQ-20260624-046`

## Guardrails

No deploy, production mutation, external write, GitHub status comment, send,
charge, DNS change, credential/account change, Drive write, class backfill,
public publishing, browser private capture, or secret exposure was performed.

`REQ-20260624-045` is terminal locally. Continue with `REQ-20260624-046`.
