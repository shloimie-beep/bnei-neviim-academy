-- OT-LAUNCH-01: forward-only Agent Action and Rabbi Telegram durability.
-- This migration is additive and safe to run repeatedly.

CREATE TABLE IF NOT EXISTS bna_agent_action_jobs (
  id SERIAL PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE,
  job_type TEXT NOT NULL DEFAULT 'agent_action',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  source_repository TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  source_sha TEXT NOT NULL,
  source_artifact_path TEXT NOT NULL,
  source_artifact_url TEXT,
  source_fingerprint TEXT,
  target_application TEXT NOT NULL,
  target_workspace TEXT NOT NULL,
  target_ui_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  allowed_actions JSONB NOT NULL DEFAULT '[]',
  forbidden_actions JSONB NOT NULL DEFAULT '[]',
  required_save_behavior TEXT NOT NULL,
  expected_asset_ids JSONB NOT NULL DEFAULT '[]',
  completion_checklist JSONB NOT NULL DEFAULT '[]',
  evidence_requirements JSONB NOT NULL DEFAULT '[]',
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  result_readback_url TEXT NOT NULL,
  created_by TEXT,
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_action_jobs ADD COLUMN IF NOT EXISTS claim_token TEXT;
ALTER TABLE bna_agent_action_jobs ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ;
ALTER TABLE bna_agent_action_jobs ADD COLUMN IF NOT EXISTS claim_generation BIGINT NOT NULL DEFAULT 0;
ALTER TABLE bna_agent_action_jobs ADD COLUMN IF NOT EXISTS superseded_by_job_id TEXT;
ALTER TABLE bna_agent_action_jobs ADD COLUMN IF NOT EXISTS superseded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bna_agent_action_jobs_status ON bna_agent_action_jobs(status, category);
CREATE INDEX IF NOT EXISTS idx_bna_agent_action_jobs_target ON bna_agent_action_jobs(target_workspace, target_application);
CREATE INDEX IF NOT EXISTS idx_bna_agent_action_jobs_source ON bna_agent_action_jobs(source_repository, source_ref, source_sha);
CREATE INDEX IF NOT EXISTS idx_bna_agent_action_jobs_claim_expiry ON bna_agent_action_jobs(claim_expires_at) WHERE claim_expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS bna_agent_action_results (
  id SERIAL PRIMARY KEY,
  result_ref TEXT NOT NULL UNIQUE,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT,
  evidence JSONB NOT NULL DEFAULT '[]',
  completion_checklist JSONB NOT NULL DEFAULT '[]',
  expected_asset_ids JSONB NOT NULL DEFAULT '[]',
  idempotency_key TEXT NOT NULL UNIQUE,
  submitted_by TEXT,
  submitted_ip TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  readback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_agent_action_results ADD COLUMN IF NOT EXISTS result_kind TEXT NOT NULL DEFAULT 'partial';
ALTER TABLE bna_agent_action_results ADD COLUMN IF NOT EXISTS result_sha256 TEXT;
CREATE INDEX IF NOT EXISTS idx_bna_agent_action_results_job ON bna_agent_action_results(job_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_agent_action_audit_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  job_id TEXT NOT NULL,
  result_ref TEXT,
  event_type TEXT NOT NULL,
  actor TEXT,
  sanitized_payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_agent_action_audit_job ON bna_agent_action_audit_events(job_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_questions (
  id SERIAL PRIMARY KEY,
  question_ref TEXT NOT NULL UNIQUE,
  opportunity_id TEXT NOT NULL UNIQUE,
  contact_id TEXT NOT NULL,
  conversation_id TEXT,
  pipeline_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Synthetic Torah question',
  status TEXT NOT NULL DEFAULT 'assigned',
  synthetic BOOLEAN NOT NULL DEFAULT TRUE,
  draft_note_id TEXT,
  draft_sha256 TEXT,
  draft_saved_at TIMESTAMPTZ,
  audit_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_telegram_updates (
  id SERIAL PRIMARY KEY,
  update_id BIGINT NOT NULL UNIQUE,
  update_fingerprint TEXT NOT NULL,
  actor_fingerprint TEXT NOT NULL,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_one_time_rabbi_telegram_updates ADD COLUMN IF NOT EXISTS lease_owner_ref TEXT;
ALTER TABLE bna_one_time_rabbi_telegram_updates ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;
ALTER TABLE bna_one_time_rabbi_telegram_updates ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bna_one_time_rabbi_telegram_updates ADD COLUMN IF NOT EXISTS handled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_bna_one_time_rabbi_updates_lease ON bna_one_time_rabbi_telegram_updates(lease_expires_at) WHERE handled_at IS NULL;

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_operator_state (
  actor_fingerprint TEXT PRIMARY KEY,
  question_ref TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_consumer_leases (
  consumer_key TEXT PRIMARY KEY,
  owner_ref TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_one_time_rabbi_consumer_leases ADD COLUMN IF NOT EXISTS lease_generation BIGINT NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_audit_events (
  id SERIAL PRIMARY KEY,
  audit_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  question_ref TEXT,
  actor_fingerprint TEXT,
  safe_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_one_time_rabbi_canaries (
  id SERIAL PRIMARY KEY,
  canary_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  audit_id TEXT NOT NULL,
  safe_outcome JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
