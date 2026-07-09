# 2026-07-08 - Rabbi Telegram Ticket And Agent Loop

## Source

- Raw intake: `raw-input/RAW-20260708-023-rabbi-telegram-ticket-agent-loop.md`
- Continuation intake:
  `raw-input/RAW-20260708-029-rabbi-telegram-helper-agent-scope-continuation.md`
- Latest continuation intake:
  `raw-input/RAW-20260708-031-rabbi-telegram-agent-parity-progress-dings.md`
- Agent-loop expansion intake:
  `raw-input/RAW-20260708-033-rabbi-telegram-agent-loop-expansion.md`
- Communications sidekick expansion intake:
  `raw-input/RAW-20260708-034-rabbi-telegram-sidekick-comms-scope.md`
- Redacted BotFather token intake:
  `raw-input/RAW-20260709-007-onetimeaios-bot-token-redacted.md`
- Source channel: `codex_chat`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Parent goal: OneTime launch-ready provider/parent/helper/CRM/agent loop

## Scope Rules

- Rabbi Telegram/helper data must be scoped to
  `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Support tickets opened by parents, students, members, helpers, or public
  flows should route to Shloimie/super-admin review, not to Rabbi as the first
  responder.
- Telegram alerts must be brief and redacted. Do not place raw private ticket
  bodies, secrets, access links, chat IDs, or tokens in committed evidence.
- Rabbi bot/helper may perform safe internal preview/readiness/workflow actions.
  External sends, publishing, Drive writes, uploads, payments, access grants,
  and cross-workspace data access remain gated by explicit approval and scoped
  credentials.
- Rabbi Telegram and the in-platform Rabbi helper should share the same
  OneTime-scoped sidekick contract for contacts, communications, class/student
  messages, content, safe web research, scoped Drive map/context previews, and
  internal reminders.
- Agent Mode must treat Rabbi live Telegram delivery as `BLOCKED` until the
  intended `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured and verified.

## Requirements

