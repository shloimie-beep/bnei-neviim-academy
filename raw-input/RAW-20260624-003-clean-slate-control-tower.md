# CODEX GOAL — Control Tower Reconciliation and Canonical Integration Base

Create and activate a Goal named:

`BNA CLEAN-SLATE CONTROL TOWER — RECONCILE ALL WORK AND CREATE INTEGRATION BASE`

Do not mark the Goal complete until every acceptance criterion below is satisfied.

## Objective

Create one authoritative integration base that safely preserves and reconciles:

- current `origin/master`;
- PR #14;
- PR #15;
- PR #12 and PR #13 history already represented by PR #14;
- the reportedly deployed PR #15 state;
- the local/dirty Rabbi Eli Scheller / One Time QA closeout in the `service-provider-studio-integration` worktree;
- stale execution-run metadata;
- active task/Decision/queue state;
- any uncommitted files that may contain real work.

This is the only prompt that runs before the parallel lanes.

Do not implement new product features in this Goal. Reconcile, preserve, normalize, and create the shared base.

## Known starting points to verify

- Repository: `shloimie-beep/bnei-neviim-academy`
- PR #14 branch: `codex/integration-navigation-owner-review-20260624`
- Previously reported PR #14 head: `f9625e8c15e0a63a272582e839bf42b100cd6714`
- PR #15 branch: `codex/rabbi-scheller-parity-20260624`
- Previously reported PR #15 head: `1ab57eac802ef172a5e96651dabc203d3420cbd9`
- PR #15 was reportedly deployed and live-smoked while still unmerged.
- Local worktree `service-provider-studio-integration` reportedly contains a dirty/unpushed Rabbi closeout, including ledger record 1305.
- On PR #14, `ops/execution-runs/latest.json` points to `2026-06-23-complete-system-reconciliation`, whose `run.json` expects `codex/issue-8-complete-system-reconciliation`.

Treat these as claims to verify, not assumptions.

## Owner approvals encoded for this Goal

Approved:

- fetch/pull/prune;
- inspect every worktree;
- preserve and commit non-secret local work;
- push preservation branches;
- merge/cherry-pick PR branch content into a new integration branch;
- resolve conflicts;
- correct run metadata;
- deduplicate tasks and Decisions without deleting history;
- push the integration base and open/update one draft integration PR.

Not approved in this Goal:

- production deployment;
- production DB mutation;
- class backfill;
- Stripe/Vimeo external writes;
- real sends;
- DNS changes.

## Step 1 — Repository and worktree census

Run and record:

- `git remote -v`
- `git fetch --all --prune`
- `git worktree list --porcelain`
- `git branch -vv`
- `git status --short` in every worktree
- local HEAD and upstream SHA in every worktree
- local commits not pushed
- pushed commits not merged
- untracked files
- ignored generated files that occupy significant space
- stashes
- PR branch relationships
- current production/deployed SHA if available through read-only Railway metadata

Create:

`ops/worktree-reconciliation/2026-06-24-clean-slate-control-tower.md`

and a machine-readable JSON companion.

For every dirty/untracked file, classify:

- real implementation;
- test;
- evidence;
- generated output;
- duplicate;
- secret risk;
- unknown;
- safe to discard only after integration;
- must preserve.

Do not delete or reset unknown files.

## Step 2 — Preserve the local Rabbi closeout

Inspect the `service-provider-studio-integration` worktree.

Confirm whether the local changes in:

- the One Time task file;
- `ops/agent-changelog.md`;
- `ops/agent-task-ledger.jsonl`;
- ledger record 1305;
- any associated tests or UI files

already exist in PR #14, PR #15, or `master`.

For every local change:

- if identical upstream, mark duplicate;
- if superseded with stronger implementation, document the superseding commit;
- if unique and still valid, preserve it;
- if stale or contradictory, preserve evidence and mark rejected with reason.

Before committing:

- run the secret audit;
- run a staged leak scan;
- validate JSON/JSONL;
- run `git diff --check`.

Create a preservation branch if needed:

`codex/preserve-rabbi-closeout-20260624`

Commit and push only non-secret, valid work.

Never leave unique valid work only on one machine.

## Step 3 — Reconcile PR #14 and PR #15

Create a new branch from the latest `origin/master`:

`codex/clean-slate-integration-20260624`

Use a new clean worktree.

Integrate PR #14 and PR #15 without rewriting published history.

Preferred approach:

1. merge PR #14 head into the integration branch;
2. merge PR #15 head;
3. merge/cherry-pick the preservation branch only for unique valid changes;
4. resolve conflicts using behavior and tests, not “ours/theirs” blindly.

Important:

- PR #14 and PR #15 diverged from the same older base.
- PR #15 reportedly contains deployed auth/navigation code.
- Do not lose PR #15 changes when incorporating PR #14.
- Do not duplicate PR #12/#13 content already represented in PR #14.
- Preserve both sets of evidence, but remove stale claims.

Run focused tests after each integration step.

Create:

`ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/control/PR-RECONCILIATION.md`

