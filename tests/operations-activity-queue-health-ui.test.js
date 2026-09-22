const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');
const shellCss = fs.readFileSync('public/css/bna-app-shell.css', 'utf8');

test('Operations task shell keeps status and filters compact across desktop and mobile', () => {
  assert.match(operationsHtml, /class="ops-brand-topbar saas-topbar"/);
  assert.match(operationsHtml, /function renderTaskStatusToolbar/);
  assert.match(operationsHtml, /class="local-toolbar task-status-toolbar"/);
  assert.match(operationsHtml, /class="status-chip \$\{active \? 'active' : ''\}"/);
  assert.match(operationsHtml, /\.agent-status-panel\s*{[\s\S]*display:\s*flex/);
  assert.doesNotMatch(operationsHtml, /linear-gradient\(135deg, #16233b, #101827\)/);
  assert.doesNotMatch(operationsHtml, /min-height:\s*78px/);
  assert.match(operationsHtml, /\.agent-status-stat\s*{[\s\S]*border-radius:\s*999px/);
  assert.match(operationsHtml, /\.task-row-actions \.task-action\s*{[\s\S]*flex:\s*1 1 46%/);
  assert.match(operationsHtml, /\.queue-audit-row\s*{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(operationsHtml, /\.agent-status-main\s*{[\s\S]*flex-basis:\s*auto/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.local-toolbar/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.agent-status-title/);
});

test('Activity lane explains what rows are and makes row detail/action access explicit', () => {
  assert.match(operationsHtml, /function renderTaskActivitySummary/);
  assert.match(operationsHtml, /task-focused-activity/);
  assert.match(operationsHtml, /Done \/ Activity rows open the same detail and action sheet as Tasks/);
  assert.match(operationsHtml, /Open history detail for comments, proof, and actions/);
  assert.match(operationsHtml, /columnId === 'done_activity' \? 'Open history' : 'Open'/);
  assert.match(operationsHtml, /\.task-focused-activity \.task-row-title\s*{[\s\S]*color:\s*#ffffff/);
  assert.match(operationsHtml, /\.task-focused-activity \.task-row-detail\s*{[\s\S]*color:\s*#dbeafe/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-focused-activity \.task-row-title/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.task-activity-summary/);
});

test('Queue Health stays available for technical review without rendering in the main task board', () => {
  assert.match(operationsHtml, /const QUEUE_HEALTH_STATUS_GROUPS = \[/);
  assert.match(operationsHtml, /Working now/);
  assert.match(operationsHtml, /Needs attention/);
  assert.match(operationsHtml, /Do not restart/);
  assert.match(operationsHtml, /function queueAuditStatusGroup/);
  assert.match(operationsHtml, /queueAuditStatusGroupCounts/);
  assert.match(operationsHtml, /Queue Health tracks agent work, handoff files, ledger\/changelog proof/);
  assert.match(operationsHtml, /It is not the human Pending lane/);
  assert.match(operationsHtml, /class="queue-status-groups"/);
  assert.match(operationsHtml, /class="badge queue-raw-status"/);
  assert.match(operationsHtml, /Requeue available/);
  assert.doesNotMatch(operationsHtml, /renderTasks\(\)[\s\S]*renderQueueHealthPanel\(\)/);
  assert.doesNotMatch(operationsHtml, /renderTasks\(\)[\s\S]*renderAgentStatusPanel\(state\.buckets\)/);
  assert.match(shellCss, /body\.bna-ops-shell-page \.queue-health-explainer/);
});
