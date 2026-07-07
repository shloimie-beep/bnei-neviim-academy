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
