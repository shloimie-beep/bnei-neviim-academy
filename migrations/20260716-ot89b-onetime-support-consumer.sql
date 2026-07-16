-- OT-89B BNA subscriber-support consumer.
-- Additive only. Real provider transports remain disabled by default.

BEGIN;

CREATE TABLE IF NOT EXISTS bna_onetime_support_nonces (
  id SERIAL PRIMARY KEY,
  key_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(key_id, nonce)
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_events (
  id SERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  source_ticket_id TEXT NOT NULL UNIQUE,
  body_fingerprint TEXT NOT NULL,
  immutable_fingerprint TEXT NOT NULL,
  bna_ticket_ref TEXT NOT NULL UNIQUE,
  support_ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  onetime_account_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_operator'
    CHECK (status IN ('new', 'triage', 'pending_operator', 'waiting_customer', 'in_progress', 'resolved', 'closed', 'rejected')),
  status_version INTEGER NOT NULL DEFAULT 1 CHECK (status_version >= 1),
  public_summary TEXT NOT NULL,
  triage JSONB NOT NULL DEFAULT '{}'::jsonb,
  sla JSONB NOT NULL DEFAULT '{}'::jsonb,
  sanitized_event JSONB NOT NULL DEFAULT '{}'::jsonb,
  trace JSONB NOT NULL DEFAULT '{}'::jsonb,
  audit JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_history (
  id SERIAL PRIMARY KEY,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  status TEXT NOT NULL,
  transition TEXT NOT NULL,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_attachment_refs (
  id SERIAL PRIMARY KEY,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  attachment_id TEXT NOT NULL,
  normalized_filename TEXT NOT NULL,
  media_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,
  transfer_locator TEXT NOT NULL,
  fetch_state TEXT NOT NULL DEFAULT 'not_fetched'
    CHECK (fetch_state IN ('not_fetched', 'pending', 'stored_private_copy', 'failed')),
  private_storage_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bna_ticket_ref, attachment_id)
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_alert_outbox (
  id SERIAL PRIMARY KEY,
  alert_key TEXT NOT NULL UNIQUE,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  support_ticket_id INTEGER REFERENCES bna_support_tickets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  claimed_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_onetime_support_decision_tokens (
  id SERIAL PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  bna_ticket_ref TEXT NOT NULL REFERENCES bna_onetime_support_events(bna_ticket_ref) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('keep_as_ticket', 'ask_for_details', 'reject')),
  ticket_version INTEGER NOT NULL DEFAULT 1 CHECK (ticket_version >= 1),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired', 'denied')),
  actor_scope TEXT NOT NULL DEFAULT 'platform_super_admin',
  expires_at TIMESTAMP NOT NULL,
  decided_by TEXT,
  decided_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_events_status
  ON bna_onetime_support_events(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_events_account
  ON bna_onetime_support_events(onetime_account_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_nonces_expiry
  ON bna_onetime_support_nonces(expires_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_alert_claim
  ON bna_onetime_support_alert_outbox(status, created_at);
CREATE INDEX IF NOT EXISTS idx_bna_onetime_support_history_ref
  ON bna_onetime_support_history(bna_ticket_ref, created_at);

COMMIT;
