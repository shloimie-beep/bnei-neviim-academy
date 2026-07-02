const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');

test('Rabbi task-dialogue migration adds structured fields, activity, and manual pending-access seeds', () => {
  const sql = read('railway-migration-2026-06-15-rabbi-task-dialogue.sql');

  for (const column of [
    'task_kind',
    'display_title',
    'summary',
    'why_exists',
    'next_action',
    'waiting_on',
    'needs_review',
    'raw_message',
    'cleaned_summary',
    'bot_created',
    'blocked_reason',
    'blocked_at',
    'last_activity_at',
  ]) {
    assert.match(sql, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`, 'i'));
  }
  assert.match(sql, /CREATE TABLE IF NOT EXISTS bna_task_activity/i);
  assert.match(sql, /CHECK \(task_kind IN \('decision', 'pending_access', 'task', 'agent_job', 'history'\)\)/);
  assert.match(sql, /waiting_on IN \('rabbi', 'shloimie', 'external', 'agent', 'none'\)/);
  assert.match(sql, /'stripe-pending-access'/);
  assert.match(sql, /'vimeo-pending-access'/);
  assert.match(sql, /'website-assets-pending-access'/);
  assert.match(sql, /'zoom-pending-access'/);
  assert.match(sql, /'resend-pending-access'/);
  assert.match(sql, /Manual placeholder only/);
  assert.match(sql, /no_external_write/);
});

test('server classifies One Time captures into dialogue kinds without raw titles', () => {
  const server = read('server.js');

  assert.match(server, /const TASK_DIALOGUE_KINDS = new Set\(\['decision', 'pending_access', 'task', 'agent_job', 'history'\]\)/);
  assert.match(server, /function fallbackOneTimeDialogueCandidate/);
  assert.match(server, /function conciseTaskTitleFromRawText/);
  assert.match(server, /Clarify One Time recording-page next step/);
  assert.match(server, /Capability questions are conversation, not task cards/);
  assert.match(server, /hasAccessBlockerIntent/);
  assert.match(server, /task_kind, display_title, summary, why_exists, next_action, what, why, owner_person_id, needs_review/);
  assert.match(server, /cleanTaskTitleForStorage\(input\.display_title/);
  assert.match(server, /task_kind: dialogue\.taskKind/);
  assert.match(server, /bot_created: dialogue\.botCreated/);
  assert.match(server, /needs_review: Boolean\(candidate\.needs_review/);
  assert.match(server, /fallbackCandidate = fallbackOneTimeDialogueCandidate\(rawText\)/);
});

test('server APIs expose board-ready task fields, detail activity, comments, and blocked-agent conversion', () => {
  const server = read('server.js');

  assert.match(server, /app\.get\('\/api\/bna\/tasks', requireAdmin/);
  assert.match(server, /task_kind && task_kind !== 'all'/);
  assert.match(server, /activity_counts AS/);
  assert.match(server, /COALESCE\(task_base\.task_kind, ''\) = 'pending_access'/);
  assert.match(server, /app\.get\('\/api\/bna\/tasks\/:id', requireAdmin/);
  assert.match(server, /FROM bna_task_activity[\s\S]*ORDER BY created_at DESC/);
  assert.match(server, /latest_agent_job/);
  assert.match(server, /defaultVisibility = isOneTimeProjectKey\(currentTask\?\.project_key\) \? 'project' : 'workspace'/);
  assert.match(server, /recordTaskActivity\(req\.params\.id, 'human_commented'/);
  assert.match(server, /blockedByAccess[\s\S]*task_kind = '\$\{blockedTaskKind\}'/);
  assert.match(server, /decision_required = \$\{blockedByAccess \? 'FALSE' : 'TRUE'\}/);
});

test('Operations renders a four-column Rabbi dialogue board with card and drawer details', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /const RABBI_DIALOGUE_COLUMNS = \[/);
  assert.match(operations, /\{ id: 'decisions', label: 'Decisions'/);
  assert.match(operations, /\{ id: 'pending', label: 'Blocked\/access'/);
  assert.match(operations, /\{ id: 'tasks', label: 'Tasks'/);
  assert.match(operations, /\{ id: 'done_activity', label: 'Done \/ Activity'/);
  assert.match(operations, /function renderOneTimeDialogueBoard/);
  assert.match(operations, /state\.focusMap\[column\.id\]/);
  assert.match(operations, /rabbi-dialogue-board/);
  assert.match(operations, /task\.why_exists/);
  assert.match(operations, /task\.next_action/);
  assert.match(operations, /function renderTaskCardPrimaryAction/);
  assert.match(operations, /function renderTaskCardOverflowActions/);
  assert.match(operations, /task\.blocked_reason/);
  assert.match(operations, /getTaskDetail\(id\)/);
  assert.match(operations, /expandedTaskActivity/);
  assert.match(operations, /Capture \/ Cleanup/);
  assert.match(operations, /Latest agent job/);
  assert.match(operations, /taskCommentDefaultVisibility/);
});