| ID | Requirement | Status | Acceptance Criteria | Evidence |
| --- | --- | --- | --- | --- |
| `REQ-20260708-081` | Super-admin ticket Telegram notifications | `Done / Deployed` | Support ticket creation paths create or queue a concise Telegram ding to Shloimie/super-admin when configured; alert includes ticket id/number, scope, severity, title, and review location; alert redacts raw private bodies and never prints token/chat ID. | `src/lib/bna/telegram-notifications.js`, `server.js`, `src/lib/bna/helper/tool-registry.js`, `src/lib/actions/actions/operations.js`; `node --test tests/rabbi-telegram-notifications.test.js`; full `npm test` 1646/1646; Railway deployment `02195be0-33a2-4bee-96b3-c559a5c51256` SUCCESS; live smoke evidence `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-deploy-live-smoke.md`. No synthetic production ticket was created. |
| `REQ-20260708-082` | Rabbi Telegram communications scope | `Blocked` | Rabbi bot uses the Rabbi/OneTime profile, Rabbi token, Rabbi chat ID, and scoped OneTime context; Rabbi communications summaries are limited to OneTime/Rabbi data and cannot read BNA/super-admin/private provider data. | Readiness proof shows Rabbi token and ops credentials configured, but `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` missing. Evidence: `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |
| `REQ-20260708-083` | Rabbi helper/bot capability parity under guardrails | `Open / wrapper-backed and deployed / Agent Mode proof blocked` | Rabbi Telegram bot and in-portal helper expose safe agent-style actions for content, tasks, communications, Drive/search previews, and readiness reports, while blocking or previewing external mutations until approval. | Ticket routing/readiness prompt covered in this batch. `RAW-20260708-028` generated `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json` and `public/agent-review-prompts/rabbi-helper-tool-scope-map.md` for all 163 current helper parity gaps. Later helper-scope closeouts moved all 163 contracts to wrapper-backed and deployed; full autonomy still waits on saved Agent Mode PASS/BLOCKED/FAIL proof, per-tool live audit readback, and external approval gates. |
| `REQ-20260708-084` | Agent Mode bot/helper smoke-test prompts | `Done / Deployed` | Prompt templates instruct agents exactly where to start, how to navigate, what to test, what not to mutate, and where to drop results even if a step fails; results are compatible with Agent Fleet pickup. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`; `npm run agent-review:prompts`; `node --test tests/agent-review-hub.test.js`; live prompt readback returned `200` and contained requirement, drop-off, chat-ID blocker, and no-WhatsApp-send guard. |
| `REQ-20260708-085` | Rabbi Telegram runtime readiness and blocker clarity | `Done / Runtime Blocked` | A no-secret readiness check reports Rabbi token/chat ID/ops credential presence, runtime profile, startup status, and exact blocker. Missing Rabbi chat ID stays a blocker until Shloimie supplies or triggers it. | `scripts/check-rabbi-telegram-ticket-readiness.mjs`; `npm run telegram:rabbi:readiness`; evidence in `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |
| `REQ-20260708-096` | Rabbi Telegram communication alerts | `Deployed / runtime chat ID blocked` | OneTime/Rabbi parent/provider portal messages, Resend inbound email, and inbound WAPI/WhatsApp communications trigger a Rabbi Telegram notification only when scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`; support tickets continue to ding Shloimie/super-admin; Telegram alert text is metadata-only and excludes raw private bodies, secrets, setup links, access codes, and unrelated BNA/provider data. | `src/lib/bna/telegram-notifications.js`, `server.js`, `scripts/check-rabbi-telegram-ticket-readiness.mjs`, `tests/rabbi-telegram-notifications.test.js`; PASS `node --check src/lib/bna/telegram-notifications.js`; PASS `node --check server.js`; PASS `node --check scripts/check-rabbi-telegram-ticket-readiness.mjs`; PASS `node --test tests/rabbi-telegram-notifications.test.js` 9/9; PASS focused prompt/scope tests 25/25; PASS provider mailbox / Resend inbound / WAPI tests 27/27; PASS full `npm test` 1660/1660; Railway deployment `500242a9-860f-4599-a145-eb9515bae0a4` `SUCCESS`; PASS OneTime live smoke; readiness evidence `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md`. Full live Rabbi send remains blocked until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured. |
| `REQ-20260708-097` | Rabbi Telegram/helper agent parity, progress dings, and Agent Mode bot smokes | `Open / partial deployed / chat ID blocked` | Rabbi Telegram bot and in-portal helper share the same OneTime-scoped helper contract for contacts, communications, content, Drive/search previews, reminders, and safe internal work; Codex/agent task progress can produce concise Telegram summaries with done/pending/blocker/next-step status; Agent Mode prompts explicitly test bot/helper flows and always save PASS/FAIL/BLOCKED results to Operations drop-off, even when login, route, bot runtime, or credentials fail. | Source `RAW-20260708-031`; read-only Rabbi helper wrapper batch deployed through Railway deployment `2107fae5-1a73-49ec-96e8-5a3a66bb8e43`; OneTime live smoke passed; live prompt readback returned `200` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`; runtime live Rabbi Telegram delivery remains blocked by `DEC-20260708-016`. |
| `REQ-20260708-100` | Rabbi Telegram full scoped sidekick expansion | `Deployed / runtime chat ID blocked` | Rabbi Telegram bot and Rabbi in-platform helper can answer from OneTime-scoped contacts, communications, student/class messages, content/task state, safe web research context, and scoped Drive map/context previews; support tickets continue to route to Shloimie/super-admin with concise Telegram dings; Rabbi receives communication/internal reminder dings only after his chat ID is configured; Agent Mode prompts smoke-test bot/helper/drop-off behavior and save PASS/FAIL/BLOCKED results without live external sends or provider writes. | Source `RAW-20260708-033`; updated Rabbi bot guide/memory, scoped OneTime Drive context in `scripts/telegram-kimi-bridge.mjs`, Agent Mode smoke prompt/readback artifacts, and runtime tests. PASS `node --check scripts/telegram-kimi-bridge.mjs`; PASS focused prompt/runtime/helper tests; PASS full `npm test` 1666/1666; PASS no-write `npm run telegram:rabbi:readiness`; PASS Railway deployment `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f` `SUCCESS`; PASS OneTime live smoke; PASS live prompt readback for `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` with `REQ-20260708-100`, scoped Drive/web sidekick behavior, and brief progress-ding instructions. Live Rabbi Telegram delivery remains blocked until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured. |
| `REQ-20260708-101` | Rabbi contacts, incoming messages, tickets, and progress dings share one scoped bot/helper smoke contract | `Deployed / live readback verified / chat ID and Agent Mode proof blocked` | Agent Mode must verify that Rabbi Telegram/helper can see only Rabbi/OneTime contacts and incoming communications, that support tickets are owned/notified to Shloimie/super-admin, that non-ticket Rabbi communications would ding Rabbi after chat ID setup, and that Codex/agent progress updates stay concise, redacted, and saved through the Operations drop-off loop. | Source `RAW-20260708-034`; refreshed `src/lib/bna/agent-review-hub.js` and generated `public/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` to call out OneTime contact/message scope, staff-owned ticket separation, and required drop-off proof. PASS focused helper/scope/integration/Agent Review tests 45/45; PASS no-write `npm run telegram:rabbi:readiness`; PASS full `npm test` 1670/1670; PASS `npm run secrets:audit`; PASS `npm run watchdog:protocol-drift`; PASS JSONL parse. 2026-07-09 live readback returned `200` for `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` with `REQ-20260708-101`, `REQ-20260708-100`, the chat-ID blocker, and OneTime scope markers. Live Rabbi Telegram send remains blocked until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured; Agent Mode still needs to save PASS/BLOCKED/FAIL drop-off proof. |

## Continuation Tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `TASK-20260708-017` | rabbi_telegram_sidekick_smoke_contract | Update Rabbi Telegram runtime context, Agent Mode smoke instructions, and readiness evidence for the full scoped sidekick loop. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-033` | `REQ-20260708-100` | Configure `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`, rerun readiness, then run a scoped live Rabbi Telegram smoke. Keep live-send proof blocked until the intended chat is verified. | internal | Deployed / runtime chat ID blocked |
| `TASK-20260708-018` | rabbi_contacts_messages_progress_prompt_refresh | Refresh the Rabbi Telegram/helper Agent Mode smoke prompt so it explicitly audits OneTime contacts, all incoming message sources, staff-owned ticket routing, Rabbi communication dings, and Codex/agent progress dings. | Codex | `rabbi_sheller_provider` / `one_time_mishnah_class` | `RAW-20260708-034` | `REQ-20260708-101` | Run the deployed Agent Mode smoke prompt and save PASS/BLOCKED/FAIL drop-off proof; configure Rabbi chat ID before live Rabbi Telegram smoke. | internal | Deployed / live readback verified / Agent Mode proof and chat ID blocked |

