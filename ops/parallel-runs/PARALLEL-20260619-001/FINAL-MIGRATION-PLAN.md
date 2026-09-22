# Final Migration Plan

Local migration status:

- W1 additive core migration exists at `migrations/parallel-20260619-core-001-platform-core.sql`.
- Prompt 05 did not run production migrations.
- Prompt 05 added an idempotent `bna_workspaces_type_check` drop/recreate before workspace backfill inserts in `server.js`.

Production release plan:

1. Create a database backup.
2. Confirm Railway target environment and `DATABASE_URL`.
3. Run migration in staging or a disposable restore first.
4. Verify `bna_workspaces.type` accepts `family`, `household`, `service_provider`, `provider`, `project`, `community`, `school`, and `super_admin`.
5. Run RBAC/isolation smoke for BNA, One Time, provider, parent, student, and public scopes.
6. Record migration output and rollback point in the active run.
7. Only then run live app smoke and consider release status.

Blocked production gates:

- Production DB access.
- Operator approval for migration window.
- Railway deploy/doctor.
- Live smoke.
