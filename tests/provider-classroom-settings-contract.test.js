const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const operations = fs.readFileSync('public/operations.html', 'utf8');
const provider = fs.readFileSync('public/provider.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

test('provider portal exposes natural-language classroom setup drafts', () => {
  assert.match(provider, /data-provider-section="class_setup"/);
  assert.match(provider, /data-provider-classroom-setup/);
  assert.match(provider, /data-provider-natural-language-classroom/);
  assert.match(provider, /classroomDraftForm/);
  assert.match(provider, /\/api\/provider-portal\/classroom-drafts/);
  assert.match(provider, /Preview No-Write/);
  assert.match(provider, /student_to_teacher_replies/);
  assert.match(provider, /teacher_moderation_required/);
  assert.match(provider, /student_to_student_chat_enabled: false/);
  assert.match(server, /app\.post\('\/api\/provider-portal\/classroom-drafts'/);
  assert.match(server, /provider-portal-classroom-draft/);
  assert.match(server, /task_kind: 'provider_classroom_draft'/);
  assert.match(server, /no_google_classroom_write/);
  assert.match(server, /no_payment_or_access_grant/);
});

test('Operations Provider Index settings are reorganized into five provider groups', () => {
  assert.match(operations, /data-provider-index-settings-map/);
  assert.match(operations, /Public Provider Index/);
  assert.match(operations, /Provider Plans/);
  assert.match(operations, /Provider Entitlements/);
  assert.match(operations, /Provider Onboarding/);
  assert.match(operations, /Commercial Models/);
  assert.match(operations, /Free for now/);
  assert.match(operations, /data-provider-plans-free-for-now/);
  assert.match(operations, /data-provider-classroom-setup-settings/);
  assert.match(operations, /data-provider-natural-language-classroom-draft/);
  assert.match(operations, /create_provider_classroom_draft/);
});

test('Rabbi classroom layout documents private replies and publish controls', () => {
  assert.match(operations, /data-community-classroom-mobile-layout/);
  assert.match(operations, /data-rabbi-classroom-reply-publish-rules/);
  assert.match(operations, /Class list/);
  assert.match(operations, /Student\/member list/);
  assert.match(operations, /Teacher posts/);
  assert.match(operations, /Student questions\/replies/);
  assert.match(operations, /No student-student chat/);
  assert.match(operations, /Display \/ publish controls/);
  assert.match(operations, /Students can reply privately to Rabbi\/admin threads/);
  assert.match(operations, /public\/community display/);
});

test('provider and Operations inline scripts parse after classroom setup changes', () => {
  for (const [name, html] of [['provider', provider], ['operations', operations]]) {
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => match[1].trim())
      .filter(Boolean);
    assert.ok(scripts.length >= 1, `${name} should include inline scripts`);
    scripts.forEach((script, index) => {
      assert.doesNotThrow(() => new vm.Script(script), `${name} inline script ${index + 1} should parse`);
    });
  }
});
