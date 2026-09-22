const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildAssistantControlCenterSnapshot,
  registryCoverage,
} = require('../src/platform/assistant/control-center');

function fakeDb() {
  const queries = [];
  return {
    queries,
    async query(sql, params = []) {
      queries.push({ sql, params });
      assert.doesNotMatch(sql, /\b(insert|update|delete|truncate|drop|alter|create)\b/i);
      if (/GROUP BY 1/.test(sql)) {
        if (/assistant_approvals/.test(sql)) return { rows: [{ status: 'pending', count: 2 }] };
        if (/assistant_delivery_outbox/.test(sql)) return { rows: [{ status: 'failed', count: 1 }, { status: 'queued', count: 3 }] };
        if (/assistant_dead_letters/.test(sql)) return { rows: [{ status: 'open', count: 1 }] };
        return { rows: [{ status: 'active', count: 1 }] };
      }
      if (/FROM assistant_conversations/.test(sql)) {
        return { rows: [{ conversation_key: 'conv_1', channel_key: 'telegram', role_key: 'parent', workspace_key: 'bna', project_key: 'bna', status: 'active', updated_at: '2026-06-23T00:00:00Z', body: 'private raw body' }] };
      }
      if (/FROM assistant_action_plans/.test(sql)) return { rows: [{ plan_key: 'plan_1', action_id: 'create_ticket', status: 'planned', approval_required: false }] };
      if (/FROM assistant_approvals/.test(sql)) return { rows: [{ approval_key: 'approval_1', status: 'pending', expires_at: '2026-06-24T00:00:00Z' }] };
      if (/FROM assistant_drafts/.test(sql)) return { rows: [{ draft_key: 'draft_1', object_type: 'email', status: 'draft', payload: { secret: true } }] };
      if (/FROM assistant_reminders/.test(sql)) return { rows: [{ reminder_key: 'reminder_1', status: 'scheduled', next_run_at: '2026-06-24T00:00:00Z' }] };
      if (/FROM assistant_delivery_outbox/.test(sql)) return { rows: [{ delivery_key: 'delivery_1', channel_key: 'telegram', status: 'failed', attempts: 3 }] };
      if (/FROM assistant_dead_letters/.test(sql)) return { rows: [{ dead_letter_key: 'dead_1', source_table: 'assistant_delivery_outbox', status: 'open' }] };
      return { rows: [] };
    },
  };
}

test('assistant control center snapshot is read-only, redacted, and shared-model scoped', async () => {
  const db = fakeDb();
  const snapshot = await buildAssistantControlCenterSnapshot({
    db,
    actor: { role: 'super_admin', scope: { type: 'all' }, workspace_key: 'platform' },
    now: '2026-06-23T20:00:00.000Z',
  });

  assert.equal(snapshot.requirement_id, 'REQ-20260623-025');
  assert.equal(snapshot.snapshot_version, 'assistant-control-center-v1');
  assert.equal(snapshot.statuses.approvals.by_status.pending, 2);
  assert.equal(snapshot.statuses.delivery_outbox.by_status.failed, 1);
  assert.ok(snapshot.blockers.includes('pending_approvals'));
  assert.ok(snapshot.blockers.includes('failed_deliveries'));
  assert.ok(snapshot.blockers.includes('dead_letters'));
  assert.equal(snapshot.recent.conversations.rows[0].body, undefined);
  assert.equal(snapshot.recent.drafts.rows[0].payload, undefined);
  assert.ok(snapshot.no_write_guard.includes('no_raw_message_body_or_secret_payload_returned'));
  assert.ok(db.queries.length >= 12);
});

test('assistant control center registry coverage reports action parity gaps without inventing actions', () => {
  const coverage = registryCoverage();
  assert.ok(coverage.total_actions >= 70);
  assert.ok(coverage.telegram_ready > 0);
  assert.ok(coverage.website_ready > 0);
  assert.deepEqual(coverage.missing_handlers, []);
});

test('server and Operations expose the Super Admin Assistant Control Center surface', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
  const operations = fs.readFileSync(path.join(__dirname, '..', 'public', 'operations.html'), 'utf8');

  assert.match(server, /app\.get\('\/api\/bna\/assistant\/control-center', requireAdmin/);
  assert.match(server, /Assistant Control Center is Super Admin only/);
  assert.match(server, /buildAssistantControlCenterSnapshot/);
  assert.match(operations, /getAssistantControlCenter\(\)/);
  assert.match(operations, /data-assistant-control-center="summary"/);
  assert.match(operations, /No raw bodies/);
});
