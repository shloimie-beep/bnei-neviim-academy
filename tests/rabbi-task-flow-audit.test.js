const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const auditUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'rabbi-task-flow-audit.mjs')).href;

async function loadAudit() {
  return import(auditUrl);
}

function taskFixture() {
  return [
    {
      id: 810,
      project_key: 'one_time_mishnah_class',
      title: 'Can you publish the full One Time member library workspace and make sure nothing gets messed up with access',
      notes: 'raw provider request says publish to member library immediately without checking gates',
      stage: 'assigned',
      assigned_to: 'Codex',
      decision_required: false,
    },
    {
      id: 811,
      project_key: 'one_time_mishnah_class',
      title: 'Decide One Time member-library destination',
      notes: 'Owner still needs to approve destination URL and access policy.',
      stage: 'needs_decision',
      assigned_to: 'Shloimie',
      decision_required: true,
    },
    {
      id: 812,
      title: 'Rabbi Elie task references Menachem parent portal accidentally',
      notes: 'This should be treated as private BNA scope contamination.',
      stage: 'queued',
      assigned_to: 'Codex',
      decision_required: false,
    },
    {
      id: 813,
      title: 'Repair BNA student dashboard labels',
      notes: 'Unrelated school task.',
      stage: 'assigned',
      assigned_to: 'Codex',
      decision_required: false,
    },
  ];
}

test('Rabbi task-flow audit classifies One Time work without writes', async () => {
  const { buildRabbiTaskFlowAudit, taskMatchesRabbiFlow } = await loadAudit();
  const tasks = taskFixture();
  const audit = buildRabbiTaskFlowAudit(tasks, { source: 'fixture' });

  assert.equal(audit.read_only, true);
  assert.equal(audit.dry_run, true);
  assert.equal(audit.live_write_performed, false);
  assert.equal(audit.task_patch_performed, false);
  assert.equal(audit.scanned_task_count, 4);
  assert.equal(audit.rabbi_task_count, 3);
  assert.equal(taskMatchesRabbiFlow(tasks[0]), true);
  assert.equal(taskMatchesRabbiFlow(tasks[3]), false);

  const byId = new Map(audit.queues.all_rabbi_tasks.map((task) => [task.id, task]));
  assert.deepEqual(
    byId.get(810).flags,
    ['visible_title_review', 'external_write_gate_review', 'codex_ready'],
  );
  assert.equal(byId.get(811).flags.includes('human_blocker_or_decision'), true);
  assert.equal(byId.get(812).flags.includes('private_bna_scope_review'), true);
  assert.equal(byId.get(812).flags.includes('missing_project_key_review'), true);

  assert.equal(audit.summary.codex_ready_count, 2);
  assert.equal(audit.summary.human_blocker_or_decision_count, 1);
  assert.equal(audit.summary.private_scope_review_count, 1);
  assert.equal(audit.summary.external_write_gate_review_count, 2);
});

test('Rabbi task-flow Markdown is sanitized and keeps guardrails visible', async () => {
  const { buildRabbiTaskFlowAudit, renderRabbiTaskFlowMarkdown } = await loadAudit();
  const audit = buildRabbiTaskFlowAudit(taskFixture(), { source: 'fixture' });
  const markdown = renderRabbiTaskFlowMarkdown(audit);

  assert.match(markdown, /This audit is read-only and has no apply mode/);
  assert.doesNotMatch(markdown, /raw provider request says publish to member library/i);
  assert.doesNotMatch(markdown, /Menachem/i);
  assert.doesNotMatch(markdown, /parent portal/i);
  assert.match(markdown, /\[private BNA scope\]/);
});

test('Rabbi task-flow audit rejects apply-style flags', async () => {
  const { parseArgs } = await loadAudit();

  assert.throws(
    () => parseArgs(['--apply']),
    /read-only and has no apply mode/,
  );
  assert.throws(
    () => parseArgs(['--confirm', 'yes']),
    /read-only and has no apply mode/,
  );
});

test('package exposes the Rabbi task-flow audit command', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['task:rabbi-flow-audit'], 'node scripts/rabbi-task-flow-audit.mjs');
});
