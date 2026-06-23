# Plan

1. Add durable start-here and ramble-to-done protocol docs.
2. Add reusable fresh-chat, implementation, and verification prompt templates.
3. Add execution-run structure and validator tooling.
4. Add validator tests for duplicate IDs, invalid statuses, missing evidence,
   missing live/deployment proof, missing `NEXT-SESSION.md`, and stale
   `latest.json`.
5. Seed the June 18 platform completion run with blocked audit-dependent
   requirements.
6. Update repo memory/control files with links to the protocol and active run.
7. Run deterministic verification only:
   - `node --check scripts/bna-execution-run.mjs`
   - targeted execution-run validator tests
   - `npm test`
   - `npm run bna:run:validate`
8. Commit only the protocol/tooling scope.

2026-06-19 continuation plan:

9. Register `RAW-20260619-001` Agent Control Center prompt and split it into
   `REQ-20260618-112` through `REQ-20260618-123`.
10. Implement the local schema/helper/API layer for agent profiles, prompt
    templates, run state, events, artifacts, and task verification fields.
11. Implement the Operations Agents module, task-detail handoff controls, and
    Agent Run portal for copy/open, claim, progress, evidence, submit/seal,
    block/resume/reopen, and cancel.
12. Add action-registry coverage and focused contract tests.
13. Next required batch: run a local DB-backed migration/API smoke with safe
    demo task data, then browser-smoke the Agents UI without starting any broad
    UI crawl or watch loop.
