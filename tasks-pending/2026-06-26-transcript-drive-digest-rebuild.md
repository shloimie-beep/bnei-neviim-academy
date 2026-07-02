# Ramble Intake - 2026-06-26 - transcript-drive-digest-rebuild

## Raw intake

Raw wording is preserved at
`raw-input/RAW-20260626-004-transcript-drive-digest-rebuild-source.txt`.
The issue #41 Drive addendum is preserved at
`raw-input/RAW-20260626-006-issue-41-drive-transcript-library-addendum.md`.
The targeted owner approval for job #83 is preserved at
`raw-input/RAW-20260626-007-owner-approval-job-83-drive-sync.md`.

Shloimie wants the class/transcript/Drive intake workflow rebuilt so raw
transcript bodies stay in private Drive/app storage while GitHub receives
structured, useful, privacy-safe digests and categorized outputs.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260626-004 |
| Addendum raw ID | RAW-20260626-006 |
| Approval raw ID | RAW-20260626-007 |
| Source | Codex chat attachment; GitHub issue #41 comment `4808518537`; Codex chat owner approval |
| Parse status | implemented |
| Requirement register | `tasks-pending/2026-06-26-transcript-drive-digest-rebuild.md` |
| Execution run | `ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild` |

## Issue 41 addendum

GitHub issue #41 comment `4808518537` added a Drive-side note to verify that
`01 Transcript Library` exists, older transcript docs in the `#65`-`#70` range
exist, no transcript docs were created after `2026-06-25T00:00:00Z`, and
`content_job:83` still lacks a confirmed Drive transcript doc.

Local read-only verification confirmed the addendum:

- `01 Transcript Library` exists under `40 Content Library - Marketing`.
- Folder readback found 46 transcript docs.
- Docs created since `2026-06-25T00:00:00Z`: 0.
- Jobs #65-#70 exist in the transcript library.
- Job #83 is absent in the transcript library and remains a dry-run
  `would-create` doc.
- `npm run content:sync-drive-library -- --dry-run --no-ai` performed no
  Drive writes and planned #83 as create, #65-#70 as updates.

Evidence:
`ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-READONLY-AUDIT.md`
and `.json`.

## Job 83 targeted Drive sync approval

Shloimie approved exactly one non-dry-run Drive transcript-library sync for
content job #83:

```powershell
npm run content:sync-drive-library -- --no-ai --verify --job-id 83
```

Result:

- Real transcript jobs selected: 1.
- Created docs: 1.
- Updated docs: 0.
- AI breakdowns generated/planned: 0.
- Drive readback: #83, 9683 chars, ok.
- Post-sync read-only listing: #83 exists in `01 Transcript Library`; doc ID
  and link are recorded only as hashes.
- No raw transcript body was written to GitHub.
- No production DB mutation, class backfill, Drive source-file move/delete,
  paid retranscription, stale deletion, send, charge/access grant,
  credential/account/DNS change, article sync, index sync, or broad Drive sync
  was performed.

