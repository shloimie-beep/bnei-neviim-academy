# W2 Baseline

Date: 2026-06-19

## Inspected

- `public/operations.html`
- `server.js`
- `tests/operations-module-scoping.test.js`
- `tests/operations-saas-crm-redesign.test.js`
- `tests/operations-ws01-layout-readability.test.js`
- `src/lib/bna/*` file list
- Main checkout coordinator files:
  - `ops/parallel-runs/PARALLEL-20260619-001/CONTRACTS.md`
  - `ops/parallel-runs/PARALLEL-20260619-001/FILE-OWNERSHIP.md`
  - `ops/parallel-runs/PARALLEL-20260619-001/REQUIREMENTS.md`
  - `ops/parallel-runs/PARALLEL-20260619-001/DECISIONS-AND-EXTERNAL-GATES.md`

## Current Operations Shape

The live Operations UI is a large static Express-served app in
`public/operations.html`. It already includes a dark operations shell,
workspace switcher, BNA/One Time workspace records, module navigation, settings,
students, service providers, community, courses, content, tasks, agents,
calendar, automations, integrations, and responsive overrides.

The file is a shared entrypoint and appears in the parallel-worker deny list, so
W2 did not edit it.

## Reuse

- Existing Express static serving can host the isolated harness from `public/`.
- Existing route families in `server.js` can inform Prompt 05 adapter wiring.
- Existing tests prove workspace scoping patterns and route expectations.
- Current brand direction uses dark operational surfaces with gold and teal
  accents; W2 reused that direction while adding warmer work surfaces for scan
  density.

## Replace Or Improve Later

- `public/operations.html` is very large and difficult to safely evolve inside
  a parallel worker.
- The new package separates fixtures, adapter contracts, rendering, CSS tokens,
  and a standalone harness so Prompt 05 can mount it deliberately.
- Existing Operations still owns live behavior until shared integration is
  approved.

## Setup Findings

- W2 worktree was clean and on `parallel/20260619-ui`.
- The W2 worktree started from checkpoint commit
  `b2fd5039990ee1cb370a49d4475a7763fb8548b7`.
- The W2 worktree did not contain the new `ops/parallel-runs` coordinator folder
  or the linked `2026-06-19-parallel-platform-finish` execution run pointer, so
  coordinator contracts were read from the main checkout as instructed by the
  worker prompt.
- `npm run bna:run:status` in the worktree reported the prior run pointer and
  failed validation because the branch is intentionally `parallel/20260619-ui`.

## Baseline Conclusion

W2 should not renovate the shared Operations entrypoint directly. The correct
parallel-worker deliverable is a W2-owned, mountable UI package with view-model
fixtures, role/module-aware rendering, responsive proof, and exact integration
notes for Prompt 05.
