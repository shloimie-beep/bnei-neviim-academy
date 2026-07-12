const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('One Time focused landing copy uses launch funnel offer and safe CTAs', () => {
  const html = fs.readFileSync('public/one-time/index.html', 'utf8');
  const signup = fs.readFileSync('public/one-time/signup.html', 'utf8');

  assert.match(html, /One Time Mishnayos/);
  assert.match(html, /Give your son a love for Torah you never thought possible/);
  assert.match(html, /Sign Up Now/);
  assert.match(html, /href="\/one-time\/signup"/);
  assert.doesNotMatch(html, /data-signup-modal/);
  assert.doesNotMatch(html, /data-signup-form/);
  assert.match(signup, /name="contact_name"/);
  assert.match(signup, /name="signup_as"/);
  assert.match(signup, /name="city_label"/);
  assert.match(signup, /name="email"/);
  assert.match(signup, /name="phone"/);
  assert.match(signup, /name="reminder_preference"/);
  assert.doesNotMatch(html, /name="student_name"|name="studentName"|name="learner_name"|name="learnerName"/);
  assert.doesNotMatch(signup, /name="student_name"|name="studentName"|name="learner_name"|name="learnerName"/);
  assert.doesNotMatch(signup, /preferred_class_format/);
  assert.doesNotMatch(signup, /data-continue-link|data-continue-onboarding/);
  assert.doesNotMatch(signup, /\/one-time-onboarding\?\$\{params\.toString\(\)\}/);
  assert.match(html, /Member Login/);
  assert.match(html, /Join free until Rosh Hashanah/);
  assert.match(html, /Meet Rabbi Eli Scheller/);
  assert.match(html, /As Seen Across the Jewish World/);
  assert.match(html, /<h3>Clarity<\/h3>/);
  assert.match(html, /<h3>Accomplishment<\/h3>/);
  assert.match(html, /<h3>Excitement for learning Torah<\/h3>/);
  assert.match(html, /<h3>Live daily Mishnayos class<\/h3>/);
  assert.match(html, /<h3>Online class library<\/h3>/);
  assert.match(html, /<h3>Parent portal<\/h3>/);
  assert.match(html, /<h3>Student portal<\/h3>/);
  assert.match(html, /<h3>Worksheets and review materials<\/h3>/);
  assert.match(html, /<h3>Daily reminders<\/h3>/);
  assert.match(html, /<h3>Monitored online platform<\/h3>/);
  assert.match(html, /<h3>Structured communication with the Rabbi<\/h3>/);
  assert.match(html, /<h3>Sign up<\/h3>/);
  assert.match(html, /<h3>Choose Family or School<\/h3>/);
  assert.match(html, /<h3>Receive class details and reminders<\/h3>/);
  assert.match(html, /<h3>Join the live learning rhythm<\/h3>/);
  assert.match(html, /<h3>Families<\/h3>/);
  assert.match(html, /<h3>English-speaking homeschoolers<\/h3>/);
  assert.match(html, /<h3>Schools using it as a class<\/h3>/);
  assert.match(html, /<h3>Local boys joining the free live class at 7 p\.m\. in Ramat Beit Shemesh Alef<\/h3>/);
  assert.match(html, /How It Works/);
  assert.match(html, /\/one-time\/privacy\.html/);
  assert.match(html, /\/one-time\/terms\.html/);
  assert.doesNotMatch(html, /TODO: replace with final hero video\/image/);
  assert.doesNotMatch(html, /hero-media-placeholder|image-placeholder/);
  assert.doesNotMatch(html, /Teaching Torah Across The World/);
  assert.doesNotMatch(html, /Verified photo slot|Replacement-ready|usage rights are confirmed|approved .* asset/i);
  assert.doesNotMatch(html, /HaGaon|MiVilna/);
  assert.doesNotMatch(html, /most sought-after/);
  assert.doesNotMatch(html, /approved Zoom details/);
  assert.doesNotMatch(html, /signup-strip/);
  assert.doesNotMatch(html, /Join the Free Class/);
  assert.doesNotMatch(html, /Save My Spot/);
  assert.doesNotMatch(html, /See How It Works/);
  assert.doesNotMatch(html, /WhatsApp Robot Scheller/);
  assert.doesNotMatch(html, /Quick answers before you start/);
  assert.doesNotMatch(html, /FAQ/);
  assert.doesNotMatch(html, /class="announcement"/);
  assert.doesNotMatch(html, /class="ticker"/);
  assert.doesNotMatch(html, />Region</);
  assert.doesNotMatch(html, />Notes</);
  assert.doesNotMatch(html, /parent access next steps/i);
  assert.doesNotMatch(html, /Parent portal setup instructions/i);
  assert.doesNotMatch(html, /private asset library/i);
  assert.doesNotMatch(html, /server-backed/i);
  assert.doesNotMatch(html, /video ID/i);
  assert.doesNotMatch(html, /player\.vimeo\.com/);
  assert.doesNotMatch(html, /approved launch configuration/i);
  assert.doesNotMatch(html, /No charge or external send was performed/i);
  assert.doesNotMatch(html, /The next step asks whether|Choose the right onboarding path|does not charge|external send|grant access/i);
  assert.doesNotMatch(html, /raw external page/i);
  assert.doesNotMatch(html, /CAPTCHA/i);
  assert.doesNotMatch(html, /\/provider\.html\?review=one-time/);
  assert.doesNotMatch(html, /\/parent\.html\?review=one-time/);
  assert.doesNotMatch(html, /\/student\.html\?review=one-time/);
  assert.doesNotMatch(html, /TEST-ONETIME-REVIEW-ACCESS/);
  assert.doesNotMatch(html, /Academy\s*&\s*Hotline/i);
  assert.doesNotMatch(html, /Academy and Hotline/i);
});

