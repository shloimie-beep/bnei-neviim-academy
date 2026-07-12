# One Time Signup And Reminder Requirement Matrix

Generated: 2026-07-12T11:03:00+03:00

Scope: urgent P0 direct signup and reminder workflow for PR #129. This matrix
records current local/no-send evidence and remaining blockers. It does not
claim deployment, live external delivery, CRM production mutation, or operator
personal test completion.

## Evidence Index

| Evidence | Scope |
| --- | --- |
| `public/one-time/signup.html` | Direct signup form route UI and browser payload. |
| `src/lib/bna/one-time-signup-workflow.js` | Form validation, city/timezone, class schedule, email/reminder copy, outbox event builders, readiness helpers, idempotency helpers, local-class preview. |
| `server.js` | `/one-time/signup`, `/api/one-time/interest`, direct-signup CRM/outbox/timeline path, protected reminder cron, no-portal guard metadata. |
| `tests/one-time-direct-signup-page.test.js` | Playwright route/form proof at 1440/1024/768/430/390, phone marker gating, payload assertions. |
| `tests/one-time-onboarding-intake.test.js` | Browser/static proof that continuation preserves exact product/CRM lead IDs, UTM/referrer/source attribution, and Family/School required fields. |
| `tests/one-time-signup-reminder-workflow.test.js` | Unit/static no-send workflow proof for consent, timezone, outbox, Telegram, reminder, local-class preview, no-portal negatives. |
| `src/lib/bna/one-time-operator-test-handoff.js` | Operator personal-test handoff guard; suppresses the ready message until all readiness checks pass. |
| `scripts/one-time-operator-test-handoff.mjs` | No-send CLI readback for the handoff guard. |
| `tests/one-time-operator-test-handoff.test.js` | Exact ready-message, blocked-state, guarded-command, and no-secret/no-broad-audience proof. |
| `tests/one-time-external-setup-readiness.test.js` | Redacted readiness proof for hosted settings without secret echo. |
| `ops/evidence/one-time-signup-reminder/2026-07-12/visual-smoke.json` | Local screenshot proof for `/one-time/signup` at 1440/1024/768/430/390. |
| `ops/watchdog-audits/2026-07-09-onetime-wapi-readiness.*` | Redacted WAPI readiness report; blocked, no send. |
| `ops/watchdog-audits/2026-07-08-rabbi-telegram-ticket-readiness.*` | Redacted Rabbi Telegram readiness report; blocked, no send. |

## Matrix

