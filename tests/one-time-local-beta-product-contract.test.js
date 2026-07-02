const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const {
  ONE_TIME_CANONICAL_INGESTION_FLOW,
  ONE_TIME_PROMPT_HIERARCHY,
  ONE_TIME_SUPPORTED_HUMAN_ROLES,
  buildOneTimeInstanceConfig,
} = require('../src/platform/instances/one-time');

const requiredDocs = [
  'docs/product/one-time-pilot-product-model.md',
  'docs/product/one-time-roles-and-portals.md',
  'docs/product/one-time-class-course-ingestion.md',
  'docs/product/provider-directory-and-consent.md',
  'docs/integrations/STRIPE.md',
];

test('One Time local beta exposes only the supported visible human roles', () => {
  const config = buildOneTimeInstanceConfig();

  assert.deepEqual(ONE_TIME_SUPPORTED_HUMAN_ROLES, [
    'admin_owner',
    'service_provider',
    'parent',
    'student',
  ]);
  assert.deepEqual(config.roles.visible_product_roles, ONE_TIME_SUPPORTED_HUMAN_ROLES);
  assert.deepEqual(config.roles.no_visible_generic_roles, ['teacher', 'staff']);
  assert.equal(config.owners.partner_owner, 'Rabbi Elie Scheller');
  assert.equal(config.owners.operator_admin, 'Shloimie');
});

test('One Time portal and prompt hierarchy contracts are role-scoped', () => {
  const config = buildOneTimeInstanceConfig();

  assert.deepEqual(config.prompt_hierarchy.order, ONE_TIME_PROMPT_HIERARCHY);
  assert.equal(config.prompt_hierarchy.versioned, true);
  assert.equal(config.prompt_hierarchy.audit_required, true);
  assert.ok(config.portals.parent.scope.includes('linked child only'));
  assert.ok(config.portals.student.scope.includes('own student record only'));
  assert.ok(config.portals.service_provider.cannot.includes('read unrelated BNA private operations data'));
  assert.ok(config.prompt_hierarchy.isolation_rules.some((rule) => /No other student/.test(rule)));
});

test('One Time product config keeps the 67 dollar offer configurable and models future cohort safely', () => {
  const config = buildOneTimeInstanceConfig();

  assert.equal(config.product.primary_offer.price_cents, 6700);
  assert.equal(config.product.primary_offer.currency, 'USD');
  assert.equal(config.product.primary_offer.configurable, true);
  assert.ok(config.product.primary_offer.includes.includes('parent_portal'));
  assert.ok(config.product.primary_offer.includes.includes('student_portal'));
  assert.equal(config.product.future_cohort.student_capacity, 20);
  assert.equal(config.product.future_cohort.scholarship_seats, 3);
  assert.equal(config.product.future_cohort.automatic_black_box_awards_allowed, false);
  assert.equal(config.seed.product.price_cents, 6700);
  assert.ok(config.seed.task_lanes.includes('Codex Queue'));
});

test('One Time class ingestion and consent contracts cover the local beta flow', () => {
  const config = buildOneTimeInstanceConfig();

  assert.deepEqual(config.class_ingestion.canonical_flow, ONE_TIME_CANONICAL_INGESTION_FLOW);
  assert.ok(config.class_ingestion.sources.includes('zoom_recording'));
  assert.ok(config.class_ingestion.sources.includes('vimeo_asset'));
  assert.ok(config.class_ingestion.sources.includes('approved_drop_folder_video'));
  assert.equal(config.class_ingestion.idempotency_required, true);
  assert.equal(config.class_ingestion.audit_required, true);
  assert.ok(config.provider_directory_consent.required_consent_records.includes('guardian_consent'));
  assert.ok(config.provider_directory_consent.required_consent_records.includes('marketing_consent'));
  assert.ok(config.provider_directory_consent.prohibited_uses.includes('sale_of_identifiable_child_or_parent_data'));
});

test('required One Time local beta product and Stripe docs exist with contract language', () => {
  for (const filePath of requiredDocs) {
    assert.equal(fs.existsSync(filePath), true, `${filePath} should exist`);
  }

  const rolesDoc = fs.readFileSync('docs/product/one-time-roles-and-portals.md', 'utf8');
  assert.match(rolesDoc, /admin_owner/);
  assert.match(rolesDoc, /service_provider/);
  assert.match(rolesDoc, /no other student's records/i);

  const productDoc = fs.readFileSync('docs/product/one-time-pilot-product-model.md', 'utf8');
  assert.match(productDoc, /\$67/);
  assert.match(productDoc, /product\/pricing configuration/);
  assert.match(productDoc, /black-box automatic scholarship awards: not allowed/);

  const stripeDoc = fs.readFileSync('docs/integrations/STRIPE.md', 'utf8');
  assert.match(stripeDoc, /Stripe test mode or local mocks only/);
  assert.match(stripeDoc, /Stripe Connect: not assumed/);
  assert.match(stripeDoc, /No live checkout/);
});
