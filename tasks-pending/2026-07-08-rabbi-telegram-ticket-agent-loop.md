# 2026-07-08 - Rabbi Telegram Ticket And Agent Loop

## Source

- Raw intake: `raw-input/RAW-20260708-023-rabbi-telegram-ticket-agent-loop.md`
- Continuation intake:
  `raw-input/RAW-20260708-029-rabbi-telegram-helper-agent-scope-continuation.md`
- Latest continuation intake:
  `raw-input/RAW-20260708-031-rabbi-telegram-agent-parity-progress-dings.md`
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

## Requirements

| ID | Requirement | Status | Acceptance Criteria | Evidence |
| --- | --- | --- | --- | --- |
| `REQ-20260708-081` | Super-admin ticket Telegram notifications | `Done / Deployed` | Support ticket creation paths create or queue a concise Telegram ding to Shloimie/super-admin when configured; alert includes ticket id/number, scope, severity, title, and review location; alert redacts raw private bodies and never prints token/chat ID. | `src/lib/bna/telegram-notifications.js`, `server.js`, `src/lib/bna/helper/tool-registry.js`, `src/lib/actions/actions/operations.js`; `node --test tests/rabbi-telegram-notifications.test.js`; full `npm test` 1646/1646; Railway deployment `02195be0-33a2-4bee-96b3-c559a5c51256` SUCCESS; live smoke evidence `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-deploy-live-smoke.md`. No synthetic production ticket was created. |
| `REQ-20260708-082` | Rabbi Telegram communications scope | `Blocked` | Rabbi bot uses the Rabbi/OneTime profile, Rabbi token, Rabbi chat ID, and scoped OneTime context; Rabbi communications summaries are limited to OneTime/Rabbi data and cannot read BNA/super-admin/private provider data. | Readiness proof shows Rabbi token and ops credentials configured, but `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` missing. Evidence: `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |
| `REQ-20260708-083` | Rabbi helper/bot capability parity under guardrails | `Open / Partially Implemented` | Rabbi Telegram bot and in-portal helper expose safe agent-style actions for content, tasks, communications, Drive/search previews, and readiness reports, while blocking or previewing external mutations until approval. | Ticket routing/readiness prompt covered in this batch. `RAW-20260708-028` generated `ops/helper-tool-scope/rabbi-one-time-tool-scope-map.json` and `public/agent-review-prompts/rabbi-helper-tool-scope-map.md` for all 163 current helper parity gaps. Runtime wrappers/planner/result cards still remain follow-up work under `REQ-20260708-095`. |
| `REQ-20260708-084` | Agent Mode bot/helper smoke-test prompts | `Done / Deployed` | Prompt templates instruct agents exactly where to start, how to navigate, what to test, what not to mutate, and where to drop results even if a step fails; results are compatible with Agent Fleet pickup. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`; `npm run agent-review:prompts`; `node --test tests/agent-review-hub.test.js`; live prompt readback returned `200` and contained requirement, drop-off, chat-ID blocker, and no-WhatsApp-send guard. |
| `REQ-20260708-085` | Rabbi Telegram runtime readiness and blocker clarity | `Done / Runtime Blocked` | A no-secret readiness check reports Rabbi token/chat ID/ops credential presence, runtime profile, startup status, and exact blocker. Missing Rabbi chat ID stays a blocker until Shloimie supplies or triggers it. | `scripts/check-rabbi-telegram-ticket-readiness.mjs`; `npm run telegram:rabbi:readiness`; evidence in `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |
| `REQ-20260708-096` | Rabbi Telegram communication alerts | `Deployed / runtime chat ID blocked` | OneTime/Rabbi parent/provider portal messages, Resend inbound email, and inbound WAPI/WhatsApp communications trigger a Rabbi Telegram notification only when scoped to `rabbi_sheller_provider` / `one_time_mishnah_class`; support tickets continue to ding Shloimie/super-admin; Telegram alert text is metadata-only and excludes raw private bodies, secrets, setup links, access codes, and unrelated BNA/provider data. | `src/lib/bna/telegram-notifications.js`, `server.js`, `scripts/check-rabbi-telegram-ticket-readiness.mjs`, `tests/rabbi-telegram-notifications.test.js`; PASS `node --check src/lib/bna/telegram-notifications.js`; PASS `node --check server.js`; PASS `node --check scripts/check-rabbi-telegram-ticket-readiness.mjs`; PASS `node --test tests/rabbi-telegram-notifications.test.js` 9/9; PASS focused prompt/scope tests 25/25; PASS provider mailbox / Resend inbound / WAPI tests 27/27; PASS full `npm test` 1660/1660; Railway deployment `500242a9-860f-4599-a145-eb9515bae0a4` `SUCCESS`; PASS OneTime live smoke; readiness evidence `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md`. Full live Rabbi send remains blocked until `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` is configured. |
| `REQ-20260708-097` | Rabbi Telegram/helper agent parity, progress dings, and Agent Mode bot smokes | `Open / partial deployed / chat ID blocked` | Rabbi Telegram bot and in-portal helper share the same OneTime-scoped helper contract for contacts, communications, content, Drive/search previews, reminders, and safe internal work; Codex/agent task progress can produce concise Telegram summaries with done/pending/blocker/next-step status; Agent Mode prompts explicitly test bot/helper flows and always save PASS/FAIL/BLOCKED results to Operations drop-off, even when login, route, bot runtime, or credentials fail. | Source `RAW-20260708-031`; read-only Rabbi helper wrapper batch deployed through Railway deployment `2107fae5-1a73-49ec-96e8-5a3a66bb8e43`; OneTime live smoke passed; live prompt readback returned `200` with `REQ-20260708-093` and `RABBI-HELPER-SCOPE-163`; runtime live Rabbi Telegram delivery remains blocked by `DEC-20260708-016`. |

## Decisions / Blockers

| ID | Decision | Owner | Recommended Action | Status |
| --- | --- | --- | --- | --- |
| `DEC-20260708-016` | Rabbi Telegram chat ID is still required before the Rabbi worker can run live. | Shloimie | Message the Rabbi bot from the intended Telegram account/group, then provide or let Codex infer and set `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`. | `Open` |
| `DEC-20260708-017` | External Telegram sends require verified target and redacted copy. | Codex/Shloimie | Enable super-admin ticket dings only after config/readiness passes; Rabbi sends stay blocked until Rabbi chat ID exists. | `Accepted` |
| `DEC-20260708-018` | Rabbi bot capability boundary must remain provider-scoped. | Codex | Give Rabbi bot/helper agent-like power only inside OneTime-scoped data and safe previews unless explicit approval exists. | `Accepted` |
| `DEC-20260708-020` | Rabbi communication dings should not become support-ticket ownership. | Codex/Shloimie | Keep support tickets assigned/notified to Shloimie/super-admin, while Rabbi receives metadata-only OneTime communication alerts for parent/provider and WAPI inbound messages once his Telegram chat ID is configured. | `Accepted` |
| `DEC-20260708-021` | Rabbi live Telegram send/readback cannot be completed without the intended chat ID. | Shloimie | Message the Rabbi bot from the intended account/group and provide the chat ID, or let Codex run a safe getUpdates/readiness flow after the bot receives that message. | `Open` |

## Batch Plan

1. Preserve raw intake and register requirements.
2. Add a shared redacted Telegram notification/readiness utility.
3. Wire support-ticket alert hooks into the high-value ticket creation paths.
4. Add tests for redaction, disabled-by-default/local no-send behavior, and
   readiness blockers.
5. Add Agent Mode smoke prompts for Rabbi Telegram/helper/ticket routing.
6. Verify, deploy OneTime if server-visible behavior changed, live-smoke, then
   record ledger/changelog proof.

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
