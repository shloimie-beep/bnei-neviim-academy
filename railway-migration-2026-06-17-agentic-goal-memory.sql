-- BNA universal agentic goal memory and watchdog hardening.
-- Safe to run multiple times against Railway/Postgres.

ALTER TABLE bna_raw_intake
  DROP CONSTRAINT IF EXISTS bna_raw_intake_source_channel_check;

ALTER TABLE bna_raw_intake
  ADD CONSTRAINT bna_raw_intake_source_channel_check
  CHECK (source_channel IN (
    'telegram',
    'website_bot',
    'codex_chat',
    'operations_ui',
    'drive',
    'class_recording',
    'website_helper',
    'operations_helper',
    'email',
    'whatsapp',
    'wapi',
    'manual',
    'other'
  ));

ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS source_workspace TEXT;
ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS scope_type TEXT;
ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS scope_id TEXT;
ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS goal_candidate_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS watchdog_finding_ids TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE bna_raw_intake ADD COLUMN IF NOT EXISTS evidence_paths TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS bna_goal_memory (
  id BIGSERIAL PRIMARY KEY,
  stable_id TEXT UNIQUE NOT NULL,
  goal_type TEXT NOT NULL DEFAULT 'standing',
  title TEXT NOT NULL,
  plain_english_goal TEXT NOT NULL,
  why_it_matters TEXT,
  scope_type TEXT NOT NULL DEFAULT 'global',
  scope_id TEXT,
  source_raw_id TEXT,
  source_item_id TEXT,
  related_goal_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  affected_surfaces TEXT[] DEFAULT ARRAY[]::TEXT[],
  invariants JSONB DEFAULT '[]'::jsonb,
  watchdog_checks JSONB DEFAULT '[]'::jsonb,
  evidence_required JSONB DEFAULT '[]'::jsonb,
  failure_behavior TEXT,
  repair_task_template TEXT,
  promotion_reason TEXT,
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN (
    'candidate',
    'active',
    'superseded',
    'archived',
    'blocked'
  )),
  confidence NUMERIC(4,3) DEFAULT 0.800,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  promoted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_bna_goal_memory_status
  ON bna_goal_memory(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_goal_memory_scope
  ON bna_goal_memory(scope_type, scope_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_goal_memory_raw
  ON bna_goal_memory(source_raw_id);

CREATE TABLE IF NOT EXISTS bna_goal_links (
  id BIGSERIAL PRIMARY KEY,
  goal_id TEXT NOT NULL,
  linked_type TEXT NOT NULL,
  linked_id TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'related',
  evidence_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(goal_id, linked_type, linked_id, relationship)
);

CREATE INDEX IF NOT EXISTS idx_bna_goal_links_goal
  ON bna_goal_links(goal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_goal_links_linked
  ON bna_goal_links(linked_type, linked_id);

CREATE TABLE IF NOT EXISTS bna_goal_check_results (
  id BIGSERIAL PRIMARY KEY,
  stable_id TEXT UNIQUE NOT NULL,
  goal_id TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'passed',
    'failed',
    'warning',
    'skipped',
    'blocked'
  )),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN (
    'critical',
    'high',
    'medium',
    'low',
    'info'
  )),
  evidence_path TEXT,
  report_path TEXT,
  finding_id TEXT,
  repair_task_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bna_goal_check_results_goal
  ON bna_goal_check_results(goal_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_goal_check_results_status
  ON bna_goal_check_results(status, severity, checked_at DESC);

CREATE TABLE IF NOT EXISTS bna_agent_events (
  id BIGSERIAL PRIMARY KEY,
  stable_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  source_channel TEXT,
  raw_id TEXT,
  goal_id TEXT,
  item_id TEXT,
  task_id TEXT,
  watchdog_finding_id TEXT,
  status TEXT,
  actor TEXT DEFAULT 'system',
  summary TEXT,
  evidence_path TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bna_agent_events_type
  ON bna_agent_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_events_raw
  ON bna_agent_events(raw_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_events_goal
  ON bna_agent_events(goal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_agent_events_watchdog
  ON bna_agent_events(watchdog_finding_id, created_at DESC);
