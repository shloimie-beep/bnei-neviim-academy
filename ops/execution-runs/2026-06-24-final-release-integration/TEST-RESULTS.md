# Test Results

Preflight commands on 2026-06-24:

- PASS `git fetch --all --prune`
- PASS remote lane RESULT inspection for all seven lane branches
- PASS `npm run bna:run:status` on the clean-slate control run
- PASS `npm run bna:run:validate` on the clean-slate control run
- PASS `npm run bna:run:next` on the clean-slate control run
- PASS `npm run bna:run:blockers` on the clean-slate control run

- PASS `npm run bna:run:validate` on the final-release run
- PASS `npm run bna:run:status` on the final-release run
- PASS `npm run bna:run:next` selected `REQ-20260624-020`
- PASS `npm run bna:run:blockers` lists only `REQ-20260624-028`
- PASS JSON/JSONL parse for final-release run files and ledger
- PASS `git diff --check`
- PASS `npm run secrets:audit`

Release base sync commands:

- PASS `git fetch --all --prune`
- PASS `git status --short --branch` clean on
  `codex/clean-slate-integration-20260624`
- PASS `git merge-base HEAD origin/master` equals `origin/master`
- PASS `git rev-list --left-right --count HEAD...origin/master` returned
  `89 0`; no `origin/master` commits are missing from the release branch

Lane integration checks:

- PASS public UI: syntax checks, focused suites 35/35, public UI smoke,
  JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS portal/auth/nav: focused suites 77/77 and 12/12, four browser smokes,
  JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS class/Drive: syntax checks, class suite 86/86, JSON parse,
  `git diff --check`, `npm run secrets:audit`; no backfill apply
- PASS assistant/ramble/usage: focused suite 33/33,
  `npm run owner-review:assistant-runtime`, `npm run watchdog:actions`,
  syntax checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS Stripe sandbox: focused suite 21/21, `npm run stripe:sandbox-smoke`
  status `live_key_blocked` and `external_write_performed=false`, syntax
  checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS Vimeo media: focused suite 19/19,
  `node scripts/vimeo-private-smoke.mjs --json` status `preview_only`,
  syntax checks, JSON parse, `git diff --check`, `npm run secrets:audit`
- PASS operator walkthrough: setup suite 7/7, syntax checks, JSON parse,
  `git diff --check`, `npm run secrets:audit`

Route/UI/server authorization wiring checks:

- PASS `node --check server.js`
- PASS `node --check public/js/integration-setup.js`
- PASS `node --test tests/class-drive-intake-shared-patch.test.js tests/class-drive-intake-reconcile.test.js`
  (17/17)
- PASS `node --test tests/provider-api-usage-readiness.test.js tests/assistant-model-readiness.test.js tests/ramble-routing-pipeline.test.js`
  (23/23)
- PASS `node --test tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js tests/one-time-resend-vimeo-stripe-safe-smoke.test.js tests/rabbi-checkout-access.test.js`
  (21/21)
- PASS `node --test tests/integration-setup-catalog.test.js tests/integration-setup-ui.test.js tests/operator-walkthrough-links.test.js`
  (7/7)
- PASS `npm run watchdog:actions` with `finding_count=0`
- PASS `npm run watchdog:security` with `finding_count=0`
- PASS `npm run bna:run:validate`
- PASS `git diff --check` with Windows line-ending warnings only
- PASS `npm run secrets:audit` with 4581 tracked paths and 0 findings
- PASS `npm run stripe:sandbox-smoke` with status `live_key_blocked`,
  `external_write_performed=false`, `no_real_customer_data=true`, and
  `no_real_funds=true`
- PASS `node scripts/vimeo-private-smoke.mjs --json` exited safely with
  status `preview_only`, `external_write_performed=false`, and
  `public_publish_performed=false`

Migration readiness checks:

- PASS active SQL candidate inventory reviewed:
  `migrations/20260624-provider-api-usage-persistence.sql`,
  `migrations/parallel-20260624-stripe-billing-lifecycle.sql`,
  `railway-migration-2026-06-21-one-time-transcript-privacy.sql`,
  `railway-migration-2026-06-21-one-time-trial-referral-config.sql`,
  `railway-migration-2026-06-23-service-provider-studio.sql`, and
  `migrations/parallel-20260619-core-001-platform-core.sql`
- PASS destructive marker review: provider API usage and Stripe lifecycle
  candidates have no destructive markers; legacy `migrate-railway.sql`
  contains `DROP TABLE` markers and is explicitly excluded
