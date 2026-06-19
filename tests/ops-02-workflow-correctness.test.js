const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('OPS-02 keeps generic signups out of Service Providers primary lanes', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /const signupCards = signups\.map\(signup => \(\{/);
  assert.match(operations, /workspace_key: 'bna'/);
  assert.match(operations, /pipeline_key: 'bna_enrollment'/);
  assert.match(operations, /Provider Leads \/ Participants/);
  assert.match(operations, /Provider-specific lead and signup tracking/);
});

test('OPS-02 workspace directory uses the approved top-level display categories', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /label: 'Super Admin'/);
  assert.match(operations, /label: 'School'/);
  assert.match(operations, /\{ id: 'service_provider', label: 'Service Provider'/);
  assert.match(operations, /\{ id: 'family', label: 'Family'/);
  assert.match(operations, /Choose a workspace type, then choose the specific workspace/);
  assert.doesNotMatch(operations, /Family App \/ Home Accountability/);
});

test('OPS-02 provider 7pm class is a first-class schedule object, not a placeholder', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /function rabbiSchellerSevenPmProgramEvent/);
  assert.match(operations, /Rabbi Scheller's 7pm Mishnayos class/);
  assert.match(operations, /related_type: 'provider_program'/);
  assert.match(operations, /owner_name: 'Rabbi Elie Scheller'/);
  assert.match(operations, /project_name: 'One Time Mishnah Class'/);
  assert.match(operations, /timezone: 'Asia\/Jerusalem'/);
  assert.match(operations, /source_notes/);
  assert.doesNotMatch(operations, /Provider schedule placeholder/);
});

test('OPS-02 decision comments visibly report comment/reprocess status', () => {
  const operations = read('public/operations.html');
  const server = read('server.js');

  assert.match(operations, /let taskWorkflowNotice = ''/);
  assert.match(operations, /request_reprocess: true/);
  assert.match(operations, /decisionEvent\.message/);
  assert.match(operations, /Status: \$\{decisionStatusLabel/);
  assert.match(server, /explicitNoReprocess/);
  assert.match(server, /decision_status: 'comment_added'/);
  assert.match(server, /Decision comment saved\. Reprocess was not requested\./);
});
