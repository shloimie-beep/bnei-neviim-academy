const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildProviderDirectoryConsentReview,
} = require('../src/platform/domain/provider-directory-consent');

const completeConsent = {
  guardian_consent: true,
  provider_consent: true,
  data_use_disclosure: true,
  service_email_consent: true,
  marketing_consent: true,
  consent_version: 'local-beta-v1',
  consent_timestamp: '2026-06-20T00:00:00.000Z',
  export_delete_request_workflow: 'available_through_operations_review',
  retention_configuration: { policy: 'local_beta_default' },
};

test('provider directory consent review allows only provider-supplied public fields', () => {
  const review = buildProviderDirectoryConsentReview({
    id: 42,
    status: 'approved',
    display_name: 'Rabbi Example Program',
    email: 'provider@example.test',
    phone: '+1 555 111 2222',
    publish_contact: true,
    categories: [{ slug: 'rabbeim-shiurim', name: 'Rabbeim / Shiurim' }],
    languages: ['English', 'Hebrew'],
    location_label: 'Online',
    short_description: 'Mishnah review for middle-school boys.',
    offerings: [{ title: 'Weekly Mishnah review', offering_type: 'class', age_range: '11-14' }],
    commercial_notes: 'Internal only',
    private_admin_notes: 'Do not show',
    ...completeConsent,
  });

  assert.equal(review.preview_only, true);
  assert.equal(review.external_write_performed, false);
  assert.equal(review.public_listing_allowed, true);
  assert.equal(review.status, 'approved_for_local_directory_preview');
  assert.equal(review.allowed_public_profile.display_name, 'Rabbi Example Program');
  assert.equal(review.allowed_public_profile.email, 'provider@example.test');
  assert.equal(review.allowed_public_profile.commercial_notes, undefined);
  assert.equal(review.allowed_public_profile.private_admin_notes, undefined);
  assert.equal(review.commercial_policy.identifiable_lead_sale_allowed, false);
  assert.equal(review.referral_policy.parent_student_details_shared_with_provider, false);
  assert.ok(review.guardrails.includes('no_public_student_records'));
});

test('provider directory consent review blocks missing consent and prohibited private-data uses', () => {
  const review = buildProviderDirectoryConsentReview({
    status: 'approved',
    display_name: 'Unsafe Provider',
    categories: [{ slug: 'tutoring', name: 'Tutoring' }],
    languages: ['English'],
    location_label: 'Brooklyn',
    short_description: 'Tutoring.',
    offerings: [{ title: 'Tutoring', offering_type: 'service' }],
    requested_uses: [
      'sell parent lead data',
      'build advertising profile of child behavior',
      'publish public student records',
    ],
    student_records: [{ name: 'Private Student', note: 'sensitive' }],
    provider_consent: true,
    data_use_disclosure: true,
  });

  assert.equal(review.public_listing_allowed, false);
  assert.equal(review.status, 'blocked_needs_review');
  assert.ok(review.missing_consent_records.includes('guardian_consent'));
  assert.ok(review.blocked_reasons.some((reason) => reason.startsWith('private_data:student_records')));
  assert.ok(review.blocked_reasons.some((reason) => reason.includes('sale_of_identifiable_child_or_parent_data')));
  assert.ok(review.blocked_reasons.some((reason) => reason.includes('advertising_profile_of_identifiable_child_or_parent_data')));
  assert.ok(review.blocked_reasons.some((reason) => reason.includes('public_student_records')));
  assert.equal(review.allowed_public_profile.email, '');
  assert.equal(review.commercial_policy.identifiable_lead_sale_allowed, false);
});

test('paid privacy provider plan suppresses advertising and analytics monetization', () => {
  const review = buildProviderDirectoryConsentReview({
    status: 'approved',
    provider_plan: 'paid_privacy_plan',
    display_name: 'Private Provider',
    categories: [{ slug: 'therapy-support', name: 'Therapy / Support' }],
    languages: ['English'],
    location_label: 'Remote',
    short_description: 'Private provider support.',
    offerings: [{ title: 'Private session', offering_type: 'service' }],
    ...completeConsent,
  });

  assert.equal(review.public_listing_allowed, true);
  assert.equal(review.provider_plan, 'paid_privacy_plan');
  assert.deepEqual(review.commercial_policy.allowed_monetizable_uses, [
    'provider_service_delivery',
    'legal_security_obligations',
  ]);
  assert.equal(review.commercial_policy.contextual_ads_allowed, false);
  assert.equal(review.commercial_policy.deidentified_analytics_allowed, false);
  assert.equal(review.referral_policy.safe_contact_or_lead_action_allowed, true);
});
