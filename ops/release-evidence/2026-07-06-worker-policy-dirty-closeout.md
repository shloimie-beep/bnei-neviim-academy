# Worker Policy And Dirty Closeout Evidence - 2026-07-06

Source: `RAW-20260706-909`, `RAW-20260706-910`

Task: `TASK-20260706-940`

## Pushed And Deployed

| Scope | PR / commit | Deploy / proof | Status |
|---|---|---|---|
| One Time worker credential and provisional AI-video policy defaults | PR #113, merge `311d9661` | Railway redeploy started from merged master; policy tests and watchdogs passed | Done |
| Scoped Operations `/api/bna/auth/me` readback for Studio/task-only worker sessions | PR #114, merge `eba81417` | Railway deployment `4f2b2b6e-c1ef-48e1-8d89-953274e7ec59` reached `SUCCESS`; live Ben Levy worker smoke passed | Done |
| Job 101 dry-run parser reuse and no-write flag forwarding | PR #115, merge `53bca5d9` | Railway deployment `798cb1e5-f460-4776-969d-1184cfe1bd07` reached `SUCCESS`; standard live smokes passed | Done with exact data-smoke blocker |

## Worker Credential Smoke

- Railway production has the worker username/password variables present for
  `ONE_TIME_AI_VIDEO_WORKER_*` and aliases.
- The password is stored only in
  `C:\Users\User\BNA v2.0\.secrets\one-time-ai-video-worker-login-20260706.txt`
  and was not committed or printed.
- Live login to `https://bneineviimacademy.org/api/operations/login` succeeded
  as user `BenLevy` with role `one_time_ai_video_worker`.
- Live `/api/bna/auth/me` returned authenticated role
  `one_time_ai_video_worker`, scope `rabbi_sheller_provider` /
  `one_time_mishnah_class`, and allowed views exactly `studio`, `tasks`.
- Live allowed reads passed for Studio dashboard, Studio OpenArt status, and
  One Time tasks.
- Live denied reads returned `403` for CRM contacts and agent-fleet status.
- OpenArt live status remains `blocked_no_oauth`; no OpenArt call, upload,
  generation, or credit spend occurred.

## Job 101 Follow-Up

- PR #115 restored the repeatable dry-run path in code and deployed it.
- `npm run app:smoke` passed after deployment `798cb1e5-f460-4776-969d-1184cfe1bd07`.
- `npm run app:smoke:rabbi-onetime-landing` passed after deployment
  `798cb1e5-f460-4776-969d-1184cfe1bd07`.
- Exact production command attempted:
  `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101 --dry-run --parse --no-ai --no-progress-writes`.
- Exact data-smoke blocker: production returned `Content job #101 was not
  found`, so no Job 101 live data mutation or parser readback was performed
  from this final closeout.

## Dirty Worktree Classification

| Cluster | Local files observed in `C:\Users\User\BNA v2.0` | Classification | Reason |
|---|---|---|---|
| Worker credential/policy/auth | Worker policy/register/auth changes | Pushed/deployed | PR #113 and PR #114 shipped the clean current-master version and live smoke passed. |
| Job 101 dry-run parser reuse | `server.js`, `scripts/telegram-kimi-bridge.mjs`, parser tests | Pushed/deployed | Isolated from the dirty branch and shipped as PR #115. |
| One Time CRM mailbox MVP | `server.js`, `public/provider.html`, `raw-input/RAW-20260706-909-onetime-crm-mailbox-goal.md`, `tasks-pending/2026-07-06-onetime-crm-mailbox-goal.md`, `ops/prompt-packets/2026-07-06-onetime-crm-mailbox/` | Blocked / incomplete | Packet expects provider mailbox tests, route/action registry rows, local/browser evidence, and deploy/live proof. The local register still marks requirements pending. Not pushed. |
| Job 101 cleanup report overwrite | `ops/drive-transcript-visibility/2026-07-06/job101-review-cleanup-report.json` | Not pushed | Dirty file overwrites an earlier apply report with a later dry-run/no-mutation report, which would lose apply evidence. |
| Execution-run status/docs in dirty branch | `ops/execution-runs/2026-07-02-background-drive-ui-launch-continuation/*` | Not pushed wholesale | Mixed stale branch state and historical run-status updates need a separate clean closeout; final production data-smoke for job 101 is currently blocked by missing content job #101. |
| CRM mailbox PQC validation/watchdog evidence | `ops/product-quality-compiler/validation/*`, `ops/watchdog-audits/*` | Not pushed | Evidence belongs to the incomplete mailbox MVP packet and should ship only with completed mailbox implementation or a dedicated packet commit. |

## Remaining Exact Blockers

- Permanent worker identity/password rotation: replace the temporary Ben Levy
  password with an owner-managed credential after handoff.
- OpenArt/vendor generation: OpenArt OAuth/API credentials, actual model,
  pricing, privacy/retention, reference-upload, rollback/delete policy, and
  supervised no-live readiness smoke are still missing.
- True uploaded-image/pixel analysis: hosted multimodal provider/model, budget,
  retention/privacy, and upload policy are still missing.
- One Time CRM mailbox MVP: incomplete local dirty work; needs tests,
  registries, visual/browser proof, live sender/readback proof, and explicit
  send/compliance blockers before it can be deployed.
- Job 101 exact live data smoke: production currently returns `Content job #101
  was not found`.
