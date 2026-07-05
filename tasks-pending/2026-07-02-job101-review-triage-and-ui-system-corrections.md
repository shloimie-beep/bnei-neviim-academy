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
| `TASK-20260702-012-B` | Unify Contacts, Interested Parents, tags, and communication filters. | Implemented and locally verified 2026-07-05; publish/deploy live smoke pending clean release lane |
| `TASK-20260702-012-C` | Repair mobile bot/helper text input behavior on Android/Samsung-style keyboard. | Implemented and locally verified 2026-07-05; publish/deploy live smoke pending clean release lane |
| `TASK-20260702-012-D` | Verify Rabbi/One Time workspace-scope isolation in Operations dashboard. | Partly covered by Rabbi/One Time UI packets |
| `TASK-20260702-012-E` | Archive/supersede Job 101 parser-instruction leakage and duplicate review fragments. | Blocked on DB reachability |

## Guardrails

- No raw transcript body is stored in this register.
- No student/private review rows were closed.
- No score/progress/grading rows were written.
- No public publishing or parent/student-facing send was performed.
- No DB review status mutation was performed because the fresh DB readback failed.

## 2026-07-05 Local Code Closeout

Codex used the canonical Job 101 tasks above instead of the noisy review queue.

- `TASK-20260702-012-B`: Updated `public/operations.html` so the normal BNA
  Contacts nav exposes first-party `CRM Contacts`, the Contacts overview shows
  a local unified contact graph marker
  `data-job101-contact-unified-filters="TASK-20260702-012-B"`, signup contacts
  and interested parent leads share tag options, CRM contact tag options merge
  local contact/lead tags, `Notes / Activity` renders communication activity,
  and communication records inherit matched signup/lead tags for shared
  date/tag filtering.
- `TASK-20260702-012-C`: Updated `public/js/bna-bot-widget.js` with
  `interactive-widget=resizes-content`, Android/Samsung-friendly textarea
  hints, 16px textarea sizing, delayed keyboard sync, input auto-sizing,
  `visualViewport.geometrychange`, orientation, IME composition, focus, blur,
  and input resync handling.
- Focused verification passed:
  `node --test tests/operations-contacts-intake-cleanup.test.js tests/job101-contacts-helper-smoke.test.js tests/mobile-assistant-keyboard-layout.test.js tests/universal-assistant-contract.test.js tests/one-time-communications-workspace.test.js tests/communications-screening-import-ui.test.js`
  (32/32).
- Local smoke passed:
  `node scripts/smoke-mobile-assistant-keyboard-live.mjs --base-url http://127.0.0.1:18741`
  with report
  `ops/live-smokes/2026-07-05T11-44-28-737Z-mobile-assistant-keyboard-live-smoke.md`.
- Local browser smoke passed:
  `node --test tests/job101-contacts-helper-smoke.test.js`, using fixture
  Operations APIs only; no DB review rows, external CRM, email, WhatsApp,
  payments, access, DNS, or provider writes.
- `npm run watchdog:protocol-drift` produced
  `ops/watchdog-audits/2026-07-05-product-quality-drift.md` and exited nonzero
  on older unrelated findings in
  `ops/prompt-packets/2026-07-03-helper-bot-workspace-agent-chatgpt/README.md`.
- `TASK-20260702-012-E` remains blocked and untouched. No score/progress/
  grading rows were written.
- Publish/deploy/live smoke remains blocked by the current shared dirty
  worktree/release lane; this local code batch should be published only from a
  clean scoped release branch or by careful partial staging that excludes
  unrelated dirty work.
