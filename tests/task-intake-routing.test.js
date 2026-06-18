const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('Server task intake has high-confidence auto-file and low-confidence decision routing', () => {
  const server = read('server.js');

  assert.match(server, /function isLowConfidenceTaskIntake\(text\) \{/);
  assert.match(server, /function buildLowConfidenceIntakeDecision\(text\) \{/);
  assert.match(server, /title: 'Decide where to route captured intake'/);
  assert.match(server, /stage: 'decision_required'/);
  assert.match(server, /intake_confidence: 'low'/);
  assert.match(server, /route: 'decision'/);
  assert.match(server, /label: 'File as my task'/);
  assert.match(server, /label: 'Send to Codex'/);
  assert.match(server, /label: 'Archive'/);
  assert.match(server, /return isLowConfidenceTaskIntake\(text\) \? \[buildLowConfidenceIntakeDecision\(text\)\] : \[\];/);
  assert.match(server, /intake_confidence: 'high'/);
  assert.match(server, /route: 'auto_file'/);
});

test('Task creation paths persist routing metadata instead of creating a separate review queue', () => {
  const server = read('server.js');

  assert.match(server, /function taskCandidateAiParsed\(candidate, parser\) \{/);
  assert.match(server, /intake_confidence: candidate\.intake_confidence \|\| 'high'/);
  assert.match(server, /routing: candidate\.routing \|\| \{/);
  assert.match(server, /options: candidate\.options \|\| \[\]/);
  assert.match(server, /ai_parsed: taskCandidateAiParsed\(candidate, 'heuristic-v3'\)/);
  assert.match(server, /ai_parsed: taskCandidateAiParsed\(candidate, 'telegram-webhook-heuristic-v3'\)/);
  assert.doesNotMatch(server, /Review Queue|Intake Review/);
});

test('Operations Decisions honor routing option updates and do not expose a review queue lane', () => {
  const operations = read('public/operations.html');

  assert.match(operations, /updates: option\.updates && typeof option\.updates === 'object' \? option\.updates : null/);
  assert.match(operations, /const routedUpdates = option\.updates && typeof option\.updates === 'object' \? option\.updates : \{\};/);
  assert.match(operations, /\.\.\.routedUpdates/);
  assert.match(operations, /if \(updates\.stage === 'archived' && !updates\.archived_at\) updates\.archived_at = new Date\(\)\.toISOString\(\);/);
  assert.match(operations, /decisions: 'Decisions'/);
  assert.doesNotMatch(operations, /Review Queue|Intake Review/);
});
