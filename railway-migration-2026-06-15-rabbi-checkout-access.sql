CREATE TABLE IF NOT EXISTS bna_members (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  access_tier TEXT NOT NULL DEFAULT 'library_only',
  access_status TEXT NOT NULL DEFAULT 'active',
  access_code TEXT,
  access_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_product_tiers (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  tier_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month',
  stripe_price_id TEXT,
  stripe_payment_link_url TEXT,
  green_invoice_item_id TEXT,
  green_invoice_payment_link_url TEXT,
  access_scopes TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_product_tiers DROP CONSTRAINT IF EXISTS bna_product_tiers_tier_key_check;
ALTER TABLE bna_product_tiers
  ADD CONSTRAINT bna_product_tiers_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));
ALTER TABLE bna_product_tiers DROP CONSTRAINT IF EXISTS bna_product_tiers_status_check;
ALTER TABLE bna_product_tiers
  ADD CONSTRAINT bna_product_tiers_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_product_tiers_project_tier
  ON bna_product_tiers (project_id, tier_key);
CREATE INDEX IF NOT EXISTS idx_bna_product_tiers_project_status
  ON bna_product_tiers (project_id, status);

CREATE TABLE IF NOT EXISTS bna_payment_provider_settings (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'test',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  secret_configured BOOLEAN NOT NULL DEFAULT FALSE,
  public_config JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_payment_provider_settings DROP CONSTRAINT IF EXISTS bna_payment_provider_settings_provider_check;
ALTER TABLE bna_payment_provider_settings
  ADD CONSTRAINT bna_payment_provider_settings_provider_check
  CHECK (provider IN ('stripe', 'green_invoice'));
ALTER TABLE bna_payment_provider_settings DROP CONSTRAINT IF EXISTS bna_payment_provider_settings_mode_check;
ALTER TABLE bna_payment_provider_settings
  ADD CONSTRAINT bna_payment_provider_settings_mode_check
  CHECK (mode IN ('test', 'live'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_payment_provider_settings_unique
  ON bna_payment_provider_settings (project_id, provider, mode);

CREATE TABLE IF NOT EXISTS bna_checkout_records (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  member_id BIGINT REFERENCES bna_members(id) ON DELETE SET NULL,
  tier_id BIGINT REFERENCES bna_product_tiers(id) ON DELETE SET NULL,
  tier_key TEXT NOT NULL DEFAULT 'library_only',
  provider TEXT NOT NULL,
  provider_mode TEXT NOT NULL DEFAULT 'test',
  checkout_key TEXT,
  provider_checkout_id TEXT,
  provider_payment_id TEXT,
  provider_checkout_url TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'created',
  source TEXT NOT NULL DEFAULT 'public_preview',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMP,
  abandoned_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_checkout_records DROP CONSTRAINT IF EXISTS bna_checkout_records_tier_key_check;
ALTER TABLE bna_checkout_records
  ADD CONSTRAINT bna_checkout_records_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));
ALTER TABLE bna_checkout_records DROP CONSTRAINT IF EXISTS bna_checkout_records_provider_check;
ALTER TABLE bna_checkout_records
  ADD CONSTRAINT bna_checkout_records_provider_check
  CHECK (provider IN ('stripe', 'green_invoice', 'manual'));
ALTER TABLE bna_checkout_records DROP CONSTRAINT IF EXISTS bna_checkout_records_provider_mode_check;
ALTER TABLE bna_checkout_records
  ADD CONSTRAINT bna_checkout_records_provider_mode_check
  CHECK (provider_mode IN ('test', 'live'));
ALTER TABLE bna_checkout_records DROP CONSTRAINT IF EXISTS bna_checkout_records_status_check;
ALTER TABLE bna_checkout_records
  ADD CONSTRAINT bna_checkout_records_status_check
  CHECK (status IN ('created', 'pending', 'paid', 'failed', 'abandoned', 'canceled', 'expired', 'manual_review'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_checkout_records_checkout_key
  ON bna_checkout_records (checkout_key)
  WHERE checkout_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_checkout_records_provider_checkout
  ON bna_checkout_records (project_id, provider, provider_checkout_id)
  WHERE provider_checkout_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bna_checkout_records_project_status
  ON bna_checkout_records (project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_checkout_records_member
  ON bna_checkout_records (member_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_payment_events (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  checkout_record_id BIGINT REFERENCES bna_checkout_records(id) ON DELETE SET NULL,
  member_id BIGINT REFERENCES bna_members(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_mode TEXT NOT NULL DEFAULT 'test',
  event_type TEXT NOT NULL,
  event_key TEXT NOT NULL,
  provider_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  raw_payload JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_payment_events DROP CONSTRAINT IF EXISTS bna_payment_events_provider_check;
ALTER TABLE bna_payment_events
  ADD CONSTRAINT bna_payment_events_provider_check
  CHECK (provider IN ('stripe', 'green_invoice', 'manual'));
ALTER TABLE bna_payment_events DROP CONSTRAINT IF EXISTS bna_payment_events_provider_mode_check;
ALTER TABLE bna_payment_events
  ADD CONSTRAINT bna_payment_events_provider_mode_check
  CHECK (provider_mode IN ('test', 'live'));
ALTER TABLE bna_payment_events DROP CONSTRAINT IF EXISTS bna_payment_events_status_check;
ALTER TABLE bna_payment_events
  ADD CONSTRAINT bna_payment_events_status_check
  CHECK (status IN ('received', 'processed', 'duplicate', 'ignored', 'failed'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_payment_events_unique_event
  ON bna_payment_events (project_id, provider, event_key);
CREATE INDEX IF NOT EXISTS idx_bna_payment_events_checkout
  ON bna_payment_events (checkout_record_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_access_grants (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES bna_members(id) ON DELETE CASCADE,
  checkout_record_id BIGINT REFERENCES bna_checkout_records(id) ON DELETE SET NULL,
  payment_event_id BIGINT REFERENCES bna_payment_events(id) ON DELETE SET NULL,
  tier_id BIGINT REFERENCES bna_product_tiers(id) ON DELETE SET NULL,
  tier_key TEXT NOT NULL DEFAULT 'library_only',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT NOT NULL DEFAULT 'manual',
  starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_by TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_access_grants DROP CONSTRAINT IF EXISTS bna_access_grants_tier_key_check;
ALTER TABLE bna_access_grants
  ADD CONSTRAINT bna_access_grants_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));
ALTER TABLE bna_access_grants DROP CONSTRAINT IF EXISTS bna_access_grants_status_check;
ALTER TABLE bna_access_grants
  ADD CONSTRAINT bna_access_grants_status_check
  CHECK (status IN ('active', 'revoked', 'expired', 'pending'));
CREATE INDEX IF NOT EXISTS idx_bna_access_grants_project_status
  ON bna_access_grants (project_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_access_grants_member
  ON bna_access_grants (member_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_access_grants_checkout
  ON bna_access_grants (checkout_record_id);

CREATE TABLE IF NOT EXISTS bna_member_login_tokens (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES bna_members(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'magic_link',
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_member_login_tokens DROP CONSTRAINT IF EXISTS bna_member_login_tokens_purpose_check;
ALTER TABLE bna_member_login_tokens
  ADD CONSTRAINT bna_member_login_tokens_purpose_check
  CHECK (purpose IN ('magic_link', 'session'));
ALTER TABLE bna_member_login_tokens DROP CONSTRAINT IF EXISTS bna_member_login_tokens_status_check;
ALTER TABLE bna_member_login_tokens
  ADD CONSTRAINT bna_member_login_tokens_status_check
  CHECK (status IN ('active', 'used', 'revoked', 'expired'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_member_login_tokens_hash
  ON bna_member_login_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_bna_member_login_tokens_member
  ON bna_member_login_tokens (member_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_member_login_tokens_expires
  ON bna_member_login_tokens (expires_at);

CREATE TABLE IF NOT EXISTS bna_library_items (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'video',
  media_url TEXT,
  vimeo_url TEXT,
  thumbnail_url TEXT,
  required_scope TEXT NOT NULL DEFAULT 'library',
  visibility TEXT NOT NULL DEFAULT 'draft',
  source_table TEXT,
  source_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_library_items DROP CONSTRAINT IF EXISTS bna_library_items_required_scope_check;
ALTER TABLE bna_library_items
  ADD CONSTRAINT bna_library_items_required_scope_check
  CHECK (required_scope IN ('library', 'live'));
ALTER TABLE bna_library_items DROP CONSTRAINT IF EXISTS bna_library_items_visibility_check;
ALTER TABLE bna_library_items
  ADD CONSTRAINT bna_library_items_visibility_check
  CHECK (visibility IN ('draft', 'published', 'hidden', 'archived'));
CREATE INDEX IF NOT EXISTS idx_bna_library_items_project_visibility
  ON bna_library_items (project_id, visibility, published_at DESC);

CREATE TABLE IF NOT EXISTS bna_live_sessions (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  zoom_url TEXT,
  required_scope TEXT NOT NULL DEFAULT 'live',
  status TEXT NOT NULL DEFAULT 'scheduled',
  recording_url TEXT,
  recording_status TEXT NOT NULL DEFAULT 'none',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_live_sessions DROP CONSTRAINT IF EXISTS bna_live_sessions_required_scope_check;
ALTER TABLE bna_live_sessions
  ADD CONSTRAINT bna_live_sessions_required_scope_check
  CHECK (required_scope IN ('library', 'live'));
ALTER TABLE bna_live_sessions DROP CONSTRAINT IF EXISTS bna_live_sessions_status_check;
ALTER TABLE bna_live_sessions
  ADD CONSTRAINT bna_live_sessions_status_check
  CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'canceled', 'archived'));
ALTER TABLE bna_live_sessions DROP CONSTRAINT IF EXISTS bna_live_sessions_recording_status_check;
ALTER TABLE bna_live_sessions
  ADD CONSTRAINT bna_live_sessions_recording_status_check
  CHECK (recording_status IN ('none', 'pending', 'published', 'hidden'));
CREATE INDEX IF NOT EXISTS idx_bna_live_sessions_project_start
  ON bna_live_sessions (project_id, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_live_sessions_status
  ON bna_live_sessions (project_id, status);

CREATE TABLE IF NOT EXISTS bna_project_public_pages (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES bna_projects(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  route_path TEXT NOT NULL DEFAULT '/rabbi',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'preview',
  allow_public_replacement BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMP,
  content JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_project_public_pages DROP CONSTRAINT IF EXISTS bna_project_public_pages_status_check;
ALTER TABLE bna_project_public_pages
  ADD CONSTRAINT bna_project_public_pages_status_check
  CHECK (status IN ('draft', 'preview', 'approved', 'published', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_project_public_pages_project_key
  ON bna_project_public_pages (project_id, page_key);

ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS member_id BIGINT REFERENCES bna_members(id) ON DELETE SET NULL;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS checkout_record_id BIGINT REFERENCES bna_checkout_records(id) ON DELETE SET NULL;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS access_grant_id BIGINT REFERENCES bna_access_grants(id) ON DELETE SET NULL;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS template_key TEXT;
ALTER TABLE bna_email_log ADD COLUMN IF NOT EXISTS recipient_name TEXT;
CREATE INDEX IF NOT EXISTS idx_bna_email_log_project_id ON bna_email_log (project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_member_id ON bna_email_log (member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_checkout_record_id ON bna_email_log (checkout_record_id);
CREATE INDEX IF NOT EXISTS idx_bna_email_log_access_grant_id ON bna_email_log (access_grant_id);

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
)
INSERT INTO bna_product_tiers (
  project_id, tier_key, display_name, description, price_amount_cents, currency,
  billing_interval, access_scopes, status, sort_order, metadata, updated_at
)
SELECT id, 'library_only', 'Video Library', 'Recorded Mishnayos library access.', NULL,
       'USD', 'month', ARRAY['library'], 'active', 10,
       '{"seeded_by":"rabbi_checkout_access_migration","launch_mode":"preview"}'::jsonb, NOW()
FROM project
ON CONFLICT (project_id, tier_key)
DO UPDATE SET
  display_name = COALESCE(NULLIF(bna_product_tiers.display_name, ''), EXCLUDED.display_name),
  description = COALESCE(bna_product_tiers.description, EXCLUDED.description),
  access_scopes = EXCLUDED.access_scopes,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
)
INSERT INTO bna_product_tiers (
  project_id, tier_key, display_name, description, price_amount_cents, currency,
  billing_interval, access_scopes, status, sort_order, metadata, updated_at
)
SELECT id, 'live_library', 'Live + Library', 'Live Zoom classes plus recorded Mishnayos library access.', NULL,
       'USD', 'month', ARRAY['library','live'], 'active', 20,
       '{"seeded_by":"rabbi_checkout_access_migration","launch_mode":"preview"}'::jsonb, NOW()
FROM project
ON CONFLICT (project_id, tier_key)
DO UPDATE SET
  display_name = COALESCE(NULLIF(bna_product_tiers.display_name, ''), EXCLUDED.display_name),
  description = COALESCE(bna_product_tiers.description, EXCLUDED.description),
  access_scopes = EXCLUDED.access_scopes,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
), planning_tiers AS (
  SELECT * FROM (VALUES
    (
      'library_live_low_touch',
      'Library + Live Replay',
      'Low-touch Mishnayos library, replay, and class schedule access for review.',
      ARRAY['library','live']::text[],
      30,
      '{"seeded_by":"rabbi_checkout_access_migration","launch_mode":"draft","price_status":"decision_pending","candidate_prices":[50,67,100,149],"preferred_candidate_price":50,"public_publish_status":"draft","checkout_enabled":false}'::jsonb
    ),
    (
      'interactive_zoom',
      'Interactive Zoom',
      'Live Zoom participation with replay/library access and moderated questions for review.',
      ARRAY['library','live']::text[],
      40,
      '{"seeded_by":"rabbi_checkout_access_migration","launch_mode":"draft","price_status":"decision_pending","candidate_prices":[149,150],"preferred_candidate_price":149,"public_publish_status":"draft","checkout_enabled":false}'::jsonb
    ),
    (
      'vip_high_touch',
      'VIP High-Touch',
      'High-touch Mishnayos support candidate tier for families who need direct guidance.',
      ARRAY['library','live']::text[],
      50,
      '{"seeded_by":"rabbi_checkout_access_migration","launch_mode":"draft","price_status":"decision_pending","candidate_prices":[300],"preferred_candidate_price":300,"candidate_price_note":"$300+","public_publish_status":"draft","checkout_enabled":false}'::jsonb
    )
  ) AS t(tier_key, display_name, description, access_scopes, sort_order, metadata)
)
INSERT INTO bna_product_tiers (
  project_id, tier_key, display_name, description, price_amount_cents, currency,
  billing_interval, access_scopes, status, sort_order, metadata, updated_at
)
SELECT project.id, planning_tiers.tier_key, planning_tiers.display_name,
       planning_tiers.description, NULL, 'USD', 'month',
       planning_tiers.access_scopes, 'draft', planning_tiers.sort_order,
       planning_tiers.metadata, NOW()
FROM project
CROSS JOIN planning_tiers
ON CONFLICT (project_id, tier_key)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = COALESCE(bna_product_tiers.description, EXCLUDED.description),
  access_scopes = EXCLUDED.access_scopes,
  sort_order = EXCLUDED.sort_order,
  metadata = COALESCE(bna_product_tiers.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
), settings AS (
  SELECT * FROM (VALUES
    ('stripe', 'test'),
    ('stripe', 'live'),
    ('green_invoice', 'test'),
    ('green_invoice', 'live')
  ) AS s(provider, mode)
)
INSERT INTO bna_payment_provider_settings (
  project_id, provider, mode, enabled, secret_configured, public_config, metadata, updated_by, updated_at
)
SELECT project.id, settings.provider, settings.mode, FALSE, FALSE,
       '{}'::jsonb,
       jsonb_build_object('seeded_by', 'rabbi_checkout_access_migration', 'launch_mode', 'preview'),
       'migration',
       NOW()
FROM project
CROSS JOIN settings
ON CONFLICT (project_id, provider, mode)
DO UPDATE SET
  public_config = COALESCE(bna_payment_provider_settings.public_config, '{}'::jsonb),
  metadata = COALESCE(bna_payment_provider_settings.metadata, '{}'::jsonb)
    || jsonb_build_object('seeded_by', 'rabbi_checkout_access_migration'),
  updated_at = NOW();

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
)
INSERT INTO bna_project_public_pages (
  project_id, page_key, route_path, title, status, allow_public_replacement,
  content, metadata, updated_at
)
SELECT id, 'rabbi_landing', '/rabbi', 'One Time Mishnayos Preview', 'preview', FALSE,
       '{
          "hero_title":"One Time Mishnayos",
          "hero_subtitle":"Preview membership page for Rabbi Elie Scheller classes.",
          "hero_note":"Preview mode only. This does not replace the BNA homepage.",
          "image_placeholders":["Rabbi teaching image","Mishnayos library image","Live class image"],
          "sections":[
            {"title":"Video Library","body":"Recorded classes and source material after review."},
            {"title":"Live + Library","body":"Live Zoom class access plus the video library."}
          ]
        }'::jsonb,
       '{"seeded_by":"rabbi_checkout_access_migration","public_replacement_blocked":true}'::jsonb,
       NOW()
FROM project
ON CONFLICT (project_id, page_key)
DO UPDATE SET
  route_path = EXCLUDED.route_path,
  title = COALESCE(NULLIF(bna_project_public_pages.title, ''), EXCLUDED.title),
  status = CASE
    WHEN bna_project_public_pages.status IN ('approved', 'published') THEN bna_project_public_pages.status
    ELSE 'preview'
  END,
  allow_public_replacement = COALESCE(bna_project_public_pages.allow_public_replacement, FALSE),
  metadata = COALESCE(bna_project_public_pages.metadata, '{}'::jsonb)
    || jsonb_build_object('public_replacement_blocked', true),
  updated_at = NOW();
