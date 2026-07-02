# Ramble Intake - 2026-06-26 - two-week-class-intake-audit

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | RAW-20260626-002 |
| Source | ChatGPT / operator request |
| Parse status | implemented |
| Related issues | #18, #24 |
| Guardrail | Issue #18 remains `NOT SAFE TO APPLY`; no class backfill apply is authorized. |

## Goal

Audit and organize all class recordings dropped into Drive from 2026-06-12 through 2026-06-26 so Shloimie can see which classes are parsed, which questions were extracted per student, what is newsletter-ready, and what remains blocked.

## Parsed Requirements

| ID | Requirement | Expected result | Owner | Status |
|---|---|---|---|---|
| REQ-20260626-101 | Register this audit as one canonical raw source/run | One active execution run with source, requirements, and evidence paths; no duplicate task system | Developer/agent | Blocked |
| REQ-20260626-102 | Census all Drive recordings in scope | `DRIVE-MEDIA-CENSUS.md/json` listing every recording by redacted source ref, date, folder, and matched job status | Developer/agent | Done |
| REQ-20260626-103 | Trace every matched content job through the pipeline | `JOB-PIPELINE-TRACE.md/json` with stage status for transcript, parser, canonical writes, read models, retry/dedup | Developer/agent | Done |
| REQ-20260626-104 | Build student-question matrix | `STUDENT-QUESTION-MATRIX.md/json` with redacted question refs, student match refs, confidence, and review/newsletter status | Developer/agent | Done |
| REQ-20260626-105 | Check GitHub transcript export gaps | `GITHUB-EXPORT-GAPS.md/json` showing which scoped jobs are missing from `content-memory/transcripts` | Developer/agent | Done |
| REQ-20260626-106 | Produce newsletter-ready matrix | `NEWSLETTER-READY-MATRIX.md/json` showing which jobs can safely feed a newsletter draft and which are blocked | Developer/agent | Done |
| REQ-20260626-107 | Produce dry-run repair plan only | `REPROCESS-DRY-RUN-PLAN.md/json`; no production writes | Developer/agent | Done |
| REQ-20260626-108 | Close out with final verdict | `FINAL-VERDICT.md`, test results, source coverage, and recommended next action | Developer/agent | Done |

`REQ-20260626-101` is blocked only for active execution-run pointer creation: `ops/execution-runs/latest.json` still points to `2026-06-21-one-time-master-completion`, which has open unrelated work. Codex did not repoint or create a duplicate active execution run. The raw record, requirement register, code, tests, and audit artifacts exist in repo fallback.

## Tasks

- [x] Copy implementation package files into the repo
  - Owner: Developer/agent
  - Category: Drive/content workflow
  - Priority: High
  - Depends on: Current active run pointer reconciled
  - Related file: `src/lib/bna/two-week-class-intake-audit.js`
  - Notes: Do not create a second parser system; reuse existing class-drive-intake reconciliation helpers.

- [x] Run focused tests
  - Owner: Developer/agent
  - Category: Technical requirements
  - Priority: High
  - Depends on: Files copied
  - Related file: `tests/two-week-class-intake-audit.test.js`
  - Notes: Run syntax checks and focused node tests before live readback.

- [x] Run read-only class intake audit
  - Owner: Developer/agent
  - Category: Reporting/dashboard
  - Priority: High
  - Depends on: DB/Drive read-only credentials
  - Related file: `scripts/audit-two-week-class-intake.cjs`
  - Notes: Use `--start-date 2026-06-12 --end-date 2026-06-26 --min-job-id 64 --max-job-id 120`.

- [ ] Refresh GitHub transcript export if audit proves safe source scope
  - Owner: Developer/agent
  - Category: Content workflow
  - Priority: Medium
  - Depends on: `GITHUB-EXPORT-GAPS.md`
  - Related file: `scripts/export-content-transcripts.mjs`
  - Status: Blocked / needs operator decision
  - Notes: `scripts/export-content-transcripts.mjs` writes full transcript bodies into tracked `content-memory/transcripts` and deletes stale transcript files. Do not run until Shloimie explicitly approves tracked transcript export, chooses local-only private export, or asks for a redacted exporter.

- [x] Create final owner summary
  - Owner: Developer/agent
  - Category: Reporting/dashboard
  - Priority: High
  - Depends on: Audit artifacts and tests
  - Related file: `FINAL-VERDICT.md`
  - Notes: Use exact statuses: AUDIT READY, PARTIAL, or BLOCKED.

