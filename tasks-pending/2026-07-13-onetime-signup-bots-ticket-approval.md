# One Time signup, bots, and ticket approval launch packet

- Raw input: `raw-input/RAW-20260713-002-onetime-signup-bots-ticket-approval.md`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Status: `in_progress`

## Requirements

| ID | Wave | Title | Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-20260713-901 | 1 | Reproduce, repair, deploy, and live-verify the One Time production signup form | Deployed; live-smoked | Deployed SHA `881f892523eb9a20137377882e2452e45cd581ca`; production browser no-write submit, direct API dry-run, and route smoke passed |
| REQ-20260713-902 | 2 | Public One Time WhatsApp lead agent and approved public knowledge/class-link runtime | Implemented locally; live activation blocked by approval flag | `config/service-provider-bots/one-time.json` v3, `ACTION-ONETIME-GET-CURRENT-CLASS-LINK`, focused bot tests, One Time focused suite, action watchdog, secrets audit, and WAPI readiness check |
| REQ-20260713-903 | 3 | Private Rabbi Telegram workspace agent separated from public WhatsApp | Pending | Blocked behind Wave 1 launch blocker |
| REQ-20260713-904 | 4 | Rabbi ticket to Super Admin approval to Codex job flow | Pending | Blocked behind Wave 1 launch blocker |
| REQ-20260713-905 | 5 | Action-registry parity, full matrices, final deploy/proof | Pending | Blocked behind Waves 1-4 |

## Wave 1 Acceptance Criteria

- Production route and CTA/form behavior are reproduced with full DOM, validation, focus, console, request, and response diagnostics.
- The current canonical signup form uses a single frontend validation schema and one matching server schema.
- Family and School are real radio inputs or equivalently accessible radio controls that update `audience_type` immediately and keyboard/touch/mouse correctly.
- Reminder choices have no preselected value and use conditional validation.
- `No reminders` does not require phone or reminder consent.
- `Email` does not require phone.
- WhatsApp/Both require phone and consent.
- Hidden conditional controls are disabled and not validated.
- Submit creates exactly one request and is idempotent.
- Server resolves One Time workspace/project, upserts the canonical CRM contact, links signup interest, stores location/timezone/reminder/consent, creates zero automatic CRM tasks, writes timeline/audit evidence, and queues approved confirmation when configured.
- Success copy says "You're signed up." and avoids billing, portal, internal, or debug language.
- The tested SHA is deployed to production and live-smoked on `https://join.onetimeonetime.com`.

## Guardrails

- No payment, checkout, member access, password setup, portal login, classroom grant, credential mutation, DNS change, or destructive production write.
- No WhatsApp/WAPI, Telegram, email, or other external send without a separate explicit send approval. Delivery-outbox behavior may be verified by queued/draft/no-send proof where configured.
- Synthetic production records must be clearly tagged and idempotent, or dry-run/no-write proof must be used until an approved cleanup path exists.

## Wave 1 Local Proof

- Starting live SHA: `3712308731910a6e77fb9a18ce18b57ae35f22dd`.
- Production diagnostic report: `ops/live-smokes/2026-07-13T00-36-03-104Z-one-time-signup-production-diagnostic.md` (ignored local evidence).
- Reproduced failure: `Family + No reminders + no phone + no consent` triggered no POST and focused `signup_acknowledgement` with `Check the box to confirm your class-time and reminder preferences.`
- Root cause: frontend and backend required acknowledgement/consent even when `No reminders` was selected; the form also depended on custom Family/School buttons instead of canonical accessible `audience_type` radio inputs.
- Repair files: `public/one-time/signup.html`, `src/lib/bna/one-time-signup-workflow.js`, `server.js`, `ops/action-registry.json`.
- Test files: `tests/one-time-signup-form-matrix.test.js`, `tests/one-time-direct-signup-page.test.js`, `tests/one-time-signup-reminder-workflow.test.js`.
- PASS `node --test tests/one-time-signup-form-matrix.test.js tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js` (17/17).
- PASS `npm run test:onetime:focused` (76/76).
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `npm run secrets:audit`.
- PASS `npm run bna:run:validate`; broader addendum work remains open.
- PASS `node --check server.js`, `node --check src/lib/bna/one-time-signup-workflow.js`, and `node --check scripts/diagnose-onetime-signup-production.mjs`.
- Deployed One Time Railway deployment `35633776-51a0-4185-9bd0-61d73c187d45`; `npm run railway:doctor` returned `SUCCESS`.
- Live `/api/deploy-info` returned `commit_sha=881f892523eb9a20137377882e2452e45cd581ca`.
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 881f892523eb9a20137377882e2452e45cd581ca`.
- PASS production browser no-write/intercept diagnostic: `ops/live-smokes/2026-07-13T00-56-04-223Z-one-time-signup-production-diagnostic.md`; Family + No reminders + no phone + no consent produced one form POST attempt, no visible errors, and the approved success panel.
- PASS production direct-signup API dry-run with canonical payload: `direct_signup_workflow=true`, workspace `rabbi_sheller_provider`, project `one_time_mishnah_class`, confirmation email and Rabbi Telegram outbox preview present, no database write, no send, no checkout, and no access grant.
- Synthetic live-write cleanup note: one attempted DB-readback smoke created `bna_contacts:37` and `bna_parent_leads:22` for a `test-onetime-direct-signup-...@example.invalid` address before the local DB readback failed on Railway-internal database access. Both records were found and archived through the production CRM API with `no_send=true` and `external_write_performed=false`; no delivery cron was run. DB-level queued-outbox cancellation remains blocked from this machine by the Railway-internal database URL.

## Wave 2 Public WhatsApp Bot Local Proof

- Public agent profile is now `one_time_parent_information_agent` version `2026-07-13-v3`.
- Public display name is `Rabbi Scheller's Digital Assistant`; scope remains `rabbi_sheller_provider` / `one_time_mishnah_class` and channel remains WhatsApp only.
- Approved public facts now include One Time Mishnayos with Rabbi Eli Scheller, live daily schedule at 7:00 p.m. Israel time, local class address `HaGaon MiVilna 8, Ramat Beit Shemesh Alef`, canonical signup route `/one-time/signup`, and the allowed public audiences.
- Stale price, trial, portal, library, paid membership, current-learning, and access claims remain unpublished for the bot; unknown facts route to human follow-up.
- Added registry action `ACTION-ONETIME-GET-CURRENT-CLASS-LINK`.
- Deterministic class-link release now uses `class_info_requested`, `class_info_consented`, or verified `active_member` policy states; the raw link is allowed only in the final channel delivery body and remains redacted from persisted audit body, metadata, diagnostics, prompt context, and repo evidence.
- Public WhatsApp readiness endpoint now reports `Rabbi Scheller's Digital Assistant` and falls back to `/one-time/signup` when the runtime WhatsApp number is missing.
- PASS `node --check src/lib/bna/provider-lead-bot.js`.
- PASS `node --check server.js`.
- PASS `node --test tests/service-provider-lead-bot.test.js` (10/10).
- PASS `node --test tests/one-time-brand-helper-isolation.test.js` (11/11).
- PASS `npm run test:onetime:focused` (76/76).
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `npm run secrets:audit`.
- PASS `npm run bna:run:validate`.
- PASS `git diff --check` with line-ending warnings only.
- WAPI readiness no-send check: outbound configured, One Time scoped credential configured, provider setup ready, auto-reply ready/enabled/approved, class link configured, and no write/send/mutation/secret print performed.
- Remaining live activation blocker: `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM` must equal `APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM`.
