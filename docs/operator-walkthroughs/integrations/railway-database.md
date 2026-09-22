# Railway / Database Walkthrough

Purpose: BNA web runtime, Postgres database, deployment doctor, live smoke,
worker process, and environment-variable store.

1. Open `/integration-setup.html#railway-database`.
2. Open https://railway.com/dashboard.
3. Confirm the exact project.
4. Confirm the exact service.
5. Confirm the exact environment.
6. Use these variable names:
   - `DATABASE_URL`
   - `RAILWAY_TOKEN`
   - `RAILWAY_API_TOKEN`
   - `RAILWAY_SERVICE_NAME`
   - `RAILWAY_ENVIRONMENT`
   - `BNA_RAILWAY_PROCESS`
   - `SESSION_SECRET`
7. Store secrets only in Railway Variables or the approved local secret store.
8. Run `npm run railway:doctor`.
9. Expected success: doctor identifies the target service/environment.
10. Expected failure: missing token, missing project, or auth error is recorded.
11. External effects: doctor is read-only. Deploy is a separate explicit step.
12. Live acceptance requires deployment approval, live smoke, and deployed
    commit proof.
