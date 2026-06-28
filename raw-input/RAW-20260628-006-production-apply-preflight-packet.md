# RAW-20260628-006 - Issue #41 Production Apply Preflight Packet

- Source channel: codex_chat_attachment
- Captured at: 2026-06-28T16:30:00+03:00
- Workspace: bna
- Project: class_drive_intake
- Privacy classification: internal_goal_mode_production_apply_preflight_no_mutation
- Parse status: registered
- Requirement register: ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild/requirements.json
- Current blocker: DEC-20260626-101

## Raw Source

```text
BNA_GOAL_MODE_EXECUTION_PACKET

Repo: shloimie-beep/bnei-neviim-academy
Branch: codex/issue41-class-question-fallback-20260628
PR: #49
Issue: #41
Active run: ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild
Current blocker: DEC-20260626-101

Goal:
Finish Issue #41 by moving from private reparse dry-run evidence to a controlled production apply path, but only after fixing mergeability, verifying evidence integrity, producing snapshot/rollback proof, and applying in small approved batches.

Owner intent:
Shloimie wants this finished once and for all. This prompt approves Codex to implement and prepare the production apply lane and to run final no-write preflight checks. It does NOT authorize production mutation until the final apply command, scope, snapshot path, rollback path, and row counts are printed and confirmed inside the run evidence.

Immediate required checks:
1. Inspect AGENTS.md, BNA-START-HERE.md, docs/BNA-RAMBLE-TO-DONE.md, ops/execution-runs/latest.json, active NEXT-SESSION.md, requirements.json, PR #49, and Issue #41.
2. Confirm PR #49 state. It is currently draft and may be non-mergeable. Fix mergeability against master or create a clean continuation branch if needed.
3. Verify these files are non-empty on the remote branch and contain sanitized evidence:
   - ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.md
   - ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/PRIVATE-REPARSE-CANONICAL-WRITE-DRY-RUN.json
4. If either private-reparse evidence file is empty or not readable from GitHub, regenerate and recommit the sanitized evidence before doing anything else.
5. Run:
   - npm run bna:run:status
   - npm run bna:run:next
   - npm run bna:run:validate

Known private reparse dry-run result to preserve:
- 10/10 approved jobs inspected
- 10 private transcript sources read
- 261 student-name mentions
- 1,285 question candidates
- 36 personal-question candidates
- 1,249 class-question broadcast candidates
- 119 task candidates
- 1 score/progress row
- 55 score/progress no-op rows
- 0 blocked-review question candidates
- no Drive write
- no raw transcript export
- no AI call
- no production mutation

Production apply scope to prepare:
Approved jobs only:
21, 25, 26, 30, 31, 56, 57, 58, 59, 71

Allowed to implement:
- guarded production apply lane code;
- final no-write preflight command;
- exact row-level apply plan;
- snapshot creation requirement;
- rollback generation requirement;
- small-batch apply support;
- idempotent dedupe keys;
- refusal checks;
- readback verification commands;
- sanitized evidence updates;
- PR/Issue/run documentation.

Do not apply until the final preflight evidence is generated and the command matches the approved scope exactly.

Apply lane required controls:
1. Default mode is dry-run.
2. Production apply requires:
   - --apply
   - --gate APPLY_GUARDED_CLASS_BACKFILL
   - exact approved job IDs
   - snapshot file
   - rollback output file
   - row-level before/after evidence
   - idempotent dedupe keys
   - explicit approved action list
3. Refuse apply if:
   - PR branch evidence is stale or empty;
   - job IDs differ from the approved list;
   - raw transcript body would be committed/exported;
   - raw Drive URLs/IDs would enter repo evidence;
   - student match is ambiguous;
   - a score/progress row lacks before/after;
   - target schema is unknown;
   - snapshot path is missing;
   - rollback path is missing;
   - dedupe keys are missing;
   - dry-run row counts differ from apply preflight row counts;
   - production DB readback connection is unavailable;
   - any unrelated Drive write/sync is attempted.

Batching:
Prepare production apply in these batches:
1. personal questions only:
   - expected count from dry-run: 36 candidates
2. class-question broadcasts:
   - expected count from dry-run: 1,249 candidates, or the exact row count emitted by the final row-level plan
3. score/progress:
   - expected count from dry-run: 1 row only if before/after is clear
4. production tasks:
   - apply none unless the final plan identifies true human-visible production tasks; internal agent/parser/audit task candidates must not become user-facing tasks.

Final preflight deliverables:
Create/update sanitized files under:
ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/

Required files:
- PRODUCTION-APPLY-PREFLIGHT.md
- PRODUCTION-APPLY-PREFLIGHT.json
- PRODUCTION-APPLY-SNAPSHOT-PLAN.md
- PRODUCTION-APPLY-ROLLBACK-PLAN.md
- PRODUCTION-APPLY-BATCH-PLAN.md
- PRODUCTION-APPLY-READBACK-PLAN.md

Verification before any apply:
- node --check src/lib/bna/class-drive-intake-reconcile.js
- node --check scripts/class-drive-intake-reconcile.cjs
- node --test tests/class-drive-intake-reconcile.test.js
- node --test tests/class-drive-intake-reconcile.test.js tests/transcript-digest-export.test.js tests/two-week-class-intake-audit.test.js tests/content-card-view-model.test.js tests/operations-content-library-taxonomy.test.js
- npm run bna:run:validate
- npm run bna:run:next
- npm run bna:run:status
- npm run secrets:audit
- JSON/JSONL parse checks
- privacy scan for raw Drive URLs/IDs, raw transcript bodies, and secret literals
- git diff --check

Stop point:
After implementing the apply lane and final preflight, stop and print the exact production apply command(s), expected row counts, snapshot path, rollback path, and readback verification commands.

Do not run the production apply command until the final command is explicitly recorded and approved in the run.

Closeout:
- update requirements.json with new REQ IDs;
- update NEXT-SESSION.md;
- update ops/agent-task-ledger.jsonl;
- update ops/agent-changelog.md;
- update PR #49;
- comment Issue #41;
- keep Issue #41 open until production readback proves the rows were applied.
```

