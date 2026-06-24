# Agent Result Bridge

Requirement: `REQ-20260624-044`

Status: Blocked: local verified, deploy/live proof pending.

## What Changed

- Added `src/lib/bna/agent-result-packet.js` to normalize durable agent result packets with raw/source IDs, task/job/requirement IDs, run/branch/worktree/commit/PR, tests, deployment state, evidence, blockers, summary, machine payload, GitHub metadata, timestamp, and a stable idempotency key.
- Added typed action `record_agent_result` and handler `agent.recordResult`, with dry-run preview, duplicate idempotency checks, scoped task/job lookup, job status/result updates, agent job events, task activity, internal task comments, and proof-link merging.
- Added admin API route `POST /api/bna/agent-jobs/:id/result` through the existing action runner and project/workspace access checks.
- Added Operations activity rendering for result evidence and GitHub links from saved activity metadata.
- Extended the existing GitHub intake bridge with status-preview/status-post arguments. GitHub posting remains blocked by explicit gates: `BNA_GITHUB_STATUS_POST_APPROVED=true` and approval phrase `POST_BNA_GITHUB_STATUS`.
- Registered `ACTION-AGENT-RESULT-RECORD` in `ops/action-registry.json`.

## Acceptance Readback

| Acceptance criterion | Evidence |
|---|---|
| Result payload includes source/raw ID, task/requirement ID, run ID, branch/worktree, commit/PR, tests, deploy/live state, evidence, blockers, summary, machine payload, and timestamp. | `buildAgentResultPacket` normalizes those fields; dry-run test asserts packet contract and canonical IDs. |
| Writes are idempotent and scoped, and do not overwrite owner text or another workspace. | Handler checks `bna_agent_job_events` and `bna_task_activity` by idempotency key, uses scoped action context/API access checks, and does not update title/owner/body text. |
| Operations activity/conversation shows the saved result with direct evidence and GitHub links. | `taskActivityLinks` and `renderTaskActivityLinks` render evidence/GitHub links from activity metadata/result packet. |
| Trusted GitHub issue/comment intake is idempotent as one canonical raw source. | Existing intake preview remains idempotent; trusted source selection now honors selected comment author when `commentId` is provided. |
| Final status posts back to the same GitHub issue/comment thread with canonical IDs and evidence. | `buildGitHubStatusPreview` builds same-thread, marker-based, redacted status bodies; actual posting is approval-gated and was not performed. |

## Verification

- PASS `node --check scripts\intake-github.mjs`
- PASS `node --check src\lib\bna\agent-result-packet.js`
- PASS `node --check src\lib\actions\actions\operations.js`
- PASS `node --check src\lib\actions\registry.js`
- PASS `node --check tests\action-registry-telegram-ui-bot.test.js`
- PASS `node --check tests\system-truth-scripts.test.js`
- PASS `node --test tests\action-registry-telegram-ui-bot.test.js` 35/35
- PASS `node --test tests\agent-control-api-readback.test.js` 2/2
- PASS `node --test tests\operations-activity-queue-health-ui.test.js` 3/3
- PASS `node --test --test-name-pattern "GitHub intake preview" tests\system-truth-scripts.test.js` 1/1
- PASS `npm run watchdog:actions` with 0 findings; report `ops/watchdog-audits/2026-06-24T21-01-watchdog-action-audit.md`
- PASS static marker check for server route, typed action, and Operations UI link functions
- PASS JSON parse for `ops/action-registry.json`

## Non-Blocking Test Note

The full `node --test tests\system-truth-scripts.test.js` file was not used as the Batch D gate because one existing return-packet assertion is environment-sensitive to the currently dirty active worktree. The focused GitHub intake/status preview test passed and covers the Batch D GitHub changes.

## Guardrails

- No GitHub status comment was posted.
- No production data mutation, deploy, external send, charge, DNS change, credential change, Drive write, class backfill, browser private capture, or secret exposure was performed.
- Server-visible/API/UI behavior remains blocked from Done until deploy/live proof is completed under `REQ-20260624-048`.
