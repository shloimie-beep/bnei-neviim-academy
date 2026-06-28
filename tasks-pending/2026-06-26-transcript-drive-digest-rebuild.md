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
| Source | Codex chat attachment; GitHub issue #41 comment `4808518537`; Codex chat owner approval; GitHub PR #45 comment `4809202212`; Codex chat June 28 goal-mode request |
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

- PR #45 is mergeable after resolving the master conflict and preserving both
  Issue #41 and service-provider evidence records.
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

Remaining: merge/deploy/live-smoke PR #45 for app-visible card/filter repair,
then keep `DEC-20260626-101` open for any production parser/question/score
apply, broad Drive sync, raw export, AI call, class backfill, or other unsafe
write path.

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
| Next requirement IDs to work | None currently unblocked; `DEC-20260626-101` remains open for any future write beyond #83 |

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
| REQ-20260626-131 | Repair Operations Content card digest display | RAW-20260626-008 | bna/operations-content-ui | Codex | implementation | High | G | REQ-20260626-130 | Cards show clean generated title, summary, main points, categories, parse status, digest status, routing status, topic status, and next action, and show Needs states for incomplete records | `src/lib/bna/content-card-view-model.js`; `server.js`; `public/operations.html` | required after PR review/merge | Blocked: local implementation complete; deploy/live smoke proof pending |
| REQ-20260626-132 | Repair top topic filter using normalized digest/classification categories | RAW-20260626-008 | bna/operations-content-ui | Codex | implementation | High | G | REQ-20260626-130 | Top topic filter counts and filters multi-topic digest/category keys, has an All reset, includes Uncategorized/Needs Review states, and no longer depends on raw transcript-body topic search | `src/lib/bna/content-card-view-model.js`; `public/operations.html`; `tests/operations-content-library-taxonomy.test.js` | required after PR review/merge | Blocked: local implementation complete; deploy/live smoke proof pending |
| REQ-20260626-133 | Verify content-card/topic-filter repair with no external writes | RAW-20260626-008 | bna/class-drive-intake | Codex | verification | High | G | REQ-20260626-131, REQ-20260626-132 | Focused local tests pass; audit passes; privacy-safe digest export passes; no Drive write, production mutation, class backfill, AI call, or raw transcript export is performed; final app-visible verification waits for deploy/live smoke | `tests/content-card-view-model.test.js`; `tests/operations-content-library-taxonomy.test.js`; `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/CONTENT-CARD-TOPIC-FILTER-AUDIT.*` | required after PR review/merge | Blocked: local verification passed; deploy/live smoke proof pending |
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
| REQ-20260626-129..133 | PR #45 content card/topic filter addendum | Preserve addendum, audit 29 digest recordings, attach digest card models to content jobs, repair card display and normalized multi-topic filters, and verify no raw transcript dependency | `npm run content:card-topic-audit`; `node --test tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`; `node --check server.js` | pending | pending | app-visible code path changed; deploy/live smoke not performed in this local PR batch |
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
| REQ-20260626-131 | Blocked | Digest card view model and Operations card display show title, summary, main points, statuses, categories, and next action locally | `src/lib/bna/content-card-view-model.js`; `server.js`; `public/operations.html` | Focused content-card tests; syntax check | deploy/live smoke proof required after PR review/merge before Done |
| REQ-20260626-132 | Blocked | Topic filter uses normalized multi-topic digest/category keys and no raw transcript topic search locally | `public/operations.html`; taxonomy tests | Focused taxonomy tests | deploy/live smoke proof required after PR review/merge before Done |
| REQ-20260626-133 | Blocked | Focused local tests pass and audit guardrails report no Drive write, production mutation, class backfill, or raw body export | Tests/evidence files | `node --test tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js`; `npm run content:card-topic-audit` | final app-visible verification needs deploy/live smoke after PR review/merge |
| REQ-20260626-126 | Needs operator decision | `DEC-20260626-101` | Register only | Blocker documented | Owner must approve any unsafe/raw/external write path |
