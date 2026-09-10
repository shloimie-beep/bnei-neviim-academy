BEGIN;

CREATE SCHEMA IF NOT EXISTS bna_control_plane;

CREATE TABLE IF NOT EXISTS bna_control_plane.product_keys (
  key_id TEXT PRIMARY KEY,
  product TEXT NOT NULL CHECK (product IN ('one_time', 'bna_school')),
  direction TEXT NOT NULL CHECK (direction IN ('product_event', 'control_command')),
  public_key_pem TEXT NOT NULL,
  origin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bna_control_plane.event_inbox (
  event_id TEXT PRIMARY KEY,
  fingerprint_sha256 TEXT NOT NULL,
  event_type TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('one_time', 'bna_school')),
  key_id TEXT NOT NULL REFERENCES bna_control_plane.product_keys(key_id),
  occurred_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bna_control_plane.replay_nonces (
  key_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key_id, nonce)
);

CREATE TABLE IF NOT EXISTS bna_control_plane.case_index (
  case_ref TEXT PRIMARY KEY,
  product TEXT NOT NULL CHECK (product IN ('one_time', 'bna_school')),
  product_case_id TEXT NOT NULL,
  case_kind TEXT NOT NULL,
  severity TEXT NOT NULL,
  queue TEXT NOT NULL,
  status TEXT NOT NULL,
  redacted_summary TEXT,
  product_case_url TEXT NOT NULL,
  product_version INTEGER NOT NULL CHECK (product_version >= 1),
  opened_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  source_event_id TEXT NOT NULL REFERENCES bna_control_plane.event_inbox(event_id),
  correlation_id TEXT NOT NULL,
  UNIQUE (product, product_case_id)
);

CREATE TABLE IF NOT EXISTS bna_control_plane.case_projection_events (
  id BIGSERIAL PRIMARY KEY,
  case_ref TEXT NOT NULL,
  event_id TEXT NOT NULL REFERENCES bna_control_plane.event_inbox(event_id),
  event_type TEXT NOT NULL,
  product_version INTEGER,
  status TEXT,
  queue TEXT,
  severity TEXT,
  result TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bna_control_plane.command_outbox (
  command_id TEXT PRIMARY KEY,
  command_type TEXT NOT NULL,
  target_product TEXT NOT NULL CHECK (target_product IN ('one_time', 'bna_school')),
  product_case_id TEXT NOT NULL,
  expected_product_version INTEGER NOT NULL CHECK (expected_product_version >= 1),
  instruction JSONB NOT NULL,
  reason_code TEXT NOT NULL,
  envelope JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  leased_by TEXT,
  lease_expires_at TIMESTAMPTZ,
  result_code TEXT,
  product_version INTEGER,
  last_error_code TEXT,
  dead_lettered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bna_control_plane.command_results (
  command_id TEXT PRIMARY KEY REFERENCES bna_control_plane.command_outbox(command_id),
  result TEXT NOT NULL,
  result_code TEXT NOT NULL,
  product_version INTEGER NOT NULL CHECK (product_version >= 1),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bna_control_plane.operator_sessions (
  session_hash TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cp_viewer', 'cp_triage', 'cp_admin', 'cp_auditor')),
  created_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bna_control_plane.telegram_alert_outbox (
  id BIGSERIAL PRIMARY KEY,
  notification_type TEXT NOT NULL CHECK (notification_type = 'control.case.alert.v1'),
  case_ref TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('one_time', 'bna_school')),
  severity TEXT NOT NULL,
  queue TEXT NOT NULL,
  status TEXT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL,
  control_plane_url TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bna_control_plane.audit_events (
  event_id TEXT PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  case_ref TEXT,
  command_id TEXT,
  event_id_ref TEXT,
  result TEXT
);

COMMIT;
