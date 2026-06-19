# W1 Evidence

Requirement: REQ-20260619-401

## Implemented Evidence

- `src/platform/core/**`: context, IDs, result contracts.
- `src/platform/rbac/**`: canonical roles, permission checks, instance/workspace
  isolation, verifier scope, self-view rules, module visibility.
- `src/platform/domain/**`: person dedupe/upsert plans, student profiles,
  guardian relationships, provider profiles, domain record links.
- `src/platform/community/**`: community/group/post/resource service builders.
- `src/platform/courses/**`: course/module/lesson/video/enrollment/progress
  service builders.
- `src/platform/rewards/**`: neutral goal/milestone/reward lifecycle builders.
- `migrations/parallel-20260619-core-001-platform-core.sql`: additive SQL
  migration draft.
- `docs/architecture/platform-core-backend-contracts.md`: architecture summary.
- `tests/platform-core/**`: focused local tests.

## Verification Evidence

Focused platform-core test run:

```text
node --test tests/platform-core/*.test.js
tests: 17, pass: 17, fail: 0
```

Final local verification:

```text
node --test tests/platform-core/*.test.js tests/workspace-rbac-negative-isolation.test.js tests/one-time-rbac-negative-isolation.test.js tests/ws11-community-model-contract.test.js tests/workspace-person-household-provider-contract.test.js tests/universal-assistant-mvp.test.js
tests: 43, pass: 43, fail: 0
```

```text
git diff --check
passed
```

## Blockers / Gates

- No production DB migration was run.
- No live smoke or deployment was run.
- Shared entrypoint wiring is documented in `INTEGRATION.md` for Prompt 05.
