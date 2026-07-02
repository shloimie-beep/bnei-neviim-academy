# Ramble Intake - 2026-06-23 - Drive Class Intake Parser Stuck

## Raw intake

> I need you to find out what's happening with my drive, my intake. There's a whole bunch of classes that I uploaded, and the score for the kids isn't getting updated. The kids' questions aren't getting updated. It's not getting parsed and updating the classes with the kids' profiles. Can you figure out what's going on? What happened to all these classes? Why they're not getting parsed and put into the system?

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260623-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-06-23-drive-class-intake-parser-stuck.md |

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | no |
| Active goal objective | n/a |
| Goal tool used | no |
| Execution directive | Diagnose immediately, repair safe local parser regression, record production blockers. |
| Terminal statuses required | Done / Blocked / Needs operator decision |
| Deploy/live-smoke required for app-visible work | yes |
| Next requirement IDs to work | REQ-20260623-003 after operator authorizes live key rotation/deploy/reprocess. |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260623-001 | Diagnose Drive class intake and identify where the uploaded classes stopped. | RAW-20260623-001 | BNA / school intake | Codex | Investigation | High | 1 | Drive/API credentials available | Drive audit, live content-job readback, parser route inspection, and evidence summary show whether files, transcripts, parses, review items, and score rows exist. | server.js, scripts/telegram-kimi-bridge.mjs | No | Done |
| REQ-20260623-002 | Restore scoring-aware mixed-recording progress persistence for content-job parsing. | RAW-20260623-001 | BNA / school intake | Codex | Parser repair | High | 1 | REQ-20260623-001 | Content-job parse route preserves canonical intake filing and also persists progress rows through the existing mixed-recording persistence path; focused tests pass. | server.js, tests/telegram-media-routing.test.js | No, local repair only; production activation is REQ-20260623-003 | Done |
| REQ-20260623-003 | Fix the live Railway transcription key, deploy the parser repair, and reprocess stalled class jobs 75-79. | RAW-20260623-001 | BNA / Railway production | Shloimie + Codex | Production activation | Critical | 2 | Operator authorization to update Railway key from keyholder and deploy/reprocess | Railway web/worker `OPENAI_API_KEY` accepts transcription calls, patched app is deployed, jobs 75-79 generate transcripts, mixed parses, class/profile/question updates, and live smoke proof. | Railway env, server.js, Telegram/Drive reprocess commands | Yes | Done |
| REQ-20260623-004 | Decide whether to backfill or review older already-parsed jobs whose score/progress rows were missing or low-confidence. | RAW-20260623-001 | BNA / school intake | Shloimie + Codex | Backfill/review | High | 3 | REQ-20260623-003, guarded progress-only backfill implementation | Existing jobs 64-74 and open intake review items are either safely backfilled, resolved, or explicitly left for manual review without duplicate student records. | server.js, intake review APIs, production database | Yes | Blocked |

## Parsed tasks

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|---|
| TASK-20260623-001 | drive-class-intake-transcription-key | Authorize live OpenAI key rotation and class job reprocessing. | Shloimie | BNA / Railway production | RAW-20260623-001 | REQ-20260623-003 | Permission received; key rotation, deploy, live smoke, and jobs 75-79 reprocess completed. | Done / Activity | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|---|
| DEC-20260623-001 | Rotate/update Railway OpenAI transcription key and reprocess stalled Drive class jobs. | Explicit approval to copy the working keyholder key into Railway and reprocess production jobs. | Shloimie | Approve updating Railway web and worker `OPENAI_API_KEY` from the keyholder source that passed local diagnostics, then deploy and reprocess jobs 75-79 with parsing. | Pause production changes and leave jobs blocked; create a new OpenAI key manually and provide/update it outside Codex. | Without this, new class recordings will remain transcriptless and cannot update profiles/questions/scores. | Permission received; action completed. | REQ-20260623-003 | Decided / Done |
| DEC-20260623-002 | Backfill older parsed class jobs and open intake review items. | A safe progress-only backfill path is needed; force-reparsing older jobs would duplicate already-filed canonical notes/tasks/accountability rows. | Codex | Implement guarded progress-only backfill, then apply only high-confidence scoring/progress rows and leave ambiguous items in review. | Leave older jobs as-is; manually review every open item; force full reparse with higher duplicate risk. | Backfill can recover missed scores/questions, but must avoid duplicating existing notes/tasks. | Build/deploy a progress-only backfill command or route before applying jobs 64/73 or retrying 65-68. | REQ-20260623-004 | Blocked |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260623-001 | Should backfill include only score/progress rows, or also unresolved student questions/profile facts from low-confidence parse review items? | This controls duplicate risk and whether ambiguous student items stay in manual review. | Blocks REQ-20260623-004 only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260623-001 | Drive class recordings must update student profiles, questions, class notes, and score/progress rows; a transcript-only or notes-only parse is incomplete. | no | This is already covered by source-of-truth intake/profile goals; keep this incident in the register unless the operator wants a stronger permanent watchdog goal. |

