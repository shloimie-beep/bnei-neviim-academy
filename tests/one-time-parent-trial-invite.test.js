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
  assert.match(subject, /30-day trial starts now/);

  const body = rabbiTemplateBody('parent_trial_invite', {
    programName: 'OneTimeOneTime Mishnah',
    recipientName: 'Parent',
    studentName: 'TEST Student',
    passwordSetupUrl: 'https://join.onetimeonetime.com/one-time-parent?reset=token',
    liveClassUrl: 'https://zoom.us/j/123456789',
    memberLibraryUrl: 'https://join.onetimeonetime.com/member-library?code=OT-test',
    classroomUrl: 'https://join.onetimeonetime.com/one-time-classroom?code=OT-test',
  });
  assert.match(body, /Welcome to OneTimeOneTime Mishnah/);
  assert.match(body, /Your 30-day trial starts now/);
  assert.match(body, /Set your parent password here/);
  assert.match(body, /Tonight's live shiur Zoom link/);
  assert.match(body, /Open the class library here/);
  assert.match(body, /Open the classroom here/);
  assert.match(body, /set or reset the student login/);
  assert.doesNotMatch(body, /Academy|bneineviimacademy/i);

  const template = buildRabbiEmailTemplate('parent_trial_invite', {
    programName: 'OneTimeOneTime Mishnah',
    recipientName: 'Parent',
    passwordSetupUrl: 'https://join.onetimeonetime.com/one-time-parent?reset=token',
  });
  assert.match(template.html, /Set your parent password here/);
});

test('admin parent trial invite route is explicit, test-labeled, and non-payment', () => {
  const routeStart = server.indexOf("app.post('/api/bna/one-time/parent-trial-invite'");
  const routeEnd = server.indexOf("app.get('/api/bna/rabbi/site'", routeStart);
  const route = server.slice(routeStart, routeEnd);

  assert.match(server, /ONE_TIME_PARENT_TRIAL_INVITE_CONFIRM = 'SEND_ONE_TIME_PARENT_TRIAL_INVITE'/);
  assert.match(server, /app\.post\('\/api\/bna\/one-time\/parent-trial-invite', requireAdmin/);
  assert.match(server, /assertRabbiAdminAccess\(req\)/);
  assert.match(server, /one-time-parent-trial/);
  assert.match(server, /createParentPasswordResetToken\(\{[\s\S]*sendEmail: false/);
  assert.match(server, /buildRabbiEmailTemplate\('parent_trial_invite'/);
  assert.match(server, /function configuredOneTimePublicBaseUrl/);
  assert.match(route, /const oneTimeBaseUrl = configuredOneTimePublicBaseUrl\(\)/);
  assert.match(route, /oneTimeParentPortalPasswordResetUrl\(reset\.token\)/);
  assert.match(route, /ttlMs: ONE_TIME_PARENT_TRIAL_PASSWORD_SETUP_TTL_MS/);
  assert.match(route, /parent_portal: scopedPublicUrl\(oneTimeBaseUrl, '\/one-time-parent'\)/);
  assert.match(route, /liveClassUrl/);
  assert.doesNotMatch(route, /requestBaseUrl\(req\)/);
  assert.doesNotMatch(route, /Bnei Neviim Academy|bneineviimacademy\.org/);
  assert.match(server, /function oneTimeParentPortalPasswordResetUrl\(token\)[\s\S]*\/one-time-parent\?reset=/);
  assert.doesNotMatch(server, /scopedPublicUrl\(configuredOneTimePublicBaseUrl\(\), `\/parent\?reset=/);
  assert.match(server, /app\.get\('\/one-time-parent'/);
  assert.match(server, /one_time_member_access/);
  assert.match(server, /no_payment_created: true/);
  assert.match(server, /no_checkout_created: true/);
  assert.doesNotMatch(server, /parent_trial_invite[\s\S]{0,2000}createStripeCheckout/);
});

test('One Time parent setup page is isolated from Academy parent portal branding', () => {
  const setupPage = fs.readFileSync('public/one-time-parent.html', 'utf8');
  const routeRegistry = fs.readFileSync('ops/route-registry.json', 'utf8');
  const actionRegistry = fs.readFileSync('ops/action-registry.json', 'utf8');

  assert.match(setupPage, /OneTimeOneTime Parent Setup/);
  assert.match(setupPage, /id="passwordForm"/);
  assert.match(setupPage, /\/api\/parent-portal\/password\/reset/);
  assert.match(setupPage, /\/one-time-classroom/);
  assert.match(setupPage, /\/member-library/);
  assert.match(setupPage, /replaceState\(null, '', '\/one-time-parent\?ready=1'\)/);
  assert.doesNotMatch(setupPage, /\bBNA\b|Bnei Neviim|Academy|bneineviimacademy/i);

  assert.match(routeRegistry, /"route": "\/one-time-parent"/);
  assert.match(actionRegistry, /ACTION-ONETIME-PARENT-PASSWORD-SET/);
});
