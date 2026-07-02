# Evidence

Evidence will be appended during closeout.

Initial evidence:

- Clean integration branch:
  `codex/one-time-clean-integration-20260702`.
- Source PR retained as source material only:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/62`.
- Raw intake:
  `raw-input/RAW-20260702-005-one-time-clean-integration-from-pr62.md`.
- Requirement register:
  `tasks-pending/2026-07-02-one-time-clean-integration-from-pr62.md`.

## Clean Integration Evidence

- Clean branch created from current `origin/master`:
  `codex/one-time-clean-integration-20260702`.
- PR #62 was not merged or force-applied. Only selected setup/readiness
  artifacts were restored from it.
- Old master active run
  `ops/execution-runs/2026-06-30-current-systems-closeout/run.json` was marked
  inactive so this run is the only active execution run.

## Setup Readiness Evidence

- No-write setup readiness report:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
  and `.json`.
- Railway provisioning dry-run report:
  `ops/one-time-mishnah/onetime-railway-provisioning-report.json`.
- Separate One Time provisioning plan now uses
  `join.onetimeonetime.com` and non-secret
  `ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com`.
- DB bootstrap dry-run inspected the migration chain, seed SQL, and isolation
  scan without mutation.

## External Blockers

The setup checker reports `0/8` external setup areas ready. Missing fields are
recorded in the readiness report for:

- Separate One Time Railway project/service/environment labels and non-secret
  env values.
- Separate One Time database alias.
- `join.onetimeonetime.com` custom-domain attachment/DNS confirmation.
- Zoom session alias.
- Vimeo token alias and Drive drop-folder alias.
- Rabbi Stripe sandbox test key and $67/month price/product alias.
- Whapi/WAPI token, instance, and phone number.
- Final campaign copy/list/suppression proof, gated until the live join link
  exists.

## PR Evidence

- Commit pushed:
  `13e87314b10c18ce9eb76d53365eed1c3cd13d53`.
- Draft PR #63:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/63`.
- PR status after creation: draft, `mergeStateStatus=CLEAN`, base `master`,
  head `codex/one-time-clean-integration-20260702`.
