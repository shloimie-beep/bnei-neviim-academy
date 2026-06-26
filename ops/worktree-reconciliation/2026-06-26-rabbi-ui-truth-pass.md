# Rabbi Scheller / One Time UI Truth Pass - 2026-06-26

## Scope

Codex verified the older Rabbi Scheller workspace sequence and searched local
worktrees for Rabbi, Scheller/Sheller, One Time, provider, Issue #20, Issue
#24, Agent Review, and UI work.

## Old Sequence Verdict

- PR #15, `Fix Rabbi Scheller workspace auth and navigation`, is merged.
- PR #15 includes commits `8f8b0b4` and `1ab57eac`; both are reachable from
  current `origin/master`.
- PR #15 recorded Railway deployment `5e37d2a0-7e81-4339-a721-c4286e8ecaa8`
  and live smoke evidence for the Rabbi workspace.
- The preservation worktree
  `C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio-integration`
  is on `codex/preserve-rabbi-closeout-20260624` at `487a660b`; that commit is
  reachable from current `origin/master`.
- The Rabbi parity worktree
  `C:\Users\User\Documents\Codex\2026-06-24\rabbi-scheller-parity` is on
  `codex/rabbi-scheller-parity-20260624` at `1ab57eac`; that commit is
  reachable from current `origin/master`.
- Issue #20 is closed. PR #22 and PR #23 are merged; PR #23 deployed
  `b8fb9e6dceb1b4c995108e3510cb3c2f9867a17b` to Railway deployment
  `4667ac5e-7695-4802-9b3d-5b6e12d07a64` with live smoke and browser
  verification recorded in the issue closeout comments.

## Remaining Local-Only Work Found

The older PR #15 / Issue #20 work is not the remaining risk. The remaining
local-only material was a newer 2026-06-26 One Time / Rabbi UI cleanup set in
parallel worktrees under `C:\Users\User\Documents\Codex\2026-06-26\`.

The stale QA worktree contained app HTML diffs from an older base and was not
applied wholesale. Current `origin/master` already contains the email review
route/page and shared review branding coverage that overlapped with that lane.

After the operator supplied the Prompt F / final-integration packet, Codex
confirmed that this newer sequence was the local-only One Time Rabbi UI QA and
integration batch. The following missing local-only artifacts were preserved
and integrated on a clean current-master branch:

- `public/css/one-time-operations.css`
- `src/platform/instances/one-time-action-state-contract.js`
- `src/platform/instances/one-time-content-command-center.js`
- `src/platform/instances/one-time-rabbi-dashboard-ia.js`
- `src/platform/instances/one-time-task-view-model.js`
- focused tests for each contract/module
- `tests/one-time-rabbi-ui-final-local-smoke.test.js`
- `ops/one-time-mishnah/operator-ui-review/*handoff*.md`
- One Time route and button-state instrumentation in the current public,
  portal, classroom, email review, and Operations surfaces

## Verification

Focused preservation tests passed:

```text
node --test tests/one-time-action-state-contract.test.js tests/one-time-content-command-center.test.js tests/one-time-operations-brand-css.test.js tests/one-time-rabbi-dashboard-ia.test.js tests/one-time-task-view-model.test.js
```

Result: 29/29 passing.

Additional branch verification passed after installing dependencies in the
clean worktree:

- `node scripts/generate-one-time-action-coverage.mjs` - ok, 40 controls
- `node --test tests/one-time-shared-review-branding.test.js tests/watchdog-action-registry.test.js` - 10/10 passing
- `npm test` - 1392/1392 passing
- `npm run watchdog:actions` - ok, 0 findings
- `npm run secrets:audit` - 4906 tracked paths checked, 0 findings
- Prompt F / final integration verification:
  - final local route smoke passed
  - focused route/registry/shared review tests passed 12/12
  - `npm run watchdog:actions`, `watchdog:security`, `watchdog:links`,
    `watchdog:navigation-ia`, and `watchdog:content` passed
  - `npm run secrets:audit` passed with 4917 tracked paths checked and 0
    findings
  - `npm test` passed 1393/1393

## Deploy Status

This branch now includes app-visible UI integration work. It is locally
verified and ready for PR. It is not production-complete until the branch is
merged, deployed, and live-smoked.
