# Next Session

Open terminal blocker:

- `REQ-20260626-126` / `DEC-20260626-101`

Latest addendum proof:

- `REQ-20260626-127` is Done for GitHub issue #41 comment `4808518537`.
- `01 Transcript Library` exists, jobs #65-#70 exist, no docs were created
  since `2026-06-25T00:00:00Z`, and job #83 is absent from the Drive
  transcript library.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-READONLY-AUDIT.md`

Completed targeted approval:

- `REQ-20260626-128` is Done for `RAW-20260626-007`.
- The approved command created the private Drive transcript doc for #83 and
  verified readback.
- Sanitized proof:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-JOB-83-SYNC.md`

Completed content-card/topic-filter repair:

- `REQ-20260626-129` and `REQ-20260626-130` are Done for `RAW-20260626-008`.
- `REQ-20260626-131`, `REQ-20260626-132`, and `REQ-20260626-133` are Done.
- PR #45, PR #46, and PR #47 are merged.
- Railway deployment `fd93be96-8bec-4c06-b42f-c53d177eab40` reached `SUCCESS`.
- Live content-card readback passed with 81 jobs, 29 digest cards, all 10
  `Needs parse` jobs, job #83's clean generated title, and no raw transcript
  text in `digest_card` payloads.
- Audit covers all 29 digest recordings.
- Operations Content cards show clean generated titles, summary, main points,
  categories, parse status, digest status, routing status, topic status, and
  next action.
- The topic filter uses normalized multi-topic digest/category keys and no raw
  transcript-body topic search.
- Issue #41 remains open.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CONTENT-CARD-TOPIC-FILTER-AUDIT.md`

Student question/score apply status:

- Current verdict: question matching is unblocked in dry-run, but production
  apply is not approved or implemented.
- 10 jobs need parser/reparse review: `71, 59, 58, 57, 56, 31, 30, 26, 25,
  21`.
- The class-question broadcast rule from `RAW-20260628-003` is now captured:
  unmatched/ambiguous question candidates route as class questions for every
  active student, not as personal questions.
- Refreshed dry-run evidence: 917 future `bna_accountability_events` writes,
  including 912 class-question broadcast inserts, 5 matched student-question
  inserts, and 2 existing rows skipped.
- Blocking ambiguities: 0.
- Score/progress has 0 safe row-level apply rows.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-BACKLOG-QUESTION-SCORE-REPAIR-PLAN.md`
  and
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/STUDENT-QUESTION-SCORE-APPROVAL-PACKET.md`;
  class-question dry-run evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CLASS-QUESTION-BROADCAST-DRY-RUN.md`.

PR #49 catch-up package closeout:

- `REQ-20260628-144` through `REQ-20260628-151` are Done for the safe
  no-write catch-up package.
- Branch:
  `codex/issue41-class-question-fallback-20260628`
- Commit:
  `2a86311f87d3a6d8ffa20fbd7397d25d16a33442`
- PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49`
- PR comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49#issuecomment-4826029011`
- Issue #41 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4826029041`
- Added evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/BACKLOG-CATCHUP-CENSUS.md`,
  `SCORE-PROGRESS-CATCHUP-PLAN.md`, `TASK-ACTION-CATCHUP-PLAN.md`,
  `RESEARCH-CONTENT-CATCHUP-PLAN.md`, and `APPLY-LANE-DESIGN.md`.
- Verification passed: privacy-safe digest export, content-card topic audit,
  46 focused tests, active run validation/next/status, secrets audit,
  JSON/JSONL parse, added-line privacy scan, and `git diff --check`.
- Issue #41 remains open. Production parser/question/task/score/progress
  writes remain blocked by `DEC-20260626-101`.

Private reparse dry-run approval:

- `RAW-20260628-005` approved a no-write private reparse/canonical-write
  dry-run for exactly jobs `21, 25, 26, 30, 31, 56, 57, 58, 59, 71`.
- `REQ-20260628-152` through `REQ-20260628-156` are Done for the no-write
  dry-run closeout.
- Commit `34e29b60` was pushed to PR #49. PR #49 remains draft, and Issue #41
  remains open.
- PR comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49#issuecomment-4826132567`.
- Issue #41 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4826133334`.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.md`.
- Dry-run summary: 10/10 jobs inspected, 0 missing, 10 private transcript
  sources read, 261 student-name mentions, 1,285 question candidates, 36
  personal-question candidates, 1,249 class-question broadcast candidates, 0
  blocked-review candidates, 119 internal task candidates, 1 score/progress
  row, and 55 score/progress no-op rows.
