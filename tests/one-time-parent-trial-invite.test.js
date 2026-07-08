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
  const subject = rabbiTemplateSubject('parent_trial_invite', { programName: 'One Time Mishnayos' });
  assert.match(subject, /30-day trial starts now/);

  const body = rabbiTemplateBody('parent_trial_invite', {
    recipientName: 'Parent',
    studentName: 'TEST Student',
    passwordSetupUrl: 'https://example.test/parent?reset=token',
    memberLibraryUrl: 'https://example.test/member-library?code=OT-test',
    classroomUrl: 'https://example.test/one-time-classroom?code=OT-test',
  });
  assert.match(body, /Welcome to One Time Mishnayos/);
  assert.match(body, /Your 30-day trial starts now/);
  assert.match(body, /Set your parent password here/);
  assert.match(body, /Open the class library here/);
  assert.match(body, /Open the classroom here/);
  assert.match(body, /set or reset the student login/);

  const template = buildRabbiEmailTemplate('parent_trial_invite', {
    recipientName: 'Parent',
    passwordSetupUrl: 'https://example.test/parent?reset=token',
  });
  assert.match(template.html, /Set your parent password here/);
});

test('admin parent trial invite route is explicit, test-labeled, and non-payment', () => {
  assert.match(server, /ONE_TIME_PARENT_TRIAL_INVITE_CONFIRM = 'SEND_ONE_TIME_PARENT_TRIAL_INVITE'/);
  assert.match(server, /app\.post\('\/api\/bna\/one-time\/parent-trial-invite', requireAdmin/);
  assert.match(server, /assertRabbiAdminAccess\(req\)/);
  assert.match(server, /one-time-parent-trial/);
  assert.match(server, /createParentPasswordResetToken\(\{[\s\S]*sendEmail: false/);
  assert.match(server, /buildRabbiEmailTemplate\('parent_trial_invite'/);
  assert.match(server, /one_time_member_access/);
  assert.match(server, /no_payment_created: true/);
  assert.match(server, /no_checkout_created: true/);
  assert.doesNotMatch(server, /parent_trial_invite[\s\S]{0,2000}createStripeCheckout/);
});
