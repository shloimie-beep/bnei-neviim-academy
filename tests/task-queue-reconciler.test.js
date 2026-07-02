const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const reconcilerUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'task-queue-reconciler.mjs')).href;

async function loadReconciler() {
  return import(reconcilerUrl);
}

test('reconciler classifies stale blocked known machine work for closure or state clearing', async () => {
  const { classifyMachineTask } = await loadReconciler();
  const task = {
    id: 228,
    title: 'Add kid-to-parent checkoff notifications',
    stage: 'assigned',
    assigned_to: 'Codex',
    category: 'accountability',
  };
  const fleetState = { tasks: { 228: { attempts: 2, blocked: true } } };

  const result = classifyMachineTask(task, fleetState, { maxRetries: 2 });

  assert.equal(result.action, 'close_known_verified_or_clear_state');
  assert.equal(result.severity, 'warn');
  assert.equal(result.knownVerified.title, 'Add kid-to-parent checkoff notifications');
});

test('reconciler keeps credential and outside-decision blockers open', async () => {
  const { classifyMachineTask, isTrueBlocker } = await loadReconciler();
  const task = {
    id: 156,
    title: 'Finish live Rabbi bot runtime by collecting the confirmed Rabbi chat ID',
    stage: 'assigned',
    assigned_to: 'Codex',
    category: 'operations',
  };

  assert.equal(isTrueBlocker(task), true);
  assert.equal(classifyMachineTask(task, { tasks: {} }, { maxRetries: 2 }).action, 'keep_blocked_external');
});

test('known verified tasks are not trapped by broad blocker language', async () => {
  const { classifyMachineTask, isTrueBlocker } = await loadReconciler();
  const task = {
    id: 213,
    title: 'Verify watchdog secret-scan findings without rotating keys',
    notes: 'Mentions Buffer secret and token rotation only as prior verification context.',
    stage: 'assigned',
    assigned_to: 'Codex',
  };

  assert.equal(isTrueBlocker(task), true);
  assert.notEqual(classifyMachineTask(task, { tasks: {} }, { maxRetries: 2 }).action, 'keep_blocked_external');
});

test('reconciler marks stale TASKS.md items done and backfills the UI brand shell item', async () => {
  const { UI_BRAND_TASK_TITLE, reconcileTasksMarkdown } = await loadReconciler();
  const input = [
    '## Now',
    '',
    '- [ ] Generate Sefaria source sheets from every class transcript: live task #322 is `urgent` and `in_progress` under the agent fleet',
    '- [ ] Add sourced bibliography workflow for public content videos as a second stage: live task #323 is assigned to Codex',
    '- [ ] Live task #260: Fix parent access link and polish parent/student dashboards; covers direct parent links',
    '- [ ] Live task #311: Audit Telegram bot button/API coverage for Goal Board and parent accountability fields; make sure Telegram can create/update sections',
  ].join('\n');

  const result = reconcileTasksMarkdown(input);

  assert.match(result.text, new RegExp(`- \\[ \\] ${UI_BRAND_TASK_TITLE}`));
  assert.match(result.text, /- \[x\] Generate Sefaria source sheets/);
  assert.match(result.text, /- \[x\] Add sourced bibliography workflow/);
  assert.match(result.text, /- \[x\] Live task #260/);
  assert.match(result.text, /- \[x\] Live task #311/);
  assert.equal(result.changes.length, 5);
});

test('reconciler detects an existing app-wide UI brand task', async () => {
  const { findUiBrandTask, taskLooksLikeUiBrandShell } = await loadReconciler();
  const task = {
    id: 401,
    title: 'Apply app-wide BNA brand shell and million-dollar SaaS UI polish',
    notes: 'Static toolbar across every single page, whole system brand kit, side menus, top filters.',
    stage: 'assigned',
  };

  assert.equal(taskLooksLikeUiBrandShell(task), true);
  assert.equal(findUiBrandTask([task])?.id, 401);
});

test('reconciler treats completed repo UI brand evidence as existing work', async () => {
  const { UI_BRAND_TASK_TITLE, repoHasUiBrandTaskEvidence } = await loadReconciler();

  assert.equal(
    repoHasUiBrandTaskEvidence([
      `- [x] ${UI_BRAND_TASK_TITLE}: live task #402 is done/verified after deployment and smoke checks.`,
    ]),
    true
  );
  assert.equal(
    repoHasUiBrandTaskEvidence([
      `- [ ] ${UI_BRAND_TASK_TITLE}: backfill this if the live task is missing.`,
    ]),
    false
  );
});

test('reconciler summarizes content job 56 outputs for manual routing audit', async () => {
  const { auditContentJob56 } = await loadReconciler();
  const result = auditContentJob56([
    {
      id: 56,
      title: 'Voice 260610_100130',
      status: 'parsed',
      parse_json: { mixed_recording_parse: { report: { summary: 'Long recording parsed.' } } },
      outputs: [
        { id: 58, output_type: 'whatsapp', platform: 'whatsapp', status: 'draft', title: 'WhatsApp draft' },
      ],
    },
  ]);

  assert.equal(result.found, true);
  assert.equal(result.output_count, 1);
  assert.equal(result.outputs[0].id, 58);
  assert.equal(result.parse_summary, 'Long recording parsed.');
});