## Open Questions

| ID | Question | Why it matters | Blocking? |
|---|---|---|---|
| Q-20260626-101 | Should One Time/Rabbi Sheller files be separated from BNA Academy files in final newsletter output? | Prevents mixing workspaces/audiences | No, audit can label both |
| Q-20260626-102 | Should private student names/questions be generated only in `.local-artifacts`? | Public repo privacy | No, default output is sanitized |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260626-101 | Choose transcript export privacy path | Whether full transcript markdown may be written into tracked `content-memory/transcripts`, or whether export should be local-only/redacted | Shloimie | Keep tracked export blocked for now; use read-only audit artifacts and create a redacted/local-only export requirement if needed | Approve tracked transcript export; run private local-only export outside tracked repo; build redacted transcript-gap export | Wrong choice can commit raw transcript bodies/private student text or leave GitHub export gaps unresolved | Reply with the approved path before `npm run content:export-transcripts` or any transcript-body export runs | Transcript export gap repair after `GITHUB-EXPORT-GAPS.md` | Needs operator decision |

## Guardrails

- No production mutation.
- No Drive write/move.
- No class backfill apply.
- No raw transcript or private student question text committed.
- Approval/review blocks sending/publishing, not parsing/indexing.

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260626-101 | `raw-input/RAW-20260626-002-two-week-class-intake-audit.md`, this register | Register package without disturbing existing active execution run pointer | `npm run bna:run:status`; `npm run bna:run:next`; active run still has unrelated open work | None | None | Not app-visible |
| REQ-20260626-102..108 | `src/lib/bna/two-week-class-intake-audit.js`, `src/lib/bna/class-drive-intake-reconcile.js`, `scripts/audit-two-week-class-intake.cjs`, `tests/two-week-class-intake-audit.test.js`, `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/*` | Apply additive audit package, add compatibility helper, dedupe repeated question echoes, run read-only DB/Drive audit, record final verdict | Syntax checks; package test 7/7; adjacent parser/privacy suite 17/17; read-only audit completed with artifacts | None | None | Not app-visible; no deploy required |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260626-101 | Blocked | Existing active run `2026-06-21-one-time-master-completion` validates and still has open unrelated batch H; no run pointer change made | `raw-input/RAW-20260626-002-two-week-class-intake-audit.md`, `tasks-pending/2026-06-26-two-week-class-intake-audit.md` | `npm run bna:run:status`; `npm run bna:run:next` | Create a formal execution run only after current active-run reconciliation, if still needed |
| REQ-20260626-102 | Done | `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-MEDIA-CENSUS.md` and `.json`; 18 Drive recordings in scope | Audit artifacts | Read-only audit completed | None |
| REQ-20260626-103 | Done | `JOB-PIPELINE-TRACE.md` and `.json`; 29 content jobs traced | Audit artifacts | Read-only audit completed | 1 job lacks confirmed structured output |
| REQ-20260626-104 | Done | `STUDENT-QUESTION-MATRIX.md` and `.json`; 13 deduped sanitized question rows | Audit artifacts; `tests/two-week-class-intake-audit.test.js` | `node --test tests/two-week-class-intake-audit.test.js` 7/7 | 6 question rows need student-match review |
| REQ-20260626-105 | Done | `GITHUB-EXPORT-GAPS.md` and `.json`; 24 missing transcript exports | Audit artifacts | Read-only audit completed | Export repair blocked by `DEC-20260626-101` |
| REQ-20260626-106 | Done | `NEWSLETTER-READY-MATRIX.md` and `.json`; only jobs #31 and #30 are ready-for-draft-review; most scoped jobs are not ready | Audit artifacts | Read-only audit completed | Do not draft final newsletter from unverified matrix |
| REQ-20260626-107 | Done | `REPROCESS-DRY-RUN-PLAN.md` and `.json`; 10 dry-run repair candidates, `safe_to_apply=false` | Audit artifacts | Read-only audit completed | Any reparse/canonical write remains dry-run only unless separately approved |
| REQ-20260626-108 | Done | `FINAL-VERDICT.md`; status `PARTIAL`; class backfill safe-to-apply remains false | Audit artifacts; ledger/changelog closeout | Syntax checks; tests 17/17; read-only DB/Drive audit | `PARTIAL`, not newsletter-ready |
