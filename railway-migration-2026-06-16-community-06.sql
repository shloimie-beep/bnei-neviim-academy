-- COMMUNITY-06 additive Mishnayos community/course-question foundation.
-- Safe to run after the existing WS11 community/gamification migration.

ALTER TABLE bna_worksheets ADD COLUMN IF NOT EXISTS due_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_bna_worksheets_due_at ON bna_worksheets(due_at);

CREATE TABLE IF NOT EXISTS bna_course_questions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES bna_courses(id) ON DELETE SET NULL,
  lesson_id INTEGER REFERENCES bna_course_lessons(id) ON DELETE SET NULL,
  class_session_id INTEGER REFERENCES bna_class_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'short_answer' CHECK (question_type IN ('short_answer', 'long_answer', 'reflection', 'source_lookup')),
  due_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'student' CHECK (visibility IN ('private', 'student', 'parent', 'student_parent', 'community', 'public')),
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'archived')),
  student_visible BOOLEAN NOT NULL DEFAULT TRUE,
  parent_visible BOOLEAN NOT NULL DEFAULT FALSE,
  public_visible BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to_all BOOLEAN NOT NULL DEFAULT TRUE,
  points INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'operations',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_course_questions_course ON bna_course_questions(course_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_bna_course_questions_parent ON bna_course_questions(parent_visible, approval_status, due_at);

CREATE TABLE IF NOT EXISTS bna_course_question_responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES bna_course_questions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES bna_students(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'completed', 'rejected', 'archived')),
  score_percent NUMERIC(5,2),
  parent_visible BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected', 'archived')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (question_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_bna_course_question_responses_student ON bna_course_question_responses(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_course_question_responses_parent ON bna_course_question_responses(student_id, parent_visible, approval_status);
