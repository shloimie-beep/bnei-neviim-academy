const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');

const cleanupUrl = pathToFileURL(path.join(__dirname, '..', 'scripts', 'task-title-cleanup-dry-run.mjs')).href;

async function loadCleanup() {
  return import(cleanupUrl);
}

function rawTaskFixture() {
  const original = "Yes definitely fix up that thing but your student is super professional really legit way like so nothing gets messed up cuz there's other critical warnings and we just need to put this in the change log";
  return {
    id: 195,
    title: `${original} ${original.slice(0, 45)}...`,
    notes: 'Clear task extracted from Telegram input.',
    stage: 'assigned',
    category: 'accountability',
    assigned_to: 'Codex',
    decision_required: false,
    ai_parsed: { original_text: original },
  };
}

function overloadedScopeTaskFixture() {
  return {
    id: 1575,
    title: "Because I tell it to do too many things at once, so it doesn't fix everything.",
    notes: "Because I tell it to do too many things at once, so it doesn't fix everything.",
    stage: 'assigned',
    category: 'operations',
    assigned_to: 'Codex',
  };
}

function cleanTitleWithBroadNotesFixture() {
  return {
    id: 1751,
    title: 'Collect One Time website content assets',
    notes: [
      'Operator instruction: split coding, dashboard, parser, website, bot, Railway, or Codex work into Tasks assigned to Codex.',
      'Recording title: BNA Mobile App UI and Functionality Updates.',
      'The transcript mentions a selected toolbar warning color, a button to fix, and task routing rules.',
    ].join(' '),
    stage: 'assigned',
    category: 'accountability',
    assigned_to: 'Codex',
    ai_parsed: {
      kind: 'task',
      display_title: 'Collect One Time website content assets',
    },
  };
}

test('task title cleanup is dry-run by default and finds watchdog title repairs', async () => {
  const { buildTaskTitleCleanupAudit } = await loadCleanup();
  const audit = buildTaskTitleCleanupAudit([
    rawTaskFixture(),
    {
      id: 501,
      title: 'Prepare weekly parent update draft',
      stage: 'assigned',
      assigned_to: 'Codex',
    },
  ]);

  assert.equal(audit.dry_run, true);
  assert.equal(audit.tasks_scanned, 2);
  assert.equal(audit.candidate_count, 1);
  assert.equal(audit.candidates[0].task_id, 195);
  assert.equal(audit.candidates[0].next_title, 'Add watchdog soft repair for obvious task warnings');
  assert.deepEqual(audit.candidates[0].patch, {
    title: 'Add watchdog soft repair for obvious task warnings',
    category: 'operations',
    assigned_to: 'Codex',
    decision_required: false,
    stage: 'assigned',
  });
  assert.equal(audit.actions[0].action, 'would_patch_task_title');
});

test('task title cleanup catches overloaded broad-fix task titles', async () => {
  const { buildTaskTitleCleanupAudit } = await loadCleanup();
  const audit = buildTaskTitleCleanupAudit([overloadedScopeTaskFixture()]);

  assert.equal(audit.candidate_count, 1);
  assert.equal(audit.candidates[0].task_id, 1575);
  assert.equal(audit.candidates[0].next_title, 'Split oversized operator requests into focused execution packets');
  assert.deepEqual(audit.candidates[0].patch, {
    title: 'Split oversized operator requests into focused execution packets',
  });
});

test('task title cleanup does not retitle clean tasks from broad notes', async () => {
  const { buildTaskTitleCleanupAudit } = await loadCleanup();
  const audit = buildTaskTitleCleanupAudit([cleanTitleWithBroadNotesFixture()]);

  assert.equal(audit.tasks_scanned, 1);
  assert.equal(audit.candidate_count, 0);
  assert.equal(audit.manual_review_count, 0);
});

test('task title cleanup reports exclude full raw operator wording', async () => {
  const { buildTaskTitleCleanupAudit } = await loadCleanup();
  const rawTask = rawTaskFixture();
  const audit = buildTaskTitleCleanupAudit([rawTask]);
  const serialized = JSON.stringify(audit);

  assert.equal(audit.candidates[0].previous_title_preview.endsWith('...'), true);
  assert.ok(audit.candidates[0].previous_title_preview.length <= 96);
  assert.equal(serialized.includes(rawTask.ai_parsed.original_text), false);
  assert.equal(serialized.includes(rawTask.title), false);
  assert.match(audit.raw_source_policy, /intentionally excluded/i);
});

test('task title cleanup skips closed tasks unless explicitly included', async () => {
  const { buildTaskTitleCleanupAudit } = await loadCleanup();
  const task = rawTaskFixture();
  task.stage = 'done';

  const defaultAudit = buildTaskTitleCleanupAudit([task]);
  const includedAudit = buildTaskTitleCleanupAudit([task], { includeClosed: true });

  assert.equal(defaultAudit.candidate_count, 0);
  assert.equal(defaultAudit.skipped_closed_count, 1);
  assert.equal(includedAudit.candidate_count, 1);
  assert.equal(includedAudit.skipped_closed_count, 0);
});

test('task title cleanup routes unsafe generated titles to manual review', async () => {
  const { buildTaskTitleCleanupAudit, suggestedTitleNeedsManualReview } = await loadCleanup();
  const task = {
    id: 581,
    title: 'Passed that over to he should make that I should be able to open links you bring me to the link to that page or your app and then also make it work everywhere because I need it',
    stage: 'assigned',
    assigned_to: 'Codex',
  };
  const audit = buildTaskTitleCleanupAudit([task]);

  assert.equal(suggestedTitleNeedsManualReview(task.title), true);
  assert.equal(audit.candidate_count, 0);
  assert.equal(audit.manual_review_count, 1);
  assert.equal(audit.manual_reviews[0].reason, 'suggested_title_still_reads_like_raw_operator_wording');
});

test('live apply mode requires an explicit confirmation phrase', async () => {
  const { APPLY_CONFIRMATION, assertApplyConfirmed, parseArgs } = await loadCleanup();

  assert.doesNotThrow(() => assertApplyConfirmed(parseArgs([])));
  assert.throws(
    () => assertApplyConfirmed(parseArgs(['--apply'])),
    new RegExp(APPLY_CONFIRMATION),
  );
  assert.doesNotThrow(() => assertApplyConfirmed(parseArgs(['--apply', '--confirm', APPLY_CONFIRMATION])));
});

test('task title cleanup can run from an offline fixture without live writes', async () => {
  const { runTaskTitleCleanup } = await loadCleanup();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bna-task-title-cleanup-'));
  const fixturePath = path.join(tempDir, 'tasks.json');
  fs.writeFileSync(fixturePath, `${JSON.stringify({ tasks: [rawTaskFixture()] }, null, 2)}\n`);

  const audit = await runTaskTitleCleanup({
    tasksFile: fixturePath,
    noLive: true,
    apply: false,
    writeReport: false,
  });

  assert.equal(audit.live_tasks_loaded, false);
  assert.equal(audit.tasks_file, fixturePath);
  assert.equal(audit.candidate_count, 1);
  assert.equal(audit.report, null);
});

test('package exposes the dry-run task cleanup command', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['task:title-cleanup'], 'node scripts/task-title-cleanup-dry-run.mjs');
});
