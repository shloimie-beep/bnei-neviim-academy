# Deployment

## Baseline

- Pre-run Railway deployment: `f9921a2d-d614-44df-88c0-392d810ddebd`
- Pre-run Railway doctor: PASS
- Pre-run live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`

## Batch 3

- Deployment ID: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Deployed commit: `f8a2fd62`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Task/Decision live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`

Prior failed checks during the same batch:

- Deployment `fbf13644-a344-4fd0-8a23-0276b2faff0c` exposed an ambiguous
  `project_key` SQL reference for `task_view=one_time_tasks`; fixed in
  `a28a9332`.
- Deployment `1b174b4f-4492-4ecf-b307-55a1b990031d` allowed text-matched BNA
  rows into the One Time task filter; fixed in `f8a2fd62`.
- `npm run app:smoke:operations-workspace-taxonomy` failed on the unrelated
  pre-existing `Family Directory` HTML expectation. The focused Batch 3 smoke
  passed after the scoping fix.

## Batch 4

- Deployment ID: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Deployed commit: `c8d93646`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Prior failed checks during the same batch:

- Initial deploy command in the clean PR worktree failed before upload because
  `.secrets/railway-token.txt` is intentionally not present there. The deploy
  was rerun with `RAILWAY_TOKEN` loaded from the main repo local secret file
  without printing the token.
- First focused workspace-user smoke queried `/health`; the deployed app uses
  `/api/health`. The smoke was corrected and rerun successfully.

## Batch 5

- Deployment ID: `9c31c21f-143e-46f3-b95d-2b458a848d9f`
- Deployed commit: `90da952bf3a0c57ce60b4532e193f869a677df47`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`
- Focused visible-action live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`

Focused live smoke verified production health, task/decision action controls,
One Time class/session/appointment/video setup controls, integration setup
controls, and removal of the old generic placeholder handlers.

## Batch 6

- Deployment ID: `d6c09c49-8372-42d7-8b3b-a049ab24ad63`
- Deployed commit: `c98c06d7735ec19dec1684684a594de0636064c7`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`
- Production after-audit capture: PASS, 141 screenshots, 0 errors,
  `ops/ui-audits/2026-06-21-batch6-after-prod/ui-audit-report.md`
- Focused Operations filter-rail live smoke: PASS,
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`

Focused live smoke verified production health, Operations login, deployed
bundle markers for the top filter rail, absence of the old module toolbar,
single-row mobile filter rails at 430px/390px/360px, and no page-level
horizontal overflow at those mobile widths.

Prior failed checks during the same batch:

- `ops/live-smokes/2026-06-21T11-03-20-126Z-operations-filter-rail-live-smoke.md`
  failed because the smoke expected the Blocked filter ID to be `blocked`; the
  live app's stable ID is `pending`.
- `ops/live-smokes/2026-06-21T11-04-55-135Z-operations-filter-rail-live-smoke.md`
  failed because the smoke used `networkidle` on an Operations page that stays
  active after DOM readiness. The successful rerun used explicit selector
  waits.

