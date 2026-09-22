CREATE TABLE IF NOT EXISTS bna_provider_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES bna_provider_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bna_provider_categories (slug, name, description, sort_order, active, seo_title, seo_description)
VALUES
  ('tutoring', 'Tutoring', 'Academic and homework support for students.', 10, TRUE, 'Tutoring providers for BNA families', 'Find approved tutoring providers and academic support options.'),
  ('chugim-classes', 'Chugim / Classes', 'Classes, groups, and recurring enrichment programs.', 20, TRUE, 'Chugim and classes for BNA families', 'Find approved classes, groups, and enrichment programs.'),
  ('coaching', 'Coaching', 'Student, parent, learning, and executive-function coaching.', 30, TRUE, 'Coaching providers for BNA families', 'Find approved coaching providers and support options.'),
  ('therapy-support', 'Therapy / Support', 'Therapy-adjacent and support services for families.', 40, TRUE, 'Therapy and support providers for BNA families', 'Find approved support providers for families.'),
  ('rabbeim-shiurim', 'Rabbeim / Shiurim', 'Torah learning, rabbeim, shiurim, and chavrusah-style programs.', 50, TRUE, 'Rabbeim and shiurim for BNA families', 'Find approved Torah learning providers and shiurim.'),
  ('extracurricular', 'Extracurricular', 'Activities outside core school subjects.', 60, TRUE, 'Extracurricular providers for BNA families', 'Find approved extracurricular options and activity providers.'),
  ('camps-programs', 'Camps / Programs', 'Seasonal camps, programs, and structured experiences.', 70, TRUE, 'Camps and programs for BNA families', 'Find approved camps and programs.'),
  ('family-services', 'Family Services', 'Family-facing services and practical supports.', 80, TRUE, 'Family service providers for BNA families', 'Find approved family service providers.')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  seo_title = COALESCE(bna_provider_categories.seo_title, EXCLUDED.seo_title),
  seo_description = COALESCE(bna_provider_categories.seo_description, EXCLUDED.seo_description),
  updated_at = NOW();

ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS location_label TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS service_area_json JSONB DEFAULT '{}';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS publish_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS free_setup BOOLEAN DEFAULT TRUE;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS free_listing BOOLEAN DEFAULT TRUE;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS upgrade_status TEXT DEFAULT 'none';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS upgrade_interest JSONB DEFAULT '{}';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS private_admin_notes TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS source_context JSONB DEFAULT '{}';
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS hidden_by TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMP;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE bna_service_providers ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE bna_service_providers ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE bna_service_providers DROP CONSTRAINT IF EXISTS bna_service_providers_status_check;
ALTER TABLE bna_service_providers
  ADD CONSTRAINT bna_service_providers_status_check
  CHECK (status IN ('draft', 'pending', 'pending_review', 'approved', 'hidden', 'paused', 'rejected', 'archived'));

UPDATE bna_service_providers
SET
  display_name = COALESCE(NULLIF(display_name, ''), provider_name),
  email = COALESCE(NULLIF(email, ''), NULLIF(contact_email, '')),
  phone = COALESCE(NULLIF(phone, ''), NULLIF(contact_phone, '')),
  whatsapp = COALESCE(NULLIF(whatsapp, ''), NULLIF(whatsapp_phone, '')),
  profile_photo_url = COALESCE(NULLIF(profile_photo_url, ''), NULLIF(profile_image_url, '')),
  about = COALESCE(NULLIF(about, ''), NULLIF(full_description, ''), NULLIF(public_notes, '')),
  location_label = COALESCE(NULLIF(location_label, ''), NULLIF(service_area, ''), NULLIF(city, '')),
  notes = COALESCE(NULLIF(notes, ''), NULLIF(public_notes, '')),
  private_admin_notes = COALESCE(NULLIF(private_admin_notes, ''), NULLIF(private_notes, '')),
  source = COALESCE(NULLIF(source, ''), 'legacy_provider_foundation'),
  free_setup = COALESCE(free_setup, TRUE),
  free_listing = COALESCE(free_listing, TRUE),
  updated_at = NOW()
WHERE TRUE;

CREATE TABLE IF NOT EXISTS bna_provider_category_map (
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES bna_provider_categories(id) ON DELETE CASCADE,
  PRIMARY KEY(provider_id, category_id)
);

CREATE TABLE IF NOT EXISTS bna_provider_images (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  source_context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_provider_offerings (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES bna_provider_categories(id) ON DELETE SET NULL,
  slug TEXT,
  title TEXT NOT NULL,
  description TEXT,
  offering_type TEXT DEFAULT 'service' CHECK (offering_type IN ('service', 'class', 'course', 'free_course', 'free_offer', 'shiur', 'program')),
  is_free BOOLEAN DEFAULT FALSE,
  price_text TEXT,
  age_range TEXT,
  schedule_text TEXT,
  location_label TEXT,
  language TEXT,
  signup_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bna_provider_leads (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE CASCADE,
  parent_name TEXT,
  email TEXT,
  phone TEXT,
  question TEXT NOT NULL,
  child_age TEXT,
  preferred_language TEXT,
  source_page TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web';
ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS external_user_id TEXT;
ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';
ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS transcript JSONB DEFAULT '[]';
ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS missing_fields TEXT[] DEFAULT '{}';
ALTER TABLE bna_provider_onboarding_sessions ADD COLUMN IF NOT EXISTS last_prompt TEXT;
ALTER TABLE bna_provider_onboarding_sessions DROP CONSTRAINT IF EXISTS bna_provider_onboarding_sessions_status_check;
ALTER TABLE bna_provider_onboarding_sessions
  ADD CONSTRAINT bna_provider_onboarding_sessions_status_check
  CHECK (status IN ('draft', 'active', 'intake_received', 'parsed', 'needs_review', 'confirmed', 'completed', 'archived'));

CREATE TABLE IF NOT EXISTS bna_provider_upgrade_events (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES bna_service_providers(id) ON DELETE CASCADE,
  upgrade_type TEXT NOT NULL,
  status TEXT DEFAULT 'interested',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_service_providers_slug_unique
  ON bna_service_providers(lower(slug))
  WHERE slug IS NOT NULL AND trim(slug) <> '';
CREATE INDEX IF NOT EXISTS idx_bna_service_providers_slug ON bna_service_providers(slug);
CREATE INDEX IF NOT EXISTS idx_bna_service_providers_status_mvp ON bna_service_providers(status);
CREATE INDEX IF NOT EXISTS idx_bna_service_providers_featured_status ON bna_service_providers(is_featured, status);
CREATE INDEX IF NOT EXISTS idx_bna_service_providers_languages_gin ON bna_service_providers USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_bna_provider_categories_slug ON bna_provider_categories(slug);
CREATE INDEX IF NOT EXISTS idx_bna_provider_categories_active ON bna_provider_categories(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_provider_category_map_provider ON bna_provider_category_map(provider_id);
CREATE INDEX IF NOT EXISTS idx_bna_provider_category_map_category ON bna_provider_category_map(category_id);
CREATE INDEX IF NOT EXISTS idx_bna_provider_images_provider ON bna_provider_images(provider_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_provider_offerings_provider ON bna_provider_offerings(provider_id, status, sort_order);
CREATE INDEX IF NOT EXISTS idx_bna_provider_offerings_category ON bna_provider_offerings(category_id);
CREATE INDEX IF NOT EXISTS idx_bna_provider_leads_provider_status ON bna_provider_leads(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_bna_provider_leads_created_at ON bna_provider_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_provider_upgrade_events_provider ON bna_provider_upgrade_events(provider_id, created_at DESC);
