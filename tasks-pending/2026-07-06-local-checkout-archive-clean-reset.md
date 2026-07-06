# Local Checkout Archive And Clean Reset - 2026-07-06

## Raw intake

Raw source preserved at:

- `raw-input/RAW-20260706-980-local-checkout-archive-clean-reset.md`

## Raw queue record

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-980 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-local-checkout-archive-clean-reset.md |

## Parsed requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Acceptance criteria | Status |
|---|---|---|---|---|---|---|---|---|
| REQ-20260706-980 | Archive the dirty local checkout before cleanup. | RAW-20260706-980 | bna_platform / repo_hygiene | Codex | archive | P0 | Archive exists outside the repo with status, diffs, modified current files, untracked files, and summary metadata. | Done |
| REQ-20260706-981 | Reset the local `BNA v2.0` checkout to clean `origin/master`. | RAW-20260706-980 | bna_platform / repo_hygiene | Codex | cleanup | P0 | Local checkout reports clean status against `origin/master`; stale local branch is removed or no longer active. | Done |
| REQ-20260706-982 | Publish a repo-visible cleanup closeout without committing local junk. | RAW-20260706-980 | bna_platform / repo_hygiene | Codex | closeout | P0 | Raw/register/memory/changelog/ledger record the cleanup and are committed, pushed, merged, and live-smoked where relevant. | In progress |

## Parsed task

| ID | Canonical key | Task | Owner | Workspace/project | Source | Requirement | Status |
|---|---|---|---|---|---|---|---|
| TASK-20260706-980 | local-checkout-archive-clean-reset | Archive and clean the stale dirty local checkout, then publish a closeout record. | Codex | bna_platform / repo_hygiene | RAW-20260706-980 | REQ-20260706-980..982 | In progress |

## Cleanup evidence

| Item | Value |
|---|---|
| Local archive path | `C:\Users\User\BNA-local-archives\2026-07-06-bna-v2-dirty-checkout-before-reset` |
| Archived branch | `codex/onetime-studio-worker-handoff-20260706` |
| Archived HEAD | `b641213b4ef4976481cba07dea080575173e4d1e` |
| Target master | `e63972095ce86c7f0c5f20981a882d1482a152ee` |
| Tracked modified files archived | 34 |
| Untracked files archived | 38 |
| Reset command outcome | checkout reset to `origin/master`, untracked junk removed with `git clean -fd` |
| Active clean branch after cleanup | `codex/archive-clean-checkout-closeout-20260706` |

## What was intentionally not published

- Old local raw IDs `RAW-20260706-910` through `RAW-20260706-915`; these were
  superseded by the published non-colliding records from PR #123.
- Local keyholder diagnostics under `ops/qa-runs/`; these are not appropriate
  for GitHub because they contain local keyholder paths and fingerprints.
- Generated ChatGPT pickup/comment scrape artifacts, watchdog snapshots, and
  obsolete dry-run reports that were not canonical closeout evidence.
- Stale local execution-run edits that disagreed with current validated run
  state.

## Final audit

| ID | Status | Evidence | Verification | Remaining issue |
|---|---|---|---|---|
| REQ-20260706-980 | Done | `ARCHIVE_SUMMARY.json` in local archive; archive contains status files, patches, current tracked copies, and untracked copies. | Archive path verified outside repo before destructive cleanup. | Archive is local-only and intentionally not committed. |
| REQ-20260706-981 | Done | `git reset --hard origin/master`; `git clean -fd`; switched to clean closeout branch. | `git status --short --branch` returned no dirty files after cleanup. | None for the local checkout. |
| REQ-20260706-982 | In progress | This register plus raw/memory/changelog/ledger. | Pending commit, push, merge, and live smoke. | Pending publication closeout. |
