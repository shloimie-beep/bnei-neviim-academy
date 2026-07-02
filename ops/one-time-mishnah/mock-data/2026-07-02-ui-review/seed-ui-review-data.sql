-- One Time separate-instance review seed.
-- Idempotent, TEST-prefixed, and scoped to rabbi_sheller_provider / one_time_mishnah_class.
-- Run only against the separate One Time database after the base schema has initialized.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_bna_projects_project_key
  ON bna_projects(project_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_course_lessons_course_slug_conflict
  ON bna_course_lessons(course_id, slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_time_seed_support_tickets_ticket_number_conflict
  ON bna_support_tickets(ticket_number);

UPDATE bna_students s
SET name = 'TEST Archived BNA Seed ' || s.id::text,
    name_en = 'TEST Archived BNA Seed ' || s.id::text,
    name_he = NULL,
    parent_name = NULL,
    parent_email = NULL,
    parent_phone = NULL,
    status = 'inactive',
    tags = ARRAY(
      SELECT DISTINCT tag_value
      FROM unnest(COALESCE(s.tags, ARRAY[]::text[]) || ARRAY['archived_wrong_instance_seed', 'one_time_bootstrap_cleanup']) AS tag_values(tag_value)
      WHERE tag_value <> ''
    ),
    notes = 'Archived/redacted by One Time bootstrap because this BNA Torah seed row was created in the separate One Time instance before single-tenant seed guards were active.',
    updated_at = NOW()
FROM bna_projects p
WHERE p.id = COALESCE(s.project_id, s.workspace_id)
  AND p.project_key <> 'one_time_mishnah_class'
  AND COALESCE(s.notes, '') LIKE 'Seeded for Torah learning group goal%';

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

-- One Time UI review mock/test data extension.
-- TEST-prefixed, scoped to rabbi_sheller_provider / one_time_mishnah_class, and reversible with cleanup marker one_time_ui_review_20260702.

BEGIN;

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
), seed_people(preferred_name, full_name, email, phone, status, metadata) AS (
  VALUES
    ('TEST One Time Adult Lead', 'TEST One Time Adult Lead', 'test.onetime.adult.lead@example.test', NULL, 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-ADULT-LEAD","lifecycle_stage":"New Lead","email_state":"not_sent","payment_state":"none","source":"ui_review_seed","sort_order":1}'::jsonb),
    ('TEST One Time Student Member', 'TEST One Time Student Member', 'test.onetime.student.member@example.test', NULL, 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-STUDENT-MEMBER","lifecycle_stage":"Free Class Signup","email_state":"delivered","payment_state":"trial","source":"ui_review_seed","sort_order":2}'::jsonb),
    ('TEST One Time Paid Member', 'TEST One Time Paid Member', 'test.onetime.paid.member@example.test', NULL, 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-PAID-MEMBER","lifecycle_stage":"Paid Member","email_state":"clicked","payment_state":"sandbox_paid","source":"ui_review_seed","sort_order":3}'::jsonb),
    ('TEST One Time Free Trial Member', 'TEST One Time Free Trial Member', 'test.onetime.free.trial@example.test', NULL, 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-FREE-TRIAL","lifecycle_stage":"Free Access / Trial","email_state":"sent","payment_state":"trial","source":"ui_review_seed","sort_order":4}'::jsonb),
    ('TEST One Time Inactive Member', 'TEST One Time Inactive Member', 'test.onetime.inactive@example.test', NULL, 'inactive', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-INACTIVE","lifecycle_stage":"Inactive","email_state":"opened","payment_state":"expired","source":"ui_review_seed","sort_order":5}'::jsonb),
    ('TEST One Time Bounced Contact', 'TEST One Time Bounced Contact', 'test.onetime.bounced@example.test', NULL, 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-BOUNCED","lifecycle_stage":"Email Clicked","email_state":"bounced","payment_state":"none","source":"ui_review_seed","sort_order":6}'::jsonb),
    ('TEST One Time WhatsApp Contact', 'TEST One Time WhatsApp Contact', 'test.onetime.whatsapp@example.test', '+15550101001', 'active', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-WHATSAPP","lifecycle_stage":"Interested","email_state":"suppressed","payment_state":"none","source":"ui_review_seed","sort_order":7}'::jsonb)
), inserted AS (
  INSERT INTO bna_people (preferred_name, full_name, email, phone, primary_language, status, metadata)
  SELECT preferred_name, full_name, email, phone, 'en', status, metadata
  FROM seed_people
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_people existing WHERE lower(existing.email) = lower(seed_people.email)
  )
  RETURNING id, preferred_name, email, metadata
), all_people AS (
  SELECT id, preferred_name, email, metadata FROM inserted
  UNION ALL
  SELECT existing.id, existing.preferred_name, existing.email, existing.metadata
  FROM bna_people existing
  JOIN seed_people seed ON lower(existing.email) = lower(seed.email)
)
INSERT INTO bna_workspace_memberships (workspace_id, person_id, role, access_level, relationship_to_owner, tags, active, metadata)
SELECT project.id,
       person.id,
       CASE
         WHEN person.metadata->>'review_key' LIKE '%STUDENT%' THEN 'student'
         WHEN person.metadata->>'review_key' LIKE '%WHATSAPP%' THEN 'viewer'
         ELSE 'parent'
       END,
       CASE WHEN person.metadata->>'review_key' LIKE '%WHATSAPP%' THEN 'viewer' ELSE 'member' END,
       CASE WHEN person.metadata->>'review_key' LIKE '%STUDENT%' THEN 'student' ELSE 'parent' END,
       ARRAY['TEST', 'one_time_ui_review'],
       TRUE,
       person.metadata
FROM all_people person
CROSS JOIN project
ON CONFLICT (workspace_id, person_id, role) DO UPDATE SET
  active = TRUE,
  metadata = COALESCE(bna_workspace_memberships.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
seed_people(person_name, role, access_level, login_username, metadata) AS (
  VALUES
    ('TEST One Time Adult Lead', 'parent', 'member', 'test.onetime.adult.lead', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-ADULT-LEAD","lifecycle_stage":"New Lead"}'::jsonb),
    ('TEST One Time Student Member', 'student', 'member', 'test.onetime.student.member', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-STUDENT-MEMBER","lifecycle_stage":"Free Class Signup"}'::jsonb),
    ('TEST One Time Paid Member', 'parent', 'member', 'test.onetime.paid.member', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-PAID-MEMBER","lifecycle_stage":"Paid Member"}'::jsonb),
    ('TEST One Time Free Trial Member', 'parent', 'member', 'test.onetime.free.trial', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-FREE-TRIAL","lifecycle_stage":"Free Access / Trial"}'::jsonb),
    ('TEST One Time Inactive Member', 'parent', 'member', 'test.onetime.inactive', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-INACTIVE","lifecycle_stage":"Inactive"}'::jsonb),
    ('TEST One Time Bounced Contact', 'viewer', 'viewer', 'test.onetime.bounced', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-BOUNCED","lifecycle_stage":"Email Clicked"}'::jsonb),
    ('TEST One Time WhatsApp Contact', 'viewer', 'viewer', 'test.onetime.whatsapp', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-WHATSAPP","lifecycle_stage":"Interested"}'::jsonb)
)
INSERT INTO bna_project_members (project_id, person_name, role, access_level, login_username, active, metadata)
SELECT project.id, person_name, role, access_level, login_username, TRUE, metadata
FROM project, seed_people
ON CONFLICT (project_id, person_name) DO UPDATE SET
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  login_username = EXCLUDED.login_username,
  active = TRUE,
  metadata = COALESCE(bna_project_members.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH seed_contacts(full_name, primary_email, primary_phone, status, source, tags, metadata) AS (
  VALUES
    ('TEST One Time Adult Lead', 'test.onetime.adult.lead@example.test', NULL, 'lead', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-ADULT-LEAD","lifecycle_stage":"New Lead","last_activity":"TEST review event","next_action":"Review fit and invite to free class","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time Student Member', 'test.onetime.student.member@example.test', NULL, 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-STUDENT-MEMBER","lifecycle_stage":"Free Class Signup","last_activity":"TEST review event","next_action":"Review member access state","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time Paid Member', 'test.onetime.paid.member@example.test', NULL, 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-PAID-MEMBER","lifecycle_stage":"Paid Member","last_activity":"TEST review event","next_action":"Review member access state","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time Free Trial Member', 'test.onetime.free.trial@example.test', NULL, 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-FREE-TRIAL","lifecycle_stage":"Free Access / Trial","last_activity":"TEST review event","next_action":"Review member access state","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time Inactive Member', 'test.onetime.inactive@example.test', NULL, 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-INACTIVE","lifecycle_stage":"Inactive","last_activity":"TEST review event","next_action":"Review member access state","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time Bounced Contact', 'test.onetime.bounced@example.test', NULL, 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-BOUNCED","lifecycle_stage":"Email Clicked","last_activity":"TEST review event","next_action":"Review fit and invite to free class","owner":"Shloimie","source":"ui_review_seed"}'::jsonb),
    ('TEST One Time WhatsApp Contact', 'test.onetime.whatsapp@example.test', '+15550101001', 'active', 'ui_review_seed', ARRAY['TEST','one_time_review'], '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-WHATSAPP","lifecycle_stage":"Interested","last_activity":"TEST review event","next_action":"Review fit and invite to free class","owner":"Shloimie","source":"ui_review_seed"}'::jsonb)
), contacts AS (
  INSERT INTO bna_contacts (full_name, primary_email, primary_phone, status, source, tags, metadata)
  SELECT full_name, primary_email, primary_phone, status, source, tags, metadata
  FROM seed_contacts
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_contacts existing WHERE lower(existing.primary_email) = lower(seed_contacts.primary_email)
  )
  RETURNING id, full_name, metadata
), all_contacts AS (
  SELECT id, full_name, metadata FROM contacts
  UNION ALL
  SELECT existing.id, existing.full_name, existing.metadata
  FROM bna_contacts existing
  JOIN seed_contacts seed ON lower(existing.primary_email) = lower(seed.primary_email)
)
INSERT INTO bna_contact_pipeline_events (contact_id, event_type, pipeline_status, summary, source, metadata)
SELECT id, 'stage_snapshot', metadata->>'lifecycle_stage', 'TEST review pipeline stage: ' || (metadata->>'lifecycle_stage'), 'ui_review_seed', metadata
FROM all_contacts
WHERE NOT EXISTS (
  SELECT 1 FROM bna_contact_pipeline_events existing
  WHERE existing.contact_id = all_contacts.id
    AND existing.source = 'ui_review_seed'
    AND existing.metadata->>'cleanup_marker' = 'one_time_ui_review_20260702'
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
seed_messages(review_key, to_address, subject, status, metadata) AS (
  VALUES
    ('TEST-ONETIME-STUDENT-MEMBER', 'test.onetime.student.member@example.test', 'TEST One Time delivered message', 'delivered', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-STUDENT-MEMBER","email_state":"delivered","provider":"resend_test_fixture"}'::jsonb),
    ('TEST-ONETIME-PAID-MEMBER', 'test.onetime.paid.member@example.test', 'TEST One Time clicked message', 'clicked', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-PAID-MEMBER","email_state":"clicked","provider":"resend_test_fixture"}'::jsonb),
    ('TEST-ONETIME-FREE-TRIAL', 'test.onetime.free.trial@example.test', 'TEST One Time sent message', 'sent', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-FREE-TRIAL","email_state":"sent","provider":"resend_test_fixture"}'::jsonb),
    ('TEST-ONETIME-BOUNCED', 'test.onetime.bounced@example.test', 'TEST One Time bounced message', 'bounced', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_key":"TEST-ONETIME-BOUNCED","email_state":"bounced","provider":"resend_test_fixture"}'::jsonb)
)
INSERT INTO bna_communications (
  project_id, channel, direction, communication_type, from_name, from_address,
  to_name, to_address, subject, body_text, provider, status, metadata
)
SELECT project.id, 'email', 'outbound', 'review_fixture', 'One Time TEST',
       'info@onetimeonetime.com', review_key, to_address, subject,
       'TEST email history fixture. No send occurred.', 'resend', status, metadata
FROM project, seed_messages
WHERE NOT EXISTS (
  SELECT 1 FROM bna_communications existing
  WHERE existing.project_id = project.id
    AND existing.to_address = seed_messages.to_address
    AND existing.subject = seed_messages.subject
);

INSERT INTO one_time_member_access (access_code, member_label, member_email, tier, status, notes, metadata)
VALUES
    ('TEST-ONETIME-FREE-TRIAL-ACCESS', 'TEST One Time Free Trial Member', 'test.onetime.free.trial@example.test', 'live_class', 'active', 'TEST 30-day free trial review access', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"access_state":"30_day_free_trial"}'::jsonb),
    ('TEST-ONETIME-PAID-MEMBER-ACCESS', 'TEST One Time Paid Member', 'test.onetime.paid.member@example.test', 'live_class', 'active', 'TEST sandbox paid member review access', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"access_state":"sandbox_paid"}'::jsonb),
    ('TEST-ONETIME-INACTIVE-ACCESS', 'TEST One Time Inactive Member', 'test.onetime.inactive@example.test', 'library_only', 'archived', 'TEST inactive review access', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"access_state":"inactive"}'::jsonb)
ON CONFLICT (access_code) DO UPDATE SET
  member_label = EXCLUDED.member_label,
  member_email = EXCLUDED.member_email,
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  metadata = COALESCE(one_time_member_access.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
class_insert AS (
  INSERT INTO bna_class_sessions (
    project_id, title, summary, topics, sources, student_questions, media_url,
    media_provider, vimeo_id, transcript_status, package_status, class_date, metadata
  )
  SELECT project.id,
         'TEST One Time Launch Review Class',
         'TEST live class with attendance/click and private-question states for UI review.',
         '["Mishnah launch review","member access"]'::jsonb,
         '["TEST source sheet","TEST protected Zoom link placeholder"]'::jsonb,
         '[{"state":"private_to_rabbi","text":"TEST private Mishnah question to Rabbi"},{"state":"rabbi_selected_public_preview","text":"TEST Rabbi-selected public Q&A preview"}]'::jsonb,
         'https://vimeo.com/123456789',
         'vimeo',
         '123456789',
         'approved',
         'published',
         CURRENT_DATE,
         '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"attendance_events":["class_link_viewed","class_link_clicked","attended_by_click"]}'::jsonb
  FROM project
  WHERE NOT EXISTS (
    SELECT 1 FROM bna_class_sessions existing
    WHERE existing.project_id = project.id AND existing.title = 'TEST One Time Launch Review Class'
  )
  RETURNING id, project_id
), class_row AS (
  SELECT id, project_id FROM class_insert
  UNION ALL
  SELECT existing.id, existing.project_id
  FROM bna_class_sessions existing
  JOIN project ON project.id = existing.project_id
  WHERE existing.title = 'TEST One Time Launch Review Class'
  LIMIT 1
)
INSERT INTO one_time_member_library_items (
  project_id, class_session_id, destination, library_visibility, required_tier,
  publish_status, title, description, media_provider, media_url, vimeo_id,
  thumbnail_url, class_date, package_snapshot, approved_by, approved_at, published_by, published_at
)
SELECT class_row.project_id, class_row.id, 'member_library', 'tier', 'live_class',
       'published', 'TEST Vimeo Placeholder Review Replay',
       'TEST Vimeo placeholder library item for UI review.',
       'placeholder', 'https://vimeo.com/123456789', '123456789',
       NULL, CURRENT_DATE, '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"vimeo_state":"placeholder_ready"}'::jsonb,
       'TEST Rabbi Elie Owner', NOW(), 'TEST Shloimie One Time Manager', NOW()
FROM class_row
ON CONFLICT DO NOTHING;

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
seed_tasks(title, notes, stage, category, urgency, source, assigned_to, project_key, item_type, waiting_on, agent_status, next_action, task_kind, workflow_status, status_detail, ai_parsed) AS (
  VALUES
    ('TEST One Time next setup task - Railway target', 'Provide or verify One Time Railway project/service/database target.', 'plan', 'technology', 'today', 'ui_review_seed', 'Shloimie', 'one_time_mishnah_class', 'task', 'Railway target values', 'blocked_needs_human_decision', 'Open Railway and create/verify one-time-production, one-time-web, and one-time-postgres.', 'task', 'blocked', 'Railway target values', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_task_index":1,"top_task_candidate":true}'::jsonb),
    ('TEST One Time setup blocker - Whapi/WAPI token', 'Provide Rabbi-owned Whapi/WAPI account, phone, and token alias.', 'clarify', 'communications', 'today', 'ui_review_seed', 'Shloimie', 'one_time_mishnah_class', 'task', 'Whapi/WAPI token and phone', 'blocked_needs_human_decision', 'Add token to BNA keyholder and rerun setup check.', 'task', 'blocked', 'Whapi/WAPI token and phone', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_task_index":2,"top_task_candidate":false}'::jsonb),
    ('TEST One Time setup blocker - Stripe sandbox', 'Provide Rabbi Stripe test credential alias and $67/month test price.', 'clarify', 'finance', 'today', 'ui_review_seed', 'Shloimie', 'one_time_mishnah_class', 'task', 'Stripe test alias/product/price', 'blocked_needs_human_decision', 'Create sandbox product/price or provide existing test price ID.', 'task', 'blocked', 'Stripe test alias/product/price', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_task_index":3,"top_task_candidate":false}'::jsonb),
    ('TEST One Time setup blocker - Zoom protected link', 'Provide member-gated Zoom session details.', 'clarify', 'operations', 'today', 'ui_review_seed', 'Rabbi Elie Scheller', 'one_time_mishnah_class', 'task', 'Zoom session details', 'blocked_needs_human_decision', 'Provide protected Zoom link or meeting metadata.', 'task', 'blocked', 'Zoom session details', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"review_task_index":4,"top_task_candidate":false}'::jsonb)
)
INSERT INTO bna_tasks (
  project_id, title, notes, stage, category, urgency, source, assigned_to,
  project_key, item_type, waiting_on, agent_status, next_action, task_kind,
  workflow_status, status_detail, ai_parsed
)
SELECT project.id, title, notes, stage, category, urgency, source, assigned_to,
       project_key, item_type, waiting_on, agent_status, next_action, task_kind,
       workflow_status, status_detail, ai_parsed
FROM project, seed_tasks
WHERE NOT EXISTS (
  SELECT 1 FROM bna_tasks existing
  WHERE existing.project_id = project.id AND existing.title = seed_tasks.title
);

WITH project AS (SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1),
seed_tickets(title, description, severity, status, category, reporter_name, reporter_role, assigned_to, source, ticket_number, workspace_key, project_key, requester_user_key, requester_email, requester_display_name, requester_role, page_path, authenticated_context, source_context, created_by) AS (
  VALUES
    ('TEST private question to Rabbi', 'TEST private student question visible to Rabbi/admin only.', 'normal', 'open', 'other', 'TEST One Time Review', 'parent', 'Shloimie', 'system', 'TEST-OT-UI-PRIVATE-Q-000001', 'rabbi_sheller_provider', 'one_time_mishnah_class', 'TEST-ONETIME-UI-REVIEW', 'test.onetime.review@example.test', 'TEST One Time Review', 'parent', '/student.html', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-PRIVATE-Q-000001"}'::jsonb, '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-PRIVATE-Q-000001"}'::jsonb, 'one_time_ui_review_seed'),
    ('TEST class link support issue', 'TEST support ticket for a broken or missing class link.', 'normal', 'open', 'link', 'TEST One Time Review', 'parent', 'Shloimie', 'system', 'TEST-OT-UI-SUPPORT-000002', 'rabbi_sheller_provider', 'one_time_mishnah_class', 'TEST-ONETIME-UI-REVIEW', 'test.onetime.review@example.test', 'TEST One Time Review', 'parent', '/parent.html', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-SUPPORT-000002"}'::jsonb, '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-SUPPORT-000002"}'::jsonb, 'one_time_ui_review_seed'),
    ('TEST WhatsApp setup state', 'TEST Whapi/WAPI token missing state for setup panel review.', 'normal', 'open', 'automation', 'TEST One Time Review', 'provider_staff', 'Shloimie', 'system', 'TEST-OT-UI-WHATSAPP-000003', 'rabbi_sheller_provider', 'one_time_mishnah_class', 'TEST-ONETIME-UI-REVIEW', 'test.onetime.review@example.test', 'TEST One Time Review', 'provider_staff', '/operations', '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-WHATSAPP-000003"}'::jsonb, '{"seed":"one_time_ui_review_20260702","requirement_id":"REQ-20260702-105","workspace_key":"rabbi_sheller_provider","project_key":"one_time_mishnah_class","fixture":true,"cleanup_marker":"one_time_ui_review_20260702","external_send_performed":false,"external_payment_performed":false,"support_fixture":"TEST-OT-UI-WHATSAPP-000003"}'::jsonb, 'one_time_ui_review_seed')
)
INSERT INTO bna_support_tickets (
  project_id, title, description, severity, status, category, reporter_name,
  reporter_role, assigned_to, source, ticket_number, workspace_key, project_key,
  requester_user_key, requester_email, requester_display_name, requester_role,
  page_path, authenticated_context, notification_state, staff_reply_state,
  source_context, created_by
)
SELECT project.id, title, description, severity, status, category, reporter_name,
       reporter_role, assigned_to, source, ticket_number, workspace_key, project_key,
       requester_user_key, requester_email, requester_display_name, requester_role,
       page_path, authenticated_context, 'internal_only', 'internal_only',
       source_context, created_by
FROM project, seed_tickets
ON CONFLICT (ticket_number) DO UPDATE SET
  status = EXCLUDED.status,
  workspace_key = EXCLUDED.workspace_key,
  project_key = EXCLUDED.project_key,
  source_context = COALESCE(bna_support_tickets.source_context, '{}'::jsonb) || EXCLUDED.source_context,
  updated_at = NOW();

COMMIT;
