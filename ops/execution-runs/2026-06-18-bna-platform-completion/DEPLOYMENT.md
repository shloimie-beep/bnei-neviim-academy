# Deployment

No deployment is approved or performed in this recovery batch.

Production gate:

1. Finish all non-blocked local requirements.
2. Run the final local suite and post-fix audit where auth/audit package is available.
3. Present commit set, migrations, test results, rollback plan, affected live routes.
4. Wait for explicit operator release approval.
5. Deploy once, record deployment ID/commit, and run targeted live smoke.

Live-required IDs remain open until that gate is approved and verified.
