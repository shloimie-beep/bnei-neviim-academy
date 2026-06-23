-- W1 platform core migration draft.
-- Scope: additive, idempotent local migration for REQ-20260619-401.
-- Do not run against production until Prompt 05 reviews and operator approves.
--
-- Rollback / backup notes:
-- 1. Back up public schema before production execution.
-- 2. This migration intentionally avoids destructive renames and drops.
-- 3. Rollback is practical by leaving additive columns/tables unused, or by
--    dropping the bna_platform_* and bna_domain_record_links tables after
--    confirming no production code depends on them.

BEGIN;

CREATE TABLE IF NOT EXISTS bna_platform_instances (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  deployment_mode TEXT NOT NULL DEFAULT 'saas_tenant'
    CHECK (deployment_mode IN ('saas_tenant', 'single_tenant_partner')),
  canonical_codebase TEXT NOT NULL DEFAULT 'bna-platform',
  database_scope TEXT NOT NULL DEFAULT 'shared',
  domain_scope TEXT NOT NULL DEFAULT 'shared',
  secret_scope TEXT NOT NULL DEFAULT 'shared',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_platform_organizations (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER NOT NULL REFERENCES bna_platform_instances(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  owner_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(instance_id, slug)
);

CREATE TABLE IF NOT EXISTS bna_platform_brands (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES bna_platform_organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  domain_hint TEXT,
  theme_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  asset_refs JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'draft', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, slug)
);

INSERT INTO bna_platform_instances (
  slug, name, deployment_mode, canonical_codebase, database_scope, domain_scope, secret_scope, metadata
) VALUES (
  'bna-platform', 'BNA Platform', 'saas_tenant', 'bna-platform', 'shared', 'shared', 'shared',
  '{"source":"parallel-20260619-core-001","purpose":"default shared SaaS instance"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  canonical_codebase = EXCLUDED.canonical_codebase,
  updated_at = NOW();

INSERT INTO bna_platform_organizations (instance_id, slug, name, metadata)
SELECT id, 'bna', 'BNA', '{"source":"parallel-20260619-core-001","purpose":"default organization"}'::jsonb
FROM bna_platform_instances
WHERE slug = 'bna-platform'
ON CONFLICT (instance_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

INSERT INTO bna_platform_brands (organization_id, slug, name, metadata)
SELECT id, 'bna', 'BNA', '{"source":"parallel-20260619-core-001","purpose":"default brand"}'::jsonb
FROM bna_platform_organizations
WHERE slug = 'bna'
ON CONFLICT (organization_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL;
ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES bna_platform_organizations(id) ON DELETE SET NULL;
ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES bna_platform_brands(id) ON DELETE SET NULL;
ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS module_visibility JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS context_version INTEGER NOT NULL DEFAULT 1;

UPDATE bna_projects
SET instance_id = COALESCE(instance_id, (SELECT id FROM bna_platform_instances WHERE slug = 'bna-platform')),
    organization_id = COALESCE(organization_id, (SELECT id FROM bna_platform_organizations WHERE slug = 'bna')),
    brand_id = COALESCE(brand_id, (SELECT id FROM bna_platform_brands WHERE slug = 'bna')),
    module_visibility = COALESCE(module_visibility, '{}'::jsonb)
WHERE status <> 'archived';

CREATE TABLE IF NOT EXISTS bna_workspace_module_visibility (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enabled'
    CHECK (status IN ('enabled', 'disabled', 'coming_soon', 'archived')),
  allowed_roles TEXT[] NOT NULL DEFAULT '{}'::text[],
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'platform_core',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, module_key)
);

CREATE TABLE IF NOT EXISTS bna_platform_role_audit_events (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL,
  workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  membership_id INTEGER REFERENCES bna_workspace_memberships(id) ON DELETE SET NULL,
  actor_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  target_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  from_role TEXT,
  to_role TEXT,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_workspace_memberships ADD COLUMN IF NOT EXISTS instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL;
ALTER TABLE bna_workspace_memberships ADD COLUMN IF NOT EXISTS invitation_state TEXT NOT NULL DEFAULT 'active'
  CHECK (invitation_state IN ('draft', 'invited', 'active', 'paused', 'disabled', 'archived'));
ALTER TABLE bna_workspace_memberships ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMP;
UPDATE bna_workspace_memberships wm
SET instance_id = COALESCE(wm.instance_id, p.instance_id),
    invitation_state = CASE WHEN wm.active = FALSE THEN 'disabled' ELSE COALESCE(NULLIF(wm.invitation_state, ''), 'active') END
FROM bna_projects p
WHERE p.id = wm.workspace_id;

CREATE TABLE IF NOT EXISTS bna_person_identity_keys (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL REFERENCES bna_people(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE CASCADE,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('email', 'phone', 'name_workspace', 'external_id', 'student_code')),
  identity_value TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  source TEXT NOT NULL DEFAULT 'platform_core',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dedupe_key)
);

ALTER TABLE bna_people ADD COLUMN IF NOT EXISTS person_type TEXT NOT NULL DEFAULT 'unknown'
  CHECK (person_type IN ('unknown', 'member', 'student', 'guardian', 'staff', 'teacher', 'service_provider', 'operator'));
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS archive_state TEXT NOT NULL DEFAULT 'active'
  CHECK (archive_state IN ('active', 'paused', 'graduated', 'inactive', 'archived'));

CREATE TABLE IF NOT EXISTS bna_student_profiles (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  grade TEXT,
  school TEXT,
  invitation_state TEXT NOT NULL DEFAULT 'not_invited'
    CHECK (invitation_state IN ('not_invited', 'invited', 'active', 'paused', 'archived')),
  archive_state TEXT NOT NULL DEFAULT 'active'
    CHECK (archive_state IN ('active', 'paused', 'graduated', 'inactive', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, person_id)
);

CREATE TABLE IF NOT EXISTS bna_guardian_relationships (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  guardian_person_id INTEGER NOT NULL REFERENCES bna_people(id) ON DELETE CASCADE,
  student_person_id INTEGER NOT NULL REFERENCES bna_people(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'guardian',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, guardian_person_id, student_person_id, relationship)
);

CREATE TABLE IF NOT EXISTS bna_service_provider_workspace_assignments (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  provider_profile_id INTEGER REFERENCES bna_service_provider_profiles(id) ON DELETE SET NULL,
  legacy_provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE SET NULL,
  person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'service_provider',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'invited', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_learning_communities ADD COLUMN IF NOT EXISTS instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL;
ALTER TABLE bna_learning_communities ADD COLUMN IF NOT EXISTS workspace_project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_learning_communities ADD COLUMN IF NOT EXISTS moderation_state TEXT NOT NULL DEFAULT 'moderated'
  CHECK (moderation_state IN ('open', 'moderated', 'staff_only', 'archived'));

CREATE TABLE IF NOT EXISTS bna_community_groups (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES bna_learning_communities(id) ON DELETE CASCADE,
  group_key TEXT NOT NULL,
  label TEXT NOT NULL,
  channel_type TEXT NOT NULL DEFAULT 'discussion'
    CHECK (channel_type IN ('announcement', 'discussion', 'support', 'resource', 'private_review')),
  visibility TEXT NOT NULL DEFAULT 'workspace'
    CHECK (visibility IN ('private', 'staff', 'workspace', 'members', 'public')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(community_id, group_key)
);

CREATE TABLE IF NOT EXISTS bna_community_resources (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES bna_learning_communities(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES bna_community_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'link',
  url TEXT,
  visibility TEXT NOT NULL DEFAULT 'workspace'
    CHECK (visibility IN ('private', 'staff', 'workspace', 'members', 'public')),
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_courses ADD COLUMN IF NOT EXISTS instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL;
ALTER TABLE bna_courses ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_courses ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT 'v1';
ALTER TABLE bna_course_lessons ADD COLUMN IF NOT EXISTS module_id INTEGER;

CREATE TABLE IF NOT EXISTS bna_course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES bna_courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'workspace'
    CHECK (visibility IN ('private', 'student', 'parent', 'student_parent', 'community', 'workspace', 'public')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, slug)
);

CREATE TABLE IF NOT EXISTS bna_video_assets (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL,
  workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_asset_id TEXT,
  source_url TEXT,
  playback_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  privacy TEXT NOT NULL DEFAULT 'workspace'
    CHECK (privacy IN ('private', 'workspace', 'unlisted', 'public')),
  transcript_reference TEXT,
  status TEXT NOT NULL DEFAULT 'approved_reference'
    CHECK (status IN ('draft', 'approved_reference', 'blocked', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_video_assets_provider_asset
  ON bna_video_assets(workspace_id, provider, provider_asset_id)
  WHERE provider_asset_id IS NOT NULL AND trim(provider_asset_id) <> '';

CREATE TABLE IF NOT EXISTS bna_lesson_resources (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES bna_course_lessons(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL DEFAULT 'link',
  title TEXT NOT NULL,
  url TEXT,
  visibility TEXT NOT NULL DEFAULT 'student'
    CHECK (visibility IN ('private', 'student', 'parent', 'student_parent', 'community', 'workspace', 'public')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_lesson_video_assets (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES bna_course_lessons(id) ON DELETE CASCADE,
  video_asset_id INTEGER NOT NULL REFERENCES bna_video_assets(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'primary'
    CHECK (role IN ('primary', 'supplemental', 'review', 'preview')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'hidden', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 100,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lesson_id, video_asset_id, role)
);

CREATE TABLE IF NOT EXISTS bna_course_progress_events (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER REFERENCES bna_course_enrollments(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES bna_courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES bna_course_modules(id) ON DELETE SET NULL,
  lesson_id INTEGER REFERENCES bna_course_lessons(id) ON DELETE SET NULL,
  person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('started', 'in_progress', 'completed', 'archived')),
  source TEXT NOT NULL DEFAULT 'manual',
  idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_course_progress_events_idempotency
  ON bna_course_progress_events(idempotency_key)
  WHERE idempotency_key IS NOT NULL AND trim(idempotency_key) <> '';

CREATE TABLE IF NOT EXISTS bna_goals (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  assignee_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  group_ref TEXT,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'learning',
  target_value NUMERIC(12,2),
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  policy_key TEXT NOT NULL DEFAULT 'workspace_configured',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_goal_milestones (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES bna_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC(12,2),
  sort_order INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_reward_catalog_items (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL DEFAULT 'recognition',
  policy_state TEXT NOT NULL DEFAULT 'workspace_policy_required',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_reward_rules (
  id SERIAL PRIMARY KEY,
  reward_id INTEGER NOT NULL REFERENCES bna_reward_catalog_items(id) ON DELETE CASCADE,
  goal_id INTEGER REFERENCES bna_goals(id) ON DELETE CASCADE,
  milestone_id INTEGER REFERENCES bna_goal_milestones(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'progress_threshold',
  threshold_value NUMERIC(12,2) NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_reward_assignments (
  id SERIAL PRIMARY KEY,
  reward_id INTEGER NOT NULL REFERENCES bna_reward_catalog_items(id) ON DELETE CASCADE,
  assignee_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  group_ref TEXT,
  eligibility_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (eligibility_state IN ('pending', 'eligible_for_review', 'approved', 'rejected', 'expired')),
  award_state TEXT NOT NULL DEFAULT 'not_awarded'
    CHECK (award_state IN ('not_awarded', 'awarded', 'revoked', 'archived')),
  redeem_state TEXT NOT NULL DEFAULT 'not_redeemed'
    CHECK (redeem_state IN ('not_redeemed', 'redeemed', 'expired', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_reward_audit_events (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES bna_reward_assignments(id) ON DELETE SET NULL,
  reward_id INTEGER REFERENCES bna_reward_catalog_items(id) ON DELETE SET NULL,
  actor_person_id INTEGER REFERENCES bna_people(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_domain_record_links (
  id SERIAL PRIMARY KEY,
  instance_id INTEGER REFERENCES bna_platform_instances(id) ON DELETE SET NULL,
  workspace_id INTEGER REFERENCES bna_projects(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_type TEXT NOT NULL
    CHECK (target_type IN ('task', 'decision', 'comment', 'calendar_event', 'source_intake', 'agent_run')),
  target_id TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'related',
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, source_type, source_id, target_type, target_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_bna_projects_instance_org ON bna_projects(instance_id, organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_workspace_module_visibility_workspace ON bna_workspace_module_visibility(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_platform_role_audit_workspace ON bna_platform_role_audit_events(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_person_identity_keys_person ON bna_person_identity_keys(person_id);
CREATE INDEX IF NOT EXISTS idx_bna_student_profiles_workspace ON bna_student_profiles(workspace_id, archive_state);
CREATE INDEX IF NOT EXISTS idx_bna_guardian_relationships_student ON bna_guardian_relationships(student_person_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_service_provider_workspace_assignments_workspace ON bna_service_provider_workspace_assignments(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_community_groups_community ON bna_community_groups(community_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_community_resources_community ON bna_community_resources(community_id, status, pinned);
CREATE INDEX IF NOT EXISTS idx_bna_course_modules_course ON bna_course_modules(course_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_lesson_resources_lesson ON bna_lesson_resources(lesson_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_lesson_video_assets_lesson ON bna_lesson_video_assets(lesson_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_course_progress_events_enrollment ON bna_course_progress_events(enrollment_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_goals_workspace ON bna_goals(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_goal_milestones_goal ON bna_goal_milestones(goal_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_reward_catalog_items_workspace ON bna_reward_catalog_items(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_reward_assignments_reward ON bna_reward_assignments(reward_id, eligibility_state, award_state);
CREATE INDEX IF NOT EXISTS idx_bna_domain_record_links_source ON bna_domain_record_links(workspace_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_bna_domain_record_links_target ON bna_domain_record_links(workspace_id, target_type, target_id);

COMMIT;
