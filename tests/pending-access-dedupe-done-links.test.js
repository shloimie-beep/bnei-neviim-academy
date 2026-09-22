const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('WS03 server exposes pending access dedupe and semantic actions', () => {
  const server = read('server.js');
  assert.match(server, /function normalizeDedupeText/);
  assert.match(server, /website landing page assets/);
  assert.match(server, /buildTaskDedupeFields/);
  assert.match(server, /findActiveTaskByDedupeKey/);
  assert.match(server, /actions\/request-missing-input/);
  assert.match(server, /actions\/mark-received/);
  assert.match(server, /actions\/archive-duplicate/);
  assert.match(server, /done_missing_link/);
  assert.match(server, /task-artifact/);
});

test('WS03 Operations UI renders pending actions and proof links', () => {
  const html = read('public/operations.html');
  assert.match(html, /Request missing input\/access/);
  assert.match(html, /Mark received/);
  assert.match(html, /Hide\/archive duplicate/);
  assert.match(html, /function renderTaskArtifactLinks/);
  assert.match(html, /Missing proof/);
  assert.match(html, /Add artifact\/proof link/);
});

test('WS03 migration and audit script cover dedupe and proof fields', () => {
  const migration = read('railway-migration-2026-06-15-pending-access-dedupe-done-links.sql');
  const audit = read('scripts/pending-access-dedupe-done-links-audit.mjs');
  assert.match(migration, /ADD COLUMN IF NOT EXISTS dedupe_key/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS workflow_status/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS artifact_links/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS done_link_status/);
  assert.match(audit, /APPLY_PENDING_ACCESS_DEDUPE/);
  assert.match(audit, /website landing page assets/);
  assert.match(audit, /duplicate_archived/);
});

test('WS03 agent fleet writes structured proof links on task completion', () => {
  const fleet = read('scripts/agent-fleet-supervisor.mjs');
  assert.match(fleet, /Agent fleet report/);
  assert.match(fleet, /artifact_links/);
  assert.match(fleet, /proof_links_json/);
  assert.match(fleet, /done_with_report/);
});