## Decisions / Blockers

| ID | Decision | Owner | Recommended Action | Status |
| --- | --- | --- | --- | --- |
| `DEC-20260708-016` | Rabbi Telegram chat ID is still required before the Rabbi worker can run live. | Shloimie | Message the Rabbi bot from the intended Telegram account/group, then provide or let Codex infer and set `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`. | `Open` |
| `DEC-20260708-017` | External Telegram sends require verified target and redacted copy. | Codex/Shloimie | Enable super-admin ticket dings only after config/readiness passes; Rabbi sends stay blocked until Rabbi chat ID exists. | `Accepted` |
| `DEC-20260708-018` | Rabbi bot capability boundary must remain provider-scoped. | Codex | Give Rabbi bot/helper agent-like power only inside OneTime-scoped data and safe previews unless explicit approval exists. | `Accepted` |
| `DEC-20260708-020` | Rabbi communication dings should not become support-ticket ownership. | Codex/Shloimie | Keep support tickets assigned/notified to Shloimie/super-admin, while Rabbi receives metadata-only OneTime communication alerts for parent/provider and WAPI inbound messages once his Telegram chat ID is configured. | `Accepted` |
| `DEC-20260708-021` | Rabbi live Telegram send/readback cannot be completed without the intended chat ID. | Shloimie | Message the Rabbi bot from the intended account/group and provide the chat ID, or let Codex run a safe getUpdates/readiness flow after the bot receives that message. | `Open` |
| `DEC-20260708-022` | Rabbi bot/helper receives communications, but support tickets remain super-admin owned. | Codex/Shloimie | Keep support-ticket response ownership and Telegram dings with Shloimie/super-admin; route Rabbi class communications, email, WhatsApp/WAPI, student messages, and internal reminders to Rabbi Telegram after the Rabbi chat ID is configured. | `Accepted` |

## Batch Plan

1. Preserve raw intake and register requirements.
2. Add a shared redacted Telegram notification/readiness utility.
3. Wire support-ticket alert hooks into the high-value ticket creation paths.
4. Add tests for redaction, disabled-by-default/local no-send behavior, and
   readiness blockers.
