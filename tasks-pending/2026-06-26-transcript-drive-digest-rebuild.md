# Ramble Intake - 2026-06-26 - transcript-drive-digest-rebuild

## Raw intake

Raw wording is preserved at
`raw-input/RAW-20260626-004-transcript-drive-digest-rebuild-source.txt`.
The issue #41 Drive addendum is preserved at
`raw-input/RAW-20260626-006-issue-41-drive-transcript-library-addendum.md`.
The targeted owner approval for job #83 is preserved at
`raw-input/RAW-20260626-007-owner-approval-job-83-drive-sync.md`.
The PR #45 content-card/topic-filter addendum is preserved at
`raw-input/RAW-20260626-008-pr45-content-card-topic-filter-addendum.md`.
The June 28 backlog/parser repair goal is preserved at
`raw-input/RAW-20260628-002-drive-backlog-parser-repair-goal.md`.
The June 28 class-question broadcast approval is preserved at
`raw-input/RAW-20260628-003-class-question-broadcast-approval.md`.

Shloimie wants the class/transcript/Drive intake workflow rebuilt so raw
transcript bodies stay in private Drive/app storage while GitHub receives
structured, useful, privacy-safe digests and categorized outputs.

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260626-004 |
| Addendum raw ID | RAW-20260626-006 |
| Approval raw ID | RAW-20260626-007 |
| Content-card addendum raw ID | RAW-20260626-008 |
| Parser/backlog repair goal raw ID | RAW-20260628-002 |
| Class-question broadcast raw ID | RAW-20260628-003 |
| Source | Codex chat attachment; GitHub issue #41 comment `4808518537`; Codex chat owner approval; GitHub PR #45 comment `4809202212`; Codex chat June 28 goal-mode request; Codex chat June 28 class-question broadcast rule |
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

## PR #45 content-card/topic-filter addendum

GitHub PR #45 comment `4809202212` added the next Issue #41 batch after the
#83 Drive evidence push. Issue #41 must remain open. The batch requires safe
Operations Content card and topic-filter repair with no Drive write, no
production mutation, no class backfill, and no raw transcript export.

Local implementation completed:

- Audited all 29 repo-safe digest recordings.
- Added a shared digest card view model and audit script.
- `/api/bna/content-jobs` now decorates rows with `digest_card` from tracked
  privacy-safe digest manifests.
- Operations Content cards now show clean generated title, summary, main
  points, categories, parse status, digest status, routing status, topic status,
  and next action.
- The topic filter now counts and matches normalized multi-topic digest/
  classification categories instead of a single inferred transcript-text bucket.
- Unparsed or incomplete records show explicit `Needs title`, `Needs parse`,
  `Needs digest`, `Needs routing`, and `Needs topic classification` states when
  applicable.

Evidence:
`ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CONTENT-CARD-TOPIC-FILTER-AUDIT.md`
and `.json`.

Audit result:
29 recordings audited; 29 generated clean titles; 10 `Needs parse`; 0 `Needs
routing`; 0 `Needs topic classification`; 29 multi-topic cards; raw transcript
bodies false.

## June 28 parser/backlog repair goal

Shloimie asked Codex to make the remaining Drive/parser backlog repair a goal
and work until finished. The requested outcome is that backlog, questions,
research/content cards, tasks, parse state, routing state, and kids'
scores/progress are filled from Drive-backed class transcript evidence.

Parsed requirement IDs:

- `REQ-20260628-134`: Register this goal-mode addendum.
- `REQ-20260628-135`: Make PR #45 mergeable and live-verify the Content
  card/topic-filter repair.
- `REQ-20260628-136`: Run a fresh read-only Drive/class/content backlog audit.
- `REQ-20260628-137`: Repair parser/backlog/research/task card tooling from
  safe Drive-backed digest/classification evidence.
- `REQ-20260628-138`: Build the exact dry-run student question and
  score/progress update plan.
- `REQ-20260628-139`: Keep production student/backlog writes and broad Drive
  writes approval-gated until an exact reviewed apply plan is approved.
- `REQ-20260628-140`: Close out with evidence, live proof where applicable,
  PR/Issue comments, and exact remaining blockers.

Guardrail: this goal does not authorize silent production DB mutation, broad
Drive sync/write, class backfill, raw transcript-body export, AI calls, sends,
charges/access grants, credential/account/DNS changes, or stale deletion.

June 28 execution update:

- PR #45 is merged; follow-up PR #46 is merged to include
  `content-memory/transcript-digests` in the Railway deploy bundle.
