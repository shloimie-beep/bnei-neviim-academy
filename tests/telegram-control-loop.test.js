const assert = require('node:assert/strict');
const test = require('node:test');

const {
  classifyTelegramControlQuery,
  isQuietHour,
  taskControlSource,
  telegramActorRef,
  telegramTokenFingerprint,
  usefulTaskTransition,
} = require('../src/lib/bna/telegram-control-loop');

test('operator phrases route to bounded canonical queue views', () => {
  assert.equal(classifyTelegramControlQuery('show my tasks'), 'mine');
  assert.equal(classifyTelegramControlQuery('show decisions'), 'decisions');
  assert.equal(classifyTelegramControlQuery('what is blocked?'), 'blocked');
  assert.equal(classifyTelegramControlQuery('what did Codex do?'), 'codex_results');
  assert.equal(classifyTelegramControlQuery('let us brainstorm the school week'), '');
});

test('task source labels collapse into the five control-plane sources', () => {
  assert.equal(taskControlSource({ source: 'telegram', bot_created: true }), 'Bot');
  assert.equal(taskControlSource({ source: 'support_ticket', support_ticket_id: 8 }), 'Ticket');
  assert.equal(taskControlSource({ source: 'agent_fleet', agent_job_id: 4 }), 'Agent');
  assert.equal(taskControlSource({ source: 'google_drive' }), 'Integration');
  assert.equal(taskControlSource({ source: 'dashboard' }), 'Manual');
});

test('redacted actor and token references are stable and do not expose inputs', () => {
  const actor = telegramActorRef('123456789');
  const token = telegramTokenFingerprint('123456:example-secret-token');
  assert.match(actor, /^chat:[a-f0-9]{10}$/);
  assert.match(token, /^[a-f0-9]{12}$/);
  assert.doesNotMatch(actor, /123456789/);
  assert.doesNotMatch(token, /example-secret/);
});

test('quiet hours support the Asia/Jerusalem overnight window', () => {
  const late = new Date('2026-08-03T20:30:00.000Z');
  const daytime = new Date('2026-08-03T09:00:00.000Z');
  assert.equal(isQuietHour({ now: late, timeZone: 'Asia/Jerusalem', startHour: 22, endHour: 7 }), true);
  assert.equal(isQuietHour({ now: daytime, timeZone: 'Asia/Jerusalem', startHour: 22, endHour: 7 }), false);
});

test('task notifications only describe useful state transitions', () => {
  assert.deepEqual(
    usefulTaskTransition({ id: 1, stage: 'in_progress' }, { id: 1, stage: 'done', completed_at: '2026-08-03T12:00:00Z' }),
    { kind: 'completed', label: 'Task completed' },
  );
  assert.deepEqual(
    usefulTaskTransition({ id: 4, stage: 'in_progress' }, { id: 4, stage: 'done', verified_at: '2026-08-03T12:00:00Z' }),
    { kind: 'completed', label: 'Completed and verified' },
  );
  assert.deepEqual(
    usefulTaskTransition({ id: 5, stage: 'in_progress' }, { id: 5, stage: 'failed', agent_status: 'failed' }),
    { kind: 'failed', label: 'Work failed' },
  );
  assert.deepEqual(
    usefulTaskTransition({ id: 2, stage: 'assigned' }, { id: 2, stage: 'blocked', waiting_on: 'external' }),
    { kind: 'blocked', label: 'Blocked' },
  );
  assert.equal(usefulTaskTransition({ id: 3, stage: 'assigned' }, { id: 3, stage: 'in_progress' }), null);
  assert.deepEqual(
    usefulTaskTransition(
      { id: 6, stage: 'assigned', assigned_to_owner: false },
      { id: 6, stage: 'assigned', assigned_to_owner: true }
    ),
    { kind: 'assigned', label: 'Assigned to Shloimie' },
  );
  assert.deepEqual(
    usefulTaskTransition(
      { id: 7, stage: 'in_progress', completed: false },
      { id: 7, stage: 'done', completed: true }
    ),
    { kind: 'completed', label: 'Task completed' },
  );
});
