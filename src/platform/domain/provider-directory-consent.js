const {
  normalizeProviderSignupPayload,
  providerCompleteness,
  sanitizeProviderForPublic,
} = require('../../lib/bna/provider-index');
const {
  buildProviderDirectoryConsentContract,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_WORKSPACE_KEY,
} = require('../instances/one-time');
const { compactWhitespace } = require('../../lib/bna/task-shaping');

const PROVIDER_DIRECTORY_CONSENT_REVIEW_VERSION = 'provider-directory-consent-review-v1';

const PUBLIC_SAFE_KEYS = [
  'id',
  'slug',
  'display_name',
  'short_description',
  'about',
  'website_url',
  'profile_photo_url',
  'hero_image_url',
  'is_featured',
  'languages',
  'location_label',
  'city',
  'neighborhood',
  'service_area',
  'categories',
  'images',
  'offerings',
  'contact_name',
  'email',
  'phone',
  'whatsapp',
  'publish_contact',
  'profile_completeness',
  'seo_title',
  'seo_description',
];

const APPROVED_PROVIDER_STATUSES = new Set(['approved', 'active_partner']);

function truthy(value) {
  if (value === true) return true;
  if (typeof value === 'number') return value > 0;
  return /^(?:1|true|yes|y|on|approved|accepted|current|configured)$/i.test(String(value || '').trim());
}

