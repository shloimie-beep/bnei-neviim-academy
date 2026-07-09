const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {
  rabbiTemplateSubject,
  rabbiTemplateBody,
  buildRabbiEmailTemplate,
} = require('../src/lib/bna/rabbi-emails');

const server = fs.readFileSync('server.js', 'utf8');

test('One Time parent trial invite has scoped email copy and setup links', () => {
  const subject = rabbiTemplateSubject('parent_trial_invite', { programName: 'OneTimeOneTime Mishnah' });
  assert.match(subject, /30-day access is ready/);

  const body = rabbiTemplateBody('parent_trial_invite', {
    programName: 'OneTimeOneTime Mishnah',
    recipientName: 'Parent',
    studentName: 'Live Student',
    passwordSetupUrl: 'https://join.onetimeonetime.com/one-time-parent?reset=token',
    liveClassUrl: 'https://zoom.us/j/123456789',
    memberLibraryUrl: 'https://join.onetimeonetime.com/member-library?code=OT-live',
    classroomUrl: 'https://join.onetimeonetime.com/one-time-classroom?code=OT-live',
  });
  assert.match(body, /Welcome to OneTimeOneTime Mishnah/);
  assert.match(body, /I am glad to have Live Student join/);
  assert.match(body, /Your 30-day access is ready/);
  assert.match(body, /Set your parent password here/);
  assert.match(body, /Tonight's live shiur/);
  assert.match(body, /Classroom, schedule, and worksheets/);
  assert.match(body, /Video library and review materials/);
  assert.match(body, /Looking forward to learning together/);
  assert.doesNotMatch(body, /Academy|bneineviimacademy|TEST|codex/i);

  const template = buildRabbiEmailTemplate('parent_trial_invite', {
    programName: 'OneTimeOneTime Mishnah',
    recipientName: 'Parent',
    passwordSetupUrl: 'https://join.onetimeonetime.com/one-time-parent?reset=token',
  });
  assert.match(template.html, /Set your parent password here/);
});

test('admin parent trial invite route is launch-ready by default and smoke-labeled only when requested', () => {
  const routeStart = server.indexOf("app.post('/api/bna/one-time/parent-trial-invite'");
  const routeEnd = server.indexOf("app.get('/api/bna/rabbi/site'", routeStart);
  const route = server.slice(routeStart, routeEnd);

  assert.match(server, /ONE_TIME_PARENT_TRIAL_INVITE_CONFIRM = 'SEND_ONE_TIME_PARENT_TRIAL_INVITE'/);
  assert.match(server, /app\.post\('\/api\/bna\/one-time\/parent-trial-invite', requireAdmin/);
  assert.match(server, /assertRabbiAdminAccess\(req\)/);
  assert.match(server, /one-time-parent-trial/);
  assert.match(server, /function oneTimeParentTrialInvitePreflight/);
  assert.match(server, /function configuredOneTimeLiveClassUrl/);
  assert.match(server, /ONE_TIME_ZOOM_JOIN_URL/);
  assert.match(server, /ONE_TIME_LIVE_CLASS_URL/);
  assert.match(server, /missing_student_name/);
  assert.match(server, /missing_live_class_url/);
  assert.match(route, /preflight\.blocker_codes\.includes\('invalid_live_class_url'\)/);
  assert.match(route, /One Time parent trial invite is not launch-ready/);
  assert.match(route, /configuredOneTimeLiveClassUrl\(\)/);
  assert.match(route, /preflight,\s*[\r\n\s]*preview/);
  assert.match(server, /createParentPasswordResetToken\(\{[\s\S]*sendEmail: false/);
  assert.match(server, /buildRabbiEmailTemplate\('parent_trial_invite'/);
  assert.match(server, /function configuredOneTimePublicBaseUrl/);
  assert.match(route, /const oneTimeBaseUrl = configuredOneTimePublicBaseUrl\(\)/);
  assert.match(route, /oneTimeParentPortalPasswordResetUrl\(reset\.token\)/);
  assert.match(route, /ttlMs: ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS/);
  assert.match(route, /parent_portal: scopedPublicUrl\(oneTimeBaseUrl, '\/one-time-parent'\)/);
  assert.match(route, /liveClassUrl/);
  assert.match(route, /inviteMode = smokeMode \? 'smoke_test' : 'production'/);
  assert.match(route, /test_labeled: smokeMode/);
  assert.match(route, /one-time-live-invite/);
  assert.match(route, /createRabbiAccessGrant/);
  assert.match(route, /tier_key: 'live_library'/);
  assert.doesNotMatch(route, /requestBaseUrl\(req\)/);
  assert.doesNotMatch(route, /TEST One Time Student/);
  assert.doesNotMatch(route, /Bnei Neviim Academy|bneineviimacademy\.org/);
  assert.match(server, /function oneTimeParentPortalPasswordResetUrl\(token\)[\s\S]*\/one-time-parent\?reset=/);
  assert.match(server, /function formatDurationForEmail\(ttlMs\)/);
  assert.match(server, /This link stays active for \$\{expiresIn\}/);
  assert.doesNotMatch(server, /scopedPublicUrl\(configuredOneTimePublicBaseUrl\(\), `\/parent\?reset=/);
  assert.match(server, /app\.get\('\/one-time-parent'/);
  assert.match(server, /one_time_member_access/);
  assert.match(server, /no_payment_created: true/);
  assert.match(server, /no_checkout_created: true/);
  assert.match(server, /app\.post\('\/api\/one-time\/parent-password\/request'/);
  assert.match(server, /sendOneTimeParentPasswordResetEmail/);
  assert.match(server, /oneTimeParentPasswordResetEligible/);
  assert.match(server, /one_time_parent_password_request[\s\S]*ttlMs: ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS/);
  assert.doesNotMatch(server, /parent_trial_invite[\s\S]{0,2000}createStripeCheckout/);
});

test('One Time parent setup page is isolated from Academy parent portal branding', () => {
  const setupPage = fs.readFileSync('public/one-time-parent.html', 'utf8');
  const routeRegistry = fs.readFileSync('ops/route-registry.json', 'utf8');
  const actionRegistry = fs.readFileSync('ops/action-registry.json', 'utf8');

  assert.match(setupPage, /OneTimeOneTime Parent Setup/);
  assert.match(setupPage, /id="passwordForm"/);
  assert.match(setupPage, /id="forgotForm"/);
  assert.match(setupPage, /\.intro\s*\{[\s\S]*min-width: 0;[\s\S]*overflow: hidden;/);
  assert.match(setupPage, /h1\s*\{[\s\S]*font-size: clamp\(2rem, 3\.75vw, 3\.35rem\);[\s\S]*overflow-wrap: normal;/);
  assert.match(setupPage, /\/api\/one-time\/parent-password\/request/);
  assert.match(setupPage, /\/api\/parent-portal\/password\/reset/);
  assert.match(setupPage, /Email me a new password link/);
  assert.match(setupPage, /parents can reset a child's password/);
  assert.match(setupPage, /replaceState\(null, '', '\/one-time-parent\?ready=1'\)/);
  assert.doesNotMatch(setupPage, /\bBNA\b|Bnei Neviim|Academy|bneineviimacademy/i);
  assert.doesNotMatch(setupPage, /recovery code|classroom password/i);
  assert.doesNotMatch(setupPage, /href="\/"/);
  assert.doesNotMatch(setupPage, /href="\/one-time(?:[?#"])/);

  assert.match(routeRegistry, /"route": "\/one-time-parent"/);
  assert.match(actionRegistry, /ACTION-ONETIME-PARENT-PASSWORD-SET/);
});
