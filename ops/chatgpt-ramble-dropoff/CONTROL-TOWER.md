# ChatGPT / Codex Dropoff Control Tower

Generated: 2026-07-09T20:56:02.497Z

## Lane Safety

- Branch: `master`
- Dirty worktree: yes
- Collision warning: Worktree has local changes. New agents must claim a non-overlapping lane or wait before editing these files.

| Status | Path |
| --- | --- |
| M | ops/production-readiness/latest-production-readiness-snapshot.json |
| M | ops/production-readiness/latest-production-readiness-snapshot.md |

## Packet Status

- Total packets: 2
- Ready: 0
- Blocked: 0
- Draft: 0
- Terminal: 2

| Packet | State | Status | Owner | Lane | Scope | Next |
| --- | --- | --- | --- | --- | --- | --- |
| chatgpt-dropoff-smoke-test-20260705-001 | terminal | done_verified | ChatGPT |  | Harmless smoke test confirming ChatGPT can hand Codex a repo-visible packet or comment and that Codex can collect it automatically. |  |
| onetime-agent-prompt-series-20260706-911 | terminal | done_verified | ChatGPT |  | Provide five Agent Mode audit prompts for the One Time UI audit covering control tower, public funnel, Rabbi operations/backend, portals/classroom, and cross-system synthesis. | Run Prompt 01 first, run Prompts 02-04 after the control-tower map exists, then run Prompt 05 after at least two surface audit reports have dropped repo-visible packets. |

## Agent Fleet

| Status Line |
| --- |
| - Supervisor: running PID 36560 |
| - Observable Codex jobs: 32 |
| - Claimable observable jobs: 0 |
| - Active Codex task fallback: 32 |
| - Ready to claim: observable jobs 0, fallback task candidates 0 |
| - Queue health: fresh 10, stale 468, blocked 128, unknown 191, do-not-redo 878 |
| - ChatGPT dropoff ingest: enabled |
| - ChatGPT comment collect: enabled |

### Not Claimable / Needs Cleanup

| Job |
| --- |
| - job #344 / task #1736 [blocked_needs_human_decision] Repair Agent Mode result AGR-19cfa47542407167 (local_lock=stale_lock_dead_pid pid=105512 heartbeat=2026-07-02T12:39:01.959Z age_hours=176.29 path=.runtime/agent-fleet/task-1736.lock.json) |
| - job #426 / task #2181 [blocked_needs_human_decision] Is that why Pharaoh wanted them to build it there? (local_lock=missing path=.runtime/agent-fleet/task-2181.lock.json) |
| - job #408 / task #2025 [failed] Fix One Time provider UI consistency: header, duplicate nav, filters, buttons, mobile (local_lock=missing path=.runtime/agent-fleet/task-2025.lock.json) |
| - job #409 / task #2027 [failed] Fix One Time route-role mapping for provider, member, student, and public join routes (local_lock=missing path=.runtime/agent-fleet/task-2027.lock.json) |
| - job #410 / task #2026 [failed] Fix safe View-as navigation for Rabbi/provider/student/member perspectives (local_lock=missing path=.runtime/agent-fleet/task-2026.lock.json) |
| - job #377 / task #1851 [failed] Apply app-wide BNA brand shell and million-dollar SaaS UI polish (local_lock=missing path=.runtime/agent-fleet/task-1851.lock.json) |
| - job #236 / task #1130 [failed] Repair follow-up after Drive transcription reprocess. (local_lock=missing path=.runtime/agent-fleet/task-1130.lock.json) |
| - job #237 / task #1136 [failed] Repair follow-up after Drive transcription reprocess. (local_lock=missing path=.runtime/agent-fleet/task-1136.lock.json) |

### Fallback Task Candidates

_None._

## Recent Pickup Reports

| Report | Updated |
| --- | --- |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-49-06-941Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:49:06.942Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-49-06-937Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:49:06.939Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-47-45-674Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:47:45.676Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-47-45-670Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:47:45.671Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-46-24-030Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:46:24.032Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-46-24-027Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:46:24.028Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-45-01-124Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:45:01.125Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-45-01-121Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:45:01.122Z |

## Recommendations

- Do not start overlapping source edits until the dirty-file lane is claimed or isolated in another branch/worktree.
- No ready ChatGPT packets are waiting. Give ChatGPT a scoped packet prompt instead of rerambling the same work to Codex.
- Use the Agent Fleet summary below to avoid duplicating work already running, blocked, or stale.
- GitHub-connected ChatGPT sees committed/pushed files only; local dirty work must be committed/pushed or summarized in a packet before ChatGPT can use it.
