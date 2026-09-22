# RAW-20260628-004 - Issue 41 catch-up package continuation

Source: Codex chat attachment `BNA_GOAL_MODE_EXECUTION_PACKET`
Captured: 2026-06-28T13:05:00+03:00
Channel: codex_chat_attachment
Workspace/project: bna/class_drive_intake
Privacy classification: internal_goal_mode_catchup_package

## Raw request

BNA_GOAL_MODE_EXECUTION_PACKET

Repo: shloimie-beep/bnei-neviim-academy
Current PR: #49
Current branch: codex/issue41-class-question-fallback-20260628
Current commit: bee08c8f
Related issue: #41
Active execution run: ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild

Goal:
Continue Issue #41 in goal mode and catch up the remaining transcript/class/student backlog as far as safely possible. The goal is to move from "dry-run evidence exists" to a complete, reviewable, row-level backlog catch-up plan, and to implement any missing safe tooling needed to make that plan trustworthy, idempotent, private, and eventually apply-ready.

Important owner intent:
Shloimie wants the backlog caught up, not left in endless parser/dry-run limbo. However, this prompt DOES NOT authorize production mutation. Do all unblocked parser, planner, evidence, UI/API, validation, and dry-run work. Do not run production apply. Do not write production student portals, scores, progress, tasks, Drive docs, or class backfill unless a later exact owner approval names the exact command/action and scope.

Primary objective for this batch:
Turn the remaining backlog into a complete safe catch-up package.

Requested work:

- Inspect PR #49 against master and keep it draft if production apply is not implemented.
- Produce or refresh a current backlog census for all relevant jobs/recordings, especially jobs `21, 25, 26, 30, 31, 56, 57, 58, 59, 71`.
- For each job classify repo-safe digest state, private raw transcript availability, parse status, digest status, routing status, topic status, question candidates, class-question candidates, matched personal-question candidates, task/action candidates, research/content candidates, score/progress status, human review state, and blockers.
- Keep raw transcript bodies out of GitHub and store only redacted/sanitized references, counts, hashes, IDs, and summaries.
- Refresh pipeline/source/backlog/question/score/readiness evidence where changed.
- Investigate why 10 jobs still show `Needs parse`.
- Determine whether `Needs parse` means missing raw transcript access, parser cannot read existing private transcript, insufficient structured digest/classification fields, no meaningful transcript content, previous parser output not surfaced, UI/API status mapping error, or another concrete cause.
- Do not paper over missing data with fake completion.
- Keep the class-question broadcast rule: unmatched/no-student-name/ambiguous question candidates become class-question broadcasts for active students; matched student-specific questions remain personal; inactive students are excluded; existing rows are skipped idempotently.
- Produce a row-level dry-run question plan and validate idempotency.
- Do not run `--apply`.
- Investigate why score/progress has 0 safe row-level rows and implement/repair only the no-write planner first.
- Emit redacted before/after rows or a clear no-op reason per job/student for score/progress.
- Inspect task-shaped digest/classification output, separate human-visible tasks, internal Codex/agent tasks, parser/audit evidence, duplicates/raw handoff, and provenance-only items.
- Produce a no-write task catch-up plan with canonical task keys and dedupe rules.
- Confirm research/content cards are complete for all 29 digest recordings.
- For the 10 `Needs parse` jobs, determine whether content cards are incomplete or waiting for parser/reparse.
- Repair card generation/status mapping if safe.
- Verify Operations Content continues to show clean generated title, summary, main points, categories/topic, parse/digest/routing/topic status, next action, and no raw transcript body.
- If the remaining blocker is that the apply lane refuses mutation by design, implement or document a controlled apply-lane design with explicit owner gate, exact command, snapshot, rollback file/plan, row-level before/after evidence, idempotent dedupe keys, small batch support, dry-run default, refusal conditions, and tests.
- Do not run the production apply command.

Required verification:

- `node --test tests/class-drive-intake-reconcile.test.js`
- `node --test tests/transcript-digest-export.test.js`
- `node --test tests/two-week-class-intake-audit.test.js`
- `node --test tests/content-card-view-model.test.js`
- `node --test tests/operations-content-library-taxonomy.test.js`
- `npm run content:export-digests -- --privacy-scan`
- `npm run content:card-topic-audit`
- `npm run bna:run:validate`
- `npm run bna:run:next`
- `npm run bna:run:status`
- `npm run secrets:audit`
- JSON/JSONL parse checks
- targeted privacy scan for raw transcript bodies, forbidden Drive private URLs, credentials/secrets, and unredacted private details
- `git diff --check`

Forbidden unless later exact owner approval is supplied:

- no `--apply`
- no production DB mutation
- no production class backfill
- no student portal writes
- no score/progress writes
- no production task writes
- no Drive create/update/delete/move
- no broad Drive sync
- no raw transcript-body export to GitHub
- no AI call
- no paid retranscription
- no stale deletion
- no sends/publishes/charges/access grants
- no credential/account/DNS changes
- no `APPLY_GUARDED_CLASS_BACKFILL`

Definition of Done:

- Every new or touched requirement has evidence.
- Every closed requirement has verification.
- Any remaining blocker has owner, missing information/action, recommended next step, alternatives, consequences, and exact next action.
- No raw transcript bodies are committed.
- No production mutation occurred.
- The backlog state is clearer than before: for every unresolved item, the reason is explicit and actionable.

Suggested first commands:

```powershell
npm run bna:run:status
npm run bna:run:next
git status --short
git log --oneline -5
```

