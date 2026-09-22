const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const {
  ASSISTANT_DATA_MODEL_TABLES,
} = require('../src/platform/assistant/control-plane');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

test('shared assistant data model declares every canonical table', () => {
  assert.deepEqual(ASSISTANT_DATA_MODEL_TABLES, [
    'assistant_channels',
    'assistant_identities',
    'assistant_conversations',
    'assistant_messages',
    'assistant_context_objects',
    'assistant_action_plans',
    'assistant_action_runs',
    'assistant_previews',
    'assistant_approvals',
    'assistant_drafts',
    'assistant_draft_versions',
    'assistant_templates',
    'assistant_saved_views',
    'assistant_reminders',
    'assistant_notifications',
    'assistant_onboarding_sessions',
    'assistant_delivery_outbox',
    'assistant_dead_letters',
  ]);

  for (const table of ASSISTANT_DATA_MODEL_TABLES) {
    assert.match(
      server,
      new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\(`),
      `${table} is bootstrapped idempotently`
    );
  }
});

test('assistant data model keeps channel metadata adapter-scoped', () => {
  assert.match(server, /CREATE TABLE IF NOT EXISTS assistant_channels \(/);
  assert.match(server, /channel_metadata JSONB DEFAULT '\{\}'::jsonb/);
  assert.match(server, /adapter_kind TEXT NOT NULL/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS assistant_conversations \(/);
  assert.match(server, /last_channel_key TEXT/);
  assert.match(server, /state JSONB DEFAULT '\{\}'::jsonb/);
  assert.match(server, /CREATE TABLE IF NOT EXISTS assistant_messages \(/);
  assert.match(server, /channel_message_id TEXT/);
  assert.match(server, /attachments JSONB DEFAULT '\[\]'::jsonb/);
});

test('assistant data model covers plans, previews, approvals, versions, reminders, and delivery recovery', () => {
  for (const marker of [
    'CREATE TABLE IF NOT EXISTS assistant_action_plans',
    'CREATE TABLE IF NOT EXISTS assistant_action_runs',
    'CREATE TABLE IF NOT EXISTS assistant_previews',
    'CREATE TABLE IF NOT EXISTS assistant_approvals',
    'CREATE TABLE IF NOT EXISTS assistant_drafts',
    'CREATE TABLE IF NOT EXISTS assistant_draft_versions',
    'CREATE TABLE IF NOT EXISTS assistant_templates',
    'CREATE TABLE IF NOT EXISTS assistant_saved_views',
    'CREATE TABLE IF NOT EXISTS assistant_reminders',
    'CREATE TABLE IF NOT EXISTS assistant_notifications',
    'CREATE TABLE IF NOT EXISTS assistant_onboarding_sessions',
    'CREATE TABLE IF NOT EXISTS assistant_delivery_outbox',
    'CREATE TABLE IF NOT EXISTS assistant_dead_letters',
  ]) {
    assert.match(server, new RegExp(marker));
  }

  assert.match(server, /idempotency_key TEXT/);
  assert.match(server, /approval_policy TEXT NOT NULL DEFAULT 'none'/);
  assert.match(server, /parent_version_key TEXT/);
  assert.match(server, /rollback_to_version_key TEXT/);
  assert.match(server, /quiet_hours JSONB DEFAULT '\{\}'::jsonb/);
  assert.match(server, /payload_redacted JSONB DEFAULT '\{\}'::jsonb/);
});

test('assistant data model adds indexes for status, scope, and replay queues', () => {
  for (const indexName of [
    'idx_assistant_identities_scope',
    'idx_assistant_conversations_scope',
    'idx_assistant_messages_conversation',
    'idx_assistant_action_plans_status',
    'idx_assistant_action_runs_status',
    'idx_assistant_approvals_status',
    'idx_assistant_reminders_status',
    'idx_assistant_delivery_outbox_status',
    'idx_assistant_dead_letters_status',
  ]) {
    assert.match(server, new RegExp(`CREATE INDEX IF NOT EXISTS ${indexName}`));
  }
});

test('assistant data model exposes a protected read-only readiness route', () => {
  assert.match(server, /app\.get\('\/api\/bna\/assistant\/control-plane\/readiness', requireAdmin/);
  assert.match(server, /read_only_information_schema_and_pg_indexes_queries_only/);
  assert.match(server, /no_assistant_rows_created_or_updated/);
  assert.match(server, /channel_metadata_adapter_scoped: true/);
  assert.match(server, /legacy_bna_assistant_tables_preserved: true/);
});