with:

- merge base;
- source heads;
- commits integrated;
- conflicts;
- conflict decisions;
- tests after each step;
- current production/deployed relation.

## Step 4 — Repair canonical execution-run metadata

The current PR #14 run pointer is stale.

Create a new canonical active run:

`ops/execution-runs/2026-06-24-clean-slate-system-closeout/`

Required files:

- `run.json`
- `requirements.json`
- `SOURCE.md`
- `PLAN.md`
- `STATUS.md`
- `BATCH-STATUS.md`
- `EVIDENCE.md`
- `TEST-RESULTS.md`
- `DEPLOYMENT.md`
- `NEXT-SESSION.md`

Update:

`ops/execution-runs/latest.json`

The new `run.json` must point to:

- the new integration branch;
- the actual integration-base SHA;
- the new draft PR;
- the correct remote branch;
- the exact source prompts/requirements.

Mark older active runs inactive or superseded without deleting history.

Do not falsely mark older incomplete requirements complete.

Acceptance:

- `npm run bna:run:status` passes;
- `npm run bna:run:validate` passes;
- `npm run bna:run:blockers` passes;
- `npm run bna:run:next` produces accurate output;
- source coverage has no unmapped executable statements;
- no branch-metadata drift remains.

## Step 5 — Reconcile queue, tasks, and Decisions

Do not “clear” by deleting history.

Create a census of:

- executable Codex tasks;
- operator Decisions;
- completed tasks;
- stale tasks;
- duplicate tasks;
- superseded tasks;
- tasks pointing to old branches/runs;
- Decisions already answered by the owner’s permissions;
- Decisions still requiring credentials or exact external account identity.

Apply these owner decisions unless canonical evidence contradicts them:

- Rabbi Eli Scheller is the provider owner/admin for `rabbi_sheller_provider`.
- Shloimie is a workspace admin for setup/support inside that workspace, but is not silently converted into the provider owner.
- Shloimie retains separate BNA super-admin authority.
- Read-only external production inspection is approved when configured.
- Merge/deploy/live verification are approved after a clean release gate.
- Stripe sandbox testing is approved.
- Private synthetic Vimeo test upload is approved.
- Guarded class backfill is conditionally approved only after Prompt 04 and Prompt 09 safeguards.

Close or update Decisions that these answers resolve.

Leave credential-specific Decisions open only when the secret/target truly is absent.

Create lane tasks for Prompts 02–08.

## Step 6 — Create the control manifest

Write:

`ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.json`

Include:

- run ID;
- integration branch;
- integration-base SHA;
- draft PR URL;
- source PR heads;
- current `master`;
- current deployed SHA;
- preservation branch and SHA;
- lane names;
- exact lane branch names;
- file ownership;
- forbidden central files;
- handoff paths;
- approved external effects;
- actions reserved for final integrator;
- expected cherry-pick/merge order;
- release gates.

Also write:

`ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.md`

## Parallel lane names and branches

- `public-ui` → `codex/closeout-public-ui-20260624`
- `portal-auth-nav` → `codex/closeout-portal-auth-nav-20260624`
- `class-drive-intake` → `codex/closeout-class-drive-intake-20260624`
- `assistant-ramble-usage` → `codex/closeout-assistant-ramble-usage-20260624`
- `stripe-sandbox` → `codex/closeout-stripe-sandbox-20260624`
- `vimeo-media` → `codex/closeout-vimeo-media-20260624`
- `operator-walkthrough` → `codex/closeout-operator-walkthrough-20260624`

## Step 7 — Push and report

Push the integration branch and open/update one draft PR.

Do not merge or deploy.

Write the control-lane handoff files:

- `HANDOFF.md`
- `RESULT.json`
- `TESTS.md`
- `FILES.txt`
- `BLOCKERS.md`

Commit and push them.

## Required final response

Return exactly:

1. `CONTROL_BRANCH`
2. `INTEGRATION_BASE_SHA`
3. `CONTROL_PR_URL`
4. `CONTROL_MANIFEST_PATH`
5. `MASTER_SHA`
6. `PR14_HEAD`
7. `PR15_HEAD`
8. `DEPLOYED_SHA`
9. `PRESERVATION_BRANCH`
10. `PRESERVATION_SHA`
11. `RUN_STATUS`
12. `QUEUE_STATUS`
13. `UNRESOLVED_BLOCKERS`
14. `SAFE_TO_START_PARALLEL_LANES: YES|NO`

Then give a concise plain-English explanation of:

- what was preserved;
- what was superseded;
- what is now canonical;
- what remains unmerged;
- why parallel lanes are safe to start.

## Completion criteria

Do not mark this Goal complete until:

- unique local work is preserved or explicitly superseded;
- PR #14 and PR #15 are reconciled into one integration base;
- stale run metadata is repaired;
- run commands pass;
- tasks and Decisions are deduplicated;
- the control manifest is committed and pushed;
- a draft integration PR exists;
- `SAFE_TO_START_PARALLEL_LANES` is `YES`.
