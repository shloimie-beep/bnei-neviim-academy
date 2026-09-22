# Agent Fleet Readiness

Generated: 2026-07-09T15:49:58.531Z
Requirement: REQ-20260702-102
Overall OK: true

## Permission Tiers

- Tier 0: Read-only audit, local status, local tests, dry-run previews, reports, and evidence capture.
- Tier 1: Local code edits, local tests, isolated worktrees/branches, commits, pushes, and draft PR preparation after lane ownership is declared.
- Tier 2: Merge, deploy, Railway doctor, and live-smoke release work only after parent release gates authorize it.
- Tier 3: Sends, charges, refunds, DNS, public publishing, account permission changes, credential changes, production data mutation, Drive writes, and class backfill.

## Permission Command Checks

| Command | Tier | Blocked by default | Reason |
|---|---:|---|---|
| `npm test` | 0 | no | read/audit/test/report command |
| `git commit -m "checkpoint"` | 1 | no | local implementation or draft-PR command |
| `npm run railway:doctor` | 2 | no | release/deploy/live-smoke command requires parent release gate |
| `APPLY_GUARDED_CLASS_BACKFILL=true npm run class:backfill` | 3 | yes | matches external write, production mutation, credential/account, send, charge, publish, Drive write, or class backfill guard |
| `node scripts/send-parent-update.mjs --send` | 3 | yes | matches external write, production mutation, credential/account, send, charge, publish, Drive write, or class backfill guard |

## Startup Shortcuts

| Action | Command | Expected behavior |
|---|---|---|
| start | `cd C:\Users\User\BNA v2.0 ; npm run agent:fleet:start` | starts hidden watcher under the current Windows login with bounded retries |
| stop | `cd C:\Users\User\BNA v2.0 ; powershell -ExecutionPolicy Bypass -File scripts/start-agent-fleet.ps1 -Stop` | stops only the PID recorded in the agent-fleet lock |
| restart | `cd C:\Users\User\BNA v2.0 ; npm run agent:fleet:restart` | stops the recorded PID, clears stale lock, and starts with bounded retries |
| status | `cd C:\Users\User\BNA v2.0 ; npm run agent:fleet:status` | reads local lock plus API queue/status when credentials are available |
| open_log | `cd C:\Users\User\BNA v2.0 ; powershell -ExecutionPolicy Bypass -File scripts/start-agent-fleet.ps1 -OpenLog` | opens local output/error logs without printing secrets into chat |
| watchdog_start | `cd C:\Users\User\BNA v2.0 ; npm run watchdog:start` | starts watchdog mode on the existing supervisor script |
| watchdog_stop | `cd C:\Users\User\BNA v2.0 ; powershell -ExecutionPolicy Bypass -File scripts/start-watchdog.ps1 -Stop` | stops only the watchdog PID recorded in its lock |
| watchdog_status | `cd C:\Users\User\BNA v2.0 ; npm run watchdog:status` | reads watchdog lock plus API runtime status when credentials are available |

## Parent Coordination Audit

- OK: true
- Findings: 0
- Requirements: 10
- Hidden agent tasks: 0
- Lanes: 1
- No critical coordination findings.

## Synthetic Background Proof

- Synthetic ID: 19d67bca1e9ba658
- External write performed: false
- GitHub intake idempotency: c3ff468c52eebf82712b3b1634d1e21162f9689cfd46c095ecc19df42fc7bf90
- Result API dry-run success: true
- Operations activity links would render: true
- GitHub status would create comment: true
- GitHub status external write performed: false
- Parent run not marked complete: true

## Kimi Fallback Readiness

- OK: true
- Enabled: true
- Mode: quota_only (fallback_after_codex_capacity_or_quota_failure_only)
- Command: `kimi`
- Command found: true
- Command path: C:\Users\User\.local\bin\kimi.exe
- Version readback: kimi, version 1.44.0
- Model: kimi-k2.7-code-highspeed
- Model is highest configured: true
- Explicit credential source present: true
- Capacity error detected: true
- Quota-only capacity fallback: true
- Quota-only ordinary error skips fallback: true
- Always mode fallback: true
- Disabled fallback skip: true
- Live inference performed: false
- Warning: Kimi live inference smoke was not run; this report only verifies CLI availability, model configuration, and fallback routing logic.

## Production Deploy Preflight

- OK: true
- Command: `npm run production:readiness:gate -- --json`
- Enforced before auto-deploy: true
- Auto-deploy env: `AGENT_FLEET_AUTO_DEPLOY`
- Deploy command env: `AGENT_FLEET_DEPLOY_COMMAND`
- Blocked skip reason: `production_readiness_gate_blocked`
- Live gate run performed: false
- Deploy performed: false
- Behavior: If AGENT_FLEET_AUTO_DEPLOY is enabled and deployable files are present, the supervisor must pass the read-only production readiness gate before it can run the deploy command.

## Guardrails

- No second agent fleet created.
- No production mutation.
- No deploy/live smoke.
- No GitHub status comment posted.
- No Kimi live inference request sent.
- No send, charge, DNS, credential, Drive write, account-permission, public-publish, or class-backfill action.
