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
