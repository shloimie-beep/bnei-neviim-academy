const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('OneTime focused landing copy uses current Mishnayos offer and safe CTA', () => {
  const html = fs.readFileSync('public/one-time/index.html', 'utf8');

  assert.match(html, /Worldwide OneTime Mishnayos/);
  assert.match(html, /Start 30 Days Free/);
  assert.match(html, /30 days free/i);
  assert.match(html, /No card, no checkout/);
  assert.match(html, /\$67\/month planned/);
  assert.match(html, /Watch Rabbi Video/);
  assert.match(html, /What Your Child Gets/);
  assert.match(html, /Private questions to Rabbi/);
  assert.match(html, /Parent progress basics/);
  assert.match(html, /Attendance v1 is automatic class-link click tracking/);
  assert.match(html, /How It Works/);
  assert.match(html, /FAQ/);
  assert.match(html, /Start the Mishnayos class free for 30 days/);
  assert.match(html, /name="timezone"/);
  assert.match(html, /name="question_topic"/);
  assert.match(html, /name="utm_source"/);
  assert.match(html, /name="utm_medium"/);
  assert.match(html, /name="utm_campaign"/);
  assert.match(html, /free_mishnayos_class/);
  assert.match(html, /campaign_url/);
  assert.match(html, /join\.onetimeonetime\.com/);
  assert.match(html, /sends only your signup confirmation email/);
  assert.match(html, /does not create a checkout, collect a card, send WhatsApp, contact imported lists, or write to an external CRM/);
  assert.match(html, /No payment, checkout, WhatsApp, imported-list email, campaign send, or external CRM write is approved by this form/);
  assert.match(html, /signup_flow: 'no_card_30_day_trial'/);
  assert.match(html, /trial_signup/);
  assert.doesNotMatch(html, /Academy\s*&\s*Hotline/i);
  assert.doesNotMatch(html, /Academy and Hotline/i);
  assert.doesNotMatch(html, /zoom\.us|zoom\.com/i);
  assert.doesNotMatch(html, /\/api\/rabbi\/checkout/);
});

test('OneTime focused offer route and registries are declared', () => {
  const server = fs.readFileSync('server.js', 'utf8');
  const routeRegistry = JSON.parse(fs.readFileSync('ops/route-registry.json', 'utf8'));
  const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

  assert.match(server, /'\/one-time\/mishnayos'/);
  assert.match(server, /ONE_TIME_JOIN_HOSTS = new Set\(\['join\.onetimeonetime\.com'\]\)/);
  assert.match(server, /ONE_TIME_JOIN_LANDING_PATHS = new Set\(\[/);
  assert.match(server, /ONE_TIME_JOIN_MEMBER_PATHS = new Set\(\[/);
  assert.match(server, /function normalizedRequestHostname\(req\)/);
  assert.match(server, /function isOneTimeJoinHostRequest\(req\)/);
  assert.match(server, /function oneTimeJoinRouteKind\(req\)/);
  assert.match(server, /function sendOneTimeCampaignLanding\(req, res\)/);
  assert.match(server, /function sendOneTimeMemberEntry\(req, res\)/);
  assert.match(server, /res\.sendFile\(path\.join\(__dirname, 'public', 'one-time', 'index\.html'\)\)/);
  assert.match(server, /res\.sendFile\(path\.join\(__dirname, 'public', 'rabbi-member\.html'\)\)/);
  assert.doesNotMatch(server, /ONE_TIME_[A-Z_]*HOSTS = new Set\(\['onetimeonetime\.com'/);
  assert.match(server, /contact_tracking: contactTracking/);
  assert.match(server, /ensureOneTimeSignupScopedTracking/);
  assert.match(server, /trial_access: trialAccess/);
  assert.match(server, /ensureOneTimeTrialAccessGrant/);
  assert.ok(
    server.indexOf('function sendOneTimeCampaignLanding') < server.indexOf("app.use(express.static('public'"),
    'One Time campaign host gate must run before public static / serves BNA index.html',
  );

  const routes = new Set(routeRegistry.routes.map((route) => route.route));
  assert.ok(routes.has('/one-time'));
  assert.ok(routes.has('/one-time/mishnayos'));
  assert.ok(routes.has('https://join.onetimeonetime.com/'));
  assert.ok(routes.has('https://join.onetimeonetime.com/member-login'));
  assert.ok(routes.has('https://join.onetimeonetime.com/member'));

  const bnaRoot = routeRegistry.routes.find((route) => route.route === '/');
  assert.equal(bnaRoot.surface, 'public_site');
  assert.equal(bnaRoot.expected_logged_out_behavior, 'load_anonymous_public_homepage');

  const campaignRoot = routeRegistry.routes.find((route) => route.route === 'https://join.onetimeonetime.com/');
  assert.equal(campaignRoot.surface, 'one_time_public_campaign_root');
  assert.equal(campaignRoot.canonical_target, '/one-time');
  assert.deepEqual(campaignRoot.hostnames, ['join.onetimeonetime.com']);
  assert.match(campaignRoot.security_expectation, /no direct Zoom link/);
  assert.match(campaignRoot.security_expectation, /no private member\/classroom data/);
  assert.match(campaignRoot.security_expectation, /no DNS mutation/);
  assert.match(campaignRoot.security_expectation, /apex\/root onetimeonetime\.com remains untouched/);

  const memberLogin = routeRegistry.routes.find((route) => route.route === 'https://join.onetimeonetime.com/member-login');
  assert.equal(memberLogin.surface, 'one_time_member_login_alias');
  assert.equal(memberLogin.canonical_target, '/one-time/member-login');
  assert.match(memberLogin.security_expectation, /member entry only/);

  const memberClass = routeRegistry.routes.find((route) => route.route === 'https://join.onetimeonetime.com/member');
  assert.equal(memberClass.surface, 'one_time_member_class_dashboard_alias');
  assert.equal(memberClass.canonical_target, '/rabbi-member');
  assert.match(memberClass.security_expectation, /active member access/);

  const actions = new Set(actionRegistry.actions.map((action) => action.action_id));
  assert.ok(actions.has('ACTION-ONETIME-JOIN-SHIR-CTA'));
  assert.ok(actions.has('ACTION-ONETIME-INTEREST-FORM'));
  assert.ok(actions.has('ACTION-ONETIME-MEMBER-LOGIN-LINK'));

  const cta = actionRegistry.actions.find((action) => action.action_id === 'ACTION-ONETIME-JOIN-SHIR-CTA');
  assert.equal(cta.label, 'Start 30 Days Free');
  assert.match(cta.expected_behavior, /30-day free trial signup form/);

  const form = actionRegistry.actions.find((action) => action.action_id === 'ACTION-ONETIME-INTEREST-FORM');
  assert.equal(form.label, 'Start 30 Days Free');
  assert.match(form.expected_behavior, /first-party One Time trial-signup lead/);
  assert.match(form.expected_behavior, /at most one current-signup confirmation email/);
});
