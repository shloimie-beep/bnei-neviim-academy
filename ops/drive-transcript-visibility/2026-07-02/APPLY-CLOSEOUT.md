# Apply Closeout - Private Drive Transcript Docs And Job 101 Parser

- Packet ID: `RAW-20260702-014`
- Approval phrase received: `APPROVE_20260702_PRIVATE_DRIVE_TRANSCRIPT_DOC_SYNC_FOR_BACKLOG_AND_FUTURE_UPLOADS`
- Scope: private Drive transcript docs for jobs `101`, `100`, `85`, `84`, `83`, `82`; Job `101` parser repair; Drive connector visibility verification.
- Guardrail: no raw transcript bodies are stored in GitHub evidence.

| Requirement | Status | Evidence | Verification | Remaining blocker |
|---|---|---|---|---|
| Source-of-truth files read before apply | Done | Read `AGENTS.md`, `BNA-START-HERE.md`, `README.md`, `TASKS.md`, `MEMORY.md`, `SYSTEM-STATE.md`, `ops/execution-runs/latest.json`, prior register, Job 101 trace, backlog, Drive plan, Drive connector readiness, parser audit, verification, and digest policy files. | `npm run bna:run:status` passed. | None |
| Raw intake and apply register created | Done | `raw-input/RAW-20260702-014.md`; `tasks-pending/2026-07-02-apply-private-drive-transcript-docs-and-job101-parser-closeout.md` | Files added with approval scope and forbidden side effects. | None |
| CLI parser dry-run guard | Done | `scripts/telegram-kimi-bridge.mjs` now passes `dry_run` and `force` to `/api/bna/content-jobs/:id/parse-mixed-recording`. | `git diff -- scripts/telegram-kimi-bridge.mjs` reviewed. | None |
| Targeted private Drive doc dry-run for jobs 101/100/85/84/83/82 | Done | `npm run content:sync-drive-library -- --dry-run --no-ai --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82` selected exactly 6 real transcript jobs and planned: create `101`, `100`, `85`, `84`, `82`; update `83`. | Command exited 0; Job `91` was not selected. | None |
| Approved private Drive doc apply for jobs 101/100/85/84/83/82 | Done | Initial apply created 5 docs, skipped 1 unchanged, and read back jobs `101`/`100`; force dry-run then planned exactly 6 updates; force apply updated exactly 6 docs; Job `101` refreshed once after parser stage changed. | `npm run content:sync-drive-library -- --force --no-ai --verify --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82` exited 0 with readback ok. Final Job `101` refresh exited 0 with readback ok. | None |
| Drive transcript doc contract | Done | `scripts/sync-drive-content-library.mjs` now renders Job ID/source metadata, private warning, ChatGPT visibility marker, review-only score/progress marker, and raw transcript only in the private Drive doc body. | Drive API readback across all six docs found `## Raw Transcript`, `## Private Warning`, `ChatGPT Drive visibility: intended yes`, Job ID metadata, and source markers. | None |
| Job 91 remains blocked without paid transcription retry | Done | Prior backlog says Job `91` has no transcript text. | No Job `91` command was run in this packet. | Missing transcript; separate backlog transcription retry approval required. |
| Job 101 true parser dry-run | Done | `scripts/telegram-kimi-bridge.mjs` now forwards `dry_run` to the parser API. DB readback shows Job `101` parse run `59` with `dry_run=true`, `raw_chars=42257`, `item_count=1032`, and `needs_review_count=783`. | The old live route still timed out for long parser calls; the patched no-AI/no-progress path avoided provider waits. DB readback proves parser output existed without raw transcript exposure. | None |
| Job 101 parser repair/rerun | Done | Job `101` content job readback: `transcript_chars=39920`, `has_parse_json=true`, `drive_stage=04 Parsed`. Parser counts: tasks `4`, class notes `43`, accountability events `201`, review `442`, group goal entries `0`, daily Torah updates `0`, Torah learning entries `0`. | `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101 --parse --no-ai --no-progress-writes` against patched local app exited 0; it skipped duplicate parser creation and marked stage `04 Parsed`. | None |
| Drive connector search/readability verification | Done | Drive API search/readback found all six private transcript docs by app properties and source/title terms. Search checks for `Job 101`, `Voice 260702_100126`, `2026-07-02 Transcript`, and `#101` all returned the Job `101` transcript doc among results. | Google Drive connector paragraph-range read resolved first paragraph: `# Job 101 - Drive Voice 260702_100126`; full transcript fetch was intentionally not dumped into tool output. | None |
| Score/progress/grading guardrail preserved | Done | No score/progress/grading apply phrase was supplied. Parser repair used `--no-progress-writes`; Job `101` readback shows group goal entries `0`, daily Torah updates `0`, Torah learning entries `0`. | No Job `91` transcription retry, no public send/publish/share, no score/progress apply command, no Buffer/email/WhatsApp/SMS/social/payment/DNS command. | Requires `APPROVE_20260702_SCORE_PROGRESS_GRADING_APPLY_EXACT_PACKET_ONLY` for future score/progress apply. |
| Repo-safe digest/privacy verification | Done | `npm run content:export-digests -- --privacy-scan` reported raw transcript bodies included `false` and privacy scan findings `0`. Generated broad digest churn was reverted because it was outside this packet's six-job scope. | Command exited 0; tracked worktree now contains only scoped code/evidence changes. | None |
| Syntax/secret/run validation | Done | `node --check server.js`; `node --check scripts/telegram-kimi-bridge.mjs`; `npm run secrets:audit`; `npm run bna:run:validate`. | All exited 0. `npm run bna:run:validate` says active execution run validation passed. | Active run still has unrelated blocked items outside this packet. |
| Ledger/changelog/final verification | Done | `ops/agent-task-ledger.jsonl` and `ops/agent-changelog.md` updated for this packet. | Final `git status --short` reviewed before handback. | None |

## Commands Run

- `npm run bna:run:status`
- `npm run content:sync-drive-library -- --dry-run --no-ai --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82`
- `npm run content:sync-drive-library -- --no-ai --verify --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82`
- `npm run content:sync-drive-library -- --dry-run --force --no-ai --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82`
- `npm run content:sync-drive-library -- --force --no-ai --verify --job-id 101 --job-id 100 --job-id 85 --job-id 84 --job-id 83 --job-id 82`
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101 --dry-run --parse`
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101 --dry-run --parse --no-ai --no-progress-writes`
- `node scripts/telegram-kimi-bridge.mjs reprocess-drive-job 101 --parse --no-ai --no-progress-writes`
- `npm run content:sync-drive-library -- --dry-run --force --no-ai --job-id 101`
- `npm run content:sync-drive-library -- --force --no-ai --verify --job-id 101`
- `node --check server.js`
- `node --check scripts/telegram-kimi-bridge.mjs`
- `npm run content:export-digests -- --privacy-scan`
- `npm run secrets:audit`
- `npm run bna:run:validate`

## Notes

- The hosted parser route returned a platform `502` before the no-AI/no-progress repair path was added.
- The existing local app on `8080` was left untouched. A temporary patched local server was started on `127.0.0.1:8091` for parser repair and must be stopped during closeout.
- No raw transcript body, secret value, raw Drive ID, parent/private family data, or publish-ready newsletter text is stored in this evidence file.
