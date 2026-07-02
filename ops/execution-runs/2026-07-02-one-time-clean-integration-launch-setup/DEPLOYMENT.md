# Deployment

No deployment is required for this clean integration branch before PR review.

This branch adds setup/readiness tooling, launch handoff artifacts, execution
run records, and a provisioning-plan correction from `app.onetimeonetime.com`
to `join.onetimeonetime.com`. It does not implement Rabbi UI fixes and does not
change the deployed BNA runtime path by itself.

The separate One Time deploy/live-smoke packet remains blocked until
`npm run one-time:setup:check -- --write-report` reports the external Railway,
database, and `join.onetimeonetime.com` gates are ready.

Post-setup packet:
`ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`
