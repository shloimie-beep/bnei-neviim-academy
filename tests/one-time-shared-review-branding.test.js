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
  assert.equal(review.brand.logo, '/images/one-time/brand/onetimelogo.webp');
  assert.equal(review.brand.hero, '/images/one-time/brand/onetime-hero-vertical.webp');
  assert.equal(review.brand.site_config, 'config/service-provider-sites/one-time.json');
  assert.equal(review.identities.rabbi.display_name, 'Rabbi Eli Scheller');
  assert.equal(review.identities.rabbi.login_username, 'ELISHELLER');

  assert.equal(review.parent_portal.linked_students_visible.length, 1);
  assert.equal(review.parent_portal.linked_students_visible[0].id, 'TEST-ONETIME-STUDENT-001');
  assert.equal(review.student_portal.bot_enabled, false);
  assert.equal(review.student_portal.bna_accountability_enabled, false);
  assert.match(review.student_portal.portal_scope.display_rule, /No bot \/ no BNA goals/);
  assert.ok(review.student_portal.portal_scope.excluded_school_portal_features.includes('BNA school accountability goals'));
  assert.ok(review.provider_portal.workspace_users.some((user) => user.login_username === 'ELISHELLER'));
  assert.ok(review.provider_portal.badge_system.badges.some((badge) => badge.title === 'Thoughtful Question'));
  assert.match(review.provider_portal.badge_system.guardrail, /BNA school accountability goals/);

  assert.equal(review.provider_portal.video.vimeo_video_id, '1178363755');
  assert.match(review.provider_portal.video.media_url, /1178363755/);
  assert.match(review.provider_portal.video.embed_url, /player\.vimeo\.com\/video\/1178363755/);
  assert.match(review.provider_portal.video.description, /legacy OneTimeOneTime/);

  assert.equal(review.email_templates.length, 21);
  const templateKeys = new Set(review.email_templates.map((template) => template.key));
  [
    'parent_invitation',
    'student_invitation',
    'parent_verification',
    'student_verification',
    'password_recovery',
    'class_reminder',
    'zoom_readiness_reminder',
    'class_recording_available',
    'new_video_library_item',
    'worksheet_resource',
    'attendance_progress_summary',
    'milestone_notice',
    'achievement_earned',
    'reward_ready',
    'trial_confirmation',
    'pre_renewal_reminder',
    'payment_receipt_preview',
    'payment_issue_preview',
    'cancellation_request_received',
    'support_ticket_created',
    'support_reply',
  ].forEach((key) => assert.equal(templateKeys.has(key), true, `missing ${key}`));

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

  const oneTimeHtml = fs.readFileSync('public/one-time/index.html', 'utf8');
  assert.match(oneTimeHtml, /Learn Mishnayos Live with Rabbi Eli Scheller/);
  assert.match(oneTimeHtml, /\/images\/one-time\/brand\/onetime-hero-vertical\.webp/);
  assert.match(oneTimeHtml, /\/images\/one-time\/press\/torahanytime-logo\.png/);
  assert.match(oneTimeHtml, /player\.vimeo\.com\/video\/1158542993\?h=daa31d3417/);
  assert.match(oneTimeHtml, /\/api\/one-time\/campaign/);
  assert.doesNotMatch(oneTimeHtml, /TEST-ONETIME-REVIEW-ACCESS/);
  assert.match(fs.readFileSync('public/provider.html', 'utf8'), /\/css\/one-time-shared-review\.css/);
  assert.match(fs.readFileSync('public/provider.html', 'utf8'), /OneTimeOneTime Rabbi Workspace Review/);
  assert.match(fs.readFileSync('public/provider.html', 'utf8'), /ELISHELLER/);
  assert.match(fs.readFileSync('public/provider.html', 'utf8'), /Badges and Rewards/);
  assert.match(fs.readFileSync('public/parent.html', 'utf8'), /\/images\/one-time\/brand\/onetimelogo\.webp/);
  assert.match(fs.readFileSync('public/parent.html', 'utf8'), /OneTimeOneTime Parent Review/);
  assert.match(fs.readFileSync('public/student.html', 'utf8'), /No bot \/ no BNA goals/);
  assert.match(fs.readFileSync('public/student.html', 'utf8'), /excludes BNA school accountability goals/);
  assert.match(fs.readFileSync('public/student.html', 'utf8'), /OneTimeOneTime Student Review/);
  const classroomHtml = fs.readFileSync('public/one-time-classroom.html', 'utf8');
  assert.match(classroomHtml, /TEST-only member-library data/);
  assert.match(classroomHtml, /classEmbedUrl/);
  assert.match(classroomHtml, /<iframe/);
  assert.match(classroomHtml, /Fallback Vimeo Link/);
  assert.match(classroomHtml, /\.video-embed \{ min-height: 0; \}/);
  assert.match(fs.readFileSync('public/one-time-email-review.html', 'utf8'), /\/images\/one-time\/brand\/onetimelogo\.webp/);

  const sharedReviewCss = fs.readFileSync('public/css/one-time-shared-review.css', 'utf8');
  assert.match(sharedReviewCss, /--one-time-black: #080910/);
  assert.match(sharedReviewCss, /--one-time-cyan: #0b9fc9/);
  assert.match(sharedReviewCss, /--one-time-yellow: #ede518/);
  assert.match(sharedReviewCss, /body\.one-time-review-active \.portal-sidebar/);
  assert.match(sharedReviewCss, /body\.one-time-review-active \.one-time-review-hero-card/);
  assert.match(sharedReviewCss, /body\.one-time-review-active \.progress-fill/);
});

test('committed One Time review assets and manifest exist', () => {
  const requiredAssets = [
    'public/images/one-time/brand/onetimelogo.webp',
    'public/images/one-time/brand/onetime-hero-vertical.webp',
    'public/images/one-time/press/torahanytime-logo.png',
    'public/images/one-time/press/twentyfour-six-logo.png',
    'public/images/one-time/press/loop-logo.png',
    'public/images/one-time/press/mishpacha.webp',
    'public/images/one-time/teaching/promo-stage-still-01.webp',
    'public/images/one-time/teaching/promo-stage-still-02.webp',
    'public/images/one-time/teaching/promo-stage-still-03.webp',
    'public/images/one-time/social/one-time-og-20260622.jpg',
    'ops/one-time-mishnah/brand-site-review/ASSET-INVENTORY.md',
    'ops/one-time-mishnah/brand-site-review/asset-manifest.json',
    'ops/one-time-mishnah/brand-site-review/HERO-VIDEO-TRACE.md',
    'ops/one-time-mishnah/asset-intake/2026-06-22/SUMMARY.md',
    'ops/one-time-mishnah/asset-intake/2026-06-22/SELECTION-MAP.md',
    'ops/one-time-mishnah/asset-intake/2026-06-22/RIGHTS-BLOCKERS.md',
  ];

  for (const assetPath of requiredAssets) {
    assert.equal(fs.existsSync(assetPath), true, `${assetPath} should exist`);
  }

  const manifest = JSON.parse(fs.readFileSync('ops/one-time-mishnah/brand-site-review/asset-manifest.json', 'utf8'));
  assert.equal(manifest.committed_assets.length, 9);
  assert.ok(manifest.committed_assets.some((item) => item.destination_path.includes('/brand/onetimelogo.webp')));
  assert.ok(manifest.committed_assets.some((item) => item.destination_path.includes('/teaching/promo-stage-still-03.webp')));
  assert.ok(manifest.traced_not_committed.some((item) => item.source_path.includes('promo_website_v1')));
  assert.ok(manifest.traced_not_committed.some((item) => /child\/crowd imagery/.test(item.reason)));
  assert.ok(manifest.not_found.some((item) => item.label === 'Naki Radio logo'));
});

test('One Time brand kit and service-provider site config are present', () => {
  const brand = JSON.parse(fs.readFileSync('config/brands/one-time.json', 'utf8'));
  assert.equal(brand.palette.black, '#080910');
  assert.equal(brand.palette.yellow, '#ede518');
  assert.equal(brand.assets.logo, '/images/one-time/brand/onetimelogo.webp');
  assert.equal(brand.assets.social_og, '/images/one-time/social/one-time-og-20260622.jpg');
  assert.equal(brand.review_only, true);

  const site = JSON.parse(fs.readFileSync('config/service-provider-sites/one-time.json', 'utf8'));
  assert.equal(site.key, 'one_time');
  assert.equal(site.status, 'shared_review');
  assert.equal(site.external_write_performed, false);
  assert.equal(site.copy.headline, 'Learn Mishnayos Live with Rabbi Eli Scheller');
  assert.equal(site.copy.primary_cta, 'START 30 DAYS FREE');
  assert.equal(site.copy.secondary_cta, 'WATCH RABBI SCHELLER');
  assert.equal(site.assets.social_og, '/images/one-time/social/one-time-og-20260622.jpg');
  assert.ok(site.blocked_live_actions.includes('live_email_send'));

  [
    'brand-kit/one-time/README.md',
    'brand-kit/one-time/colors.json',
    'brand-kit/one-time/copy.md',
    'brand-kit/one-time/assets.json',
    'brand-kit/one-time/usage.md',
    'docs/product/service-provider-landing-pages.md',
    'docs/product/service-provider-site-onboarding.md',
  ].forEach((filePath) => assert.equal(fs.existsSync(filePath), true, `${filePath} should exist`));
});

test('campaign API and view-as Rabbi preview are declared as read-only guarded surfaces', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const providerHtml = fs.readFileSync('public/provider.html', 'utf8');
  const css = fs.readFileSync('public/css/one-time-shared-review.css', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

  assert.match(server, /app\.get\('\/api\/one-time\/campaign'/);
  assert.match(server, /ONE_TIME_CAMPAIGN_DEADLINE_AT/);
  assert.match(server, /DEC-20260622-ONE-TIME-CAMPAIGN-DEADLINE/);
  assert.match(server, /app\.post\('\/api\/bna\/one-time\/view-as-rabbi\/start', requireAdmin/);
  assert.match(server, /app\.get\('\/api\/bna\/one-time\/view-as-rabbi\/session', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/one-time\/view-as-rabbi\/end', requireAdmin/);
  assert.match(server, /function requireOneTimeViewAsSuperAdmin/);
  assert.match(server, /Only platform_super_admin can use View as Rabbi/);
  assert.match(server, /verifyOneTimeViewAsToken/);
  assert.match(server, /try \{\s*payload = base64UrlDecode\(encoded\);[\s\S]*catch \(error\) \{\s*return null;/);
  assert.match(server, /payload\.typ !== 'one_time_view_as_rabbi'/);
  assert.match(server, /payload\.read_only !== true/);
  assert.match(server, /read_only: true/);

  assert.match(providerHtml, /view_as_rabbi/);
  assert.match(providerHtml, /VIEWING AS RABBI - READ ONLY/);
  assert.match(providerHtml, /oneTimeExitViewAs/);
  assert.match(providerHtml, /\/api\/bna\/one-time\/view-as-rabbi\/end/);
  assert.match(css, /one-time-view-as-banner/);
  assert.match(css, /one-time-view-as-readonly/);

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/api/bna/one-time/view-as-rabbi/start'));
  assert.ok(routes.has('/api/bna/one-time/view-as-rabbi/session'));
  assert.ok(routes.has('/api/bna/one-time/view-as-rabbi/end'));

  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-VIEW-AS-RABBI-START'));
  assert.ok(actions.has('ACTION-ONETIME-VIEW-AS-RABBI-EXIT'));
});
