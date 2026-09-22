-- Helper profile, scoped knowledge, and compatibility action-log foundation.
-- Runtime bootstrap in server.js also creates these tables for local/dev safety.

CREATE TABLE IF NOT EXISTS bna_helper_action_log (
  id SERIAL PRIMARY KEY,
  helper_scope TEXT NOT NULL,
  workspace_id INTEGER,
  actor TEXT,
  user_role TEXT,
  tool_name TEXT NOT NULL,
  action_summary TEXT,
  input_metadata JSONB DEFAULT '{}'::jsonb,
  outcome TEXT NOT NULL,
  result_metadata JSONB DEFAULT '{}'::jsonb,
  confirmation_required BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_helper_action_log_created_at
  ON bna_helper_action_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_helper_action_log_scope
  ON bna_helper_action_log (helper_scope, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_helper_action_log_tool
  ON bna_helper_action_log (tool_name);

CREATE TABLE IF NOT EXISTS bna_helper_profiles (
  id SERIAL PRIMARY KEY,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  helper_name TEXT NOT NULL,
  display_tone TEXT,
  communication_style JSONB DEFAULT '{}'::jsonb,
  do_rules JSONB DEFAULT '[]'::jsonb,
  avoid_rules JSONB DEFAULT '[]'::jsonb,
  memory_summary TEXT,
  safety_level TEXT DEFAULT 'standard',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_bna_helper_profiles_scope
  ON bna_helper_profiles (scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_bna_helper_profiles_updated_at
  ON bna_helper_profiles (updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_helper_knowledge_items (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  scope_type TEXT,
  scope_id TEXT,
  title TEXT NOT NULL,
  body TEXT,
  source_type TEXT,
  source_ref TEXT,
  visibility TEXT DEFAULT 'internal',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_helper_knowledge_scope
  ON bna_helper_knowledge_items (scope_type, scope_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_helper_knowledge_workspace
  ON bna_helper_knowledge_items (workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_helper_knowledge_visibility
  ON bna_helper_knowledge_items (visibility);
