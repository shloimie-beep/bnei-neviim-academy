# Ramble Intake - 2026-06-18 - telegram-bot-stuck-google-drive-intake

## Raw intake

The operator asked Codex to inspect the last couple days of Telegram bot
conversation, identify work that got stuck, fix what can be fixed, explain what
requires operator action, diagnose why the bot reports Google authorization as
bad, and explain why the Telegram intake folder is not working.

Follow-up: the operator corrected that BNA is in Beit Shemesh, Israel, and
asked why the Telegram bot did not answer the weekly Erev Shabbos / Parsha /
WhatsApp request from the Drive recordings. The operator also asked Codex to
make sure the last week of recordings placed in Drive are parsed.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260618-003 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-18-telegram-bot-stuck-google-drive-intake.md |

Additional raw record:

| Field | Value |
|---|---|
| Raw ID | RAW-20260618-005 |
| Source | codex_chat |
| Parse status | implemented |
| Requirement register | tasks-pending/2026-06-18-telegram-bot-stuck-google-drive-intake.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | |
| Goal tool used | no |
| GPT output contract | tasks-pending/_template-goal-mode-correction-output.md |
| Execution directive | Register first, then fix safe local/repo issues and document external blockers. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260618-201 through REQ-20260618-204 |

## Parsed requirements

| ID | Requirement | Source quote | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|---|
| REQ-20260618-201 | Inspect recent Telegram bot conversation and capture/job evidence from the last couple days. | "Check out the last couple days of Telegram bot conversation." | Summarize stuck requests with source evidence and current task/job status. | Telegram bridge, bot captures, agent lifecycle, local/live logs | Local/log/database inspection; no private raw message bodies in final unless needed and safe. | Done |
| REQ-20260618-202 | Diagnose and fix safe causes of "Google authorization isn't good." | "Why? What happened to my authorization? What's wrong with it?" | Explain whether OAuth token/config/scopes/test-user state is missing, expired, revoked, mismatched, or intentionally disabled; patch local handling if needed. | Google OAuth, Drive/Calendar/Classroom readiness, Telegram responses | Code inspection plus diagnostics/smoke where safe; no Google writes without approval. | Done |
| REQ-20260618-203 | Diagnose and fix safe causes of Telegram intake-folder failure. | "why isn't my intake folder working in my Telegram bot?" | Identify Drive folder/env/config/credential failure and repair safe local routing or produce precise operator next step. | Telegram media/document intake, Drive intake folder, content-job creation | Local code tests, safe dry-run/smoke, no live Drive writes without approval. | Done |
| REQ-20260618-204 | Unstick actionable bot-request work and record remaining operator-fixable blockers. | "fix whatever you can fix and whatever I can fix" | Implement safe repo fixes, update task/job evidence, and produce an operator-facing list of remaining account/access actions. | Bot routing, agent jobs, TASKS/ledger/changelog | Targeted tests and status records; deploy/live proof only if explicitly approved. | Done |
| REQ-20260618-301 | Correct BNA calendar/location assumptions to Beit Shemesh, Israel. | "we're located in Israel, Beit Shemesh, Israel" | Future Parsha/Erev Shabbos/zmanim/school-context assumptions use Israel unless the operator explicitly asks for Diaspora. | Memory, Telegram weekly report prompt | `MEMORY.md` inspection and bridge prompt inspection. | Done |
| REQ-20260618-302 | Diagnose why the bot did not produce the requested weekly Erev Shabbos / Parsha / WhatsApp message. | "check why the Telegram bot didn't do this" | Root cause is identified and patched so natural Erev Shabbos/Parsha/WhatsApp wording routes to weekly report generation. | Telegram bridge weekly report detector | Targeted detector regression test. | Done |
| REQ-20260618-303 | Verify the last week of Drive recordings are parsed. | "he was supposed to just give me the last week of recordings. Make sure they're parsed. I put them in the drive folder." | Recent Drive recordings from the last week have transcript and parse payload/status evidence. | Drive audit, live content jobs | Drive audit plus live content-job readback. | Done |
| REQ-20260618-304 | Deploy and live-smoke the Telegram worker fix. | "Telegram bot didn't do this" | Hosted worker runs the corrected bridge, uses the Railway process dispatcher, and reports healthy. | Railway academy Telegram worker | Worker deploy/status/log/status API/webhook smoke. | Done |

## Parsed tasks

