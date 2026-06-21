CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bna_raw_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id TEXT UNIQUE NOT NULL,
  source_channel TEXT NOT NULL CHECK (source_channel IN ('telegram', 'website_bot', 'codex_chat', 'operations_ui', 'drive', 'manual', 'other')),
  source_message_id TEXT,
  source_user TEXT,
  raw_text TEXT,
  transcript_text TEXT,
  media_url TEXT,
  intake_type TEXT DEFAULT 'general',
  parse_status TEXT NOT NULL DEFAULT 'raw' CHECK (parse_status IN ('raw', 'parsed', 'needs_review', 'registered', 'implemented', 'archived', 'failed')),
  parsed_payload JSONB DEFAULT '{}'::jsonb,
  created_requirement_ids TEXT[] DEFAULT '{}',
  created_task_ids TEXT[] DEFAULT '{}',
  created_decision_ids TEXT[] DEFAULT '{}',
  created_question_ids TEXT[] DEFAULT '{}',
  requirement_register_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  parsed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bna_raw_intake_stable_id ON bna_raw_intake(stable_id);
CREATE INDEX IF NOT EXISTS idx_bna_raw_intake_source_channel ON bna_raw_intake(source_channel);
CREATE INDEX IF NOT EXISTS idx_bna_raw_intake_parse_status ON bna_raw_intake(parse_status);
CREATE INDEX IF NOT EXISTS idx_bna_raw_intake_created_at ON bna_raw_intake(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_raw_intake_register_path ON bna_raw_intake(requirement_register_path);
