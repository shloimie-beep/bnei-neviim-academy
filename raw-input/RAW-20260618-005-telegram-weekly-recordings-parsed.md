# RAW-20260618-005 - Telegram Weekly Recordings / Erev Shabbos Parsing Follow-Up

- Source channel: `codex_chat`
- Created at: `2026-06-18`
- Parse status: `implemented`
- Requirement register: `tasks-pending/2026-06-18-telegram-bot-stuck-google-drive-intake.md`
- Created requirement IDs: `REQ-20260618-301`, `REQ-20260618-302`, `REQ-20260618-303`, `REQ-20260618-304`
- Created task IDs: `TASK-20260618-301`, `TASK-20260618-302`
- Created decision IDs: none.
- Open question IDs: none.

## Raw wording

> You don't know by now, we're located in Israel, Beit Shemesh, Israel. And just check why the Telegram bot didn't do this, but he was supposed to just give me the last week of recordings. Make sure they're parsed. I put them in the drive folder.

## Parsed intent

- Correct the durable BNA location/calendar assumption to Beit Shemesh, Israel.
- Diagnose why the Telegram bot did not answer the weekly Erev Shabbos / Parsha / WhatsApp request.
- Check the Drive folder for the last week of recordings.
- Make sure the recordings are transcribed and parsed.
- Patch the bot path where safe so the same request is handled automatically next time.

## Diagnosis

- The earlier draft path incorrectly assumed a Diaspora Parsha audience. BNA's default is Beit Shemesh, Israel, so BNA Parsha/Erev Shabbos/zmanim assumptions should use Israel unless the operator explicitly asks for a Diaspora audience.
- The Telegram bridge had weekly report generation, but its detector did not recognize natural wording like "Erev Shabbos message," "this week's Parsha," "last little video message," "what we learned," and "WhatsApp message" as a weekly report request.
- The mixed-recording parser had parsed payloads for recent jobs, but some normal auto-parse paths did not sync the visible `drive_stage` to `04 Parsed`.

## Drive and content-job proof

Latest Drive audit:
`ops/drive-audits/2026-06-18T15-06-16-741Z-google-drive-audit.md`.

Recent Drive files visible under processed recordings / compatibility `03 Transcribed`:

- `Voice 260614_100124.m4a`
- `Voice 260615_095940.m4a`
- `Rabbi Sheller 2.m4a`
- `Voice 260616_095747.m4a`
- `Voice 260617_095813.m4a`
- `Voice 260618_095948.m4a`
- `Voice 260618_120040.m4a`
- `20260618_154814.mp4`

Live content-job readback after repair/stage sync:

- Job `#64`, "Teaching Responsibility and Peace Through Hebrew Language": `04 Parsed`, transcript 63,148 chars.
- Job `#65`, "Hebrew Learning and Dog Sitting Business Discussion": `04 Parsed`, transcript 77,245 chars.
- Job `#67`, "Rabbi Nachman on Torah Secrets and Messiah Timing": `04 Parsed`, transcript 55,731 chars.
- Job `#68`, "Bar Mitzvah Mitzvah and Entry into Eretz Israel": `04 Parsed`, transcript 64,715 chars.
- Job `#69`, "Family Accountability Meeting and Weekly Chores Discussion": `04 Parsed`, transcript 23,859 chars.
- Job `#70`, "AI Partnership Commitment and Exit Strategy Discussion": `04 Parsed`, transcript 24,519 chars.
- Job `#72`, "Drive 20260618_154814": `04 Parsed`, transcript 5,505 chars.
- Job `#73`, "Drive Voice 260618_095948": `04 Parsed`, transcript 32,048 chars.
- Job `#74`, "Drive Voice 260618_120040": `04 Parsed`, transcript 33,459 chars.

## Implementation closeout

- `MEMORY.md` now explicitly defaults BNA calendar, Parsha, Erev Shabbos, zmanim, and school-context assumptions to Beit Shemesh / Israel.
- `scripts/telegram-kimi-bridge.mjs` now treats Erev Shabbos / Shabbos / Parsha / WhatsApp weekly-learning language as weekly report intent.
- Weekly report generation now tells the model BNA is in Beit Shemesh, Israel and should use Israel school/Parsha assumptions unless the operator says otherwise.
- Weekly report generation now has a WhatsApp-specific instruction for Erev Shabbos/Shabbos/Parsha requests: latest video summary first when requested, then what the boys learned, then actual class questions.
- Successful auto mixed-recording parses now sync the visible content job stage to `04 Parsed`.
- The hosted academy Telegram worker was redeployed with the Railway process dispatcher and verified healthy.

## Verification

- PASS `node --check scripts/telegram-kimi-bridge.mjs`.
- PASS `node --check scripts/railway-start.mjs`.
- PASS `node --test tests/telegram-runtime-status.test.js tests/telegram-media-routing.test.js` 20/20.
- PASS `npm test` 783/783.
- PASS `npm run railway:doctor`.
- PASS hosted worker deployment `c57df355-a5e2-4cfd-a5fe-462356376c34` reached `SUCCESS` and started `npm run telegram:kimi` through `scripts/railway-start.mjs`.
- PASS Telegram status API reported `bridge_runtime_status=running`, `bridge_runtime_stale=false`, and no blockers.
- PASS Telegram `getWebhookInfo` had no webhook URL and zero pending updates.

## Guardrails

- No WhatsApp message was sent.
- No Telegram message was sent.
- No social post was published.
- No payment, DNS, account grant, Drive permission change, or raw secret write was performed.