| Requirement | Current Status | Evidence | Remaining Proof/Blocker |
| --- | --- | --- | --- |
| Family/School dropdown | Locally proven | `public/one-time/signup.html`; `tests/one-time-direct-signup-page.test.js`; `tests/one-time-signup-reminder-workflow.test.js` | Live deployed smoke still required. |
| Exact Family/School continuation linkage | Locally proven, DB proof blocked | `public/one-time/signup.html`; `public/one-time-preview.html`; `server.js`; `tests/one-time-onboarding-intake.test.js`; direct signup session-storage assertions | Real local/test Postgres persistence and deployed live smoke are blocked until `BNA_ONETIME_CRM_TEST_DATABASE_URL` and release authorization are available. |
| Direct form route and Back to Home | Locally proven | `/one-time/signup` route in `server.js`; `public/one-time/signup.html`; Playwright route test; `visual-smoke.json` | Live deployed route smoke still required. |
| Professional responsive styling | Locally proven for signup page | `visual-smoke.json` and screenshots at 1440, 1024, 768, 430, 390 | Live visual smoke still required after deployment. |
| Internal/no-billing/no-portal copy removed | Locally proven for direct form | Static text assertions in direct signup tests and workflow tests | Live deployed DOM readback still required. |
| City autocomplete and ambiguous-city handling | Locally proven | City datalist in `public/one-time/signup.html`; `resolveOneTimeCitySelection()` ambiguous Springfield test | Broader geocoder coverage is not implemented; current proof covers approved city list behavior. |
| Server-side IANA timezone validation | Locally proven | `normalizeIanaTimezone()` and `resolveOneTimeCitySelection()` tests, including browser timezone mismatch review | Live CRM readback of mismatch storage requires deployed/operator test. |
| Jerusalem/New York/London/Sydney DST cases | Locally proven | `nextOneTimeClassSchedule()` and `buildClassTimeDisplay()` tests in `tests/one-time-signup-reminder-workflow.test.js` | None locally; live message rendering remains provider-gated. |
| Worldwide reminder sent at one actual instant | Locally proven | Schedule tests assert one Jerusalem class instant and converted recipient-local display | Hosted scheduler/run proof still blocked on cron config and deploy. |
| Recipient-local display time | Locally proven | Confirmation/reminder display tests for Lakewood/London/Sydney | Live email/WhatsApp received-copy proof requires operator test. |
| Phone not required for email/no-reminder choices | Locally proven | `buildOneTimeSignupLeadInput()` tests; Playwright phone marker/hint hidden before WhatsApp and explicit regression coverage that rejects visible `phone optional` copy | Live deployed form smoke still required. |
| Phone required for WhatsApp choices | Locally proven | Playwright WhatsApp validation blocks submit without phone; server-side validation requires phone for WhatsApp/Both | Live deployed form smoke still required. |
| No daily reminders still receives immediate confirmation | Locally proven at outbox-builder level | `buildOneTimeSignupOutboxEvents()` no-reminder test queues email confirmation and Rabbi Telegram alert, no WhatsApp | Real Resend delivery proof requires operator test and provider readiness. |
| Consent not hard-coded | Locally proven | `buildOneTimeSignupLeadInput()` sets `consent=false` for no reminders and requires explicit acknowledgement/consent for recurring reminders | Live CRM readback still required. |
| CRM deduplication | Partially local, live/test DB blocked | Server direct-signup path uses deterministic lead/outbox keys and `ON CONFLICT` patterns; run evidence records missing `BNA_ONETIME_CRM_TEST_DATABASE_URL` | Real local/test Postgres persistence and duplicate replay proof are blocked until approved test DB URL is provided. |
| Confirmation outbox retries | Partially local | `assistant_delivery_outbox` upsert path and idempotent delivery keys in `server.js`; outbox event builder tests | Worker retry lifecycle/delivery-provider proof still requires deployed outbox worker and provider readiness. |
| Daily reminder idempotency | Locally proven | `buildReminderIdempotencyKey()` includes class date, contact ID, channel, 30-minute window, schedule version; cron enqueue uses `delivery_key` with this idempotency key | Hosted cron/live replay proof still required. |
| Guarded single-recipient reminder simulation | Locally proven | `scripts/simulate-one-time-class-reminder.mjs`; `tests/one-time-reminder-simulation-command.test.js`; `npm run onetime:reminder:test-contact -- --confirm APPROVE_ONE_TIME_SINGLE_RECIPIENT_REMINDER_TEST --contact-id <operator_test_contact_id> --dry-run` | Real use is blocked until deploy, `CRON_SECRET`, hosted reminder readiness, and operator-submitted test contact exist. The command refuses missing/wrong confirmation, missing/zero contact ID, missing `CRON_SECRET`, and broad flags such as `--all`, `--audience`, or `--segment`. |
| Canceled/paused class suppression | Locally proven by static regression | `enqueueOneTimeClassReminderBatch()` checks `ONE_TIME_CLASS_ACTIVE` and returns `class_paused_or_canceled` skip reason; workflow test asserts these guardrails exist | Live dry-run/provider proof still required before terminal Done. |
| Email unsubscribe and WhatsApp STOP | Locally proven by static regression and preview tests | `oneTimeReminderSuppressionReason()` handles email unsubscribed/suppressed/invalid/bounced and WhatsApp stop/wrong_number/suppressed states; workflow test asserts STOP/wrong-number guardrails and local-class preview covers suppressed rows | Live provider webhook/readback still required before terminal Done. |
| Missing/changed Zoom-link handling | Locally proven for message builders | Confirmation/reminder builders reject missing or non-HTTPS join links; raw join URL is excluded from outbox payloads | Live alias readback and provider copy proof still required; raw URL must remain out of evidence. |
| Scoped Rabbi Telegram delivery | Locally proven at payload level, readiness blocked | `buildRabbiSignupTelegramAlert()` excludes Zoom URL; outbox channel is `telegram:one_time_rabbi_operator`; readiness report is redacted | Rabbi token/chat/worker readiness and one live scoped smoke remain blocked. |
| WAPI provider failures | Locally proven/readiness blocked | `oneTimeWapiReminderEnvReadiness()` and `npm run one-time:wapi:readiness` report missing scoped Whapi settings without sending | Whapi auth/instance/phone/webhook/live-mode setup required; if auth expired, Rabbi must scan Whapi QR. |
| Exact three-contact local-tag preview | Locally proven at pure-function level | `buildLocalClassSegmentPreview()` expected count 3 and masked references; test now blocks activation for count mismatch, duplicate contacts, invalid/missing email, and suppressed/archived rows | Real scoped DB preview for exactly three eligible contacts still requires approved CRM/test DB readback and must stop on mismatch. |
| Count mismatch blocks activation | Locally proven | Local-class preview test returns `blocked_count_mismatch` for two rows; activation-plan helper produces no updates when the preview is blocked | Real scoped DB preview still required before activation. |
| Local contacts receive email only | Locally proven as guarded activation plan | `buildLocalClassReminderActivationPlan()` refuses updates until operator personal test plus `APPROVE_ONE_TIME_LOCAL_CLASS_EMAIL_REMINDERS`, then returns exactly three email-only metadata patches with zero WhatsApp channels | Actual activation is intentionally blocked until operator personal test passes and exact segment is verified. |
| No portal, login, password, payment, or access records | Locally proven for direct signup payload/outbox path and local-class activation plan | Form tests reject portal copy/actions; workflow metadata sets `no_portal_onboarding`, `no_member_login_created`, `no_password_setup`, `no_checkout`, `no_payment`, `no_access_granted`; activation plan repeats those no-portal/no-payment/no-access flags | Real DB negative readback requires operator test/test DB. |
| Cross-workspace isolation | Partially covered by broader focused suite | Existing scope route tests and One Time focused suite cover workspace isolation; direct signup path uses `getRabbiProject()` / One Time workspace/project | Direct signup live CRM readback still required. |
| Synthetic `.invalid` tests perform no external send | Locally proven | Browser/API tests submit `.invalid` only to local test server; no-send readiness reports show no email/WhatsApp/Telegram sends | Real provider smoke must use only operator-submitted recipient after authorization. |
| Operator personal end-to-end test | Locally gated, not run | `buildOneTimeOperatorTestHandoff()` suppresses the required ready message until implementation, migrations, no-send tests, CI, deployment, Resend, WAPI, Telegram, scheduler, and direct-form visual proof pass; default CLI readback is blocked as expected with `ready_message_suppressed=true` | Requires deploy, provider readiness, CI workflow scope, and operator submitting exactly one test signup. |
| Local-class activation after personal test | Locally planned, not run | Activation-plan helper is email-only and requires both operator personal test proof and `APPROVE_ONE_TIME_LOCAL_CLASS_EMAIL_REMINDERS`; it performs no mutation itself | Must remain inactive until operator personal test passes and real scoped DB preview proves exactly three eligible contacts. |

