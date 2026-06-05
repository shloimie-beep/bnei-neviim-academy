-- One Time Mishnah Class project/workspace model.
-- Safe to run repeatedly on the existing Railway Postgres database.
-- Do not create a second database for One Time; this standardizes the existing
-- Mishnah/Mishna concept under one project key.

CREATE TABLE IF NOT EXISTS bna_projects (
  id SERIAL PRIMARY KEY,
  project_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  short_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  access_level TEXT NOT NULL DEFAULT 'member' CHECK (access_level IN ('owner', 'manager', 'member', 'viewer')),
  telegram_chat_id TEXT,
  login_username TEXT,
  active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, person_name)
);

CREATE TABLE IF NOT EXISTS bna_task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES bna_tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'system',
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'operator', 'project')),
  source TEXT NOT NULL DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'telegram', 'api', 'system')),
  source_context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS decision_required BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verification_notes TEXT;

ALTER TABLE bna_tasks DROP CONSTRAINT IF EXISTS bna_tasks_category_check;
ALTER TABLE bna_tasks
  ADD CONSTRAINT bna_tasks_category_check
  CHECK (category IN (
    'admin',
    'marketing',
    'parent_coaching',
    'student_operations',
    'finance',
    'legal',
    'communications',
    'operations',
    'accountability',
    'content',
    'technology',
    'accounting',
    'ghl_setup',
    'community',
    'general',
    'torah_class_prep',
    'source_sheets',
    'shiur_ideas'
  ));

CREATE INDEX IF NOT EXISTS idx_bna_projects_project_key ON bna_projects (project_key);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_project_id ON bna_project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_project_members_login_username ON bna_project_members (login_username);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_task_id ON bna_task_comments (task_id);
CREATE INDEX IF NOT EXISTS idx_bna_task_comments_created_at ON bna_task_comments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_project_id ON bna_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_bna_tasks_decision_required ON bna_tasks (decision_required);

INSERT INTO bna_projects (project_key, name, short_name, description, metadata)
VALUES
  (
    'bna',
    'BNA',
    'BNA',
    'Bnei Neviim Academy operations, students, content, contacts, and accounting.',
    '{}'::jsonb
  ),
  (
    'one_time_mishnah_class',
    'One Time Mishnah Class',
    'One Time',
    'Rabbi Elie Scheller task manager, comments, Torah class prep, and Mishnah class planning.',
    '{"agent":"rabbi-elie-scheller","preferred_source_lookup":"sefaria","aliases":["one_time","mishna","mishnah","mishna_learning","mishnah_learning"]}'::jsonb
  )
ON CONFLICT (project_key) DO UPDATE
SET name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    description = COALESCE(EXCLUDED.description, bna_projects.description),
    metadata = COALESCE(bna_projects.metadata, '{}'::jsonb) || EXCLUDED.metadata,
    updated_at = NOW();

WITH bna AS (
  SELECT id FROM bna_projects WHERE project_key = 'bna'
)
INSERT INTO bna_project_members (project_id, person_name, role, access_level)
SELECT id, 'Shloimie', 'operator', 'owner'
FROM bna
ON CONFLICT (project_id, person_name) DO UPDATE
SET role = EXCLUDED.role,
    access_level = EXCLUDED.access_level,
    active = TRUE,
    updated_at = NOW();

WITH one_time AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class'
)
INSERT INTO bna_project_members (project_id, person_name, role, access_level)
SELECT id, member.person_name, member.role, member.access_level
FROM one_time
CROSS JOIN (
  VALUES
    ('Shloimie', 'project owner', 'owner'),
    ('Rabbi Elie Scheller', 'collaborator', 'member')
) AS member(person_name, role, access_level)
ON CONFLICT (project_id, person_name) DO UPDATE
SET role = EXCLUDED.role,
    access_level = EXCLUDED.access_level,
    active = TRUE,
    updated_at = NOW();

WITH bna AS (
  SELECT id FROM bna_projects WHERE project_key = 'bna'
)
UPDATE bna_tasks
SET project_id = (SELECT id FROM bna)
WHERE project_id IS NULL;

WITH one_time AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class'
)
UPDATE bna_tasks
SET project_id = (SELECT id FROM one_time)
WHERE
  category IN ('torah_class_prep', 'source_sheets', 'shiur_ideas', 'ghl_setup', 'community')
  OR lower(COALESCE(title, '') || ' ' || COALESCE(notes, '')) ~
    '(one time|mishnah|mishna|rabbi elie scheller|elie scheller|source sheet|shiur)';
