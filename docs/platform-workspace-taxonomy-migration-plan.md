# Platform Workspace Taxonomy Migration Plan

Status: non-destructive compatibility lane.

Canonical keys:

- Super Admin: `platform_control` / `platform_operations` / `platform_super_admin`
- BNA School: `bna_school` / `bna_school`
- One Time connector: `one_time` / `one_time_mishnayos`

Compatibility aliases remain accepted through `src/lib/bna/workspace-taxonomy.js`:

- `bna_platform` -> `platform_control`
- `bna_school_platform` -> `bna_school`
- `bna` -> `bna_school`
- `rabbi_sheller_provider` -> `one_time`
- `one_time_mishnah_class` -> `one_time_mishnayos`

This lane does not rename existing database rows. Runtime reads may still use legacy keys through `legacyRuntimeWorkspaceKey` and `legacyRuntimeProjectKey` until a separate migration is approved, tested, and deployed.

Future destructive work is blocked until there is an explicit migration packet covering data inventory, row counts, rollback, route/API compatibility, production-readback proof, and privacy-isolation evidence.
