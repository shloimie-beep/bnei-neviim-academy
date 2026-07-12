# Prepared Code And Contract Package

This packet does not contain a blind monolithic patch. It contains repository-grounded implementation assets that Codex should apply lane by lane after refreshing the current source.

## Ready-to-adapt assets

- `attachments/migrations/20260712-assistant-sidekick-v2.sql` — additive, idempotent schema for scope grants, memory records/events, ingress processing, tool runs, and normalized question index.
- `attachments/contracts/capability.schema.json` — strict manifest definition for navigation, query, mutation, draft, external-read, and external-write capabilities.
- `attachments/contracts/assistant-turn.schema.json` — strict plan/result envelope.
- `attachments/contracts/list-questions.schema.json` — required query inputs and normalized output.
- `attachments/contracts/memory-record.schema.json` — memory namespace, visibility, sensitivity, provenance, confidence, confirmation, and lifecycle.
- `attachments/contracts/sidekick-profiles.json` — the four fixed surface profiles.
- `attachments/scaffolds/relative-date-range.js` — dependency-free Israel-time relative-date parser starter.
- `attachments/scaffolds/telegram-adapter-contract.js` — thin adapter boundary.
- `attachments/scaffolds/capability-manifest-generator.mjs` — registry compilation/gap-report starter.
- `attachments/test-fixtures/natural-language-evals.json` — exact English/Hebrew routing, scope, memory, and approval cases.

## Adaptation rules

1. Inspect current definitions before applying any migration or scaffold.
2. Keep migrations additive and idempotent. No table drops, destructive rewrites, or production backfills in the implementation commit.
3. Integrate modules into the existing CommonJS/ESM boundaries intentionally. Do not introduce a new framework or dependency merely for this package.
4. Treat scaffolds as behavior contracts. Replace placeholder adapters with actual repository services and add tests before routing traffic.
5. Preserve compatibility reads/writes during shadow mode, but name one canonical owner for each concept.
6. Do not patch `shouldAttachAppContext()` with more regexes as the final solution.
7. Do not count an action as covered unless runtime dispatch, permission, result/audit, and an execution test all exist.

## Expected compatibility risks

- `server.js` contains both `assistant_*` and `bna_assistant_*` models plus multiple assistant endpoints; consolidation must be staged.
- The helper tool registry is broader than the typed action registry and includes draft/packet wrappers; it cannot be declared Telegram parity wholesale.
- UI action records include navigation, public actions, disabled/external setup states, and test-only selectors; each needs explicit mapping or intentional exclusion.
- Existing Telegram commands directly send/update/deploy outside the canonical pipeline; these need feature-flagged retirement after equivalent safe paths exist.
- Two production deployments may use the same codebase with separate environment/database configuration; migration and worker rollout evidence must be recorded per target.
