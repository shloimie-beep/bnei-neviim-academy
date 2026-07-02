const fs = require('node:fs');
const path = require('node:path');

const {
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeInstanceConfig,
} = require('./one-time');

const ONE_TIME_APP_INSTANCE = 'onetime';
const ONE_TIME_BRAND_KEY = 'onetime';
const ONE_TIME_PUBLIC_LANGUAGE = 'en';
const ONE_TIME_PUBLIC_DOMAIN = 'join.onetimeonetime.com';
const ONE_TIME_PUBLIC_URL = `https://${ONE_TIME_PUBLIC_DOMAIN}`;

const ENABLED_MODULES = Object.freeze([
  'Overview',
  'Decisions',
  'Parents',
  'Students',
  'Contacts/CRM',
  'Communications',
  'Live Class',
  'Attendance and Minutes',
  'Course',
  'Vimeo Library',
  'Lessons',
  'Worksheets/Resources',
  'Announcements',
  'Private Questions',
  'Support Tickets',
  'Payments/Trial/Access',
  'Milestones',
  'Achievements',
  'Individual Rewards',
  'Integrations',
  'Branding/Settings',
]);

const DISABLED_FEATURES = Object.freeze([
  'BNA school accountability',
  'BNA personal-goal coaching',
  'BNA student tutor bot',
  'unrestricted Mishnah study bot',
  'BNA classroom hierarchy',
  'unrelated BNA/family/student/accounting/content data',
]);

const NON_SECRET_VARIABLES = Object.freeze({
  APP_MODE: 'single_tenant',
  APP_INSTANCE: ONE_TIME_APP_INSTANCE,
  DEFAULT_WORKSPACE_KEY: ONE_TIME_WORKSPACE_KEY,
  DEFAULT_PROJECT_KEY: ONE_TIME_PROJECT_KEY,
  ONE_TIME_PUBLIC_DOMAIN,
  BRAND_KEY: ONE_TIME_BRAND_KEY,
  PUBLIC_LANGUAGE: ONE_TIME_PUBLIC_LANGUAGE,
  BNA_RAILWAY_PROCESS: 'web',
  BNA_COOKIE_SECURE: 'true',
  STUDENT_BOT_ENABLED: 'false',
  BNA_ACCOUNTABILITY_ENABLED: 'false',
  SEFARIA_STUDY_ASSISTANT_ENABLED: 'false',
});

const REQUIRED_SECRET_VARIABLES = Object.freeze([
  'DATABASE_URL',
  'SESSION_SECRET',
  'ONE_TIME_OWNER_USERNAME',
  'ONE_TIME_OWNER_PASSWORD',
  'ONE_TIME_MANAGER_USERNAME',
  'ONE_TIME_MANAGER_PASSWORD',
]);

const OPTIONAL_SECRET_VARIABLES = Object.freeze([
  'RESEND_API_KEY',
  'RESEND_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ZOOM_ACCOUNT_ID',
  'ZOOM_CLIENT_ID',
  'ZOOM_CLIENT_SECRET',
  'VIMEO_CLIENT_ID',
  'VIMEO_CLIENT_SECRET',
  'VIMEO_ACCESS_TOKEN',
]);

const PUBLIC_URL_VARIABLES = Object.freeze([
  'APP_URL',
  'BNA_APP_URL',
  'NEXT_PUBLIC_APP_URL',
  'PUBLIC_BASE_URL',
  'APP_BASE_URL',
]);

const DISALLOWED_SEED_PATTERNS = Object.freeze([
  /dratler/i,
  /bnei\s+neviim/i,
  /payment_intake/i,
  /telegram private/i,
  /raw private/i,
]);

function boolFromEnv(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return !['0', 'false', 'no', 'off', 'disabled'].includes(String(value).trim().toLowerCase());
}

