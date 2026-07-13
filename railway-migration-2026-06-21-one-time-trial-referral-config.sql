CREATE TABLE IF NOT EXISTS bna_one_time_promotion_policies (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  policy_key TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  public_copy_approved BOOLEAN NOT NULL DEFAULT FALSE,
  live_billing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_credit_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_promotion_policies DROP CONSTRAINT IF EXISTS bna_one_time_promotion_policies_type_check;
ALTER TABLE bna_one_time_promotion_policies
  ADD CONSTRAINT bna_one_time_promotion_policies_type_check
  CHECK (policy_type IN ('trial', 'promotional_access', 'referral', 'billing_notice', 'refund_review', 'cancellation_refund'));
ALTER TABLE bna_one_time_promotion_policies DROP CONSTRAINT IF EXISTS bna_one_time_promotion_policies_status_check;
ALTER TABLE bna_one_time_promotion_policies
  ADD CONSTRAINT bna_one_time_promotion_policies_status_check
  CHECK (status IN ('draft', 'needs_operator_decision', 'approved', 'archived'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_one_time_promotion_policy_version
  ON bna_one_time_promotion_policies (program_key, policy_key, policy_version);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_promotion_policies_project
  ON bna_one_time_promotion_policies (project_id, policy_type, status);

CREATE TABLE IF NOT EXISTS bna_one_time_policy_acceptances (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  policy_key TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  acceptance_key TEXT NOT NULL,
  contact_id BIGINT,
  member_id BIGINT,
  checkout_record_id BIGINT,
  accepted_by_name TEXT,
  accepted_by_email TEXT,
  accepted_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'test_local',
  test_mode BOOLEAN NOT NULL DEFAULT TRUE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_policy_acceptances ADD COLUMN IF NOT EXISTS member_id BIGINT;
ALTER TABLE bna_one_time_policy_acceptances ADD COLUMN IF NOT EXISTS checkout_record_id BIGINT;
ALTER TABLE bna_one_time_policy_acceptances ADD COLUMN IF NOT EXISTS test_mode BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bna_one_time_policy_acceptances ADD COLUMN IF NOT EXISTS external_write_performed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_policy_acceptances DROP CONSTRAINT IF EXISTS bna_one_time_policy_acceptances_policy_key_check;
ALTER TABLE bna_one_time_policy_acceptances
  ADD CONSTRAINT bna_one_time_policy_acceptances_policy_key_check
  CHECK (policy_key IN ('one_time_rosh_hashanah_promotional_access', 'one_time_warm_lead_intro_trial', 'one_time_referral_credit_after_first_paid_cycle', 'one_time_rosh_hashanah_pre_billing_notice', 'one_time_manual_exception_refund_review'));
ALTER TABLE bna_one_time_policy_acceptances DROP CONSTRAINT IF EXISTS bna_one_time_policy_acceptances_source_check;
ALTER TABLE bna_one_time_policy_acceptances
  ADD CONSTRAINT bna_one_time_policy_acceptances_source_check
  CHECK (source IN ('test_local', 'admin_preview', 'public_checkout_preview', 'manual'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_one_time_policy_acceptances_unique
  ON bna_one_time_policy_acceptances (program_key, policy_key, policy_version, acceptance_key);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_policy_acceptances_project
  ON bna_one_time_policy_acceptances (project_id, policy_key, accepted_at DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_referrals (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  referrer_member_id BIGINT,
  referred_contact_id BIGINT,
  referred_member_id BIGINT,
  referral_code TEXT NOT NULL,
  referral_link TEXT,
  status TEXT NOT NULL DEFAULT 'candidate',
  activation_status TEXT NOT NULL DEFAULT 'pending_first_paid_cycle',
  reward_status TEXT NOT NULL DEFAULT 'not_approved',
  reward_policy_version TEXT NOT NULL DEFAULT 'one-time-referral-credit-v1',
  first_paid_cycle_event_id TEXT,
  self_referral_flag BOOLEAN NOT NULL DEFAULT FALSE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS activation_status TEXT NOT NULL DEFAULT 'pending_first_paid_cycle';
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS reward_status TEXT NOT NULL DEFAULT 'not_approved';
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS reward_policy_version TEXT NOT NULL DEFAULT 'one-time-referral-credit-v1';
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS first_paid_cycle_event_id TEXT;
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS self_referral_flag BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referrals ADD COLUMN IF NOT EXISTS external_write_performed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referrals DROP CONSTRAINT IF EXISTS bna_one_time_referrals_status_check;
ALTER TABLE bna_one_time_referrals
  ADD CONSTRAINT bna_one_time_referrals_status_check
  CHECK (status IN ('candidate', 'lead_created', 'pending_first_paid_cycle', 'converted_pending_reward', 'reward_approved', 'reward_applied', 'suppressed', 'archived', 'reviewing', 'eligible', 'rejected'));
ALTER TABLE bna_one_time_referrals DROP CONSTRAINT IF EXISTS bna_one_time_referrals_activation_check;
ALTER TABLE bna_one_time_referrals
  ADD CONSTRAINT bna_one_time_referrals_activation_check
  CHECK (activation_status IN ('pending_first_paid_cycle', 'eligible_after_paid_cycle', 'blocked_failed_or_refunded_payment', 'activated', 'rejected'));
ALTER TABLE bna_one_time_referrals DROP CONSTRAINT IF EXISTS bna_one_time_referrals_reward_status_check;
ALTER TABLE bna_one_time_referrals
  ADD CONSTRAINT bna_one_time_referrals_reward_status_check
  CHECK (reward_status IN ('not_approved', 'manual_review', 'pending_manual_review', 'approved', 'approved_pending_credit', 'applied', 'credited_manual', 'rejected', 'reversed', 'void'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_bna_one_time_referrals_code
  ON bna_one_time_referrals (program_key, referral_code);
CREATE INDEX IF NOT EXISTS idx_bna_one_time_referrals_project_status
  ON bna_one_time_referrals (project_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_referral_credits (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  referral_id BIGINT REFERENCES bna_one_time_referrals(id) ON DELETE SET NULL,
  member_id BIGINT,
  amount_cents INTEGER NOT NULL DEFAULT 6700,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'manual_review_required',
  policy_version TEXT NOT NULL DEFAULT 'one-time-referral-credit-v1',
  provider TEXT,
  provider_credit_id TEXT,
  invoice_credit_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE,
  real_invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_referral_credits ADD COLUMN IF NOT EXISTS invoice_credit_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referral_credits ADD COLUMN IF NOT EXISTS invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referral_credits ADD COLUMN IF NOT EXISTS real_invoice_credit_created BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referral_credits ADD COLUMN IF NOT EXISTS external_write_performed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE bna_one_time_referral_credits DROP CONSTRAINT IF EXISTS bna_one_time_referral_credits_status_check;
ALTER TABLE bna_one_time_referral_credits
  ADD CONSTRAINT bna_one_time_referral_credits_status_check
  CHECK (status IN ('manual_review_required', 'pending_manual_review', 'approved', 'approved_pending_credit', 'applied', 'credited_manual', 'rejected', 'reversed', 'void'));
CREATE INDEX IF NOT EXISTS idx_bna_one_time_referral_credits_project_status
  ON bna_one_time_referral_credits (project_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_billing_notices (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  member_id BIGINT,
  policy_key TEXT NOT NULL DEFAULT 'one_time_rosh_hashanah_pre_billing_notice',
  policy_version TEXT NOT NULL DEFAULT 'one-time-rosh-hashanah-pre-billing-notice-v1',
  template_key TEXT NOT NULL DEFAULT 'one_time_pre_billing_notice_v1',
  notice_type TEXT NOT NULL DEFAULT 'pre_billing_notice',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  send_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  live_send_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  email_send_performed BOOLEAN NOT NULL DEFAULT FALSE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_billing_notices DROP CONSTRAINT IF EXISTS bna_one_time_billing_notices_status_check;
ALTER TABLE bna_one_time_billing_notices
  ADD CONSTRAINT bna_one_time_billing_notices_status_check
  CHECK (status IN ('draft', 'preview_ready', 'queued_approval_required', 'approved_not_sent', 'sent', 'suppressed', 'archived'));
ALTER TABLE bna_one_time_billing_notices DROP CONSTRAINT IF EXISTS bna_one_time_billing_notices_type_check;
ALTER TABLE bna_one_time_billing_notices
  ADD CONSTRAINT bna_one_time_billing_notices_type_check
  CHECK (notice_type IN ('pre_billing_notice', 'monthly_invoice_receipt', 'payment_failed_notice', 'cancellation_confirmation'));
CREATE INDEX IF NOT EXISTS idx_bna_one_time_billing_notices_project_status
  ON bna_one_time_billing_notices (project_id, status, scheduled_for DESC);

CREATE TABLE IF NOT EXISTS bna_one_time_refund_reviews (
  id BIGSERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES bna_projects(id) ON DELETE SET NULL,
  program_id BIGINT REFERENCES bna_product_programs(id) ON DELETE SET NULL,
  program_key TEXT NOT NULL DEFAULT 'one_time_mishnah_class',
  member_id BIGINT,
  stripe_customer_id TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_or_charge_id TEXT,
  stripe_refund_id TEXT,
  refund_reason TEXT NOT NULL DEFAULT 'operator_approved_exception',
  status TEXT NOT NULL DEFAULT 'manual_review_required',
  requested_by TEXT,
  reviewed_by TEXT,
  approval_recorded_at TIMESTAMPTZ,
  access_decision TEXT NOT NULL DEFAULT 'manual_review_required',
  test_mode BOOLEAN NOT NULL DEFAULT TRUE,
  refund_execution_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_refund_created BOOLEAN NOT NULL DEFAULT FALSE,
  automatic_refund BOOLEAN NOT NULL DEFAULT FALSE,
  prorated_refund BOOLEAN NOT NULL DEFAULT FALSE,
  external_write_performed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE bna_one_time_refund_reviews DROP CONSTRAINT IF EXISTS bna_one_time_refund_reviews_status_check;
ALTER TABLE bna_one_time_refund_reviews
  ADD CONSTRAINT bna_one_time_refund_reviews_status_check
  CHECK (status IN ('manual_review_required', 'pending_approval', 'approved_not_executed', 'executed', 'rejected', 'void'));
ALTER TABLE bna_one_time_refund_reviews DROP CONSTRAINT IF EXISTS bna_one_time_refund_reviews_reason_check;
ALTER TABLE bna_one_time_refund_reviews
  ADD CONSTRAINT bna_one_time_refund_reviews_reason_check
  CHECK (refund_reason IN ('duplicate_charge', 'incorrect_charge', 'provider_cancelled_without_makeup_or_credit', 'legally_required', 'operator_approved_exception'));
CREATE INDEX IF NOT EXISTS idx_bna_one_time_refund_reviews_project_status
  ON bna_one_time_refund_reviews (project_id, status, created_at DESC);

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
), policies AS (
  SELECT * FROM (VALUES
    (
      'one_time_rosh_hashanah_promotional_access',
      'one-time-rosh-hashanah-promotional-access-v1',
      'promotional_access',
      'Rosh Hashanah promotional access and paid conversion',
      '{"trial_days":0,"stripe_trial_enabled":false,"offer_key":"membership_67_monthly","conversion_policy_key":"one_time_rosh_hashanah_paid_conversion","billing_start_at":null,"timezone":"Asia/Jerusalem","renewal_amount_cents":6700,"currency":"USD","billing_interval":"month","tax_behavior":"exclusive","card_required":true,"billing_authorization_required":true,"no_failed_payment_grace_period":true,"checkout_session_creation_enabled":false,"live_charges_enabled":false}'::jsonb
    ),
    (
      'one_time_warm_lead_intro_trial',
      'one-time-warm-lead-intro-trial-v1',
      'trial',
      'Superseded warm-lead 30-day intro trial',
      '{"trial_days":30,"offer_key":"membership_67_monthly","renewal_amount_cents":6700,"currency":"USD","billing_interval":"month","card_required":true,"one_intro_trial_per_household":true,"pre_renewal_reminder_required":true,"checkout_session_creation_enabled":false,"live_charges_enabled":false,"superseded_by":"one_time_rosh_hashanah_promotional_access","superseded_raw_id":"RAW-20260713-005"}'::jsonb
    ),
    (
      'one_time_referral_credit_after_first_paid_cycle',
      'one-time-referral-credit-v1',
      'referral',
      'Referral credit after first paid cycle',
      '{"activation_trigger":"first_successful_paid_cycle","reward_type":"manual_month_credit_candidate","reward_amount_cents":6700,"currency":"USD","self_referrals_allowed":false,"one_reward_per_referred_member":true,"invoice_credit_enabled":false,"external_write_performed":false}'::jsonb
    ),
    (
      'one_time_rosh_hashanah_pre_billing_notice',
      'one-time-rosh-hashanah-pre-billing-notice-v1',
      'billing_notice',
      'Rosh Hashanah pre-billing notice',
      '{"template_key":"one_time_pre_billing_notice_v1","required_disclosures":["price_67_usd_monthly","plus_applicable_taxes","no_stripe_trial","billing_start_date","cancel_at_period_end","manual_exception_refund_review_only","failed_payment_suspends_access_immediately"],"preview_enabled":true,"batch_send_enabled":false,"live_send_enabled":false,"external_write_performed":false}'::jsonb
    ),
    (
      'one_time_manual_exception_refund_review',
      'one-time-manual-exception-refund-review-v1',
      'refund_review',
      'Manual exceptional refund review',
      '{"default_refund_policy":"non_refundable_except_manual_exception","automatic_refunds_enabled":false,"prorated_refunds_enabled":false,"refund_execution_enabled":false,"required_review_fields":["member_id","stripe_customer_id","stripe_invoice_id","stripe_payment_intent_or_charge_id","refund_reason","requested_by","reviewed_by","approval_recorded_at","access_decision","test_or_live_mode"],"external_write_performed":false}'::jsonb
    ),
    (
      'one_time_cancellation_refund_intent',
      'one-time-cancellation-refund-intent-v1',
      'cancellation_refund',
      'Superseded cancellation and refund intent',
      '{"future_renewal_cancellation_supported":true,"refund_exceptions":["duplicate_charge","incorrect_charge","provider_cancelled_without_makeup_or_credit","legally_required"],"public_wording_decision":"DEC-20260621-901","public_copy_approved":false,"superseded_by":"one_time_manual_exception_refund_review","superseded_raw_id":"RAW-20260713-005"}'::jsonb
    )
  ) AS p(policy_key, policy_version, policy_type, title, config)
)
INSERT INTO bna_one_time_promotion_policies (
  project_id, program_id, program_key, policy_key, policy_version, policy_type,
  status, title, config, public_copy_approved, live_billing_enabled,
  invoice_credit_enabled, external_write_performed, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       policies.policy_key, policies.policy_version, policies.policy_type,
       CASE WHEN policies.policy_key IN ('one_time_warm_lead_intro_trial', 'one_time_cancellation_refund_intent') THEN 'archived' ELSE 'needs_operator_decision' END,
       policies.title, policies.config,
       FALSE, FALSE, FALSE, FALSE,
       '{"seeded_by":"one_time_trial_referral_config_migration","requirement_id":"REQ-20260713-954","notice_requirement_id":"REQ-20260713-957","refund_requirement_id":"REQ-20260713-958","supersedes":"REQ-20260621-906"}'::jsonb,
       NOW()
FROM program
CROSS JOIN policies
ON CONFLICT (program_key, policy_key, policy_version)
DO UPDATE SET
  title = EXCLUDED.title,
  policy_type = EXCLUDED.policy_type,
  status = EXCLUDED.status,
  config = COALESCE(bna_one_time_promotion_policies.config, '{}'::jsonb) || EXCLUDED.config,
  public_copy_approved = FALSE,
  live_billing_enabled = FALSE,
  invoice_credit_enabled = FALSE,
  external_write_performed = FALSE,
  metadata = COALESCE(bna_one_time_promotion_policies.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();

WITH program AS (
  SELECT p.id AS program_id, p.project_id
  FROM bna_product_programs p
  WHERE p.program_key = 'one_time_mishnah_class'
)
INSERT INTO bna_product_decisions (
  project_id, program_id, program_key, decision_key, status, title, question,
  context, candidate_json, needed_from, public_output_allowed, metadata, updated_at
)
SELECT program.project_id, program.program_id, 'one_time_mishnah_class',
       'rosh_hashanah_billing_policy_copy',
       'decision_pending',
       'Approve Rosh Hashanah billing notice and policy wording',
       'What exact public billing-start, no-trial, tax, cancellation, refund, notice, referral, and credit wording may One Time use?',
       'Blocks only final public/legal copy and live billing launch. Test/local policy storage, notice preview, and refund-review storage remain usable.',
       '{"decision_id":"DEC-20260713-950","recommended_option":"approve polished customer-facing wording before any public checkout, charge, invoice receipt, referral ask, refund review, or notice send","alternatives":["keep billing/refund/referral copy admin-only","disable referral reward until legal/accounting review"],"exact_action_required":"Approve customer-facing billing start, no-trial, tax, cancellation, manual refund exception, referral eligibility, credit timing, and notice wording."}'::jsonb,
       'Shloimie / Rabbi Ellie Scheller / legal-accounting owner',
       FALSE,
       '{"seeded_by":"one_time_trial_referral_config_migration","requirement_id":"REQ-20260713-954","notice_requirement_id":"REQ-20260713-957","refund_requirement_id":"REQ-20260713-958","supersedes":"REQ-20260621-906"}'::jsonb,
       NOW()
FROM program
ON CONFLICT (program_key, decision_key)
DO UPDATE SET
  title = EXCLUDED.title,
  question = EXCLUDED.question,
  context = EXCLUDED.context,
  candidate_json = EXCLUDED.candidate_json,
  public_output_allowed = FALSE,
  metadata = COALESCE(bna_product_decisions.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = NOW();
