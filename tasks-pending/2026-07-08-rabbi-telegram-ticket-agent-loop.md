# 2026-07-08 - Rabbi Telegram Ticket And Agent Loop

## Source

- Raw intake: `raw-input/RAW-20260708-023-rabbi-telegram-ticket-agent-loop.md`
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
| `REQ-20260708-081` | Super-admin ticket Telegram notifications | `Local Verified / Pending Deploy` | Support ticket creation paths create or queue a concise Telegram ding to Shloimie/super-admin when configured; alert includes ticket id/number, scope, severity, title, and review location; alert redacts raw private bodies and never prints token/chat ID. | `src/lib/bna/telegram-notifications.js`, `server.js`, `src/lib/bna/helper/tool-registry.js`, `src/lib/actions/actions/operations.js`; `node --test tests/rabbi-telegram-notifications.test.js`; full `npm test` 1646/1646 |
| `REQ-20260708-082` | Rabbi Telegram communications scope | `Blocked` | Rabbi bot uses the Rabbi/OneTime profile, Rabbi token, Rabbi chat ID, and scoped OneTime context; Rabbi communications summaries are limited to OneTime/Rabbi data and cannot read BNA/super-admin/private provider data. | Readiness proof shows Rabbi token and ops credentials configured, but `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER` missing. Evidence: `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |
| `REQ-20260708-083` | Rabbi helper/bot capability parity under guardrails | `Open / Partially Implemented` | Rabbi Telegram bot and in-portal helper expose safe agent-style actions for content, tasks, communications, Drive/search previews, and readiness reports, while blocking or previewing external mutations until approval. | Ticket routing/readiness prompt covered in this batch. Full Rabbi Telegram worker capability parity remains a follow-up after chat ID and runtime target are configured. |
| `REQ-20260708-084` | Agent Mode bot/helper smoke-test prompts | `Local Verified / Pending Deploy` | Prompt templates instruct agents exactly where to start, how to navigate, what to test, what not to mutate, and where to drop results even if a step fails; results are compatible with Agent Fleet pickup. | `src/lib/bna/agent-review-hub.js`, `public/agent-review-prompts/rabbi-telegram-helper-ticket-smoke.md`; `npm run agent-review:prompts`; `node --test tests/agent-review-hub.test.js` |
| `REQ-20260708-085` | Rabbi Telegram runtime readiness and blocker clarity | `Done / Runtime Blocked` | A no-secret readiness check reports Rabbi token/chat ID/ops credential presence, runtime profile, startup status, and exact blocker. Missing Rabbi chat ID stays a blocker until Shloimie supplies or triggers it. | `scripts/check-rabbi-telegram-ticket-readiness.mjs`; `npm run telegram:rabbi:readiness`; evidence in `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.md` |

## Decisions / Blockers

| ID | Decision | Owner | Recommended Action | Status |
| --- | --- | --- | --- | --- |
| `DEC-20260708-016` | Rabbi Telegram chat ID is still required before the Rabbi worker can run live. | Shloimie | Message the Rabbi bot from the intended Telegram account/group, then provide or let Codex infer and set `TELEGRAM_CHAT_ID_RABBI_ELIE_SCHELLER`. | `Open` |
| `DEC-20260708-017` | External Telegram sends require verified target and redacted copy. | Codex/Shloimie | Enable super-admin ticket dings only after config/readiness passes; Rabbi sends stay blocked until Rabbi chat ID exists. | `Accepted` |
| `DEC-20260708-018` | Rabbi bot capability boundary must remain provider-scoped. | Codex | Give Rabbi bot/helper agent-like power only inside OneTime-scoped data and safe previews unless explicit approval exists. | `Accepted` |

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
- [ ] OneTime deploy/live smoke if server-visible behavior changes
- [ ] Ledger and changelog updated
- [ ] Scoped commit and push
