# Test Results

## Pre-Checkpoint Verification

- `npm test`: pass, 901/901
- `npm run bna:run:status`: pass, blocked 1, needs_operator_decision 14, done 34
- `npm run bna:run:validate`: pass on prior run after checkpoint branch metadata
  correction
- JSON/JSONL parsing: pass
- `node scripts\audit-secrets.mjs`: pass
- `npm run watchdog:audit`: pass, severity `ok`
- `git diff --check`: pass after whitespace-only cleanup of generated evidence
  files

## Post-Coordination Verification

- `npm run bna:run:validate`: pass on linked run, not_started 5, done 1
- `git worktree list`: four worker worktrees present
- worker branch/head/clean checks: pass
  - W1 `parallel/20260619-core` at
    `b2fd5039990ee1cb370a49d4475a7763fb8548b7`, clean
  - W2 `parallel/20260619-ui` at
    `b2fd5039990ee1cb370a49d4475a7763fb8548b7`, clean
  - W3 `parallel/20260619-ingestion` at
    `b2fd5039990ee1cb370a49d4475a7763fb8548b7`, clean
  - W4 `parallel/20260619-onetime` at
    `b2fd5039990ee1cb370a49d4475a7763fb8548b7`, clean
- runtime status files created:
  - `C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\coordinator.json`
  - `C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\W1.json`
  - `C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\W2.json`
  - `C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\W3.json`
  - `C:\Users\User\BNA-parallel-state\PARALLEL-20260619-001\W4.json`
