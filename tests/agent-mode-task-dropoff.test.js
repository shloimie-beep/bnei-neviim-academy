const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const {
  AGENT_MODE_PROMPTS,
  TASK_AGENT_MODE_RESULT_TIMEOUT_MS,
  buildTaskAgentModeReview,
  renderAgentModePrompt,
  renderTaskAgentModePrompt,
  taskNeedsAgentModeWorkflow,
} = require('../src/lib/bna/agent-review-hub');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const operations = fs.readFileSync(path.join(root, 'public', 'operations.html'), 'utf8');
const dropoff = fs.readFileSync(path.join(root, 'public', 'agent-review-dropoff.html'), 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'action-registry.json'), 'utf8'));
const routeRegistry = JSON.parse(fs.readFileSync(path.join(root, 'ops', 'route-registry.json'), 'utf8'));

function sampleDecision(overrides = {}) {
  return {
    id: 2401,
    item_type: 'decision',
    task_kind: 'decision',
    decision_required: true,
    stage: 'needs_decision',
    status_bucket: 'decisions',
    title: 'Choose owner approval path for provider setup',
    display_title: 'Choose owner approval path for provider setup',
    decision_owner: 'Shloimie',
    next_action: 'Review the provider setup screen and choose the owner-approved path.',
    project_key: 'bna_school_platform',
    ...overrides,
  };
}

function sampleOwnerTask(overrides = {}) {
  return {
    id: 2402,
    item_type: 'task',
    task_kind: 'task',
    stage: 'assigned',
    status_bucket: 'tasks',
    title: 'Audit mobile navigation before launch',
    display_title: 'Audit mobile navigation before launch',
    assigned_to: 'Shloimie',
    next_action: 'Open the live route, verify the mobile UI, and save PASS or BLOCKED evidence.',
    project_key: 'bna_school_platform',
    ...overrides,
  };
}

