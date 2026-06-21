ALTER TABLE bna_product_tiers DROP CONSTRAINT IF EXISTS bna_product_tiers_tier_key_check;
ALTER TABLE bna_product_tiers
  ADD CONSTRAINT bna_product_tiers_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));

ALTER TABLE bna_checkout_records DROP CONSTRAINT IF EXISTS bna_checkout_records_tier_key_check;
ALTER TABLE bna_checkout_records
  ADD CONSTRAINT bna_checkout_records_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));

ALTER TABLE bna_access_grants DROP CONSTRAINT IF EXISTS bna_access_grants_tier_key_check;
ALTER TABLE bna_access_grants
  ADD CONSTRAINT bna_access_grants_tier_key_check
  CHECK (tier_key IN ('library_only', 'live_library', 'library_live_low_touch', 'interactive_zoom', 'vip_high_touch'));

CREATE TABLE IF NOT EXISTS bna_product_programs (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL UNIQUE,
  content_alias TEXT NOT NULL DEFAULT 'mishna',
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_product_programs DROP CONSTRAINT IF EXISTS bna_product_programs_status_check;
ALTER TABLE bna_product_programs
  ADD CONSTRAINT bna_product_programs_status_check
  CHECK (status IN ('draft', 'review', 'active', 'paused', 'archived'));
CREATE INDEX IF NOT EXISTS idx_bna_product_programs_project
  ON bna_product_programs (project_id, status);

CREATE TABLE IF NOT EXISTS bna_product_funnels (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE CASCADE,
  program_key TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'worldwide',
  audience TEXT NOT NULL DEFAULT 'parents',
  route_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  noindex BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_product_funnels DROP CONSTRAINT IF EXISTS bna_product_funnels_region_check;
ALTER TABLE bna_product_funnels
  ADD CONSTRAINT bna_product_funnels_region_check
  CHECK (region IN ('us', 'uk', 'israel', 'worldwide'));
ALTER TABLE bna_product_funnels DROP CONSTRAINT IF EXISTS bna_product_funnels_audience_check;
ALTER TABLE bna_product_funnels
  ADD CONSTRAINT bna_product_funnels_audience_check
  CHECK (audience IN ('parents', 'students', 'members', 'public', 'admin'));
ALTER TABLE bna_product_funnels DROP CONSTRAINT IF EXISTS bna_product_funnels_status_check;
ALTER TABLE bna_product_funnels
  ADD CONSTRAINT bna_product_funnels_status_check
  CHECK (status IN ('draft', 'review', 'published', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_product_funnels_program_route
  ON bna_product_funnels (program_key, route_path);
CREATE INDEX IF NOT EXISTS idx_bna_product_funnels_project_region
  ON bna_product_funnels (project_id, region, status);

CREATE TABLE IF NOT EXISTS bna_product_decisions (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE CASCADE,
  program_key TEXT NOT NULL,
  decision_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'decision_pending',
  title TEXT NOT NULL,
  question TEXT,
  context TEXT,
  candidate_json JSONB DEFAULT '{}'::jsonb,
  needed_from TEXT DEFAULT 'Shloimie',
  public_output_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_product_decisions DROP CONSTRAINT IF EXISTS bna_product_decisions_status_check;
ALTER TABLE bna_product_decisions
  ADD CONSTRAINT bna_product_decisions_status_check
  CHECK (status IN ('decision_pending', 'approved', 'rejected', 'blocked'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_product_decisions_program_key
  ON bna_product_decisions (program_key, decision_key);
CREATE INDEX IF NOT EXISTS idx_bna_product_decisions_project_status
  ON bna_product_decisions (project_id, status);

CREATE TABLE IF NOT EXISTS bna_product_leads (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  product_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  region TEXT NOT NULL DEFAULT 'worldwide',
  audience TEXT NOT NULL DEFAULT 'parents',
  interested_tiers TEXT[] NOT NULL DEFAULT '{}',
  parent_name TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT,
  parent_whatsapp TEXT,
  student_name TEXT,
  student_age TEXT,
  student_grade TEXT,
  timezone TEXT,
  preferred_class_format TEXT,
  source_landing_page TEXT,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  no_send BOOLEAN NOT NULL DEFAULT TRUE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_product_leads DROP CONSTRAINT IF EXISTS bna_product_leads_region_check;
ALTER TABLE bna_product_leads
  ADD CONSTRAINT bna_product_leads_region_check
  CHECK (region IN ('us', 'uk', 'israel', 'worldwide'));
ALTER TABLE bna_product_leads DROP CONSTRAINT IF EXISTS bna_product_leads_audience_check;
ALTER TABLE bna_product_leads
  ADD CONSTRAINT bna_product_leads_audience_check
  CHECK (audience IN ('parents', 'students', 'members', 'public', 'admin'));
ALTER TABLE bna_product_leads DROP CONSTRAINT IF EXISTS bna_product_leads_status_check;
ALTER TABLE bna_product_leads
  ADD CONSTRAINT bna_product_leads_status_check
  CHECK (status IN ('new', 'reviewing', 'follow_up', 'converted', 'archived'));
CREATE INDEX IF NOT EXISTS idx_bna_product_leads_project_status
  ON bna_product_leads (project_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_product_leads_program_region
  ON bna_product_leads (program_key, region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_product_leads_email
  ON bna_product_leads (lower(parent_email))
  WHERE parent_email IS NOT NULL;

CREATE TABLE IF NOT EXISTS bna_program_schedules (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE CASCADE,
  program_key TEXT NOT NULL,
  schedule_key TEXT NOT NULL,
  title TEXT NOT NULL,
  class_type TEXT NOT NULL DEFAULT 'live_class',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  start_time_local TIME NOT NULL DEFAULT '19:00',
  days_of_week TEXT[] NOT NULL DEFAULT '{}',
  tier_eligibility TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'admin_only',
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_program_schedules DROP CONSTRAINT IF EXISTS bna_program_schedules_visibility_check;
ALTER TABLE bna_program_schedules
  ADD CONSTRAINT bna_program_schedules_visibility_check
  CHECK (visibility IN ('admin_only', 'parent_visible', 'student_visible', 'public'));
ALTER TABLE bna_program_schedules DROP CONSTRAINT IF EXISTS bna_program_schedules_status_check;
ALTER TABLE bna_program_schedules
  ADD CONSTRAINT bna_program_schedules_status_check
  CHECK (status IN ('draft', 'planned', 'active', 'paused', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_program_schedules_program_key
  ON bna_program_schedules (program_key, schedule_key);
CREATE INDEX IF NOT EXISTS idx_bna_program_schedules_project_status
  ON bna_program_schedules (project_id, status);

CREATE TABLE IF NOT EXISTS bna_program_calendar_events (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT REFERENCES bna_program_schedules(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL,
  title TEXT NOT NULL,
  masechta TEXT,
  perek TEXT,
  mishnah_range TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  class_type TEXT NOT NULL DEFAULT 'live_class',
  tier_eligibility TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'admin_only',
  event_status TEXT NOT NULL DEFAULT 'draft',
  zoom_url TEXT,
  replay_url TEXT,
  source_sheet_status TEXT NOT NULL DEFAULT 'not_started',
  worksheet_status TEXT NOT NULL DEFAULT 'not_started',
  slides_status TEXT NOT NULL DEFAULT 'not_started',
  question_deadline_at TIMESTAMPTZ,
  worksheet_deadline_at TIMESTAMPTZ,
  notes TEXT,
  content_job_id INTEGER,
  transcript_content_job_id INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_program_calendar_events DROP CONSTRAINT IF EXISTS bna_program_calendar_events_visibility_check;
ALTER TABLE bna_program_calendar_events
  ADD CONSTRAINT bna_program_calendar_events_visibility_check
  CHECK (visibility IN ('admin_only', 'parent_visible', 'student_visible', 'public'));
ALTER TABLE bna_program_calendar_events DROP CONSTRAINT IF EXISTS bna_program_calendar_events_status_check;
ALTER TABLE bna_program_calendar_events
  ADD CONSTRAINT bna_program_calendar_events_status_check
  CHECK (event_status IN ('draft', 'planned', 'completed', 'canceled'));
ALTER TABLE bna_program_calendar_events DROP CONSTRAINT IF EXISTS bna_program_calendar_events_source_status_check;
ALTER TABLE bna_program_calendar_events
  ADD CONSTRAINT bna_program_calendar_events_source_status_check
  CHECK (source_sheet_status IN ('not_started', 'drafting', 'needs_review', 'approved', 'published'));
ALTER TABLE bna_program_calendar_events DROP CONSTRAINT IF EXISTS bna_program_calendar_events_worksheet_status_check;
ALTER TABLE bna_program_calendar_events
  ADD CONSTRAINT bna_program_calendar_events_worksheet_status_check
  CHECK (worksheet_status IN ('not_started', 'drafting', 'needs_review', 'approved', 'published'));
ALTER TABLE bna_program_calendar_events DROP CONSTRAINT IF EXISTS bna_program_calendar_events_slides_status_check;
ALTER TABLE bna_program_calendar_events
  ADD CONSTRAINT bna_program_calendar_events_slides_status_check
  CHECK (slides_status IN ('not_started', 'drafting', 'needs_review', 'approved', 'published'));
CREATE INDEX IF NOT EXISTS idx_bna_program_calendar_events_program_start
  ON bna_program_calendar_events (program_key, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_program_calendar_events_project_visibility
  ON bna_program_calendar_events (project_id, visibility, start_at DESC);

CREATE TABLE IF NOT EXISTS bna_source_prep_jobs (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  calendar_event_id BIGINT REFERENCES bna_program_calendar_events(id) ON DELETE SET NULL,
  class_session_id INTEGER,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  natural_language_prompt TEXT,
  requested_refs TEXT[] NOT NULL DEFAULT '{}',
  source_lookup_status TEXT NOT NULL DEFAULT 'not_started',
  worksheet_status TEXT NOT NULL DEFAULT 'not_started',
  slides_status TEXT NOT NULL DEFAULT 'not_started',
  approval_status TEXT NOT NULL DEFAULT 'needs_review',
  visibility TEXT NOT NULL DEFAULT 'admin_only',
  source_sheet_draft JSONB DEFAULT '{}'::jsonb,
  worksheet_draft JSONB DEFAULT '{}'::jsonb,
  slides_outline JSONB DEFAULT '{}'::jsonb,
  generated_artifacts JSONB DEFAULT '{}'::jsonb,
  blockers JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_source_prep_jobs DROP CONSTRAINT IF EXISTS bna_source_prep_jobs_visibility_check;
ALTER TABLE bna_source_prep_jobs
  ADD CONSTRAINT bna_source_prep_jobs_visibility_check
  CHECK (visibility IN ('admin_only', 'parent_visible', 'student_visible', 'public'));
ALTER TABLE bna_source_prep_jobs DROP CONSTRAINT IF EXISTS bna_source_prep_jobs_approval_check;
ALTER TABLE bna_source_prep_jobs
  ADD CONSTRAINT bna_source_prep_jobs_approval_check
  CHECK (approval_status IN ('needs_review', 'approved', 'rejected', 'published'));
CREATE INDEX IF NOT EXISTS idx_bna_source_prep_jobs_program_created
  ON bna_source_prep_jobs (program_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_source_prep_jobs_event
  ON bna_source_prep_jobs (calendar_event_id, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_product_offers (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  offer_key TEXT NOT NULL,
  title TEXT NOT NULL,
  billing_model TEXT NOT NULL DEFAULT 'recurring_monthly',
  price_amount_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_status TEXT NOT NULL DEFAULT 'decision_pending',
  duration_weeks INTEGER,
  upfront_payment_supported BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_installments_supported BOOLEAN NOT NULL DEFAULT FALSE,
  access_entitlements TEXT[] NOT NULL DEFAULT '{}',
  checkout_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  payment_links_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  access_automation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_product_offers DROP CONSTRAINT IF EXISTS bna_one_time_product_offers_key_check;
ALTER TABLE bna_one_time_product_offers
  ADD CONSTRAINT bna_one_time_product_offers_key_check
  CHECK (offer_key IN ('membership_67_monthly', 'premium_masechta_intensive'));
ALTER TABLE bna_one_time_product_offers DROP CONSTRAINT IF EXISTS bna_one_time_product_offers_billing_check;
ALTER TABLE bna_one_time_product_offers
  ADD CONSTRAINT bna_one_time_product_offers_billing_check
  CHECK (billing_model IN ('recurring_monthly', 'fixed_duration', 'upfront', 'weekly_installments'));
ALTER TABLE bna_one_time_product_offers DROP CONSTRAINT IF EXISTS bna_one_time_product_offers_status_check;
ALTER TABLE bna_one_time_product_offers
  ADD CONSTRAINT bna_one_time_product_offers_status_check
  CHECK (status IN ('draft', 'review', 'active', 'paused', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_one_time_product_offers_program_key
  ON bna_one_time_product_offers (program_key, offer_key);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_product_offers_project_status
  ON bna_one_time_product_offers (project_id, status);

CREATE TABLE IF NOT EXISTS bna_one_time_availability_rules (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  rule_key TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'recurring',
  title TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
  days_of_week TEXT[] NOT NULL DEFAULT '{}',
  start_time_local TIME,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  capacity_min INTEGER,
  capacity_max INTEGER,
  masechta TEXT,
  window_start DATE,
  window_end DATE,
  prep_block_minutes INTEGER NOT NULL DEFAULT 0,
  follow_up_block_minutes INTEGER NOT NULL DEFAULT 0,
  cancellation_policy TEXT DEFAULT 'operator_decision_required',
  reschedule_policy TEXT DEFAULT 'operator_decision_required',
  makeup_policy TEXT DEFAULT 'operator_decision_required',
  status TEXT NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_availability_rules DROP CONSTRAINT IF EXISTS bna_one_time_availability_rules_type_check;
ALTER TABLE bna_one_time_availability_rules
  ADD CONSTRAINT bna_one_time_availability_rules_type_check
  CHECK (rule_type IN ('recurring', 'exception', 'blackout', 'masechta_window', 'preparation_block', 'follow_up_block'));
ALTER TABLE bna_one_time_availability_rules DROP CONSTRAINT IF EXISTS bna_one_time_availability_rules_status_check;
ALTER TABLE bna_one_time_availability_rules
  ADD CONSTRAINT bna_one_time_availability_rules_status_check
  CHECK (status IN ('draft', 'planned', 'active', 'paused', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_one_time_availability_program_rule
  ON bna_one_time_availability_rules (program_key, rule_key);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_availability_project_type
  ON bna_one_time_availability_rules (project_id, rule_type, status);

CREATE TABLE IF NOT EXISTS bna_one_time_appointment_intents (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  appointment_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'intent',
  parent_name TEXT,
  parent_email TEXT,
  student_name TEXT,
  starts_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 10,
  booking_window_days INTEGER NOT NULL DEFAULT 30,
  cancellation_cutoff_hours INTEGER NOT NULL DEFAULT 24,
  entitlement_required BOOLEAN NOT NULL DEFAULT FALSE,
  payment_required BOOLEAN NOT NULL DEFAULT FALSE,
  parent_confirmation_required BOOLEAN NOT NULL DEFAULT TRUE,
  reminders_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  zoom_meeting_created BOOLEAN NOT NULL DEFAULT FALSE,
  external_calendar_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  private_notes TEXT,
  parent_visible_summary TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by TEXT DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_appointment_intents DROP CONSTRAINT IF EXISTS bna_one_time_appointment_type_check;
ALTER TABLE bna_one_time_appointment_intents
  ADD CONSTRAINT bna_one_time_appointment_type_check
  CHECK (appointment_type IN ('consultation', 'placement_call', 'parent_progress_call', 'student_progress_call', 'office_hours'));
ALTER TABLE bna_one_time_appointment_intents DROP CONSTRAINT IF EXISTS bna_one_time_appointment_status_check;
ALTER TABLE bna_one_time_appointment_intents
  ADD CONSTRAINT bna_one_time_appointment_status_check
  CHECK (status IN ('intent', 'pending_parent_confirmation', 'confirmed_internal', 'reschedule_requested', 'cancelled', 'no_show', 'completed'));
CREATE INDEX IF NOT EXISTS idx_bna_one_time_appointment_project_status
  ON bna_one_time_appointment_intents (project_id, status, starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_appointment_program_type
  ON bna_one_time_appointment_intents (program_key, appointment_type, created_at DESC);

WITH project AS (
  SELECT id FROM bna_projects WHERE project_key = 'one_time_mishnah_class' LIMIT 1
)
INSERT INTO bna_product_programs (
  project_id, program_key, content_alias, name, short_name, description, status, metadata, updated_at
)
SELECT id, 'one_time_mishnah_class', 'mishna', 'OneTime Mishnayos', 'OneTime', 'Rabbi Scheller Mishnayos class product system.', 'draft',
       '{"seeded_by":"one_time_product_system_migration","no_final_pricing":true,"checkout_enabled":false,"external_write_performed":false}'::jsonb,
       NOW()
FROM project
ON CONFLICT (program_key)
DO UPDATE SET
  project_id = COALESCE(bna_product_programs.project_id, EXCLUDED.project_id),
  content_alias = EXCLUDED.content_alias,
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = COALESCE(bna_product_programs.description, EXCLUDED.description),
  metadata = COALESCE(bna_product_programs.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
), offers AS (
  SELECT * FROM (VALUES
    (
      'membership_67_monthly',
      '$67 monthly membership',
      'recurring_monthly',
      6700::integer,
      'USD',
      'candidate_pending_approval',
      NULL::integer,
      FALSE,
      FALSE,
      ARRAY['library_live_low_touch']::text[],
      'draft',
      '{"no_live_billing_write":true,"checkout_enabled":false,"payment_links_enabled":false,"access_automation_enabled":false,"requires_operator_decision":true,"access_policy":{"failed_payment_state":"failed_payment","grace_period_state":"grace_period","cancellation_state":"cancellation_requested","refund_state":"refund_pending","completion_state":"completed","expiration_state":"expired"}}'::jsonb
    ),
    (
      'premium_masechta_intensive',
      'Premium Masechta intensive',
      'fixed_duration',
      NULL::integer,
      'USD',
      'decision_pending',
      NULL::integer,
      TRUE,
      TRUE,
      ARRAY['interactive_zoom','vip_high_touch']::text[],
      'draft',
      '{"no_live_billing_write":true,"checkout_enabled":false,"payment_links_enabled":false,"access_automation_enabled":false,"requires_operator_decision":true,"supports_upfront_payment":true,"supports_weekly_installments":true,"final_pricing_not_guessed":true}'::jsonb
    )
  ) AS o(offer_key, title, billing_model, price_amount_cents, currency, price_status, duration_weeks, upfront_payment_supported, weekly_installments_supported, access_entitlements, status, metadata)
)
INSERT INTO bna_one_time_product_offers (
  project_id, program_id, program_key, offer_key, title, billing_model,
  price_amount_cents, currency, price_status, duration_weeks,
  upfront_payment_supported, weekly_installments_supported, access_entitlements,
  checkout_enabled, payment_links_enabled, access_automation_enabled,
  status, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       offers.offer_key, offers.title, offers.billing_model,
       offers.price_amount_cents, offers.currency, offers.price_status, offers.duration_weeks,
       offers.upfront_payment_supported, offers.weekly_installments_supported, offers.access_entitlements,
       FALSE, FALSE, FALSE,
       offers.status, offers.metadata, NOW()
FROM program
CROSS JOIN offers
ON CONFLICT (program_key, offer_key)
DO UPDATE SET
  title = EXCLUDED.title,
  billing_model = EXCLUDED.billing_model,
  price_amount_cents = EXCLUDED.price_amount_cents,
  currency = EXCLUDED.currency,
  price_status = EXCLUDED.price_status,
  upfront_payment_supported = EXCLUDED.upfront_payment_supported,
  weekly_installments_supported = EXCLUDED.weekly_installments_supported,
  access_entitlements = EXCLUDED.access_entitlements,
  checkout_enabled = FALSE,
  payment_links_enabled = FALSE,
  access_automation_enabled = FALSE,
  metadata = COALESCE(bna_one_time_product_offers.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
), rules AS (
  SELECT * FROM (VALUES
    (
      'israel_7pm_recurring',
      'recurring',
      'Rabbi Ellie Scheller 7:00 PM Israel class window',
      'Asia/Jerusalem',
      ARRAY['review_needed']::text[],
      TIME '19:00',
      60::integer,
      NULL::integer,
      NULL::integer,
      NULL::text,
      NULL::date,
      NULL::date,
      30::integer,
      15::integer,
      'operator_decision_required',
      'operator_decision_required',
      'operator_decision_required',
      'draft',
      '{"external_calendar_write_enabled":false,"zoom_meeting_write_enabled":false,"minimum_enrollment_pending":true,"maximum_enrollment_pending":true}'::jsonb
    ),
    (
      'premium_masechta_window_placeholder',
      'masechta_window',
      'Premium Masechta intensive window',
      'Asia/Jerusalem',
      ARRAY['operator_decision_required']::text[],
      TIME '19:00',
      60::integer,
      NULL::integer,
      NULL::integer,
      NULL::text,
      NULL::date,
      NULL::date,
      30::integer,
      15::integer,
      'operator_decision_required',
      'operator_decision_required',
      'operator_decision_required',
      'draft',
      '{"external_calendar_write_enabled":false,"zoom_meeting_write_enabled":false,"masechta_dates_pending":true}'::jsonb
    )
  ) AS r(rule_key, rule_type, title, timezone, days_of_week, start_time_local, duration_minutes, capacity_min, capacity_max, masechta, window_start, window_end, prep_block_minutes, follow_up_block_minutes, cancellation_policy, reschedule_policy, makeup_policy, status, metadata)
)
INSERT INTO bna_one_time_availability_rules (
  project_id, program_id, program_key, rule_key, rule_type, title, timezone,
  days_of_week, start_time_local, duration_minutes, capacity_min, capacity_max,
  masechta, window_start, window_end, prep_block_minutes, follow_up_block_minutes,
  cancellation_policy, reschedule_policy, makeup_policy, status, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       rules.rule_key, rules.rule_type, rules.title, rules.timezone,
       rules.days_of_week, rules.start_time_local, rules.duration_minutes, rules.capacity_min, rules.capacity_max,
       rules.masechta, rules.window_start, rules.window_end, rules.prep_block_minutes, rules.follow_up_block_minutes,
       rules.cancellation_policy, rules.reschedule_policy, rules.makeup_policy, rules.status, rules.metadata, NOW()
FROM program
CROSS JOIN rules
ON CONFLICT (program_key, rule_key)
DO UPDATE SET
  rule_type = EXCLUDED.rule_type,
  title = EXCLUDED.title,
  timezone = EXCLUDED.timezone,
  days_of_week = EXCLUDED.days_of_week,
  start_time_local = EXCLUDED.start_time_local,
  duration_minutes = EXCLUDED.duration_minutes,
  prep_block_minutes = EXCLUDED.prep_block_minutes,
  follow_up_block_minutes = EXCLUDED.follow_up_block_minutes,
  cancellation_policy = EXCLUDED.cancellation_policy,
  reschedule_policy = EXCLUDED.reschedule_policy,
  makeup_policy = EXCLUDED.makeup_policy,
  metadata = COALESCE(bna_one_time_availability_rules.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
), funnels AS (
  SELECT * FROM (VALUES
    ('worldwide', '/one-time', 'Worldwide draft funnel', '{"timing_note":"Replay-first framing with timezone review."}'::jsonb),
    ('us', '/one-time/us', 'US draft funnel', '{"timing_note":"Replay/library first; live participation needs timezone framing."}'::jsonb),
    ('uk', '/one-time/uk', 'UK draft funnel', '{"timing_note":"7pm Israel is likely usable for UK families."}'::jsonb),
    ('israel', '/one-time/israel', 'Israel draft funnel', '{"timing_note":"7pm Israel can be a direct live-class option."}'::jsonb)
  ) AS f(region, route_path, title, metadata)
)
INSERT INTO bna_product_funnels (
  project_id, program_id, program_key, region, audience, route_path, status, noindex, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       funnels.region, 'parents', funnels.route_path, 'draft', TRUE,
       funnels.metadata || jsonb_build_object('title', funnels.title, 'checkout_enabled', false),
       NOW()
FROM program
CROSS JOIN funnels
ON CONFLICT (program_key, route_path)
DO UPDATE SET
  region = EXCLUDED.region,
  noindex = TRUE,
  metadata = COALESCE(bna_product_funnels.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
), decisions AS (
  SELECT * FROM (VALUES
    ('tier_pricing', 'Approve OneTime tier pricing', 'Which launch prices should be public?', '{"low_touch":[50,67,100,149],"low_touch_preferred":50,"interactive":[149,150],"vip":["300+"]}'::jsonb),
    ('billing_readiness', 'Approve checkout and billing readiness', 'When can checkout be shown publicly?', '{"requires":["provider readiness","refund/legal copy","test checkout proof","operator approval"]}'::jsonb),
    ('schedule_visibility', 'Approve 7pm Israel schedule visibility', 'Should the 7pm Israel class be public, member-visible, or admin-only at launch?', '{"default":"admin_only","candidate_time":"19:00","timezone":"Asia/Jerusalem"}'::jsonb),
    ('public_claims', 'Approve public claims and social proof', 'Which claims and testimonials are verified for the draft funnels?', '{"no_biggest_claim":true,"social_proof_pending":true}'::jsonb),
    ('meeting_source_ingest', 'Ingest June 15 OneTime meeting source', 'Where is the meeting transcript or source artifact for grounded launch decisions?', '{"blocker":"source_artifact_missing"}'::jsonb)
  ) AS d(decision_key, title, question, candidate_json)
)
INSERT INTO bna_product_decisions (
  project_id, program_id, program_key, decision_key, status, title, question,
  context, candidate_json, needed_from, public_output_allowed, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       decisions.decision_key, 'decision_pending', decisions.title, decisions.question,
       'RABBI-04 product launch review. Draft planning only.',
       decisions.candidate_json, 'Shloimie', FALSE,
       '{"seeded_by":"one_time_product_system_migration"}'::jsonb,
       NOW()
FROM program
CROSS JOIN decisions
ON CONFLICT (program_key, decision_key)
DO UPDATE SET
  title = EXCLUDED.title,
  question = EXCLUDED.question,
  context = EXCLUDED.context,
  candidate_json = EXCLUDED.candidate_json,
  public_output_allowed = FALSE,
  metadata = COALESCE(bna_product_decisions.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
)
INSERT INTO bna_program_schedules (
  project_id, program_id, program_key, schedule_key, title, class_type,
  timezone, start_time_local, days_of_week, tier_eligibility, visibility,
  status, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       'israel_7pm_live_class', 'Rabbi Scheller 7:00 PM Israel Mishnayos Class',
       'live_class', 'Asia/Jerusalem', TIME '19:00',
       ARRAY['review_needed']::text[],
       ARRAY['interactive_zoom','vip_high_touch','live_library']::text[],
       'admin_only', 'draft',
       '{"seeded_by":"one_time_product_system_migration","regional_notes":{"israel":"direct live option","uk":"likely usable","us":"replay-first framing"}}'::jsonb,
       NOW()
FROM program
ON CONFLICT (program_key, schedule_key)
DO UPDATE SET
  title = EXCLUDED.title,
  timezone = EXCLUDED.timezone,
  start_time_local = EXCLUDED.start_time_local,
  tier_eligibility = EXCLUDED.tier_eligibility,
  visibility = EXCLUDED.visibility,
  metadata = COALESCE(bna_program_schedules.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH schedule AS (
  SELECT s.id AS schedule_id, s.project_id, s.program_id
  FROM bna_program_schedules s
  WHERE s.program_key = 'one_time_mishnah_class'
    AND s.schedule_key = 'israel_7pm_live_class'
  LIMIT 1
)
INSERT INTO bna_program_calendar_events (
  schedule_id, project_id, program_id, program_key, title, start_at, end_at,
  timezone, class_type, tier_eligibility, visibility, event_status,
  source_sheet_status, worksheet_status, slides_status, question_deadline_at,
  worksheet_deadline_at, notes, metadata, updated_at
)
SELECT schedule.schedule_id, schedule.project_id, schedule.program_id,
       'one_time_mishnah_class',
       'Draft next Mishnayos class - topic pending',
       ((CURRENT_DATE + 7)::timestamp + TIME '19:00') AT TIME ZONE 'Asia/Jerusalem',
       ((CURRENT_DATE + 7)::timestamp + TIME '20:00') AT TIME ZONE 'Asia/Jerusalem',
       'Asia/Jerusalem', 'live_class',
       ARRAY['interactive_zoom','vip_high_touch','live_library']::text[],
       'admin_only', 'draft',
       'not_started', 'not_started', 'not_started',
       ((CURRENT_DATE + 7)::timestamp + TIME '12:00') AT TIME ZONE 'Asia/Jerusalem',
       ((CURRENT_DATE + 6)::timestamp + TIME '20:00') AT TIME ZONE 'Asia/Jerusalem',
       'Seeded draft only. Do not publish until schedule visibility and class topic are approved.',
       '{"seeded_by":"one_time_product_system_migration","public_publish_allowed":false}'::jsonb,
       NOW()
FROM schedule
WHERE NOT EXISTS (
  SELECT 1 FROM bna_program_calendar_events e
  WHERE e.program_key = 'one_time_mishnah_class'
    AND e.title = 'Draft next Mishnayos class - topic pending'
);
