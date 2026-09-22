-- Provider-scoped integration readiness and secret-reference metadata.
-- Raw provider secrets are not stored by this migration.
-- DNS tasks may say "copy exact value from dashboard on Thursday"; do not use
-- fake, guessed, or screenshot-truncated DNS values.

ALTER TABLE bna_provider_integrations ALTER COLUMN provider_id DROP NOT NULL;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS workspace_id INTEGER;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS integration_type TEXT;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_configured';
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS connected_account_label TEXT;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE bna_provider_integrations ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system';
ALTER TABLE bna_provider_integrations DROP CONSTRAINT IF EXISTS bna_provider_integrations_status_check;
ALTER TABLE bna_provider_integrations
  ADD CONSTRAINT bna_provider_integrations_status_check CHECK (status IN ('not_configured', 'needs_provider_account', 'needs_api_key', 'needs_dns', 'needs_owner_access', 'blocked_until_thursday', 'ready_for_test', 'connected', 'failed', 'disabled'));

UPDATE bna_provider_integrations
SET integration_type = COALESCE(NULLIF(integration_type, ''), integration_key, 'other'),
    display_name = COALESCE(NULLIF(display_name, ''), label, integration_key),
    status = COALESCE(NULLIF(status, ''), 'not_configured')
WHERE integration_type IS NULL OR integration_type = '' OR display_name IS NULL OR display_name = '';

CREATE TABLE IF NOT EXISTS bna_provider_secret_refs (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE SET NULL,
  integration_id INTEGER REFERENCES bna_provider_integrations(id) ON DELETE SET NULL,
  secret_type TEXT NOT NULL,
  secret_ref TEXT NOT NULL,
  secret_label TEXT,
  secret_hash_prefix TEXT,
  fingerprint TEXT,
  encrypted_secret TEXT,
  encryption_version TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'needs_rotation', 'revoked', 'disabled', 'pending_keyholder')),
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_rotated_at TIMESTAMP,
  revoked_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS bna_provider_integration_audit_log (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE SET NULL,
  integration_id INTEGER REFERENCES bna_provider_integrations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor TEXT DEFAULT 'system',
  outcome TEXT NOT NULL DEFAULT 'recorded',
  route_path TEXT,
  request_ip_hash TEXT,
  user_agent_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_dns_setup_tasks ADD COLUMN IF NOT EXISTS workspace_id INTEGER;
ALTER TABLE bna_dns_setup_tasks ADD COLUMN IF NOT EXISTS provider_id INTEGER;
ALTER TABLE bna_dns_setup_tasks ADD COLUMN IF NOT EXISTS purpose TEXT;
ALTER TABLE bna_dns_setup_tasks ADD COLUMN IF NOT EXISTS record_type TEXT;
ALTER TABLE bna_dns_setup_tasks DROP CONSTRAINT IF EXISTS bna_dns_setup_tasks_status_check;
ALTER TABLE bna_dns_setup_tasks
  ADD CONSTRAINT bna_dns_setup_tasks_status_check CHECK (status IN ('needed', 'waiting_on_owner', 'copied_from_dashboard', 'added_to_dns', 'needs_values', 'pending_dns_entry', 'entered', 'verify_pending', 'verified', 'failed', 'blocked', 'skipped'));

UPDATE bna_dns_setup_tasks
SET purpose = COALESCE(NULLIF(purpose, ''), NULLIF(record_purpose, ''), 'verification'),
    record_type = COALESCE(NULLIF(record_type, ''), NULLIF(type, ''), 'TXT')
WHERE purpose IS NULL OR purpose = '' OR record_type IS NULL OR record_type = '';

CREATE INDEX IF NOT EXISTS idx_bna_provider_integrations_workspace_type ON bna_provider_integrations(workspace_id, integration_type, status);
CREATE INDEX IF NOT EXISTS idx_bna_provider_secret_refs_integration ON bna_provider_secret_refs(integration_id, secret_type, status);
CREATE INDEX IF NOT EXISTS idx_bna_provider_secret_refs_provider ON bna_provider_secret_refs(provider_id, secret_type, status);
CREATE INDEX IF NOT EXISTS idx_bna_provider_integration_audit ON bna_provider_integration_audit_log(integration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_dns_setup_tasks_workspace_provider ON bna_dns_setup_tasks(workspace_id, provider_id, status);
