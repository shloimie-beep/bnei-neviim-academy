# ChatGPT / Codex Dropoff Control Tower

Generated: 2026-07-13T00:32:59.537Z

## Lane Safety

- Branch: `master`
- Dirty worktree: no


_None._

## Packet Status

- Total packets: 3
- Ready: 0
- Blocked: 0
- Draft: 0
- Terminal: 3

| Packet | State | Status | Owner | Lane | Scope | Next |
| --- | --- | --- | --- | --- | --- | --- |
| chatgpt-dropoff-smoke-test-20260705-001 | terminal | done_verified | ChatGPT |  | Harmless smoke test confirming ChatGPT can hand Codex a repo-visible packet or comment and that Codex can collect it automatically. |  |
| onetime-agent-prompt-series-20260706-911 | terminal | done_verified | ChatGPT |  | Provide five Agent Mode audit prompts for the One Time UI audit covering control tower, public funnel, Rabbi operations/backend, portals/classroom, and cross-system synthesis. | Run Prompt 01 first, run Prompts 02-04 after the control-tower map exists, then run Prompt 05 after at least two surface audit reports have dropped repo-visible packets. |
| onetime-launch-priority-ui-crm-automation-20260710-001 | terminal | done_verified | ChatGPT | rabbi_sheller_provider-one_time_mishnah_class-launch-priority | Register and execute the latest One Time launch priority: beautiful landing, Robot Scheller, visible form-to-CRM lead flow, clickable contact CRM, historical inbox reconciliation, gated immediate class-link follow-up, and launch-ready Rabbi backend UI. | No unblocked Codex launch-priority implementation lane remains. Operator/runtime next actions are to configure ONE_TIME_PUBLIC_WHATSAPP_NUMBER for direct public WhatsApp activation and approve the canonical historical source package plus suppression/import policy before any production import/write. |

## Agent Fleet

| Status Line |
| --- |
| - Supervisor: running PID 36560 |
| - Observable Codex jobs: 30 |
| - Claimable observable jobs: 0 |
| - Active Codex task fallback: 30 |
| - Ready to claim: observable jobs 0, fallback task candidates 0 |
| - Queue health: fresh 4, stale 556, blocked 136, unknown 192, do-not-redo 915 |
| - ChatGPT dropoff ingest: enabled |
| - ChatGPT comment collect: enabled |

### Not Claimable / Needs Cleanup

| Job |
| --- |
| - job #344 / task #1736 [blocked_needs_human_decision] Repair Agent Mode result AGR-19cfa47542407167 (local_lock=stale_lock_dead_pid pid=105512 heartbeat=2026-07-02T12:39:01.959Z age_hours=251.9 path=.runtime/agent-fleet/task-1736.lock.json) |
| - job #426 / task #2181 [blocked_needs_human_decision] Is that why Pharaoh wanted them to build it there? (local_lock=missing path=.runtime/agent-fleet/task-2181.lock.json) |
| - job #443 / task #2258 [failed] Turn Rabbi meeting drop into One Time build brief (local_lock=missing path=.runtime/agent-fleet/task-2258.lock.json) |
| - job #236 / task #1130 [failed] Repair follow-up after Drive transcription reprocess. (local_lock=missing path=.runtime/agent-fleet/task-1130.lock.json) |
| - job #237 / task #1136 [failed] Repair follow-up after Drive transcription reprocess. (local_lock=missing path=.runtime/agent-fleet/task-1136.lock.json) |
| - job #238 / task #1141 [failed] Repair follow-up after Drive transcription reprocess. (local_lock=missing path=.runtime/agent-fleet/task-1141.lock.json) |
| - job #289 / task #1392 [failed] Caption: Auto BNA Drive recovery after parser persistence deploy (local_lock=missing path=.runtime/agent-fleet/task-1392.lock.json) |
| - job #290 / task #1393 [failed] Auto BNA Drive recovery after parser persistence deploy (local_lock=missing path=.runtime/agent-fleet/task-1393.lock.json) |

### Fallback Task Candidates

_None._

## Recent Pickup Reports

| Report | Updated |
| --- | --- |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-12T17-45-09-449Z-telegram-sidekick-super-package-20260712.md | 2026-07-12T17:45:09.450Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-12T14-19-17-258Z-telegram-sidekick-super-package-20260712.md | 2026-07-12T14:19:17.259Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-12T14-18-56-534Z-telegram-sidekick-super-package-20260712.md | 2026-07-12T14:18:56.535Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-10T07-27-19-148Z-onetime-launch-priority-ui-crm-automation-20260710-001.md | 2026-07-10T07:27:19.149Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-49-06-941Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:49:06.942Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-49-06-937Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:49:06.939Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-47-45-674Z-onetime-agent-prompt-series-20260706-911.md | 2026-07-09T05:47:45.676Z |
| ops/chatgpt-ramble-dropoff/pickups/2026-07-09T05-47-45-670Z-chatgpt-dropoff-smoke-test-20260705-001.md | 2026-07-09T05:47:45.671Z |

## Recommendations

- No ready ChatGPT packets are waiting. Give ChatGPT a scoped packet prompt instead of rerambling the same work to Codex.
- Use the Agent Fleet summary below to avoid duplicating work already running, blocked, or stale.
- GitHub-connected ChatGPT sees committed/pushed files only; local dirty work must be committed/pushed or summarized in a packet before ChatGPT can use it.
