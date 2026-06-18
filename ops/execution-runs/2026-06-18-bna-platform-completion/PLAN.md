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