function normalizeInstance(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function buildOneTimeRuntimeFlags(env = process.env) {
  const appInstance = normalizeInstance(env.APP_INSTANCE || env.BRAND_KEY || '');
  const appMode = normalizeInstance(env.APP_MODE || '');
  const singleTenant = appMode === 'single_tenant' || appMode === 'single_tenant_partner' || appInstance === ONE_TIME_APP_INSTANCE;
  return {
    app_mode: singleTenant ? 'single_tenant' : (env.APP_MODE || 'shared_workspace'),
    app_instance: singleTenant ? ONE_TIME_APP_INSTANCE : (appInstance || 'bna'),
    single_tenant: singleTenant,
    workspace_key: singleTenant ? ONE_TIME_WORKSPACE_KEY : (env.DEFAULT_WORKSPACE_KEY || 'bna'),
    project_key: singleTenant ? ONE_TIME_PROJECT_KEY : (env.DEFAULT_PROJECT_KEY || 'bna'),
    brand_key: singleTenant ? ONE_TIME_BRAND_KEY : (env.BRAND_KEY || 'bna'),
    public_language: singleTenant ? ONE_TIME_PUBLIC_LANGUAGE : (env.PUBLIC_LANGUAGE || 'en'),
    student_bot_enabled: singleTenant ? false : boolFromEnv(env.STUDENT_BOT_ENABLED, true),
    bna_accountability_enabled: singleTenant ? false : boolFromEnv(env.BNA_ACCOUNTABILITY_ENABLED, true),
    sefaria_study_assistant_enabled: singleTenant ? false : boolFromEnv(env.SEFARIA_STUDY_ASSISTANT_ENABLED, false),
    enabled_modules: singleTenant ? [...ENABLED_MODULES] : [],
    disabled_features: singleTenant ? [...DISABLED_FEATURES] : [],
  };
}

function secretReadiness(name, env = process.env) {
  return {
    name,
    configured: Boolean(String(env[name] || '').trim()),
    value: '[redacted]',
  };
}

function buildOneTimeRailwayPlan(env = process.env, options = {}) {
  const publicDomain = options.publicDomain || env.ONE_TIME_PUBLIC_DOMAIN || ONE_TIME_PUBLIC_DOMAIN;
  const baseUrl = options.baseUrl || env.APP_URL || env.BNA_APP_URL || `https://${publicDomain}`;
  const publicVariables = Object.fromEntries(PUBLIC_URL_VARIABLES.map((name) => [name, baseUrl]));
  const runtimeFlags = buildOneTimeRuntimeFlags({ ...env, APP_MODE: 'single_tenant', APP_INSTANCE: ONE_TIME_APP_INSTANCE });
  return {
    requirement_id: 'REQ-20260619-313',
    generated_at: options.generatedAt || new Date().toISOString(),
    railway: {
      project_name: options.projectName || 'one-time-production',
      environment: options.environment || 'production',
      web_service_name: options.webServiceName || 'one-time-web',
      postgres_service_name: options.postgresServiceName || 'one-time-postgres',
      worker_service: {
        required: false,
        name: 'one-time-worker',
        reason: 'No always-on One Time worker is required for Shloimie UI review; sends, uploads, Zoom mutations, and transcription jobs stay gated.',
      },
      forbidden_project: 'skillful-motivation',
    },
    repository: {
      branch: 'codex/agent-control-center-20260619',
      tag: 'onetime-pilot-review-2026-06-21',
    },
    runtime_flags: runtimeFlags,
    variables: {
      non_secret: { ...NON_SECRET_VARIABLES, ...publicVariables },
      required_secret_names: REQUIRED_SECRET_VARIABLES.map((name) => secretReadiness(name, env)),
      optional_secret_names: OPTIONAL_SECRET_VARIABLES.map((name) => secretReadiness(name, env)),
      database_reference: '${{ one-time-postgres.DATABASE_URL }}',
    },
    integration_readiness: {
      resend: {
        credential_presence_does_not_enable_sending: true,
        sender_domain_fields_required_later: ['RESEND_DOMAIN', 'RESEND_FROM', 'RESEND_FROM_EMAIL', 'RESEND_REPLY_TO'],
      },
      stripe: { mode: 'test_readiness_only', live_charges_enabled: false },
      zoom: { mode: 'readiness_and_protected_join_reference_only', create_real_meetings: false },
      vimeo: { manual_reference_enabled: true, automated_upload_enabled: false },
      transcription: { requirement_id: 'REQ-20260621-902', status: 'blocked_until_valid_hosted_credential' },
    },
  };
}

function reviewIdentity(key, displayName, role, extra = {}) {
  return {
    key,
    display_name: displayName,
    role,
    workspace_key: ONE_TIME_WORKSPACE_KEY,
    project_key: ONE_TIME_PROJECT_KEY,
    email: `${key.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.test`,
    status: 'active',
    fixture: true,
    cleanup_marker: 'REQ-20260619-313',
    ...extra,
  };
}

function buildOneTimeSeedManifest(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const reviewIdentities = [
    reviewIdentity('TEST-ONETIME-OWNER-RABBI', 'TEST Rabbi Elie Owner', 'workspace_owner'),
    reviewIdentity('TEST-ONETIME-MANAGER-SHLOIMIE', 'TEST Shloimie One Time Manager', 'workspace_admin'),
    reviewIdentity('TEST-ONETIME-PARENT-REVIEW', 'TEST One Time Parent Review', 'parent'),
    reviewIdentity('TEST-ONETIME-STUDENT-REVIEW', 'TEST One Time Student Review', 'student'),
  ];
  const productWorkflow = {
    offer_key: 'TEST-ONETIME-67-MONTHLY-TRIAL',
    price_cents: 6700,
    currency: 'USD',
    trial_days: 30,
    live_charge_enabled: false,
    checkout_preview_only: true,
  };
  return {
    requirement_id: 'REQ-20260619-313',
    generated_at: generatedAt,
    workspace: {
      workspace_key: ONE_TIME_WORKSPACE_KEY,
      project_key: ONE_TIME_PROJECT_KEY,
      type: 'live_class_course',
      public_language: ONE_TIME_PUBLIC_LANGUAGE,
      owner: 'Rabbi Elie Scheller',
      manager: 'Shloimie',
    },
    enabled_modules: [...ENABLED_MODULES],
    disabled_features: [...DISABLED_FEATURES],
    review_identities: reviewIdentities,
    product_workflow: productWorkflow,
    course: {
      slug: 'test-onetime-mishnah-review-course',
      title: 'TEST One Time Mishnah Review Course',
      module: 'TEST Masechta Berachos Module',
      lesson: 'TEST Berachos Mishnah Review Lesson',
      worksheet: 'TEST Berachos Worksheet',
      vimeo_url: 'https://vimeo.com/123456789',
      vimeo_id: '123456789',
    },
    class_session: {
      title: 'TEST Weekly Mishnah Live Class',
      timezone: 'Asia/Jerusalem',
      attendance_minutes: 42,
      attendance_percentage: 84,
      zoom_reference_state: 'protected_readiness_only',
    },
    member_activity: {
      milestone: 'TEST First Mishnah Milestone',
      achievement: 'TEST First Class Achievement',
      reward_state: 'review_only',
      private_question: 'TEST private Mishnah question for Rabbi review',
      support_ticket: 'TEST support ticket for broken class link',
    },
    isolation: {
      no_private_bna_data: true,
      disallowed_private_content_guard: true,
    },
  };
}

function sqlLiteral(value) {
  return `'${String(value ?? '').replace(/'/g, "''")}'`;
}

function buildOneTimeSeedSql(manifest = buildOneTimeSeedManifest()) {
  const metadata = JSON.stringify({
    seed: 'one_time_separate_instance_review',
    requirement_id: manifest.requirement_id,
    fixture: true,
    cleanup_marker: 'REQ-20260619-313',
  });
  return `-- One Time separate-instance review seed.
-- Idempotent, TEST-prefixed, and scoped to ${ONE_TIME_WORKSPACE_KEY} / ${ONE_TIME_PROJECT_KEY}.
-- Run only against the separate One Time database after the base schema has initialized.

BEGIN;

INSERT INTO bna_projects (project_key, name, short_name, description, status, metadata)
VALUES (
  '${ONE_TIME_PROJECT_KEY}',
  'One Time Mishnah Class',
  'One Time',
  'Single-tenant One Time live class/course workspace.',
  'active',
  '${metadata}'::jsonb
)
ON CONFLICT (project_key) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  status = 'active',
  metadata = COALESCE(bna_projects.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

UPDATE bna_projects
SET workspace_type = 'service_provider',
    visibility = 'workspace',
    language_default = 'en',
    slug = 'one-time-mishnah-class',
    settings = COALESCE(settings, '{}'::jsonb) || '{"app_instance":"onetime","default_workspace_key":"rabbi_sheller_provider","student_bot_enabled":false,"bna_accountability_enabled":false}'::jsonb,
    updated_at = NOW()
WHERE project_key = '${ONE_TIME_PROJECT_KEY}';

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1
), seed_people(preferred_name, full_name, email, primary_language, status, metadata) AS (
  VALUES
    ('TEST Rabbi Elie Owner', 'TEST Rabbi Elie Owner', 'test.onetime.owner.rabbi@example.test', 'en', 'active', '${metadata}'::jsonb),
    ('TEST Shloimie One Time Manager', 'TEST Shloimie One Time Manager', 'test.onetime.manager.shloimie@example.test', 'en', 'active', '${metadata}'::jsonb),
    ('TEST One Time Parent Review', 'TEST One Time Parent Review', 'test.onetime.parent.review@example.test', 'en', 'active', '${metadata}'::jsonb),
    ('TEST One Time Student Review', 'TEST One Time Student Review', 'test.onetime.student.review@example.test', 'en', 'active', '${metadata}'::jsonb)
), inserted_people AS (
  INSERT INTO bna_people (preferred_name, full_name, email, primary_language, status, metadata)
  SELECT seed.preferred_name, seed.full_name, seed.email, seed.primary_language, seed.status, seed.metadata
  FROM seed_people seed
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_people existing
    WHERE lower(existing.email) = lower(seed.email)
  )
  RETURNING id, preferred_name, email
), all_people AS (
  SELECT id, preferred_name, email
  FROM inserted_people
  UNION ALL
  SELECT existing.id, existing.preferred_name, existing.email
  FROM bna_people existing
  JOIN seed_people seed ON lower(existing.email) = lower(seed.email)
)
INSERT INTO bna_workspace_memberships (workspace_id, person_id, role, access_level, relationship_to_owner, tags, active, metadata)
SELECT project.id, p.id,
       CASE p.preferred_name
         WHEN 'TEST Rabbi Elie Owner' THEN 'workspace_owner'
         WHEN 'TEST Shloimie One Time Manager' THEN 'workspace_admin'
         WHEN 'TEST One Time Parent Review' THEN 'parent'
         ELSE 'student'
       END,
       CASE p.preferred_name
         WHEN 'TEST Rabbi Elie Owner' THEN 'owner'
         WHEN 'TEST Shloimie One Time Manager' THEN 'admin'
         ELSE 'member'
       END,
       CASE p.preferred_name WHEN 'TEST One Time Student Review' THEN 'student' ELSE NULL END,
       ARRAY['TEST', 'one_time_review'],
       TRUE,
       '${metadata}'::jsonb
FROM all_people p
CROSS JOIN project
ON CONFLICT (workspace_id, person_id, role) DO UPDATE SET
  active = TRUE,
  metadata = COALESCE(bna_workspace_memberships.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1)
INSERT INTO bna_project_members (project_id, person_name, role, access_level, login_username, active, metadata)
SELECT project.id, seed.person_name, seed.role, seed.access_level, seed.login_username, TRUE, '${metadata}'::jsonb
FROM project
CROSS JOIN (VALUES
  ('Rabbi Elie Scheller', 'project owner', 'owner', NULL),
  ('Shloimie', 'project admin', 'manager', NULL),
  ('TEST One Time Parent Review', 'parent', 'member', 'test.onetime.parent.review'),
  ('TEST One Time Student Review', 'student', 'member', 'test.onetime.student.review')
) AS seed(person_name, role, access_level, login_username)
ON CONFLICT (project_id, person_name) DO UPDATE SET
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  login_username = COALESCE(EXCLUDED.login_username, bna_project_members.login_username),
  active = TRUE,
  metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1)
INSERT INTO one_time_member_access (access_code, member_label, member_email, tier, status, notes, metadata)
VALUES (
  'TEST-ONETIME-REVIEW-ACCESS',
  'TEST One Time Student Review',
  'test.onetime.student.review@example.test',
  'live_class',
  'active',
  'Synthetic review access for separate One Time instance.',
  '${metadata}'::jsonb
)
ON CONFLICT (access_code) DO UPDATE SET
  member_label = EXCLUDED.member_label,
  member_email = EXCLUDED.member_email,
  tier = EXCLUDED.tier,
  status = 'active',
  metadata = COALESCE(one_time_member_access.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1),
session_insert AS (
  INSERT INTO bna_class_sessions (
    project_id, title, summary, topics, sources, student_questions,
    media_url, media_provider, vimeo_id, transcript_status, package_status, class_date, metadata
  )
  SELECT project.id,
         'TEST Weekly Mishnah Live Class',
         'TEST review-safe Mishnah class session for UI review.',
         '["Berachos", "Mishnah review"]'::jsonb,
         '["TEST source sheet"]'::jsonb,
         '[]'::jsonb,
         'https://vimeo.com/123456789',
         'vimeo',
         '123456789',
         'approved',
         'published',
         CURRENT_DATE,
         '${metadata}'::jsonb
  FROM project
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_class_sessions existing
    WHERE existing.project_id = project.id
      AND existing.title = 'TEST Weekly Mishnah Live Class'
  )
  RETURNING id, project_id
), session_row AS (
  SELECT id, project_id FROM session_insert
  UNION ALL
  SELECT existing.id, existing.project_id
  FROM bna_class_sessions existing
  JOIN project ON project.id = existing.project_id
  WHERE existing.title = 'TEST Weekly Mishnah Live Class'
  LIMIT 1
)
INSERT INTO one_time_member_library_items (
  project_id, class_session_id, destination, library_visibility, required_tier,
  publish_status, title, description, media_provider, media_url, vimeo_id,
  thumbnail_url, class_date, package_snapshot, approved_by, approved_at, published_by, published_at
)
SELECT session_row.project_id, session_row.id, 'member_library', 'tier', 'live_class',
       'published', 'TEST Berachos Mishnah Review Video',
       'TEST manual Vimeo reference for Shloimie UI review.',
       'vimeo', 'https://vimeo.com/123456789', '123456789',
       'https://i.vimeocdn.com/video/123456789_640.jpg', CURRENT_DATE,
       '${metadata}'::jsonb, 'TEST Rabbi Elie Owner', NOW(), 'TEST Shloimie One Time Manager', NOW()
FROM session_row
ON CONFLICT DO NOTHING;

WITH project AS (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1)
INSERT INTO bna_courses (project_id, project_key, slug, title, short_title, description, primary_teacher, status, visibility, sort_order, metadata)
SELECT project.id, '${ONE_TIME_PROJECT_KEY}', 'test-onetime-mishnah-review-course',
       'TEST One Time Mishnah Review Course', 'TEST Mishnah Review',
       'TEST review course for One Time UI review.',
       'Rabbi Elie Scheller', 'active', 'student_parent', 10, '${metadata}'::jsonb
FROM project
ON CONFLICT (slug) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  project_key = EXCLUDED.project_key,
  status = 'active',
  visibility = EXCLUDED.visibility,
  metadata = COALESCE(bna_courses.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH course AS (SELECT id FROM bna_courses WHERE slug = 'test-onetime-mishnah-review-course' LIMIT 1)
INSERT INTO bna_course_lessons (course_id, slug, title, summary, sort_order, status, visibility, metadata)
SELECT course.id, 'test-berachos-mishnah-review-lesson',
       'TEST Berachos Mishnah Review Lesson',
       'TEST lesson linked to the manual Vimeo review reference.',
       10, 'published', 'student_parent', '${metadata}'::jsonb
FROM course
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  status = 'published',
  visibility = EXCLUDED.visibility,
  metadata = COALESCE(bna_course_lessons.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH course AS (SELECT id FROM bna_courses WHERE slug = 'test-onetime-mishnah-review-course' LIMIT 1),
lesson AS (SELECT id FROM bna_course_lessons WHERE slug = 'test-berachos-mishnah-review-lesson' LIMIT 1)
INSERT INTO bna_worksheets (course_id, lesson_id, title, instructions, status, visibility, approval_status, parent_visible, metadata)
SELECT course.id, lesson.id, 'TEST Berachos Worksheet',
       'TEST worksheet/resource for One Time review.',
       'published', 'student_parent', 'approved', TRUE, '${metadata}'::jsonb
FROM course, lesson
WHERE NOT EXISTS (
  SELECT 1 FROM bna_worksheets existing
  WHERE existing.course_id = course.id
    AND existing.title = 'TEST Berachos Worksheet'
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1)
INSERT INTO bna_support_tickets (
  project_id, title, description, severity, status, category,
  reporter_name, reporter_role, assigned_to, source, ticket_number,
  workspace_key, project_key, requester_user_key, requester_email,
  requester_display_name, requester_role, page_path, authenticated_context,
  notification_state, staff_reply_state, source_context, created_by
)
SELECT project.id,
       'TEST One Time review support ticket',
       'TEST support ticket for Shloimie UI review.',
       'normal', 'open', 'link',
       'TEST One Time Parent Review', 'parent', 'Shloimie', 'system',
       'TEST-OT-SUP-000001',
       '${ONE_TIME_WORKSPACE_KEY}', '${ONE_TIME_PROJECT_KEY}',
       'TEST-ONETIME-PARENT-REVIEW', 'test.onetime.parent.review@example.test',
       'TEST One Time Parent Review', 'parent', '/parent.html',
       '${metadata}'::jsonb, 'internal_only', 'internal_only', '${metadata}'::jsonb,
       'one_time_review_seed'
FROM project
ON CONFLICT (ticket_number) DO UPDATE SET
  status = 'open',
  workspace_key = EXCLUDED.workspace_key,
  project_key = EXCLUDED.project_key,
  updated_at = NOW();

COMMIT;
`;
}

function assertOneTimeSeedIsolation(manifest = buildOneTimeSeedManifest(), sql = buildOneTimeSeedSql(manifest)) {
  const failures = [];
  const serialized = `${JSON.stringify(manifest)}\n${sql}`;
  for (const pattern of DISALLOWED_SEED_PATTERNS) {
    if (pattern.test(serialized)) {
      failures.push(`Disallowed seed pattern matched: ${pattern.source}`);
    }
  }
  if (/\bDratler\b/i.test(serialized)) failures.push('Seed contains Dratler data.');
  if (!serialized.includes(ONE_TIME_WORKSPACE_KEY)) failures.push('Seed does not include One Time workspace key.');
  if (!serialized.includes(ONE_TIME_PROJECT_KEY)) failures.push('Seed does not include One Time project key.');
  if (!/TEST-/.test(serialized)) failures.push('Seed is not TEST-prefixed.');
  if (!/@example\.test/i.test(serialized)) failures.push('Seed review identities do not use example.test.');
  if (/gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i.test(serialized)) failures.push('Seed contains real-looking email domain.');
  return { ok: failures.length === 0, failures };
}

function buildOneTimeIsolationScanSql() {
  return `SELECT 'bna_students_outside_onetime' AS check_name, COUNT(*)::int AS count
FROM bna_students s
LEFT JOIN bna_projects p ON p.id = COALESCE(s.project_id, s.workspace_id)
WHERE COALESCE(p.project_key, '') <> '${ONE_TIME_PROJECT_KEY}';

SELECT 'bna_payments_present' AS check_name, COUNT(*)::int AS count
FROM bna_payment_intake;

SELECT 'private_messages_present' AS check_name, COUNT(*)::int AS count
FROM bna_communications
WHERE COALESCE(project_id, -1) <> (SELECT id FROM bna_projects WHERE project_key = '${ONE_TIME_PROJECT_KEY}' LIMIT 1);

SELECT 'one_time_test_fixtures' AS check_name, COUNT(*)::int AS count
FROM bna_people
WHERE email LIKE '%@example.test'
  AND preferred_name LIKE 'TEST%';`;
}

function writeDeploymentPackage(outputDir, options = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const plan = buildOneTimeRailwayPlan(process.env, options);
  const seedManifest = buildOneTimeSeedManifest(options);
  const seedSql = buildOneTimeSeedSql(seedManifest);
  const isolation = assertOneTimeSeedIsolation(seedManifest, seedSql);
  const isolationSql = buildOneTimeIsolationScanSql();
  const jsonPath = path.join(outputDir, 'separate-instance-provisioning-plan.json');
  const mdPath = path.join(outputDir, 'separate-instance-provisioning-plan.md');
  const seedPath = path.join(outputDir, 'separate-instance-seed.sql');
  const scanPath = path.join(outputDir, 'separate-instance-isolation-scan.sql');
  fs.writeFileSync(jsonPath, `${JSON.stringify({ plan, seed_manifest: seedManifest, isolation }, null, 2)}\n`);
  fs.writeFileSync(seedPath, seedSql);
  fs.writeFileSync(scanPath, isolationSql);
  fs.writeFileSync(mdPath, `# One Time Separate Instance Provisioning Plan

Generated: ${plan.generated_at}
Requirement: REQ-20260619-313

## Railway Target

- Project: ${plan.railway.project_name}
- Environment: ${plan.railway.environment}
- Web service: ${plan.railway.web_service_name}
- Postgres service: ${plan.railway.postgres_service_name}
- Worker service required now: ${plan.railway.worker_service.required ? 'yes' : 'no'}
- Forbidden target: ${plan.railway.forbidden_project}

## Scope

- Workspace: ${ONE_TIME_WORKSPACE_KEY}
- Project: ${ONE_TIME_PROJECT_KEY}
- Brand: ${ONE_TIME_BRAND_KEY}
- Public language: ${ONE_TIME_PUBLIC_LANGUAGE}

## Variable Plan

Non-secret variables are in \`${path.basename(jsonPath)}\`. Secret values are
redacted and represented by names only.

## Seed And Isolation

- Seed SQL: \`${path.basename(seedPath)}\`
- Isolation scan SQL: \`${path.basename(scanPath)}\`
- Seed isolation check: ${isolation.ok ? 'pass' : 'fail'}

## Guarded Preflight

Run this before any Railway mutation:

\`\`\`powershell
npm run one-time:railway-provision:check -- --json
\`\`\`

The preflight is read-only. It validates the target project/service names,
checks account-level Railway visibility when available, refuses the forbidden
shared project, and prints a redacted apply checklist.

## Remaining External Action

Railway account-level authentication is required to create or select the
separate project and services. Project-scoped tokens for the shared BNA service
must not be used to add One Time services to \`${plan.railway.forbidden_project}\`.
`);
  return { plan, seedManifest, seedSql, isolation, files: { jsonPath, mdPath, seedPath, scanPath } };
}

function assertOneTimeRailwayTarget(plan = buildOneTimeRailwayPlan()) {
  const railway = plan?.railway || {};
  const targetProject = String(railway.project_name || '').trim();
  const forbiddenProject = String(railway.forbidden_project || '').trim();
  const webService = String(railway.web_service_name || '').trim();
  const postgresService = String(railway.postgres_service_name || '').trim();
  const failures = [];
  if (!targetProject) failures.push('missing target Railway project name');
  if (!webService) failures.push('missing target Railway web service name');
  if (!postgresService) failures.push('missing target Railway Postgres service name');
  if (!forbiddenProject) failures.push('missing forbidden shared Railway project guard');
  if (targetProject && forbiddenProject && targetProject.toLowerCase() === forbiddenProject.toLowerCase()) {
    failures.push(`target project must not be ${forbiddenProject}`);
  }
  if (webService && postgresService && webService.toLowerCase() === postgresService.toLowerCase()) {
    failures.push('web and Postgres services must be separate');
  }
  return {
    ok: failures.length === 0,
    failures,
    target_project: targetProject,
    forbidden_project: forbiddenProject,
    web_service: webService,
    postgres_service: postgresService,
  };
}

function buildOneTimeRailwayProvisioningChecklist(plan = buildOneTimeRailwayPlan()) {
  const target = assertOneTimeRailwayTarget(plan);
  const railway = plan.railway;
  const variables = plan.variables || {};
  const nonSecretVariables = variables.non_secret || {};
  const requiredSecretNames = (variables.required_secret_names || [])
    .map((item) => item.name)
    .filter((name) => name && name !== 'DATABASE_URL');
  const optionalSecretNames = (variables.optional_secret_names || []).map((item) => item.name).filter(Boolean);
  const targetProject = railway.project_name;
  const webService = railway.web_service_name;
  const postgresService = railway.postgres_service_name;
  const environment = railway.environment || 'production';
  const domain = String(nonSecretVariables.ONE_TIME_PUBLIC_DOMAIN || ONE_TIME_PUBLIC_DOMAIN);
  const nonSecretVariablePairs = Object.entries(nonSecretVariables).map(([key, value]) => `${key}=${value}`);
  return {
    requirement_id: plan.requirement_id || 'REQ-20260619-313',
    target,
    safety_guards: [
      `Do not add services to ${railway.forbidden_project}.`,
      'Do not clone or import the BNA production database.',
      'Do not print or pass secret values on the command line.',
      'Do not create real Zoom meetings, send email/WhatsApp, charge cards, or upload Vimeo videos during UI-review provisioning.',
      `Do not attach ${domain} before verifying the command is scoped to the One Time web service.`,
    ],
    read_only_checks: [
      ['railway', 'whoami'],
      ['railway', 'list', '--json'],
      ['railway', 'status', '--json'],
    ],
    apply_checklist: [
      {
        key: 'create_or_reuse_project',
        command: ['railway', 'init', '--name', targetProject, '--json'],
        note: 'Run only if railway list --json proves no intended One Time project exists.',
      },
      {
        key: 'link_target_project',
        command: ['railway', 'link', '--project', '<one-time-production-project-id>', '--environment', environment, '--json'],
        note: 'Use a temp link directory or an explicit One Time project token; never link to the shared project.',
      },
      {
        key: 'create_postgres',
        command: ['railway', 'add', '--database', 'postgres', '--service', postgresService, '--json'],
        note: `Create or verify the ${postgresService} Postgres service in the One Time project.`,
      },
      {
        key: 'create_web',
        command: ['railway', 'add', '--service', webService, '--json'],
        note: `Create or verify the ${webService} application service in the One Time project.`,
      },
      {
        key: 'set_non_secret_variables',
        command: ['railway', 'variable', 'set', '--service', webService, '--environment', environment, '--skip-deploys', ...nonSecretVariablePairs],
        note: 'Safe to print; values are non-secret One Time runtime flags and public URLs.',
      },
      {
        key: 'set_database_reference',
        command: ['railway', 'variable', 'set', '--service', webService, '--environment', environment, '--skip-deploys', `DATABASE_URL=${variables.database_reference || '${{ one-time-postgres.DATABASE_URL }}'}`],
        note: 'Use the Railway service reference for the One Time Postgres database.',
      },
      {
        key: 'set_required_secrets',
        command: ['railway', 'variable', 'set', '--service', webService, '--environment', environment, '--skip-deploys', '<SECRET_NAME>'],
        secret_names: requiredSecretNames,
        note: 'Set each required secret through stdin or approved Railway secret tooling. Do not print values.',
      },
      {
        key: 'set_optional_readiness_secrets',
        command: ['railway', 'variable', 'set', '--service', webService, '--environment', environment, '--skip-deploys', '<OPTIONAL_SECRET_NAME>'],
        secret_names: optionalSecretNames,
        note: 'Only set optional integration credentials that already exist in approved secure storage.',
      },
      {
        key: 'deploy_web',
        command: ['railway', 'up', '.', '--project', '<one-time-production-project-id>', '--service', webService, '--environment', environment, '--detach', '--message', 'One Time pilot review deployment'],
        note: 'Deploy the canonical branch; do not merge PR #5.',
      },
      {
        key: 'attach_domain',
        command: ['railway', 'domain', domain, '--service', webService, '--json'],
        note: 'Capture fresh CNAME/TXT records returned for this exact service.',
      },
    ],
    database_steps: [
      'Run npm run one-time:db:bootstrap -- --json first to review migration checksums without mutating the database.',
      'After the separate One Time database is available, run npm run one-time:db:bootstrap -- --apply --confirm BOOTSTRAP_ONE_TIME_DATABASE with APP_INSTANCE=onetime, DEFAULT_WORKSPACE_KEY=rabbi_sheller_provider, and DEFAULT_PROJECT_KEY=one_time_mishnah_class.',
      'Confirm the bootstrap report applies the existing migration chain, ops/one-time-mishnah/separate-instance-seed.sql, and ops/one-time-mishnah/separate-instance-isolation-scan.sql with zero BNA-private rows.',
    ],
    verification_commands: [
      'npm run bna:run:validate',
      'node scripts/audit-secrets.mjs',
      `npm run app:smoke:onetime-separate-instance -- https://${domain}`,
      'npm run bna:run:next',
    ],
  };
}

module.exports = {
  ONE_TIME_APP_INSTANCE,
  ONE_TIME_BRAND_KEY,
  ONE_TIME_PUBLIC_LANGUAGE,
  ONE_TIME_PUBLIC_DOMAIN,
  ONE_TIME_PUBLIC_URL,
  ENABLED_MODULES,
  DISABLED_FEATURES,
  NON_SECRET_VARIABLES,
  REQUIRED_SECRET_VARIABLES,
  OPTIONAL_SECRET_VARIABLES,
  buildOneTimeRuntimeFlags,
  buildOneTimeRailwayPlan,
  buildOneTimeSeedManifest,
  buildOneTimeSeedSql,
  assertOneTimeSeedIsolation,
  buildOneTimeIsolationScanSql,
  writeDeploymentPackage,
  assertOneTimeRailwayTarget,
  buildOneTimeRailwayProvisioningChecklist,
  buildOneTimeInstanceConfig,
};