test('sample Decision card receives Agent Mode prompt and drop-off metadata', () => {
  const review = buildTaskAgentModeReview(sampleDecision(), { baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(review.item_type, 'decision');
  assert.equal(review.prompt_key, 'decision-2401');
  assert.equal(review.requirement_id, 'DECISION-2401');
  assert.equal(review.owner_clarity.key, 'owner_must_decide');
  assert.match(review.exact_starting_url, /\/operations\?view=tasks&task=2401/);
  assert.match(review.exact_dropoff_url, /\/operations\/agent-review\/dropoff\?/);
  assert.match(review.exact_dropoff_url, /task_id=2401/);
  assert.match(review.prompt_text, /Requirement\/task\/decision ID: DECISION-2401/);
  assert.match(renderTaskAgentModePrompt(sampleDecision(), review), /Allowed Actions/);
});

test('sample owner task receives Agent Mode prompt and stable idempotency key', () => {
  const first = buildTaskAgentModeReview(sampleOwnerTask(), { baseUrl: 'https://bneineviimacademy.org' });
  const second = buildTaskAgentModeReview(sampleOwnerTask(), { baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(first.item_type, 'task');
  assert.equal(first.prompt_key, 'task-2402');
  assert.equal(first.requirement_id, 'TASK-2402');
  assert.equal(first.idempotency_key, second.idempotency_key);
  assert.equal(first.copy_metadata.idempotency_key, first.idempotency_key);
  assert.match(first.prompt_text, /Exact return\/drop-off URL:/);
  assert.match(first.prompt_text, /OPERATIONS_DROPOFF_SAVED: AGR-\.\.\./);
  assert.match(first.prompt_text, /OPERATIONS_DROPOFF_FAILED: <exact UI\/API error>/);
  assert.ok(first.allowed_actions.some((item) => /verify/i.test(item)));
  assert.ok(first.prohibited_actions.some((item) => /duplicate visible Tasks/i.test(item)));
});

test('generated Agent Review hub prompts use Operations drop-off as final handoff', () => {
  const promptText = renderAgentModePrompt(AGENT_MODE_PROMPTS.find((item) => item.key === 'navigation-ia-duplicate-control-audit'), {
    baseUrl: 'https://bneineviimacademy.org',
    generatedAt: '2026-07-07T13:19:58+03:00',
  });
  assert.match(promptText, /Preferred drop-off: https:\/\/bneineviimacademy\.org\/operations\/agent-review\/dropoff/);
  assert.match(promptText, /OPERATIONS_DROPOFF_SAVED: AGR-\.\.\./);
  assert.match(promptText, /OPERATIONS_DROPOFF_FAILED: <exact UI\/API error>/);
  assert.doesNotMatch(promptText, /CANNOT_WRITE_GITHUB/);
});

test('copy timeout changes task Agent Mode status to overdue', () => {
  const copiedAt = '2026-06-26T08:00:00.000Z';
  const now = new Date(Date.parse(copiedAt) + TASK_AGENT_MODE_RESULT_TIMEOUT_MS + 1000);
  const review = buildTaskAgentModeReview(sampleOwnerTask({
    ai_parsed: {
      agent_mode_review: {
        status: 'prompt_copied',
        prompt_copied_at: copiedAt,
      },
    },
  }), { baseUrl: 'https://bneineviimacademy.org', now });
  assert.equal(review.status, 'agent_result_overdue');
});

test('saved PASS and BLOCKED states render attached AGR evidence and rerun prompt', () => {
  const pass = buildTaskAgentModeReview(sampleOwnerTask({
    ai_parsed: {
      agent_mode_review: {
        result_ref: 'AGR-pass2402',
        result_status: 'pass',
        result_saved_at: '2026-06-26T09:00:00.000Z',
      },
    },
  }), { baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(pass.status, 'completed');
  assert.match(pass.result_url, /\/api\/bna\/agent-review\/results\/AGR-pass2402/);

  const blocked = buildTaskAgentModeReview(sampleDecision({
    ai_parsed: {
      agent_mode_review: {
        result_ref: 'AGR-blocked2401',
        result_status: 'blocked',
        repair_task_id: 2410,
        repair_requirement_id: 'REQ-REPAIR-TASK',
        rerun_prompt: 'Rerun after repair task #2410.',
      },
    },
  }), { baseUrl: 'https://bneineviimacademy.org' });
  assert.equal(blocked.status, 'rerun_required');
  assert.equal(blocked.repair_task_id, 2410);
  assert.match(blocked.rerun_prompt, /Rerun after repair/);
});

test('internal handoff rows and Codex queue work are not converted into visible owner Agent Mode tasks', () => {
  assert.equal(taskNeedsAgentModeWorkflow(sampleOwnerTask({
    id: 2403,
    status_bucket: 'codex_queue',
    assigned_to: 'Codex',
  })), false);
  assert.equal(taskNeedsAgentModeWorkflow(sampleOwnerTask({
    id: 2404,
    notes: 'Internal handoff: tasks-pending/2026-06-26-agent-review-dropoff-repair.md',
  })), false);
});

test('Operations card exposes copy, drop-off save, AGR readback, and repair controls', () => {
  [
    'renderTaskAgentModePanel',
    'copyTaskAgentModePrompt',
    'saveTaskAgentModeDropoff',
    'ACTION-TASK-AGENT-MODE-COPY-PROMPT',
    'ACTION-TASK-AGENT-MODE-SAVE-DROPOFF',
    'ACTION-TASK-AGENT-MODE-VIEW-RESULT',
    'ACTION-TASK-AGENT-MODE-OPEN-REPAIR',
    'name="report_text"',
    'name="last_completed_role_context"',
    'name="suggested_correction"',
  ].forEach((needle) => assert.match(operations, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('backend routes persist prompt copy and task-linked Agent Review results', () => {
  assert.match(server, /app\.post\('\/api\/bna\/tasks\/:id\/agent-mode\/copy-prompt', requireAdmin/);
  assert.match(server, /status:\s*'prompt_copied'/);
  assert.match(server, /prompt_copied_at/);
  assert.match(server, /source:\s*parentTask \? 'task_agent_mode_dropoff' : 'agent_review_hub'/);
  assert.match(server, /agentModeTaskResultLink/);
  assert.match(server, /ensureAgentModeRepairTask/);
  assert.match(server, /repair_task_id/);
  assert.match(server, /task_agent_mode_review/);
  assert.match(server, /ON CONFLICT \(idempotency_key\) DO UPDATE/);
});

test('drop-off page supports task-specific fields for mobile Agent Mode save', () => {
  [
    'id="taskId"',
    'name="task_id"',
    'id="lastCompletedRoleContext"',
    'name="last_completed_role_context"',
    'id="suggestedCorrection"',
    'name="suggested_correction"',
    'state.prompt?.copy_metadata?.task_id',
  ].forEach((needle) => assert.match(dropoff, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('route and action registries cover Task/Decision Agent Mode workflow', () => {
  const actions = new Set(actionRegistry.actions.map((item) => item.action_id));
  [
    'ACTION-TASK-AGENT-MODE-PANEL',
    'ACTION-TASK-AGENT-MODE-COPY-PROMPT',
    'ACTION-TASK-AGENT-MODE-OPEN-START',
    'ACTION-TASK-AGENT-MODE-OPEN-DROPOFF',
    'ACTION-TASK-AGENT-MODE-SAVE-DROPOFF',
    'ACTION-TASK-AGENT-MODE-VIEW-RESULT',
    'ACTION-TASK-AGENT-MODE-OPEN-REPAIR',
  ].forEach((action) => assert.ok(actions.has(action), action));

  const routes = new Set(routeRegistry.routes.map((item) => item.route));
  assert.ok(routes.has('/api/bna/tasks/:id/agent-mode/copy-prompt'));
});

test('Operations and drop-off inline scripts parse after Task/Decision Agent Mode additions', () => {
  for (const [label, html] of [['operations', operations], ['dropoff', dropoff]]) {
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => match[1].trim())
      .filter(Boolean);
    assert.ok(scripts.length >= 1, `${label} should have inline scripts`);
    scripts.forEach((script, index) => {
      assert.doesNotThrow(() => new vm.Script(script), `${label} inline script ${index + 1} should parse`);
    });
  }
});
