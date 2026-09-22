const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const coverage = JSON.parse(fs.readFileSync('ops/action-registry/one-time-action-coverage.json', 'utf8'));
const markdown = fs.readFileSync('ops/action-registry/one-time-action-coverage.md', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const server = fs.readFileSync('server.js', 'utf8');

const REQUIRED_FIELDS = [
  'page_module',
  'control_label',
  'action_key',
  'status',
  'client_handler',
  'required_role',
  'workspace_scope',
  'confirmation_level',
  'success_state',
  'error_state',
  'test',
];

const REQUIRED_LABELS = [
  'Add Member',
  'Invite User',
  'Assign Role',
  'Add Class',
  'Add Session',
  'Add Appointment',
  'Add Task',
  'Create Decision',
  'Create Draft',
  'Configure Integration',
  'Test Connection',
  'Preview Upload',
  'Attach Vimeo Video',
  'Approve',
  'Publish',
  'Unpublish',
  'Archive',
  'Restore',
  'Retry',
  'View Evidence',
];

function routeRegex(endpoint) {
  return new RegExp(
    String(endpoint)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[A-Za-z_][A-Za-z0-9_]*/g, ':[A-Za-z_][A-Za-z0-9_]*'),
  );
}

function assertServerEndpoint(endpoint, method) {
  if (!endpoint || method === 'client') return;
  if (endpoint.includes(' or ')) {
    for (const part of endpoint.split(/\s+or\s+/)) assertServerEndpoint(part.trim(), method);
    return;
  }
  if (endpoint.startsWith('/api/google/')) {
    assert.match(server, routeRegex(endpoint), `server should expose ${endpoint}`);
    return;
  }
  assert.match(server, routeRegex(endpoint), `server should expose ${endpoint}`);
}

test('One Time action coverage artifact has complete metadata', () => {
  assert.equal(coverage.workspace_key, 'rabbi_sheller_provider');
  assert.equal(coverage.project_key, 'one_time_mishnah_class');
  assert.ok(Array.isArray(coverage.controls));
  assert.ok(coverage.controls.length >= 20);

  const actionKeys = new Set();
  for (const row of coverage.controls) {
    for (const field of REQUIRED_FIELDS) {
      assert.ok(String(row[field] ?? '').trim(), `${row.action_key || row.control_label} missing ${field}`);
    }
    assert.ok(!actionKeys.has(row.action_key), `duplicate action key ${row.action_key}`);
    actionKeys.add(row.action_key);
    assert.ok(['working', 'working_gated', 'setup_path', 'disabled_blocker', 'informational'].includes(row.status), `${row.action_key} has invalid status`);
    if (row.status.includes('gated') || row.status === 'setup_path' || row.status === 'disabled_blocker') {
      assert.ok(String(row.disabled_reason || '').trim(), `${row.action_key} needs a disabled/blocker reason`);
    }
  }
});

test('required visible action labels are present in Operations and coverage', () => {
  const coverageText = `${markdown}\n${JSON.stringify(coverage)}`;
  for (const label of REQUIRED_LABELS) {
    assert.match(coverageText, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${label} missing from coverage`);
    assert.match(operations, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${label} missing from Operations UI`);
  }
});

test('covered controls map to visible handlers and server endpoints', () => {
  for (const row of coverage.controls) {
    for (const handler of String(row.client_handler).split('/').flatMap((part) => part.split('->'))) {
      const name = handler.trim().split(/\s+/)[0];
      if (!name || ['client'].includes(name)) continue;
      assert.match(operations, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${row.action_key} handler ${name} missing from Operations`);
    }
    assertServerEndpoint(row.api_endpoint, row.http_method);
  }
});

test('Operations has no generic dead-button placeholders except scoped workspace denial', () => {
  const calls = [...operations.matchAll(/showNotConfigured\(/g)].length;
  const functionDefinitions = [...operations.matchAll(/function\s+showNotConfigured\(/g)].length;
  assert.equal(calls - functionDefinitions, 1);
  assert.match(operations, /showNotConfigured\('This login cannot switch into/);
  assert.doesNotMatch(operations, /showNotConfigured\('Provider website import'\)/);
  assert.doesNotMatch(operations, /showNotConfigured\('Settings test action'\)/);
  assert.doesNotMatch(operations, /showNotConfigured\('Settings reset action'\)/);
  assert.doesNotMatch(operations, /showNotConfigured\('Help center'\)/);
});

test('external-write controls stay approval-gated or setup-only', () => {
  const risky = coverage.controls.filter((row) => /publish|vimeo|upload|appointment|retry|integration|draft/i.test(`${row.action_key} ${row.control_label}`));
  assert.ok(risky.length >= 8);
  for (const row of risky) {
    const text = `${row.confirmation_level} ${row.disabled_reason} ${row.success_state}`.toLowerCase();
    assert.match(text, /no |gated|requires|setup|preview|draft|read-only|manual|approval/, `${row.action_key} needs an explicit gate`);
  }
  assert.match(coverage.policy, /External writes stay gated/);
});
