# Rabbi Scheller Drive / Social Ingestion / Login Brief

## Status

- Live Operations task: #506, `Set up Rabbi Scheller scoped Drive/social ingestion and send login last`.
- Operator priority: parents first; Rabbi Scheller login should be done last.
- Background setup completed and verified on 2026-06-12 at 16:16 +03:00.
- Do not send Rabbi Scheller login details until contact details and the login username are collected/stored.

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

- Rabbi Scheller provider record exists, but contact email, WhatsApp/contact phone, and scoped login username still need confirmation or generation.
- Send WhatsApp only after a valid Rabbi phone exists.
- WhatsApp message should ask for his email and include the Drive folder link for dropping videos.
- Login handoff stays held until the contact fields are collected.

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

1. Confirm or collect Rabbi Scheller email and WhatsApp/contact phone.
2. Confirm or generate the scoped provider login username.
3. Send the Drive folder link and instructions for video drop-off.
4. Send Rabbi Scheller login information last.

## Parent Work Already Prioritized

- Parent portal/student emails were sent first where contact data existed.
- WhatsApp send attempts timed out through WAPI and did not return successful confirmations.
- Weber/Fober contact remains blocked because no parent email or phone was found in the signup, payment intake, payment log, or Green Invoice webhook log.
