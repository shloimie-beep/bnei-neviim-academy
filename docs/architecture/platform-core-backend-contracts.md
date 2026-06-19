# Platform Core Backend Contracts

Worker: W1
Run: PARALLEL-20260619-001
Requirement: REQ-20260619-401

## Purpose

This package creates the reusable backend core for BNA, One Time, future
service-provider workspaces, normal SaaS tenants, and partner-owned
single-tenant deployments.

The implementation deliberately avoids `server.js` and shared entrypoints. It
adds owned CommonJS services under `src/platform/**`, an additive migration
draft under `migrations/`, and focused tests under `tests/platform-core/`.

## Canonical Layers

- Deployment instance: represented by `bna_platform_instances`.
- Organization/account: represented by `bna_platform_organizations`.
- Workspace/project: reuses `bna_projects` and current workspace compatibility
  tables, extended with `instance_id`, `organization_id`, `brand_id`, and
  `module_visibility`.
- Brand configuration: represented by `bna_platform_brands`.
- Membership/role: reuses `bna_workspace_memberships`, extended with
  `instance_id`, `invitation_state`, and role audit events.
- Module visibility: represented by `bna_workspace_module_visibility`.

## Service Modules

- `src/platform/core`: result contracts, stable IDs, context normalization.
- `src/platform/rbac`: canonical roles, permission checks, workspace isolation,
  assigned verifier gates, self-view guards, visible module filtering.
- `src/platform/domain`: person dedupe/upsert planning, student profiles,
  guardian links, service-provider profiles, cross-domain record links.
- `src/platform/community`: community, group/channel, post/comment, pinned
  resource builders with workspace enforcement.
- `src/platform/courses`: course, module, lesson, provider-neutral video asset,
  enrollment, and progress builders.
- `src/platform/rewards`: neutral goals, milestones, reward catalog/rules,
  assignment, eligibility, award, and redemption lifecycle.

All service functions return normalized `{ ok, data, error, meta }` results and
do not require external credentials.

## Isolation Rules

The RBAC layer enforces:

- instance boundary before workspace/action checks;
- active workspace membership;
- explicit global super admin for cross-instance access;
- infrastructure access limited to `super_admin` and `instance_owner`;
- verifier access limited to assigned agent runs;
- student/member self-read and own-progress restrictions;
- module visibility by role and workspace.

## Migration Strategy

The migration is additive and idempotent:

- no destructive table drops;
- no destructive column drops;
- reuses existing tables where they already carry the right meaning;
- adds neutral tables only for missing platform concepts;
- adds indexes for workspace, role, progress, reward, video, and link lookups;
- includes rollback/backup notes and production gate language.

## Integration Strategy

Prompt 05 should wire the services into shared Express routes after worker
branches are merged. The integration note in
`ops/parallel-runs/PARALLEL-20260619-001/workers/W1/INTEGRATION.md` lists
suggested routes, middleware, request/response contracts, audit events, and
tests.

No production migration, deployment, live smoke, Railway mutation, credential
copy, DNS change, or external write was performed by W1.