test('One Time focused offer route and registries are declared', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const operations = fs.readFileSync('public/operations.html', 'utf8');
  const botWidget = fs.readFileSync('public/js/bna-bot-widget.js', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));
  const siteConfig = JSON.parse(fs.readFileSync('config/service-provider-sites/one-time.json', 'utf8'));
  const robotAsset = fs.statSync('public/assets/one-time/robot/robot-scheller-whatsapp.png');

  assert.match(server, /'\/one-time\/mishnayos'/);
  assert.match(server, /function isOneTimeSingleTenantRuntime\(\)/);
  assert.match(server, /app\.get\(\['\/', '\/index\.html', '\/public', '\/public\/'\]/);
  assert.match(server, /INSTANCE_RUNTIME_FLAGS\.single_tenant/);
  assert.match(server, /'\/one-time\/'/);
  assert.match(operations, /function updateDocumentTitleForWorkspace\(\)/);
  assert.match(operations, /currentWorkspaceIsOneTime\(\)[\s\S]*document\.title = `\$\{workspaceName\} - Operations`/);

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/one-time'));
  assert.ok(routes.has('/one-time/signup'));
  assert.ok(routes.has('/public'));
  assert.ok(routes.has('/one-time/mishnayos'));
  assert.ok(routes.has('/one-time/privacy.html'));
  assert.ok(routes.has('/one-time/terms.html'));
  assert.ok(routes.has('/one-time-onboarding'));
  assert.ok(routes.has('/one-time-preview'));

  assert.deepEqual(siteConfig.assets.teaching_gallery, []);
  assert.equal(siteConfig.assets.robot_scheller, '/assets/one-time/robot/robot-scheller-whatsapp.png');
  assert.ok(robotAsset.size < 500_000, `expected optimized Robot PNG below 500 KB, got ${robotAsset.size}`);
  assert.match(botWidget, /robot-scheller-whatsapp\.png"\) center center \/ contain no-repeat/);
  assert.match(botWidget, /body\.bna-assistant-surface-one-time-public \.bna-bot-launcher[\s\S]*width: 84px;[\s\S]*min-height: 84px;/);
  assert.match(botWidget, /body\.bna-assistant-surface-one-time-public \.bna-bot-launcher \.bna-bot-avatar[\s\S]*width: 72px;[\s\S]*height: 72px;/);
  assert.match(botWidget, /@media \(max-width: 520px\)[\s\S]*width: 76px;[\s\S]*min-height: 76px;[\s\S]*width: 66px;[\s\S]*height: 66px;/);

  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-JOIN-SHIR-CTA'));
  assert.ok(actions.has('ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT'));
  assert.ok(actions.has('ACTION-ONETIME-PUBLIC-MOBILE-MENU'));
  assert.ok(actions.has('ACTION-ONETIME-TEACHING-CAROUSEL-PREV'));
  assert.ok(actions.has('ACTION-ONETIME-TEACHING-CAROUSEL-NEXT'));
  assert.ok(actions.has('ACTION-ONETIME-TEACHING-CAROUSEL-PAUSE'));
  assert.ok(actions.has('ACTION-ONETIME-MEMBER-LOGIN-LINK'));
  for (const id of [
    'ACTION-ONETIME-TEACHING-CAROUSEL-PREV',
    'ACTION-ONETIME-TEACHING-CAROUSEL-NEXT',
    'ACTION-ONETIME-TEACHING-CAROUSEL-PAUSE',
  ]) {
    const action = actionRegistry.actions.find((entry) => entry.action_id === id);
    assert.equal(action.status, 'hidden_until_verified_assets');
    assert.match(action.disabled_reason, /verified approved teaching-location images/);
  }
  const joinAction = actionRegistry.actions.find((action) => action.action_id === 'ACTION-ONETIME-JOIN-SHIR-CTA');
  assert.match(joinAction.selector_hint, /\/one-time\/signup/);
  assert.match(joinAction.expected_behavior, /\/one-time\/signup/);
  const formAction = actionRegistry.actions.find((action) => action.action_id === 'ACTION-ONETIME-DIRECT-SIGNUP-SUBMIT');
  assert.equal(formAction.route, '/one-time/signup');
  assert.match(formAction.expected_behavior, /email/i);
  assert.match(formAction.expected_behavior, /CRM/i);
  assert.match(formAction.expected_behavior, /Rabbi Telegram/i);
  assert.match(formAction.expected_behavior, /no student name/i);
  assert.match(formAction.expected_behavior, /does not create checkout|no checkout/i);
});