## Investigation notes

- `npm run drive:audit` confirmed the connected Drive account is `office@bneineviimacademy.org` and recent class media is visible.
- Raw Intake is currently empty, but files are in `10 Processing - Temporary` and `20 Processed Recordings - Source Media`.
- Live content-job readback found jobs 75-79 for recent files, with zero-length transcripts on the newest jobs.
- Job notes for stalled jobs show OpenAI transcription HTTP 401 `invalid_api_key` in live Railway app/worker environments.
- `npm run openai:diagnose` passed locally through the keyholder source, and after approval Railway web/worker `OPENAI_API_KEY` was updated to the same working fingerprint.
- Older jobs 64-74 reached parsed stages, but many progress counts were zero and many profile/question items stayed in review because of low confidence or ambiguous student matching.
- `parseMixedRecordingSource()` in `server.js` was using canonical intake filing without the richer score/progress persistence from `generateMixedRecordingParse()`/`persistMixedRecordingParse()`.

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260623-001 | Drive audit command, live content-job APIs, `scripts/telegram-kimi-bridge.mjs`, `server.js` | Inspect Drive visibility, content jobs, parse runs, accountability/progress APIs, and parser routes. | `npm run drive:audit`; live API readback; route/code inspection. | none | none | Not required |
| REQ-20260623-002 | `server.js`, `tests/telegram-media-routing.test.js` | Keep canonical intake parse, add scoring-aware progress parse, persist only progress arrays to avoid duplicate class/task filing, and merge counts. | `node --check server.js`; `node --test tests/telegram-media-routing.test.js tests/intake-parser-class-recording.test.js tests/intake-parser-student-questions.test.js`; `npm run watchdog:content`; `node --test tests/parent-student-portal-contract.test.js tests/final-register-surfaces-closeout.test.js`. | none | none | Not deployed |
| REQ-20260623-003 | Railway env, deployed server, Telegram/Drive reprocess commands | Update key, deploy, run live smoke, and reprocess jobs 75-79 after approval. | Railway web/worker key fingerprint confirmed; web deployment `88b20edb-272a-4880-a5da-c622564b74ab`; worker redeploy `80315718-7104-4bdd-a027-c563b6bd0703`; jobs 75-79 parsed. | none | none | Live smoke passed |
| REQ-20260623-004 | Intake review APIs, production database, parse/backfill commands | Produce a dry-run backfill report for older jobs; do not apply older backfill until progress-only persistence exists. | Dry-run report completed for jobs 64-74; jobs 65-68 timed out after 5 minutes; jobs 64 and 73 showed one possible daily Torah row each. | none | none | Blocked |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260623-001 | Done | `ops/drive-audits/2026-06-23T06-29-03-146Z-google-drive-audit.md`; `ops/drive-audits/2026-06-23T06-33-live-content-jobs-summary.md`; `ops/qa-runs/2026-06-23T06-32-54-117Z-openai-diagnostics.md` | raw/register/memory/ledger/changelog | Drive audit and live API inspection completed. | None for diagnosis. |
| REQ-20260623-002 | Done | `server.js`; `tests/telegram-media-routing.test.js`; `ops/watchdog-audits/2026-06-23T06-35-content-routing.md` | `server.js`, `tests/telegram-media-routing.test.js` | Syntax/tests/watchdog passed. | Production not deployed; covered by REQ-20260623-003. |
| REQ-20260623-003 | Done | `ops/drive-audits/2026-06-23T09-31-drive-class-intake-recovery.md`; `ops/live-smokes/2026-06-23T08-23-12-705Z-live-app-smoke.md`; `ops/qa-runs/2026-06-23T08-21-38-032Z-openai-diagnostics.md` | Railway envs, deployed bundle from clean temp worktree based on `a9528b2d`, `server.js` parser fix | Railway doctor, live app smoke, OpenAI diagnostics, live readback, content watchdog passed. | None for jobs 75-79. |
| REQ-20260623-004 | Blocked | `ops/drive-audits/2026-06-23T09-31-drive-class-intake-recovery.md` | none yet | Dry-run completed for jobs 64,69-74; 65-68 timed out after 5 minutes. | Needs guarded progress-only backfill implementation before applying older rows. |

## Continuation

Production recovery completed after operator approval:

1. Updated Railway web and worker `OPENAI_API_KEY` from the working keyholder source, without printing or committing the key.
2. Deployed the patched app bundle to web deployment `88b20edb-272a-4880-a5da-c622564b74ab`.
3. Redeployed the academy worker as `80315718-7104-4bdd-a027-c563b6bd0703`.
4. Live doctor/smoke checks passed.
5. Reprocessed jobs 75-79 with force + parse.
6. Produced a dry-run backfill report for jobs 64-74.

Next safe step:

1. Add a guarded progress-only backfill command/route.
2. Retry jobs 65-68 dry-run with a longer/split parser path.
3. Apply only high-confidence older progress rows, starting with jobs 64 and 73, without force-duplicating tasks/class notes.
