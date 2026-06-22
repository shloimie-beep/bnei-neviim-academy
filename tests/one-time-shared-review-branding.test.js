const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  REVIEW_ACCESS_CODE,
  buildOneTimeSharedReviewData,
} = require('../src/platform/instances/one-time-shared-review-data');

test('shared One Time review data stays scoped, branded, and preview-only', () => {
  const review = buildOneTimeSharedReviewData({ baseUrl: 'https://bneineviimacademy.org' });

  assert.equal(review.workspace_key, 'rabbi_sheller_provider');
  assert.equal(review.project_key, 'one_time_mishnah_class');
  assert.equal(review.access_code, REVIEW_ACCESS_CODE);
  assert.equal(review.brand.logo, '/images/one-time/onetimelogo.webp');
  assert.equal(review.brand.hero, '/images/one-time/onetime-hero-vertical.webp');

  assert.equal(review.parent_portal.linked_students_visible.length, 1);
  assert.equal(review.parent_portal.linked_students_visible[0].id, 'TEST-ONETIME-STUDENT-001');
  assert.equal(review.student_portal.bot_enabled, false);
  assert.equal(review.student_portal.bna_accountability_enabled, false);

  assert.equal(review.provider_portal.video.vimeo_video_id, '1178363755');
  assert.match(review.provider_portal.video.media_url, /1178363755/);
  assert.match(review.provider_portal.video.description, /legacy OneTimeOneTime/);

  assert.equal(review.email_templates.length, 11);
  for (const template of review.email_templates) {
    assert.equal(template.no_send, true);
    assert.equal(template.send_readiness, 'preview_only');
    assert.match(template.blocked_reason, /Resend sender\/domain readiness/);
  }
});

test('shared One Time review pages include review branding assets', () => {
  const pages = [
    'public/one-time/index.html',
    'public/provider.html',
    'public/parent.html',
    'public/student.html',
    'public/one-time-classroom.html',
    'public/one-time-email-review.html',
  ];

  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /one-time/i, `${page} should include One Time review copy`);
    assert.doesNotMatch(html, /https:\/\/vimeo\.com\/123456789/, `${page} should not reference the old placeholder Vimeo URL`);
  }

  assert.match(fs.readFileSync('public/one-time/index.html', 'utf8'), /\/images\/one-time\/onetime-hero-vertical\.webp/);
  assert.match(fs.readFileSync('public/provider.html', 'utf8'), /\/css\/one-time-shared-review\.css/);
  assert.match(fs.readFileSync('public/parent.html', 'utf8'), /\/images\/one-time\/onetimelogo\.webp/);
  assert.match(fs.readFileSync('public/student.html', 'utf8'), /No bot \/ no BNA goals/);
  assert.match(fs.readFileSync('public/one-time-classroom.html', 'utf8'), /TEST-only member-library data/);
  assert.match(fs.readFileSync('public/one-time-email-review.html', 'utf8'), /\/images\/one-time\/onetimelogo\.webp/);
});

test('committed One Time review assets and manifest exist', () => {
  const requiredAssets = [
    'public/images/one-time/onetimelogo.webp',
    'public/images/one-time/onetime-hero-vertical.webp',
    'public/images/one-time/torahanytime-logo.png',
    'public/images/one-time/twentyfour-six-logo.png',
    'public/images/one-time/loop-logo.png',
    'public/images/one-time/mishpacha.webp',
    'ops/one-time-mishnah/brand-site-review/ASSET-INVENTORY.md',
    'ops/one-time-mishnah/brand-site-review/asset-manifest.json',
    'ops/one-time-mishnah/brand-site-review/HERO-VIDEO-TRACE.md',
  ];

  for (const assetPath of requiredAssets) {
    assert.equal(fs.existsSync(assetPath), true, `${assetPath} should exist`);
  }

  const manifest = JSON.parse(fs.readFileSync('ops/one-time-mishnah/brand-site-review/asset-manifest.json', 'utf8'));
  assert.equal(manifest.committed_assets.length, 6);
  assert.ok(manifest.traced_not_committed.some((item) => item.source_path.includes('promo_website_v1')));
  assert.ok(manifest.not_found.some((item) => item.label === 'Naki Radio logo'));
});
