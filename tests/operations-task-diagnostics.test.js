const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Main Operations task UI hides stale worker and proof diagnostic concepts', () => {
  const operations = read('public/operations.html');

  for (const forbidden of [
    /Queue Health/i,
    /Track Agent Work/i,
    /Handoff Files/i,
    /Do Not Restart/i,
    /proof[- ]gap/i,
    /worker diagnostics/i,
    /Changelog Queue Visibility/i,
    /Agent queue status/i,
    /Queued Agent Work/i,
    /No heartbeat recorded/i,
    /fresh heartbeat/i,
    /\.agent-status-panel/,
  ]) {
    assert.doesNotMatch(operations, forbidden);
  }
});

test('Tasks still keep a Changelog lane without worker diagnostics', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /\{ id: 'changelog', label: 'Changelog' \}/);
  assert.match(operations, /Implementation activity lives in Changelog/);
  assert.match(operations, /renderMetricButton\('Changelog', state\.changelogCount, 'Implementation activity and completed updates\.'/);
  assert.match(operations, /renderTaskOverviewButton\('changelog', 'Changelog', state\.changelogCount, 'Activity trail'\)/);
  assert.doesNotMatch(operations, /codexQueueCount|codexPending|codexInProgress/);
});
