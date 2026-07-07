const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const promptDir = path.join(root, 'ops', 'prompt-packets', '2026-07-07-onetime-ui-consistency-view-as-agent-audit');
const manifest = JSON.parse(fs.readFileSync(path.join(promptDir, 'agent-mode-prompt-series.json'), 'utf8'));

test('One Time Agent Mode prompt series uses Operations drop-off as primary handoff', () => {
  assert.equal(manifest.status, 'ready_for_parallel_agent_mode_operations_dropoff');
  assert.equal(manifest.dropoff_contract.primary, 'operations_task_agent_review_dropoff');
  assert.equal(manifest.dropoff_contract.success_marker, 'OPERATIONS_DROPOFF_SAVED: AGR-...');
  assert.match(fs.readFileSync(path.join(promptDir, manifest.dropoff_contract.contract_file), 'utf8'), /Primary handoff is BNA Operations Agent Review drop-off/);
});

test('One Time Agent Mode prompt series has a navigation-first template', () => {
  const template = fs.readFileSync(path.join(promptDir, manifest.dropoff_contract.navigation_template_file), 'utf8');
  [
    'Open `https://bneineviimacademy.org/operations`',
    '`Open Rabbi Provider Portal`',
    '`Student View`',
    '`Classroom`',
    'save a `BLOCKED` or `FAIL` drop-off result',
    'Chat-only output is the last resort',
  ].forEach((needle) => assert.match(template, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))));
});

test('parallel One Time prompt files avoid GitHub-only failure endings', () => {
  for (const prompt of manifest.prompts) {
    const text = fs.readFileSync(path.join(promptDir, prompt.file), 'utf8');
    assert.match(text, /Primary handoff is BNA Operations Agent Review drop-off, not GitHub/);
    assert.match(text, /OPERATIONS_DROPOFF_SAVED: AGR-\.\.\. <readback URL>/);
    assert.match(text, /OPERATIONS_DROPOFF_FAILED: <exact UI\/API\/connector error>/);
    assert.doesNotMatch(text, /CANNOT_WRITE_GITHUB/);
    assert.doesNotMatch(text, /DROP_OFF_CREATED/);
  }
});

test('view-as prompt files include exact Super Admin to Rabbi and student click paths', () => {
  for (const file of ['02-view-as-navigation-agent-mode.md', '03-role-perspective-screen-matrix-agent-mode.md']) {
    const text = fs.readFileSync(path.join(promptDir, file), 'utf8');
    [
      'Open https://bneineviimacademy.org/operations',
      'Find the workspace switcher',
      'Open Communications',
      'Rabbi / One Time',
      'Now Viewing: Rabbi / One Time Inbox',
      'Open Rabbi Provider Portal',
      'Student View',
      'Classroom',
      'If any step fails',
    ].forEach((needle) => assert.match(text, new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${file} missing ${needle}`));
  }
});
