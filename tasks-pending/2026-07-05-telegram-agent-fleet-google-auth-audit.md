# Telegram Agent Fleet And Google Authorization Audit - 2026-07-05

## Raw intake

See `raw-input/RAW-20260705-002-telegram-agent-fleet-google-auth-audit.md`.

Repair request: `raw-input/RAW-20260705-004-fix-telegram-fleet-google-auth-audit-findings.md`.

## Scope

Audit two operator-reported issues:

1. Telegram bot error code related to the agent fleet.
2. Google authorization error.

This is an audit/diagnosis task first. Do not mutate production data, send
Telegram messages, change credentials, write Google/Drive data, or restart
production services unless a separate exact approval or safe local-only command
is established.

## Requirements

| ID | Requirement | Workspace/project | Owner | Priority | Acceptance criteria | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260705-001 | Audit Telegram bot and agent-fleet error path/history. | app_wide / agent_ops | Codex | P0 | Inspect current Telegram bridge/fleet code, recent fleet readiness/status evidence, logs/history/changelog, and identify likely cause plus next action. | no | Done - audit complete; fixes require separate runtime/code batch |
| REQ-20260705-002 | Audit Google authorization error path/history. | app_wide / integrations | Codex | P0 | Inspect Google auth code/scripts/config docs and recent error evidence without exposing tokens; identify likely cause plus next action. | no | Done - audit complete; reauth/env fixes require operator/runtime action |
| REQ-20260705-003 | Fix agent-fleet readiness false drift/no-upstream error reporting. | app_wide / agent_ops | Codex | P0 | Readiness resolves the active execution run, synthesizes an agent-fleet lane when the active run has requirements but no lane manifest, suppresses raw git upstream stderr, and reports missing upstream as structured warning. | no | Done - local verified |
| REQ-20260705-004 | Fix Google OAuth configured checks to use shared `.secrets`-aware loader. | app_wide / integrations | Codex | P0 | Google integrations status/start/provider/status-card checks use the same `loadGoogleOAuthClient()` path as the actual OAuth client, so local `.secrets` fallback is not falsely rejected. | no | Done - local verified |
| REQ-20260705-005 | Verify and normalize exactly one Telegram bot poller. | app_wide / agent_ops | Shloimie/Codex | P0 | Hosted/local Telegram ownership is verified, duplicate pollers are stopped, stale local locks are cleared only after PID proof, and exactly one worker is restarted/read back. | maybe | Needs operator decision - external runtime action |
| REQ-20260705-006 | Resolve Google identity/userinfo and hosted worker env if needed. | app_wide / integrations | Shloimie/Codex | P0 | Google is reauthorized with intended identity/Drive feature scopes or profile code is explicitly configured for Drive-only tokens; hosted worker env vars are verified. | maybe | Needs operator decision - account/runtime action |

## Initial historical context

The active execution run already has `REQ-20260702-102` blocked for agent-fleet
readiness: supervisor reliability was not OK, with active pointer drift and
branch drift recorded. July 3 records later show the ChatGPT dropoff/agent
fleet supervisor was started/restarted and startup fallback was installed, but
release/deploy coordination still mentioned pointer/branch drift.

## Evidence log