- Evidence is sanitized: raw transcript bodies false, raw Drive URLs/IDs false.
- Production apply remains blocked by `DEC-20260626-101`; PR #49 should remain
  draft unless production apply is separately approved and implemented.

Production apply preflight:

- `RAW-20260628-006` approved implementation of the guarded apply lane and
  final no-write preflight only. It did not approve production mutation.
- `REQ-20260628-157` is Done for the no-write production apply preflight.
- Commit `f48a9094` was pushed to PR #49.
- PR #49 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49#issuecomment-4826235797`.
- Issue #41 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4826236603`.
- PR #49 checked as open, draft, clean, and mergeable. Issue #41 checked as
  open.
- Remote private-reparse evidence is readable and non-empty on the PR branch:
  markdown `1,454,766` bytes and JSON `11,207,578` bytes.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRODUCTION-APPLY-PREFLIGHT.md`,
  `PRODUCTION-APPLY-PREFLIGHT.json`,
  `PRODUCTION-APPLY-SNAPSHOT-PLAN.md`,
  `PRODUCTION-APPLY-ROLLBACK-PLAN.md`,
  `PRODUCTION-APPLY-BATCH-PLAN.md`, and
  `PRODUCTION-APPLY-READBACK-PLAN.md`.
- Preflight result: controls passed, 0 blocking refusal checks, and
  `production_apply_command_may_be_run_now=false` because final owner approval
  is still required.
- Exact later-apply batch counts printed by the preflight: 36 personal-question
  rows, 9,992 class-question broadcast rows from 1,249 class-question
  candidates, 1 score/progress row, 0 production task rows, and 119 internal
  task candidates left internal.
- Snapshot path:
  `C:\Users\User\BNA-Keyholder\issue41-production-apply\snapshot-20260628-jobs-21-25-26-30-31-56-57-58-59-71.jsonl`.
- Rollback path:
  `C:\Users\User\BNA-Keyholder\issue41-production-apply\rollback-20260628-jobs-21-25-26-30-31-56-57-58-59-71.sql`.
- Actual production apply remains blocked by `DEC-20260626-101`.

ChatGPT/repo transcript access status:

- Repo-safe digest memory is available at
  `content-memory/transcript-digests/manifest.json`: 29 recordings, raw
  transcript bodies false.
- Full raw transcripts remain private in Drive/app storage. `01 Transcript
  Library` was last verified at 47 docs, and job #83 readback was 9683 chars.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CHATGPT-TRANSCRIPT-ACCESS-READINESS.md`.

Exact next safe command:

```powershell
npm run bna:run:next
```

Rabbi Drive folder structure batch:

- `RAW-20260628-007` approved targeted Drive folder create/reuse under exact
  parent `04 Content and Media Intake` only.
- `REQ-20260628-158`, `REQ-20260628-159`, and `REQ-20260628-160` are Done.
- Approved command run:
  `node scripts/audit-one-time-rabbi-drive-folders.mjs --write` with the local
  Google OAuth client/token path environment variables.
- Drive result: parent confirmed; 3 folders created; 4 folders reused.
- Created:
  `04.05 Upload Here - Slideshows and Source Materials`,
  `04.20 Source Material Review`, and `04.99 Needs Shloimie Decision`.
- Reused semantic aliases:
  `04.00 Upload Here - Rabbi Video Drops` for
  `04.00 Upload Here - Videos and Audio for Transcription`,
  `04.30 Social Output Drafts - Platform Review` for the social/newsletter
  output drafts lane, and `04.90 Approved and Posted Social Outputs` for the
  approved outputs lane.
- Reused exact:
  `04.10 Ingestion Queue - Transcribe and Parse`.
- Old PowerPoint status: found in parent. Two `.pptx` files were visible in
  the parent listing and classified as `slideshow_reference` /
  `source_material`, `eligible_for_transcription=false`,
  `no_transcription_required=true`, and `index_only_until_review=true`.
