# W1 Migration Plan

Migration draft:

`migrations/parallel-20260619-core-001-platform-core.sql`

## Plan

1. Review current production schema before execution.
2. Back up the database.
3. Run the additive migration in a staging or local database first.
4. Verify existing app routes still boot and existing workspace/project rows
   have canonical `instance_id`, `organization_id`, and `brand_id` links.
5. Wire shared Express startup in Prompt 05 after W1 merge review.
6. Only after operator approval, apply to production and run live smoke.

## Additive Changes

- Adds platform instance, organization, and brand tables.
- Extends `bna_projects` for canonical instance/org/brand/module links.
- Extends `bna_workspace_memberships` for instance and invitation state.
- Adds role audit, module visibility, identity-key, student-profile,
  guardian-relationship, provider-workspace-assignment, community group,
  community resource, course module, video asset, lesson resource, progress
  event, neutral goal/reward lifecycle, and domain record link tables.

## Compatibility

- Reuses current `bna_projects`, `bna_workspaces`, `bna_workspace_settings`,
  `bna_people`, `bna_students`, `bna_service_provider_profiles`,
  `bna_learning_communities`, `bna_courses`, `bna_course_lessons`,
  `bna_course_enrollments`, `bna_tasks`, and calendar/task/comment surfaces.
- Does not drop or rename existing tables.
- Does not mutate production data in this worker.

## Rollback

Because the migration is additive, rollback can leave unused columns/tables in
place. If a hard rollback is approved later, drop only the W1-created
`bna_platform_*`, neutral lifecycle, video/resource, and
`bna_domain_record_links` objects after confirming no merged code depends on
them.
