const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ONE_TIME_DOMAIN,
  ONE_TIME_FROM_EMAIL,
  ONE_TIME_FROM_NAME,
  ONE_TIME_PROJECT_KEY,
  ONE_TIME_REPLY_TO,
  ONE_TIME_WORKSPACE_KEY,
  buildOneTimeContactImportPlan,
  buildOneTimeEmailWorkflowPreview,
  buildOneTimeStripeTrialPolicy,
  buildOneTimeTrialSignupPreview,
  inventoryDownloadsSpreadsheets,
  parseDelimited,
} = require('../src/lib/bna/one-time-launch-readiness');

test('One Time launch readiness parses CSV and builds no-send dedupe contact plan', () => {
  const rows = parseDelimited('Email Address,First Name,Last Name,status,plan\nParent@Example.Test,Test,Parent,active,monthly\nparent@example.test,Duplicate,Parent,trial,monthly\n', ',');
  assert.equal(rows.length, 3);

  const inventory = {
    generated_at: '2026-06-28T00:00:00.000Z',
    downloads_dir: fs.mkdtempSync(path.join(os.tmpdir(), 'bna-onetime-fixture-')),
    files: [
      {
        file_name: 'Rabbi Scheller Followers.csv',
        sha256: 'test-hash',
        within_since_window: true,
        row_count: 2,
        import_lane: 'contact_import_candidate',
        classification: 'rabbi_onetime_contact_export',
      },
    ],
  };
  const fixtureDir = inventory.downloads_dir;
  const fixturePath = path.join(fixtureDir, 'Rabbi Scheller Followers.csv');
  fs.writeFileSync(fixturePath, 'Email Address,First Name,Last Name,status,plan\nParent@Example.Test,Test,Parent,active,monthly\nparent@example.test,Duplicate,Parent,trial,monthly\n');
  try {
    const plan = buildOneTimeContactImportPlan({ inventory });
    assert.equal(plan.workspace_key, ONE_TIME_WORKSPACE_KEY);
    assert.equal(plan.project_key, ONE_TIME_PROJECT_KEY);
    assert.equal(plan.no_send, true);
    assert.equal(plan.external_write_performed, false);
    assert.equal(plan.private_contact_values_in_report, false);
    assert.ok(plan.required_contact_tags.includes('imported_needs_review'));
    assert.equal(plan.counts.contacts_valid_before_dedupe, 2);
    assert.equal(plan.counts.contacts_after_dedupe, 1);
    assert.equal(plan.counts.duplicates_merged_or_skipped, 1);
    for (const tag of [
      'active_old_app',
      'warm_uncontacted',
      'no_send',
      'campaign_candidate_30_day_free',
      ONE_TIME_PROJECT_KEY,
      ONE_TIME_WORKSPACE_KEY,
      'one-time-list:rabbi-email-contacts',
      'one-time-no-send-until-approved',
    ]) {
      assert.ok(plan.contacts[0].tags.includes(tag), `${tag} should be present`);
    }
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
});

test('One Time launch policy is no-card trial with no grace access', () => {
  const policy = buildOneTimeStripeTrialPolicy();
  const signup = buildOneTimeTrialSignupPreview({ referral_code: 'RABBI' }, { checkedAt: '2026-06-28T00:00:00.000Z' });

  assert.equal(policy.trial.days, 30);
  assert.equal(policy.trial.card_required, false);
  assert.equal(policy.trial.payment_method_required_at_signup, false);
  assert.equal(policy.automatic_tax_enabled, false);
  assert.equal(policy.stripe_connect_required, false);
  assert.equal(policy.grace_period.days, 0);
  assert.equal(policy.grace_period.access_during_grace, false);
  assert.equal(signup.access_status, 'trial');
  assert.equal(signup.stripe_checkout_created, false);
  assert.equal(signup.live_charge_performed, false);
  assert.equal(signup.referral.captured, true);
});

test('One Time email workflow preview stays draft-only on the One Time sender', () => {
  const preview = buildOneTimeEmailWorkflowPreview({
    resendReadiness: { configured: true, connected: false, domain: ONE_TIME_DOMAIN },
  });

  assert.equal(preview.domain, ONE_TIME_DOMAIN);
  assert.equal(preview.sender_identity.from_email, ONE_TIME_FROM_EMAIL);
  assert.equal(preview.sender_identity.display_name, ONE_TIME_FROM_NAME);
  assert.equal(preview.sender_identity.reply_to, ONE_TIME_REPLY_TO);
  assert.equal(preview.sender_identity.customer_facing_bna_branding, false);
  assert.equal(preview.bulk_send_enabled, false);
  assert.equal(preview.test_send_enabled, false);
  assert.equal(preview.email_send_performed, false);
  assert.ok(preview.drafts.length >= 6);
  assert.equal(preview.drafts.every((draft) => draft.from_email === ONE_TIME_FROM_EMAIL), true);
  assert.equal(preview.drafts.every((draft) => draft.from_name === ONE_TIME_FROM_NAME), true);
  assert.equal(preview.drafts.every((draft) => draft.reply_to === ONE_TIME_REPLY_TO), true);
  assert.equal(preview.drafts.every((draft) => draft.preview_only === true && draft.email_send_performed === false), true);
});

test('required One Time launch scripts are registered in package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  for (const name of [
    'inventory:downloads-spreadsheets',
    'app:smoke:one-time-crm-import-dedupe',
    'app:smoke:one-time-crm-contacts-ux',
    'app:smoke:email-resend-ux',
    'one-time:smoke:resend-vimeo-stripe',
    'app:smoke:one-time-trial-referral',
    'app:smoke:one-time-payment-access-class-links',
    'stripe:sandbox-smoke',
  ]) {
    assert.ok(pkg.scripts[name], `${name} should exist`);
  }
});

test('Downloads inventory can run against an empty directory without leaking private values', () => {
  const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-onetime-empty-downloads-'));
  fs.mkdirSync(emptyDir, { recursive: true });
  try {
    const inventory = inventoryDownloadsSpreadsheets({ downloadsDir: emptyDir, sinceDays: 1, now: '2026-06-28T00:00:00.000Z' });
    assert.equal(inventory.summary.total_spreadsheets, 0);
    assert.equal(inventory.privacy.raw_rows_committed, false);
    assert.equal(inventory.privacy.raw_headers_committed, false);
    assert.equal(inventory.privacy.private_values_committed, false);
  } finally {
    fs.rmSync(emptyDir, { recursive: true, force: true });
  }
});
