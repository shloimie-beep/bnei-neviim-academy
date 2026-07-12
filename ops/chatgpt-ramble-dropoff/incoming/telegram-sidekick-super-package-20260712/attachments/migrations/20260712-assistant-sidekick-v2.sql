-- BNA Assistant Sidekick V2 — additive migration draft
-- Grounded to master d68e3f9 on 2026-07-12.
-- Codex must run the documented duplicate/orphan/schema preflight against each
-- target database before applying. This migration contains no raw identities,
-- chat IDs, secrets, private messages, destructive drops, or data backfill.

BEGIN;

-- ---------------------------------------------------------------------------
-- Channel instances, service identity, verified external bindings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_channel_instances (
  id BIGSERIAL PRIMARY KEY,
  instance_key TEXT NOT NULL UNIQUE,
  channel_id INTEGER NOT NULL REFERENCES assistant_channels(id) ON DELETE CASCADE,
  surface_class TEXT NOT NULL CHECK (surface_class IN (
    'internal_sidekick', 'public_lead', 'authenticated_portal', 'service_worker'
  )),
  profile_key TEXT NOT NULL,
  max_scope_type TEXT NOT NULL CHECK (max_scope_type IN ('all', 'workspace', 'project', 'public')),
  max_workspace_key TEXT,
  max_project_key TEXT,
  allowed_role_keys TEXT[] NOT NULL DEFAULT '{}',
  allowed_identity_keys TEXT[] NOT NULL DEFAULT '{}',
  capability_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  memory_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
  require_private_chat BOOLEAN NOT NULL DEFAULT TRUE,
  bot_identity_hmac TEXT,
  status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'paused', 'disabled', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_channel_instances_channel_status
  ON assistant_channel_instances(channel_id, status, instance_key);

CREATE TABLE IF NOT EXISTS assistant_identity_bindings (
  id BIGSERIAL PRIMARY KEY,
  binding_key TEXT NOT NULL UNIQUE,
  identity_id INTEGER NOT NULL REFERENCES assistant_identities(id) ON DELETE CASCADE,
  channel_instance_id BIGINT NOT NULL REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  external_user_hmac TEXT NOT NULL,
  external_chat_hmac TEXT NOT NULL,
  external_chat_ciphertext BYTEA,
  cipher_nonce BYTEA,
  cipher_key_id TEXT,
  chat_type TEXT NOT NULL DEFAULT 'private' CHECK (chat_type IN ('private', 'group', 'supergroup', 'channel', 'unknown')),
  verification_state TEXT NOT NULL DEFAULT 'pending' CHECK (verification_state IN ('pending', 'verified', 'revoked', 'blocked')),
  verification_method TEXT,
  verified_at TIMESTAMPTZ,
  verified_by_identity_key TEXT,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  last_seen_at TIMESTAMPTZ,
  metadata_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_identity_bindings_verified_external
  ON assistant_identity_bindings(channel_instance_id, external_user_hmac, external_chat_hmac)
  WHERE verification_state = 'verified' AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assistant_identity_bindings_identity_state
  ON assistant_identity_bindings(identity_id, verification_state, updated_at DESC);

CREATE TABLE IF NOT EXISTS assistant_identity_link_tokens (
  id BIGSERIAL PRIMARY KEY,
  token_key TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  intended_identity_id INTEGER NOT NULL REFERENCES assistant_identities(id) ON DELETE CASCADE,
  channel_instance_id BIGINT NOT NULL REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending', 'used', 'revoked', 'expired')),
  created_by_identity_key TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_identity_link_tokens_pending
  ON assistant_identity_link_tokens(channel_instance_id, state, expires_at);

CREATE TABLE IF NOT EXISTS assistant_service_nonces (
  id BIGSERIAL PRIMARY KEY,
  channel_instance_id BIGINT NOT NULL REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  nonce_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_instance_id, nonce_hash)
);

CREATE INDEX IF NOT EXISTS idx_assistant_service_nonces_expiry
  ON assistant_service_nonces(expires_at, used_at);

-- ---------------------------------------------------------------------------
-- Delegated internal agents
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_agent_delegations (
  id BIGSERIAL PRIMARY KEY,
  delegation_key TEXT NOT NULL UNIQUE,
  principal_identity_id INTEGER NOT NULL REFERENCES assistant_identities(id) ON DELETE CASCADE,
  delegate_identity_id INTEGER NOT NULL REFERENCES assistant_identities(id) ON DELETE CASCADE,
  conversation_key TEXT,
  plan_key TEXT,
  run_key TEXT,
  workspace_key TEXT,
  project_key TEXT,
  allowed_capability_ids TEXT[] NOT NULL DEFAULT '{}',
  allowed_memory_namespaces TEXT[] NOT NULL DEFAULT '{}',
  can_propose_memory BOOLEAN NOT NULL DEFAULT TRUE,
  can_activate_memory BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_by_identity_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_agent_delegations_active
  ON assistant_agent_delegations(delegate_identity_id, status, expires_at);

-- ---------------------------------------------------------------------------
-- Durable Telegram/channel ingress, cursor, lease, and runtime heartbeat
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_channel_cursors (
  id BIGSERIAL PRIMARY KEY,
  channel_instance_id BIGINT NOT NULL UNIQUE REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  next_provider_update_id TEXT,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  poll_epoch BIGINT NOT NULL DEFAULT 0,
  last_poll_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_conflict_at TIMESTAMPTZ,
  conflict_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_channel_cursors_lease
  ON assistant_channel_cursors(lease_expires_at, channel_instance_id);

CREATE TABLE IF NOT EXISTS assistant_source_envelopes (
  id BIGSERIAL PRIMARY KEY,
  envelope_key TEXT NOT NULL UNIQUE,
  channel_instance_id BIGINT NOT NULL REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  provider_update_id TEXT NOT NULL,
  provider_message_id TEXT,
  trace_id TEXT NOT NULL,
  binding_id BIGINT REFERENCES assistant_identity_bindings(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  workspace_key TEXT,
  project_key TEXT,
  payload_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_ciphertext BYTEA,
  cipher_nonce BYTEA,
  cipher_key_id TEXT,
  payload_hmac TEXT,
  privacy_class TEXT NOT NULL DEFAULT 'internal' CHECK (privacy_class IN ('public', 'internal', 'confidential', 'restricted')),
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'queued', 'processing', 'retry_wait', 'succeeded', 'denied', 'dead_lettered')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 6,
  next_attempt_at TIMESTAMPTZ,
  lease_owner TEXT,
  lease_expires_at TIMESTAMPTZ,
  error_code TEXT,
  error_detail_redacted TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_instance_id, provider_update_id)
);

CREATE INDEX IF NOT EXISTS idx_assistant_source_envelopes_claim
  ON assistant_source_envelopes(status, next_attempt_at, lease_expires_at, received_at, id);
CREATE INDEX IF NOT EXISTS idx_assistant_source_envelopes_trace
  ON assistant_source_envelopes(trace_id, received_at);

CREATE TABLE IF NOT EXISTS assistant_runtime_heartbeats (
  id BIGSERIAL PRIMARY KEY,
  runtime_key TEXT NOT NULL UNIQUE,
  channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'starting' CHECK (status IN ('starting', 'ready', 'degraded', 'draining', 'stopped', 'failed')),
  worker_id TEXT,
  release_version TEXT,
  commit_sha TEXT,
  expected_bot_hmac TEXT,
  lease_active BOOLEAN NOT NULL DEFAULT FALSE,
  database_ready BOOLEAN NOT NULL DEFAULT FALSE,
  queue_depth INTEGER NOT NULL DEFAULT 0,
  oldest_queue_age_seconds INTEGER NOT NULL DEFAULT 0,
  outbox_depth INTEGER NOT NULL DEFAULT 0,
  last_poll_at TIMESTAMPTZ,
  last_successful_turn_at TIMESTAMPTZ,
  last_error_code TEXT,
  metadata_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_runtime_heartbeats_freshness
  ON assistant_runtime_heartbeats(status, heartbeat_at DESC);

-- ---------------------------------------------------------------------------
-- Canonical scoped memory and append-only lifecycle events
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_memory_items (
  id BIGSERIAL PRIMARY KEY,
  memory_key TEXT NOT NULL UNIQUE,
  namespace_type TEXT NOT NULL CHECK (namespace_type IN ('identity_private', 'conversation', 'workspace', 'project', 'provider', 'platform_policy', 'public_session')),
  namespace_key TEXT NOT NULL,
  owner_identity_id INTEGER REFERENCES assistant_identities(id) ON DELETE SET NULL,
  conversation_key TEXT,
  workspace_key TEXT,
  project_key TEXT,
  provider_key TEXT,
  memory_kind TEXT NOT NULL CHECK (memory_kind IN ('preference', 'instruction', 'stable_fact', 'relationship', 'decision', 'workflow', 'summary', 'setup_state')),
  subject_key TEXT NOT NULL,
  summary_text TEXT,
  value_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  value_ciphertext BYTEA,
  cipher_nonce BYTEA,
  cipher_key_id TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'internal' CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
  allowed_roles TEXT[] NOT NULL DEFAULT '{}',
  learned_by TEXT NOT NULL CHECK (learned_by IN ('explicit', 'confirmed', 'inferred', 'imported', 'tool_verified')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'active', 'disputed', 'superseded', 'deleted', 'expired')),
  provenance_message_key TEXT,
  provenance_conversation_key TEXT,
  provenance_tool_run_key TEXT,
  source_uri TEXT,
  valid_from TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  supersedes_memory_key TEXT REFERENCES assistant_memory_items(memory_key) ON DELETE SET NULL,
  version INTEGER NOT NULL DEFAULT 1,
  content_hash TEXT NOT NULL,
  metadata_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_memory_items_active_subject
  ON assistant_memory_items(namespace_type, namespace_key, memory_kind, subject_key)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_assistant_memory_items_scope
  ON assistant_memory_items(namespace_type, namespace_key, status, expires_at, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_items_owner
  ON assistant_memory_items(owner_identity_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_memory_items_search
  ON assistant_memory_items USING GIN (to_tsvector('simple', COALESCE(subject_key, '') || ' ' || COALESCE(summary_text, '')));

CREATE TABLE IF NOT EXISTS assistant_memory_events (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  memory_key TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('proposed', 'confirmed', 'activated', 'used', 'corrected', 'disputed', 'superseded', 'forgotten', 'expired', 'rejected')),
  actor_identity_id INTEGER REFERENCES assistant_identities(id) ON DELETE SET NULL,
  delegation_key TEXT,
  before_hash TEXT,
  after_hash TEXT,
  reason_redacted TEXT,
  audit_event_key TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_memory_events_memory_time
  ON assistant_memory_events(memory_key, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- Append-only redacted audit and retention policy
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_audit_events (
  id BIGSERIAL PRIMARY KEY,
  event_key TEXT NOT NULL UNIQUE,
  trace_id TEXT NOT NULL,
  span_id TEXT,
  parent_span_id TEXT,
  channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL,
  identity_id INTEGER REFERENCES assistant_identities(id) ON DELETE SET NULL,
  delegation_key TEXT,
  conversation_key TEXT,
  message_key TEXT,
  plan_key TEXT,
  run_key TEXT,
  workspace_key TEXT,
  project_key TEXT,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  risk_class TEXT,
  capability_id TEXT,
  resource_type TEXT,
  resource_ref TEXT,
  policy_version TEXT,
  registry_version TEXT,
  idempotency_key TEXT,
  details_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_code TEXT,
  previous_event_hash TEXT,
  event_hash TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assistant_audit_events_trace
  ON assistant_audit_events(trace_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_assistant_audit_events_scope
  ON assistant_audit_events(workspace_key, project_key, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_audit_events_identity
  ON assistant_audit_events(identity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_audit_events_capability
  ON assistant_audit_events(capability_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS assistant_retention_policies (
  id BIGSERIAL PRIMARY KEY,
  policy_key TEXT NOT NULL UNIQUE,
  object_type TEXT NOT NULL,
  surface_class TEXT,
  retention_class TEXT NOT NULL,
  ciphertext_days INTEGER,
  redacted_days INTEGER,
  total_retention_days INTEGER,
  reconfirm_days INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  metadata_redacted JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Normalized scoped question projection (source tables stay authoritative)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assistant_question_index (
  id BIGSERIAL PRIMARY KEY,
  question_key TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL CHECK (origin IN ('asked', 'class_extracted', 'member_submitted', 'course_assigned', 'unreviewed_candidate')),
  source_type TEXT NOT NULL CHECK (source_type IN ('accountability_event', 'class_session', 'one_time_review', 'course_question', 'parser_candidate')),
  source_id TEXT NOT NULL,
  source_item_key TEXT NOT NULL DEFAULT 'root',
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE CASCADE,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL,
  asked_at TIMESTAMPTZ NOT NULL,
  class_date DATE,
  question_text TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  topic TEXT,
  status TEXT NOT NULL,
  visibility TEXT NOT NULL,
  sensitivity TEXT NOT NULL DEFAULT 'confidential' CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')),
  asker_visible_label TEXT,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  class_session_id INTEGER REFERENCES bna_class_sessions(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES bna_courses(id) ON DELETE CASCADE,
  context_ref TEXT,
  projection_state TEXT NOT NULL DEFAULT 'current' CHECK (projection_state IN ('current', 'stale', 'deleted', 'error')),
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_type, source_id, source_item_key)
);

CREATE INDEX IF NOT EXISTS idx_assistant_question_index_scope_date
  ON assistant_question_index(workspace_key, project_key, asked_at DESC, id DESC)
  WHERE projection_state = 'current';
CREATE INDEX IF NOT EXISTS idx_assistant_question_index_filters
  ON assistant_question_index(origin, status, visibility, asked_at DESC)
  WHERE projection_state = 'current';
CREATE INDEX IF NOT EXISTS idx_assistant_question_index_student
  ON assistant_question_index(student_id, asked_at DESC)
  WHERE student_id IS NOT NULL AND projection_state = 'current';

-- ---------------------------------------------------------------------------
-- Extend the existing canonical assistant skeleton. Preflight duplicate data
-- before creating the partial unique indexes below.
-- ---------------------------------------------------------------------------

ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS profile_key TEXT;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Jerusalem';
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS retention_class TEXT DEFAULT 'internal_standard';
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS last_summarized_message_key TEXT;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS summary_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assistant_conversations ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS workspace_key TEXT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS project_key TEXT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS trace_id TEXT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS sequence_no BIGINT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS content_ciphertext BYTEA;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS cipher_nonce BYTEA;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS cipher_key_id TEXT;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS retention_class TEXT DEFAULT 'internal_standard';
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS redacted_at TIMESTAMPTZ;
ALTER TABLE assistant_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE assistant_action_plans ADD COLUMN IF NOT EXISTS trace_id TEXT;
ALTER TABLE assistant_action_plans ADD COLUMN IF NOT EXISTS input_hash TEXT;
ALTER TABLE assistant_action_plans ADD COLUMN IF NOT EXISTS immutable_scope_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE assistant_action_plans ADD COLUMN IF NOT EXISTS registry_version TEXT;
ALTER TABLE assistant_action_plans ADD COLUMN IF NOT EXISTS policy_version TEXT;

ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS trace_id TEXT;
ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 3;
ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ;
ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS lease_owner TEXT;
ALTER TABLE assistant_action_runs ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;

ALTER TABLE assistant_previews ADD COLUMN IF NOT EXISTS input_hash TEXT;
ALTER TABLE assistant_previews ADD COLUMN IF NOT EXISTS scope_hash TEXT;
ALTER TABLE assistant_previews ADD COLUMN IF NOT EXISTS destination_hash TEXT;
ALTER TABLE assistant_previews ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL;
ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS input_hash TEXT;
ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS scope_hash TEXT;
ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS preview_hash TEXT;
ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS destination_hash TEXT;
ALTER TABLE assistant_approvals ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS trace_id TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS workspace_key TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS project_key TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS destination_binding_id BIGINT REFERENCES assistant_identity_bindings(id) ON DELETE SET NULL;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS source_message_key TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 6;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS lease_owner TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS lease_expires_at TIMESTAMPTZ;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS provider_result_redacted JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE assistant_delivery_outbox ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE assistant_dead_letters ADD COLUMN IF NOT EXISTS trace_id TEXT;
ALTER TABLE assistant_dead_letters ADD COLUMN IF NOT EXISTS channel_instance_id BIGINT REFERENCES assistant_channel_instances(id) ON DELETE SET NULL;
ALTER TABLE assistant_dead_letters ADD COLUMN IF NOT EXISTS identity_id INTEGER REFERENCES assistant_identities(id) ON DELETE SET NULL;
ALTER TABLE assistant_dead_letters ADD COLUMN IF NOT EXISTS occurrence_count INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_messages_envelope_once
  ON assistant_messages(channel_instance_id, source_envelope_id)
  WHERE source_envelope_id IS NOT NULL AND BTRIM(source_envelope_id) <> '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_messages_conversation_sequence
  ON assistant_messages(conversation_key, sequence_no)
  WHERE sequence_no IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_action_runs_idempotency
  ON assistant_action_runs(idempotency_key)
  WHERE idempotency_key IS NOT NULL AND BTRIM(idempotency_key) <> '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_assistant_delivery_outbox_idempotency
  ON assistant_delivery_outbox(idempotency_key)
  WHERE idempotency_key IS NOT NULL AND BTRIM(idempotency_key) <> '';
CREATE INDEX IF NOT EXISTS idx_assistant_action_runs_claim_v2
  ON assistant_action_runs(status, next_attempt_at, lease_expires_at, created_at);
CREATE INDEX IF NOT EXISTS idx_assistant_delivery_outbox_claim_v2
  ON assistant_delivery_outbox(status, next_attempt_at, lease_expires_at, created_at);

-- ---------------------------------------------------------------------------
-- Seed inactive/setup channel profiles only. No secret or human binding is
-- seeded. Activation is a separate authenticated operational step.
-- ---------------------------------------------------------------------------

INSERT INTO assistant_channels(channel_key, display_name, adapter_kind, status, channel_metadata)
VALUES
  ('telegram', 'Telegram', 'telegram', 'active', '{"sidekick_v2":true}'::jsonb),
  ('website_assistant', 'Website Assistant', 'http', 'active', '{"sidekick_v2":true}'::jsonb)
ON CONFLICT(channel_key) DO UPDATE SET
  channel_metadata = assistant_channels.channel_metadata || EXCLUDED.channel_metadata,
  updated_at = NOW();

INSERT INTO assistant_channel_instances(
  instance_key, channel_id, surface_class, profile_key, max_scope_type,
  max_workspace_key, max_project_key, allowed_role_keys, require_private_chat,
  capability_policy, memory_policy, status
)
SELECT seed.instance_key, c.id, seed.surface_class, seed.profile_key, seed.max_scope_type,
       seed.max_workspace_key, seed.max_project_key, seed.allowed_role_keys,
       seed.require_private_chat, seed.capability_policy, seed.memory_policy, 'setup'
FROM (
  VALUES
    ('telegram_shloimie_internal', 'telegram', 'internal_sidekick', 'telegram_shloimie_super_admin', 'all', NULL::text, NULL::text, ARRAY['super_admin']::text[], TRUE, '{"private_only":true}'::jsonb, '{"identity_private":true,"workspace":true}'::jsonb),
    ('telegram_rabbi_onetime_internal', 'telegram', 'internal_sidekick', 'telegram_rabbi_scheller_provider', 'project', 'rabbi_sheller_provider', 'one_time_mishnah_class', ARRAY['provider_owner','provider_admin']::text[], TRUE, '{"fixed_scope":true}'::jsonb, '{"identity_private":true,"provider":true}'::jsonb),
    ('web_bna_public_lead', 'website_assistant', 'public_lead', 'public_bna_lead', 'public', 'bna', 'bna', ARRAY['public']::text[], FALSE, '{"public_lead_only":true}'::jsonb, '{"public_session_only":true}'::jsonb),
    ('web_onetime_public_lead', 'website_assistant', 'public_lead', 'public_robot_scheller_lead', 'public', 'rabbi_sheller_provider', 'one_time_mishnah_class', ARRAY['public']::text[], FALSE, '{"public_lead_only":true}'::jsonb, '{"public_session_only":true}'::jsonb)
) AS seed(instance_key, channel_key, surface_class, profile_key, max_scope_type, max_workspace_key, max_project_key, allowed_role_keys, require_private_chat, capability_policy, memory_policy)
JOIN assistant_channels c ON c.channel_key = seed.channel_key
ON CONFLICT(instance_key) DO NOTHING;

INSERT INTO assistant_retention_policies(policy_key, object_type, surface_class, retention_class, ciphertext_days, redacted_days, total_retention_days, reconfirm_days)
VALUES
  ('internal_message_standard', 'assistant_message', 'internal_sidekick', 'internal_standard', 90, 365, 365, NULL),
  ('source_envelope_standard', 'source_envelope', NULL, 'transport_standard', 7, 30, 30, NULL),
  ('public_session_standard', 'memory', 'public_lead', 'public_session', 0, 30, 30, NULL),
  ('inferred_memory_candidate', 'memory', NULL, 'candidate', 0, 30, 30, NULL),
  ('explicit_preference', 'memory', 'internal_sidekick', 'durable_preference', NULL, NULL, NULL, 365),
  ('outbox_sent_standard', 'delivery_outbox', NULL, 'delivery_standard', 0, 30, 30, NULL),
  ('dead_letter_standard', 'dead_letter', NULL, 'dead_letter', 0, 90, 90, NULL),
  ('assistant_audit_standard', 'audit_event', NULL, 'audit_standard', 0, 400, 400, NULL)
ON CONFLICT(policy_key) DO NOTHING;

COMMIT;