| ID | Task | Owner | Lane | Source quote | Done definition | Status |
|---|---|---|---|---|---|---|
| TASK-20260618-201 | Audit recent Telegram bot requests and agent job state | Codex | Agent lifecycle | "some stuff that I wanted to do that kind of got stuck" | Recent bot captures/jobs are inspected and stuck items are listed with fix/blocker status. | Done |
| TASK-20260618-202 | Repair safe Google/Drive intake configuration or code defects | Codex | Integrations | "the authorization for Google isn't good" / "intake folder" | Safe local fixes are implemented and verified, or external account blockers are documented with exact next actions. | Done |
| TASK-20260618-301 | Patch weekly report intent for Erev Shabbos / Parsha / WhatsApp language | Codex | Telegram/content | "Erev/Arab Shabbos message for this week's Parsha" | Detector routes the operator's natural wording to weekly report generation and has regression coverage. | Done |
| TASK-20260618-302 | Sync content-job visible parsed stage after successful mixed parse | Codex | Drive/content jobs | "Make sure they're parsed" | Successful auto mixed-recording parses patch the visible `drive_stage` to `04 Parsed`. | Done |

## Decisions

| ID | Decision | Impact | Where stored | Status |
|---|---|---|---|---|
| DEC-20260618-201 | Whether to deploy/restart the hosted academy Telegram worker after adding Google Drive reference variables. | Needed because local OAuth worked, but the hosted worker was missing Google variables and the repo fix was not deployed. | This register and final response | Superseded: Codex added worker reference variables, deployed a slim worker bundle, and live-smoked Drive intake. |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260618-201 | Which Telegram chat(s) or bot persona should be treated as in scope if multiple recent bot logs exist? | Avoids over-reading unrelated bot/test traffic. | No; default to academy Telegram worker and recent BNA bot captures. | Closed: academy Telegram worker and BNA bot captures inspected |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260618-201 | Telegram bot stuck-work audits should inspect bot captures, agent jobs, Google/Drive readiness, and intake-folder routing before asking the operator to re-explain. | No | This is already covered by existing Telegram and agent lifecycle rules. |

## Implementation map

