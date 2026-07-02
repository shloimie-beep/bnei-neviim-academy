-- One Time separate-instance review seed.
-- Idempotent, TEST-prefixed, and scoped to rabbi_sheller_provider / one_time_mishnah_class.
-- Run only against the separate One Time database after the base schema has initialized.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_bna_projects_project_key
  ON bna_projects(project_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_bna_project_members_project_person
  ON bna_project_members(project_id, person_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_workspace_memberships_project_person_role
  ON bna_workspace_memberships(workspace_id, person_id, role);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_member_access_access_code
  ON one_time_member_access(access_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_courses_slug
  ON bna_courses(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_course_lessons_course_slug
  ON bna_course_lessons(course_id, slug)
  WHERE slug IS NOT NULL AND trim(slug) <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_course_lessons_course_slug_conflict
  ON bna_course_lessons(course_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_support_tickets_ticket_number
  ON bna_support_tickets(ticket_number)
  WHERE ticket_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_support_tickets_ticket_number_conflict
  ON bna_support_tickets(ticket_number);

INSERT INTO bna_projects (project_key, name, short_name, description, status, metadata)
VALUES (
  'one_time_mishnah_class',
  'One Time Mishnah Class',
  'One Time',
  'Single-tenant One Time live class/course workspace.',
  'active',
  '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
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
WHERE project_key = 'one_time_mishnah_class';

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
), seed_people(preferred_name, full_name, email, primary_language, status, metadata) AS (
  VALUES
    ('TEST Rabbi Elie Owner', 'TEST Rabbi Elie Owner', 'test.onetime.owner.rabbi@example.test', 'en', 'active', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb),
    ('TEST Shloimie One Time Manager', 'TEST Shloimie One Time Manager', 'test.onetime.manager.shloimie@example.test', 'en', 'active', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb),
    ('TEST One Time Parent Review', 'TEST One Time Parent Review', 'test.onetime.parent.review@example.test', 'en', 'active', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb),
    ('TEST One Time Student Review', 'TEST One Time Student Review', 'test.onetime.student.review@example.test', 'en', 'active', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb)
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
       '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
FROM all_people p
CROSS JOIN project
ON CONFLICT (workspace_id, person_id, role) DO UPDATE SET
  active = TRUE,
  metadata = COALESCE(bna_workspace_memberships.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1)
INSERT INTO bna_project_members (project_id, person_name, role, access_level, login_username, active, metadata)
SELECT project.id, seed.person_name, seed.role, seed.access_level, seed.login_username, TRUE, '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
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

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1)
INSERT INTO one_time_member_access (access_code, member_label, member_email, tier, status, notes, metadata)
VALUES (
  'TEST-ONETIME-REVIEW-ACCESS',
  'TEST One Time Student Review',
  'test.onetime.student.review@example.test',
  'live_class',
  'active',
  'Synthetic review access for separate One Time instance.',
  '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
)
ON CONFLICT (access_code) DO UPDATE SET
  member_label = EXCLUDED.member_label,
  member_email = EXCLUDED.member_email,
  tier = EXCLUDED.tier,
  status = 'active',
  metadata = COALESCE(one_time_member_access.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
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
         '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
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
       '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb, 'TEST Rabbi Elie Owner', NOW(), 'TEST Shloimie One Time Manager', NOW()
FROM session_row
ON CONFLICT DO NOTHING;

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1)
INSERT INTO bna_courses (project_id, project_key, slug, title, short_title, description, primary_teacher, status, visibility, sort_order, metadata)
SELECT project.id, 'one_time_mishnah_class', 'test-onetime-mishnah-review-course',
       'TEST One Time Mishnah Review Course', 'TEST Mishnah Review',
       'TEST review course for One Time UI review.',
       'Rabbi Elie Scheller', 'active', 'student_parent', 10, '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
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
       10, 'published', 'student_parent', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
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
       'published', 'student_parent', 'approved', TRUE, '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb
FROM course, lesson
WHERE NOT EXISTS (
  SELECT 1 FROM bna_worksheets existing
  WHERE existing.course_id = course.id
    AND existing.title = 'TEST Berachos Worksheet'
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1)
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
       'rabbi_sheller_provider', 'one_time_mishnah_class',
       'TEST-ONETIME-PARENT-REVIEW', 'test.onetime.parent.review@example.test',
       'TEST One Time Parent Review', 'parent', '/parent.html',
       '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb, 'internal_only', 'internal_only', '{"seed":"one_time_separate_instance_review","requirement_id":"REQ-20260619-313","fixture":true,"cleanup_marker":"REQ-20260619-313"}'::jsonb,
       'one_time_review_seed'
FROM project
ON CONFLICT (ticket_number) DO UPDATE SET
  status = 'open',
  workspace_key = EXCLUDED.workspace_key,
  project_key = EXCLUDED.project_key,
  updated_at = NOW();

COMMIT;
