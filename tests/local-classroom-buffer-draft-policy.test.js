const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');

test('Operations inline scripts compile after classroom and approval-copy updates', () => {
  const scripts = [...operations.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  assert.ok(scripts.length >= 2, 'Operations should include inline scripts to compile');
  scripts.forEach((script, index) => {
    assert.doesNotThrow(() => new vm.Script(script), `inline script ${index + 1} should parse`);
  });
});

test('Operations presents a first-party Classroom layout without requiring Google Classroom', () => {
  assert.match(operations, /data-local-classroom-first/);
  assert.match(operations, /Local classroom first/);
  assert.match(operations, /Stream/);
  assert.match(operations, /Classwork/);
  assert.match(operations, /People/);
  assert.match(operations, /Calendar/);
  assert.match(operations, /Review/);
  assert.match(operations, /does not require Google Classroom OAuth/);
  assert.match(operations, /Google optional and gated/);
  assert.match(operations, /Email manual\/current path/);
  assert.match(operations, /Resend campaigns off/);
});

test('assignment API exposes project metadata for BNA and One Time classroom scoping', () => {
  assert.match(server, /p\.project_key/);
  assert.match(server, /p\.name AS project_name/);
  assert.match(server, /p\.short_name AS project_short_name/);
  assert.match(server, /LEFT JOIN bna_projects p ON p\.id = a\.project_id/);
  assert.match(operations, /function assignmentProjectKey/);
  assert.match(operations, /function assignmentProjectLabel/);
  assert.match(operations, /project_key: currentWorkspaceKey\(\) === 'rabbi_sheller_provider' \? 'one_time_mishnah_class' : 'bna'/);
});

test('One Time classroom handoff routes Rabbi materials through first-party review gates', () => {
  assert.match(operations, /data-one-time-classroom-flow/);
  assert.match(operations, /Local One Time Classroom/);
  assert.match(operations, /Rabbi Elie Scheller \/ One Time/);
  assert.match(operations, /class sessions, assignments\/materials, source sheets, worksheets, recordings, questions, and content outputs/);
  assert.match(operations, /Content parsing enabled/);
  assert.match(operations, /Member-library publishing, public Q&A, notifications, rewards, and leaderboards stay behind the approval gates already created/);
  assert.match(operations, /Buffer draft-only/);
  assert.match(operations, /No auto-publish/);
  assert.match(operations, /No Resend or mass email required/);
});

test('Buffer social content approval is draft-only and records blocked publish intent', () => {
  const routeStart = server.indexOf("app.post('/api/bna/content-outputs/:id/actions'");
  const routeEnd = server.indexOf("app.get('/api/bna/buffer/diagnostics'", routeStart);
  assert.ok(routeStart > 0, 'content output action route should exist');
  assert.ok(routeEnd > routeStart, 'buffer diagnostics route should follow content output action route');
  const route = server.slice(routeStart, routeEnd);

  assert.match(server, /const requestedPublishNow = Boolean\(options\.publishNow\);[\s\S]*const publishNow = false;/);
  assert.match(route, /const requestedPublishNow = hasPublishOverride/);
  assert.match(route, /const publishNow = false;/);
  assert.match(route, /metadata\.buffer_draft_only_policy = true/);
  assert.match(route, /metadata\.buffer_publish_blocked_by_policy = true/);
  assert.match(route, /metadata\.buffer_publish_mode = 'draft'/);
  assert.match(route, /metadata\.buffer_requested_publish_now = requestedPublishNow/);
  assert.match(route, /const marksExternalPublish = output\.output_type === 'blog_draft'/);
  assert.doesNotMatch(route, /metadata\.buffer_post_published_at/);
  assert.doesNotMatch(route, /buffer_publish_mode = publishNow \? 'published' : 'draft'/);
});
