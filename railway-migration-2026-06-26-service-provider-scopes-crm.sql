-- BNA Service Provider Scopes + CRM Additive Migration
-- Date: 2026-06-26
-- Purpose:
--   1. Record canonical account-scope entitlements.
--   2. Add provider contact inquiry inbox for free providers.
--   3. Add CRM contact UI preferences/segments without replacing existing first-party CRM tables.
--   4. Add workspace feature overrides for paid portals and scope flags.
--
-- Guardrails:
--   - No GHL/external CRM.
--   - No external sends.
--   - No payment/access grants.
--   - Safe to run multiple times.

CREATE TABLE IF NOT EXISTS bna_account_scope_entitlements (
  id BIGSERIAL PRIMARY KEY,
  tenant_type TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  entitlement_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'hidden',
  source TEXT NOT NULL DEFAULT '2026-06-26-service-provider-scopes',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_type, plan_key, entitlement_key)
);

CREATE INDEX IF NOT EXISTS idx_bna_account_scope_entitlements_plan
  ON bna_account_scope_entitlements (tenant_type, plan_key, enabled);

CREATE TABLE IF NOT EXISTS bna_workspace_feature_overrides (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL DEFAULT '',
  feature_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'manual',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  approval_phrase TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_key, project_key, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_bna_workspace_feature_overrides_workspace
  ON bna_workspace_feature_overrides (workspace_key, project_key, feature_key, enabled);

CREATE TABLE IF NOT EXISTS bna_provider_contact_inquiries (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT,
  provider_profile_id BIGINT,
  source TEXT NOT NULL DEFAULT 'public_listing',
  inquiry_status TEXT NOT NULL DEFAULT 'new',
  parent_display_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  student_display_name TEXT,
  student_age_range TEXT,
  subject TEXT,
  body TEXT,
  preferred_contact_method TEXT,
  source_url TEXT,
  linked_contact_id BIGINT,
  linked_parent_lead_id BIGINT,
  last_response_draft TEXT,
  last_response_drafted_by TEXT,
  last_response_drafted_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  internal_notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bna_provider_contact_inquiries_workspace
  ON bna_provider_contact_inquiries (workspace_key, project_key, inquiry_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bna_provider_contact_inquiries_provider
  ON bna_provider_contact_inquiries (provider_profile_id, inquiry_status, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_crm_contact_segments (
  id BIGSERIAL PRIMARY KEY,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL DEFAULT '',
  segment_key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  filter_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'workspace',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_key, project_key, segment_key)
);

CREATE TABLE IF NOT EXISTS bna_crm_contact_view_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_key TEXT NOT NULL,
  workspace_key TEXT NOT NULL,
  project_key TEXT NOT NULL DEFAULT '',
  view_key TEXT NOT NULL DEFAULT 'default',
  filter_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_key TEXT NOT NULL DEFAULT 'last_contact_desc',
  layout_key TEXT NOT NULL DEFAULT 'cards',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_key, workspace_key, project_key, view_key)
);

-- Idempotent entitlement rows.
-- visibility:
--   visible = show active control
--   upgrade = show paywall/upgrade CTA
--   hidden = do not show
--   disabled = show disabled readiness/explanation

INSERT INTO bna_account_scope_entitlements (tenant_type, plan_key, entitlement_key, enabled, visibility, notes)
VALUES
  ('service_provider', 'free_provider', 'public_profile', true, 'visible', 'Free listing profile'),
  ('service_provider', 'free_provider', 'provider_index', true, 'visible', 'Public provider index visibility'),
  ('service_provider', 'free_provider', 'listing_comments', true, 'visible', 'Can respond to listing comments/inquiries'),
  ('service_provider', 'free_provider', 'provider_contact_inbox', true, 'visible', 'Limited inquiry inbox, not full CRM'),
  ('service_provider', 'free_provider', 'provider_calendar', true, 'visible', 'Provider-owned calendar'),
  ('service_provider', 'free_provider', 'account_setup_bot', true, 'visible', 'Helper may guide setup'),
  ('service_provider', 'free_provider', 'parent_contact_reply_bot', true, 'visible', 'Helper may draft inquiry replies only'),
  ('service_provider', 'free_provider', 'limited_analytics', true, 'visible', 'Basic listing analytics'),
  ('service_provider', 'free_provider', 'support_tickets', true, 'visible', 'Can create/read own support tickets'),
  ('service_provider', 'free_provider', 'crm_contacts', false, 'upgrade', 'Full CRM requires Provider Plus'),
  ('service_provider', 'free_provider', 'crm_filters', false, 'upgrade', 'Full CRM filters require Provider Plus'),
  ('service_provider', 'free_provider', 'crm_pipeline', false, 'upgrade', 'Pipeline requires Provider Plus'),
  ('service_provider', 'free_provider', 'parent_portal', false, 'upgrade', 'Provider parent portal is paid'),
  ('service_provider', 'free_provider', 'student_portal', false, 'upgrade', 'Provider student portal is paid'),
  ('service_provider', 'free_provider', 'content_workflow', false, 'upgrade', 'Content workflow requires Provider Plus'),
  ('service_provider', 'free_provider', 'social_drafts', false, 'upgrade', 'Social drafts require Provider Plus'),
  ('service_provider', 'free_provider', 'whatsapp_automation', false, 'upgrade', 'WhatsApp automation requires approval-gated Plus'),
  ('service_provider', 'free_provider', 'codex_cli_routing', false, 'hidden', 'Removed from all assistants'),

  ('service_provider', 'service_provider_plus', 'public_profile', true, 'visible', 'Provider Plus'),
  ('service_provider', 'service_provider_plus', 'provider_index', true, 'visible', 'Provider Plus'),
  ('service_provider', 'service_provider_plus', 'provider_contact_inbox', true, 'visible', 'Provider Plus'),
  ('service_provider', 'service_provider_plus', 'provider_calendar', true, 'visible', 'Provider Plus'),
  ('service_provider', 'service_provider_plus', 'crm_contacts', true, 'visible', 'Full scoped CRM'),
  ('service_provider', 'service_provider_plus', 'crm_filters', true, 'visible', 'Full scoped CRM filters'),
  ('service_provider', 'service_provider_plus', 'crm_pipeline', true, 'visible', 'Scoped pipeline'),
  ('service_provider', 'service_provider_plus', 'parent_portal', true, 'visible', 'Paid provider portal'),
  ('service_provider', 'service_provider_plus', 'student_portal', true, 'visible', 'Paid provider portal'),
  ('service_provider', 'service_provider_plus', 'content_workflow', true, 'visible', 'Provider content workflow'),
  ('service_provider', 'service_provider_plus', 'social_drafts', true, 'visible', 'Draft/readiness only unless approved'),
  ('service_provider', 'service_provider_plus', 'whatsapp_readback', true, 'visible', 'Local readback'),
  ('service_provider', 'service_provider_plus', 'whatsapp_automation', false, 'disabled', 'External send requires separate approval'),
  ('service_provider', 'service_provider_plus', 'automations', true, 'visible', 'Local previews/metadata'),
  ('service_provider', 'service_provider_plus', 'integrations_readiness', true, 'visible', 'Readiness/checklist'),
  ('service_provider', 'service_provider_plus', 'reporting', true, 'visible', 'Workspace reporting'),
  ('service_provider', 'service_provider_plus', 'codex_cli_routing', false, 'hidden', 'Removed from all assistants'),

  ('service_provider', 'rabbi_scheller_partner', 'crm_contacts', true, 'visible', 'One Time partner CRM'),
  ('service_provider', 'rabbi_scheller_partner', 'crm_filters', true, 'visible', 'One Time partner CRM'),
  ('service_provider', 'rabbi_scheller_partner', 'crm_pipeline', true, 'visible', 'One Time partner CRM'),
  ('service_provider', 'rabbi_scheller_partner', 'content_workflow', true, 'visible', 'One Time content workflow'),
  ('service_provider', 'rabbi_scheller_partner', 'social_drafts', true, 'visible', 'One Time social drafts'),
  ('service_provider', 'rabbi_scheller_partner', 'parent_portal', true, 'visible', 'One Time paid/member parent view when configured'),
  ('service_provider', 'rabbi_scheller_partner', 'student_portal', true, 'visible', 'One Time student/member view when configured'),
  ('service_provider', 'rabbi_scheller_partner', 'custom_partnership_terms', true, 'visible', 'Revenue-share/custom partner'),
  ('service_provider', 'rabbi_scheller_partner', 'codex_cli_routing', false, 'hidden', 'Removed from all assistants'),

  ('school', 'school', 'crm_contacts', true, 'visible', 'School CRM'),
  ('school', 'school', 'crm_filters', true, 'visible', 'School CRM filters'),
  ('school', 'school', 'parent_portal', true, 'visible', 'School parent portal'),
  ('school', 'school', 'student_portal', true, 'visible', 'School student portal'),
  ('school', 'school', 'school_youtube_assignments', true, 'visible', 'School-only YouTube assignment scheduling'),
  ('school', 'school', 'provider_calendar', true, 'visible', 'School calendar equivalent'),
  ('school', 'school', 'codex_cli_routing', false, 'hidden', 'Removed from all assistants'),

  ('family', 'family', 'parent_portal', true, 'visible', 'Family parent portal'),
  ('family', 'family', 'student_portal', true, 'visible', 'Family student portal'),
  ('family', 'family', 'crm_contacts', false, 'hidden', 'Families do not access CRM'),
  ('family', 'family', 'codex_cli_routing', false, 'hidden', 'Removed from all assistants')
ON CONFLICT (tenant_type, plan_key, entitlement_key)
DO UPDATE SET
  enabled = EXCLUDED.enabled,
  visibility = EXCLUDED.visibility,
  notes = EXCLUDED.notes,
  updated_at = now();

-- Rabbi workspace explicit feature aliases.
INSERT INTO bna_workspace_feature_overrides (workspace_key, project_key, feature_key, enabled, source, notes)
VALUES
  ('rabbi_sheller_provider', 'one_time_mishnah_class', 'service_provider_plus', true, '2026-06-26-service-provider-scopes', 'Rabbi Scheller is Provider Plus / partner scoped to One Time'),
  ('rabbi_sheller_provider', 'one_time_mishnah_class', 'custom_partnership_terms', true, '2026-06-26-service-provider-scopes', 'Revenue-share/custom partner controls'),
  ('rabbi_sheller_provider', 'one_time_mishnah_class', 'codex_cli_routing', false, '2026-06-26-service-provider-scopes', 'No portal assistant Codex CLI routing')
ON CONFLICT (workspace_key, project_key, feature_key)
DO UPDATE SET
  enabled = EXCLUDED.enabled,
  notes = EXCLUDED.notes,
  updated_at = now();
