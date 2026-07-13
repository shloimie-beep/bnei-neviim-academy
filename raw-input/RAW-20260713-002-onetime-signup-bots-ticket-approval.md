# RAW-20260713-002 - One Time signup, bots, and ticket approval launch packet

- Date: 2026-07-13
- Source channel: codex_chat
- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Parse status: registered
- Requirement register: tasks-pending/2026-07-13-onetime-signup-bots-ticket-approval.md

## Raw Source

Shloimie provided a `BNA_GOAL_MODE_EXECUTION_PACKET` titled:

> P0 One Time signup-form repair, public WhatsApp lead agent activation, private Rabbi Telegram workspace agent, and Super Admin ticket-approval flow

The packet continues the existing One Time landing/signup work, shared BNA/One Time CRM build, communication-agent/channel-binding architecture, Telegram ramble protocol, delivery outbox, action registry, and One Time corrective execution run.

Execution order:

1. Wave 1 is a production launch blocker: reproduce the actual production signup-form failure, repair the form, test every form combination, deploy the form fix, and live-verify successful submission before Waves 2-5.
2. Wave 2: define and activate the public One Time WhatsApp lead agent with approved public knowledge, deterministic class-link action, canonical CRM contact capture, Inbox/timeline persistence, zero automatic CRM tasks, OpenAI response runtime, WAPI delivery outbox, and live verification.
3. Wave 3: define the private Rabbi Telegram workspace agent, authenticated to Rabbi Scheller only, scoped to One Time CRM/messages/content/tickets/tasks/actions, separated from the public WhatsApp bot and Super Admin bot.
4. Wave 4: route Rabbi Telegram product/change/problem messages into scoped support tickets requiring Super Admin Telegram approval before Codex task/job creation.
5. Wave 5: action-registry parity, bot/form/ticket test matrices, final deployment, live proof, and exact remaining credential-only blockers.

Wave 1 form contract highlights:

- First-step fields: `contact_name`, `email`, conditional `phone`, required `audience_type`, required `location`, resolved IANA `timezone`, required `reminder_preference`, conditional `reminder_consent`.
- Do not collect student name, payment, portal credentials, or create a portal login.
- Use one frontend/server schema and one validation function for blur, submit, and browser tests.
- `No reminders` never requires phone or reminder consent; `Email` never requires phone; WhatsApp/Both require phone and consent.
- Hidden conditional controls must be disabled and not validated.
- Use `novalidate`, accessible field errors, focus the first visible invalid field, preserve user entries, prevent duplicate submissions, and show success copy without billing/portal/internal/debug language.
- Use the current canonical signup route and current endpoint. Do not add another endpoint merely to avoid repairing the current one.
- Server success contract must return `success`, `contact_key`, `signup_key`, `confirmation_queued`, `reminder_preference`, `next_path`, and `duplicate_submission`.
- The API must resolve the One Time workspace/project server-side, upsert the canonical One Time CRM contact, link signup interest, store audience/location/timezone/reminder/consent, create zero automatic CRM tasks, write one audit/timeline event, enqueue approved immediate confirmation through delivery outbox, and remain idempotent.

Guardrails:

- No external sends, payments, access grants, credential changes, destructive data changes, or historical imports without separate explicit approval.
- Keep public WhatsApp lead bot, private Rabbi Telegram workspace agent, and Super Admin Telegram bot as separate actors with separate scope and knowledge.
- Do not create another CRM, contact model, delivery queue, or general assistant platform.

## Parsed Items

- REQ-20260713-901: Wave 1 - reproduce, repair, deploy, and live-verify the One Time production signup form with canonical conditional validation and server contract.
- REQ-20260713-902: Wave 2 - public One Time WhatsApp lead agent, public knowledge bundle, class-link action, natural response runtime, live WAPI readiness, and zero automatic task policy.
- REQ-20260713-903: Wave 3 - private Rabbi Telegram workspace agent with scoped CRM/content/ticket/task actions and private knowledge separation.
- REQ-20260713-904: Wave 4 - Rabbi ticket to Super Admin Telegram approval to Codex job pipeline.
- REQ-20260713-905: Wave 5 - action-registry parity watchdog, full matrix, deployment, and final proof.
