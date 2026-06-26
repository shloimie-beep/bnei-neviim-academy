# Parallel Task View Model Handoff

Date: 2026-06-26

## Branch / Worktree

- Branch: `codex/parallel-onetime-task-view-model-20260626`
- Worktree: `C:\Users\User\Documents\Codex\2026-06-26\parallel-onetime-task-view-model`
- Base used: `ab6741bd` (`codex/onetime-rabbi-ui-preflight-20260626` base), because the requested `ops/one-time-mishnah/operator-ui-review/*` files are present there.
- Push/merge/deploy: not performed.
- Production task mutation: not performed.

## Exported Contract

New pure module:

- `src/platform/instances/one-time-task-view-model.js`

Exports:

- `buildOneTimeTaskViewModel(tasks, options)`
- `classifyOneTimeTask(task, options)`
- `ONE_TIME_TASK_LANES`
- `ONE_TIME_BLOCKER_TYPES`
- `ONE_TIME_TASK_OWNERS`
- `ONE_TIME_TASK_CATEGORIES`

The module is CommonJS, has no database/API/file-system dependency, and returns `dry_run_only: true`, `mutation_required: false`, and `production_mutation_required: false`.

## Lanes And Rules

Required visible lanes are modeled as:

1. `needs_rabbi_decision` - Needs Rabbi Decision
2. `needs_shloimie` - Needs Shloimie
3. `in_progress` - In Progress
4. `blocked_external_setup` - Blocked External Setup
5. `done_activity` - Done / Activity

Default rules:

- Raw prompt titles are not shown as user tasks unless a clean display title/summary exists.
- `tasks-pending/*.md` handoffs are hidden from default human task lanes.
- Duplicate parser fan-out and audit-output rows are hidden by default.
- Pending/blocker lanes mean true human/external setup blockers, not "waiting for Codex."
- Codex/system work is demoted to `agent_activity`, not Rabbi-facing Pending.
- Non-One-Time records are hidden by default so final integration can preserve One Time scope.

## Blockers Modeled

`ONE_TIME_BLOCKER_TYPES` includes:

- `resend_domain_readiness`
- `stripe_live_billing_approval`
- `zoom_owner_admin_meeting_policy`
- `vimeo_user_authorization_upload_policy`
- `hosted_transcription_credential`
- `separate_railway_domain_paused`
- `ghl_leadconnector_conflict`
- `generic_external_setup`

Each blocker includes:

- missing information
- owner
- recommended option
- alternatives
- consequence
- exact next action
- dependent module/action

GHL/GoHighLevel/LeadConnector mentions default to `ghl_leadconnector_conflict`, matching the current no-GHL runtime policy.

## Integration Instructions

Suggested final integration shape:

```js
const {
  buildOneTimeTaskViewModel,
} = require('./src/platform/instances/one-time-task-view-model');

const model = buildOneTimeTaskViewModel(tasks, {
  workspace_key: 'rabbi_sheller_provider',
  project_key: 'one_time_mishnah_class',
});
```

Use:

- `model.lanes` for the default Rabbi/One Time task board.
- `model.blockers` for concise blocker/Decision cards.
- `model.agent_activity` for Codex/system lifecycle status.
- `model.hidden` only for internal audit/search/debug surfaces, not default human views.
- `classifyOneTimeTask(task, options)` for row-level integration or server-side preclassification.

Do not use this module to mutate tasks. It is a view model only.

## Tests Run

Passed:

- `node --test tests/one-time-task-view-model.test.js`
  - 7/7 passing.
- `node --test tests/task-queue-reconciler.test.js tests/operations-task-queue-visibility.test.js tests/workspace-task-no-stale-agent.test.js tests/operations-task-comments-and-dictation.test.js`
  - 23/23 passing.

Skipped:

- `npm run task:reconcile`
  - Not run because the default dry-run path writes report artifacts under `ops/system-audits/`. This lane was instructed not to mutate production tasks and only to produce local branch artifacts.

## Cleanup / Production Notes

No production cleanup was performed or required for this view-model lane. If final integration discovers actual live duplicate/internal records, use this model's `hidden`, `agent_activity`, and `blockers` outputs to produce a dry-run cleanup plan first rather than archiving/updating production records.

## Files Added

- `src/platform/instances/one-time-task-view-model.js`
- `tests/one-time-task-view-model.test.js`
- `ops/one-time-mishnah/operator-ui-review/parallel-task-view-model-handoff.md`