- Railway deployment `fd93be96-8bec-4c06-b42f-c53d177eab40` reached `SUCCESS`.
- Live readback confirms `/api/bna/content-jobs?project_key=all` returns 81
  jobs, 29 digest cards, all 10 `Needs parse` jobs, job #83's clean generated
  title, and no raw transcript text inside `digest_card` payloads.
- Fresh read-only audit rerun: 18 Drive recordings, 29 content jobs, 0 Drive
  orphans, 13 student question rows, final verdict `PARTIAL`.
- Privacy-safe digest export rerun: 29 recordings, raw transcript bodies false,
  privacy scan findings 0.
- Content-card audit rerun: 29 generated titles, 10 `Needs parse`, 0 `Needs
  digest`, 0 `Needs routing`, 0 `Needs topic classification`.
- Exact parser repair candidates: `71, 59, 58, 57, 56, 31, 30, 26, 25, 21`.
- Exact question rows needing human student-match review:
  `question:c516d14ee4e5d49f`, `question:1a8cf5034c4c839f`,
  `question:51aa618b95a7d29d`, `question:2158d47f6c0c2923`,
  `question:8f9c41ec6da4ca8c`, and `question:e1d44fb96cef6915`.
- Student scores/progress are not safe to update yet: the audit generated 0
  row-level score/progress apply rows.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-BACKLOG-QUESTION-SCORE-REPAIR-PLAN.md`
  and `.json`.
- Owner decision packet:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/STUDENT-QUESTION-SCORE-APPROVAL-PACKET.md`
  and `.json`.
- Verdict: no production apply command is currently safe. The recommended
  decision is to keep production student question/task/score/progress writes
  blocked; the only documented optional next step is a no-write dry-run planner
  approval.

Issue #41 status comment:
`https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4825192594`.

Remaining: keep `DEC-20260626-101` open for any production parser/question/task/
score/progress apply, broad Drive sync, raw export, AI call, class backfill, or
other unsafe write path. Do not run `--apply`; no production apply command is
safe yet.

## June 28 class-question broadcast rule

Shloimie clarified that questions which cannot be safely matched to one
student should be pushed to every student portal as class questions, not left
blocked for human student matching and not assigned as personal questions.

Parsed requirement IDs:

- `REQ-20260628-141`: Register the class-question broadcast owner rule.
- `REQ-20260628-142`: Update the guarded dry-run planner so unmatched or
  ambiguous question candidates become class-question broadcasts for all active
  students.
- `REQ-20260628-143`: Refresh sanitized dry-run evidence and keep production
  application blocked until an exact apply path is separately approved.

Execution result:

- Focused tests pass for matched student questions, unmatched questions,
  ambiguous names, `class_notes.questions`, and question-shaped
  `class_notes.discussions`.
- Refreshed 21-83 dry-run evidence reports `safe_to_apply=true` for the
  no-write row-level plan, 0 blocking ambiguities, and no production mutation.
- The former human-match blocker is resolved in dry-run by
  `class_question_broadcast` routing.
- The resulting dry-run is large: 917 future `bna_accountability_events`
  writes if a separate production apply path is approved; this includes 912
  class-question broadcast inserts, 5 matched student-question inserts, and 2
  existing rows skipped.
- Score/progress remains blocked: 0 row-level score/progress apply rows exist.

Evidence:

- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/BACKFILL-DRY-RUN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/BACKFILL-RECOMMENDATION.json`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CLASS-QUESTION-BROADCAST-DRY-RUN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CHATGPT-TRANSCRIPT-ACCESS-READINESS.md`

Remaining: production question/task/score/progress application remains blocked
by `DEC-20260626-101`. The current apply lane refuses mutation by design; a
future production apply needs a separately approved exact implementation/apply
path with snapshot and rollback proof. Issue #41 remains open.

## June 28 PR #49 catch-up package continuation

Captured `RAW-20260628-004` from the attached
`BNA_GOAL_MODE_EXECUTION_PACKET` and added continuation requirements
`REQ-20260628-144` through `REQ-20260628-151` to the active Issue #41 run.

Execution result so far:

- `REQ-20260628-144` Done: continuation packet preserved and mapped to the
  active run; no duplicate run created.
- `REQ-20260628-145` Done: `BACKLOG-CATCHUP-CENSUS` covers all 29 digest
  recordings, with 10 focus jobs, 29 repo-safe digests, 29 private transcript
  refs by transcript-char count, 10 `Needs parse` jobs, 13 question
  candidates, 34 task/action candidates, 29 ready research/content cards, and
  0 score/progress row-level changes.
