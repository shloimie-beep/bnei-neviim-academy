# Job 101 Review Triage And UI/System Corrections

## Raw Intake

| Field | Value |
|---|---|
| Raw ID | `RAW-20260702-012` |
| Source | Codex chat |
| Related job | `content_job:101` |
| Evidence | `ops/drive-transcript-visibility/2026-07-02/JOB-101-REVIEW-TRIAGE.md` |
| Status | Done for triage and parser/private transcript-doc repair; DB review cleanup and score/progress writes blocked |

## Parsed Requirements

| ID | Requirement | Owner | Status | Evidence | Remaining blocker |
|---|---|---|---|---|---|
| `REQ-20260702-012-001` | Reinterpret Job 101 review candidates with the assumption that UI dictation was interrupted by student/class/random speech. | Codex | Done | `JOB-101-REVIEW-TRIAGE.md` | None |
| `REQ-20260702-012-002` | Collapse real UI/system intent into a small canonical task set. | Codex | Done | Five canonical tasks in triage | None |
| `REQ-20260702-012-003` | Identify which items were already handled by background UI packets. | Codex | Done | Rabbi/One Time UI register packets 02-09 inspected | Deploy/live smoke still blocked for app-visible Done |
| `REQ-20260702-012-004` | Clean up DB review queue by archiving duplicates/instruction leakage and linking real clusters to tasks. | Codex | Blocked | Fresh DB requery failed DNS; parser/private transcript-doc repair later completed in `ops/drive-transcript-visibility/2026-07-02/APPLY-CLOSEOUT.md` | Retry when Supabase host resolves |
| `REQ-20260702-012-005` | Apply score/progress/grading rows from Job 101. | Shloimie/Codex | Blocked | Existing approval rule | Requires `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY` and exact row-level packet |

## Canonical Tasks To Use Instead Of 440 Review Rows

| ID | Task | Status |
|---|---|---|
| `TASK-20260702-012-A` | Fix Operations top filter controls and compact filter-box layout. | Partly covered; exact route verification still needed |
| `TASK-20260702-012-B` | Unify Contacts, Interested Parents, tags, and communication filters. | Not done from Job 101 |
| `TASK-20260702-012-C` | Repair mobile bot/helper text input behavior on Android/Samsung-style keyboard. | Not verified done |
| `TASK-20260702-012-D` | Verify Rabbi/One Time workspace-scope isolation in Operations dashboard. | Partly covered by Rabbi/One Time UI packets |
| `TASK-20260702-012-E` | Archive/supersede Job 101 parser-instruction leakage and duplicate review fragments. | Blocked on DB reachability |

## Guardrails

- No raw transcript body is stored in this register.
- No student/private review rows were closed.
- No score/progress/grading rows were written.
- No public publishing or parent/student-facing send was performed.
- No DB review status mutation was performed because the fresh DB readback failed.