- Rabbi video/audio link:
  `https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t`.
- Rabbi slides/source-material link:
  `https://drive.google.com/drive/folders/15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp`.
- Super-admin UI now renders all folder links with open/copy controls;
  Rabbi-facing provider UI renders only the two approved drop-off links.
- Evidence:
  `ops/one-time-mishnah/drive-ingestion-audit/2026-06-28-rabbi-folder-structure-audit.md`,
  `2026-06-28-rabbi-folder-creation-log.md`, and
  `2026-06-28-rabbi-ui-drive-links-audit.md`.
- Verification passed: JS syntax checks, 55 focused tests,
  `npm run bna:run:validate`, `npm run bna:run:next`,
  `npm run bna:run:status`, `npm run secrets:audit`, JSON/JSONL parse,
  added-line privacy scan, and `git diff --check`.
- Local server smoke was blocked because this worktree has no `DATABASE_URL`;
  no credentials were copied into the repo/worktree.
- `REQ-20260628-161` is Done locally; GitHub push/comment closeout follows in
  the same Codex turn.
- Issue #41 remains open; production apply remains blocked by
  `DEC-20260626-101`.

Rabbi two-folder drop-off email notifier:

- `RAW-20260628-008` captured Shloimie's request to make the two Rabbi-facing
  Drive folders the main workflow and email the operator automatically on new
  uploads.
- `REQ-20260628-162` is Done locally.
- The video/audio folder is now titled
  `04.00 Upload Here - Videos and Audio for Transcription`.
- The slides/source-materials folder remains
  `04.05 Upload Here - Slideshows and Source Materials`.
- Watched folders:
  - videos/audio:
    `https://drive.google.com/drive/folders/1CiZImvpk8HjLDF0B5k9XyCuIt0p2tx8t`
  - slides/source materials:
    `https://drive.google.com/drive/folders/15FF6m32bEIWbXQSdTtqPw4yu_QIVvCPp`
- Added notifier helper, CLI, local runner scripts, package scripts, tests,
  and repo-safe evidence.
- Local Windows scheduled task `BNA One Time Drive Dropoff Email` is enabled
  every 5 minutes and currently points at this PR worktree.
- Task Scheduler readback: ready, enabled, last result `0`.
- Gmail setup-test message sent successfully; baseline marked 0 existing files
  in the watched folders, so no old-file notification spam was sent.
- The notifier prefers original downloadable files such as `.pptx`, `.mp4`,
  and `.mov`, and suppresses same-base converted Google Slides notifications
  when the original PowerPoint exists.
- Evidence:
  `ops/one-time-mishnah/drive-ingestion-audit/2026-06-28-rabbi-dropoff-notifier.md`.
- Verification passed: notifier syntax checks, 18 focused tests,
  `npm run bna:run:validate`, `npm run bna:run:next`,
  `npm run bna:run:status`, `npm run secrets:audit`, JSON parse,
  added-line privacy scan, `git diff --check`, and scheduler readback.
- Commit `65ae09b5` was pushed to PR #49.
- PR #49 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49#issuecomment-4826920837`.
- Issue #41 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4826921670`.
- Issue #41 remains open; production apply remains blocked by
  `DEC-20260626-101`.
- After merge, re-register the scheduled task from the canonical checkout if
  this PR worktree is removed:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\register-one-time-drive-dropoff-notifier.ps1 -Recipient sdratler@gmail.com -EveryMinutes 5
```

Owner approval required before any of these commands/actions:

- `npm run content:export-transcripts -- --include-raw-transcript`
- `npm run content:sync-drive-library` without `--dry-run`
  except the already-completed `--no-ai --verify --job-id 83` run
- any production reparse/canonical write
- any worker retry
- any paid retranscription
- any Drive create/update/delete/move
- `APPLY_GUARDED_CLASS_BACKFILL`
- any `--apply` run for student questions, production tasks, scores, or
  progress

If Shloimie approves a next step, create a new requirement or update
`REQ-20260626-126` with the exact approved action, owner, consequences, and
verification plan before running it. The only currently documented optional
next step is owner review of the 917-row class-question dry-run plan. Any
production apply path requires separate exact approval, snapshot/rollback
proof, and an implementation path because the current apply lane refuses
mutation by design.