## Current No-Send Gate Results

- `node --test tests/one-time-signup-reminder-workflow.test.js` PASS: 11/11.
- `node --test tests/one-time-reminder-simulation-command.test.js` PASS: 4/4.
- `node --test tests/one-time-operator-test-handoff.test.js` PASS: 4/4.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-signup-reminder-workflow.test.js` PASS: 13/13, including explicit no-phone-optional copy regression, required-dot visibility, and required acknowledgement checkbox assertions.
- `node --test tests/one-time-direct-signup-page.test.js tests/one-time-onboarding-intake.test.js` PASS: 6/6.
- `npm run test:onetime:focused` PASS: 67/67, including the guarded
  reminder simulation command, required checkbox/marker assertions, and the
  local-class activation-plan and operator-test handoff blocker assertions.
- `node scripts/one-time-operator-test-handoff.mjs --json` BLOCKED as expected:
  `ready=false`, `status=blocked_before_operator_personal_test`,
  `ready_message_suppressed=true`; missing checks are `ci_passed`,
  `deployment_complete`, `wapi_ready`, and `telegram_ready`.
- `node --test tests/one-time-external-setup-readiness.test.js` PASS: 8/8.
- `npm run one-time:railway-target:guard` PASS with no external write, no send, no secret print.
- `npm run one-time:setup:check` BLOCKED as expected: ready 5/8; missing Rabbi Stripe sandbox, Whapi/WAPI provider details, campaign seed/real campaign details; hosted scheduler settings are not enabled/approved and `CRON_SECRET` is missing.
- `npm run bna:run:validate` PASS with work remaining.
- `npm run secrets:audit` PASS: 0 tracked secret-risk files found.

## Explicit Non-Claims

- No production deploy or live external smoke was run.
- No email, WhatsApp/WAPI, or Telegram message was sent.
- No production CRM/provider mutation was performed.
- No portal/member/login/password/payment/checkout/access workflow was created or activated from this form.
- The exact three-contact local-class segment is not activated.
