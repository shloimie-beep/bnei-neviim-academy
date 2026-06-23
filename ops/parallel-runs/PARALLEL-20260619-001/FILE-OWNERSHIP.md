# File Ownership

Workers W1-W4 may edit only their allowed paths. If a worker needs a shared
entrypoint, package script, latest-run pointer, ledger, changelog, or active
run edit, the worker must write the requested change into its own
`INTEGRATION.md`. Prompt 05 owns final shared-file integration.

## Shared-File Deny List

Workers W1-W4 may not edit:

```text
server.js
public/operations.html
package.json
package-lock.json
.env.example
TASKS.md
MEMORY.md
SYSTEM-STATE.md
ops/agent-task-ledger.jsonl
ops/agent-changelog.md
ops/execution-runs/latest.json
ops/execution-runs/2026-06-18-bna-platform-completion/requirements.json
scripts/google-drive-setup.mjs
scripts/telegram-kimi-bridge.mjs
scripts/agent-fleet-supervisor.mjs
scripts/bna-execution-run.mjs
```

## W1 Owns

```text
src/platform/core/**
src/platform/domain/**
src/platform/rbac/**
src/platform/community/**
src/platform/courses/**
src/platform/rewards/**
migrations/parallel-20260619-core-*
tests/platform-core/**
docs/architecture/platform-core-*
ops/parallel-runs/PARALLEL-20260619-001/workers/W1/**
```

## W2 Owns

```text
public/platform-ui/**
public/js/platform-ui/**
public/css/platform-ui/**
tests/platform-ui/**
docs/product/platform-ui-*
ops/parallel-runs/PARALLEL-20260619-001/workers/W2/**
```

## W3 Owns

```text
src/platform/ingestion/**
src/platform/prompts/**
src/platform/agent-control/**
scripts/ramble-*.mjs
scripts/prompt-queue-*.mjs
content-memory/platform-prompts/whatsapp.md
content-memory/whatsapp/**
tests/ingestion/**
tests/agent-control/**
docs/product/ramble-queue-*
ops/parallel-runs/PARALLEL-20260619-001/workers/W3/**
```

## W4 Owns

```text
src/platform/instances/**
src/platform/brands/**
src/platform/integrations/**
src/lib/integrations/onetime/**
src/lib/integrations/readiness/**
config/brands/**
tests/instances/**
tests/integrations/**
docs/integrations/**
docs/architecture/onetime-*
ops/parallel-runs/PARALLEL-20260619-001/workers/W4/**
```

## Conflict Rule

If two workers need the same file, neither worker edits it. Each records:

- desired file path
- exact behavior change
- exported function or event needed
- tests that prove the change
- any migration or external gate

Prompt 05 resolves the shared edit in merge order.
