# One Time signup, bots, and ticket approval launch packet

- Raw input: `raw-input/RAW-20260713-002-onetime-signup-bots-ticket-approval.md`
- Workspace: `rabbi_sheller_provider`
- Project: `one_time_mishnah_class`
- Status: `in_progress`

## Requirements

| ID | Wave | Title | Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-20260713-901 | 1 | Reproduce, repair, deploy, and live-verify the One Time production signup form | Deployed; live-smoked | Form repair deployed at `881f892523eb9a20137377882e2452e45cd581ca`; keyboard-card regression patch deployed at `ee9391d2bd4a1ff3ef41fc99296089254373a4d6`; production form matrix, direct API dry-run, and exact-SHA route smoke passed |
| REQ-20260713-902 | 2 | Public One Time WhatsApp lead agent and approved public knowledge/class-link runtime | Deployed; live activation blocked by approval flag | `config/service-provider-bots/one-time.json` v3, `ACTION-ONETIME-GET-CURRENT-CLASS-LINK`, focused bot tests, One Time focused suite, action watchdog, secrets audit, WAPI readiness check, One Time deploy-info, route smoke, and public WhatsApp readiness readback |
| REQ-20260713-903 | 3 | Private Rabbi Telegram workspace agent separated from public WhatsApp | In progress; deployed readiness/ticket slice | Private Rabbi target readiness, scoped status notifications, and public/private bot separation tests passed; full CRM/content action surface remains open |
| REQ-20260713-904 | 4 | Rabbi ticket to Super Admin approval to Codex job flow | In progress; deployed approval-gate slice | Support-ticket approval lifecycle, Super Admin inline callbacks, no-initial-Codex-job guard, registry rows, deployment, live route guard, and tests passed; live synthetic send/approval remains send/cleanup gated |
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
- Regression patch: production matrix on SHA `e0dd3d48543740efb32b35f64ad27cf0cc6e676b` reproduced a remaining keyboard-only card issue where Enter on the Family/School and reminder cards left the underlying radios unchecked, produced audience/reminder errors, and attempted zero POSTs.
- Patch files: `public/one-time/signup.html`, `tests/one-time-signup-form-matrix.test.js`, `scripts/smoke-onetime-signup-form-matrix-live.mjs`, and `scripts/smoke-one-time-interest-dry-run-live.mjs`.
- Fix: Family/School and reminder cards are focusable and Enter/Space now activate the underlying radio input through the same change path as pointer/touch selection.
- PASS local regression verification: syntax checks, signup matrix tests `17/17`, CRM DTO contract tests `34/34`, `npm run operations:check-generated`, `npm run watchdog:actions`, `npm run secrets:audit`, `npm run watchdog:protocol-drift`, and `npm run bna:run:validate`.
- Latest One Time deployment `2645a6c7-3b51-4ae6-915f-5a267dacde22` reached `SUCCESS`; live `/api/deploy-info` returned `commit_sha=ee9391d2bd4a1ff3ef41fc99296089254373a4d6`.
- PASS latest production form matrix: `ops/live-smokes/2026-07-13T09-32-18-347Z-one-time-signup-form-matrix-live.md`; all required success/error/switch/double-click/mobile/keyboard cases passed with no failed rows.
- PASS latest direct signup dry-run: `ops/live-smokes/2026-07-13T09-32-18-048Z-one-time-interest-dry-run-live-smoke.md`; no production writes or sends.

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
- Deployed code commit `9fb436760872bab77019b3769652c8b517025c8d` to One Time Railway deployment `eac01ac4-5589-4c24-b21f-5aea52aeb8d6`; Railway doctor reached `SUCCESS`.
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 9fb436760872bab77019b3769652c8b517025c8d`.
- PASS live `https://join.onetimeonetime.com/api/one-time/public-whatsapp` readiness readback: assistant `Rabbi Scheller's Digital Assistant`, subtitle `Public One Time WhatsApp lead agent`, workspace `rabbi_sheller_provider`, project `one_time_mishnah_class`, class link configured, full number hidden, and no WhatsApp send/external write performed.

## Wave 3/4 Rabbi Telegram and Ticket Approval Proof

- Deployed commit `8f6441523a5cd3547ecd4ba633dab90c8951ffd9` to BNA and One Time.
- BNA Railway deployment `6ddd918b-3c4a-453d-8a07-8b6a53407607` reached `SUCCESS`; live `https://bneineviimacademy.org/api/deploy-info` returned the deployed SHA.
- One Time Railway deployment `16a16da1-4ca7-491c-87f8-d1f9637de5f7` reached `SUCCESS`; live `https://join.onetimeonetime.com/api/deploy-info` returned the deployed SHA.
- Rabbi Telegram readiness audit passed in no-send mode: Super Admin Telegram target and Rabbi Telegram target are both configured/ready, with no external write performed.
- The Super Admin ticket alert formatter now includes ticket number, Rabbi/source scope, short title, affected section, requested result, severity, and Open in Operations link; the alert supports inline actions for Approve for Codex, Ask Rabbi, Keep as Ticket, Reject, and Open in Operations.
- Rabbi Telegram ticket capture now posts `awaiting_super_admin_approval`, `assigned_to=Shloimie`, `suppress_task_creation=true`, and `requires_super_admin_approval=true`, returning zero initial tasks/jobs.
- Approval route `POST /api/bna/support-tickets/:id/approval-action` requires platform Super Admin and supports idempotent `approve_for_codex`, `ask_rabbi`, `keep_as_ticket`, and `reject` actions.
- Telegram callback buttons call the same shared approval endpoint; they do not create a separate mutation path.
- PASS `node --check server.js`.
- PASS `node --check scripts/telegram-kimi-bridge.mjs`.
- PASS `node --test tests/rabbi-telegram-notifications.test.js tests/rabbi-telegram-ticket-approval.test.js` (20/20).
- PASS `node --test tests/one-time-external-user-portal.test.js tests/one-time-delivery-outbox.test.js tests/action-registry-telegram-ui-bot.test.js` (76/76).
- PASS `npm run test:onetime:focused` (76/76).
- PASS `npm run watchdog:actions` with `finding_count=0`.
- PASS `npm run secrets:audit`.
- PASS `npm run bna:run:validate`; broader addendum work remains open.
- PASS `git diff --check` with line-ending warnings only.
- PASS live unauthenticated approval guard: BNA and One Time both returned `401 Unauthorized` for unauthenticated `approval-action` attempts, with no ticket/job creation.
- PASS One Time exact-SHA route smoke: `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 8f6441523a5cd3547ecd4ba633dab90c8951ffd9`.
- Post-deploy public WhatsApp readback still returns the public assistant identity, scoped workspace/project, configured class link, hidden full number, and no send/external write.
- Remaining live-send blocker: the local readiness audit reports `ticket_alerts_enabled=false` and `rabbi_communication_alerts_enabled=false`, so no live Telegram ticket alert/approval send was performed from this environment.
- Remaining WAPI blocker: public WhatsApp live auto-reply activation still requires `ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM_CONFIRM=APPROVE_ONE_TIME_PROVIDER_LEAD_BOT_TELEGRAM`.
