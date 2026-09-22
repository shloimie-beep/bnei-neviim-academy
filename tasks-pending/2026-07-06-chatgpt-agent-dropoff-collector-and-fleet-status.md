# ChatGPT Agent Dropoff Collector And Fleet Status - 2026-07-06

## Raw Intake

Source: `RAW-20260706-951`

Shloimie reported that one ChatGPT Agent Mode audit prompt did not write back to
the normal dropoff location while the other packets/comments were working. He
also asked whether the agent fleet is actually working on those packets.

## Parsed Requirements

| ID | Requirement | Workspace/project | Owner | Status | Evidence |
|---|---|---|---|---|---|
| REQ-20260706-951 | Diagnose why the attached Rabbi Operations Agent Mode prompt did not drop off. | bna_platform / agent_ops | Codex | Done | Attachment ended with `CANNOT_WRITE_GITHUB`; no GitHub connector was enabled in that ChatGPT session. |
| REQ-20260706-952 | Repair the comment collector so near-valid marked comments with `status.json` status and prompt files are accepted. | bna_platform / agent_ops | Codex | Done | `scripts/chatgpt-dropoff-comment-collector.mjs`; `tests/chatgpt-dropoff-comment-collector.test.js`. |
| REQ-20260706-953 | Materialize and queue the One Time prompt-series comment packet. | rabbi_sheller_provider / one_time_mishnah_class | Codex | Done | Packet `onetime-agent-prompt-series-20260706-911`; live task `#1945`; agent job `#397`. |
| REQ-20260706-954 | Make failed local queue attempts recoverable without hand-editing packet JSON. | bna_platform / agent_ops | Codex | Done | `scripts/chatgpt-dropoff-ingestor.mjs` force retry behavior and stale-blocker clearing. |
| REQ-20260706-955 | Check whether the agent fleet is actually working the queued packet. | bna_platform / agent_ops | Codex | Done | `npm run agent:fleet:status`: supervisor not running; one claimable job ready. |

## Current Status

- The specific attached ChatGPT Agent Mode run failed because that ChatGPT
  session did not have a GitHub connector enabled. It could not create a PR,
  repo file, or marked GitHub comment.
- The related One Time prompt-series GitHub comment has now been collected and
  queued.
- The live queue sees `job #397 / task #1945`:
  `Pick up ChatGPT prompt packet: One Time Agent Mode audit prompt series`.
- The fleet supervisor is currently stopped. Nothing is actively claiming or
  executing the queued job until the fleet is started.

## Verification

| Command/check | Result |
|---|---|
| `node --check scripts/chatgpt-dropoff-comment-collector.mjs` | PASS |
| `node --check scripts/chatgpt-dropoff-ingestor.mjs` | PASS |
| `node --check scripts/agent-fleet-supervisor.mjs` | PASS |
| `node --test tests/chatgpt-dropoff-comment-collector.test.js` | PASS 4/4 |
| `node --test tests/chatgpt-dropoff-ingestor.test.js` | PASS 6/6 |
| Targeted comment collect for issue comment `4893592311` | PASS; packet materialized |
| `npm run chatgpt:dropoff:apply -- --force` with process-scoped credentials | PASS for prompt packet; queued task `#1945`, job `#397` |
| Live task readback for task `#1945` | PASS; task points to `onetime-agent-prompt-series-20260706-911` |
| `npm run agent:fleet:status` with process-scoped credentials | PASS; supervisor not running; one claimable job |
| `scripts/start-agent-fleet.ps1 -Status` | PASS; `Running: False`, `PID: 0` |

## Remaining Decision

| ID | Decision | Owner | Recommended next action |
|---|---|---|---|
| DEC-20260706-951 | Whether to start the agent fleet now so it can claim job `#397`. | Shloimie | Start the fleet only when Shloimie wants background agents to begin consuming the queued jobs. |
