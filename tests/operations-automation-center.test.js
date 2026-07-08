const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const migration = fs.readFileSync('railway-migration-2026-06-15-automation-center.sql', 'utf8');

test('Automation Center schema, seed, and API routes are registered', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_automations/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS bna_automation_runs/);
  assert.match(server, /const DEFAULT_AUTOMATION_REGISTRY = \[/);
  assert.match(server, /async function seedDefaultAutomations/);
  assert.match(server, /await seedDefaultAutomations\(\)/);
  assert.match(server, /app\.get\('\/api\/bna\/automations', requireAdmin/);
  assert.match(server, /app\.get\('\/api\/bna\/automations\/:id', requireAdmin/);
  assert.match(server, /app\.patch\('\/api\/bna\/automations\/:id', requireAdmin/);
  assert.match(server, /Scoped Operations users can read automation metadata but cannot edit it/);
});

test('Automation Center migration is non-destructive and seeds the initial registry', () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_automations/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS bna_automation_runs/);
  assert.match(migration, /ON CONFLICT \(automation_key\) DO UPDATE SET/);
  assert.match(migration, /codex_agent_queue/);
  assert.match(migration, /telegram_sidekick_router/);
  assert.match(migration, /one_time_question_private_digest/);
});

test('Automation Center is a first-class Operations view with compact registry UI', () => {
  assert.match(operations, /getAutomations\(filters = \{\}\)/);
  assert.match(operations, /updateAutomation\(id, payload = \{\}\)/);
  assert.match(operations, /const AUTOMATION_SUBTABS = \[/);
  assert.match(operations, /automations: \(\) => \(\{ tabs: AUTOMATION_SUBTABS/);
  assert.match(operations, /case 'automations': content = renderAutomationCenter\(\); break;/);
  assert.match(operations, /needsAutomationData \? api\.getAutomations\(workspaceDataFilters\)/);
  assert.match(operations, /function renderAutomationCenter\(\)/);
  assert.match(operations, /class="automation-row-head"/);
  assert.match(operations, /class="automation-filter-row"/);
  assert.match(operations, /function renderAutomationDetailPanel/);
  assert.match(operations, /function saveAutomationMetadata/);
});

test('Automation Center keeps execution controls out of the metadata surface', () => {
  const centerStart = operations.indexOf('function renderAutomationCenter()');
  const centerEnd = operations.indexOf('function renderTasks()', centerStart);
  assert.ok(centerStart > -1 && centerEnd > centerStart);
  const centerCode = operations.slice(centerStart, centerEnd);
  assert.doesNotMatch(centerCode, /runAutomation/i);
  assert.doesNotMatch(centerCode, /enableAutomation/i);
  assert.doesNotMatch(centerCode, /executeAutomation/i);
});
