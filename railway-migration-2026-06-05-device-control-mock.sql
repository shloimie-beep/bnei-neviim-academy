-- BNA device-control mock MVP.
-- Safe app-side tables only: no Headwind, FreeKiosk, QStudio, or Qustodio calls.

CREATE TABLE IF NOT EXISTS bna_devices (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'android',
  provider TEXT NOT NULL DEFAULT 'mock',
  provider_device_id TEXT,
  status TEXT NOT NULL DEFAULT 'accountability_only',
  last_seen_at TIMESTAMP,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_device_access_rules (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE CASCADE,
  device_id INTEGER REFERENCES bna_devices(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'goal_approval',
  required_goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  schedule JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_device_access_sessions (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES bna_devices(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL,
  goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL,
  rule_id INTEGER REFERENCES bna_device_access_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'accountability_only',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  ended_at TIMESTAMP,
  approved_by TEXT,
  reason TEXT,
  provider TEXT NOT NULL DEFAULT 'mock',
  provider_result JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES bna_students(id) ON DELETE SET NULL;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS provider_device_id TEXT;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'accountability_only';
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;
ALTER TABLE bna_devices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS required_goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}';
ALTER TABLE bna_device_access_rules ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES bna_accountability_events(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS rule_id INTEGER REFERENCES bna_device_access_rules(id) ON DELETE SET NULL;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mock';
ALTER TABLE bna_device_access_sessions ADD COLUMN IF NOT EXISTS provider_result JSONB DEFAULT '{}';

ALTER TABLE bna_devices DROP CONSTRAINT IF EXISTS bna_devices_status_check;
ALTER TABLE bna_devices
  ADD CONSTRAINT bna_devices_status_check
  CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override'));

ALTER TABLE bna_devices DROP CONSTRAINT IF EXISTS bna_devices_platform_check;
ALTER TABLE bna_devices
  ADD CONSTRAINT bna_devices_platform_check
  CHECK (platform IN ('android', 'ios', 'web', 'unknown'));

ALTER TABLE bna_device_access_rules DROP CONSTRAINT IF EXISTS bna_device_access_rules_rule_type_check;
ALTER TABLE bna_device_access_rules
  ADD CONSTRAINT bna_device_access_rules_rule_type_check
  CHECK (rule_type IN ('goal_approval', 'schedule', 'manual'));

ALTER TABLE bna_device_access_rules DROP CONSTRAINT IF EXISTS bna_device_access_rules_duration_minutes_check;
ALTER TABLE bna_device_access_rules
  ADD CONSTRAINT bna_device_access_rules_duration_minutes_check
  CHECK (duration_minutes > 0 AND duration_minutes <= 1440);

ALTER TABLE bna_device_access_sessions DROP CONSTRAINT IF EXISTS bna_device_access_sessions_status_check;
ALTER TABLE bna_device_access_sessions
  ADD CONSTRAINT bna_device_access_sessions_status_check
  CHECK (status IN ('locked', 'accountability_only', 'approved_access', 'expired', 'manual_override'));

CREATE INDEX IF NOT EXISTS idx_bna_devices_student_id ON bna_devices (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_devices_status ON bna_devices (status);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_student_id ON bna_device_access_rules (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_device_id ON bna_device_access_rules (device_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_rules_goal_id ON bna_device_access_rules (required_goal_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_device_id ON bna_device_access_sessions (device_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_student_id ON bna_device_access_sessions (student_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_goal_id ON bna_device_access_sessions (goal_id);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_status ON bna_device_access_sessions (status);
CREATE INDEX IF NOT EXISTS idx_bna_device_access_sessions_expires_at ON bna_device_access_sessions (expires_at);
