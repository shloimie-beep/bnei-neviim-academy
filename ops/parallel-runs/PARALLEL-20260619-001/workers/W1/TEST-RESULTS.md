# W1 Test Results

Status: passed

## Focused Tests

```text
node --test tests/platform-core/*.test.js
tests: 17
pass: 17
fail: 0
```

## Compatibility Tests

```text
node --test tests/platform-core/*.test.js tests/workspace-rbac-negative-isolation.test.js tests/one-time-rbac-negative-isolation.test.js tests/ws11-community-model-contract.test.js tests/workspace-person-household-provider-contract.test.js tests/universal-assistant-mvp.test.js
tests: 43
pass: 43
fail: 0
```

## Final Checks

```text
git diff --check
passed
```

```text
git status --short
?? docs/architecture/platform-core-backend-contracts.md
?? migrations/
?? ops/parallel-runs/
?? src/platform/
?? tests/platform-core/
```
