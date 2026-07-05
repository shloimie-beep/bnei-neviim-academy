# Telegram Drive Sync OAuth Error And Cleanup Continuation - 2026-07-05

## Source

- Raw intake: `raw-input/RAW-20260705-012-telegram-drive-sync-oauth-error.md`
- Related audit/register:
  `tasks-pending/2026-07-05-telegram-agent-fleet-google-auth-audit.md`
- Related release workflow register:
  `tasks-pending/2026-07-05-repo-release-workflow-and-drive-email.md`

## Scope

Fix the operator-visible Telegram Drive sync error for content job `#102`, make
the local Telegram bridge status honest when another poller owns the same bot,
and then resume the repo cleanup/release hardening goal.

No production Drive writes, Telegram sends, production database writes,
credential changes, DNS/payment/access/provider mutations, or external CRM
writes are in scope for this local repair batch.

## Requirement Register

| ID | Requirement | Workspace/project | Owner | Priority | Acceptance criteria | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|
| REQ-20260705-801 | Fix the Drive transcript sync OAuth loader regression. | BNA academy / content Drive sync | Codex | P0 | `scripts/sync-drive-content-library.mjs` loads merged runtime env, prefers `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, supports inline OAuth client JSON, and passes that env to refresh-token auth. | yes, for Telegram/server-visible fix | Done locally; deploy pending |
| REQ-20260705-802 | Add regression coverage for Drive sync auth-loader env fallback. | BNA academy / tests | Codex | P0 | Test proves a malformed `.secrets/google-oauth-client.json` does not hide valid env credentials, inline OAuth JSON works, and `.env.local` refresh-token fallback still works. | no | Done |
| REQ-20260705-803 | Harden local Telegram bridge launcher/status. | BNA academy / Telegram ops | Codex | P0 | Launcher supports status/stop/restart, archives stale locks, refuses a second local copy, deduplicates allowed chat IDs, and exposes duplicate poller conflicts as `blocked_conflict`. | yes, if hosted worker uses launcher changes | Done locally; deploy pending |
| REQ-20260705-804 | Verify duplicate-poller state safely. | BNA academy / Telegram ops | Codex | P0 | Local guarded restart performs no sends, exits after three Telegram `409 Conflict` responses, and status reports `blocked_conflict` with the Telegram duplicate-poller message. | no | Done; external owner remains active |
| REQ-20260705-805 | Publish and deploy/restart the correct BNA runtime. | BNA academy / release ops | Codex | P0 | Commit/push/PR contains only scoped files; after merge, deploy or restart the correct `skillful-motivation` BNA web/worker service and smoke/read back the Drive sync error path. | yes | In progress; deploy target must not use current One Time Railway link |
| REQ-20260705-806 | Resume whole repo cleanup/hardening after this repair. | app-wide / agent ops | Codex | P1 | Continue stale release/worktree cleanup, active blockers, fleet policy/readiness, and release guardrails after the Telegram/Drive repair branch is published. | maybe | Pending |

## Evidence Log

| Time | Check | Result |
|---|---|---|
| 2026-07-05T18:49+00:00 | `node --check scripts/sync-drive-content-library.mjs` | PASS |
| 2026-07-05T18:49+00:00 | `node --check scripts/telegram-kimi-bridge.mjs` | PASS |
| 2026-07-05T18:49+00:00 | `node --test tests/sync-drive-content-library-auth.test.mjs tests/telegram-runtime-status.test.js` | PASS 14/14 |
| 2026-07-05T18:54+00:00 | `npm run telegram:kimi:restart` guarded local run | Started local bridge, no Telegram sends performed. |
| 2026-07-05T18:54+00:00 | Telegram polling readback | Bridge received three Telegram `409 Conflict` responses and exited. |
| 2026-07-05T18:54+00:00 | `npm run telegram:kimi:status` | PASS: `Running: False`, `Runtime status: blocked_conflict`, last error says another `getUpdates` poller owns the bot. |
| 2026-07-05T18:55+00:00 | `railway status` | Current checkout is linked to `one-time-production / one-time-web`, not BNA `skillful-motivation`; do not deploy/restart from this link for the academy worker. |
| 2026-07-05T19:08+00:00 | `npm run watchdog:raw` | FAIL on 4 pre-existing raw-intake drift findings unrelated to `RAW-20260705-012`; report `ops/watchdog-audits/2026-07-05T19-08-raw-intake-drift.md`. |

## Findings

| ID | Area | Severity | Finding | Evidence | Next action |
|---|---|---|---|---|---|
| FIND-20260705-801 | Drive sync auth | High | The deployed content-library sync path had regressed to reading `.secrets/google-oauth-client.json` first and throwing before valid Railway env credentials could be used. | Operator stack trace for content job `#102`; local source inspection. | Ship the env-first loader and deploy/restart the BNA worker/web service. |
| FIND-20260705-802 | Telegram runtime ownership | High | Local bridge cannot be the active BNA bot poller right now because Telegram returns `409 Conflict`; another poller is already using the academy bot token. | Guarded local restart reached conflict 3/3 and status readback reports `blocked_conflict`. | Identify/keep exactly one owner, preferably hosted `academy-telegram-worker`; stop any duplicate runtime before enabling local polling. |
| FIND-20260705-803 | Railway target safety | High | The local Railway CLI link currently points to One Time production, not the BNA academy worker project. | `railway status` returned `Project: one-time-production`, `Service: one-time-web`. | Do not run worker deploy/restart until targeting `skillful-motivation / academy-telegram-worker` intentionally. |

## Closeout Status

Local code/test repair is complete. The Telegram error will not be fully fixed
for Shloimie until the scoped branch is merged and the correct BNA
`skillful-motivation` runtime is deployed/restarted with the Google env
variables available.

After this repair is published, continue `REQ-20260705-806`: whole repo cleanup,
release guardrails, stale worktree/artifact triage, and active blocker
hardening.
