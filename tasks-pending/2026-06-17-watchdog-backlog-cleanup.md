# Ramble Intake - 2026-06-17 - watchdog-backlog-cleanup

## Raw Intake

| Raw ID | Source | Parse status | Raw storage | Notes |
|---|---|---|---|---|
| RAW-20260617-006 | codex_chat | implemented | raw-input/RAW-20260617-006-watchdog-backlog-cleanup.md | Operator asked to keep working on cleaning and backlog after the universal hardening closeout. |

## Parsed Requirements

| ID | Requirement | Expected result | Affected area | Verification | Status |
|---|---|---|---|---|---|
| REQ-20260617-124 | Close stale ledger starts | Add terminal ledger records for stale started/in-progress rows that already have later proof, without mutating old records. | Ledger / watchdog | Terminal rows appended in `ops/agent-task-ledger.jsonl`; `npm run watchdog:audit` shows no stale work. | Done |
| REQ-20260617-125 | Reduce false proof-gap findings | Make watchdog proof checks inspect wrapped Markdown task blocks, not only the first line. | Watchdog parser | `scripts/watchdog-audit.mjs` now parses task continuation blocks and recognizes `smokes`; `npm run watchdog:audit` shows no missing proof. | Done |
| REQ-20260617-126 | Reclassify COMMUNITY-06 prompt drift | Ensure old COMMUNITY-06 prompt sources inherit deployed/live proof from the accumulated release instead of remaining local-only. | Prompt intake | `npm run prompts:audit` reports zero local-only prompt groups; COMMUNITY-06 links proof paths. | Done |
| REQ-20260617-127 | Clarify external/blocker and source-pointer backlog | Add source/proof/blocker wording to the most visible open backlog rows that still appear as generic active tasks. | TASKS / source of truth | `TASKS.md` and `SYSTEM-STATE.md` updated; `npm run watchdog:audit` external/source-pointer findings are zero. | Done |
| REQ-20260617-128 | Record cleanup closeout | Update memory, ledgers, changelog, and this register with exact proof and remaining backlog. | Source of truth | Memory, ledger, changelog, raw file, and this register updated. | Done |

## Guardrails

- Do not stage or commit the mixed dirty worktree.
- Do not perform live external sends, uploads, charges, DNS writes, account
  grants, credential copies, or direct DB writes.
- Treat human/provider/credential decisions as blockers or Pending/Decision
  items, not Codex work.

## Final Audit

| ID | Status | Evidence | Remaining issue |
|---|---|---|---|
| REQ-20260617-124 | Done | Stale ledger closeouts appended for the Downloads prompt packet, one-time integration/access audit, and COMMUNITY-06 deployed proof. Final watchdog report: `ops/watchdog-audits/2026-06-17T13-26-watchdog-audit.md`. | None. |
| REQ-20260617-125 | Done | `scripts/watchdog-audit.mjs` now reads Markdown task continuation blocks for proof/source/blocker checks and recognizes `smoke`/`smokes`. Final watchdog report has zero findings. | None. |
| REQ-20260617-126 | Done | `scripts/prompts-audit.mjs` maps historical prompt sources to durable workstreams/goals and treats linked goals as durable paths. Prompt summary has zero prompt sources without linked task/proof/goal path and zero `UNMAPPED` records. | None. |
| REQ-20260617-127 | Done | `TASKS.md` rows now show proof/source/blocker text for completed, open, and external-account items; `SYSTEM-STATE.md` points to the clean report. | Automatic audit monitoring remains a separate decision. |
| REQ-20260617-128 | Done | `memory/2026-06-17.md`, `ops/agent-changelog.md`, `ops/agent-task-ledger.jsonl`, this register, and the raw file were updated with final proof. Verification passed: JSONL 1190 rows parse, `npm run prompts:audit`, `npm run watchdog:audit`, and `npm test` 713/713. | None. |
