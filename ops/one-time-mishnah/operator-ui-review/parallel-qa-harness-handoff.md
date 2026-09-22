# One Time Rabbi UI QA Harness Handoff

Date: 2026-06-26

## Branch / Worktree

- Branch: `codex/parallel-onetime-rabbi-ui-qa-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-rabbi-ui-qa`
- Base at worktree creation: `6f57d910 Close out Vimeo media readiness lane`
- Scope: parallel local-only QA lane
- No-push confirmation: no push, merge, deploy, production mutation, or external write was performed.

## Input Gaps

The requested operator review docs were not present in this worktree:

- `ops/one-time-mishnah/operator-ui-review/START-HERE.md`
- `ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md`
- `scripts/smoke-one-time-shared-review-live.mjs`

`tests/one-time-shared-review-branding.test.js` was also absent at start, so this lane added it as a local shared review branding/static hook check.

## Tests Added / Updated

- Added `tests/one-time-rabbi-ui-final-local-smoke.test.js`
  - Starts a local mocked HTTP server.
  - Serves the required One Time/Rabbi routes from `public/`.
  - Mocks API/session responses for Operations, provider, parent, student, classroom, and Drive brief preview paths.
  - Asserts One Time branding, scope hooks, approved modules, hidden/demoted internal modules, preview/gated explanations, action markers on visible buttons, 390px mobile overflow safety, no console/page errors, no private BNA/family data leakage, and no public exposure of private Operations data.
  - Writes local evidence to:
    - `ops/one-time-mishnah/operator-ui-review/qa-harness-local-report.json`
    - `ops/one-time-mishnah/operator-ui-review/qa-harness-local-report.md`

- Added `tests/one-time-shared-review-branding.test.js`
  - Pure Node static check for One Time branding and QA hooks across shared review surfaces.
  - Confirms the public One Time offer does not visibly expose raw internal scope keys.

- Existing `tests/one-time-operations-ui-smoke.test.js` still passes. It was executed for verification; its source was not edited.

## UI / Route Updates Supporting The Harness

- Added a local review route and file:
  - `public/one-time-email-review.html`
  - `server.js` route for `/one-time-email-review` and `/one-time-email-review.html`

- Added or reinforced One Time QA markers in:
  - `public/one-time/index.html`
  - `public/operations.html`
  - `public/provider.html`
  - `public/parent.html`
  - `public/student.html`
  - `public/one-time-classroom.html`

- Added registry coverage:
  - `ops/action-registry.json`: `ACTION-ONETIME-EMAIL-REVIEW-PREVIEW`
  - `ops/route-registry.json`: `/one-time-email-review.html`

## Selectors Expected By Final Integration

Final integration should preserve or provide these selectors on the real One Time/Rabbi UI:

- `data-one-time-rabbi-dashboard`
- `data-one-time-rabbi-module`
- `data-one-time-action-state`
- `data-one-time-content-command-center`
- `data-one-time-task-lane`
- `data-one-time-setup-blocker`
- `data-one-time-no-write-preview`

Every visible `<button>` in the checked routes must include at least one of:

- `data-action-id`
- `data-one-time-action-state`
- `data-button-state`

Preview, disabled, gated, blocked, or locked buttons must have a visible nearby explanation. Acceptable explanation language can include terms such as `preview`, `gated`, `blocked`, `no-write`, `review`, `disabled`, `not configured`, `locked`, `scope`, `access code`, `login`, `required`, or `private`.

## Required Route Coverage

The final local smoke currently checks:

- `/one-time`
- `/operations?workspace=rabbi_sheller_provider&project=one_time_mishnah_class&view=service_providers&section=overview`
- `/provider.html?review=one-time`
- `/parent.html?review=one-time`
- `/student.html?review=one-time`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
- `/one-time-email-review.html`

## Current Pass / Fail Status

Validated pass with existing local dependency install exposed through `NODE_PATH`:

```powershell
$env:NODE_PATH='C:\Users\User\BNA v2.0\node_modules'; node --test tests/one-time-rabbi-ui-final-local-smoke.test.js
```

Result: pass, 1 test.

```powershell
$env:NODE_PATH='C:\Users\User\BNA v2.0\node_modules'; node --test tests/one-time-operations-ui-smoke.test.js
```

Result: pass, 1 test.

Direct pure Node shared branding check:

```powershell
node --test tests/one-time-shared-review-branding.test.js
```

Result: pass, 2 tests.

Plain Playwright commands in this fresh worktree currently fail before assertions because `node_modules` is not installed in the worktree:

```powershell
node --test tests/one-time-rabbi-ui-final-local-smoke.test.js
node --test tests/one-time-operations-ui-smoke.test.js
```

Failure: `Cannot find module 'playwright'`.

Final integration should either run after `npm install` in this worktree or run with dependency resolution pointed at an existing install. No npm install was performed in this local-only lane.

## Final Integration Instructions

1. Install or expose Playwright dependencies for the final integration worktree.
2. Run the three local checks:
   - `node --test tests/one-time-rabbi-ui-final-local-smoke.test.js`
   - `node --test tests/one-time-operations-ui-smoke.test.js`
   - `node --test tests/one-time-shared-review-branding.test.js`
3. Keep `/parent.html?review=one-time` and `/student.html?review=one-time` gated to scoped review shells until final scoped member/student data exists.
4. Replace scaffolded placeholders with real One Time/Rabbi modules only when the replacement keeps the same data hooks, scope labels, preview/no-write markers, and blocked-button explanations.
5. Keep content command center, task lane, setup blocker, and no-write preview areas explicit so the final QA harness can prove organization and clickability without external writes.
6. Reconcile or add the missing `START-HERE.md`, `ROUTE-MAP.md`, and shared live smoke script if the final integration lane needs them for documentation/live proof.