- `REQ-20260628-146` Done: `Needs parse` now means the private transcript and
  repo-safe digest exist, but parser metadata/structured class/progress output
  is incomplete or parser request visibility is missing. No job was falsely
  marked parsed.
- `REQ-20260628-147` Done: `SCORE-PROGRESS-CATCHUP-PLAN` records 29 no-op
  jobs, 0 row-level score/progress changes, and 10 jobs needing approved
  private reparse before score/progress before/after rows can exist.
- `REQ-20260628-148` Done: `TASK-ACTION-CATCHUP-PLAN` records 34 no-write
  canonical task/action candidate rows, all internal agent/digest/parser/audit
  candidates and 0 human-visible production task candidates.
- `REQ-20260628-149` Done: `RESEARCH-CONTENT-CATCHUP-PLAN` confirms 29 ready
  content/research digest cards, 0 card repairs needed, 0 content idea
  candidates, and no raw transcript bodies.
- `REQ-20260628-150` Done: `APPLY-LANE-DESIGN` documents the owner gate,
  snapshot/rollback, row-level evidence, dedupe, small-batch, dry-run-default,
  and refusal conditions while leaving production apply disabled.
- `REQ-20260628-151` Done: full verification passed, commit
  `2a86311f87d3a6d8ffa20fbd7397d25d16a33442` was pushed to PR #49, PR #49
  was updated, and Issue #41 was commented without marking it done.

Key evidence:

- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/BACKLOG-CATCHUP-CENSUS.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/SCORE-PROGRESS-CATCHUP-PLAN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/TASK-ACTION-CATCHUP-PLAN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/RESEARCH-CONTENT-CATCHUP-PLAN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/APPLY-LANE-DESIGN.md`
- PR comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/49#issuecomment-4826029011`
- Issue #41 comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4826029041`

Verification:

- `npm run content:export-digests -- --privacy-scan`: passed, 29 recordings,
  raw bodies false, 0 privacy findings.
- `npm run content:card-topic-audit`: passed, 29 recordings, 29 generated
  titles, 10 `Needs parse`, 0 `Needs routing`, 0 `Needs topic
  classification`.
- `node --test tests/class-drive-intake-reconcile.test.js tests/transcript-digest-export.test.js tests/two-week-class-intake-audit.test.js tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`:
  passed, 46/46.
- `npm run bna:run:validate`, `npm run bna:run:next`,
  `npm run bna:run:status`, and `npm run secrets:audit`: passed.
- JSON/JSONL parse passed: 2200 payloads, BOM-tolerant.
- Added-line privacy scan passed: no raw Drive URLs/IDs, secret literals, or
  raw transcript bodies.
- `git diff --check`: passed with Windows CRLF warnings only.

Guardrails held: no `--apply`, no production DB mutation, no student portal
write, no score/progress write, no production task write, no Drive write, no
broad Drive sync, no class backfill, no raw transcript-body export, no AI call,
no paid retranscription, no send/publish/charge/access grant, and no
credential/account/DNS change.

## June 28 private reparse dry-run approval

Captured `RAW-20260628-005` from the owner approval and added
`REQ-20260628-152` through `REQ-20260628-156` to the active Issue #41 run.

Approved scope:

- No-write private reparse/canonical-write dry-run only.
- Exact approved job IDs: `21, 25, 26, 30, 31, 56, 57, 58, 59, 71`.
- Allowed repo writes: sanitized evidence/status only.
- Forbidden: `--apply`, production mutation, student portal writes,
  score/progress writes, production task writes, class backfill, Drive
  create/update/delete/move, raw transcript-body export, raw Drive URL/ID
  evidence, AI calls, paid retranscription, sends/publishes/charges/access
  grants, and credential/account/DNS changes.

Execution result:

- `REQ-20260628-152` Done: owner approval preserved in
  `raw-input/RAW-20260628-005-private-reparse-dry-run-approval.md`.
- `REQ-20260628-153` Done: `private-reparse` mode refuses unapproved job IDs,
  forces Drive listing off, and reads exact DB job IDs only.
- `REQ-20260628-154` Done: generated
  `PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN` evidence.
- `REQ-20260628-155` Done: syntax checks, focused test suite, private evidence
  privacy scan, run validation/status/next, source coverage, secrets audit,
  JSON/JSONL parse, added-line privacy scan, and diff check passed.
- `REQ-20260628-156` Needs verification until commit, push, PR #49 update, and
  Issue #41 comment are complete.

Private dry-run summary:

- Inspected jobs: 10/10.
- Missing jobs: 0.
- Private transcript sources read: 10.
- Student-name mentions: 261.
- Question candidates: 1,285.
- Personal question candidates: 36.
- Class-question broadcast candidates: 1,249.
- Existing skip candidates: 0.
- Blocked-review candidates: 0.
- Row-level dry-run rows: 10,149.
- Internal task candidate rows: 119.
- Score/progress rows: 1.
- Score/progress no-op rows: 55.

Evidence:

- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.md`
- `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.json`

Guardrails held so far: no `--apply`, no production DB mutation, no student
portal write, no score/progress write, no production task write, no Drive
write, no broad Drive sync, no class backfill, no raw transcript-body export,
no AI call, no paid retranscription, no send/publish/charge/access grant, and
no credential/account/DNS change.

## Goal-mode execution

| Field | Value |
|---|---|
| Goal-mode requested | yes |
| Active goal objective | Rebuild BNA class/transcript/Drive intake around Drive-first raw transcript storage and privacy-safe GitHub digest memory. |
| Goal tool used | yes |
| GPT output contract | `tasks-pending/_template-goal-mode-correction-output.md` |
| Execution directive | Register first, then work requirements in batches until terminal statuses. |
| Terminal statuses required | Done / Already satisfied / Blocked / Needs operator decision / Failed / Archived |
| Deploy/live-smoke required for app-visible work | completed for content-card/topic-filter repair on Railway `fd93be96-8bec-4c06-b42f-c53d177eab40` |
| Next requirement IDs to work | `REQ-20260628-143` is locally evidenced but production application remains blocked by `DEC-20260626-101`; next safe command is validation/status only unless a new exact apply path is approved. |

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
| REQ-20260626-129 | Register PR #45 content-card/topic-filter addendum | RAW-20260626-008 | bna/class-drive-intake | Codex | source_addendum_registration | High | G | REQ-20260626-128 | PR #45 comment `4809202212` is preserved as raw input, linked to the active run, and Issue #41 remains open | `raw-input/RAW-20260626-008-pr45-content-card-topic-filter-addendum.md`; this register | no | Done |
| REQ-20260626-130 | Audit all 29 digest recordings for card/filter readiness | RAW-20260626-008 | bna/class-drive-intake | Codex | audit | High | G | REQ-20260626-129 | Audit covers every digest recording and reports clean-title, parse, digest, routing, topic, category, next-action, and guardrail states without raw bodies | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CONTENT-CARD-TOPIC-FILTER-AUDIT.*`; `scripts/audit-content-card-topic-filter.cjs` | no | Done |
| REQ-20260626-131 | Repair Operations Content card digest display | RAW-20260626-008 | bna/operations-content-ui | Codex | implementation | High | G | REQ-20260626-130 | Cards show clean generated title, summary, main points, categories, parse status, digest status, routing status, topic status, and next action, and show Needs states for incomplete records | `src/lib/bna/content-card-view-model.js`; `server.js`; `public/operations.html`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/LIVE-CONTENT-CARD-READBACK.*` | deployed/live-smoked | Done |
| REQ-20260626-132 | Repair top topic filter using normalized digest/classification categories | RAW-20260626-008 | bna/operations-content-ui | Codex | implementation | High | G | REQ-20260626-130 | Top topic filter counts and filters multi-topic digest/category keys, has an All reset, includes Uncategorized/Needs Review states, and no longer depends on raw transcript-body topic search | `src/lib/bna/content-card-view-model.js`; `public/operations.html`; `tests/operations-content-library-taxonomy.test.js`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/LIVE-CONTENT-CARD-READBACK.*` | deployed/live-smoked | Done |
| REQ-20260626-133 | Verify content-card/topic-filter repair with no external writes | RAW-20260626-008 | bna/class-drive-intake | Codex | verification | High | G | REQ-20260626-131, REQ-20260626-132 | Focused local tests pass; audit passes; privacy-safe digest export passes; no Drive write, production mutation, class backfill, AI call, or raw transcript export is performed; final app-visible verification waits for deploy/live smoke | `tests/content-card-view-model.test.js`; `tests/operations-content-library-taxonomy.test.js`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CONTENT-CARD-TOPIC-FILTER-AUDIT.*`; `ops/live-smokes/2026-06-28T06-55-47-874Z-live-app-smoke.md` | deployed/live-smoked | Done |
| REQ-20260628-141 | Register class-question broadcast owner rule | RAW-20260628-003 | bna/class-drive-intake | Codex | source_registration | High | H | REQ-20260628-138 | Raw wording preserved and linked to Issue #41 run | `raw-input/RAW-20260628-003-class-question-broadcast-approval.md`; this register | no | Done |
| REQ-20260628-142 | Route unmatched question candidates as class questions in the guarded dry-run planner | RAW-20260628-003 | bna/class-drive-intake | Codex | implementation | High | H | REQ-20260628-141 | Unmatched/ambiguous question candidates from student question, question, and discussion lanes produce class-question broadcast proposals for active students and no blocking ambiguity | `src/lib/bna/class-drive-intake-reconcile.js`; `tests/class-drive-intake-reconcile.test.js` | no | Done |
| REQ-20260628-143 | Refresh sanitized dry-run evidence and keep apply blocked | RAW-20260628-003 | bna/class-drive-intake | Codex | evidence | High | H | REQ-20260628-142 | 21-83 dry-run evidence is refreshed, no production mutation occurs, and remaining apply blocker is explicit | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/BACKFILL-*`; `CLASS-QUESTION-BROADCAST-DRY-RUN.*`; `CHATGPT-TRANSCRIPT-ACCESS-READINESS.*` | no | Done |
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
| REQ-20260626-129..133 | PR #45 content card/topic filter addendum | Preserve addendum, audit 29 digest recordings, attach digest card models to content jobs, repair card display and normalized multi-topic filters, and verify no raw transcript dependency | `npm run content:card-topic-audit`; `node --test tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`; `node --check server.js`; live content-card readback | PR #45 / PR #46 | `185f9446` / `c0b29982` | Railway `fd93be96-8bec-4c06-b42f-c53d177eab40`; live app/content/taxonomy smokes passed |
| REQ-20260628-141..143 | Class-question broadcast dry-run rule | Preserve owner rule, update planner/test coverage, refresh 21-83 row-level dry-run evidence, and leave production apply blocked | `node --test tests/class-drive-intake-reconcile.test.js`; `node scripts/class-drive-intake-reconcile.cjs backfill --write --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit` | pending | pending | not app-visible |
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
| REQ-20260626-129 | Done | `RAW-20260626-008` preserves PR #45 comment `4809202212` | Raw/register files | Register readback | Issue #41 intentionally remains open |
| REQ-20260626-130 | Done | `CONTENT-CARD-TOPIC-FILTER-AUDIT.md/json` covers 29 recordings | Audit output | `npm run content:card-topic-audit` | none |
| REQ-20260626-131 | Done | Digest card view model and Operations card display show title, summary, main points, statuses, categories, and next action; live API returns job #83 clean title and all 29 digest cards via `project_key=all` | `src/lib/bna/content-card-view-model.js`; `server.js`; `public/operations.html`; deploy bundle fix | Focused content-card tests; syntax check; live content-card readback | production student writes remain separate decision |
| REQ-20260626-132 | Done | Topic filter uses normalized multi-topic digest/category keys and no raw transcript topic search; digest-card payloads are body-free | `public/operations.html`; taxonomy tests; `LIVE-CONTENT-CARD-READBACK.*` | Focused taxonomy tests; live content/taxonomy smokes | production student writes remain separate decision |
| REQ-20260626-133 | Done | Focused local tests pass and audit guardrails report no Drive write, production mutation, class backfill, AI call, or raw body export; deployed readback confirms body-free digest cards | Tests/evidence files | `node --test tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`; `npm run content:card-topic-audit`; live smokes | broader production apply remains approval-gated |
| REQ-20260628-141 | Done | `RAW-20260628-003` preserves the class-question broadcast instruction | Raw/register files | Readback | none |
| REQ-20260628-142 | Done | Planner routes unmatched/ambiguous question candidates to active-student class-question broadcasts and test coverage covers `student_questions`, `questions`, and discussion-question lanes | `src/lib/bna/class-drive-intake-reconcile.js`; `tests/class-drive-intake-reconcile.test.js` | `node --test tests/class-drive-intake-reconcile.test.js` | production apply still gated |
| REQ-20260628-143 | Done | Refreshed dry-run evidence reports 917 future event writes, 912 class-question broadcast inserts, 5 matched inserts, 2 existing skips, and 0 blocking ambiguities; no mutation performed | `BACKFILL-DRY-RUN.md`; `BACKFILL-RECOMMENDATION.json`; `CLASS-QUESTION-BROADCAST-DRY-RUN.*`; `CHATGPT-TRANSCRIPT-ACCESS-READINESS.*` | `node scripts/class-drive-intake-reconcile.cjs backfill --write --jobs 21-83 --out-dir ops/class-drive-intake/2026-06-26-two-week-class-intake-audit` | exact production apply path still needs approval |
| REQ-20260626-126 | Needs operator decision | `DEC-20260626-101` | Register only | Blocker documented | Owner must approve any unsafe/raw/external write path |
