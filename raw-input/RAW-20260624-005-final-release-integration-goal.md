# CODEX GOAL — Final Integration, Release, Deployment, Live Verification, and Guarded Recovery

Create and activate a Goal named:

`BNA FINAL RELEASE — INTEGRATE ALL LANES, MERGE, DEPLOY, LIVE-VERIFY, AND RECOVER CLASS DATA`

Run this Goal only after Prompts 02–08 have pushed their branches and handoff packets.

Do not mark complete until the authoritative release state is recorded and pushed.

## Owner authorization phrases

The owner grants:

- `READ_EXTERNAL_PRODUCTION_STATE`
- `MERGE_RELEASE_CANDIDATE`
- `DEPLOY_AND_LIVE_VERIFY`
- `APPLY_GUARDED_CLASS_BACKFILL`

These permissions apply only under the safety gates in this prompt.

They do not authorize:

- real Stripe charges;
- real user sends;
- public student-media publication;
- unrelated production mutations;
- destructive deletion;
- secret exposure;
- DNS changes.

## Step 1 — Verify all lane handoffs

Read:

`ops/parallel-closeout/2026-06-24-clean-slate-system-closeout/CONTROL.json`

Then read every lane:

- public-ui;
- portal-auth-nav;
- class-drive-intake;
- assistant-ramble-usage;
- stripe-sandbox;
- vimeo-media;
- operator-walkthrough.

For each, verify:

- branch exists remotely;
- head SHA matches `RESULT.json`;
- base SHA matches control manifest;
- tests are recorded;
- external writes are recorded;
- blockers are exact;
- `SHARED-PATCH.diff` is understood;
- no lane modified forbidden central files;
- no secret leaked.

Do not integrate a lane with uncommitted/unpushed work.

## Step 2 — Rebase/merge current master safely

Fetch and inspect current `origin/master`.

If master changed since the control base:

- merge current master into the integration branch;
- resolve intentionally;
- rerun base tests;
- update control evidence.

Do not force push master or rewrite published history.

## Step 3 — Integrate lane branches

Use the integration branch created by Prompt 01.

Integrate in this order unless evidence requires a documented alternative:

1. public UI;
2. portal auth/navigation;
3. class/Drive intake;
4. assistant/ramble/API usage;
5. Stripe;
6. Vimeo;
7. operator walkthrough.

Apply each lane’s shared patch only after reviewing it against the current integrated files.

After each lane:

- run focused tests;
- record conflicts;
- record decisions;
- commit a distinct integration checkpoint.

Do not use blanket “ours” or “theirs.”

## Step 4 — Resolve PR #14, PR #15, and local-closeout history

Confirm the integration branch contains all valid work from:

- PR #14;
- PR #15;
- preserved local Rabbi closeout.

Create a supersession matrix.

Do not merge PR #14 and PR #15 separately if doing so would duplicate or lose work.

Preferred release:

- one final integration PR;
- PR #14 and PR #15 marked superseded by the final PR after verification;
- no orphan deployed commit.

## Step 5 — Wire shared routes and UI

Integrate lane-requested changes into:

- `server.js`;
- Operations navigation;
- provider navigation;
- integration readiness;
- setup center;
- API usage endpoint;
- Stripe routes;
- Vimeo routes;
- class diagnostic routes;
- assistant routes.

Verify server-side authorization for every new endpoint.

No public page may expose secrets or production-only diagnostics.

## Step 6 — Migrations and database readiness

Review all migration/schema proposals.

Before any production apply:

- snapshot/backup;
- migration dry run;
- rollback plan;
- transaction strategy;
- compatibility with current deployed code;
- tenant-isolation review;
- secret audit.

Apply only migrations required for the release and proven safe.

Record exact migration IDs and results.

## Step 7 — Full release gate

Run, at minimum:

- install/lockfile consistency;
- syntax checks;
- focused lane suites;
- full `npm test`;
- owner-review role flows;
- route inventory;
- public visual checks;
- assistant runtime checks;
- external readiness checks;
- unified-login tests;
- Rabbi workspace tests;
- tenant-isolation tests;
- class ingestion tests;
- dry-run backfill tests;
- Stripe mock/sandbox tests;
- Vimeo mock/private-test checks;
- setup-center tests;
- watchdog links;
- watchdog actions;
- watchdog security;
- secrets audit;
- staged leak scan;
- JSON/JSONL parse;
- run status;
- run validation;
- run blockers;
- run next;
- source coverage;
- stale-evidence validation;
- `git diff --check`.