| Time | Check | Result |
|---|---|---|
| 2026-07-05T13:34:43+03:00 | `npm run bna:run:status` | Active run validates; 4 blocked, 6 done; work remains. |
| 2026-07-05T13:34:43+03:00 | `npm run bna:run:next` | No next unblocked executable batch. |
| 2026-07-05T13:36:12+03:00 | `npm run agent:fleet:readiness` | Overall OK false; wrote `ops/agent-fleet-hardening/2026-07-05T10-36-12-550Z-agent-fleet-readiness.md/json`; active pointer drift and branch drift found; git also printed a raw no-upstream `@{u}` fatal. |
| 2026-07-05T13:37:00+03:00 | `npm run agent:fleet:status` | Supervisor PID 3556 running, but 0 claimable jobs; queue health has many stale/blocked/unknown items; ChatGPT dropoff ingest/comment collect enabled. |
| 2026-07-05T13:38:00+03:00 | Telegram bridge local runtime/log inspection | `.runtime/telegram-kimi-bridge.lock` points to old PID 64332, but the process is not running locally; July 3 logs show repeated Telegram `409 Conflict`, which means another poller owned the same bot token. |
| 2026-07-05T13:39:00+03:00 | Fleet stderr/out log inspection | Fleet loop repeatedly had no ready jobs; stderr showed GitHub comment scan timeouts, app status POST 502, observable queue fetch failures, and one array-buffer allocation failure. |
| 2026-07-05T13:39:49+03:00 | `npm run chatgpt:dropoff:comments:scan` | GitHub auth works; collector checked comments and found one marked smoke-test comment, but blocked it as invalid because required packet file blocks were missing. |
| 2026-07-05T13:40:00+03:00 | Google OAuth read-only token probe | Refresh token produced an access token; Drive `about.get` and Drive file list succeeded for the BNA office account. `oauth2.userinfo.get()` returned 401, so the existing token is valid for Drive but not for the identity/userinfo path being queried. |
| 2026-07-05T13:40:00+03:00 | Google auth code inspection | `scripts/google-drive-setup.mjs` uses Drive/Gmail/Docs/Sheets scopes and no `userinfo.email`; `server.js` lower-level `/api/google/oauth/start` can load `.secrets`, but admin `/api/integrations/google/oauth/start` checks only `process.env.GOOGLE_CLIENT_ID/SECRET` and can falsely report OAuth unconfigured when `.secrets` is present. |
| 2026-07-05T13:40:00+03:00 | Focused tests | `node --test tests/telegram-runtime-status.test.js tests/google-oauth-scope-guard.test.js tests/agent-fleet-hardening.test.js` passed 19/19. |
| 2026-07-05T13:40:00+03:00 | `npm run watchdog:raw` | Failed on pre-existing raw-intake drift unrelated to this new raw record: two old July 2 raw filenames/body IDs mismatch and two old registers point at missing raw fallback files. |
| 2026-07-05T13:56:00+03:00 | Code repair | `scripts/agent-fleet-readiness.mjs` now resolves `ops/execution-runs/latest.json`, synthesizes an agent-fleet lane from active requirements when no lane manifest exists, and captures missing upstream as structured data without raw git fatal stderr. |
| 2026-07-05T13:56:00+03:00 | Code repair | `src/lib/bna/agent-fleet-hardening.js` now accepts active-run requirement IDs and emits `branch_has_no_upstream` as a warning. |
| 2026-07-05T13:56:00+03:00 | Code repair | `server.js` Google provider status, integration readiness, Google Drive status card, and `/api/integrations/google/oauth/start` now use `googleOAuthClientConfigured()`, which calls the existing `.secrets`-aware loader. |
| 2026-07-05T13:56:00+03:00 | Regression tests | Added coverage in `tests/agent-fleet-hardening.test.js` and `tests/google-oauth-scope-guard.test.js`. |
| 2026-07-05T13:56:00+03:00 | Syntax/tests | `node --check scripts/agent-fleet-readiness.mjs`, `node --check server.js`, and `node --test tests/agent-fleet-hardening.test.js tests/google-oauth-scope-guard.test.js tests/telegram-runtime-status.test.js` passed 21/21. |
| 2026-07-05T13:56:55+03:00 | `npm run agent:fleet:readiness -- --json` | PASS: generated `ops/agent-fleet-hardening/2026-07-05T10-56-55-643Z-agent-fleet-readiness.md/json`; active run path is July 2 continuation, requirement is `REQ-20260702-102`, overall OK true, only warning is structured `branch_has_no_upstream`. |
| 2026-07-05T14:01:00+03:00 | `npm run agent:fleet:status` | Supervisor PID 3556 still running; 12 observable Codex jobs, 0 claimable jobs, 0 ready to claim. This confirms remaining fleet issue is queue/active-task policy/runtime ownership, not readiness false drift. |
| 2026-07-05T14:59:23+03:00 | `npm run watchdog:raw` | Still failed with the same 4 older drift findings in `ops/watchdog-audits/2026-07-05T10-59-raw-intake-drift.md`; today's `RAW-20260705-002` and `RAW-20260705-004` were not flagged. |

## Findings

