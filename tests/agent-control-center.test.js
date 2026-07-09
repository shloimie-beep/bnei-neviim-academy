const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  createAgentControlSQL,
  renderAgentRunPrompt,
  validateSealPayload,
  canTransitionAgentRun,
} = require('../src/lib/bna/agent-control');

const server = fs.readFileSync('server.js', 'utf8');
const operations = fs.readFileSync('public/operations.html', 'utf8');
const actionRegistry = JSON.parse(fs.readFileSync('ops/action-registry.json', 'utf8'));

function operationsInlineScript() {
  const match = operations.match(/<script>\r?\n\s*\/\/ API Client/);
  const start = match ? match.index : -1;
  assert.ok(start > -1, 'Operations app script start should be present');
  const scriptStart = operations.indexOf('>', start) + 1;
  const end = operations.indexOf('</script>', scriptStart);
  assert.ok(end > scriptStart, 'Operations app script end should be present');
  return operations.slice(scriptStart, end);
}

test('Agent Control Center schema and seed SQL are registered', () => {
  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_profiles/);
  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_prompt_templates/);
  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_runs/);
  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_run_events/);
  assert.match(createAgentControlSQL, /CREATE TABLE IF NOT EXISTS bna_agent_run_artifacts/);
  assert.match(createAgentControlSQL, /ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS implementation_status/);
  assert.match(createAgentControlSQL, /ALTER TABLE bna_tasks ADD COLUMN IF NOT EXISTS verification_status/);
  assert.match(createAgentControlSQL, /browser_qa_agent_mode/);
  assert.match(server, /await pool\.query\(createAgentControlSQL\)/);
});

test('Agent prompt and seal validation enforce closed-loop verification evidence', () => {
  const prompt = renderAgentRunPrompt({
    run: {
      run_key: 'run_test',
      target_url: 'http://localhost:3000/operations?view=tasks&task=42',
      acceptance_criteria: ['Route loads', 'No private data leak'],
      allowed_actions: ['read-only navigation'],
      forbidden_actions: ['publishing'],
    },
    task: { id: 42, title: 'Verify agent control center' },
    profile: { agent_type: 'browser_qa' },
    baseUrl: 'http://localhost:3000',
  });

  assert.match(prompt, /run_test/);
  assert.match(prompt, /Open the Agent Run URL/);
  assert.match(prompt, /Post progress after each major section/);
  assert.match(prompt, /Attach\/reference evidence/);
  assert.match(prompt, /Pass \/ fail \/ blocked rules/);
  assert.match(prompt, /Do not ask the operator whether to submit, seal, or report a blocked run/);
  assert.match(prompt, /Click Submit Result/);
  assert.match(prompt, /Click Seal Run/);
  assert.match(prompt, /Confirm the page shows a sealed\/completed status before ending/);
  assert.match(prompt, /Do not check automated gates unless real gate output is visible/);
  assert.match(prompt, /Do not finish only in chat/);

  assert.equal(canTransitionAgentRun('ready', 'claimed'), true);
  assert.equal(canTransitionAgentRun('submitted', 'sealed_pass'), true);
  assert.equal(canTransitionAgentRun('submitted', 'cancelled'), true);
  assert.equal(canTransitionAgentRun('sealed_pass', 'running'), false);

  assert.throws(() => validateSealPayload({
    run: { verification_mode: 'browser_agent', acceptance_criteria: [{ id: 'AC-1', label: 'Check UI' }], artifact_count: 0 },
    outcome: 'pass',
    summary: 'Passed',
    criterionResults: [{ id: 'AC-1', status: 'pass', note: 'Looks good' }],
  }), /requires at least one evidence reference/);

  assert.doesNotThrow(() => validateSealPayload({
    run: { verification_mode: 'browser_agent', acceptance_criteria: [{ id: 'AC-1', label: 'Check UI' }], artifact_count: 1 },
    outcome: 'pass',
    summary: 'Passed',
    criterionResults: [{ id: 'AC-1', status: 'pass', note: 'Screenshot attached' }],
  }));
});

test('Agent run APIs are Super Admin Operations routes with lifecycle endpoints', () => {
  assert.match(server, /app\.get\('\/api\/bna\/agent-profiles', requireAdmin/);
  assert.match(server, /app\.get\('\/api\/bna\/agent-runs', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/tasks\/:taskId\/verification-plan', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/tasks\/:taskId\/agent-runs', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-runs\/:runKey\/submit', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-runs\/:runKey\/seal', requireAdmin/);
  assert.match(server, /app\.post\('\/api\/bna\/agent-runs\/:runKey\/cancel', requireAdmin/);
  assert.match(server, /if \(req\.opsIdentity\?\.scope\?\.type !== 'all'\) return res\.status\(403\)\.json\(\{ error: 'Agent runs are Super Admin only\.' \}\)/);
  assert.match(server, /eventType = String\(req\.body\?\.event_type/);
  assert.match(server, /passiveEvent = \['copied', 'opened', 'viewed'\]\.includes\(eventType\)/);
  assert.match(server, /'agent_run_ready'/);
  assert.match(server, /'agent_run_blocked'/);
  assert.match(server, /'agent_run_needs_operator'/);
  assert.match(server, /createAgentRunNotification/);
});

test('Operations UI exposes Agents module, task launch panel, run portal, and valid script syntax', () => {
  assert.doesNotThrow(() => new Function(operationsInlineScript()));
  assert.match(operations, /\{ id: 'agents', label: 'Agents', marker: 'AG' \}/);
  assert.match(operations, /case 'agents': content = renderAgents\(\); break;/);
  assert.match(operations, /function renderTaskAgentVerificationPanel/);
  assert.match(operations, /function renderAgentRunPortal/);
  assert.match(operations, /copyAgentPrompt/);
  assert.match(operations, /openChatGptAgent/);
  assert.match(operations, /submitAgentRunResult/);
  assert.match(operations, /cancelAgentRunAction/);
  assert.match(operations, /eventType\.includes\('agent_run'\)/);
  assert.match(operations, /openCommandTarget\('agents'\)/);
  assert.match(operations, /\/operations\/agents\/runs\/\$\{encodeURIComponent\(agentRunDeepKey\)\}/);
});

test('Agent Control Center visible actions are registered', () => {
  const ids = new Set(actionRegistry.actions.map(action => action.action_id));
  assert.ok(ids.has('ACTION-AGENT-RUN-PREPARE'));
  assert.ok(ids.has('ACTION-AGENT-RUN-HANDOFF'));
  assert.ok(ids.has('ACTION-AGENT-RUN-PROGRESS-EVIDENCE'));
  assert.ok(ids.has('ACTION-AGENT-RUN-SUBMIT-SEAL'));
  assert.ok(ids.has('ACTION-AGENT-RUN-BLOCK-RESUME-CANCEL'));
});
