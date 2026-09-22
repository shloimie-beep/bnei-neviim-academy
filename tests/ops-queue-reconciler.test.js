const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

async function loadReconciler() {
  return import(pathToFileURL(path.join(repoRoot, 'scripts/lib/ops-queue-reconciler.mjs')).href);
}

function makeFixtureRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-ops-queue-audit-'));
  for (const dir of [
    'ops/agent-fleet-runs',
    'ops/queue-audits',
    'tasks-pending',
    '.runtime/agent-fleet',
  ]) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
  fs.writeFileSync(path.join(root, 'ops/agent-changelog.md'), '# Changelog\n');
  fs.writeFileSync(path.join(root, 'ops/agent-task-ledger.jsonl'), '');
  return root;
}

function write(root, relativePath, text) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text);
}

test('queue reconciler classifies completed proof, missing proof, stale/fresh work, and blocked failures', async () => {
  const { buildQueueAudit, requeueCandidates } = await loadReconciler();
  const root = makeFixtureRepo();
  write(root, 'ops/agent-task-ledger.jsonl', [
    JSON.stringify({ recorded_at: '2026-06-15T10:00:00.000Z', event: 'agent_fleet_task_verified', task_id: 501, title: 'Verified item' }),
    JSON.stringify({ recorded_at: '2026-06-15T10:10:00.000Z', event: 'agent_fleet_task_blocked', task_id: 700, title: 'Blocked item', blocker: 'Needs API choice' }),
  ].join('\n') + '\n');
  write(root, 'ops/agent-fleet-runs/2026-06-15T10-01-00-000Z-task-501.md', [
    '# Agent Fleet Run - Task #501',
    'Generated: 2026-06-15T10:01:00.000Z',
    'Outcome: PASS',
    'Task: Verified item',
  ].join('\n'));
  write(root, 'ops/agent-fleet-runs/2026-06-15T10-11-00-000Z-task-700.md', [
    '# Agent Fleet Run - Task #700',
    'Generated: 2026-06-15T10:11:00.000Z',
    'Outcome: FAIL',
    'Task: Blocked item',
  ].join('\n'));
  write(root, '.runtime/agent-fleet/task-600.lock.json', JSON.stringify({
    task_id: 600,
    pid: 123,
    run_id: 'run-600',
    started_at: '2026-06-15T11:50:00.000Z',
    heartbeat_at: '2026-06-15T11:55:00.000Z',
    title: 'Fresh item',
  }));

  const summary = buildQueueAudit({
    repoRoot: root,
    generatedAt: '2026-06-15T12:00:00.000Z',
    staleThresholdMinutes: 15,
    liveTasks: [
      { id: 501, title: 'Verified item', stage: 'done', assigned_to: 'Codex', completed_at: '2026-06-15T10:02:00.000Z', verified_at: '2026-06-15T10:03:00.000Z' },
      { id: 502, title: 'Done without proof', stage: 'done', completed_at: '2026-06-15T10:04:00.000Z' },
      { id: 600, title: 'Fresh item', stage: 'in_progress', assigned_to: 'Codex', started_at: '2026-06-15T11:50:00.000Z' },
      { id: 601, title: 'Stale item', stage: 'in_progress', assigned_to: 'Codex', started_at: '2026-06-15T09:00:00.000Z', updated_at: '2026-06-15T09:00:00.000Z' },
      { id: 602, title: 'Unknown human item', stage: 'raw_input', assigned_to: 'Shloimie' },
      { id: 603, title: 'Unknown Codex item', stage: 'raw_input', assigned_to: 'Codex' },
      { id: 700, title: 'Blocked item', stage: 'assigned', assigned_to: 'Codex' },
    ],
  });

  const byTask = (id) => summary.items.find((item) => Number(item.task_id) === id);
  assert.equal(byTask(501).current_status, 'completed_verified');
  assert.equal(byTask(501).do_not_redo, true);
  assert.equal(byTask(502).current_status, 'done_missing_report');
  assert.equal(byTask(600).current_status, 'active_fresh');
  assert.equal(byTask(601).current_status, 'active_stale');
  assert.equal(byTask(601).safe_to_requeue, true);
  assert.equal(byTask(602).current_status, 'abandoned_unknown');
  assert.equal(byTask(602).safe_to_requeue, false);
  assert.equal(byTask(603).current_status, 'abandoned_unknown');
  assert.equal(byTask(603).safe_to_requeue, true);
  assert.equal(byTask(700).current_status, 'blocked');
  assert.equal(byTask(700).safe_to_requeue, false);
  assert.deepEqual(requeueCandidates(summary).map((item) => item.task_id), [601, 603]);
  assert.deepEqual(summary.requeue_candidates.map((item) => item.task_id), [601, 603]);
});

test('queue reconciler treats planning-only and documentation-only briefs as do-not-redo blockers', async () => {
  const { buildQueueAudit } = await loadReconciler();
  const root = makeFixtureRepo();
  write(root, 'tasks-pending/2026-06-15-planning-only.md', [
    '# Planning Only Design',
    'Status: planning-only design handoff.',
    'Do not build until the operator explicitly asks for implementation.',
  ].join('\n'));
  write(root, 'tasks-pending/2026-06-15-hardware-checklist.md', [
    '# Hardware Checklist',
    'Status: documentation-only checklist.',
    'Hardware/login/provider verification remains future work.',
  ].join('\n'));
  const summary = buildQueueAudit({
    repoRoot: root,
    generatedAt: '2026-06-15T12:00:00.000Z',
    liveTasks: [],
  });
  const planning = summary.items.find((item) => item.id.includes('planning-only'));
  const hardware = summary.items.find((item) => item.id.includes('hardware-checklist'));
  assert.equal(planning.current_status, 'pending_shloimie');
  assert.equal(planning.do_not_redo, true);
  assert.equal(planning.safe_to_requeue, false);
  assert.equal(hardware.current_status, 'pending_external');
  assert.equal(hardware.do_not_redo, true);
});

test('WS04 exposes queue audit command, protected routes, Operations UI, and fleet heartbeat hooks', () => {
  const pkg = JSON.parse(read('package.json'));
  const server = read('server.js');
  const operations = read('public/operations.html');
  const fleet = read('scripts/agent-fleet-supervisor.mjs');

  assert.equal(pkg.scripts['ops:audit-queue'], 'node scripts/ops-queue-audit.mjs');
  assert.match(server, /app\.get\('\/api\/bna\/ops\/queue-health', requireAdmin/);
  assert.match(server, /resolveSafeOpsReportPath/);
  assert.match(server, /app\.post\('\/api\/bna\/ops\/queue\/requeue', requireAdmin/);
  assert.match(operations, /function renderQueueHealthPanel/);
  assert.match(operations, /function renderQueueAuditTable/);
  assert.match(operations, /getQueueHealth\(\)/);
  assert.match(operations, /requeueAuditItem/);
  assert.match(fleet, /heartbeat_at/);
  assert.match(fleet, /run_id/);
});