| ID | Area | Severity | Finding | Evidence | Next action |
|---|---|---|---|---|---|
| FIND-20260705-001 | Telegram bot | High | The local Telegram bridge is stale/not running now, and its last local logs show the bot was rejected by Telegram because another `getUpdates` poller was already active. This matches a prior June incident class. | `.runtime/telegram-kimi-bridge.lock`, `.runtime/telegram-kimi-bridge.log`, `ops/agent-changelog.md` June 5 duplicate-poller closeout, `docs/integrations/telegram-bridge.md`. | Choose one owner for the bot token: hosted `academy-telegram-worker` preferred, or local bridge, but not both. Verify the hosted worker heartbeat/webhook state, then restart only the chosen worker and clear stale local lock after PID verification. |
| FIND-20260705-002 | Agent fleet | High | The agent fleet supervisor is running, but not healthy enough to claim work. It has zero claimable jobs under active-task policy, readiness is false, and stderr shows upstream/API instability. | `npm run agent:fleet:status`, `.runtime/agent-fleet/agent-fleet.err.log`, `.runtime/agent-fleet/agent-fleet.out.log`, `ops/agent-fleet-hardening/latest-agent-fleet-readiness.md`. | Patch/readjust readiness drift checks, then restart/readback the supervisor. Separately audit whether the current active-run policy is intentionally blocking every observable job. |
| FIND-20260705-003 | Agent fleet readiness UX | Medium | The readiness script emits raw git stderr when the current branch has no upstream. If Telegram/status surfaces this command output, the operator sees a confusing error even before the actual readiness findings. | `npm run agent:fleet:readiness` emitted `fatal: ambiguous argument '@{u}'`; `git branch -vv` shows current branch upstream is gone. | Patch readiness git helper to treat missing upstream as a structured `branch_has_no_upstream` finding instead of printing raw fatal stderr. |
| FIND-20260705-004 | Agent fleet coordination | Medium | `latest.json` points to the July 2 active run, but readiness still compares against the old June 24 parent run and branch. That makes readiness fail even when the active run pointer itself is current. | `ops/execution-runs/latest.json`; `ops/agent-fleet-hardening/2026-07-05T10-36-12-550Z-agent-fleet-readiness.md/json`. | Make the readiness parent-run expectation read from the active run pointer or an explicit config, then re-run `npm run agent:fleet:readiness`. |
| FIND-20260705-005 | Google Drive auth | Medium | The stored Google refresh token is not simply dead: local refresh succeeded and Drive read probes worked. | Read-only OAuth probe using `.secrets/google-oauth-client.json` and `.secrets/google-refresh-token.txt`; no token values printed. | Do not rotate credentials blindly. Treat Drive auth as basically valid locally, then fix the exact failed auth path. |
| FIND-20260705-006 | Google identity/userinfo | High | The current stored token appears valid for Drive but not for Google identity/userinfo. The setup script that created the older token did not request `userinfo.email`, while newer connection/profile code tries to read userinfo. | `scripts/google-drive-setup.mjs`; `src/lib/bna/google-integrations.js`; `server.js` `getGoogleAccountProfile()`; read-only OAuth probe returned 401 from `oauth2.userinfo.get()`. | Reauthorize with the intended role/features if the UI needs account identity, or make profile lookup tolerate Drive-only tokens with explicit `identity_missing` status. |
| FIND-20260705-007 | Google OAuth configured check | High | One OAuth start endpoint can falsely say Google OAuth is unconfigured because it checks only environment variables, while the lower-level OAuth client loader supports `.secrets`. This matches the likely "Google authorization" user-facing error in local/dev contexts. | `server.js` `/api/google/oauth/start` uses `loadGoogleOAuthClient()`; `server.js` `/api/integrations/google/oauth/start` checks only `process.env.GOOGLE_CLIENT_ID/SECRET`; `.env.local` had no Google vars while `.secrets` files exist. | Patch `/api/integrations/google/oauth/start` to use `loadGoogleOAuthClient()` and add a regression test for `.secrets` fallback. |
| FIND-20260705-008 | Hosted Google worker config | Medium | Local `.secrets` do not prove hosted/Railway worker env is configured. The Telegram worker runbook says Drive auto-watch requires Google reference variables on the hosted service. | `ops/academy-telegram-worker.md`; `docs/integrations/telegram-bridge.md`; local `.secrets` inventory. | Check hosted `academy-telegram-worker` variables for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and Drive pipeline config before blaming code. |

## Terminal audit result

Telegram/agent-fleet diagnosis: the operator-visible Telegram issue is most
likely a combination of stale/duplicate Telegram polling and fleet readiness
noise. The local bridge is not currently alive despite its lock file, and the
last bridge log shows Telegram rejected it with `409 Conflict` because another
poller was active. The fleet supervisor itself is alive, but readiness is false
and it is not claiming jobs because of active-run/branch drift and runtime/API
failures.

Google authorization diagnosis: the Google Drive token is locally usable for
Drive, so this does not look like a blanket credential revocation. The failure
is path-specific: identity/userinfo auth is failing, likely because the older
Drive setup token lacks identity scope, and one admin OAuth start endpoint has
an env-only configured check that ignores the `.secrets` fallback.

No Telegram messages, Google writes, Drive writes, credential changes,
production data mutations, service restarts, commits, pushes, or deploys were
performed during this audit.

Repair closeout: local code fixes were implemented and verified for
`REQ-20260705-003` and `REQ-20260705-004`. `REQ-20260705-005` and
`REQ-20260705-006` remain external/runtime/account actions, not safe to mutate
without exact next-action approval.

Commit/push status: not performed from this worktree. The current branch has no
live upstream and the repo already contains a large unrelated dirty/untracked
set, including append-only files also touched by prior work. A scoped publish
should be done from a clean branch or with careful partial staging of only this
repair's records.

## Recommended repair batch

1. Patch `scripts/agent-fleet-readiness.mjs` so missing git upstream is reported
   as structured readiness data, not raw fatal stderr.
2. Align the agent-fleet readiness parent-run expectation with
   `ops/execution-runs/latest.json`, or make the expected parent run explicit
   config.
3. Verify hosted Telegram worker ownership, stop duplicate pollers, clear only
   verified stale local locks, and restart/readback exactly one bot poller.
4. Patch `/api/integrations/google/oauth/start` to reuse
   `loadGoogleOAuthClient()` and add a regression test for `.secrets` fallback.
5. Reauthorize Google with the intended identity/Drive feature set, or change
   the profile path to explicitly support Drive-only tokens without presenting
   it as global auth failure.
6. Check Railway/hosted worker Google variables before marking Drive auto-watch
   healthy.

## Open questions

| ID | Question | Owner | Status |
|---|---|---|---|
| Q-20260705-001 | What exact Telegram-visible error code did the operator see? | Shloimie | Open, non-blocking for repo/log audit |
| Q-20260705-002 | Should Codex restart/verify the hosted Telegram worker and/or trigger Google reauthorization? | Shloimie | Needs explicit runtime/account approval before external mutation |
