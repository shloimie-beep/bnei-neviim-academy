# Test Results

## Pre-Register Commands

- `git fetch --all --prune`: PASS.
- `git symbolic-ref --short refs/remotes/origin/HEAD`: `origin/master`.
- `gh pr view 5 --json ...`: PR #5 is `MERGED`; head
  `codex/agent-control-center-20260619`; base `master`.
- `git worktree add -b codex/service-provider-studio-20260623 ... origin/master`:
  PASS.
- Clean feature worktree `git status --short --branch`: PASS, no modified files
  before register edits.

## Known Pre-Existing Run Drift

From the clean feature base before the new Studio run was initialized:

- `npm run bna:run:status`: expected FAIL against previous One Time run because
  that run recorded stale branch metadata and references historical live-smoke
  artifacts not present in this clean default-branch worktree.
- `npm run bna:run:next`: same expected FAIL for the previous run.

This run must pass `npm run bna:run:validate` after registration and again
before closeout.

## Register Validation

- `npm run bna:run:validate`: PASS for the new
  `2026-06-23-service-provider-studio` run.
- `npm run bna:run:next`: PASS; selected Batch A / `REQ-20260623-001`, then
  next will advance to `REQ-20260623-002` after the metadata update.

## Baseline Audit

- `git status --short --branch`: PASS; still on isolated
  `codex/service-provider-studio-20260623` worktree with only run/register
  files changed before product-code implementation.
- Canonical audit: PASS; documented reuse/missing/conflict classification in
  `docs/product/service-provider-studio-baseline-2026-06-23.md`.
