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

