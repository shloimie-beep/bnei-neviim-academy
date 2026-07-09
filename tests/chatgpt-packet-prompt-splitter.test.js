const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

async function loadSplitter() {
  return import(pathToFileURL(path.join(process.cwd(), 'scripts', 'chatgpt-packet-prompt-splitter.mjs')).href);
}

test('ChatGPT packet prompt splitter creates five lane-scoped prompts', async () => {
  const splitter = await loadSplitter();
  const pkg = splitter.buildPackage({
    rawText: 'Fix the app, split the work, and do not duplicate active lanes.',
    title: 'Multi window smoke',
    parentRawId: 'RAW-20260709-003',
    workspace: 'bna_platform',
    project: 'agent_workflow',
    promptCount: 5,
    batchId: '20260709-multi-window-smoke',
  });

  assert.equal(pkg.manifest.prompt_count, 5);
  assert.equal(pkg.prompts.length, 5);
  assert.match(pkg.prompts[0].content, /Do not solve the whole parent ramble/);
  assert.match(pkg.prompts[0].content, /ops\/chatgpt-ramble-dropoff\/CONTROL-TOWER\.md/);
  assert.match(pkg.prompts[4].content, /Verifier Synthesis And Closeout/);
  assert.equal(new Set(pkg.manifest.prompts.map((prompt) => prompt.lane_key)).size, 5);
});

test('ChatGPT packet prompt splitter package script and docs are wired', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const readme = fs.readFileSync('ops/chatgpt-ramble-dropoff/README.md', 'utf8');
  const startHere = fs.readFileSync('ops/chatgpt-ramble-dropoff/CHATGPT-START-HERE.md', 'utf8');
  const agents = fs.readFileSync('AGENTS.md', 'utf8');

  assert.equal(packageJson.scripts['chatgpt:packet-prompts'], 'node scripts/chatgpt-packet-prompt-splitter.mjs --write');
  assert.match(readme, /chatgpt:packet-prompts/);
  assert.match(startHere, /outgoing\/<batch-id>\/prompts/);
  assert.match(agents, /generate child prompts/);
});