All evidence must use the exact release SHA.

If GitHub Actions still cannot be attached because of missing workflow scope:

- attempt no insecure workaround;
- record the blocker;
- use the deterministic local release gate;
- do not misrepresent checks as attached;
- continue merge only if repository policy permits local verified release and all mandatory gates pass.

## Step 8 — Merge

When:

- final PR is mergeable;
- required review/release policy is satisfied;
- full release gate passes;
- rollback plan exists;

mark ready and merge the final integration PR to `master`.

Record:

- final PR;
- merge SHA;
- master SHA;
- superseded PRs;
- merge method.

Do not leave the only deployed code on an unmerged branch.

## Step 9 — Deploy and live-smoke

Deploy merged `master` to Railway.

Verify deployment reaches success.

Run live smokes for:

- public homepage;
- header/hero gap;
- active tabs;
- public navigation;
- each login entry;
- role chooser;
- parent;
- student;
- provider;
- Rabbi Scheller workspace;
- super-admin view-as;
- One Time/member/classroom;
- setup center;
- assistant endpoint;
- API usage;
- class diagnostic read-only endpoint;
- Stripe readiness;
- Vimeo readiness;
- wrong-role;
- API failure;
- 404/403;
- mobile/tablet/desktop.

Compare deployed SHA to merged SHA.

Do not claim live if they differ.

## Step 10 — Guarded class backfill

Read Prompt 04’s:

`BACKFILL-RECOMMENDATION.json`

Apply only when all are true:

- `safe_to_apply` is true;
- exact jobs are listed;
- dry run passes;
- no unresolved student ambiguity;
- backup/snapshot succeeded;
- expected row counts are recorded;
- transaction/rollback is ready;
- apply is idempotent;
- release is stable;
- credentials/targets are configured.

The owner conditionally authorizes the exact recommended set. The prior suspected range was jobs 64–74, but do not assume that range if the lane evidence differs.

Apply with:

`APPLY_GUARDED_CLASS_BACKFILL`

After apply:

- read back exact rows;
- rerun dry run and expect zero changes;
- verify class sessions;
- scores;
- questions;
- profiles;
- accountability;
- Operations UI;
- parent/student permitted views.

On mismatch:

- stop;
- rollback;
- record exact evidence;
- do not continue bulk mutation.

## Step 11 — Stripe and Vimeo live readiness

Stripe:

- keep live charging disabled;
- verify sandbox state;
- verify UI labels;
- verify no test objects appear as live;
- do not activate live mode.

Vimeo:

- verify private synthetic test evidence;
- verify no real class asset was used;
- verify member playback only if entitlement permits;
- do not publicly publish.

## Step 12 — Canonical records

Update:

- active run;
- requirement register;
- tasks;
- Decisions;
- `MEMORY.md`;
- `TASKS.md`;
- changelog;
- ledger;
- source truth;
- owner-review report;
- deployment evidence;
- live-smoke evidence;
- setup walkthrough links;
- next-session instructions.

Close completed lane tasks.

Resolve answered Decisions.

Keep only true remaining external blockers.

Do not delete history.

## Step 13 — Clean worktrees safely

After merge/deploy/live verification:

- identify integrated worktrees;
- ensure all unique commits are remote;
- ensure no untracked unique work remains;
- archive required evidence;
- prune only safe worktrees/branches;
- do not delete unknown files;
- write cleanup report.

## Required final response

Return:

1. Final integration branch
2. Final PR URL
3. Final PR head
4. Merge SHA
5. Master SHA
6. Deployed SHA
7. Deployment ID
8. Live-smoke result
9. PR #14 disposition
10. PR #15 disposition
11. Local Rabbi closeout disposition
12. Full test totals
13. Migration results
14. Class dry-run result
15. Class backfill result
16. Stripe sandbox result
17. Vimeo test result
18. Assistant result
19. Setup-center link
20. Remaining Decisions
21. Exact owner links
22. Rollback reference
23. Overall status

Use:

- `LIVE VERIFIED`
- `PARTIAL — exact reason`
- `BLOCKED — exact reason`

## Completion criteria

Do not mark complete unless:

- all valid lane work is integrated;
- central tests pass;
- final PR is merged, or an exact permission failure prevents it;
- merged SHA is deployed;
- live smokes pass;
- any applied backfill is verified and idempotent;
- canonical records are updated and pushed;
- no unique local work remains unpreserved.
