const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const promptPath = path.join(root, 'ops', 'agent-control', '2026-06-19-manual-agent-mode-smoke.md');

test('manual Agent Mode smoke prompt is copy-ready and safe', () => {
  const prompt = fs.readFileSync(promptPath, 'utf8');

  assert.match(prompt, /run_agent_control_smoke/);
  assert.match(prompt, /REQ-20260618-112/);
  assert.match(prompt, /REQ-20260618-123/);
  assert.match(prompt, /REQ-20260619-206/);
  assert.match(prompt, /Operations Agents list/);
  assert.match(prompt, /Agent Run portal/);
  assert.match(prompt, /Start\/Claim Run/);
  assert.match(prompt, /progress update/);
  assert.match(prompt, /evidence reference/);
  assert.match(prompt, /exactly one linked\s+operator Decision/);
  assert.match(prompt, /Seal Run/);
  assert.match(prompt, /Do not deploy/);
  assert.match(prompt, /Do not mutate production data/);
  assert.match(prompt, /Do not use live credentials or paste secrets/);
  assert.match(prompt, /Do not start a broad UI crawl, watch loop, or agent-fleet loop/);
  assert.match(prompt, /BLOCKED - local Agent Run route unavailable/);
  assert.doesNotMatch(prompt, /sk-[A-Za-z0-9]|ghp_[A-Za-z0-9]|xox[baprs]-|AIza[0-9A-Za-z_-]/);
});
