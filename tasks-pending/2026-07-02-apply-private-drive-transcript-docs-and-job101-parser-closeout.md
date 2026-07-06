# Apply Private Drive Transcript Docs And Job 101 Parser Closeout

- Packet ID: `RAW-20260702-014`
- Source raw input: `raw-input/RAW-20260702-014.md`
- Prior audit register: `tasks-pending/2026-07-02-drive-transcript-visibility-openai2-kimi-fallback-parser-routing.md`
- Evidence folder: `ops/drive-transcript-visibility/2026-07-02/`
- Approval phrase received: `APPROVE_20260702_PRIVATE_DRIVE_TRANSCRIPT_DOC_SYNC_FOR_BACKLOG_AND_FUTURE_UPLOADS`

## Scope Guardrails

- Allowed: create/update private Drive transcript docs for jobs `101`, `100`, `85`, `84`, `83`, and `82`.
- Allowed: dry-run and rerun parser output for Job `101`.
- Allowed: repo-safe digest/evidence updates and Drive connector visibility verification.
- Blocked: paid transcription retry for Job `91`.
- Blocked: score/progress/grading writes without `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY`.
- Forbidden: public sharing, publishing, newsletters, WhatsApp/email/SMS/social posting, Buffer drafts, payment/account/DNS changes, broad unrelated Drive mutation, raw transcript bodies in GitHub.

## Requirements

| Requirement ID | Requirement | Status | Evidence |
|---|---|---|---|
| REQ-20260702-APPLY-001 | Preserve raw intake and closeout register for this apply packet. | Done | This file and `raw-input/RAW-20260702-014.md` |
| REQ-20260702-APPLY-002 | Run targeted private Drive transcript doc dry-run for jobs `101`, `100`, `85`, `84`, `83`, `82`. | Done | Dry-run selected exactly 6 jobs and planned 5 creates + 1 update; force dry-run later planned exactly 6 updates. |
| REQ-20260702-APPLY-003 | Apply private Drive transcript doc create/update only for jobs `101`, `100`, `85`, `84`, `83`, `82`. | Done | Initial apply created 5 docs and skipped 1 unchanged; force apply updated exactly 6 docs; Job `101` was refreshed once more after parser stage changed. |
| REQ-20260702-APPLY-004 | Leave Job `91` blocked with no transcription retry. | Done | No Job `91` transcription/retry command was run. |
| REQ-20260702-APPLY-005 | Run a true dry-run parser repair for Job `101`. | Done | CLI now passes `dry_run`; DB readback shows Job `101` private dry-run parse run `59` with `dry_run=true`. |
| REQ-20260702-APPLY-006 | Rerun/repair Job `101` parser output without score/progress/grading apply writes. | Done | Job `101` parser output exists; duplicate parser apply skipped and stage was marked `04 Parsed`; group/progress/timer counts stayed zero. |
| REQ-20260702-APPLY-007 | Verify Drive/ChatGPT connector readability/searchability for completed transcript docs. | Done | Drive API search/readback found all six docs with raw transcript, private warning, Job ID, and ChatGPT visibility markers; connector paragraph read resolved Job `101` title. |
| REQ-20260702-APPLY-008 | Run repo-safe verification and record ledger/changelog closeout. | Done | `node --check`, Drive sync verification, `npm run content:export-digests -- --privacy-scan`, `npm run secrets:audit`, and `npm run bna:run:validate` passed. |

## Closeout

Terminal statuses are recorded in `ops/drive-transcript-visibility/2026-07-02/APPLY-CLOSEOUT.md`.