- PASS readiness report records backup, target inventory, dry-run, apply,
  rollback, post-apply readback, tenant isolation, privacy, and no-secret
  requirements
- PASS no production database read, write, schema apply, or backfill was
  performed

Local release-gate checks for `REQ-20260624-025`:

- PASS pushed release-code SHA:
  `03454ea4a9152946d21452141ed427277705fab1`
- PASS `npm run bna:release-gate -- --json`: `ok=true`,
  `mode=dry_run`, `head_pushed=true`, `dirty_total=0`, no blockers, no
  production mutation, no deploy, and no live verification.
- PASS `npm test` on the pushed release-code SHA (1301/1301).
- PASS `node --check server.js`, `node --check public/js/integration-setup.js`,
  `node --check scripts/smoke-owner-review-external-readiness.mjs`, and
  `node --check scripts/smoke-owner-review-public-visual.mjs`.
- PASS `npm run owner-review:routes`: 692 routes, 35 HTML pages,
  0 orphan-review rows.
- PASS `npm run owner-review:role-flows`.
- PASS `npm run owner-review:visual`: `release-local` passed; current
  production deltas are recorded separately for later deploy/live-smoke proof.
- PASS `npm run owner-review:assistant-runtime`.
- PASS `npm run owner-review:external-readiness`: credential-free class,
  Stripe, and Vimeo readiness passed; real production/external actions remain
  gated.
- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`: none.
- PASS `npm run watchdog:links`, `npm run watchdog:actions`,
  `npm run watchdog:security`, `npm run watchdog:content`, and
  `npm run watchdog:communications` with `finding_count=0`.
- PASS `npm run watchdog:raw` with `ok=true`; it still reports two medium
  historical raw fallback findings for `RAW-20260618-002` and
  `RAW-20260617-020`.
- PASS `npm run secrets:audit`: 4586 tracked paths, 0 findings.
- PASS `git diff --check` with Windows line-ending warnings only.
- PASS `npm run stripe:sandbox-smoke`: `live_key_blocked`,
  `external_write_performed=false`, `no_real_customer_data=true`, and
  `no_real_funds=true`.
- PASS `node scripts/vimeo-private-smoke.mjs --json`: `preview_only`,
  `external_write_performed=false`, `public_publish_performed=false`, and
  `smoke_ran=false`.

Final merge, deploy, and live verification:

- PASS PR #16 marked ready and merged to `master` with merge commit
  `c14507ab121daa221689ba285c203605bf2d64bf`.
- PASS Railway deployment `e26fec62-1a08-43a8-abb9-1b030b0ea786` reports
  deployed commit `c14507ab121daa221689ba285c203605bf2d64bf` and status
  `SUCCESS`.
- PASS `railway service status --service skillful-motivation --environment production`.
- PASS `npm run railway:doctor`.
- PASS `npm run app:smoke`.
- PASS `npm run app:smoke:public-privacy`.
- PASS `railway run npm run app:smoke:student-auth`.
- PASS `railway run npm run app:smoke:operator-setup`.
- PASS `railway run npm run app:smoke:provider-classroom-settings`.
- PASS `railway run npm run app:smoke:class-upload-trace`.
- PASS `railway run npm run app:smoke:one-time-payment-access-class-links`.
- PASS `railway run npm run app:smoke:one-time-shared-review`.
- PASS generated final-release negative route smoke.
- PASS `node --check scripts/smoke-class-upload-trace-live.mjs`.
- PASS `node --check scripts/smoke-one-time-shared-review-live.mjs`.

Canonical record and cleanup checks:

- PASS `npm run bna:run:validate` after deployment evidence normalization.
- PASS `npm run bna:run:status`.
- PASS `npm run bna:run:next`.
- PASS `npm run bna:run:source-coverage`.
- PASS `npm run bna:run:stale-evidence`.
- PASS `npm run secrets:audit`: 4599 tracked paths, 0 findings.
- PASS JSON parse for final-release `requirements.json` and `run.json`.
- PASS `git diff --check` with Windows line-ending warnings only.
- PASS canonical record checkpoint pushed to `origin/master` as
  `d4253fd683e60e403f256cb2a2c30acf821f32e4`.
- PASS owned lane worktree cleanup: six clean, remote-backed, merged worktrees
  were removed without force.
- PASS local/remote branch cleanup: the six matching lane refs and the final PR
  integration ref were deleted only after ancestor checks.
- PASS shared Vimeo checkout retained because its local branch head was not an
  ancestor of `origin/master`.