function consentValue(input = {}, key = '') {
  const consent = input.consent_records || input.consent || input.consents || {};
  return consent[key] ?? input[key] ?? input[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
}

function consentPresent(input = {}, key = '') {
  const value = consentValue(input, key);
  if (['retention_configuration', 'export_delete_request_workflow', 'consent_version', 'consent_timestamp'].includes(key)) {
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return compactWhitespace(value).length > 0 || truthy(value);
  }
  return truthy(value);
}

function requestedUses(input = {}) {
  const uses = input.requested_uses || input.requestedUses || input.uses || [];
  if (Array.isArray(uses)) return uses.map((item) => String(item || '').trim()).filter(Boolean);
  return String(uses || '')
    .split(/[,;\n|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePlan(input = {}) {
  const key = String(input.provider_plan || input.providerPlan || input.entitlement_plan || input.entitlementPlan || input.plan || 'free_provider_plan')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (['paid_privacy', 'paid_privacy_plan', 'privacy_plan'].includes(key)) return 'paid_privacy_plan';
  return 'free_provider_plan';
}

function privateDataFindings(input = {}) {
  const findings = [];
  const directKeys = [
    'student_records',
    'students',
    'student_notes',
    'student_private_notes',
    'parent_records',
    'guardian_records',
    'parent_email',
    'guardian_email',
    'family_notes',
  ];
  for (const key of directKeys) {
    const value = input[key] ?? input.metadata?.[key] ?? input.private_data?.[key];
    if (value !== undefined && value !== null && JSON.stringify(value) !== '[]' && JSON.stringify(value) !== '{}') {
      findings.push({
        key,
        reason: 'Provider directory public/commercial review received identifiable family or student data.',
      });
    }
  }
  const text = JSON.stringify(input.requested_public_profile || input.public_profile || {});
  if (/\b(student|child|parent|guardian)[_-]?(?:email|phone|notes|record|diagnosis|behavior)\b/i.test(text)) {
    findings.push({
      key: 'requested_public_profile',
      reason: 'Requested public profile contains private family/student fields.',
    });
  }
  return findings;
}

function prohibitedUseFindings(input = {}, contract = buildProviderDirectoryConsentContract()) {
  const haystack = requestedUses(input).join(' ').toLowerCase();
  const findings = [];
  for (const prohibited of contract.prohibited_uses || []) {
    const simplified = prohibited.replace(/_/g, ' ');
    const saleOfData = /sale_of_identifiable_child_or_parent_data/.test(prohibited)
      && /\b(sell|sale|broker|resell).{0,60}\b(child|student|parent|guardian|family|lead|data)\b/i.test(haystack);
    const adsProfile = /advertising_profile_of_identifiable_child_or_parent_data/.test(prohibited)
      && /\b(ad|ads|advertising|retarget|lookalike|profile).{0,80}\b(child|student|parent|guardian|family)\b/i.test(haystack);
    const publicStudent = /public_student_records/.test(prohibited)
      && /\b(public|publish|directory).{0,60}\b(student|child).{0,40}\b(record|profile|note|data)\b/i.test(haystack);
    if (saleOfData || adsProfile || publicStudent || haystack.includes(simplified)) {
      findings.push({
        prohibited_use: prohibited,
        requested_uses: requestedUses(input),
      });
    }
  }
  return findings;
}

function safePublicProfile(provider = {}) {
  const sanitized = sanitizeProviderForPublic(provider);
  return PUBLIC_SAFE_KEYS.reduce((profile, key) => {
    if (sanitized[key] !== undefined) profile[key] = sanitized[key];
    return profile;
  }, {});
}

function buildProviderDirectoryConsentReview(input = {}, options = {}) {
  const contract = buildProviderDirectoryConsentContract();
  const normalized = normalizeProviderSignupPayload(input);
  const provider = {
    ...normalized,
    ...input,
    display_name: normalized.display_name || input.display_name || input.provider_name,
    categories: input.categories || normalized.categories,
    languages: input.languages || normalized.languages,
    offerings: input.offerings || normalized.offerings,
    status: input.status || input.provider_status || 'draft',
    publish_contact: input.publish_contact === true || normalized.publish_contact === true,
    public_listing_enabled: input.public_listing_enabled !== false,
  };
  const categories = Array.isArray(provider.categories) ? provider.categories : [];
  const offerings = Array.isArray(provider.offerings) ? provider.offerings : [];
  const completeness = providerCompleteness(provider, categories, offerings, provider.images || []);
  const plan = normalizePlan(input);
  const missingConsentRecords = (contract.required_consent_records || [])
    .filter((key) => !consentPresent(input, key));
  const privateFindings = privateDataFindings(input);
  const prohibitedFindings = prohibitedUseFindings(input, contract);
  const reviewStatus = String(provider.status || '').toLowerCase();
  const approvedStatus = APPROVED_PROVIDER_STATUSES.has(reviewStatus);
  const blockedReasons = [];

  if (!provider.public_listing_enabled) blockedReasons.push('public_listing_disabled');
  if (!approvedStatus) blockedReasons.push('provider_not_approved');
  for (const key of missingConsentRecords) blockedReasons.push(`missing_consent:${key}`);
  for (const finding of privateFindings) blockedReasons.push(`private_data:${finding.key}`);
  for (const finding of prohibitedFindings) blockedReasons.push(`prohibited_use:${finding.prohibited_use}`);

  const paidPrivacyPlan = plan === 'paid_privacy_plan';
  const publicListingAllowed = blockedReasons.length === 0;
  const profile = publicListingAllowed ? safePublicProfile(provider) : safePublicProfile({ ...provider, publish_contact: false });
  const marketingConsent = consentPresent(input, 'marketing_consent');
  const serviceEmailConsent = consentPresent(input, 'service_email_consent');
  const guardianConsent = consentPresent(input, 'guardian_consent');

  return {
    review_version: PROVIDER_DIRECTORY_CONSENT_REVIEW_VERSION,
    preview_only: true,
    external_write_performed: false,
    workspace_key: options.workspace_key || ONE_TIME_WORKSPACE_KEY,
    project_key: options.project_key || ONE_TIME_PROJECT_KEY,
    provider_plan: plan,
    status: publicListingAllowed ? 'approved_for_local_directory_preview' : 'blocked_needs_review',
    public_listing_allowed: publicListingAllowed,
    missing_consent_records: missingConsentRecords,
    private_data_findings: privateFindings,
    prohibited_use_findings: prohibitedFindings,
    blocked_reasons: blockedReasons,
    completeness,
    allowed_public_profile: profile,
    public_profile_fields: Object.keys(profile),
    commercial_policy: paidPrivacyPlan
      ? {
          plan,
          allowed_monetizable_uses: ['provider_service_delivery', 'legal_security_obligations'],
          contextual_ads_allowed: false,
          deidentified_analytics_allowed: false,
          identifiable_lead_sale_allowed: false,
        }
      : {
          plan,
          allowed_monetizable_uses: [
            'provider_supplied_public_business_profile',
            'contextual_advertising_with_adult_review',
            'aggregated_deidentified_analytics',
          ],
          contextual_ads_allowed: marketingConsent && privateFindings.length === 0 && prohibitedFindings.length === 0,
          deidentified_analytics_allowed: consentPresent(input, 'data_use_disclosure'),
          identifiable_lead_sale_allowed: false,
        },
    referral_policy: {
      safe_contact_or_lead_action_allowed: publicListingAllowed && guardianConsent && serviceEmailConsent,
      parent_student_details_shared_with_provider: false,
      requires_adult_review: true,
    },
    contract,
    guardrails: [
      'no_public_student_records',
      'no_identifiable_child_parent_data_sale',
      'no_identifiable_child_parent_ad_profile',
      'public_profile_uses_provider_supplied_fields_only',
      'external_write_performed_false',
    ],
  };
}

module.exports = {
  PROVIDER_DIRECTORY_CONSENT_REVIEW_VERSION,
  buildProviderDirectoryConsentReview,
};
