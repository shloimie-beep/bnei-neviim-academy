const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..', '..');
const migrationPath = path.join(root, 'migrations', 'parallel-20260619-core-001-platform-core.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');

test('platform core migration is additive, idempotent, and gated from production', () => {
  assert.match(migration, /Do not run against production/i);
  assert.match(migration, /Rollback \/ backup notes/i);
  assert.match(migration, /BEGIN;/);
  assert.match(migration, /COMMIT;/);
  assert.doesNotMatch(migration, /\bDROP\s+TABLE\b/i);
  assert.doesNotMatch(migration, /\bDROP\s+COLUMN\b/i);
  assert.doesNotMatch(migration, /\bDELETE\s+FROM\b/i);
});

test('migration adds canonical instance, organization, brand, membership, and module visibility model', () => {
  for (const needle of [
    'CREATE TABLE IF NOT EXISTS bna_platform_instances',
    'CREATE TABLE IF NOT EXISTS bna_platform_organizations',
    'CREATE TABLE IF NOT EXISTS bna_platform_brands',
    'ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS instance_id',
    'ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS organization_id',
    'ALTER TABLE bna_projects ADD COLUMN IF NOT EXISTS brand_id',
    'CREATE TABLE IF NOT EXISTS bna_workspace_module_visibility',
    'CREATE TABLE IF NOT EXISTS bna_platform_role_audit_events',
    'ALTER TABLE bna_workspace_memberships ADD COLUMN IF NOT EXISTS invitation_state',
  ]) {
    assert.ok(migration.includes(needle), needle);
  }
});

test('migration extends existing people, student, service provider, community, and course tables without duplicating them', () => {
  for (const needle of [
    'CREATE TABLE IF NOT EXISTS bna_person_identity_keys',
    'ALTER TABLE bna_people ADD COLUMN IF NOT EXISTS person_type',
    'ALTER TABLE bna_students ADD COLUMN IF NOT EXISTS workspace_id',
    'CREATE TABLE IF NOT EXISTS bna_student_profiles',
    'CREATE TABLE IF NOT EXISTS bna_guardian_relationships',
    'CREATE TABLE IF NOT EXISTS bna_service_provider_workspace_assignments',
    'ALTER TABLE bna_learning_communities ADD COLUMN IF NOT EXISTS instance_id',
    'CREATE TABLE IF NOT EXISTS bna_community_groups',
    'CREATE TABLE IF NOT EXISTS bna_community_resources',
    'ALTER TABLE bna_courses ADD COLUMN IF NOT EXISTS instance_id',
    'CREATE TABLE IF NOT EXISTS bna_course_modules',
    'CREATE TABLE IF NOT EXISTS bna_video_assets',
    'CREATE TABLE IF NOT EXISTS bna_lesson_video_assets',
    'CREATE TABLE IF NOT EXISTS bna_course_progress_events',
  ]) {
    assert.ok(migration.includes(needle), needle);
  }

  assert.doesNotMatch(migration, /CREATE TABLE IF NOT EXISTS bna_workspaces \(/);
  assert.doesNotMatch(migration, /CREATE TABLE IF NOT EXISTS bna_people \(/);
  assert.doesNotMatch(migration, /CREATE TABLE IF NOT EXISTS bna_tasks \(/);
});

test('migration adds neutral goal and reward lifecycle plus cross-domain links', () => {
  for (const needle of [
    'CREATE TABLE IF NOT EXISTS bna_goals',
    'CREATE TABLE IF NOT EXISTS bna_goal_milestones',
    'CREATE TABLE IF NOT EXISTS bna_reward_catalog_items',
    'CREATE TABLE IF NOT EXISTS bna_reward_rules',
    'CREATE TABLE IF NOT EXISTS bna_reward_assignments',
    'CREATE TABLE IF NOT EXISTS bna_reward_audit_events',
    'CREATE TABLE IF NOT EXISTS bna_domain_record_links',
    "'task', 'decision', 'comment', 'calendar_event', 'source_intake', 'agent_run'",
  ]) {
    assert.ok(migration.includes(needle), needle);
  }
});
