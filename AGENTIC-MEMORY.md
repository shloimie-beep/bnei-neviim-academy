# BNA Agentic Memory

BNA memory has layers. Do not collapse them into one junk drawer.

## Layers

1. Raw input: exact natural-language text, transcript, media/file metadata, and
   source channel. Canonical live storage is `bna_raw_intake`; repo fallback is
   `raw-input/` plus `memory/YYYY-MM-DD.md`.
2. Parsed facts/items: structured parse arrays with stable IDs, scopes,
   source quotes, confidence, and review state.
3. Goal candidates: durable behavior/product/security rules extracted from
   natural language.
4. Accepted goals: active standing or scoped goals in `bna_goal_memory`,
   `QUALITY-GOALS.md`, and goal ledgers.
5. Scoped memory: workspace/project/student/provider/family memories and
   records, never public by default.
6. Tasks/requirements: actionable work in registers, BNA tasks, and agent job
   lifecycle records.
7. Watchdog evidence: check results, screenshots, reports, and repair tasks.
8. Changelog/ledger: append-only record of verified agent work.
9. Agent trace: broad ramble/compiler/implementation/verification loops record
   source files read, packets, validation, tools, browser evidence, screenshots,
   skipped external actions, blockers, tests, deployment, final status, and next
   packet under `ops/agent-traces/`.
10. Packet DAG: broad product-quality rambles use router classification,
    control-tower packets, visual-audit packets, scoped implementation packets,
    verifier/deploy packets, context budgets, and drift watchdog evidence
    before Done.

## Rules

- `MEMORY.md` stays compact and curated.
- `memory-topics/*` holds topic-specific durable memory and operating rules.
- Raw intake remains provenance and is not deleted after parsing.
- Private parent/student/provider/contact/message bodies must not be committed
  to public repo files. Use redacted summaries and stable IDs.
- All parsed outputs link back to a raw ID when possible.
- Goal candidates are promoted automatically only when repeated, explicitly
  durable, aligned with standing goals, or safety/security/privacy related.
