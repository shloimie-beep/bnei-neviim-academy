const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const smokeScript = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'smoke-onetime-crm-journey-local-db.mjs'),
  'utf8'
);
const serverJs = fs.readFileSync(path.join(repoRoot, 'server.js'), 'utf8');
const operationsShell = fs.readFileSync(path.join(repoRoot, 'public', 'js', 'operations-shell.js'), 'utf8');

test('One Time CRM local DB smoke keeps Railway remote DB approval explicitly test-scoped', () => {
  assert.ok(smokeScript.includes('BNA_ALLOW_REMOTE_ONETIME_CRM_TEST_DB'));
  assert.ok(smokeScript.includes('BNA_ALLOW_RAILWAY_ONETIME_CRM_TEST_DB'));
  assert.ok(smokeScript.includes('BNA_ONETIME_CRM_TEST_RAILWAY_ENVIRONMENT'));
  assert.ok(smokeScript.includes('railway\\.internal'));
  assert.ok(smokeScript.includes('rlwy\\.net'));
  assert.ok(smokeScript.includes('test|local|staging|preview|qa'));
  assert.doesNotMatch(
    smokeScript,
    /allowRemoteTestDb\s*&&\s*railwayHost\s*&&\s*testLikeRailwayEnvironment/
  );
});

test('One Time CRM local DB smoke readiness probe fails fast instead of hanging', () => {
  assert.ok(smokeScript.includes('new AbortController()'));
  assert.ok(smokeScript.includes('controller.abort()'));
  assert.ok(smokeScript.includes('signal: controller.signal'));
});

test('One Time CRM local DB smoke waits for CRM schema bootstrap before seeding', () => {
  assert.ok(smokeScript.includes('function waitForRequiredSchema'));
  assert.ok(smokeScript.includes('bna_parent_leads'));
  assert.ok(smokeScript.includes('project_id'));
  assert.ok(smokeScript.includes('wait for required CRM schema bootstrap'));
  assert.ok(smokeScript.includes('cross-workspace CRM list does not leak seeded contact'));
  assert.ok(smokeScript.includes('Wrong-workspace CRM list leaked the seeded One Time contact.'));
  assert.ok(smokeScript.includes("$1, 'lead', $2, 'internal_note', 'internal_note'"));
});

test('fresh database bootstrap does not alter content jobs before that table exists', () => {
  const signupsBlock = serverJs.match(/const createSignupsTableSQL = `([\s\S]*?)`;/)?.[1] || '';
  const contentJobsBlock = serverJs.match(/const createContentJobsSQL = `([\s\S]*?)`;/)?.[1] || '';

  assert.doesNotMatch(signupsBlock, /bna_content_jobs/);
  assert.match(contentJobsBlock, /CREATE TABLE IF NOT EXISTS bna_content_jobs/);
  assert.match(contentJobsBlock, /project_id INTEGER REFERENCES bna_projects\(id\) ON DELETE SET NULL/);
});

test('One Time CRM mailbox button uses registered action and restores selected contact', () => {
  assert.ok(operationsShell.includes('data-action-id="ACTION-CRM-CONTACT-MAILBOX-OPEN"'));
  assert.ok(operationsShell.includes('openFirstPartyCrmMailbox('));
  assert.ok(operationsShell.includes("setItem?.('oneTimeSelectedCrmContactId'"));
});
