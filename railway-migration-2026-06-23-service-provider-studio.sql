CREATE TABLE IF NOT EXISTS bna_studio_projects (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  workspace_key TEXT NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'slideshow_video',
  status TEXT NOT NULL DEFAULT 'draft',
  brief_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  character_bible JSONB NOT NULL DEFAULT '[]'::jsonb,
  guardrails JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT 'studio',
  updated_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_studio_projects DROP CONSTRAINT IF EXISTS bna_studio_projects_status_check;
ALTER TABLE bna_studio_projects ADD CONSTRAINT bna_studio_projects_status_check
  CHECK (status IN ('draft', 'structuring', 'storyboard', 'review', 'approved', 'handed_off', 'archived'));
CREATE INDEX IF NOT EXISTS idx_bna_studio_projects_project_id ON bna_studio_projects (project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_projects_workspace_key ON bna_studio_projects (workspace_key, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_projects_status ON bna_studio_projects (status);

CREATE TABLE IF NOT EXISTS bna_studio_sources (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  source_hash TEXT NOT NULL,
  raw_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual_paste',
  raw_text TEXT NOT NULL,
  normalized_text TEXT NOT NULL,
  sanitized_html TEXT,
  annotations JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_immutable BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT DEFAULT 'studio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_studio_sources_project_hash
  ON bna_studio_sources (studio_project_id, source_hash);
CREATE INDEX IF NOT EXISTS idx_bna_studio_sources_project_id ON bna_studio_sources (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_sources_source_hash ON bna_studio_sources (source_hash);

CREATE TABLE IF NOT EXISTS bna_studio_scenes (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  scene_key TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body TEXT,
  narration TEXT,
  visual_prompt TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 12,
  transition TEXT NOT NULL DEFAULT 'cut',
  character_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  asset_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  style_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT 'studio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_studio_scenes_project_key
  ON bna_studio_scenes (studio_project_id, scene_key);
CREATE INDEX IF NOT EXISTS idx_bna_studio_scenes_project_position
  ON bna_studio_scenes (studio_project_id, position);
CREATE INDEX IF NOT EXISTS idx_bna_studio_scenes_project_id ON bna_studio_scenes (project_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_scene_versions (
  id BIGSERIAL PRIMARY KEY,
  scene_id BIGINT NOT NULL REFERENCES bna_studio_scenes(id) ON DELETE CASCADE,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_note TEXT,
  created_by TEXT DEFAULT 'studio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (scene_id, version)
);
CREATE INDEX IF NOT EXISTS idx_bna_studio_scene_versions_project
  ON bna_studio_scene_versions (studio_project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_prompt_layers (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  scene_id BIGINT REFERENCES bna_studio_scenes(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  layer_type TEXT NOT NULL,
  layer_key TEXT NOT NULL,
  label TEXT,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  locked BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active',
  layer_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT 'studio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_studio_prompt_layers DROP CONSTRAINT IF EXISTS bna_studio_prompt_layers_type_check;
ALTER TABLE bna_studio_prompt_layers ADD CONSTRAINT bna_studio_prompt_layers_type_check
  CHECK (layer_type IN ('system_policy', 'workspace_defaults', 'project_brief', 'character_bible', 'source_context', 'scene_instruction', 'correction_patch', 'renderer_contract', 'output_contract'));
CREATE INDEX IF NOT EXISTS idx_bna_studio_prompt_layers_project
  ON bna_studio_prompt_layers (studio_project_id, scene_id, layer_type, version DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_prompt_layers_project_id ON bna_studio_prompt_layers (project_id);

CREATE TABLE IF NOT EXISTS bna_studio_revision_patches (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  scene_id BIGINT REFERENCES bna_studio_scenes(id) ON DELETE SET NULL,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  patch_id TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'scene',
  correction_text TEXT NOT NULL,
  operations JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'preview',
  requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
  applied_by TEXT,
  applied_at TIMESTAMP,
  reverted_by TEXT,
  reverted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (studio_project_id, patch_id)
);
CREATE INDEX IF NOT EXISTS idx_bna_studio_revision_patches_project
  ON bna_studio_revision_patches (studio_project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_jobs (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  provider TEXT NOT NULL DEFAULT 'mock',
  model TEXT NOT NULL DEFAULT 'deterministic-v1',
  idempotency_key TEXT NOT NULL,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempts INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_studio_jobs DROP CONSTRAINT IF EXISTS bna_studio_jobs_type_check;
ALTER TABLE bna_studio_jobs ADD CONSTRAINT bna_studio_jobs_type_check
  CHECK (job_type IN ('outline', 'storyboard', 'prompt_compile', 'image_mock', 'render_mock', 'content_handoff'));
ALTER TABLE bna_studio_jobs DROP CONSTRAINT IF EXISTS bna_studio_jobs_status_check;
ALTER TABLE bna_studio_jobs ADD CONSTRAINT bna_studio_jobs_status_check
  CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'stale'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_studio_jobs_idempotency ON bna_studio_jobs (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_bna_studio_jobs_project ON bna_studio_jobs (studio_project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_jobs_project_id ON bna_studio_jobs (project_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_assets (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  scene_id BIGINT REFERENCES bna_studio_scenes(id) ON DELETE SET NULL,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  asset_key TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'mock_image',
  title TEXT,
  url TEXT,
  local_path TEXT,
  rights_status TEXT NOT NULL DEFAULT 'internal_mock_only',
  privacy_status TEXT NOT NULL DEFAULT 'review_required',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (studio_project_id, asset_key)
);
CREATE INDEX IF NOT EXISTS idx_bna_studio_assets_project ON bna_studio_assets (studio_project_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_assets_project_id ON bna_studio_assets (project_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_exports (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT NOT NULL REFERENCES bna_studio_projects(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL DEFAULT 'content_handoff',
  idempotency_key TEXT NOT NULL,
  content_job_id INTEGER REFERENCES bna_content_jobs(id) ON DELETE SET NULL,
  manifest_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  no_publish BOOLEAN NOT NULL DEFAULT TRUE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by TEXT DEFAULT 'studio',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_studio_exports_idempotency ON bna_studio_exports (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_bna_studio_exports_project ON bna_studio_exports (studio_project_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_usage_events (
  id BIGSERIAL PRIMARY KEY,
  studio_project_id BIGINT REFERENCES bna_studio_projects(id) ON DELETE SET NULL,
  job_id BIGINT REFERENCES bna_studio_jobs(id) ON DELETE SET NULL,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  workspace_key TEXT NOT NULL,
  actor TEXT,
  provider TEXT NOT NULL DEFAULT 'mock',
  model TEXT NOT NULL DEFAULT 'deterministic-v1',
  operation TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  media_seconds INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(12,6) NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'succeeded',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bna_studio_usage_events_workspace
  ON bna_studio_usage_events (workspace_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_studio_usage_events_project
  ON bna_studio_usage_events (project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_studio_price_catalog (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_per_1m NUMERIC(12,6) NOT NULL DEFAULT 0,
  output_per_1m NUMERIC(12,6) NOT NULL DEFAULT 0,
  media_second NUMERIC(12,6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, model)
);

INSERT INTO bna_studio_price_catalog (provider, model, input_per_1m, output_per_1m, media_second, metadata)
VALUES
  ('mock', 'deterministic-v1', 0, 0, 0, '{"credential_free":true}'::jsonb),
  ('openai', 'gpt-4.1-mini', 0.4, 1.6, 0, '{"pending_live_adapter":true}'::jsonb),
  ('kimi', 'kimi-k2.6', 0.6, 2.5, 0, '{"pending_live_adapter":true}'::jsonb)
ON CONFLICT (provider, model) DO UPDATE SET
  input_per_1m = EXCLUDED.input_per_1m,
  output_per_1m = EXCLUDED.output_per_1m,
  media_second = EXCLUDED.media_second,
  metadata = bna_studio_price_catalog.metadata || EXCLUDED.metadata,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS bna_studio_workspace_settings (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  workspace_key TEXT NOT NULL,
  monthly_budget_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  alert_threshold_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  hard_limit_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  allow_paid_generation BOOLEAN NOT NULL DEFAULT FALSE,
  settings_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, workspace_key)
);
CREATE INDEX IF NOT EXISTS idx_bna_studio_workspace_settings_workspace
  ON bna_studio_workspace_settings (workspace_key);