Evidence:
`ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-JOB-83-SYNC.md`
and `.json`.

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Rebuild BNA class/transcript/Drive intake around Drive-first raw transcript storage and privacy-safe GitHub digest memory. |
| Goal tool used | yes |
| GPT output contract | `tasks-pending/_template-goal-mode-correction-output.md` |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | no app-visible deployment in this dry-run/digest batch |
| Next requirement IDs to work | Owner approval only: `DEC-20260626-101` |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260626-116 | Create canonical goal-mode source/run/register | RAW-20260626-004 | bna/class-drive-intake | Codex | run_control | High | A | none | Raw source, active execution run, and register exist | `raw-input/RAW-20260626-004-transcript-drive-digest-rebuild.md`; `ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild/*`; this file | no | Done |
| REQ-20260626-117 | Audit current evidence and keep prior two-week counts grounded | RAW-20260626-004, RAW-20260626-002 | bna/class-drive-intake | Codex | audit | High | A | REQ-20260626-116 | Existing audit artifacts inspected; status remains PARTIAL with 18 recordings, 29 jobs, 13 question rows, 24 raw export gaps, 10 repair candidates | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/*` | no | Done |
| REQ-20260626-118 | Document Drive-first raw storage and GitHub digest policy | RAW-20260626-004 | bna/content-memory | Codex | protocol | High | B | REQ-20260626-116 | Policy states raw bodies stay private and repo gets digests/manifests/categories/gaps | `docs/content-transcript-digest-policy.md`; `content-memory/README.md` | no | Done |
| REQ-20260626-119 | Build privacy-safe digest exporter and block unsafe default transcript export | RAW-20260626-004 | bna/content-memory | Codex | implementation | High | B | REQ-20260626-118 | Default digest export writes no raw transcript bodies; legacy raw exporter refuses default run; stale deletion requires explicit flag | `src/lib/bna/transcript-digest-export.js`; `scripts/export-content-digests.cjs`; `scripts/export-content-transcripts.mjs`; `package.json`; `tests/transcript-digest-export.test.js` | no | Done |
| REQ-20260626-120 | Build section classifier and section router | RAW-20260626-004 | bna/class-drive-intake | Codex | implementation | High | B | REQ-20260626-119 | Mixed recordings can classify into multiple lanes; private sections are review-only and raw text is excluded | `src/lib/bna/transcript-digest-export.js`; `tests/transcript-digest-export.test.js` | no | Done |
| REQ-20260626-121 | Generate privacy-safe transcript digest memory | RAW-20260626-004 | bna/content-memory | Codex | evidence | High | C | REQ-20260626-119, REQ-20260626-120 | `content-memory/transcript-digests/` has index, manifest, and per-recording digest/category/routing/candidate files for 29 recordings with no raw bodies | `content-memory/transcript-digests/*` | no | Done |
| REQ-20260626-122 | Produce sanitized transcript gap manifest | RAW-20260626-004 | bna/class-drive-intake | Codex | evidence | High | C | REQ-20260626-121 | `TRANSCRIPT-GAPS.md/json` include required gap fields without transcript bodies | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/TRANSCRIPT-GAPS.*` | no | Done |
| REQ-20260626-123 | Produce dry-run repair candidates manifest | RAW-20260626-004 | bna/class-drive-intake | Codex | evidence | High | C | REQ-20260626-121 | `REPAIR-CANDIDATES.md/json` include dry-run-only candidate IDs, target lanes, idempotency keys, rollback, privacy, and blocker | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/REPAIR-CANDIDATES.*` | no | Done |
| REQ-20260626-124 | Produce Drive raw transcript library dry-run plan | RAW-20260626-004 | bna/drive-content-library | Codex | evidence | High | C | REQ-20260626-121 | Dry-run plan lists docs that would be created/updated, missing parser/title/transcript states, private review tags, and marketing/class restrictions; no Drive write | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.*` | no | Done |
| REQ-20260626-125 | Verify digest/export privacy and determinism | RAW-20260626-004 | bna/class-drive-intake | Codex | verification | High | D | REQ-20260626-119..REQ-20260626-124 | Focused syntax/tests pass; digest privacy scan reports zero findings; raw exporter default is blocked | `tests/transcript-digest-export.test.js`; `tests/two-week-class-intake-audit.test.js` | no | Done |
| REQ-20260626-127 | Verify issue #41 Drive transcript-library addendum | RAW-20260626-006 | bna/drive-content-library | Codex | source_addendum_verification | High | D | REQ-20260626-124, REQ-20260626-125 | Addendum source preserved; read-only Drive folder listing verifies `01 Transcript Library`, older #65-#70 docs, no docs since `2026-06-25T00:00:00Z`, and missing #83 doc; no Drive write | `raw-input/RAW-20260626-006-issue-41-drive-transcript-library-addendum.md`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-READONLY-AUDIT.*` | no | Done |
| REQ-20260626-128 | Run approved private Drive transcript sync for content job #83 only | RAW-20260626-007 | bna/drive-content-library | Codex | approved_private_drive_write | High | F | REQ-20260626-127 | Exact approved command creates #83 private Drive transcript doc, verifies readback, records sanitized pointer, reruns digest export and read-only audit, and keeps all broader writes blocked | `raw-input/RAW-20260626-007-owner-approval-job-83-drive-sync.md`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-JOB-83-SYNC.*` | no | Done |
| REQ-20260626-126 | Owner approval gate for raw export, Drive writes, reparse/backfill, or production mutation | RAW-20260626-004, RAW-20260626-006, RAW-20260626-007 | bna/class-drive-intake | Shloimie | blocker | High | E | REQ-20260626-121..REQ-20260626-125, REQ-20260626-127, REQ-20260626-128 | One concise decision remains for any unsafe/raw/external write path beyond the completed #83 sync | `DEC-20260626-101` in this file and prior register | no | Needs operator decision |

## Parsed tasks

No new visible human task cards were created. This is agent lifecycle work.

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Next action | Visible lane | Status |
|---|---|---|---|---|---|---|---|---|
| TASK-20260626-004 | transcript-drive-digest-rebuild | Build repo-safe transcript digest/export plan | Codex | bna/class-drive-intake | RAW-20260626-004 | REQ-20260626-116..REQ-20260626-125 | Complete local digest/export plan and report owner approval gate | Agent Work | Done |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260626-101 | Choose any remaining transcript export/write path after #83 targeted sync | Whether to approve any raw transcript-body export, any further Drive doc writes beyond #83, production reparse/canonical writes, worker retry, broad Drive sync, or backfill | Shloimie | Keep raw/body export and all external writes blocked unless a new exact approval follows a dry-run plan | Approve another targeted private Drive doc write; approve local-only private raw export; approve production reparse/canonical repair; approve raw GitHub export with unsafe flag | Wrong approval can leak raw private transcript bodies or mutate class/student records prematurely | For any further write, reply with the exact approved action after a dry-run plan is recorded | REQ-20260626-126 and any future write/apply/export work | Needs operator decision |

## Open questions

| ID | Question | Why it matters | Blocking? | Status |
|---|---|---|---|---|
| Q-20260626-004 | Should Drive private transcript docs be created after owner review? | Determines whether dry-run plan becomes a Drive write run | Yes, for Drive writes only | Open |

## Durable memory candidates

| ID | Memory candidate | Promote to MEMORY.md? | Reason |
|---|---|---|---|
| MEM-20260626-004 | Full/raw class transcript bodies stay in private Drive/app storage; GitHub stores sanitized digests, manifests, indexes, categories, gaps, and repair plans by default. | yes | Stable privacy/product policy for all future class/transcript intake work |

## Implementation map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260626-116 | Raw/register/run files | Create source/register and active execution run | `npm run bna:run:init`; raw source copied to repo | none | none | not app-visible |
| REQ-20260626-118 | Policy docs | Document Drive-first and repo digest policy | Readback in files | none | none | not app-visible |
| REQ-20260626-119..125 | Digest exporter, classifier, artifacts, tests | Add safe exporter, block old default raw exporter, generate digest/gap/repair/Drive-plan artifacts | Syntax checks; focused tests; `npm run content:export-digests -- --privacy-scan` | none | none | not app-visible |
| REQ-20260626-127 | Issue #41 Drive addendum | Preserve addendum and run read-only Drive transcript-library verification | `npm run content:sync-drive-library -- --dry-run --no-ai`; read-only folder listing; JSON parse | none | none | not app-visible |
| REQ-20260626-128 | Approved #83 Drive transcript doc sync | Run exact approved command for job #83 only; record sanitized Drive pointer; rerun digest export and read-only audit | `npm run content:sync-drive-library -- --no-ai --verify --job-id 83`; `npm run content:export-digests -- --privacy-scan`; `npm run content:drive-intake-audit` | none | none | not app-visible |
| REQ-20260626-126 | Decision gate | Leave unsafe/export/write/apply actions blocked | Register and final answer | none | none | not app-visible |

## Final audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260626-116 | Done | Active run `ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild`; raw source copied | Raw/register/run files | `npm run bna:run:init` completed | none |
| REQ-20260626-117 | Done | `FINAL-VERDICT.md` and `AUDIT-SUMMARY.json` inspected | No new prior-audit mutation required | Prior artifact readback | Prior audit remains PARTIAL |
| REQ-20260626-118 | Done | `docs/content-transcript-digest-policy.md` | Policy docs | Manual readback | none |
| REQ-20260626-119 | Done | Safe exporter and guarded raw exporter | Code/package/test files | `node --check` and focused tests | raw export remains decision-gated by design |
| REQ-20260626-120 | Done | Classifier routes mixed recordings and private sections in tests | `src/lib/bna/transcript-digest-export.js` | `node --test tests/transcript-digest-export.test.js` | live/raw transcript in-memory classification not run in this no-raw batch |
| REQ-20260626-121 | Done | `content-memory/transcript-digests/manifest.json` reports 29 recordings and `raw_transcript_bodies_included=false` | Digest output tree | `npm run content:export-digests -- --privacy-scan` | none |
| REQ-20260626-122 | Done | `TRANSCRIPT-GAPS.md/json` | Audit output | JSON parse and privacy scan through exporter | none |
| REQ-20260626-123 | Done | `REPAIR-CANDIDATES.md/json` | Audit output | Determinism test | production mutation not authorized |
| REQ-20260626-124 | Done | `DRIVE-TRANSCRIPT-LIBRARY-DRY-RUN.md/json`; `DRIVE-TRANSCRIPT-LIBRARY-READONLY-AUDIT.md/json` | Audit output | Exporter generation; dry-run sync | Drive writes not authorized |
| REQ-20260626-125 | Done | Focused tests pass; privacy scan 0 findings | Tests and generated artifacts | Syntax checks; `node --test tests/transcript-digest-export.test.js`; `node --test tests/two-week-class-intake-audit.test.js`; `npm run content:export-digests -- --privacy-scan` | broader full suite not run |
| REQ-20260626-127 | Done | `RAW-20260626-006`; read-only Drive proof confirms folder exists, #65-#70 exist, no docs after `2026-06-25T00:00:00Z`, and #83 is absent | Raw/evidence files | `npm run content:sync-drive-library -- --dry-run --no-ai`; read-only Drive listing; JSON parse | none |
| REQ-20260626-128 | Done | `RAW-20260626-007`; #83 Drive doc created and read back; sanitized hash pointer recorded | Raw/evidence files | Approved sync command; read-only post-sync listing; digest privacy scan; read-only intake audit | broader sync still blocked |
| REQ-20260626-126 | Needs operator decision | `DEC-20260626-101` | Register only | Blocker documented | Owner must approve any unsafe/raw/external write path |

## 2026-06-28 continuation - Issue #41 parser/question/score/task/content backlog

Raw continuation: `RAW-20260628-006`.

Status: `PARTIAL` because production writes remain approval-gated by
`DEC-20260626-101`. All safe local/read-only/no-write work requested by the
packet is terminal.

New requirements added to the active run:

| ID | Result | Evidence | Status |
|---|---|---|---|
| REQ-20260628-024 | Registered packet and reactivated the existing transcript run instead of creating a duplicate. | `raw-input/RAW-20260628-006-issue-41-parser-question-score-task-content-backlog.md`; `ops/execution-runs/latest.json` | Done |
| REQ-20260628-025 | Refreshed read-only baseline, digest export, and content-card/readback evidence. Counts: 18 Drive recordings, 29 content jobs, 29 digest cards, 10 needs-parse cards, 0 raw transcript fields. | `AUDIT-SUMMARY.json`; `content-memory/transcript-digests/manifest.json`; `CONTENT-CARD-TOPIC-FILTER-AUDIT.md`; `LIVE-CONTENT-CARD-READBACK.md` | Done |
| REQ-20260628-026 | Generated no-write parser repair results for the ten repair candidates: `21, 25, 26, 30, 31, 56, 57, 58, 59, 71`. | `PARSER-REPAIR-RESULTS.md/json` | Done |
| REQ-20260628-027 | Reviewed all 13 student-question rows. 7 remain matched; 6 remain blocked because sanitized evidence does not prove student identity. | `STUDENT-QUESTION-MATCH-REVIEW.md/json` | Done |
| REQ-20260628-028 | Generated score/progress plan: `safe_to_apply=false`, `row_count=0`, no apply command. | `STUDENT-SCORE-PROGRESS-PLAN.md/json` | Done |
| REQ-20260628-029 | Generated task/research-card plan: 25 candidates, 0 ready to apply, 0 production rows created. | `TASK-RESEARCH-CARD-APPLY-PLAN.md/json` | Done |
| REQ-20260628-030 | Ran focused tests/validators/privacy scans and posted Issue #41 status. | `TEST-RESULTS.md`; issue comment `4827203453` | Done |

Student-match rows still blocked:

| Job | Question ref | Required human/private decision |
|---|---|---|
| 58 | `question:c516d14ee4e5d49f` | Review private source and choose student or mark not student-specific. |
| 58 | `question:1a8cf5034c4c839f` | Review private source and choose student or mark not student-specific. |
| 26 | `question:51aa618b95a7d29d` | Review private source and choose student or mark not student-specific. |
| 26 | `question:2158d47f6c0c2923` | Review private source and choose student or mark not student-specific. |
| 26 | `question:8f9c41ec6da4ca8c` | Review private source and choose student or mark not student-specific. |
| 25 | `question:e1d44fb96cef6915` | Review private source and choose student or mark not student-specific. |

Verification:

- `npm run content:drive-intake-audit` passed.
- `npm run content:export-digests -- --privacy-scan` passed with 0 findings.
- `npm run content:card-topic-audit` passed.
- `node scripts/class-drive-intake-reconcile.cjs backfill --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit` passed with no production writes.
- `node --test tests/transcript-digest-export.test.js tests/two-week-class-intake-audit.test.js tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js` passed 21/21.
- `npm run bna:run:validate`, `npm run bna:run:source-coverage`, `npm run bna:run:stale-evidence`, `npm run secrets:audit`, and `git diff --check` passed.
- Targeted generated-evidence privacy scan found no Drive URLs, Google Docs
  URLs, raw transcript payload fields, raw transcript markers, or
  secret-looking strings.

Exact next safe command:

```powershell
npm run bna:run:blockers
```

## 2026-06-29 continuation - owner decision on general class questions

Raw continuation: `RAW-20260629-001`.

Shloimie decided that questions which cannot be mapped to a specific student
should be kept as general class questions. The six previously blocked
student-question refs are now resolved in repo evidence as general class
questions, not student-specific rows:

- `58/question:c516d14ee4e5d49f`
- `58/question:1a8cf5034c4c839f`
- `26/question:51aa618b95a7d29d`
- `26/question:2158d47f6c0c2923`
- `26/question:8f9c41ec6da4ca8c`
- `25/question:e1d44fb96cef6915`

New evidence:

- `OWNER-DECISION-GENERAL-CLASS-QUESTIONS.md/json`
- `PRODUCTION-STUDENT-QUESTION-SCORE-APPLY-APPROVAL-PACKET.md/json`
- `TASK-RESEARCH-CARD-APPROVAL-PACKET.md/json`
- updated `STUDENT-QUESTION-MATCH-REVIEW.md/json`
- `tests/class-drive-intake-owner-decision-packet.test.js`

Current row state:

- 13 total question rows
- 7 student-specific matched rows
- 6 approved general class question rows
- 0 rows blocked for student-match review
- 0 safe score/progress rows
- 25 task/research candidates, 0 production rows created

Production writes were not run. The remaining blocker is narrower: there is no
existing guarded apply command with row-level before/after readback that can
safely write these class-level question decisions or task/research-card
candidates from sanitized refs only.

Hardening added after Shloimie's "debugger solid and flows" instruction:

- The packet generator now strips accidental raw question text from output.
- It fails loudly if any of the six approved refs is missing.
- It refuses `--apply`.
- Focused Issue #41 suite with the new regression test passed 24/24.

## 2026-06-29 continuation - Drive/Telegram attendance, score, and progress visibility

Raw continuation: `RAW-20260629-003`.

Shloimie asked whether Drive folder drops and a recent Telegram bot update are
being parsed for grades/scores, attendance, and student progress, and asked to
make last updated date, attendance record, and overall progress visible for
students.

New requirements added to the active run:

| ID | Result | Evidence | Status |
|---|---|---|---|
| REQ-20260629-002 | Audited Drive/class-recording and Telegram attendance/progress parsing. Telegram accountability parsing supports attendance/progress when student context is clear; Drive/class-recording parsing detects attendance/progress signals. | `DRIVE-ATTENDANCE-SCORE-PROGRESS-STATUS.md/json`; refreshed audit/digest/card outputs | Done |
| REQ-20260629-003 | Added and deployed read-only Operations visibility for last updated, attendance record/status, latest progress percent/date, latest progress note, and overall trip/Torah progress. | `server.js`; `public/operations.html`; focused tests; PR #50; `PR-50-MERGE-LIVE-READBACK.md/json` | Done |
| REQ-20260629-004 | Preserved the production write gate. No score/attendance/progress apply was run; safe score/progress rows remain 0 and exact apply command remains null. | `STUDENT-SCORE-PROGRESS-PLAN.md/json` | Done |

Verification:

- `node --check server.js`
- `node --test tests\operations-student-detail-scope.test.js tests\intake-parser-class-recording.test.js tests\telegram-media-routing.test.js` passed 22/22.
- `npm run content:drive-intake-audit` passed: 18 Drive recordings, 29 content jobs, 13 student-question rows.
- `npm run content:export-digests -- --privacy-scan` passed: 29 recordings, raw transcript bodies false, privacy findings 0.
- `npm run content:card-topic-audit` passed: 29 cards, 10 needs_parse, raw transcript fields 0, filter checks 8/8.
- `node scripts/class-drive-intake-reconcile.cjs backfill --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit` passed with no production writes and 0 safe score/progress rows.
- Clean app-visible PR #50 opened:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/50`.
- Clean PR branch verification passed:
  `node --check server.js`, focused tests 21/21, `git diff --check`,
  `npm run secrets:audit`, and local static `GET /operations.html` smoke with
  dummy non-secret startup env.
- Issue #41 attendance/progress status posted:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4829959028`.
- Issue #41 PR #50 follow-up posted:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4830072040`.
- PR #50 merged at `2026-06-29T07:44:22Z`; Railway production deployment
  `ebe7e05c-273f-4819-a1d2-7bdf78bec506` reached `SUCCESS` for merge commit
  `e3dad48257daea7fdf760aa9fccb1ad42f98ce9e`.
- Live readback passed: `/operations.html` returned HTTP 200 with
  `data-student-learning-status`, `latest_progress_percent`, and `Attendance
  Record`; `npm run app:smoke:operations-workspace-taxonomy` passed.
- Credentialed read-only `/api/bna/students` readback returned 8 active rows:
  6 with attendance percentages, 6 with latest progress percentages, 5 with
  average goal progress above 0, and latest learning/accountability update
  `2026-06-28T10:17:37.178Z`.

Current blocker:

- Production score/attendance/progress writes from Drive evidence still require
  exact row-level before/after evidence, rollback/readback, privacy review, and
  owner approval under `DEC-20260626-101`.