5. Add Agent Mode smoke prompts for Rabbi Telegram/helper/ticket routing.
6. Verify, deploy OneTime if server-visible behavior changed, live-smoke, then
   record ledger/changelog proof.
7. Continue `REQ-20260708-100` by aligning Rabbi bot runtime context with the
   scoped helper contract, adding scoped OneTime Drive/context previews,
   refreshing Agent Mode smoke prompts, and keeping live Rabbi delivery blocked
   until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured.

## Closeout Checklist

- [x] `node --check` for touched scripts/server files
- [x] Focused tests for notification/readiness behavior
- [x] Full `npm test` passed 1646/1646
- [x] `npm run watchdog:helper-destinations`
- [x] `npm run watchdog:actions`
- [x] `npm run watchdog:protocol-drift`
- [x] `npm run secrets:audit`
- [x] OneTime deploy/live smoke if server-visible behavior changes
- [x] Ledger and changelog updated
- [x] Scoped commit and push

## Deploy Closeout

- Commit: `74a1d4960c301052bcbb0cc22fe7da05a7e969e4`
- Railway deployment: `02195be0-33a2-4bee-96b3-c559a5c51256` (`SUCCESS`)
- Live smoke:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed.
- Live target guard: `npm run one-time:target:guard` passed after commit/push
  and after deploy.
- Live prompt readback:
  `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` returned `200`
  with `REQ-20260708-084`, drop-off instructions, Rabbi chat-ID blocker, and
  no-WhatsApp-send guard.
- No synthetic production ticket was created and no live Telegram support-ticket
  alert was sent during smoke.

## Follow-up Deploy Closeout

- Commits: `9618a4d4` and `16a69c9e` pushed to
  `codex/rabbi-helper-tool-scope-20260708`.
- Railway deployment: `500242a9-860f-4599-a145-eb9515bae0a4` (`SUCCESS`) on
  `one-time-production` / `one-time-web` / `production`.
- Live smoke:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed for health, instance config, public routes, parent, student, provider,
  and One Time classroom routes.
- Live prompt readback:
  `/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with
  `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`.
- Post-deploy readiness:
  `npm run telegram:rabbi:readiness` passed as a no-write check and still
  reports `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` missing. No live Rabbi
  Telegram message was sent.

## Read-only Helper Wrapper Deploy Closeout

- Commits: `9e611cbd`, `304d68a8`, and `d23c9ec2` pushed to
  `codex/rabbi-helper-tool-scope-20260708`; clean release candidate branch
  `codex/rabbi-helper-release-candidate-20260708` was pushed for deploy from a
  clean worktree.
- Railway deployment:
  `2107fae5-1a73-49ec-96e8-5a3a66bb8e43` (`SUCCESS`) on
  `one-time-production` / `one-time-web` / `production`.
- Live smoke:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed for health, instance config, public routes, parent, student, provider,
  and One Time classroom routes.
- Live prompt readback:
  `/agent-review-prompts/rabbi-helper-tool-scope-map.md` returned `200` with
  `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`.
- No live Rabbi Telegram message was sent. Rabbi delivery remains blocked until
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured.

## Rabbi Sidekick Deploy Closeout

- Commit: `2895654e` pushed to `codex/rabbi-helper-tool-scope-20260708`.
- Release branch: `codex/rabbi-sidekick-release-20260708` pushed at
  `2895654e`.
- Railway deployment:
  `eb599c39-36f7-4f80-9d6d-2a8fc5c6406f` (`SUCCESS`) on
  `one-time-production` / `one-time-web` / `production`.
- Live smoke:
  `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
  passed.
- Live prompt readback:
  `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md` returned `200`
  and contained `REQ-20260708-100`, scoped Drive/web sidekick behavior, and the
  brief progress-ding format.
- Readiness:
  `npm run telegram:rabbi:readiness` remained a no-write PASS and reports Rabbi
  token plus Operations credentials present, but Rabbi live delivery is still
  blocked because `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is not configured.
- Super-admin progress ding:
  `npm run telegram:codex-progress -- --send --json` returned `sent=true` and
  `message_id_present=true` for the deploy closeout update. No raw token or
  chat ID was printed.

## 2026-07-09 Bot Token Intake / Readiness Recheck

- Shloimie provided the BotFather credential packet for `t.me/onetimeaios_bot`.
  The live token was treated as a secret and redacted from tracked repo files.
- Local ignored secret storage already contained the Rabbi bot token, so no
  tracked file needed the credential.
- `npm run telegram:rabbi:readiness` ran as a no-write check on 2026-07-09 and
  reports Rabbi token configured, scoped One Time Operations username/password
  configured, and `external_write_performed=false`.
- The active blocker is unchanged: `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is
  missing. Live Rabbi Telegram startup, Rabbi communications dings, and the
  full scoped live smoke remain blocked until the intended Rabbi account/group
  messages `t.me/onetimeaios_bot` and the allowed chat ID is configured.
