# Deployment

No manual deployment is planned for this acceptance branch unless runtime code
or live Operations behavior changes.

## Verified Current Live Deployment

- Railway project/service: `skillful-motivation`
- Deployment ID: `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7`
- Deployed SHA:
  `116fea3339a922b045857f7ece8cc9a64e7cda64`
- Deployment status: SUCCESS
- Commit message: `Close final release run cleanup`
- Live health readback:
  `https://bneineviimacademy.org/api/health` returned HTTP 200 with
  `status=ok`, database connected, and Buffer social provider.

## Live Smoke Evidence

- `ops/live-smokes/2026-06-24T17-25-03-642Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-24T17-25-11-405Z-public-route-privacy-smoke.md`

## Deployment Decision

The acceptance changes are documentation, run metadata, evidence, and local
operator scripts. They do not require a manual Railway deployment. If the PR
merge triggers an automatic Railway deployment, verify it separately; do not
run a meaningless manual deploy just to move a docs-only commit.
