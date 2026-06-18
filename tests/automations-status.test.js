const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Automations status endpoint is read-only and workspace scoped', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/automations\/status', requireAdmin, async \(req, res\) => \{/);
  assert.doesNotMatch(server, /app\.post\('\/api\/bna\/automations\/status'/);
  assert.match(server, /const scopedProjectKey = opsScopeProjectKey\(req\);/);
  assert.match(server, /const requestedProjectKey = req\.query\.project && req\.query\.project !== 'all'/);
  assert.match(server, /const scopes = await automationWorkspaceScopes\(projectKey\);/);
  assert.match(server, /readGoogleDrivePipelineConfig\(\)/);
  assert.match(server, /configuredDriveFolderId\(driveConfig, scope\.project_key, '01 Raw Intake'\)/);
});

test('Automations status payload exposes owner, run timing, failures, and workspace labels', () => {
  const server = read('server.js');

  assert.match(server, /function automationBase\(\{ scope, automationKey, title, owner, status, lastRunAt = null, nextRunAt = null, failureReason = null/);
  assert.match(server, /owner,/);
  assert.match(server, /workspace_label: automationWorkspaceLabel\(scope\)/);
  assert.match(server, /last_run_at: lastRunAt/);
  assert.match(server, /next_run_at: nextRunAt/);
  assert.match(server, /failure_reason: failureReason/);
});

test('Automations status covers the active operational automation lanes', () => {
  const server = read('server.js');

  assert.match(server, /automationKey: 'payment_reminders'/);
  assert.match(server, /FROM signups s/);
  assert.match(server, /automationKey: 'green_invoice_webhooks'/);
  assert.match(server, /FROM bna_green_invoice_webhook_log l/);
  assert.match(server, /automationKey: 'content_drive_intake'/);
  assert.match(server, /FROM bna_content_jobs j/);
  assert.match(server, /automationKey: 'codex_task_automation'/);
  assert.match(server, /FROM bna_tasks t/);
});

test('Operations UI loads and renders scoped automation status', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /getAutomations\(filters = \{\}\)/);
  assert.match(operations, /return this\.request\('GET', '\/automations\/status' \+ \(params\.toString\(\) \? '\?' \+ params\.toString\(\) : ''\)\);/);
  assert.match(operations, /let automationStatuses = \[\];/);
  assert.match(operations, /id: 'automations', label: 'Automations'/);
  assert.match(operations, /viewAllowed\('automations'\) \? api\.getAutomations\(\{ project: selectedProjectFilter\(\) \|\| undefined \}\) : Promise\.resolve\(\{ automations: \[\] \}\)/);
  assert.match(operations, /case 'automations': content = renderAutomations\(\); break;/);
  assert.match(operations, /function renderAutomations\(\) \{/);
  assert.match(operations, /function renderAutomationCard\(item\) \{/);
  assert.match(operations, /renderContactDetailItem\('Owner', item\.owner \|\| 'Unassigned'\)/);
  assert.match(operations, /renderContactDetailItem\('Last Run', lastRun\)/);
  assert.match(operations, /renderContactDetailItem\('Next Run', nextRun\)/);
  assert.match(operations, /item\.failure_reason/);
});