- Added `npm run telegram:rabbi:chat-id` as the no-send readback command for
  that exact moment. It calls Telegram `getMe`/`getUpdates`, masks chat IDs in
  console output, and writes full candidate IDs only to ignored `.runtime`.
- Live read-only smoke of `npm run telegram:rabbi:chat-id` on 2026-07-09
  resolved the bot as `onetimeaios_bot`, sent no message, printed no token,
  and found 0 pending chat candidates.
- Do not ask Agent Mode or ChatGPT to handle the raw token. Agent Mode may test
  only readiness, public prompts, and blocked-state evidence until the chat ID
  is configured by Codex/operator through secret-safe runtime config.

## Superseded Helper-Scope Deploy Blocker

- Historical helper scope commits were pushed on
  `codex/rabbi-helper-tool-scope-20260708`: `e5ac4827` replaced the last
  fallback-only Rabbi helper wrappers and `7c9edf73` recorded full verification.
- The current scope map reports 163 contracts, 163
  `tool_wrapper_available_local`, 0 `registered_fallback_only_blocker`, and 0
  `tool_wrapper_missing`.
- Full local verification passed: full `npm test` 1671/1671, focused
  helper/Telegram/Agent Review tests 53/53, JSONL parse,
  `npm run secrets:audit`, `npm run watchdog:protocol-drift`,
  `npm run one-time:target:guard -- --json`, and
  `npm run one-time:railway-target:guard`.
- Railway deployment `a23e4e82-2199-4fd9-9b17-482c385dabcc` failed after
  build/image push with empty deployment logs. This is no longer the current
  deploy blocker: later OneTime deployments reached `SUCCESS`, and 2026-07-09
  live readback confirmed the Rabbi Telegram/helper prompt and helper-scope
  artifacts are publicly available on `join.onetimeonetime.com`.
- Local OneTime boot passed on port `8123` for `/api/health` and
  `/api/one-time/instance-config` with the expected
  `rabbi_sheller_provider` / `one_time_mishnah_class` / `onetime` scope; the
  temporary local server was stopped.
- 2026-07-09 live readback:
  `/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`,
  `/agent-review-prompts/rabbi-helper-tool-scope-map.md`,
  `/agent-review-artifacts/rabbi-one-time-tool-scope-map.md`, and
  `/api/one-time/instance-config` returned `200` with the expected OneTime
  scope markers.
- Live Rabbi Telegram delivery remains blocked until
  `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured. Support-ticket dings
  remain super-admin owned; Rabbi communications remain provider-scoped and
  metadata-only until his target chat is verified.

## 2026-07-09 Agent Review Proof Readiness Smoke

- Added `npm run app:smoke:rabbi-agent-review-proof-readiness` as the
  reusable no-send readback for the Rabbi Telegram/helper Agent Review proof
  lane.
- Latest run passed on 2026-07-09 and wrote
  `ops/live-smokes/2026-07-09T13-51-52-167Z-rabbi-agent-review-proof-readiness-live.md`.
- Live readback proved the
  `rabbi-telegram-helper-ticket-smoke` public prompt is available on
  `join.onetimeonetime.com` with the OneTime contact/message scope,
  staff-owned ticket routing, chat-ID blocker, no-WhatsApp-send guard, and
  required `OPERATIONS_DROPOFF_SAVED` / `OPERATIONS_DROPOFF_FAILED` contract.
- The protected Agent Review hub currently reports
  `rabbi-telegram-helper-ticket-smoke` as `not_started` with no terminal AGR
  result.
- This does not complete the Rabbi Telegram/helper Agent Mode proof. The next
  Agent Mode window should open
  `https://join.onetimeonetime.com/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`,
  test only that prompt scope, and save PASS/FAIL/BLOCKED through the
  Operations drop-off/readback path. Live Rabbi Telegram delivery remains
  blocked until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured.
