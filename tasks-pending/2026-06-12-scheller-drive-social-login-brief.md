# Rabbi Scheller Drive / Social Ingestion / Login Brief

## Status

- Live Operations task: #506, `Set up Rabbi Scheller scoped Drive/social ingestion and send login last`.
- Operator priority: parents first; Rabbi Scheller login should be done last.
- Background setup completed and verified on 2026-06-12 at 16:16 +03:00.
- 2026-06-14 update: contact details and scoped login username were collected/stored, then the One Time task-manager access handoff was sent by email and WhatsApp.

## Completed Setup

- Created scoped One Time Drive/social ingestion lanes under `04 Content and Media Intake`.
- Wrote the generated backend map under `ops/one-time-mishnah-class/`.
- Wired the map into the Rabbi workspace/connector defaults.
- Added Operations `Drive / Social Intake` settings with Drive lanes, backend mapping, WhatsApp email-request copy, and prepare buttons for Facebook, LinkedIn, YouTube, Instagram, and WhatsApp Status.

## Existing Drive Structure

- Root folder: `One Time Mishnah Class - Rabbi Elie Scheller`
- Root link: https://drive.google.com/drive/folders/16cfBPM8dbxKmMPOB8PcnGybU7BQUT7L2
- Media intake folder: `04 Content and Media Intake`
- Media intake link: https://drive.google.com/drive/folders/1M9E7tGrOMPSa3g6YoKckw0uKiwDCswXv

## Known Gaps

- The original login handoff blocker is cleared: Rabbi Scheller's provider/project member records now have contact email, WhatsApp/contact phone, and scoped login username.
- Gmail handoff was sent successfully on 2026-06-14.
- WhatsApp handoff was delivered successfully on 2026-06-14 after retrying the communication log as `general`.
- Password-change/personal password setup for the scoped One Time Operations account is not yet a finished user-facing flow; the handoff used the current scoped Operations task-manager credentials plus a short-lived access link.

## Attempt 2 Verification

- Rechecked on 2026-06-12 at 16:23 +03:00.
- PASS `node --check server.js`
- PASS `node --check scripts/setup-one-time-partnership-drive.mjs`
- PASS `node --check scripts/telegram-kimi-bridge.mjs`
- PASS `node --check scripts/agent-fleet-supervisor.mjs`
- PASS `node --test tests/one-time-external-user-portal.test.js tests/service-provider-directory.test.js`, 42/42
- PASS `npm test`, 279/279
- FAIL `npm run openai:smoke`: report `ops/openai-smokes/2026-06-12T13-23-15-645Z-openai-sidekick-smoke.md`; app/repo/Drive reads passed, but OpenAI returned 401 `invalid_api_key`. Treat this as an OpenAI credential blocker, not a Rabbi Drive/social implementation failure.

## Intended Flow

1. Done 2026-06-14: Confirmed/stored Rabbi Scheller email and WhatsApp/contact phone.
2. Done 2026-06-14: Confirmed/stored the scoped One Time login username.
3. Still relevant: send Drive folder/video drop-off instructions again when the content intake workflow is ready for real uploads.
4. Done 2026-06-14: Sent Rabbi Scheller task-manager login information last.

## 2026-06-14 Login Handoff Verification

- Provider record updated with confirmed contact email, WhatsApp/contact phone, and scoped login username.
- Project member metadata updated with confirmed contact email/phone and scoped login username.
- Gmail sent `One Time task manager access` to Rabbi Scheller's confirmed email.
- WhatsApp sent and delivery readback showed delivered for communication `#1160`.
- Live Operations task `#506` was marked done with verification notes and a workspace comment.
- Message copy told Rabbi that the task manager is working now, while the rest of the workspace/social/content setup is still being configured.

## Parent Work Already Prioritized

- Parent portal/student emails were sent first where contact data existed.
- WhatsApp send attempts timed out through WAPI and did not return successful confirmations.
- Weber/Fober contact remains blocked because no parent email or phone was found in the signup, payment intake, payment log, or Green Invoice webhook log.