| ID | Files/routes/components | Plan | Verification |
|---|---|---|---|
| REQ-20260618-201..204 | `scripts/telegram-kimi-bridge.mjs`, `server.js`, Google/Drive scripts, bot capture/job tables, recent ops smokes/logs | Inspect recent evidence, diagnose root causes, patch safe issues, test targeted paths, update evidence. | Targeted node checks/tests/smokes; ledger/changelog/register update. |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260618-201 | Done | Live DB read showed 58 agent jobs since 2026-06-16 and all were `completed`; there were no active/bad agent jobs since 2026-06-16. Recent Telegram-created jobs were task/job pairs 1078/232 and 1079/233, both completed. Recent raw intake showed Telegram rows RAW-20260617-018 through RAW-20260617-020 and Drive rows RAW-20260617-006 through RAW-20260617-013. | Register/memory/ledger only | Read-only live DB diagnostics; `npm run agent:fleet:status` showed no ready/active Codex work; no private message body printed in final. | None for queue state. |
| REQ-20260618-202 | Done | Root cause found: local Google OAuth was valid, but the hosted `academy-telegram-worker` did not have the Google Drive env references and the bridge only knew how to load local `.secrets`. Codex added env-based Google OAuth/pipeline loading, added the missing Railway worker reference variables, deployed the worker, and verified the live heartbeat. Current worker deployment: `069cff7b-4470-4896-9aad-db5575df8efe`; prior successful pickup deploy: `091a8541-ceb4-4ff4-80b9-c63f446a8e88`. | `scripts/telegram-kimi-bridge.mjs`, `ops/academy-telegram-worker.md`, `docs/integrations/telegram-bridge.md`, `tests/telegram-runtime-status.test.js` | `node --check scripts/telegram-kimi-bridge.mjs`; `node --check server.js`; `node --check scripts/railway-start.mjs`; focused Telegram tests; full `npm test` passed 781/781; `npm run railway:doctor`; worker heartbeat showed `telegram-academy-bridge` running; Telegram `getWebhookInfo` had no webhook URL and zero pending updates. | None for Google auth/intake. Keep worker Google vars as Railway references; do not paste raw secret values into repo/chat. |
| REQ-20260618-203 | Done | Hosted worker live-smoke proved Drive Raw Media Intake works: the worker picked up `20260618_154814.mp4`, `Voice 260618_095948.m4a`, and `Voice 260618_120040.m4a`; Raw Media Intake is empty in `ops/drive-audits/2026-06-18T14-47-52-309Z-google-drive-audit.md`; all three files are visible under `03 Transcribed`/the shared processed-media folder. | `scripts/telegram-kimi-bridge.mjs`, `ops/academy-telegram-worker.md`, `docs/integrations/telegram-bridge.md`, `tests/telegram-runtime-status.test.js`, `ops/drive-audits/2026-06-18T14-47-52-309Z-google-drive-audit.md` | Live Drive audit signed in as `office@bneineviimacademy.org`; worker logs during deploy showed Drive auto-watch picked up the newest file; live DB readback found content jobs `#72`, `#73`, and `#74` created from the Drive file IDs. | None for intake-folder pickup. Future stuck files can be repaired by `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job <job_ids>`. |
| REQ-20260618-204 | Done | Stalled content jobs `#72`, `#73`, and `#74` were repaired without re-uploading files. Added targeted `reprocess-drive-job`/`repair-drive-content-job` CLI support, re-downloaded the Drive files, transcribed via OpenAI chunks, patched the existing jobs, and ran the mixed-recording parser. Final DB readback: `#72` transcript 5,505 chars, counts tasks 6 / accountability 28 / class notes 9; `#73` transcript 32,048 chars, counts tasks 5 / accountability 204 / class notes 88; `#74` transcript 33,459 chars, counts tasks 25 / accountability 115 / class notes 11. All three jobs show `drive_stage='04 Parsed'`. | `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js`, this register, `memory/2026-06-18.md`, `ops/agent-task-ledger.jsonl`, `ops/agent-changelog.md`, live content jobs `#72`-`#74` | `node --check scripts/telegram-kimi-bridge.mjs`; `node --test tests/telegram-runtime-status.test.js tests/telegram-media-routing.test.js` passed 18/18; `npm run openai:diagnose` PASS with report `ops/qa-runs/2026-06-18T14-47-37-854Z-openai-diagnostics.md`; DB readback verified transcripts, parse counts, and `04 Parsed`; Drive audit verified Raw Media Intake empty and files in processed media. | No remaining operator action for these three jobs. The repair command is local repo tooling; hosted normal intake was already deployed and live-smoked. |
| REQ-20260618-301 | Done | `MEMORY.md` now states BNA calendar, Parsha, Erev Shabbos, zmanim, and school-context assumptions default to Beit Shemesh / Israel unless the operator explicitly asks for a Diaspora audience. The weekly report prompt now says BNA is in Beit Shemesh, Israel and should use Israel school context and Israel Parsha assumptions. | `MEMORY.md`, `scripts/telegram-kimi-bridge.mjs` | File inspection; targeted weekly report prompt/test inspection. | None. |
| REQ-20260618-302 | Done | Root cause: `detectWeeklyReportIntent()` recognized generic weekly/report/newsletter language, but not the operator's natural "Erev/Arab Shabbos", "Parsha", "last video", "what we learned", and "WhatsApp message" wording. The detector now recognizes those phrases and has regression coverage for the exact request shape. | `scripts/telegram-kimi-bridge.mjs`, `tests/telegram-runtime-status.test.js` | `node --test tests/telegram-runtime-status.test.js tests/telegram-media-routing.test.js` passed 20/20; full `npm test` passed 783/783. | None. |
| REQ-20260618-303 | Done | Drive audit `ops/drive-audits/2026-06-18T15-06-16-741Z-google-drive-audit.md` shows recent recordings from June 14-18 in processed recordings / compatibility `03 Transcribed`. Live readback verified jobs `#64`, `#65`, `#67`, `#68`, `#69`, `#70`, `#72`, `#73`, and `#74` all at `04 Parsed` with transcripts and parse payload counts. | Drive audit, live content jobs, this register, `raw-input/RAW-20260618-005-telegram-weekly-recordings-parsed.md` | Drive audit; live content-job readback. | None for parsing status. |
| REQ-20260618-304 | Done | Corrected worker deployment `c57df355-a5e2-4cfd-a5fe-462356376c34` reached Railway `SUCCESS`, started through `scripts/railway-start.mjs`, and ran `npm run telegram:kimi` for `BNA_RAILWAY_PROCESS=telegram-academy`. Telegram status API reported healthy running bridge with no blockers, and Telegram `getWebhookInfo` showed no webhook URL and zero pending updates. | `package.json`, `scripts/railway-start.mjs`, worker deployment, this register | `node --check scripts/railway-start.mjs`; `npm run railway:doctor`; Railway worker status/log readback; Telegram status API; Telegram webhook info. | None. |
