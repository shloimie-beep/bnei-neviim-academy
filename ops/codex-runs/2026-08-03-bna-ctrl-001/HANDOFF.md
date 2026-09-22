# BNA-CTRL-001 handoff

Status: release candidate verified; final GitHub release follows this handoff commit.

## Exact source and ownership

- Task: `BNA-CTRL-001`.
- Branch: `codex/bna-ctrl-001-20260803`.
- Base: `cebbfc5781b92fcd9a5014df67f8ae4ba0b3a61c`.
- Final runtime-code candidate: `09aaac46528d50bf66a20ead4542f3214425ac55`.
- Draft PR: `#143`; PRs `#141` and `#142` were inspected as historical inputs and were not mechanically merged.
- Lease: `ops/codex-runs/2026-08-03-bna-ctrl-001/LEASE.md`.
- Main changed surfaces: Academy Telegram bridge/notifier/runtime helpers, task capture and actor-scoped APIs, Operations source/queue/deep-link UI, signed summary-event contract, tests, runbook, and this run evidence.
- Explicit exclusions held: Rabbi One Time worker/token/runtime, One Time server/data/cookie, payments, access grants, DNS, bulk/customer messaging, credential rotation.

## Runtime truth and rollback

- Railway project: `bd5b6d78…7889`, production.
- Web service: `4079db35…6005`; worker service: `0932581f…390f`.
- Academy worker command: `BNA_RAILWAY_PROCESS=telegram-academy` -> `npm run telegram:kimi`.
- Bot identity: `@bneineviimacademy_bot`; token and private chat are represented only by masked/hash metadata.
- Transport: polling; `getWebhookInfo` had no webhook and zero pending updates.
- Allowed private-chat count: 1. Runtime key: `telegram-academy-bridge`.
- One-consumer proof: one successful Railway Academy worker deployment, one replica, fresh DB heartbeat, no webhook, no local duplicate process, durable update offset, and no second fleet.
- Pre-recovery rollback deployments: web `7ea83deb…ebbd`; worker `f4acc3d5…80a2`.
- Latest verified web canary deployment: `20d8c32f…3ef5` (`SUCCESS`).
- Latest verified worker code deployment: `9bc5bb92…f218` (`SUCCESS`); notification-config deployment `98ea7be1…8485` (`SUCCESS`).
- `TELEGRAM_TASK_NOTIFICATIONS_ENABLED=true` only after the accepted canary task existed in the durable watcher checkpoint.

## Live canary evidence

- Online canary notification: 1, exact approved copy.
- `/status`: 1 inbound command, 1 bounded response.
- Read-only control phrases: 4/4 passed (`my tasks`, decisions, blocked, recent Codex work), one response each.
- Accepted Telegram task: `#2819`, source Telegram/Bot, BNA workspace, Shloimie, priority `today`, source message/chat references present, one `classified_task` event in each canonical audit projection.
- Duplicate replay: 1; existing task returned, 0 new tasks, 0 new Telegram messages.
- Completion transition: task moved to Done through the authenticated Operations editor; worker persisted the completed checkpoint and emitted exactly 1 matching Telegram message bubble.
- Cleanup: accepted task `#2819`, corrective task `#2818`, and synthetic tickets `#1703`-`#1705` are archived. Nothing was deleted.
- Corrective attempts, retained for audit: the first message produced a ticket but no task; the second produced one incorrectly agent-routed task. Those failures directly produced the explicit-prefix, routing-field, human-task-kind, deep-link, and watcher-query fixes.

## Verification

- Focused BNA control/API/UI suite: 47/47 passed.
- Focused standalone One Time regression suite: 80/80 passed.
- Operations generated/canonical artifact checks: passed.
- Syntax/diff checks: passed.
- Tracked secret audit: 9,628 paths, 0 risk files.
- Live health: `/api/health` 200 with database connected; Telegram runtime heartbeat fresh/running; one worker consumer.
- Repository Railway doctor: passed on the exact BNA project/production/web service with both BNA services online and the Rabbi worker offline.
- Repository live-app smoke: 10/10 passed; evidence `live-app-smoke.md`.
- Desktop task/decision smoke: passed at 1920x935; mobile smoke: passed at 390x844.
- Before screenshots: `baseline-desktop.png`, `baseline-mobile.png`.
- After screenshots: `after-desktop.png`, `after-mobile.png`.

## External-effect counts

- Telegram outbound: 10 total — 1 approved online canary, 8 bounded command/capture responses, 1 completion transition. No bulk or customer messages.
- Synthetic production records: 2 tasks and 3 tickets created during corrective canary work; all 5 archived. Duplicate replay created 0 records.
- Live-smoke fixture: 1 temporary task created, commented, and deleted by the repository's existing smoke command after its assertion passed.
- Railway: bounded canary/recovery deployments only to the proven BNA web and Academy worker services; one notification flag changed from off to on after proof.
- Credential/token/chat changes: 0. Rabbi One Time interactions: 0. Payments/access/DNS/customer mutations: 0.

## Operations result

- My Tasks is derived from the authenticated actor plus canonical person aliases; no hard-coded Shloimie fallback remains.
- Decisions, Pending, Tasks, Done, Bots/Agents, source filters/badges, workspace/owner/status fields, and the shared drawer remain the canonical queue.
- Exact task deep links fetch the requested task even when the bounded list does not contain it.
- Task watcher reads bounded canonical views, persists a sanitized newest-first checkpoint before sends, rate-limits, respects Jerusalem quiet hours, and sends only useful transitions.

## One Time handoff (OT-LIVE-001)

No One Time producer was edited. `OT-LIVE-001` owns the independent producer for:

- Contract: `docs/architecture/contracts/bna-control-summary-event-v1.md`.
- Schema: `docs/architecture/contracts/bna-control-summary-event-v1.schema.json`.
- BNA validator/signature/replay helper: `src/lib/bna/control-summary-event.js`.
- Tests: `tests/control-summary-event.test.js`.
- Feature flag: `BNA_CONTROL_SUMMARY_EVENTS_ENABLED=false` by default.

The producer must emit only the named sanitized event types, sign the raw envelope with its own configured key ID, preserve event/idempotency/object-version fields, enforce the replay window, and return endpoint/config/replay proof before either side enables the flag. BNA stores only a summary projection, never a One Time private row. Standalone One Time availability remains independent of BNA.

## Remaining non-blocking follow-up

- `BNA-CTRL-WEBHOOK-001`: evaluate a webhook migration separately. Polling is the currently proven supported transport and remains online; this follow-up must not overlap consumers or reuse the Rabbi token.
- No blocker remains for the BNA control loop release.
